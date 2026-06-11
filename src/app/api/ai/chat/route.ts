import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
import { buildSystemPrompt } from '@/lib/llm/masterPrompt';
import { inspectUserMessage } from '@/lib/security/guard';
import { safeParse, chatInput } from '@/lib/validation/schemas';
import type { Profile, Progress } from '@/types/db';

export const runtime = 'edge';

const GEMINI_PRIMARY = 'gemini-2.5-flash-lite';   // rapide et économe (vitesse prioritaire)
const GEMINI_FALLBACK = 'gemini-2.5-flash';        // repli si le modèle léger est indisponible

function geminiUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`;
}

async function callGemini(model: string, system: string, message: string, maxOutputTokens: number) {
  return fetch(geminiUrl(model), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: { maxOutputTokens },
    }),
  });
}

/** Chat IA streaming (MAD §5) : paywall vérifié serveur, profil+progress hydratés en parallèle,
 *  modèle léger d'abord (repli automatique), SSE relayé tel quel au client. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const sb = supabaseAdmin();
  // Profil + progression récupérés EN PARALLÈLE (gain de latence avant le premier token).
  const [{ data: profile }, { data: prog }] = await Promise.all([
    sb.from('profiles').select('*').eq('id', user.id).single(),
    sb.from('progress').select('*').eq('user_id', user.id),
  ]);
  if (!profile) return Response.json({ error: 'no_profile' }, { status: 403 });
  const p = profile as Profile;
  if (!p.is_paid) return Response.json({ error: 'paywall' }, { status: 402 });

  const raw = (await req.json().catch(() => null)) as unknown;
  const parsed = safeParse(chatInput, raw);
  if (!parsed.ok) return Response.json({ error: 'invalid_input', detail: parsed.error }, { status: 400 });
  const { message, focusSubject, pillar } = parsed.data;

  const verdict = inspectUserMessage(message);
  if (!verdict.ok) return Response.json({ error: 'blocked', reason: verdict.reason }, { status: 400 });

  const system = buildSystemPrompt(p, (prog as Progress[] | null) ?? [], focusSubject ?? null, pillar ?? null);
  const maxOut = p.bougie ? 384 : 1024; // réduit pour la vitesse (réponses orales + écrites concises)

  let upstream = await callGemini(GEMINI_PRIMARY, system, message, maxOut);
  if (!upstream.ok || !upstream.body) {
    // Repli transparent sur le modèle standard si le modèle léger répond mal/indispo.
    upstream = await callGemini(GEMINI_FALLBACK, system, message, maxOut);
  }
  if (!upstream.ok || !upstream.body) return Response.json({ error: 'llm_unavailable' }, { status: 502 });

  return new Response(upstream.body, {
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' },
  });
}

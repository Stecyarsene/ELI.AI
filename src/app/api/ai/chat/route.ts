import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
import { buildSystemPrompt } from '@/lib/llm/masterPrompt';
import { inspectUserMessage } from '@/lib/security/guard';
import { safeParse, chatInput } from '@/lib/validation/schemas';
import type { Profile, Progress } from '@/types/db';

export const runtime = 'nodejs';

/** Chat IA streaming (MAD §5) : paywall vérifié serveur, profil hydraté à l'instant T, SSE relayé. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const sb = supabaseAdmin();
  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) return Response.json({ error: 'no_profile' }, { status: 403 });
  const p = profile as Profile;
  if (!p.is_paid) return Response.json({ error: 'paywall' }, { status: 402 });

  const { data: prog } = await sb.from('progress').select('*').eq('user_id', user.id);
  const body = (await req.json().catch(() => null)) as { message?: string; focusSubject?: string } | null;
  if (!body?.message || body.message.length > 4000) return Response.json({ error: 'invalid_input' }, { status: 400 });

  const verdict = inspectUserMessage(body.message);
  if (!verdict.ok) return Response.json({ error: 'blocked', reason: verdict.reason }, { status: 400 });

  const system = buildSystemPrompt(p, (prog as Progress[] | null) ?? [], body.focusSubject ?? null);
  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: body.message }] }],
        generationConfig: { maxOutputTokens: p.bougie ? 512 : 2048 },
      }),
    }
  );
  if (!upstream.ok || !upstream.body) return Response.json({ error: 'llm_unavailable' }, { status: 502 });
  return new Response(upstream.body, {
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' },
  });
}

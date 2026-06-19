import { userFromRequest } from '@/lib/supabase/server';
import { checkLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = 'gemini-2.5-flash'; // multimodal : transcription audio

/**
 * POST /api/ai/transcribe {audioBase64, mime}
 * Transcrit un message vocal en français. Optimisé pour la diction des jeunes enfants (4-6 ans) :
 * le modèle restitue l'INTENTION en français correct, même si l'articulation est imparfaite,
 * sans rien inventer ni ajouter. Renvoie {text}. Aucune donnée n'est stockée.
 */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  // P0 — anti-abus de coût par utilisateur (fail-OPEN).
  const rl = await checkLimit('ai', `transcribe:${user.id}`);
  if (!rl.ok) return Response.json({ error: 'rate_limited', retryAfter: rl.retryAfter ?? 30 }, { status: 429, headers: { 'retry-after': String(rl.retryAfter ?? 30) } });
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: 'no_key' }, { status: 500 });

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || typeof b.audioBase64 !== 'string') return Response.json({ error: 'invalid_input' }, { status: 400 });
  const mime = String(b.mime || 'audio/webm');
  const data = String(b.audioBase64).replace(/^data:[^,]+,/, '');
  if (!data) return Response.json({ error: 'empty_audio' }, { status: 400 });

  const prompt =
    "Transcris fidèlement, EN FRANÇAIS, ce que dit la personne dans cet audio. " +
    "C'est probablement un enfant (4 à 6 ans) qui articule mal : restitue son INTENTION en français correct et naturel, " +
    "sans rien inventer, sans rien ajouter, sans commentaire. Si l'audio est inaudible ou vide, réponds par une chaîne vide. " +
    'Réponds STRICTEMENT en JSON : {"text":"<transcription>"}.';

  let r: globalThis.Response;
  try {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: mime, data } }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 256, thinkingConfig: { thinkingBudget: 0 }, responseMimeType: 'application/json' },
      }),
    });
  } catch {
    return Response.json({ error: 'ai_unreachable' }, { status: 502 });
  }
  if (!r.ok) return Response.json({ error: 'ai_error' }, { status: 502 });

  const j = (await r.json().catch(() => null)) as { candidates?: { content?: { parts?: { text?: string }[] } }[] } | null;
  const raw = (j?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
  let text = '';
  try { text = String((JSON.parse(raw) as { text?: string }).text || ''); }
  catch { text = raw.replace(/^[`{]+|[`}]+$/g, '').trim(); }
  return Response.json({ ok: true, text: text.slice(0, 1000) });
}

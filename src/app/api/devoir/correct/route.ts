import { userFromRequest } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = 'gemini-2.5-flash'; // multimodal (lecture de la copie photographiée)

/** POST /api/devoir/correct {devoir, imageBase64, mime}
 *  Corrige la copie photographiée de l'élève par rapport à l'énoncé, et renvoie un JSON
 *  {reussites[], ameliorer[], zonesRouges[], corrige}. Aucune donnée n'est stockée. */
export async function POST(req: Request): Promise<Response> {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: 'no_key' }, { status: 500 });

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || typeof b.imageBase64 !== 'string') return Response.json({ error: 'invalid_input' }, { status: 400 });

  const mime = String(b.mime || 'image/jpeg');
  const data = String(b.imageBase64).replace(/^data:[^,]+,/, ''); // retire le préfixe data: si présent
  if (!data) return Response.json({ error: 'empty_image' }, { status: 400 });
  const ctx = JSON.stringify(b.devoir && typeof b.devoir === 'object' ? b.devoir : {}).slice(0, 4000);

  const prompt =
    "Tu es Éli, professeur particulier bienveillant et exigeant (programmes National gabonais et AEFE). " +
    "Voici l'énoncé du devoir (JSON) : " + ctx + ". L'image jointe est la copie manuscrite de l'élève. " +
    "Corrige-la avec soin, dans le respect du programme. Réponds STRICTEMENT en JSON, sans markdown ni texte hors JSON, " +
    'au format {"reussites":["..."],"ameliorer":["..."],"zonesRouges":["..."],"corrige":"..."}. ' +
    'En français. "reussites" = ce qui est juste et bien fait ; "ameliorer" = points perfectibles ; ' +
    '"zonesRouges" = erreurs importantes à corriger en priorité ; "corrige" = le corrigé clair, complet et explicite, expliqué pas à pas.';

  let r: globalThis.Response;
  try {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: mime, data } }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 }, responseMimeType: 'application/json' },
      }),
    });
  } catch {
    return Response.json({ error: 'ai_unreachable' }, { status: 502 });
  }
  if (!r.ok) return Response.json({ error: 'ai_error' }, { status: 502 });

  const j = (await r.json().catch(() => null)) as { candidates?: { content?: { parts?: { text?: string }[] } }[] } | null;
  const txt = (j?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim();
  let out: { reussites: string[]; ameliorer: string[]; zonesRouges: string[]; corrige: string };
  try {
    const parsed = JSON.parse(txt) as Partial<typeof out>;
    out = {
      reussites: Array.isArray(parsed.reussites) ? parsed.reussites.map(String) : [],
      ameliorer: Array.isArray(parsed.ameliorer) ? parsed.ameliorer.map(String) : [],
      zonesRouges: Array.isArray(parsed.zonesRouges) ? parsed.zonesRouges.map(String) : [],
      corrige: String(parsed.corrige || ''),
    };
  } catch {
    out = { reussites: [], ameliorer: [], zonesRouges: [], corrige: txt.slice(0, 4000) };
  }
  return Response.json(out);
}

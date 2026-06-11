import { inspectUserMessage } from '@/lib/security/guard';

export const runtime = 'nodejs';

/** Essai GRATUIT visiteur (non connecté) : réponse Éli adaptée au pilier/matière, voix-d'abord.
 *  Le comptage des essais (2 max) est géré côté client ; ici on sécurise et on limite la longueur.
 *  Aucune donnée personnelle, aucun accès base : porte d'entrée pour découvrir Éli avant inscription. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { message?: string; focusSubject?: string; program?: string } | null;
  if (!body?.message || body.message.length > 1000) {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  const verdict = inspectUserMessage(body.message);
  if (!verdict.ok) return Response.json({ error: 'blocked', reason: verdict.reason }, { status: 400 });

  const program = body.program === 'aefe' ? 'AEFE (programme français)' : 'National (Gabon)';
  const subject = body.focusSubject ? `La matière est : ${body.focusSubject}.` : '';

  const system = [
    "Tu es Éli, professeur particulier chaleureux et encourageant pour des élèves du programme " + program + ".",
    subject,
    "C'est un ESSAI GRATUIT de découverte : réponds de façon utile, vivante et pédagogique, en français, adaptée à un élève.",
    "Méthode socratique douce : tu peux donner un vrai début d'explication ET poser une question pour faire réfléchir.",
    "Reste bref (réponse de découverte). Ne réponds jamais « je ne sais pas » à une question de cours : utilise tes connaissances.",
    "FORMAT VOIX-D'ABORD : commence TOUJOURS par une courte réplique orale entre balises [VOIX]...[/VOIX] (1 à 2 phrases, ton parlé),",
    "puis donne le développement écrit en dessous. À la fin, invite gentiment l'élève à s'inscrire pour continuer avec toi. 🌱",
  ].filter(Boolean).join('\n');

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: body.message }] }],
        generationConfig: { maxOutputTokens: 700 },
      }),
    }
  );
  if (!upstream.ok || !upstream.body) return Response.json({ error: 'llm_unavailable' }, { status: 502 });
  return new Response(upstream.body, {
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' },
  });
}

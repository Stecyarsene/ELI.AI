import { supabaseAdmin } from '@/lib/supabase/server';
import { requireRole } from '@/lib/roles';
import { buildTeacherPrompt, type TeacherKind } from '@/lib/llm/teacherPrompt';
import { inspectUserMessage } from '@/lib/security/guard';
import { safeParse, teacherInput } from '@/lib/validation/schemas';
import type { CurriculumPayload, Program } from '@/types/db';

export const runtime = 'edge';

const GEMINI_PRIMARY = 'gemini-2.5-flash';        // qualité prioritaire pour la génération enseignant
const GEMINI_FALLBACK = 'gemini-2.5-flash-lite';  // repli si indisponible

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

/** Extrait les chapitres officiels d'une matière depuis le payload curriculum (gère les 2 formes). */
function chaptersFor(curriculum: CurriculumPayload | null, subject: string | null, serie: string | null): string[] | null {
  if (!curriculum || !subject) return null;
  const bySerie = curriculum.by_serie;
  if (bySerie && serie && /math/i.test(subject)) {
    const hit = bySerie[serie];
    if (hit && Array.isArray(hit.chapters) && hit.chapters.length) return hit.chapters.filter(Boolean);
  }
  const subs = curriculum.subjects;
  if (!subs) return null;
  if (Array.isArray(subs)) {
    const hit = subs.find((s) => s.name && s.name.toLowerCase() === subject.toLowerCase());
    return hit && hit.chapters ? hit.chapters.map((c) => c.title || '').filter(Boolean) : null;
  }
  const rec = (subs as Record<string, { chapters?: string[] }>)[subject];
  return rec && rec.chapters && rec.chapters.length ? rec.chapters : null;
}

/**
 * Assistant IA ENSEIGNANT (espace prof) : réservé aux rôles enseignants (requireRole),
 * génère du matériel pédagogique ancré sur le curriculum officiel, en streaming SSE
 * (même canal que le chat élève, relayé tel quel au client).
 */
export async function POST(req: Request) {
  const gate = await requireRole(req, ['teacher', 'school_admin', 'super_admin']);
  if ('error' in gate) return gate.error;

  const raw = (await req.json().catch(() => null)) as unknown;
  const parsed = safeParse(teacherInput, raw);
  if (!parsed.ok) return Response.json({ error: 'invalid_input', detail: parsed.error }, { status: 400 });
  const { program, classKey, serie, subject, notion, kind, message } = parsed.data;

  const verdict = inspectUserMessage(message ?? `${kind} ${subject ?? ''} ${notion ?? ''}`);
  if (!verdict.ok) return Response.json({ error: 'blocked', reason: verdict.reason }, { status: 400 });

  // Curriculum officiel de la classe (lecture publique) pour ancrer la génération.
  const { data: cur } = await supabaseAdmin()
    .from('curriculum')
    .select('payload')
    .eq('program', program)
    .eq('class_key', classKey)
    .limit(1)
    .maybeSingle();
  const curriculum = (cur?.payload as CurriculumPayload | undefined) ?? null;
  const chapters = chaptersFor(curriculum, subject ?? null, serie ?? null);

  const system = buildTeacherPrompt({
    program: program as Program,
    classKey,
    serie: serie ?? null,
    subject: subject ?? null,
    notion: notion ?? null,
    kind: kind as TeacherKind,
    chapters,
  });
  const userMsg =
    message && message.trim()
      ? message
      : `Génère le matériel demandé pour la matière « ${subject ?? ''} »${notion ? `, notion « ${notion} »` : ''}.`;

  let upstream = await callGemini(GEMINI_PRIMARY, system, userMsg, 2048);
  if (!upstream.ok || !upstream.body) upstream = await callGemini(GEMINI_FALLBACK, system, userMsg, 2048);
  if (!upstream.ok || !upstream.body) return Response.json({ error: 'llm_unavailable' }, { status: 502 });

  return new Response(upstream.body, {
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' },
  });
}

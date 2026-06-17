import { supabaseAdmin } from '@/lib/supabase/server';
import { requireRole } from '@/lib/roles';
import { buildTeacherPrompt, type TeacherKind } from '@/lib/llm/teacherPrompt';
import { inspectUserMessage } from '@/lib/security/guard';
import { safeParse, teacherInput } from '@/lib/validation/schemas';
import { teacherAccessDecision, TEACHER_TRIAL_MAX } from '@/lib/teacher/gating';
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
      // thinkingBudget: 0 désactive le raisonnement interne de Gemini 2.5 (qui, par défaut,
      // consomme le budget de tokens et tronquait/vidait la réponse) -> génération complète ET rapide.
      generationConfig: { maxOutputTokens, temperature: 0.6, thinkingConfig: { thinkingBudget: 0 } },
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

  // ── Gating premium (T3 §d) : 2 essais gratuits puis abonnement (tarif élève). ──
  const sbAdmin = supabaseAdmin();
  const { data: tp } = await sbAdmin
    .from('teacher_profiles').select('is_paid, paid_until, trial_count').eq('user_id', gate.user.id).maybeSingle();
  const decision = teacherAccessDecision(gate.roles, tp ?? null);
  if (!decision.allow) {
    const { data: plans } = await sbAdmin
      .from('plans').select('id, label, amount_fcfa, duration_days').eq('program', program).order('amount_fcfa');
    return Response.json(
      { error: 'paywall', trialsUsed: decision.trialsUsed, max: TEACHER_TRIAL_MAX, plans: plans ?? [] },
      { status: 402 },
    );
  }
  if (decision.consumeTrial) {
    const used = Number(tp?.trial_count ?? 0);
    await sbAdmin.from('teacher_profiles').update({ trial_count: used + 1 }).eq('user_id', gate.user.id);
  }

  // Curriculum officiel de la classe (lecture publique) pour ancrer la génération.
  const { data: cur } = await sbAdmin
    .from('curriculum')
    .select('payload')
    .eq('program', program)
    .eq('class_key', classKey)
    .limit(1)
    .maybeSingle();
  const curriculum = (cur?.payload as CurriculumPayload | undefined) ?? null;
  const chapters = chaptersFor(curriculum, subject ?? null, serie ?? null);

  const { data: teacherProf } = await sbAdmin.from('profiles').select('first_name').eq('id', gate.user.id).maybeSingle();

  const system = buildTeacherPrompt({
    program: program as Program,
    classKey,
    serie: serie ?? null,
    subject: subject ?? null,
    notion: notion ?? null,
    kind: kind as TeacherKind,
    chapters,
    firstName: (teacherProf?.first_name as string | null) ?? null,
  });
  const userMsg =
    message && message.trim()
      ? message
      : `Génère le matériel demandé pour la matière « ${subject ?? ''} »${notion ? `, notion « ${notion} »` : ''}.`;

  // 8192 tokens : matériel pédagogique complet (fiche, contrôle + corrigé, diapos) sans troncature.
  let upstream = await callGemini(GEMINI_PRIMARY, system, userMsg, 8192);
  if (!upstream.ok || !upstream.body) upstream = await callGemini(GEMINI_FALLBACK, system, userMsg, 8192);
  if (!upstream.ok || !upstream.body) return Response.json({ error: 'llm_unavailable' }, { status: 502 });

  return new Response(upstream.body, {
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' },
  });
}

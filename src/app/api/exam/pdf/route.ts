import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
import { safeParse, examPdfInput } from '@/lib/validation/schemas';
import { buildExamPdf } from '@/lib/pdf/sessionPdf';
import type { Fiche, Progress } from '@/types/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function slug(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 40) || 'doc';
}

/** Aplatit le body jsonb d'une fiche en sections lisibles, quelle que soit sa forme. */
function flattenBody(body: unknown): { heading: string; items: string[] }[] {
  const out: { heading: string; items: string[] }[] = [];
  if (!body || typeof body !== 'object') return out;
  const b = body as Record<string, unknown>;
  if (Array.isArray(b.sections)) {
    for (const s of b.sections as Record<string, unknown>[]) {
      const items = (s.items || s.points || []) as unknown[];
      out.push({ heading: String(s.heading || s.title || 'Section'), items: items.map((x) => String(x)) });
    }
    return out;
  }
  for (const k of Object.keys(b)) {
    const v = b[k];
    if (Array.isArray(v) && v.length) out.push({ heading: k, items: v.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))) });
    else if (typeof v === 'string' && v) out.push({ heading: k, items: [v] });
  }
  return out;
}

/** POST /api/exam/pdf {exam, subject} — génère la fiche PDF d'une épreuve depuis fiches(kind=examen),
 *  sinon des axes de révision déduits de la progression. Stocke dans le bucket privé `documents`. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const raw = (await req.json().catch(() => null)) as unknown;
  const parsed = safeParse(examPdfInput, raw);
  if (!parsed.ok) return Response.json({ error: 'invalid_input', detail: parsed.error }, { status: 400 });
  const { exam, subject } = parsed.data;
  const sb = supabaseAdmin();

  const { data: frows } = await sb.from('fiches').select('*')
    .eq('user_id', user.id).eq('subject', subject).eq('kind', 'examen')
    .order('created_at', { ascending: false }).limit(1);
  const fiche = (frows as Fiche[] | null)?.[0];

  let intro: string; let sections: { heading: string; items: string[] }[] = [];
  let hasFiche = false;
  if (fiche) {
    hasFiche = true;
    sections = flattenBody(fiche.body);
    intro = `D'après ta fiche d'examen « ${fiche.title || subject} ».`;
    if (!sections.length) sections = [{ heading: 'À retravailler', items: ['Ouvre cette épreuve avec Éli pour enrichir ta fiche.'] }];
  } else {
    const { data: prows } = await sb.from('progress').select('*').eq('user_id', user.id).eq('subject', subject).limit(1);
    const p = (prows as Progress[] | null)?.[0];
    intro = "Tu n'as pas encore de fiche d'examen sur cette épreuve — voici tes axes de révision d'après ta progression. Travaille-les avec Éli pour bâtir ta fiche.";
    if (p) {
      if (p.red_zones?.length) sections.push({ heading: '🔴 Priorité absolue (zones rouges)', items: p.red_zones });
      if (p.improvements?.length) sections.push({ heading: '🟠 À renforcer', items: p.improvements });
      if (p.strengths?.length) sections.push({ heading: '🟢 Points acquis', items: p.strengths });
      if (p.last_chapter) sections.push({ heading: 'Dernier chapitre travaillé', items: [p.last_chapter] });
    }
    if (!sections.length) sections = [{ heading: 'Pour commencer', items: [`Lance une session ${subject} avec Éli : il bâtira ta fiche d'épreuve pas à pas.`] }];
  }

  let signedUrl: string | null = null;
  try {
    const bytes = await buildExamPdf({ examName: exam, subject, intro, sections });
    const path = `${user.id}/exams/${slug(exam)}-${slug(subject)}.pdf`;
    const up = await sb.storage.from('documents').upload(path, bytes, { contentType: 'application/pdf', upsert: true });
    if (!up.error) {
      const s = await sb.storage.from('documents').createSignedUrl(path, 3600);
      signedUrl = s.data?.signedUrl ?? null;
    }
  } catch { /* best-effort */ }

  return Response.json({ ok: true, hasFiche, signedUrl });
}

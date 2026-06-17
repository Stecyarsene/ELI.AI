import { supabaseAdmin } from '@/lib/supabase/server';
import type { CurriculumPayload } from '@/types/db';

export const runtime = 'edge';

/**
 * GET /api/curriculum?program=national|aefe
 * Renvoie le curriculum NORMALISÉ pour alimenter le sélecteur en cascade de l'espace
 * enseignant (classe -> série/filière -> matière -> notions). Lecture publique (référentiel
 * officiel). Tolérant aux deux formes de payload (tableau de matières ou enregistrement) et
 * aux données partielles : ce qui manque dégrade proprement côté client (saisie libre).
 */
type NormSubject = { name: string; notions: string[] };
type NormClass = { classKey: string; series: string[]; subjects: NormSubject[] };

function uniq(xs: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of xs) {
    const v = (x || '').trim();
    if (v && !seen.has(v)) { seen.add(v); out.push(v); }
  }
  return out;
}

/** Extrait les notions d'une matière : titres de chapitres + notions fines éventuelles. */
function subjectsFrom(payload: CurriculumPayload | null): NormSubject[] {
  if (!payload || !payload.subjects) return [];
  const subs = payload.subjects;
  if (Array.isArray(subs)) {
    return subs
      .filter((s) => s && s.name)
      .map((s) => {
        const notions: string[] = [];
        for (const ch of s.chapters ?? []) {
          if (ch?.title) notions.push(ch.title);
          for (const n of ch?.notions ?? []) if (n) notions.push(n);
        }
        return { name: s.name as string, notions: uniq(notions) };
      });
  }
  const rec = subs as Record<string, { chapters?: string[] }>;
  return Object.entries(rec).map(([name, v]) => ({ name, notions: uniq(v?.chapters ?? []) }));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const program = url.searchParams.get('program');
  if (program !== 'national' && program !== 'aefe') {
    return Response.json({ error: 'invalid_program' }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('curriculum')
    .select('class_key, payload')
    .eq('program', program);
  if (error) return Response.json({ error: 'curriculum_unavailable' }, { status: 502 });

  const classes: NormClass[] = (data ?? []).map((row) => {
    const payload = (row.payload as CurriculumPayload | null) ?? null;
    const series = payload?.by_serie ? Object.keys(payload.by_serie) : [];
    return { classKey: row.class_key as string, series, subjects: subjectsFrom(payload) };
  }).sort((a, b) => a.classKey.localeCompare(b.classKey));

  return Response.json(
    { program, classes },
    { headers: { 'cache-control': 'public, max-age=300, s-maxage=3600' } },
  );
}

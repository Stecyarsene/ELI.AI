/** T7 — Classes d'examen. Les épreuves portent une série pouvant être multiple
 *  ("A1,B"), commune ("ALL"), ou unique ("C"). Logique pure et testable. */

export const TERMINALE_SERIES = ['A1', 'A2', 'B', 'C', 'D', 'E'] as const;
export type Serie = (typeof TERMINALE_SERIES)[number];

export interface ExamPaperLike {
  serie: string | null;
  subject?: string | null;
  exam?: string | null;
  [k: string]: unknown;
}

/** Découpe un champ série ("A1, B") en jetons normalisés (majuscules, sans espaces). */
export function parseSeries(serie: string | null | undefined): string[] {
  return String(serie ?? '')
    .split(/[,/]/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

/** Une épreuve concerne-t-elle la série choisie ? ("ALL" concerne toutes les séries.) */
export function paperMatchesSerie(paperSerie: string | null | undefined, selected: string): boolean {
  const sel = String(selected ?? '').trim().toUpperCase();
  if (!sel) return false;
  const tokens = parseSeries(paperSerie);
  return tokens.includes('ALL') || tokens.includes(sel);
}

/** Filtre les épreuves pour une série donnée, triées par matière puis titre. */
export function filterPapersForSerie<T extends ExamPaperLike>(papers: readonly T[], selected: string): T[] {
  return papers
    .filter((p) => paperMatchesSerie(p.serie, selected))
    .slice()
    .sort((a, b) =>
      String(a.subject ?? '').localeCompare(String(b.subject ?? ''), 'fr') ||
      String((a as { title?: string }).title ?? '').localeCompare(String((b as { title?: string }).title ?? ''), 'fr'));
}

/** Liste des matières distinctes couvertes par un jeu d'épreuves (pour un sélecteur). */
export function subjectsOf(papers: readonly ExamPaperLike[]): string[] {
  const set = new Set<string>();
  for (const p of papers) if (p.subject) set.add(String(p.subject));
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
}

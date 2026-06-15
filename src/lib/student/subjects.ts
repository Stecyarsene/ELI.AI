/** T6 — Dashboard élève de retour : ne montrer QUE les matières travaillées. */

export interface ProgressLike {
  subject: string | null;
  status?: string | null;
  last_chapter?: string | null;
  updated_at?: string | null;
}

export interface WorkedSubject {
  subject: string;
  status: 'vert' | 'orange' | 'rouge' | 'neutre';
  lastChapter: string | null;
  updatedAt: string | null;
}

const STATUS = new Set(['vert', 'orange', 'rouge']);

/**
 * Réduit la progression brute aux matières réellement travaillées :
 * une entrée par matière (la plus récente), triée du plus récent au plus ancien.
 */
export function workedSubjects(progress: readonly ProgressLike[]): WorkedSubject[] {
  const bySubject = new Map<string, WorkedSubject>();
  for (const p of progress) {
    const subject = String(p.subject ?? '').trim();
    if (!subject) continue;
    const updatedAt = p.updated_at ?? null;
    const existing = bySubject.get(subject);
    if (existing && (existing.updatedAt ?? '') >= (updatedAt ?? '')) continue;
    bySubject.set(subject, {
      subject,
      status: STATUS.has(String(p.status)) ? (p.status as WorkedSubject['status']) : 'neutre',
      lastChapter: p.last_chapter ?? null,
      updatedAt,
    });
  }
  return Array.from(bySubject.values()).sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}

export function hasWorkedSubjects(progress: readonly ProgressLike[]): boolean {
  return workedSubjects(progress).length > 0;
}

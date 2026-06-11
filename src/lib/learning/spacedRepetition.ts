/** ÉLI — Répétition espacée (doc 9, pilier 3). Algorithme SM-2 simplifié, pur et testable. */
export interface SkillCard { skill: string; ease: number; intervalDays: number; reps: number; nextReview: number; }

export function newCard(skill: string, now: number): SkillCard {
  return { skill, ease: 2.5, intervalDays: 0, reps: 0, nextReview: now };
}

/** quality 0..5 (0=échec total, 5=parfait). Recalcule l'intervalle et la prochaine révision. */
export function review(card: SkillCard, quality: number, now: number): SkillCard {
  const q = Math.max(0, Math.min(5, quality));
  let { ease, intervalDays, reps } = card;
  if (q < 3) { reps = 0; intervalDays = 1; }                    // échec → revoir demain
  else {
    reps += 1;
    intervalDays = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(intervalDays * ease);
    ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  }
  return { skill: card.skill, ease, intervalDays, reps, nextReview: now + intervalDays * 86_400_000 };
}

/** Construit le prompt de quiz de rattrapage ciblé sur les lacunes (doc 9). */
export function buildRemediationPrompt(p: { program: string; country: string | null; exam: string; skill: string; fails: number; level?: string }): string {
  const ctx = p.program === 'national' ? `BAC ${p.exam} national (${p.country})` : `${p.exam} AEFE (programme français)`;
  return `L'élève prépare le ${ctx}. Il a échoué ${p.fails} fois sur « ${p.skill} ». `
    + `Génère UN exercice de niveau ${p.level ?? 'intermédiaire'} ciblé sur cette lacune précise, `
    + `avec une correction étape par étape et un indice progressif. Méthode socratique, pas la réponse d'emblée.`;
}

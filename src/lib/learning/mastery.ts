/** ÉLI — Intelligence Layer : moteur de maîtrise (skill graph + difficulté adaptative).
 *  Fonctions PURES et testables (aucun réseau, aucune dépendance) — comme gating.ts / spacedRepetition.ts.
 *  Adossé aux 2032 quiz réels et aux learning_events. Aucune sur-ingénierie : pas de Kafka/microservices. */

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type PedagogicalAction = 'EXPLAIN' | 'SIMPLIFY' | 'TEST' | 'CHALLENGE' | 'MOTIVATE';

export interface SkillState {
  concept: string;
  score: number;          // maîtrise 0..1
  attempts: number;       // nb de tentatives
  lastPracticeMs: number; // epoch ms de la dernière pratique
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Met à jour la maîtrise après une réponse.
 *  Bonne réponse difficile → plus gros gain ; échec sur facile → plus grosse perte.
 *  difficulty: 0 (facile) .. 1 (difficile). */
export function updateMastery(oldScore: number, correct: boolean, difficulty = 0.5): number {
  const s = clamp01(oldScore);
  const d = clamp01(difficulty);
  if (correct) {
    const gain = 0.12 * (0.6 + d);          // réussir plus dur rapporte plus
    return clamp01(s + gain * (1 - s));      // progression marginale décroissante
  }
  const loss = 0.18 * (1.2 - d);            // échouer sur facile coûte plus
  return clamp01(s - loss * s);
}

/** Courbe d'oubli : rétention 0..1 selon les jours écoulés. Une maîtrise forte s'oublie plus lentement. */
export function retentionScore(daysSince: number, mastery = 0.5): number {
  const days = Math.max(0, daysSince);
  const decay = 0.18 - 0.12 * clamp01(mastery); // mastery 1 → décroissance lente
  return Math.exp(-decay * days);
}

/** Maîtrise EFFECTIVE = maîtrise apprise pondérée par l'oubli (ce que l'élève sait VRAIMENT aujourd'hui). */
export function effectiveMastery(state: SkillState, nowMs: number): number {
  const days = (nowMs - state.lastPracticeMs) / 86_400_000;
  return clamp01(state.score * retentionScore(days, state.score));
}

/** Difficulté à proposer selon la maîtrise moyenne effective. */
export function adjustDifficulty(avgMastery: number): Difficulty {
  const m = clamp01(avgMastery);
  if (m > 0.8) return 'HARD';
  if (m > 0.5) return 'MEDIUM';
  return 'EASY';
}

/** Décision pédagogique (le « Pedagogical Decision Engine ») — règles simples, lisibles, testables. */
export function decideAction(input: {
  mastery: number; recentMistakes: number; motivation: number;
}): PedagogicalAction {
  const m = clamp01(input.mastery);
  if (input.motivation < 0.3) return 'MOTIVATE';
  if (input.recentMistakes >= 3) return 'SIMPLIFY';
  if (m < 0.4) return 'EXPLAIN';
  if (m > 0.8) return 'CHALLENGE';
  return 'TEST';
}

/** Score de motivation 0..1 (streak / réussite / échecs en série). */
export function motivationScore(p: { streak: number; successRate: number; failureStreak: number }): number {
  return clamp01(0.2 * p.streak + 0.5 * clamp01(p.successRate) - 0.3 * p.failureStreak);
}

/** Choisit le prochain concept à travailler : la plus faible maîtrise EFFECTIVE d'abord (priorité aux lacunes). */
export function nextConcept(states: SkillState[], nowMs: number): string | null {
  if (!states.length) return null;
  let best: { concept: string; eff: number } | null = null;
  for (const s of states) {
    const eff = effectiveMastery(s, nowMs);
    if (!best || eff < best.eff) best = { concept: s.concept, eff };
  }
  return best ? best.concept : null;
}

/** Nombre de questions de quiz recommandé selon la maîtrise (faible → on entraîne plus). */
export function recommendedQuizCount(mastery: number): number {
  const m = clamp01(mastery);
  if (m < 0.4) return 6;
  if (m < 0.8) return 4;
  return 3;
}

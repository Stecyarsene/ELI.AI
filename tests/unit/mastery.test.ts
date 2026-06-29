import { updateMastery, retentionScore, effectiveMastery, adjustDifficulty, decideAction, motivationScore, nextConcept, recommendedQuizCount } from '../../src/lib/learning/mastery';

const DAY = 86_400_000; const NOW = 1_700_000_000_000;

describe('Intelligence Layer — mastery engine', () => {
  it('bonne réponse augmente la maîtrise, échec la diminue', () => {
    expect(updateMastery(0.5, true, 0.5)).toBeGreaterThan(0.5);
    expect(updateMastery(0.5, false, 0.5)).toBeLessThan(0.5);
  });
  it('réussir difficile rapporte plus que réussir facile', () => {
    expect(updateMastery(0.5, true, 1)).toBeGreaterThan(updateMastery(0.5, true, 0));
  });
  it('reste borné dans [0,1]', () => {
    expect(updateMastery(1, true, 1)).toBeLessThanOrEqual(1);
    expect(updateMastery(0, false, 0)).toBeGreaterThanOrEqual(0);
  });
  it('rétention décroît avec le temps et une maîtrise forte décroît plus lentement', () => {
    expect(retentionScore(0)).toBeCloseTo(1, 5);
    expect(retentionScore(10)).toBeLessThan(retentionScore(1));
    expect(retentionScore(10, 0.9)).toBeGreaterThan(retentionScore(10, 0.1));
  });
  it('maîtrise effective = apprise pondérée par l’oubli', () => {
    const fresh = effectiveMastery({ concept: 'x', score: 0.8, attempts: 5, lastPracticeMs: NOW }, NOW);
    const old = effectiveMastery({ concept: 'x', score: 0.8, attempts: 5, lastPracticeMs: NOW - 30 * DAY }, NOW);
    expect(fresh).toBeGreaterThan(old);
  });
  it('difficulté adaptative', () => {
    expect(adjustDifficulty(0.9)).toBe('HARD');
    expect(adjustDifficulty(0.6)).toBe('MEDIUM');
    expect(adjustDifficulty(0.2)).toBe('EASY');
  });
  it('décision pédagogique suit les règles', () => {
    expect(decideAction({ mastery: 0.9, recentMistakes: 0, motivation: 0.8 })).toBe('CHALLENGE');
    expect(decideAction({ mastery: 0.2, recentMistakes: 0, motivation: 0.8 })).toBe('EXPLAIN');
    expect(decideAction({ mastery: 0.6, recentMistakes: 4, motivation: 0.8 })).toBe('SIMPLIFY');
    expect(decideAction({ mastery: 0.6, recentMistakes: 0, motivation: 0.1 })).toBe('MOTIVATE');
    expect(decideAction({ mastery: 0.6, recentMistakes: 0, motivation: 0.8 })).toBe('TEST');
  });
  it('motivation bornée', () => {
    expect(motivationScore({ streak: 0, successRate: 0, failureStreak: 5 })).toBe(0);
    expect(motivationScore({ streak: 10, successRate: 1, failureStreak: 0 })).toBe(1);
  });
  it('nextConcept choisit la plus faible maîtrise effective', () => {
    const c = nextConcept([
      { concept: 'fort', score: 0.9, attempts: 9, lastPracticeMs: NOW },
      { concept: 'faible', score: 0.2, attempts: 3, lastPracticeMs: NOW },
    ], NOW);
    expect(c).toBe('faible');
  });
  it('recommandation de quiz selon maîtrise', () => {
    expect(recommendedQuizCount(0.2)).toBe(6);
    expect(recommendedQuizCount(0.6)).toBe(4);
    expect(recommendedQuizCount(0.9)).toBe(3);
  });
});

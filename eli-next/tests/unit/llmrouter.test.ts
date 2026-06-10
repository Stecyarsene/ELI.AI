import { LLMRouter, type LLMProvider } from '../../src/lib/llm/router';
import { newCard, review, buildRemediationPrompt } from '../../src/lib/learning/spacedRepetition';

const ok = (name: string, text: string): LLMProvider => ({ name, call: async () => text });
const down = (name: string): LLMProvider => ({ name, call: async () => { throw new Error('500'); } });
const slow = (name: string): LLMProvider => ({ name, call: () => new Promise((r) => setTimeout(() => r('tard'), 9999)) });

describe('Doc 9 — Auto-audit : coupure du LLM primaire en pleine session', () => {
  it('primaire DOWN → bascule INVISIBLE sur le secours, réponse livrée', async () => {
    const router = new LLMRouter([down('gemini'), ok('openai', 'réponse de secours')]);
    const r = await router.generate('explique les dérivées', 'sys');
    expect(r.text).toBe('réponse de secours');
    expect(r.provider).toBe('openai');
    expect(r.failovers).toBe(1);
  });
  it('primaire en TIMEOUT → bascule sur le secours', async () => {
    const router = new LLMRouter([slow('gemini'), ok('groq', 'ok secours')], 200);
    const r = await router.generate('q', 's');
    expect(r.provider).toBe('groq');
  });
  it('tous les providers DOWN → erreur explicite (pas de réponse silencieuse fausse)', async () => {
    const router = new LLMRouter([down('a'), down('b')]);
    await expect(router.generate('q', 's')).rejects.toThrow(/Tous les LLM/);
  });
});

describe('Doc 9 — Répétition espacée (SM-2)', () => {
  it('échec (q<3) → revoir demain, reps remis à 0', () => {
    const c = review(newCard('dérivées', 0), 1, 0);
    expect(c.intervalDays).toBe(1);
    expect(c.reps).toBe(0);
  });
  it('réussites successives → intervalle croissant (mémorisation ancrée)', () => {
    let c = newCard('équations', 0);
    c = review(c, 5, 0); const i1 = c.intervalDays;
    c = review(c, 5, c.nextReview); const i2 = c.intervalDays;
    c = review(c, 5, c.nextReview); const i3 = c.intervalDays;
    expect(i1).toBeLessThanOrEqual(i2);
    expect(i3).toBeGreaterThan(i2);
  });
  it('prompt de rattrapage cible la lacune + le bon cursus', () => {
    const p = buildRemediationPrompt({ program: 'national', country: 'GA', exam: 'BAC', skill: 'dérivées des exponentielles', fails: 3 });
    expect(p).toContain('dérivées des exponentielles');
    expect(p).toContain('BAC');
    expect(p).toContain('étape par étape');
  });
});

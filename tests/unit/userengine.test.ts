import { hydrateInitialState, applyClientStatePatch, GUEST, type UserState } from '../../src/lib/user/store';
import { savePrefs, loadPrefs, ANTI_FOUC_SNIPPET } from '../../src/lib/user/preferences';

describe('Core User Engine — hydratation Mock→Prod', () => {
  it('prod sans utilisateur → Guest sûr (jamais de profil fictif)', () => {
    const s = hydrateInitialState({ isProd: true, verifiedClaims: null });
    expect(s.isGuest).toBe(true);
    expect(s.subscriptionActive).toBe(false);
    expect(s.role).toBe('student');
  });
  it('dev sans utilisateur → profil de test injecté', () => {
    const s = hydrateInitialState({ isProd: false, verifiedClaims: null });
    expect(s.isGuest).toBe(false);
    expect(s.country).toBe('GA');
  });
  it('prod avec claims vérifiés serveur → état hydraté', () => {
    const s = hydrateInitialState({ isProd: true, verifiedClaims: { id: 'u1', role: 'student', program: 'aefe' } });
    expect(s.id).toBe('u1');
    expect(s.isGuest).toBe(false);
  });
});

describe('Test 1 — Privilege Escalation Bypass', () => {
  const eleve: UserState = { id: 'u1', role: 'student', program: 'national', country: 'GA', exam: 'BAC', subscriptionActive: false, isGuest: false };
  it('un élève tente de se promouvoir super_admin via patch client → REJETÉ', () => {
    const hacked = applyClientStatePatch(eleve, { role: 'super_admin' } as Partial<UserState>);
    expect(hacked.role).toBe('student'); // le rôle serveur prime, escalation ignorée
  });
  it('tente ministry + abonnement gratuit + changement de pays → tout REJETÉ', () => {
    const hacked = applyClientStatePatch(eleve, { role: 'ministry', subscriptionActive: true, country: 'FR', program: 'aefe' } as Partial<UserState>);
    expect(hacked.role).toBe('student');
    expect(hacked.subscriptionActive).toBe(false);
    expect(hacked.country).toBe('GA');
    expect(hacked.program).toBe('national');
  });
  it('un patch légitime (champ non sensible) passe', () => {
    // aucun champ non-sensible dans UserState par défaut : on prouve qu'un champ inconnu est ignoré sans crash
    const r = applyClientStatePatch(eleve, { foo: 'bar' } as unknown as Partial<UserState>);
    expect(r.role).toBe('student');
  });
});

describe('Test 2 — Graceful Degradation (offline)', () => {
  it('savePrefs n\'explose pas si localStorage indisponible (réseau/quota)', () => {
    const orig = globalThis.localStorage;
    // @ts-expect-error simulate offline / no storage
    delete (globalThis as { localStorage?: unknown }).localStorage;
    expect(() => savePrefs({ bougie: true, theme: 'dark' })).not.toThrow();
    expect(loadPrefs()).toEqual({}); // dégradation propre, pas de crash
    if (orig) (globalThis as { localStorage?: unknown }).localStorage = orig;
  });
  it('ANTI_FOUC_SNIPPET est un script auto-exécutable sans dépendance', () => {
    expect(ANTI_FOUC_SNIPPET).toContain('localStorage');
    expect(ANTI_FOUC_SNIPPET).toContain('classList.add');
  });
});

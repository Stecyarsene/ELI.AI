import { teacherAccessDecision, TEACHER_TRIAL_MAX } from '../../src/lib/teacher/gating';

const NOW = new Date('2026-06-14T12:00:00Z');

describe('T3 — Gating enseignant (2 essais puis premium)', () => {
  it('super_admin et school_admin : accès libre, sans consommer d\'essai', () => {
    expect(teacherAccessDecision(['super_admin'], null, NOW)).toMatchObject({ allow: true, reason: 'staff', consumeTrial: false });
    expect(teacherAccessDecision(['school_admin'], { trial_count: 9 }, NOW)).toMatchObject({ allow: true, reason: 'staff' });
  });

  it('abonnement actif (paid_until futur) : accès libre', () => {
    const d = teacherAccessDecision(['teacher'], { is_paid: true, paid_until: '2026-12-31T00:00:00Z' }, NOW);
    expect(d).toMatchObject({ allow: true, reason: 'paid', consumeTrial: false });
  });
  it('abonnement expiré : retombe sur les essais', () => {
    const d = teacherAccessDecision(['teacher'], { is_paid: true, paid_until: '2026-01-01T00:00:00Z', trial_count: 0 }, NOW);
    expect(d).toMatchObject({ allow: true, reason: 'trial' });
  });
  it('is_paid sans date d\'expiration : accès libre', () => {
    expect(teacherAccessDecision(['teacher'], { is_paid: true, paid_until: null }, NOW)).toMatchObject({ allow: true, reason: 'paid' });
  });

  it('1er et 2e essai gratuits consommables', () => {
    expect(teacherAccessDecision(['teacher'], { trial_count: 0 }, NOW)).toMatchObject({ allow: true, reason: 'trial', consumeTrial: true });
    expect(teacherAccessDecision(['teacher'], { trial_count: 1 }, NOW)).toMatchObject({ allow: true, reason: 'trial', consumeTrial: true });
  });
  it('au-delà de 2 essais : paywall', () => {
    const d = teacherAccessDecision(['teacher'], { trial_count: TEACHER_TRIAL_MAX }, NOW);
    expect(d).toEqual({ allow: false, reason: 'paywall', trialsUsed: 2 });
  });
  it('profil de facturation absent : traité comme 0 essai utilisé', () => {
    expect(teacherAccessDecision(['teacher'], null, NOW)).toMatchObject({ allow: true, reason: 'trial' });
  });
});

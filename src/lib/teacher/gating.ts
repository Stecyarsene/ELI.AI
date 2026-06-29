import type { Role } from '@/lib/access';

export const TEACHER_TRIAL_MAX = 3;

export interface TeacherBilling {
  is_paid?: boolean | null;
  paid_until?: string | null;
  trial_count?: number | null;
}

export type TeacherDecision =
  | { allow: true; reason: 'staff' | 'paid' | 'trial'; consumeTrial: boolean }
  | { allow: false; reason: 'paywall'; trialsUsed: number };

/**
 * Décide si un enseignant peut générer du matériel (T3 §d).
 *  - super_admin / school_admin (staff non-enseignant) : accès libre (supervision).
 *  - abonnement actif (is_paid + paid_until non dépassé) : accès libre.
 *  - sinon : 3 essais gratuits (trial_count) — chaque essai en consomme un.
 *  - au-delà : paywall.
 */
export function teacherAccessDecision(roles: readonly Role[], billing: TeacherBilling | null, now: Date = new Date()): TeacherDecision {
  if (roles.includes('super_admin') || roles.includes('school_admin')) {
    return { allow: true, reason: 'staff', consumeTrial: false };
  }
  const b = billing ?? {};
  const active = !!b.is_paid && (!b.paid_until || new Date(b.paid_until).getTime() > now.getTime());
  if (active) return { allow: true, reason: 'paid', consumeTrial: false };

  const used = Math.max(0, Number(b.trial_count ?? 0));
  if (used < TEACHER_TRIAL_MAX) return { allow: true, reason: 'trial', consumeTrial: true };
  return { allow: false, reason: 'paywall', trialsUsed: used };
}

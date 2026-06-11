/**
 * ÉLI — Core User Engine : machine d'état de session (doc 7).
 * RÈGLE DE SÉCURITÉ : le rôle/pays/examen viennent TOUJOURS du JWT vérifié serveur,
 * jamais d'un état local modifiable. Le client ne fait qu'AFFICHER, il ne décide rien.
 */
export type Role = 'student' | 'parent' | 'teacher' | 'school_admin' | 'ministry' | 'super_admin';
export type Exam = 'CEP' | 'BEPC' | 'BAC' | 'BREVET' | 'NONE';

export interface UserState {
  id: string; role: Role; program: 'national' | 'aefe';
  country: string | null; exam: Exam; subscriptionActive: boolean; isGuest: boolean;
}

export const GUEST: UserState = {
  id: 'guest', role: 'student', program: 'national',
  country: null, exam: 'NONE', subscriptionActive: false, isGuest: true,
};

/** Hydratation : en prod, AUCUN utilisateur détecté ⇒ Guest sûr. En dev, profil de test. */
export function hydrateInitialState(opts: { isProd: boolean; verifiedClaims?: Partial<UserState> | null }): UserState {
  if (opts.verifiedClaims && opts.verifiedClaims.id) {
    // On ne prend que des claims VÉRIFIÉS serveur (issus du JWT décodé côté serveur).
    return { ...GUEST, ...opts.verifiedClaims, isGuest: false } as UserState;
  }
  if (!opts.isProd) {
    return { id: 'dev-student', role: 'student', program: 'national', country: 'GA', exam: 'BAC', subscriptionActive: true, isGuest: false };
  }
  return GUEST;
}

/**
 * Anti privilege-escalation : toute tentative de promotion de rôle côté CLIENT est ignorée.
 * Le rôle effectif ne peut venir que des claims serveur. Cette fonction PROUVE le rejet.
 */
export function applyClientStatePatch(current: UserState, patch: Partial<UserState>): UserState {
  const FORBIDDEN: (keyof UserState)[] = ['role', 'program', 'country', 'exam', 'subscriptionActive', 'id', 'isGuest'];
  const safe: Partial<UserState> = {};
  for (const k of Object.keys(patch) as (keyof UserState)[]) {
    if (!FORBIDDEN.includes(k)) (safe as Record<string, unknown>)[k] = patch[k];
  }
  // Les champs sensibles restent EXACTEMENT ceux du serveur.
  return { ...current, ...safe };
}

/**
 * ÉLI — Contrôle d'accès par rôle (T2 : séparation stricte élève ≠ prof ≠ parent).
 *
 * SOURCE DE VÉRITÉ UNIQUE : tous les endpoints et l'UI dérivent l'autorisation
 * de CES fonctions pures (testables sans réseau). Le rôle effectif provient
 * TOUJOURS du serveur (table user_roles + profil). Le client ne fait qu'afficher.
 *
 * Principe d'étanchéité :
 *   - L'espace ÉLÈVE (tuteur IA /api/ai/chat) est réservé aux apprenants.
 *   - L'espace ENSEIGNANT (/api/ai/teacher) est réservé au personnel pédagogique.
 *   - L'espace PARENT (consultation) est réservé aux parents.
 *   - super_admin = accès transverse (test/supervision), au-dessus des silos.
 */
export type Role = 'student' | 'parent' | 'teacher' | 'school_admin' | 'ministry' | 'super_admin';

/** Personnel pédagogique pouvant générer du matériel (espace prof). */
export const TEACHER_TOOL_ROLES: Role[] = ['teacher', 'school_admin', 'super_admin'];
/** Rôles « staff » (non-apprenants) : tout sauf élève/parent. */
export const STAFF_ROLES: Role[] = ['teacher', 'school_admin', 'ministry', 'super_admin'];

export function isSuperAdmin(roles: readonly Role[]): boolean {
  return roles.includes('super_admin');
}

export function isStaff(roles: readonly Role[]): boolean {
  return roles.some((r) => STAFF_ROLES.includes(r));
}

/**
 * Tuteur IA élève. Autorisé si :
 *   - super_admin (god mode test/supervision), OU
 *   - le compte n'est PAS exclusivement prof/parent (un apprenant n'a souvent
 *     aucune ligne user_roles → rôles = [] ⇒ apprenant par défaut, autorisé).
 * Refusé si le compte est un PROF ou un PARENT (sans aussi être élève/super_admin) :
 *   un prof utilise l'espace enseignant, un parent l'espace parent. Étanchéité stricte.
 */
export function canUseStudentTutor(roles: readonly Role[]): boolean {
  if (isSuperAdmin(roles)) return true;
  if (roles.includes('student')) return true;
  // Compte exclusivement parent ou personnel → pas de tuteur élève.
  if (roles.includes('parent')) return false;
  if (isStaff(roles)) return false;
  // Aucun rôle particulier ⇒ apprenant standard.
  return true;
}

/** Génération de matériel pédagogique (espace prof). */
export function canUseTeacherTools(roles: readonly Role[]): boolean {
  return roles.some((r) => TEACHER_TOOL_ROLES.includes(r));
}

/** Consultation du tableau de bord parent (suivi enfant). */
export function canViewParentDashboard(roles: readonly Role[]): boolean {
  return roles.includes('parent') || isSuperAdmin(roles);
}

/** Centre de commandement super-admin. */
export function canViewAdminConsole(roles: readonly Role[]): boolean {
  return isSuperAdmin(roles);
}

/**
 * Espace par défaut d'un compte (pour l'aiguillage UI après connexion).
 * Priorité : super_admin > school_admin/ministry > teacher > parent > student.
 */
export type Space = 'admin' | 'teacher' | 'parent' | 'student';
export function primarySpace(roles: readonly Role[]): Space {
  if (isSuperAdmin(roles)) return 'admin';
  if (roles.includes('school_admin') || roles.includes('ministry')) return 'admin';
  if (roles.includes('teacher')) return 'teacher';
  if (roles.includes('parent')) return 'parent';
  return 'student';
}

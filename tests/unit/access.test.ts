import {
  canUseStudentTutor, canUseTeacherTools, canViewParentDashboard,
  canViewAdminConsole, isStaff, isSuperAdmin, primarySpace, type Role,
} from '../../src/lib/access';

describe('T2 — Étanchéité des espaces (élève ≠ prof ≠ parent)', () => {
  describe('Tuteur IA élève', () => {
    it('apprenant sans rôle → autorisé (cas standard)', () => {
      expect(canUseStudentTutor([])).toBe(true);
    });
    it('rôle student explicite → autorisé', () => {
      expect(canUseStudentTutor(['student'])).toBe(true);
    });
    it('prof pur → REFUSÉ (doit passer par l\'espace enseignant)', () => {
      expect(canUseStudentTutor(['teacher'])).toBe(false);
    });
    it('parent pur → REFUSÉ (doit passer par l\'espace parent)', () => {
      expect(canUseStudentTutor(['parent'])).toBe(false);
    });
    it('ministry / school_admin purs → REFUSÉS', () => {
      expect(canUseStudentTutor(['ministry'])).toBe(false);
      expect(canUseStudentTutor(['school_admin'])).toBe(false);
    });
    it('super_admin → autorisé (supervision/test transverse)', () => {
      expect(canUseStudentTutor(['super_admin'])).toBe(true);
      expect(canUseStudentTutor(['teacher', 'super_admin'])).toBe(true);
    });
    it('compte mixte explicitement aussi élève → autorisé', () => {
      expect(canUseStudentTutor(['teacher', 'student'])).toBe(true);
    });
  });

  describe('Outils enseignant', () => {
    it('teacher / school_admin / super_admin → autorisés', () => {
      (['teacher', 'school_admin', 'super_admin'] as Role[]).forEach((r) =>
        expect(canUseTeacherTools([r])).toBe(true));
    });
    it('élève et parent → refusés', () => {
      expect(canUseTeacherTools([])).toBe(false);
      expect(canUseTeacherTools(['student'])).toBe(false);
      expect(canUseTeacherTools(['parent'])).toBe(false);
    });
    it('ministry → refusé (analytics only, pas de génération)', () => {
      expect(canUseTeacherTools(['ministry'])).toBe(false);
    });
  });

  describe('Tableau de bord parent', () => {
    it('parent et super_admin → autorisés ; élève/prof → refusés', () => {
      expect(canViewParentDashboard(['parent'])).toBe(true);
      expect(canViewParentDashboard(['super_admin'])).toBe(true);
      expect(canViewParentDashboard(['student'])).toBe(false);
      expect(canViewParentDashboard(['teacher'])).toBe(false);
    });
  });

  describe('Console admin & helpers', () => {
    it('canViewAdminConsole : super_admin uniquement', () => {
      expect(canViewAdminConsole(['super_admin'])).toBe(true);
      expect(canViewAdminConsole(['school_admin'])).toBe(false);
    });
    it('isStaff exclut élève et parent', () => {
      expect(isStaff(['teacher'])).toBe(true);
      expect(isStaff(['ministry'])).toBe(true);
      expect(isStaff([])).toBe(false);
      expect(isStaff(['parent'])).toBe(false);
    });
    it('isSuperAdmin', () => {
      expect(isSuperAdmin(['super_admin'])).toBe(true);
      expect(isSuperAdmin(['teacher'])).toBe(false);
    });
  });

  describe('Aiguillage de l\'espace par défaut', () => {
    it('priorité admin > teacher > parent > student', () => {
      expect(primarySpace(['super_admin', 'teacher'])).toBe('admin');
      expect(primarySpace(['school_admin'])).toBe('admin');
      expect(primarySpace(['ministry'])).toBe('admin');
      expect(primarySpace(['teacher'])).toBe('teacher');
      expect(primarySpace(['parent'])).toBe('parent');
      expect(primarySpace(['student'])).toBe('student');
      expect(primarySpace([])).toBe('student');
    });
  });
});

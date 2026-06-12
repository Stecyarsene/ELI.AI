export type Program = 'national' | 'aefe';
export type Status = 'vert' | 'orange' | 'rouge';

export interface Profile {
  id: string; program: Program; first_name: string; birth_date: string | null;
  class_key: string; serie: string | null; is_paid: boolean;
  paid_until: string | null; bougie: boolean;
}
export interface Progress {
  user_id: string; program: Program; subject: string; status: Status;
  last_chapter: string | null; strengths: string[]; improvements: string[];
  red_zones: string[]; history: Array<{ d: string; t: string; s: Status }>;
}
export interface Plan { id: string; program: Program; label: string; amount_fcfa: number; duration_days: number; }
export interface Payment { tx_id: string; user_id: string; program: Program; plan_id: string; amount_fcfa: number; status: 'pending' | 'success' | 'failed'; }

export type FicheKind = 'revision' | 'quiz' | 'examen';
export interface Fiche {
  id: number; user_id: string; program: Program; subject: string;
  kind: FicheKind; title: string; body: Record<string, unknown>;
  status: 'pret' | 'archive'; created_at: string;
}
export interface Bilan {
  chapitre_travaille?: string; reussites?: string[]; erreurs_types?: string[];
  statut_propose?: Status; prochaine_etape?: string;
}

/** Retour de la RPC my_scope() — périmètre pédagogique autorisé de l'élève. */
export interface Scope {
  program: Program; class_key: string; class_label: string; cycle: string | null;
  serie: string | null; country_code: string | null; is_technical: boolean;
  is_exam_class: boolean; exam_name: string | null; has_series: boolean;
  curriculum: CurriculumPayload;
}
/** Format attendu du payload `curriculum` (jsonb). Tolérant : tout champ est optionnel.
 *  Forme ingérée par set_curriculum : { source, updated, subjects:[{name, chapters:[{order,title,notions[]}]}] } */
export interface CurriculumPayload {
  version?: number; source?: string; updated?: string;
  subjects?:
    | Record<string, { chapters?: string[]; objectifs?: string[] }>
    | { name: string; chapters?: { order?: number; title?: string; notions?: string[] }[] }[];
}
export interface Engagement {
  user_id: string; streak_current: number; streak_best: number;
  last_active_date: string | null; total_sessions: number; total_minutes: number; updated_at: string;
}
export type ReminderKind = 'continuite' | 'streak' | 'examen' | 'celebration' | 'custom';
export interface Reminder {
  id: number; user_id: string; kind: ReminderKind; title: string; body: string;
  subject: string | null; scheduled_at: string; sent_at: string | null;
  status: 'pending' | 'sent' | 'cancelled'; created_at: string;
}

/** Résultat de in_school_hours() — anti-triche par horaires de classe réels (Gabon). */
export interface SchoolStatus { in_class: boolean; now_local: string; slot: string | null; }

export type WorkStatus = 'open' | 'resumable' | 'done';
export interface WorkSession {
  id: number; user_id: string; program: Program; pillar: string | null; subject: string | null;
  class_key: string | null; serie: string | null; title: string; summary: string;
  highlights: string[]; transcript: { role: string; text: string }[]; pdf_path: string | null;
  status: WorkStatus; duration_min: number; started_at: string; ended_at: string | null; created_at: string;
}

export type OrientationTrack = 'parcoursup' | 'mon_avenir';
export type WishStatus = 'envisage' | 'candidate' | 'accepte' | 'refuse' | 'confirme';
export interface OrientationWish {
  id: number; user_id: string; program: Program; track: OrientationTrack; rank: number | null;
  formation: string; etablissement: string | null; ville: string | null; status: WishStatus;
  notes: string | null; meta: Record<string, unknown>; created_at: string; updated_at: string;
}

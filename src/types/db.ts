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

/**
 * COUCHE D'ACCÈS AUX DONNÉES — l'unique porte (MAD §2.1, repository pattern).
 * Séparation stricte des couches : tout le contenu des maquettes est du Mock Data ;
 * en production, seul le mode 'live' (Supabase) est autorisé (verrou ci-dessous + CI).
 */
import { supabaseBrowser } from '@/lib/supabase/client';
import type { Profile, Progress } from '@/types/db';

const MODE = process.env.NEXT_PUBLIC_DATA_MODE ?? 'live';
if (process.env.NODE_ENV === 'production' && MODE !== 'live') {
  throw new Error('MOCK DATA interdit en production — NEXT_PUBLIC_DATA_MODE doit être "live".');
}

export interface ProfileRepo { me(): Promise<Profile | null>; }
export interface ProgressRepo { listMine(): Promise<Progress[]>; }

const liveProfileRepo: ProfileRepo = {
  async me() {
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return null;
    const { data } = await sb.from('profiles').select('*').eq('id', auth.user.id).single();
    return (data as Profile | null) ?? null;
  },
};
const liveProgressRepo: ProgressRepo = {
  async listMine() {
    const { data } = await supabaseBrowser().from('progress').select('*');
    return (data as Progress[] | null) ?? [];
  },
};

/* Mock = développement/démo UNIQUEMENT (interdit en prod par le verrou ci-dessus). */
const mockProfileRepo: ProfileRepo = {
  async me() {
    return { id: 'demo', program: 'national', first_name: 'Démo', birth_date: null,
      class_key: '6ème', serie: null, is_paid: true, paid_until: null, bougie: false };
  },
};
const mockProgressRepo: ProgressRepo = { async listMine() { return []; } };

export const profileRepo: ProfileRepo = MODE === 'mock' ? mockProfileRepo : liveProfileRepo;
export const progressRepo: ProgressRepo = MODE === 'mock' ? mockProgressRepo : liveProgressRepo;

import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
import { safeParse, progressInput } from '@/lib/validation/schemas';
import type { Profile, Progress, Status } from '@/types/db';

export const runtime = 'nodejs';

/** GET /api/progress — progression complète de l'élève connecté (hydrate les dashboards). */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin()
    .from('progress')
    .select('*')
    .eq('user_id', user.id);

  if (error) return Response.json({ error: 'db_error' }, { status: 500 });
  return Response.json({ progress: (data as Progress[] | null) ?? [] });
}

/** POST /api/progress — applique un bilan de fin de session (bloc [BILAN]) :
 *  upsert de la matière, fusion de l'historique, statut/chapitre/forces/lacunes mis à jour. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const raw = (await req.json().catch(() => null)) as unknown;
  const parsed = safeParse(progressInput, raw);
  if (!parsed.ok) return Response.json({ error: 'invalid_input', detail: parsed.error }, { status: 400 });
  const { subject, program, bilan, channel } = parsed.data;

  const sb = supabaseAdmin();

  // Ligne existante (clé = user_id+subject) pour fusionner historique et programme.
  const { data: existing } = await sb
    .from('progress').select('*').eq('user_id', user.id).eq('subject', subject).maybeSingle();
  const prev = existing as Progress | null;

  let prog = program ?? prev?.program ?? null;
  if (!prog) {
    const { data: profile } = await sb.from('profiles').select('program').eq('id', user.id).single();
    prog = (profile as Pick<Profile, 'program'> | null)?.program ?? 'national';
  }

  const status: Status = bilan.statut_propose ?? prev?.status ?? 'orange';
  const history = Array.isArray(prev?.history) ? prev!.history.slice(-19) : [];
  history.push({ d: new Date().toISOString().slice(0, 10), t: bilan.chapitre_travaille ?? 'Session', s: status });

  // Lacunes : on fusionne sans doublon (erreurs du jour + prochaine étape).
  const redZones = Array.from(new Set([...(bilan.erreurs_types ?? []), ...(prev?.red_zones ?? [])])).slice(0, 12);
  const improvements = bilan.prochaine_etape
    ? Array.from(new Set([bilan.prochaine_etape, ...(prev?.improvements ?? [])])).slice(0, 12)
    : (prev?.improvements ?? []);

  const { data, error } = await sb
    .from('progress')
    .upsert({
      user_id: user.id,
      program: prog,
      subject,
      status,
      last_chapter: bilan.chapitre_travaille ?? prev?.last_chapter ?? null,
      strengths: bilan.reussites ?? prev?.strengths ?? [],
      improvements,
      red_zones: redZones,
      history,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,subject' })
    .select('*')
    .single();

  if (error) return Response.json({ error: 'db_error' }, { status: 500 });

  // T9 — Télémétrie d'apprentissage + CANAL (site/app/whatsapp) pour les analytics admin.
  // Échec non bloquant : la progression de l'élève prime sur la mesure.
  void sb.from('learning_events').insert({
    user_id: user.id,
    program: prog,
    subject,
    concept: (bilan.chapitre_travaille ?? subject).slice(0, 300),
    success: status === 'vert',
    channel: channel ?? 'site',
  }).then(() => undefined, () => undefined);

  return Response.json({ progress: data as Progress }, { status: 200 });
}

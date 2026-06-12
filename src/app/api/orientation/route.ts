import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
import { safeParse, orientationInput } from '@/lib/validation/schemas';
import type { Profile, OrientationWish } from '@/types/db';

export const runtime = 'nodejs';

const TRACKS = ['parcoursup', 'mon_avenir'] as const;

/** GET /api/orientation?track=parcoursup|mon_avenir — liste les vœux de l'élève, classés par rang. */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const track = new URL(req.url).searchParams.get('track');
  const sb = supabaseAdmin();
  let q = sb.from('orientation_wishes').select('*').eq('user_id', user.id);
  if (track && (TRACKS as readonly string[]).includes(track)) q = q.eq('track', track);
  const { data } = await q.order('rank', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true });
  return Response.json({ items: (data as OrientationWish[] | null) ?? [] });
}

/** POST /api/orientation — crée ou met à jour un vœu (gère le rang). */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const raw = (await req.json().catch(() => null)) as unknown;
  const parsed = safeParse(orientationInput, raw);
  if (!parsed.ok) return Response.json({ error: 'invalid_input', detail: parsed.error }, { status: 400 });
  const { id, track, formation, etablissement, ville, rank, status, notes } = parsed.data;
  const sb = supabaseAdmin();
  const { data: prof } = await sb.from('profiles').select('program').eq('id', user.id).single();
  const program = (prof as Pick<Profile, 'program'> | null)?.program ?? 'national';

  // Rang : si non fourni à la création, on place en fin de liste.
  let finalRank = rank ?? null;
  if (!id && finalRank == null) {
    const { count } = await sb.from('orientation_wishes').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('track', track);
    finalRank = (count ?? 0) + 1;
  }

  const row = {
    user_id: user.id, program, track, formation,
    etablissement: etablissement ?? null, ville: ville ?? null,
    status: status ?? 'envisage', notes: notes ?? null,
    ...(finalRank != null ? { rank: finalRank } : {}),
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await sb.from('orientation_wishes').update(row).eq('id', id).eq('user_id', user.id);
    if (error) return Response.json({ error: 'db_error' }, { status: 500 });
    return Response.json({ ok: true, id });
  }
  const { data, error } = await sb.from('orientation_wishes').insert(row).select('id').single();
  if (error) return Response.json({ error: 'db_error' }, { status: 500 });
  return Response.json({ ok: true, id: (data as { id: number }).id }, { status: 201 });
}

/** DELETE /api/orientation?id=123 — supprime un vœu de l'élève. */
export async function DELETE(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return Response.json({ error: 'invalid_input' }, { status: 400 });
  const { error } = await supabaseAdmin().from('orientation_wishes').delete().eq('id', id).eq('user_id', user.id);
  if (error) return Response.json({ error: 'db_error' }, { status: 500 });
  return Response.json({ ok: true });
}

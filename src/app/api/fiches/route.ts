import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
import { safeParse, ficheInput } from '@/lib/validation/schemas';
import type { Fiche, Profile } from '@/types/db';

export const runtime = 'nodejs';

/** GET /api/fiches?subject=Mathématiques
 *  Liste les fiches de l'élève connecté, filtrées par matière si fournie (sinon toutes),
 *  les plus récentes d'abord. Aucune fiche d'un autre élève n'est jamais renvoyée. */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const subject = url.searchParams.get('subject');
  const kind = url.searchParams.get('kind');
  let q = supabaseAdmin()
    .from('fiches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);
  if (subject) q = q.eq('subject', subject);
  if (kind === 'revision' || kind === 'quiz' || kind === 'examen') q = q.eq('kind', kind);

  const { data, error } = await q;
  if (error) return Response.json({ error: 'db_error' }, { status: 500 });
  return Response.json({ fiches: (data as Fiche[] | null) ?? [] });
}

/** POST /api/fiches — enregistre une fiche générée par Éli (bloc [FICHE]) pour l'élève connecté.
 *  Le programme est déduit du profil si non fourni ; user_id est imposé serveur (jamais de spoof). */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const raw = (await req.json().catch(() => null)) as unknown;
  const parsed = safeParse(ficheInput, raw);
  if (!parsed.ok) return Response.json({ error: 'invalid_input', detail: parsed.error }, { status: 400 });
  const { subject, kind, title, body, program } = parsed.data;

  const sb = supabaseAdmin();
  let prog = program ?? null;
  if (!prog) {
    const { data: profile } = await sb.from('profiles').select('program').eq('id', user.id).single();
    prog = (profile as Pick<Profile, 'program'> | null)?.program ?? 'national';
  }

  const { data, error } = await sb
    .from('fiches')
    .insert({
      user_id: user.id,
      program: prog,
      subject,
      kind,
      title: title ?? '',
      body: body ?? {},
      status: 'pret',
    })
    .select('*')
    .single();

  if (error) return Response.json({ error: 'db_error' }, { status: 500 });
  return Response.json({ fiche: data as Fiche }, { status: 201 });
}

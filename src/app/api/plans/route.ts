import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/** Liste les offres Premium du programme de l'utilisateur connecté (national). */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const sb = supabaseAdmin();
  const { data: profile } = await sb.from('profiles').select('program').eq('id', user.id).maybeSingle();
  const program = (profile as { program?: string } | null)?.program ?? 'national';
  const { data, error } = await sb.from('plans').select('id, label, amount_fcfa, duration_days')
    .eq('program', program).order('amount_fcfa');
  if (error) return Response.json({ error: 'plans_unavailable' }, { status: 502 });
  return Response.json({ plans: data ?? [] });
}

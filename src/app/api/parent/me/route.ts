import { bearerOf, supabaseAsUser } from '@/lib/roles';
import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Profil parent + liste de ses enfants liés (RPC stricte). */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabaseAdmin().from('parent_profiles').select('*').eq('user_id', user.id).maybeSingle();
  const { data: children } = await supabaseAsUser(bearerOf(req)!).rpc('parent_children');
  return Response.json({ isParent: !!profile, profile: profile ?? null, children: children ?? [] });
}

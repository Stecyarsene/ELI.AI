import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/** Statut enseignant du compte connecté : { isTeacher, profile }. Sert au gating de l'espace prof. */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ isTeacher: false, profile: null, authed: false });

  const sb = supabaseAdmin();
  const [{ data: roleRow }, { data: profile }] = await Promise.all([
    sb.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'teacher').maybeSingle(),
    sb.from('teacher_profiles').select('full_name, establishment, subject, program, status').eq('user_id', user.id).maybeSingle(),
  ]);

  return Response.json({ isTeacher: !!roleRow, profile: profile ?? null, authed: true });
}

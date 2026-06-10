import { requireRole, bearerOf, supabaseAsUser } from '@/lib/roles';
export async function GET(req: Request) {
  const auth = await requireRole(req, ['school_admin', 'teacher']);
  if ('error' in auth) return auth.error;
  const { data, error } = await supabaseAsUser(bearerOf(req)!).rpc('school_gaps_overview');
  if (error) return Response.json({ error: 'forbidden' }, { status: 403 });
  return Response.json({ gaps: data });
}

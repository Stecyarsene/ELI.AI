import { requireRole, bearerOf, supabaseAsUser } from '@/lib/roles';
export async function GET(req: Request) {
  const auth = await requireRole(req, ['super_admin']);
  if ('error' in auth) return auth.error;
  const { data, error } = await supabaseAsUser(bearerOf(req)!).rpc('admin_ledger');
  if (error) return Response.json({ error: 'forbidden' }, { status: 403 });
  return Response.json({ ledger: data });
}

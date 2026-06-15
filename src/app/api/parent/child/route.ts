import { bearerOf, supabaseAsUser } from '@/lib/roles';
import { userFromRequest } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Tableau de bord d'UN enfant. La RPC vérifie le lien parent<->enfant (étanchéité stricte). */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const childId = new URL(req.url).searchParams.get('id') || '';
  if (!/^[0-9a-f-]{36}$/i.test(childId)) return Response.json({ error: 'invalid_input' }, { status: 400 });

  const { data, error } = await supabaseAsUser(bearerOf(req)!).rpc('parent_child_overview', { p_child: childId });
  if (error) {
    if (/forbidden|42501/i.test(error.message || '')) return Response.json({ error: 'forbidden' }, { status: 403 });
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }
  return Response.json(data);
}

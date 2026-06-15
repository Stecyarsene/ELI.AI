import { bearerOf, supabaseAsUser } from '@/lib/roles';
import { userFromRequest } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/** Lie le parent connecté à un enfant via son numéro WhatsApp + prénom (RPC vérifiée, security definer).
 *  Le contrôle d'identité et l'octroi du rôle 'parent' sont faits côté base. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const childPhone = String(body?.childPhone ?? '').trim();
  const childFirstName = String(body?.childFirstName ?? '').trim();
  const parentName = String(body?.parentName ?? '').trim().slice(0, 120);
  if (!childPhone || !childFirstName) return Response.json({ error: 'invalid_input' }, { status: 400 });

  const { data, error } = await supabaseAsUser(bearerOf(req)!).rpc('parent_link_by_phone', {
    p_child_phone: childPhone, p_child_first_name: childFirstName, p_parent_name: parentName,
  });
  if (error) {
    const msg = error.message || '';
    if (/child_not_found|P0002/i.test(msg)) return Response.json({ error: 'child_not_found' }, { status: 404 });
    if (/cannot_link_self/i.test(msg)) return Response.json({ error: 'cannot_link_self' }, { status: 400 });
    return Response.json({ error: 'link_failed' }, { status: 400 });
  }
  return Response.json({ ok: true, child: data });
}

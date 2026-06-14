import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
import { canUseStudentTutor, type Role } from '@/lib/access';
export type { Role } from '@/lib/access';

export function bearerOf(req: Request): string | null {
  const a = req.headers.get('authorization') ?? '';
  return a.startsWith('Bearer ') ? a.slice(7) : null;
}
export function supabaseAsUser(token: string): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false } });
}

/** Résout l'utilisateur + ses rôles vérifiés serveur (table user_roles). */
export async function resolveRoles(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return { error: Response.json({ error: 'unauthorized' }, { status: 401 }) } as const;
  const { data } = await supabaseAdmin().from('user_roles').select('role').eq('user_id', user.id);
  const roles = (data ?? []).map((r) => r.role as Role);
  return { user, roles } as const;
}

export async function requireRole(req: Request, allowed: Role[]) {
  const gate = await resolveRoles(req);
  if ('error' in gate) return gate;
  if (!gate.roles.some((r) => allowed.includes(r)))
    return { error: Response.json({ error: 'forbidden' }, { status: 403 }) } as const;
  return gate;
}

/** Étanchéité T2 : réserve le tuteur IA élève aux apprenants (refuse prof/parent purs). */
export async function requireStudentTutor(req: Request) {
  const gate = await resolveRoles(req);
  if ('error' in gate) return gate;
  if (!canUseStudentTutor(gate.roles))
    return { error: Response.json({ error: 'wrong_space', detail: 'student_tutor_reserved' }, { status: 403 }) } as const;
  return gate;
}

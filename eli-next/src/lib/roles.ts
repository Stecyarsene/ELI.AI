import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
export type Role = 'student' | 'teacher' | 'school_admin' | 'ministry' | 'super_admin';
export function bearerOf(req: Request): string | null {
  const a = req.headers.get('authorization') ?? '';
  return a.startsWith('Bearer ') ? a.slice(7) : null;
}
export function supabaseAsUser(token: string): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false } });
}
export async function requireRole(req: Request, allowed: Role[]) {
  const user = await userFromRequest(req);
  if (!user) return { error: Response.json({ error: 'unauthorized' }, { status: 401 }) } as const;
  const { data } = await supabaseAdmin().from('user_roles').select('role').eq('user_id', user.id);
  const roles = (data ?? []).map((r) => r.role as Role);
  if (!roles.some((r) => allowed.includes(r))) return { error: Response.json({ error: 'forbidden' }, { status: 403 }) } as const;
  return { user, roles } as const;
}

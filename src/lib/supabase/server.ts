import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Client service_role — UNIQUEMENT côté serveur (webhooks, activation). Jamais exposé. */
export function supabaseAdmin(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Résout l'utilisateur depuis un Bearer token (JWT 15 min émis par Supabase Auth). */
export async function userFromRequest(req: Request) {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  return error ? null : data.user;
}

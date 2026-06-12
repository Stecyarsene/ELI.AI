import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Client service_role — UNIQUEMENT côté serveur (webhooks, activation). Jamais exposé. */
export function supabaseAdmin(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client agissant AU NOM de l'élève (anon key + son JWT) — requis pour les RPC
 *  `security definer` qui s'appuient sur auth.uid() (my_scope, touch_engagement). */
export function supabaseAsUser(token: string): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Extrait le Bearer token brut (pour les appels « as user »). */
export function tokenFromRequest(req: Request): string | null {
  const auth = req.headers.get('authorization') ?? '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

/** Résout l'utilisateur depuis un Bearer token (JWT 15 min émis par Supabase Auth). */
export async function userFromRequest(req: Request) {
  const token = tokenFromRequest(req);
  if (!token) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  return error ? null : data.user;
}

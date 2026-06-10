import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browser: SupabaseClient | null = null;
/** Client navigateur (anon key + RLS). */
export function supabaseBrowser(): SupabaseClient {
  if (!browser) {
    browser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browser;
}

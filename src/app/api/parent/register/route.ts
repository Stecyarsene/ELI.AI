import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/** Enregistre le parent connecté (après OTP WhatsApp) : profil + rôle 'parent'. Idempotent. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const full_name = String(body?.full_name ?? '').trim().slice(0, 120);
  const whatsapp = String(body?.whatsapp ?? '').trim().slice(0, 20);
  if (!full_name) return Response.json({ error: 'invalid_input', detail: 'full_name requis' }, { status: 400 });

  const sb = supabaseAdmin();
  const { error: pErr } = await sb.from('parent_profiles').upsert({
    user_id: user.id, full_name, whatsapp: whatsapp || null, updated_at: new Date().toISOString(),
  });
  if (pErr) return Response.json({ error: 'profile_failed', detail: pErr.message }, { status: 500 });

  const { data: existing } = await sb.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'parent').maybeSingle();
  if (!existing) await sb.from('user_roles').insert({ user_id: user.id, role: 'parent' });
  return Response.json({ ok: true });
}

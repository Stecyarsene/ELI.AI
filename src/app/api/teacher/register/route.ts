import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/**
 * Enregistre l'enseignant connecté (après vérification OTP WhatsApp) :
 * crée/actualise son profil officiel (teacher_profiles) et lui attribue le rôle 'teacher'
 * dans user_roles (opération service-role, donc hors RLS). Idempotent.
 */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const program = body?.program === 'aefe' ? 'aefe' : 'national';
  const full_name = String(body?.full_name ?? '').trim().slice(0, 120);
  const establishment = String(body?.establishment ?? '').trim().slice(0, 160);
  const subject = String(body?.subject ?? '').trim().slice(0, 160);
  const whatsapp = String(body?.whatsapp ?? '').trim().slice(0, 20);
  if (!full_name) return Response.json({ error: 'invalid_input', detail: 'full_name requis' }, { status: 400 });

  const sb = supabaseAdmin();

  const { error: pErr } = await sb.from('teacher_profiles').upsert({
    user_id: user.id, program, full_name, establishment: establishment || null,
    subject: subject || null, whatsapp: whatsapp || null, status: 'actif', updated_at: new Date().toISOString(),
  });
  if (pErr) return Response.json({ error: 'profile_failed', detail: pErr.message }, { status: 500 });

  // Attribue le rôle 'teacher' s'il ne l'a pas déjà (sans hypothèse sur la contrainte unique).
  const { data: existing } = await sb.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'teacher').maybeSingle();
  if (!existing) {
    const { error: rErr } = await sb.from('user_roles').insert({ user_id: user.id, role: 'teacher' });
    if (rErr) return Response.json({ error: 'role_failed', detail: rErr.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

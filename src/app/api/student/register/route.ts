import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const CLASSES = ['cp1','cp2','ce1','ce2','cm1','cm2','6e','5e','4e','3e','2nde','1ere','terminale'];

/** Inscription ÉLÈVE (après OTP WhatsApp) : crée/maj le profil élève (prénom + classe) et le rôle 'student'.
 *  Idempotent. Le parent pourra relier l'enfant via son numéro + prénom (consentement). */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const first_name = String(body?.first_name ?? '').trim().slice(0, 60);
  const class_key = String(body?.class_key ?? '').trim();
  const serie = body?.serie ? String(body.serie).trim().slice(0, 40) : null;
  const birth_date = body?.birth_date ? String(body.birth_date).slice(0, 10) : null;
  if (!first_name) return Response.json({ error: 'invalid_input', detail: 'first_name requis' }, { status: 400 });
  if (!CLASSES.includes(class_key)) return Response.json({ error: 'invalid_input', detail: 'class_key invalide' }, { status: 400 });

  const sb = supabaseAdmin();
  const { error: pErr } = await sb.from('profiles').upsert({
    id: user.id, program: 'national', first_name, class_key, serie, birth_date,
  }, { onConflict: 'id' });
  if (pErr) return Response.json({ error: 'profile_failed', detail: pErr.message }, { status: 500 });

  const { data: existing } = await sb.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'student').maybeSingle();
  if (!existing) await sb.from('user_roles').insert({ user_id: user.id, role: 'student' });
  return Response.json({ ok: true });
}

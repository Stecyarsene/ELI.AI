import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
import { safeParse, pushRegisterInput } from '@/lib/validation/schemas';

export const runtime = 'nodejs';

/** POST /api/push/register — l'app native (Capacitor PushNotifications) enregistre son jeton
 *  pour que le cron puisse cibler l'envoi. user_id imposé serveur. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const raw = (await req.json().catch(() => null)) as unknown;
  const parsed = safeParse(pushRegisterInput, raw);
  if (!parsed.ok) return Response.json({ error: 'invalid_input', detail: parsed.error }, { status: 400 });
  const { platform, token } = parsed.data;

  const { error } = await supabaseAdmin()
    .from('device_tokens')
    .upsert({ user_id: user.id, platform, token, updated_at: new Date().toISOString() }, { onConflict: 'user_id,token' });
  if (error) return Response.json({ error: 'db_error' }, { status: 500 });
  return Response.json({ ok: true }, { status: 201 });
}

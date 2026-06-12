import { supabaseAdmin } from '@/lib/supabase/server';
import { sendPush } from '@/lib/notify/push';
import type { Progress, Reminder } from '@/types/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Heure courante à Libreville (UTC+1, sans DST). */
function librevilleHour(): number {
  const h = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', hour12: false, timeZone: 'Africa/Libreville' }).format(new Date());
  return parseInt(h, 10) || 0;
}
function startOfTodayUTC(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 0, 0, 0)).toISOString();
}

/** GET /api/cron/reminders — déclenché par Vercel Cron.
 *  Règles : max 1 push/jour/élève, rien après 20h ni avant 7h, opt-out parental respecté,
 *  ton encourageant (jamais culpabilisant), message ancré sur la vraie zone rouge. */
export async function GET(req: Request) {
  // Sécurité : secret de cron (Vercel l'envoie en Authorization, ou header x-vercel-cron).
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization') ?? '';
  const isVercelCron = req.headers.get('x-vercel-cron') !== null;
  if (secret && auth !== `Bearer ${secret}` && !isVercelCron) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Fenêtre horaire : pas d'envoi 20h→7h.
  const hour = librevilleHour();
  if (hour >= 20 || hour < 7) {
    return Response.json({ ok: true, skipped: 'quiet_hours', hour });
  }

  const sb = supabaseAdmin();
  const nowIso = new Date().toISOString();

  const { data: due } = await sb.from('reminders').select('*')
    .eq('status', 'pending').lte('scheduled_at', nowIso)
    .order('scheduled_at', { ascending: true }).limit(200);
  const reminders = (due as Reminder[] | null) ?? [];
  if (!reminders.length) return Response.json({ ok: true, processed: 0 });

  // Un seul rappel par élève et par passage (le 1er dû). Le reste reste en attente.
  const byUser = new Map<string, Reminder>();
  for (const r of reminders) if (!byUser.has(r.user_id)) byUser.set(r.user_id, r);

  const today0 = startOfTodayUTC();
  let pushed = 0, skipped = 0;

  for (const [userId, r] of byUser) {
    // Opt-out parental → on annule proprement (pas de spam).
    const { data: prof } = await sb.from('profiles').select('reminders_opt_out').eq('id', userId).single();
    if (prof && (prof as { reminders_opt_out?: boolean }).reminders_opt_out) {
      await sb.from('reminders').update({ status: 'cancelled' }).eq('id', r.id);
      skipped++; continue;
    }

    // Max 1 notification/jour/élève.
    const { count } = await sb.from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('channel', 'push').gte('created_at', today0);
    if ((count ?? 0) >= 1) { skipped++; continue; } // on laisse le reminder pour un prochain jour éligible

    // Message : ton encourageant + ancrage sur la vraie zone rouge si le corps est vide.
    let title = r.title || 'Éli 🌱';
    let body = r.body || '';
    if (!body) {
      const { data: pg } = await sb.from('progress').select('*').eq('user_id', userId)
        .order('updated_at', { ascending: false }).limit(5);
      const rows = (pg as Progress[] | null) ?? [];
      const red = rows.flatMap((x) => x.red_zones || [])[0];
      const subj = r.subject || rows[0]?.subject;
      body = red
        ? `Et si on apprivoisait « ${red} »${subj ? ' en ' + subj : ''} aujourd'hui ? Quelques minutes suffisent, je suis là 🌱`
        : `Petit moment avec Éli aujourd'hui ? On avance à ton rythme 🌱`;
    }

    const { data: toks } = await sb.from('device_tokens').select('token').eq('user_id', userId);
    const tokens = ((toks as { token: string }[] | null) ?? []).map((t) => t.token);
    const res = await sendPush(tokens, title, body);

    await sb.from('notifications').insert({
      user_id: userId, channel: 'push', kind: r.kind,
      status: res.skipped ? 'skipped' : 'sent',
    });
    await sb.from('reminders').update({ status: 'sent', sent_at: nowIso }).eq('id', r.id);
    res.skipped ? skipped++ : pushed++;
  }

  return Response.json({ ok: true, processed: byUser.size, pushed, skipped });
}

import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
import { safeParse, continuiteInput } from '@/lib/validation/schemas';
import type { Progress } from '@/types/db';

export const runtime = 'nodejs';

/** Demain 18h00 heure de Libreville (UTC+1, pas de DST) → 17h00 UTC. */
function tomorrow18hUTC(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 17, 0, 0));
  return d.toISOString();
}

/** POST /api/session/continue — fin de session : ne jamais laisser l'élève sur un « fini ».
 *  Programme un rappel de continuité (matière + dernier chapitre) pour le lendemain 18h.
 *  Écriture en service_role (les reminders sont en RLS select-own). */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const raw = (await req.json().catch(() => ({}))) as unknown;
  const parsed = safeParse(continuiteInput, raw ?? {});
  if (!parsed.ok) return Response.json({ error: 'invalid_input', detail: parsed.error }, { status: 400 });
  let { subject, lastChapter } = parsed.data;

  const sb = supabaseAdmin();

  // Si non fournis, on déduit depuis la progression la plus récente.
  if (!subject || !lastChapter) {
    const { data } = await sb.from('progress').select('*').eq('user_id', user.id)
      .order('updated_at', { ascending: false }).limit(1);
    const last = (data as Progress[] | null)?.[0];
    if (last) { subject = subject || last.subject; lastChapter = lastChapter || last.last_chapter || undefined; }
  }
  if (!subject) return Response.json({ ok: true, skipped: 'no_subject' });

  // On évite l'empilement : on annule les continuités encore en attente.
  await sb.from('reminders').update({ status: 'cancelled' })
    .eq('user_id', user.id).eq('kind', 'continuite').eq('status', 'pending');

  const title = 'On continue ? 🌱';
  const body = lastChapter
    ? `Hier on s'est arrêtés à « ${lastChapter} » en ${subject}. On reprend là où tu en étais ?`
    : `On reprend ${subject} ensemble aujourd'hui ?`;

  const { error } = await sb.from('reminders').insert({
    user_id: user.id, kind: 'continuite', title, body, subject,
    scheduled_at: tomorrow18hUTC(), status: 'pending',
  });
  if (error) return Response.json({ error: 'db_error' }, { status: 500 });
  return Response.json({ ok: true }, { status: 201 });
}

/** Envoi de notifications push. Pluggable : utilise FCM si une clé est configurée,
 *  sinon dégrade proprement (aucune erreur) en signalant que rien n'a été envoyé.
 *  Le cron écrit de toute façon la trace dans `notifications`. */
export interface PushResult { sent: number; skipped: boolean; reason?: string; }

export async function sendPush(tokens: string[], title: string, body: string): Promise<PushResult> {
  if (!tokens.length) return { sent: 0, skipped: true, reason: 'no_token' };
  const key = process.env.FCM_SERVER_KEY;
  if (!key) return { sent: 0, skipped: true, reason: 'fcm_not_configured' };

  try {
    const r = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'key=' + key },
      body: JSON.stringify({
        registration_ids: tokens.slice(0, 500),
        notification: { title, body },
        android: { priority: 'high' },
        data: { kind: 'eli_reminder' },
      }),
    });
    if (!r.ok) return { sent: 0, skipped: true, reason: 'fcm_error_' + r.status };
    return { sent: tokens.length, skipped: false };
  } catch {
    return { sent: 0, skipped: true, reason: 'fcm_exception' };
  }
}

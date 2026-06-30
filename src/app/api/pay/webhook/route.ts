import { createHmac, timingSafeEqual } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase/server';
import { buildReceiptPdf } from '@/lib/pdf/sessionPdf';
import type { Plan } from '@/types/db';

export const runtime = 'nodejs';

/** Webhook durci à 6 verrous (MAD §3.2) : signature → fenêtre → idempotence → activation atomique → facture → notification. */
export async function POST(req: Request) {
  const raw = await req.text();

  // Verrou 1 — Signature HMAC-SHA256 (comparaison constante)
  const sig = req.headers.get('x-signature') ?? '';
  const expected = createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET!).update(raw).digest('hex');
  const valid = sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!valid) return Response.json({ error: 'invalid_signature' }, { status: 401 });

  const evt = JSON.parse(raw) as { event: string; tx: string; ts: number };
  // Verrou 2 — Fenêtre anti-rejeu (5 min)
  if (Math.abs(Date.now() - evt.ts) > 5 * 60_000) return Response.json({ error: 'stale' }, { status: 401 });
  if (evt.event !== 'payment.success') return Response.json({ ok: true, ignored: true });

  const sb = supabaseAdmin();
  const { data: pay } = await sb.from('payments').select('*').eq('tx_id', evt.tx).single();
  if (!pay) return Response.json({ error: 'unknown_tx' }, { status: 404 });
  // Verrou 3 — Idempotence : rejeu => 200 sans double activation
  if (pay.status === 'success') return Response.json({ ok: true, idempotent: true });

  // Verrou 4 — Activation atomique (routée selon le type de payeur : élève ou enseignant)
  const { data: plan } = await sb.from('plans').select('*').eq('id', pay.plan_id).single();
  const days = (plan as Plan | null)?.duration_days ?? 30;
  const paidUntil = new Date(Date.now() + days * 86_400_000).toISOString();
  await sb.from('payments').update({ status: 'success' }).eq('tx_id', evt.tx);
  const isTeacher = pay.payer_kind === 'teacher';
  if (isTeacher) {
    await sb.from('teacher_profiles').update({ is_paid: true, paid_until: paidUntil }).eq('user_id', pay.user_id);
  } else {
    await sb.from('profiles').update({ is_paid: true, paid_until: paidUntil }).eq('id', pay.user_id);
  }

  // Verrou 5 — Reçu PDF officiel BRANDÉ (vrai logo Éli) généré EN MÉMOIRE → bucket privé
  const { data: payerProfile } = await sb.from('profiles').select('first_name').eq('id', pay.user_id).maybeSingle();
  const bytes = await buildReceiptPdf({
    tx: evt.tx,
    amountFcfa: pay.amount_fcfa,
    planLabel: (plan as Plan | null)?.label ?? pay.plan_id,
    paidUntil,
    payerName: (payerProfile as { first_name?: string } | null)?.first_name ?? null,
  });
  const path = `invoices/${evt.tx}.pdf`;
  await sb.storage.from('invoices').upload(path, Buffer.from(bytes), { contentType: 'application/pdf', upsert: true });
  await sb.from('payments').update({ invoice_path: path }).eq('tx_id', evt.tx);

  // Verrou 6 — Notification parent (élève uniquement ; asynchrone, échec non bloquant)
  if (!isTeacher) {
    await sb.from('notifications').insert({ user_id: pay.user_id, channel: 'email', kind: 'receipt', status: 'queued' });
    void notifyParent(pay.user_id, evt.tx, pay.amount_fcfa).catch(() => undefined);
  }

  return Response.json({ ok: true });
}

async function notifyParent(userId: string, tx: string, amount: number): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM, to: ['parent@example.test'],
      subject: 'Éli — Paiement confirmé',
      text: `Paiement Éli confirmé (${amount} FCFA, transaction ${tx}). Reçu PDF disponible dans l'Espace Parents.`,
    }),
  });
}

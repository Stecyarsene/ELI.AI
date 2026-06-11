import { safeParse, payInit } from '@/lib/validation/schemas';
import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
import { paymentProvider } from '@/lib/payments/provider';
import type { Plan } from '@/types/db';

/** USSD Push sans redirection (MAD §3.1). Le montant est résolu CÔTÉ SERVEUR depuis la table plans. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { planId?: string; msisdn?: string } | null;
  if (!body?.planId || !body?.msisdn || !/^\+?\d{8,15}$/.test(body.msisdn)) {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }
  const sb = supabaseAdmin();
  const { data: profile } = await sb.from('profiles').select('program').eq('id', user.id).single();
  if (!profile) return Response.json({ error: 'no_profile' }, { status: 403 });

  const { data: plan } = await sb.from('plans').select('*').eq('id', body.planId).eq('program', profile.program).single();
  if (!plan) return Response.json({ error: 'unknown_plan' }, { status: 400 });
  const p = plan as Plan;

  const push = await paymentProvider.ussdPush({ msisdn: body.msisdn, amountFcfa: p.amount_fcfa, reference: user.id });
  await sb.from('payments').insert({
    tx_id: push.txId, user_id: user.id, program: p.program,
    plan_id: p.id, amount_fcfa: p.amount_fcfa, status: 'pending',
  });
  return Response.json({ txId: push.txId, status: 'pending', amountFcfa: p.amount_fcfa });
}

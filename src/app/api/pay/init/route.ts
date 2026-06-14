import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
import { safeParse, payInit } from '@/lib/validation/schemas';
import { paymentProvider } from '@/lib/payments/provider';
import type { Plan } from '@/types/db';

/** USSD Push sans redirection (MAD §3.1). Le montant est résolu CÔTÉ SERVEUR depuis la table plans.
 *  audience='teacher' : prof premium au même tarif que les élèves (programme via teacher_profiles). */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = safeParse(payInit, await req.json().catch(() => null));
  if (!parsed.ok) return Response.json({ error: 'invalid_input', detail: parsed.error }, { status: 400 });
  const { planId, msisdn, audience } = parsed.data;
  const sb = supabaseAdmin();
  const isTeacher = audience === 'teacher';

  // Programme du payeur : profil élève par défaut, sinon profil enseignant.
  let program: string | null = null;
  if (isTeacher) {
    const { data: tp } = await sb.from('teacher_profiles').select('program').eq('user_id', user.id).maybeSingle();
    program = (tp as { program?: string } | null)?.program ?? null;
  } else {
    const { data: profile } = await sb.from('profiles').select('program').eq('id', user.id).single();
    program = (profile as { program?: string } | null)?.program ?? null;
  }
  if (!program) return Response.json({ error: 'no_profile' }, { status: 403 });

  const { data: plan } = await sb.from('plans').select('*').eq('id', planId).eq('program', program).single();
  if (!plan) return Response.json({ error: 'unknown_plan' }, { status: 400 });
  const p = plan as Plan;

  const push = await paymentProvider.ussdPush({ msisdn: msisdn, amountFcfa: p.amount_fcfa, reference: user.id });
  await sb.from('payments').insert({
    tx_id: push.txId, user_id: user.id, program: p.program,
    plan_id: p.id, amount_fcfa: p.amount_fcfa, status: 'pending',
    payer_kind: isTeacher ? 'teacher' : 'student',
  });
  return Response.json({ txId: push.txId, status: 'pending', amountFcfa: p.amount_fcfa });
}

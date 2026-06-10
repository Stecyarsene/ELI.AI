/** Abstraction agrégateur (MAD §3.1) — sandbox gratuit en dev, clés live en prod (PAYMENT_ENV). */
export interface UssdPushResult { txId: string; status: 'pending'; }
export interface PaymentProvider {
  ussdPush(input: { msisdn: string; amountFcfa: number; reference: string }): Promise<UssdPushResult>;
}

class AggregatorProvider implements PaymentProvider {
  async ussdPush(input: { msisdn: string; amountFcfa: number; reference: string }): Promise<UssdPushResult> {
    const res = await fetch(`${process.env.PAYMENT_AGGREGATOR_URL}/ussd-push`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.PAYMENT_AGGREGATOR_KEY}` },
      body: JSON.stringify({ msisdn: input.msisdn, amount: input.amountFcfa, currency: 'XAF', reference: input.reference }),
    });
    if (!res.ok) throw new Error(`Agrégateur: ${res.status}`);
    const data = (await res.json()) as { transaction_id: string };
    return { txId: data.transaction_id, status: 'pending' };
  }
}
export const paymentProvider: PaymentProvider = new AggregatorProvider();

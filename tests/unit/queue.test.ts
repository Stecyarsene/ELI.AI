import { reconcile, nextBackoff, MAX_ATTEMPTS, type TxRecord } from '../../src/lib/payments/queue';

const base = (over: Partial<TxRecord> = {}): TxRecord =>
  ({ txId: 'TX1', userId: 'u1', planId: 'p', amount: 5000, state: 'pending', attempts: 0, nextRetryAt: 0, ...over });

describe('Résilience télécom — réconciliation paiement', () => {
  it('USSD plante (statut pending) → on REPLANIFIE, jamais de perte', () => {
    const r = reconcile(base({ attempts: 0, nextRetryAt: 5000 }), 'pending', 6000);
    expect(r.action).toBe('retry');
    expect(r.next?.attempts).toBe(1);
  });
  it('agrégateur confirme plus tard → ACTIVATION', () => {
    expect(reconcile(base(), 'success', 10_000).action).toBe('activate');
  });
  it('timeout total dépassé → EXPIRE proprement (pas de zombie)', () => {
    const r = reconcile(base({ attempts: MAX_ATTEMPTS }), 'unknown', 999_999_999);
    expect(r.action).toBe('expire');
  });
  it('transaction déjà réussie → idempotent (noop), pas de double activation', () => {
    expect(reconcile(base({ state: 'success' }), 'success', 1).action).toBe('noop');
  });
  it('backoff exponentiel croissant', () => {
    expect(nextBackoff(0)).toBeLessThan(nextBackoff(3));
  });
});

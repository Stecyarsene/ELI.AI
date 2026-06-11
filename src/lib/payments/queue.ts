/**
 * ÉLI — File d'attente paiement résiliente (résilience télécoms Moov/Airtel/Orange/Free).
 * Garantit qu'AUCUNE transaction n'est perdue si l'USSD/agrégateur timeout en cours de route.
 * Pattern : Outbox + reconciliation idempotente. Chaque transaction a un état durable en base ;
 * un worker rejoue les transactions 'pending' (poll de statut) avec backoff exponentiel.
 */
export type TxState = 'initiated' | 'pending' | 'success' | 'failed' | 'expired';

export interface TxRecord { txId: string; userId: string; planId: string; amount: number; state: TxState; attempts: number; nextRetryAt: number; }

export const BACKOFF_MS = [5_000, 15_000, 45_000, 120_000, 300_000]; // 5s → 5min
export const MAX_ATTEMPTS = BACKOFF_MS.length;
export const EXPIRY_MS = 30 * 60_000; // 30 min : au-delà, transaction expirée (jamais "perdue", explicitement close)

export function nextBackoff(attempts: number): number { return BACKOFF_MS[Math.min(attempts, BACKOFF_MS.length - 1)]; }

/** Décide de l'action de réconciliation pour une transaction, de façon PURE et testable. */
export function reconcile(tx: TxRecord, providerStatus: TxState | 'unknown', now: number):
  { action: 'activate' | 'retry' | 'expire' | 'noop'; next?: Partial<TxRecord> } {
  if (tx.state === 'success' || tx.state === 'failed' || tx.state === 'expired') return { action: 'noop' };
  if (providerStatus === 'success') return { action: 'activate', next: { state: 'success' } };
  if (providerStatus === 'failed') return { action: 'noop', next: { state: 'failed' } };
  // pending/unknown (timeout opérateur) : on NE perd rien, on replanifie ou on expire proprement
  if (now - (tx.nextRetryAt - nextBackoff(tx.attempts)) > EXPIRY_MS || tx.attempts >= MAX_ATTEMPTS) {
    return { action: 'expire', next: { state: 'expired' } };
  }
  return { action: 'retry', next: { attempts: tx.attempts + 1, nextRetryAt: now + nextBackoff(tx.attempts + 1), state: 'pending' } };
}

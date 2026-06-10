'use client';
import { useQuery } from '@tanstack/react-query';
import { supabaseBrowser } from '@/lib/supabase/client';
async function authedGet(path: string) {
  const { data } = await supabaseBrowser().auth.getSession();
  const r = await fetch(path, { headers: { authorization: `Bearer ${data.session?.access_token ?? ''}` } });
  if (r.status === 401 || r.status === 403) throw new Error('forbidden');
  return r.json();
}
type LedgerRow = { tx_id: string; amount_fcfa: number; status: string; receipt_sent: boolean };
type HealthRow = { metric: string; value: number; at: string };
export default function AdminPage() {
  const ledger = useQuery({ queryKey: ['ledger'], queryFn: () => authedGet('/api/admin/ledger'), retry: false });
  const health = useQuery({ queryKey: ['health'], queryFn: () => authedGet('/api/admin/health'), retry: false });
  if (ledger.isError || health.isError) return <p role="alert">Accès refusé — espace réservé au fondateur (403).</p>;
  return (
    <div style={{ padding: 24, display: 'grid', gap: 24 }}>
      <h1>Centre de Commandement Éli</h1>
      <section aria-label="FinOps"><h2>💰 Transactions (temps réel)</h2>
        {ledger.isPending ? <p className="sk sk-line" style={{ width: 320 }} /> : (
          <table><tbody>{((ledger.data?.ledger ?? []) as LedgerRow[]).map((t) => (
            <tr key={t.tx_id}><td>{t.tx_id}</td><td>{t.amount_fcfa} FCFA</td><td>{t.status}</td><td>{t.receipt_sent ? 'Reçu envoyé ✅' : 'Reçu en attente'}</td></tr>))}
          </tbody></table>)}
      </section>
      <section aria-label="DevSecOps"><h2>🛡️ Santé système</h2>
        {health.isPending ? <p className="sk sk-line" style={{ width: 320 }} /> : (
          <ul>{((health.data?.health ?? []) as HealthRow[]).map((h, i) => (<li key={i}>{h.metric} : {h.value} <small>({h.at})</small></li>))}</ul>)}
      </section>
    </div>);
}

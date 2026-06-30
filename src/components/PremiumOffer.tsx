'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

type Plan = { id: string; label: string; amount_fcfa: number; duration_days: number };
type Phase = 'choose' | 'sending' | 'pushed' | 'error';

/** Écran Premium réel : choix de l'offre + Mobile Money (Airtel/Moov) → USSD Push.
 *  L'utilisateur n'a rien à composer (*150#…) : il valide la demande reçue sur son téléphone avec son code. */
export default function PremiumOffer({ audience = 'student', onClose }: { audience?: 'student' | 'teacher'; onClose?: () => void }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState<string>('');
  const [operator, setOperator] = useState<'airtel' | 'moov'>('airtel');
  const [msisdn, setMsisdn] = useState('');
  const [phase, setPhase] = useState<Phase>('choose');
  const [msg, setMsg] = useState('');

  async function authHeader() {
    const { data } = await supabaseBrowser().auth.getSession();
    return { 'content-type': 'application/json', authorization: `Bearer ${data.session?.access_token ?? ''}` };
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/plans', { headers: await authHeader() });
        const j = (await res.json()) as { plans?: Plan[] };
        const list = j.plans ?? [];
        setPlans(list);
        if (list.length) setPlanId(list.find((p) => p.duration_days >= 90)?.id ?? list[0].id);
      } catch { setPlans([]); }
    })();
  }, []);

  function normalize(n: string) { let p = n.replace(/[\s.\-()]/g, ''); if (p && p[0] !== '+') { if (p[0] === '0') p = p.slice(1); p = '+241' + p; } return p; }

  async function pay() {
    const phone = normalize(msisdn);
    if (!planId) { setMsg('Choisis une offre.'); return; }
    if (phone.replace(/\D/g, '').length < 8) { setMsg('Entre ton numéro Mobile Money.'); return; }
    setPhase('sending'); setMsg('');
    try {
      const res = await fetch('/api/pay/init', { method: 'POST', headers: await authHeader(),
        body: JSON.stringify({ planId, msisdn: phone, audience }) });
      const j = (await res.json()) as { txId?: string; amountFcfa?: number; error?: string };
      if (!res.ok || !j.txId) { setPhase('error'); setMsg('Paiement indisponible, réessaie dans un instant.'); return; }
      setPhase('pushed');
    } catch { setPhase('error'); setMsg('Connexion interrompue, réessaie.'); }
  }

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);
  const card = (active: boolean): React.CSSProperties => ({
    flex: 1, minWidth: 150, padding: 16, borderRadius: 16, cursor: 'pointer', textAlign: 'center',
    border: '2px solid ' + (active ? 'var(--accent,#00C271)' : 'var(--line,#E8E3D7)'),
    background: active ? 'rgba(0,194,113,.08)' : 'transparent',
  });

  if (phase === 'pushed') {
    return (
      <div style={{ maxWidth: 460, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 42 }}>📲</div>
        <h2 style={{ fontFamily: 'Fraunces, serif' }}>Demande envoyée sur ton téléphone</h2>
        <p style={{ color: 'var(--muted,#6A776E)' }}>
          Valide le paiement <strong>{operator === 'airtel' ? 'Airtel Money' : 'Moov Money'}</strong> avec ton code secret — rien d'autre à composer.
          Ton accès <strong>Éli Premium</strong> s'active dès confirmation, et ton <strong>reçu officiel</strong> est généré automatiquement. 🌱
        </p>
        {onClose && <button onClick={onClose} style={{ marginTop: 12, padding: '12px 22px', borderRadius: 12, border: '1px solid var(--line,#E8E3D7)', background: 'transparent', cursor: 'pointer' }}>Fermer</button>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, padding: 22 }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', margin: '0 0 4px' }}>Passe à Éli Premium</h2>
      <p style={{ color: 'var(--muted,#6A776E)', marginTop: 0 }}>Choisis ton offre, paie en Mobile Money. Sans limite, Éli se souvient de toi.</p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '14px 0' }}>
        {plans.length === 0 && <p style={{ color: 'var(--muted,#6A776E)' }}>Chargement des offres…</p>}
        {plans.map((p) => (
          <button key={p.id} type="button" onClick={() => setPlanId(p.id)} style={card(planId === p.id)}>
            <div style={{ fontWeight: 700 }}>{p.label}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: 'var(--accent,#00C271)' }}>{fmt(p.amount_fcfa)}</div>
            <div style={{ fontSize: 12, color: 'var(--muted,#6A776E)' }}>FCFA · {p.duration_days} j</div>
          </button>
        ))}
      </div>

      <label style={{ fontSize: 13, fontWeight: 600 }}>Opérateur Mobile Money</label>
      <div style={{ display: 'flex', gap: 10, margin: '6px 0 14px' }}>
        {(['airtel', 'moov'] as const).map((op) => (
          <button key={op} type="button" onClick={() => setOperator(op)} style={card(operator === op)}>
            {op === 'airtel' ? 'Airtel Money' : 'Moov Money'}
          </button>
        ))}
      </div>

      <label htmlFor="msisdn" style={{ fontSize: 13, fontWeight: 600 }}>Ton numéro Mobile Money</label>
      <input id="msisdn" value={msisdn} onChange={(e) => setMsisdn(e.target.value)} inputMode="tel" placeholder="+241 …"
        style={{ width: '100%', minHeight: 46, borderRadius: 12, border: '1px solid var(--line,#E8E3D7)', padding: '0 14px', margin: '6px 0 6px', fontSize: 15 }} />
      <p style={{ fontSize: 12, color: 'var(--muted,#6A776E)', marginTop: 0 }}>Tu recevras une demande de paiement sur ce numéro — valide-la avec ton code. Aucun <em>*150#</em> à composer.</p>

      {msg && <p style={{ color: '#9B1C1C', fontSize: 13 }}>{msg}</p>}

      <button type="button" onClick={() => void pay()} disabled={phase === 'sending'}
        style={{ width: '100%', minHeight: 50, borderRadius: 13, border: 'none', cursor: 'pointer', marginTop: 8,
          background: 'linear-gradient(135deg,#F5B544,#FFD479)', color: '#231a06', fontWeight: 700, fontSize: 16 }}>
        {phase === 'sending' ? 'Envoi…' : 'Payer en Mobile Money'}
      </button>
      {onClose && <button onClick={onClose} style={{ width: '100%', marginTop: 8, padding: 12, border: 'none', background: 'none', color: 'var(--muted,#6A776E)', cursor: 'pointer' }}>Plus tard</button>}
    </div>
  );
}

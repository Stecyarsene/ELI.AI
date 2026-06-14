'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { CSSProperties, ReactNode } from 'react';
import { themeStyle } from '@/lib/theme/tokens';
import type { AdminDashboard } from '@/types/admin';
import { GrowthSparkline, Donut, BarList, fmtInt, fmtFcfa, fmtMin } from '@/components/admin/charts';

async function authedGet(path: string) {
  const { data } = await supabaseBrowser().auth.getSession();
  const r = await fetch(path, { headers: { authorization: `Bearer ${data.session?.access_token ?? ''}` } });
  if (r.status === 401 || r.status === 403) throw new Error('forbidden');
  if (!r.ok) throw new Error('error');
  return r.json();
}

const STATUS_COLORS: Record<string, string> = { vert: '#34D399', orange: '#FBBF24', rouge: '#F87171' };
const CHANNEL_COLORS: Record<string, string> = { site: '#4A90D9', app: '#F5B544', whatsapp: '#25D366' };
const STATUS_LABEL: Record<string, string> = { vert: 'Maîtrisé', orange: 'En cours', rouge: 'Zone rouge' };
const CHANNEL_LABEL: Record<string, string> = { site: 'Site web', app: 'Application', whatsapp: 'WhatsApp' };
const fmtDate = (s: string) => { try { return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }); } catch { return s; } };

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="adm-card" style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 12.5, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
      <strong style={{ fontSize: 28, lineHeight: 1.05 }}>{value}</strong>
      {sub ? <span style={{ fontSize: 12.5, opacity: 0.65 }}>{sub}</span> : null}
    </div>
  );
}
function Card({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className="adm-card" style={{ gridColumn: wide ? '1 / -1' : 'auto', display: 'grid', gap: 14 }} aria-label={title}>
      <h2 style={{ fontSize: 15, fontWeight: 700, opacity: 0.92 }}>{title}</h2>
      {children}
    </section>
  );
}

export default function AdminPage() {
  const [days, setDays] = useState(30);
  const q = useQuery<AdminDashboard>({ queryKey: ['admin-overview', days], queryFn: () => authedGet(`/api/admin/overview?days=${days}`), retry: false });
  const health = useQuery({ queryKey: ['admin-health'], queryFn: () => authedGet('/api/admin/health'), retry: false });

  const themed = themeStyle('national') as CSSProperties;
  const styleVars: CSSProperties = { ...themed, minHeight: '100vh', background: 'var(--bg-deep)', color: 'var(--ink)' };

  if (q.isError) {
    return (
      <div style={styleVars}>
        <main style={{ maxWidth: 520, margin: '0 auto', padding: '20vh 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40 }} aria-hidden="true">🛡️</div>
          <h1 style={{ marginTop: 12 }}>Accès réservé au fondateur</h1>
          <p role="alert" style={{ opacity: 0.75, marginTop: 8 }}>Cet espace est protégé (403). Connecte-toi avec ton compte super-admin.</p>
          <a href="/" className="adm-link" style={{ display: 'inline-block', marginTop: 16 }}>← Retour à l&apos;accueil</a>
        </main>
      </div>
    );
  }

  const d = q.data;
  const ov = d?.overview ?? null;
  const statusSegs = Object.entries(ov?.status ?? {}).map(([k, v]) => ({ label: STATUS_LABEL[k] ?? k, value: v, color: STATUS_COLORS[k] ?? '#9CA3AF' }));
  const channelSegs = Object.entries(ov?.channels ?? {}).map(([k, v]) => ({ label: CHANNEL_LABEL[k] ?? k, value: v, color: CHANNEL_COLORS[k] ?? '#9CA3AF' }));

  return (
    <div style={styleVars}>
      <a href="#adm-main" className="skip-link">Aller au contenu</a>
      <style>{`
        .adm-wrap{max-width:1180px;margin:0 auto;padding:24px}
        .adm-card{background:color-mix(in srgb, var(--ink) 4%, transparent);border:1px solid color-mix(in srgb, var(--ink) 12%, transparent);border-radius:16px;padding:18px}
        .adm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        .adm-grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:14px}
        @media(max-width:900px){.adm-grid{grid-template-columns:repeat(2,1fr)}.adm-grid2{grid-template-columns:1fr}}
        .adm-link{color:var(--gold-bright);text-decoration:underline;font-weight:600}
        .adm-sel{background:color-mix(in srgb, var(--ink) 6%, transparent);color:var(--ink);border:1px solid color-mix(in srgb, var(--ink) 18%, transparent);border-radius:10px;padding:8px 12px;font:inherit}
        .adm-table{width:100%;border-collapse:collapse;font-size:13.5px}
        .adm-table caption{text-align:left;opacity:.6;font-size:12px;margin-bottom:6px}
        .adm-table th,.adm-table td{text-align:left;padding:9px 10px;border-bottom:1px solid color-mix(in srgb, var(--ink) 8%, transparent)}
        .adm-table th{font-weight:600;opacity:.65;font-size:11.5px;text-transform:uppercase;letter-spacing:.04em}
        .adm-pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:600}
        .adm-empty{opacity:.6;font-size:13.5px;padding:8px 2px}
        .adm-sk{height:96px;border-radius:16px;background:color-mix(in srgb, var(--ink) 8%, transparent)}
      `}</style>

      <div className="adm-wrap">
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>🛡️ Centre de Commandement</h1>
            <p style={{ opacity: 0.6, fontSize: 13.5, marginTop: 4 }}>Vue globale Éli — National &amp; AEFE · données temps réel</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ opacity: 0.7 }}>Période</span>
            <select className="adm-sel" value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Période de la courbe de croissance">
              <option value={30}>30 jours</option>
              <option value={60}>60 jours</option>
              <option value={90}>90 jours</option>
            </select>
          </label>
        </header>

        <main id="adm-main">
          {q.isPending ? (
            <div className="adm-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="adm-sk" aria-hidden="true" />)}</div>
          ) : (
            <>
              {/* KPIs */}
              <div className="adm-grid">
                <Kpi label="Élèves" value={fmtInt(ov?.users.students ?? 0)} sub={`${fmtInt(ov?.users.paid_students ?? 0)} premium`} />
                <Kpi label="Enseignants" value={fmtInt(ov?.users.teachers ?? 0)} sub={`${fmtInt(ov?.users.paid_teachers ?? 0)} premium`} />
                <Kpi label="Revenus encaissés" value={fmtFcfa(ov?.revenue.total_fcfa ?? 0)} sub={`${fmtInt(ov?.revenue.success_count ?? 0)} paiements`} />
                <Kpi label="Taux de réussite" value={`${ov?.activity.success_rate ?? 0}%`} sub={`${fmtInt(ov?.activity.events_total ?? 0)} interactions`} />
                <Kpi label="Actifs (7 j)" value={fmtInt(ov?.activity.active_7d ?? 0)} sub="élèves engagés" />
                <Kpi label="Temps d'apprentissage" value={fmtMin(ov?.activity.minutes ?? 0)} sub={`${fmtInt(ov?.activity.sessions ?? 0)} sessions`} />
                <Kpi label="Comptes totaux" value={fmtInt(ov?.users.total_auth ?? 0)} sub={`${fmtInt(ov?.users.admins ?? 0)} admins`} />
                <Kpi label="Paiements en attente" value={fmtInt(ov?.revenue.pending_count ?? 0)} sub={`${fmtInt(ov?.revenue.failed_count ?? 0)} échoués`} />
              </div>

              {/* Croissance */}
              <div style={{ marginTop: 14 }}>
                <Card title={`📈 Croissance des inscriptions (${days} jours)`} wide>
                  <GrowthSparkline data={d?.signups ?? []} />
                </Card>
              </div>

              {/* Donuts statuts + canaux */}
              <div className="adm-grid2">
                <Card title="🚦 Statuts de progression">
                  {statusSegs.length ? <Donut segments={statusSegs} label="Statuts de progression" /> : <p className="adm-empty">Aucune progression enregistrée pour l&apos;instant.</p>}
                </Card>
                <Card title="📡 Canaux d'usage">
                  {channelSegs.length ? <Donut segments={channelSegs} label="Canaux d'usage" /> : <p className="adm-empty">Aucun canal actif pour l&apos;instant.</p>}
                </Card>
              </div>

              {/* Usage matière + piliers */}
              <div className="adm-grid2">
                <Card title="📚 Usage par matière">
                  {(d?.usageBySubject ?? []).length
                    ? <BarList items={(d?.usageBySubject ?? []).slice(0, 8).map((s) => ({ label: s.subject, value: s.events, hint: `${s.success_rate}% réussite` }))} />
                    : <p className="adm-empty">Pas encore d&apos;activité par matière.</p>}
                </Card>
                <Card title="🏛️ Temps par pilier">
                  {(d?.pillarUsage ?? []).length
                    ? <BarList unit=" min" items={(d?.pillarUsage ?? []).slice(0, 8).map((p) => ({ label: p.pillar, value: p.minutes, hint: `${fmtInt(p.sessions)} sessions`, color: 'var(--gold, #F5B544)' }))} />
                    : <p className="adm-empty">Pas encore de sessions par pilier.</p>}
                </Card>
              </div>

              {/* Zones rouges */}
              <div style={{ marginTop: 14 }}>
                <Card title="🔴 Zones rouges — concepts les plus difficiles" wide>
                  {(d?.redZones ?? []).length ? (
                    <table className="adm-table">
                      <caption>Concepts au plus faible taux de réussite (priorité pédagogique).</caption>
                      <thead><tr><th scope="col">Matière</th><th scope="col">Concept</th><th scope="col">Essais</th><th scope="col">Réussite</th></tr></thead>
                      <tbody>
                        {(d?.redZones ?? []).slice(0, 12).map((z, i) => (
                          <tr key={i}>
                            <td>{z.subject}</td><td>{z.concept}</td><td>{fmtInt(z.attempts)}</td>
                            <td><span className="adm-pill" style={{ background: 'color-mix(in srgb, #F87171 22%, transparent)', color: '#FCA5A5' }}>{z.success_rate}%</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="adm-empty">Aucune zone rouge détectée — tout est au vert. 🌱</p>}
                </Card>
              </div>

              {/* Transactions */}
              <div style={{ marginTop: 14 }}>
                <Card title="💳 Transactions récentes" wide>
                  {(d?.recentPayments ?? []).length ? (
                    <table className="adm-table">
                      <caption>50 derniers paiements et statut du reçu.</caption>
                      <thead><tr><th scope="col">Date</th><th scope="col">Transaction</th><th scope="col">Programme</th><th scope="col">Montant</th><th scope="col">Statut</th><th scope="col">Reçu</th></tr></thead>
                      <tbody>
                        {(d?.recentPayments ?? []).map((p) => {
                          const ok = p.status === 'success';
                          const col = ok ? '#34D399' : p.status === 'pending' ? '#FBBF24' : '#F87171';
                          return (
                            <tr key={p.tx_id}>
                              <td>{fmtDate(p.created_at)}</td>
                              <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{p.tx_id.slice(0, 14)}</td>
                              <td>{p.program === 'aefe' ? 'AEFE' : 'National'}</td>
                              <td>{fmtFcfa(p.amount_fcfa)}</td>
                              <td><span className="adm-pill" style={{ background: `color-mix(in srgb, ${col} 20%, transparent)`, color: col }}>{p.status}</span></td>
                              <td>{p.invoice_path ? <span style={{ color: '#34D399' }}>Émis ✅</span> : <span style={{ opacity: 0.55 }}>—</span>}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : <p className="adm-empty">Aucune transaction pour l&apos;instant.</p>}
                </Card>
              </div>

              {/* Santé système (best-effort) */}
              {!health.isError && !health.isPending && Array.isArray(health.data?.health) && health.data.health.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <Card title="🩺 Santé système" wide>
                    <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10, fontSize: 13.5 }}>
                      {(health.data.health as { metric: string; value: number; at: string }[]).map((h, i) => (
                        <li key={i} className="adm-card" style={{ padding: 12 }}><strong>{h.metric}</strong> : {fmtInt(h.value)} <small style={{ opacity: 0.6 }}>({h.at})</small></li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

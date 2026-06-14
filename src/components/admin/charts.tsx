'use client';
import type { SignupPoint } from '@/types/admin';

/* Formatage commun */
export const fmtInt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0));
export const fmtFcfa = (n: number) => `${fmtInt(n)} FCFA`;
export const fmtMin = (m: number) => {
  const x = Math.round(m || 0);
  return x >= 60 ? `${Math.floor(x / 60)} h ${x % 60} min` : `${x} min`;
};

/** Sparkline d'aire (croissance des inscriptions) — pur SVG, accessible. */
export function GrowthSparkline({ data, height = 96 }: { data: SignupPoint[]; height?: number }) {
  const W = 640, H = height, pad = 6;
  const series = data.map((d) => (d.students || 0) + (d.teachers || 0));
  const max = Math.max(1, ...series);
  const n = Math.max(1, series.length - 1);
  const x = (i: number) => pad + (i * (W - 2 * pad)) / n;
  const y = (v: number) => H - pad - (v * (H - 2 * pad)) / max;
  const pts = series.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = series.length
    ? `${pad},${H - pad} ${pts} ${x(series.length - 1).toFixed(1)},${H - pad}`
    : '';
  const total = series.reduce((a, b) => a + b, 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none"
      role="img" aria-label={`Inscriptions sur ${data.length} jours : ${total} au total`}>
      <defs>
        <linearGradient id="elig" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent, #00C271)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent, #00C271)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <polygon points={area} fill="url(#elig)" />}
      {series.length > 1 && <polyline points={pts} fill="none" stroke="var(--accent, #00C271)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
      {series.length === 1 && <circle cx={x(0)} cy={y(series[0])} r="3" fill="var(--accent, #00C271)" />}
    </svg>
  );
}

export interface Segment { label: string; value: number; color: string }

/** Donut segmenté (statuts / canaux) — stroke-dasharray, accessible. */
export function Donut({ segments, size = 132, label }: { segments: Segment[]; size?: number; label: string }) {
  const total = segments.reduce((a, s) => a + (s.value || 0), 0);
  const r = (size - 22) / 2, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img"
        aria-label={`${label} : ${segments.map((s) => `${s.label} ${s.value}`).join(', ')}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="color-mix(in srgb, currentColor 12%, transparent)" strokeWidth="14" />
        {total > 0 && segments.map((s, i) => {
          const frac = (s.value || 0) / total;
          const dash = `${(frac * C).toFixed(2)} ${C.toFixed(2)}`;
          const off = -acc * C;
          acc += frac;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="14"
              strokeDasharray={dash} strokeDashoffset={off} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="butt" />
          );
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="800" fill="currentColor">{fmtInt(total)}</text>
      </svg>
      <ul style={{ listStyle: 'none', display: 'grid', gap: 6, fontSize: 13 }}>
        {segments.map((s, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: 'inline-block' }} />
            <span style={{ opacity: 0.85 }}>{s.label}</span>
            <strong style={{ marginLeft: 'auto' }}>{fmtInt(s.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface BarItem { label: string; value: number; hint?: string; color?: string }

/** Liste de barres horizontales (usage matière / piliers). */
export function BarList({ items, unit = '' }: { items: BarItem[]; unit?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value || 0));
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'grid', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{it.label}</span>
            <span style={{ opacity: 0.7 }}>{fmtInt(it.value)}{unit}{it.hint ? ` · ${it.hint}` : ''}</span>
          </div>
          <div role="img" aria-label={`${it.label} : ${it.value}${unit}`} style={{ height: 8, borderRadius: 999, background: 'color-mix(in srgb, currentColor 10%, transparent)', overflow: 'hidden' }}>
            <div style={{ width: `${((it.value || 0) / max) * 100}%`, height: '100%', background: it.color || 'var(--accent, #00C271)', borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

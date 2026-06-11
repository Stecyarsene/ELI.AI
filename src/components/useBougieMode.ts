'use client';
import { useEffect, useState } from 'react';

/** ÉLI — Mode Bougie dynamique (MAD §2.2). Écoute navigator.connection, bascule la classe
 *  `html.bougie` (kill-switch CSS) sans recharger la page. Heuristique RTT en secours. */
type NetInfo = { effectiveType?: string; saveData?: boolean; addEventListener?: (t: string, cb: () => void) => void; removeEventListener?: (t: string, cb: () => void) => void };

export function useBougieMode() {
  const [active, setActive] = useState(false);
  const [manual, setManual] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('eli.bougie') : null;
    if (saved !== null) { setManual(saved === '1'); setActive(saved === '1'); return; }
    const conn = (navigator as Navigator & { connection?: NetInfo }).connection;
    const evaluate = () => {
      if (manual !== null) return;
      const slow = conn ? ['slow-2g', '2g', '3g'].includes(conn.effectiveType ?? '') || conn.saveData === true : false;
      setActive(slow);
    };
    if (conn) { evaluate(); conn.addEventListener?.('change', evaluate); return () => conn.removeEventListener?.('change', evaluate); }
    let cancelled = false;
    (async () => {
      const rtts: number[] = [];
      for (let i = 0; i < 3; i++) { const t = performance.now(); await fetch('/api/health').catch(() => {}); rtts.push(performance.now() - t); }
      rtts.sort((a, b) => a - b);
      if (!cancelled && manual === null && rtts[1] > 800) setActive(true);
    })();
    return () => { cancelled = true; };
  }, [manual]);

  useEffect(() => {
    document.documentElement.classList.toggle('bougie', active);
    if (manual !== null) localStorage.setItem('eli.bougie', active ? '1' : '0');
  }, [active, manual]);

  return { active, toggle: () => { setManual(!active); setActive(!active); } };
}

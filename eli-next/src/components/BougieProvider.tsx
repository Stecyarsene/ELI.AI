'use client';
import { create } from 'zustand';
import { useEffect, type ReactNode } from 'react';

/** Mode Bougie (MAD §2.2) : Network Information API → heuristique RTT → bascule manuelle persistée. */
interface BougieState { active: boolean; manual: boolean | null; set(active: boolean, manual?: boolean): void; }
export const useBougie = create<BougieState>((set) => ({
  active: false, manual: null,
  set: (active, manual) => set((s) => ({ active, manual: manual === undefined ? s.manual : manual })),
}));

type NetInfo = { effectiveType?: string; saveData?: boolean; addEventListener?: (t: string, cb: () => void) => void };

export default function BougieProvider({ children }: { children: ReactNode }) {
  const { active, manual, set } = useBougie();

  useEffect(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('eli.bougie') : null;
    if (saved !== null) { set(saved === '1', saved === '1'); return; }

    const conn = (navigator as Navigator & { connection?: NetInfo }).connection;
    const evaluate = () => {
      if (manual !== null) return;
      const slow = conn ? ['slow-2g', '2g', '3g'].includes(conn.effectiveType ?? '') || conn.saveData === true : false;
      set(slow);
    };
    if (conn) { evaluate(); conn.addEventListener?.('change', evaluate); return; }

    // Heuristique de secours (Safari/iOS) : RTT médian de 3 sondes /api/health
    void (async () => {
      const rtts: number[] = [];
      for (let i = 0; i < 3; i++) {
        const t = performance.now();
        await fetch('/api/health').catch(() => undefined);
        rtts.push(performance.now() - t);
      }
      rtts.sort((a, b) => a - b);
      if (manual === null && rtts[1] > 800) set(true);
    })();
  }, [manual, set]);

  useEffect(() => {
    document.documentElement.classList.toggle('bougie', active);
    if (manual !== null) localStorage.setItem('eli.bougie', active ? '1' : '0');
  }, [active, manual]);

  return (
    <>
      <button type="button" aria-pressed={active} onClick={() => set(!active, true)}
        style={{ position: 'fixed', top: 12, right: 12, zIndex: 50, minWidth: 44, minHeight: 44 }}>
        {active ? '🕯️ Mode Bougie' : '🌙'}
      </button>
      {children}
    </>
  );
}

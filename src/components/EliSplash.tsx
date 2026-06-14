'use client';
import type { CSSProperties } from 'react';
import type { Program } from '@/types/db';
import { themeStyle } from '@/lib/theme/tokens';

/** Splash de reprise Éli : logo « pousse » animé, thématisé selon le programme repris. */
export default function EliSplash({ program, label }: { program?: Program; label?: string }) {
  const themed = program ? (themeStyle(program) as CSSProperties) : undefined;
  return (
    <div className="eli-splash" style={themed} role="status" aria-label="Chargement d'Éli">
      <div className="eli-splash-stage">
        <svg className="eli-splash-mark" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <circle className="eli-splash-ring" cx="50" cy="50" r="44"
            stroke="var(--gold, #F5B544)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray="60 220" opacity="0.9" />
          <g className="eli-splash-leaf">
            <path d="M50 86 V44" stroke="var(--accent, #00C271)" strokeWidth="5" strokeLinecap="round" />
            <path d="M50 56 C50 40 38 34 30 32 C30 48 40 56 50 56 Z" fill="var(--accent-soft, #34D399)" />
            <path d="M50 50 C50 34 62 28 70 26 C70 42 60 50 50 50 Z" fill="var(--accent, #00C271)" />
          </g>
        </svg>
        <div className="eli-splash-word">Éli</div>
        {label ? <div className="eli-splash-sub">{label}</div> : null}
      </div>
    </div>
  );
}

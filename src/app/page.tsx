'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { recallProgram, rememberProgram, pathForProgram, normalizeProgram } from '@/lib/program';
import EliSplash from '@/components/EliSplash';
import type { Program } from '@/types/db';

/**
 * Accueil Éli (T1 — Reprise directe).
 * 1) Indice instantané : localStorage 'eli:prog' → splash thématisé + redirection.
 * 2) Vérité serveur : session → profiles.program (prioritaire si différent).
 * 3) Aucun des deux (ou délai dépassé) → hub d'aiguillage (maquette).
 * Le splash respecte Mode Bougie / reduced-motion (cf. globals.css).
 */
export default function Home() {
  const forceHub = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('choose');
  const hint = typeof window !== 'undefined' && !forceHub ? recallProgram() : null;
  const [phase, setPhase] = useState<'resolving' | 'hub'>(forceHub ? 'hub' : 'resolving');
  const [program, setProgram] = useState<Program | null>(hint);

  useEffect(() => {
    if (forceHub) return; // « Changer d'espace » : on reste sur le hub, pas de reprise auto.
    let done = false;
    const go = (p: Program) => { if (done) return; done = true; rememberProgram(p); window.location.replace(pathForProgram(p)); };

    // Filet de sécurité : si rien n'a résolu, on bascule sur le hub (ou l'indice local).
    const fallback = setTimeout(() => {
      if (done) return;
      if (hint) go(hint);
      else { done = true; setPhase('hub'); }
    }, 1400);

    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) {
          // Pas de session : on suit l'indice local s'il existe, sinon hub.
          clearTimeout(fallback);
          if (hint) go(hint); else { if (!done) { done = true; setPhase('hub'); } }
          return;
        }
        const { data: profile } = await sb
          .from('profiles').select('program').eq('id', session.user.id).maybeSingle();
        const prog = normalizeProgram((profile as { program?: string } | null)?.program);
        clearTimeout(fallback);
        if (prog) { setProgram(prog); go(prog); }
        else if (hint) go(hint);
        else { if (!done) { done = true; setPhase('hub'); } }
      } catch {
        clearTimeout(fallback);
        if (hint) go(hint); else { if (!done) { done = true; setPhase('hub'); } }
      }
    })();

    return () => clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'hub') {
    return (
      <iframe
        src="/maquettes/hub.html"
        title="Éli — Accueil"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none' }}
      />
    );
  }
  return <EliSplash program={program ?? undefined} label="On reprend là où tu t'étais arrêté…" />;
}

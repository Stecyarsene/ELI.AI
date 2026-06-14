'use client';
import { useEffect } from 'react';
import { rememberProgram, forgetProgram } from '@/lib/program';
import type { Program } from '@/types/db';

/**
 * T1 — Monté sur /nationale et /aefe :
 *  • mémorise le programme courant (reprise directe au prochain accès),
 *  • expose un lien discret « Changer d'espace » qui repart vers le hub (?choose=1)
 *    en oubliant l'indice local pour ne pas y être renvoyé automatiquement.
 */
export default function RememberProgram({ program }: { program: Program }) {
  useEffect(() => { rememberProgram(program); }, [program]);

  return (
    <a
      className="eli-switch"
      href="/?choose=1"
      onClick={() => forgetProgram()}
      aria-label="Changer d'espace"
      title="Changer d'espace"
    >
      ↔ Changer d&apos;espace
    </a>
  );
}

'use client';
import { useEffect } from 'react';
import { rememberProgram } from '@/lib/program';
import type { Program } from '@/types/db';

/**
 * T1 — Monté sur /nationale et /aefe :
 *  • mémorise le programme courant (reprise directe au prochain accès),
 *  • expose un lien discret « Changer d'espace » qui repart vers le hub (?choose=1)
 *    en oubliant l'indice local pour ne pas y être renvoyé automatiquement.
 */
export default function RememberProgram({ program }: { program: Program }) {
  // Mémorise le programme courant (reprise directe au prochain accès). Aucun élément visible :
  // le lien « Changer d'espace » a été retiré (il surchargeait l'écran). Le changement d'espace
  // reste possible via l'URL « /?choose=1 ».
  useEffect(() => { rememberProgram(program); }, [program]);
  return null;
}

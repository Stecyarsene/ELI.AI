'use client';
import { type CSSProperties } from 'react';
import { themeStyle } from '@/lib/theme/tokens';
import TeacherAssistant from '@/components/TeacherAssistant';
import type { Program } from '@/types/db';

/**
 * Espace ENSEIGNANT bi-programme (national / aefe).
 * Vision : un tableau de bord simple + un assistant IA qui aide le PROF (gain de temps).
 * Pas de suivi/tracking d'eleves (non prevu) — uniquement l'aide a l'enseignement.
 */
export default function TeacherSpace({ params }: { params: { program: string } }) {
  const program: Program = params.program === 'aefe' ? 'aefe' : 'national';
  return (
    <div style={{ ...(themeStyle(program) as CSSProperties), minHeight: '100vh', padding: 24, display: 'grid', gap: 24 }}>
      <header>
        <p style={{ opacity: 0.8, margin: 0 }}>Espace enseignant · {program === 'aefe' ? 'Programme AEFE' : 'Programme national'}</p>
        <h1 style={{ margin: '4px 0 0' }}>Bonjour, professeur 👋</h1>
        <p style={{ marginTop: 8, opacity: 0.85 }}>Éli vous fait gagner du temps : générez fiches, contrôles, diapositives et progressions, alignés au programme officiel. 🌱</p>
      </header>

      <section aria-label="Assistant IA enseignant" style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Assistant IA</h2>
        <TeacherAssistant program={program} />
      </section>
    </div>
  );
}

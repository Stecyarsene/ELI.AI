'use client';
import { useState, type CSSProperties } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { classesRepo } from '@/data/teacherRepo';
import { themeStyle } from '@/lib/theme/tokens';
import TeacherAssistant from '@/components/TeacherAssistant';
import type { Program } from '@/types/db';

/**
 * Espace ENSEIGNANT bi-programme (national / aefe) : tableau de bord du prof.
 * Deux faces : l'assistant IA qui l'aide à enseigner + le suivi de ses classes.
 */
export default function TeacherSpace({ params }: { params: { program: string } }) {
  const program: Program = params.program === 'aefe' ? 'aefe' : 'national';
  const qc = useQueryClient();
  const classes = useQuery({ queryKey: ['teacher-classes'], queryFn: () => classesRepo.listMine(), retry: false });

  const [name, setName] = useState('');
  const [classKey, setClassKey] = useState('');
  const [subject, setSubject] = useState('');
  const [creating, setCreating] = useState(false);

  async function createClass() {
    if (creating || !name.trim() || !classKey.trim()) return;
    setCreating(true);
    try {
      await classesRepo.create({ program, class_key: classKey.trim(), subject: subject.trim() || null, name: name.trim() });
      setName(''); setClassKey(''); setSubject('');
      await qc.invalidateQueries({ queryKey: ['teacher-classes'] });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ ...(themeStyle(program) as CSSProperties), minHeight: '100vh', padding: 24, display: 'grid', gap: 28 }}>
      <header>
        <p style={{ opacity: 0.8, margin: 0 }}>Espace enseignant · {program === 'aefe' ? 'Programme AEFE' : 'Programme national'}</p>
        <h1 style={{ margin: '4px 0 0' }}>Bonjour, professeur 👋</h1>
        <p style={{ marginTop: 8, opacity: 0.85 }}>Éli vous fait gagner du temps : générez fiches, contrôles, diapos et progressions, alignés au programme. 🌱</p>
      </header>

      {/* 1) Assistant IA enseignant */}
      <section aria-label="Assistant IA enseignant" style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Assistant IA</h2>
        <TeacherAssistant program={program} />
      </section>

      {/* 2) Mes classes + création */}
      <section aria-label="Mes classes" style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Mes classes</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, alignItems: 'end' }}>
          <label style={{ display: 'grid', gap: 4 }}>
            <span>Nom de la classe</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Terminale D — Lycée Léon Mba" style={{ minHeight: 44 }} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span>Niveau</span>
            <input value={classKey} onChange={(e) => setClassKey(e.target.value)} placeholder="ex. terminale" style={{ minHeight: 44 }} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span>Matière (option)</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="ex. Mathématiques" style={{ minHeight: 44 }} />
          </label>
          <button type="button" onClick={() => void createClass()} disabled={creating || !name.trim() || !classKey.trim()} style={{ minHeight: 44, fontWeight: 700 }}>
            {creating ? 'Création…' : 'Créer la classe'}
          </button>
        </div>

        {classes.isPending ? (
          <p className="sk sk-line" aria-hidden="true" style={{ width: 240 }} />
        ) : (classes.data ?? []).length === 0 ? (
          <p style={{ opacity: 0.85 }}>Aucune classe pour l&apos;instant — créez-en une ci-dessus pour partager un code avec vos élèves.</p>
        ) : (
          <ul style={{ display: 'grid', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
            {(classes.data ?? []).map((c) => (
              <li key={c.id} className="tile" style={{ padding: 16, borderRadius: 12, border: '1px solid var(--accent)' }}>
                <strong>{c.name}</strong>
                <p style={{ margin: '4px 0 0', opacity: 0.85 }}>
                  {c.class_key}{c.serie ? ` · ${c.serie}` : ''}{c.subject ? ` · ${c.subject}` : ''} — code élève : <code>{c.join_code}</code>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3) Suivi de classe (MVP : à enrichir en v2) */}
      <section aria-label="Suivi de classe" style={{ display: 'grid', gap: 8 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Suivi de classe</h2>
        <p style={{ opacity: 0.85 }}>
          Bientôt : les notions où vos élèves bloquent le plus, leur progression et leur activité. Rattachez d&apos;abord vos élèves via le code de la classe.
        </p>
      </section>
    </div>
  );
}

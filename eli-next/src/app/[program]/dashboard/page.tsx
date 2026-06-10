'use client';
import { useQuery } from '@tanstack/react-query';
import { profileRepo, progressRepo } from '@/data/repositories';
import { themeStyle } from '@/lib/theme/tokens';
import ChatStream from '@/components/ChatStream';
import type { Program } from '@/types/db';
import type { CSSProperties } from 'react';

/** Dashboard de classe bi-programme : données réelles (repository), skeletons à dimensions réservées (CLS=0). */
export default function Dashboard({ params }: { params: { program: string } }) {
  const raw = params.program;
  const program: Program = raw === 'aefe' ? 'aefe' : 'national';

  const profile = useQuery({ queryKey: ['profile'], queryFn: () => profileRepo.me() });
  const progress = useQuery({ queryKey: ['progress'], queryFn: () => progressRepo.listMine(), enabled: !!profile.data });

  return (
    <div style={themeStyle(program) as CSSProperties}>
      <header style={{ padding: 24 }}>
        {profile.isPending ? (
          <p className="sk sk-line" style={{ width: 280 }} aria-hidden="true" />
        ) : profile.data ? (
          <h1>Bonjour {profile.data.first_name} 👋 — {profile.data.class_key}{profile.data.serie ? ` · ${profile.data.serie}` : ''}</h1>
        ) : (
          <h1>Bienvenue sur Éli — connecte-toi pour retrouver ton espace</h1>
        )}
      </header>

      <section aria-label="Mes matières" className="subj-grid" style={{ padding: 24 }}>
        {progress.isPending || profile.isPending
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="sk sk-tile" aria-hidden="true" />)
          : (progress.data ?? []).map((p) => (
              <article key={p.subject} className="tile">
                <h2 style={{ fontSize: 16 }}>{p.subject}</h2>
                <p>Statut : {p.status}{p.last_chapter ? ` · ${p.last_chapter}` : ''}</p>
              </article>
            ))}
        {!progress.isPending && !profile.isPending && (progress.data ?? []).length === 0 && (
          <p>Aucune progression encore — commence une session avec Éli ci-dessous.</p>
        )}
      </section>

      <ChatStream />
    </div>
  );
}

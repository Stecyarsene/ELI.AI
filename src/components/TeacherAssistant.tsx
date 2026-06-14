'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { resourcesRepo } from '@/data/teacherRepo';
import type { Program, TeacherKind } from '@/types/db';

const KINDS: Array<{ key: TeacherKind; label: string }> = [
  { key: 'fiche', label: 'Fiche de cours' },
  { key: 'controle', label: 'Contrôle + corrigé' },
  { key: 'diapos', label: 'Diapositives' },
  { key: 'progression', label: 'Progression' },
];

/** Assistant IA du professeur : génère fiche / contrôle / diapos / progression ancrés sur le programme. */
export default function TeacherAssistant({ program }: { program: Program }) {
  const [kind, setKind] = useState<TeacherKind>('fiche');
  const [classKey, setClassKey] = useState('');
  const [serie, setSerie] = useState('');
  const [subject, setSubject] = useState('');
  const [notion, setNotion] = useState('');
  const [message, setMessage] = useState('');
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function generate() {
    if (busy || !classKey.trim() || !subject.trim()) return;
    setBusy(true);
    setOut('');
    setSaved(false);
    try {
      const { data } = await supabaseBrowser().auth.getSession();
      const res = await fetch('/api/ai/teacher', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session?.access_token ?? ''}` },
        body: JSON.stringify({
          program,
          classKey: classKey.trim(),
          serie: serie.trim() || undefined,
          subject: subject.trim(),
          notion: notion.trim() || undefined,
          kind,
          message: message.trim() || undefined,
        }),
      });
      if (res.status === 401 || res.status === 403) {
        setOut("Accès réservé aux enseignants. Demande l'activation de ton compte professeur. 🌱");
        return;
      }
      if (!res.ok) {
        setOut('Génération indisponible pour le moment — réessaie dans un instant.');
        return;
      }
      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      let buf = '';
      let acc = '';
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith('data:')) continue;
          const payload = t.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const j = JSON.parse(payload) as {
              candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
            };
            const parts = j.candidates?.[0]?.content?.parts;
            if (Array.isArray(parts)) {
              for (const part of parts) {
                if (typeof part.text === 'string') {
                  acc += part.text;
                  setOut(acc);
                }
              }
            }
          } catch {
            /* fragment SSE incomplet : on ignore et on attend la suite */
          }
        }
      }
      setOut(acc || '…');
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!out.trim()) return;
    await resourcesRepo.save({
      program,
      class_key: classKey.trim() || null,
      subject: subject.trim() || null,
      notion: notion.trim() || null,
      kind,
      title: `${subject.trim() || 'Matière'} — ${notion.trim() || KINDS.find((k) => k.key === kind)?.label}`,
      content: out,
    });
    setSaved(true);
  }

  return (
    <section aria-label="Assistant IA enseignant" style={{ display: 'grid', gap: 12 }}>
      <div role="group" aria-label="Type de matériel" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {KINDS.map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={() => setKind(k.key)}
            aria-pressed={kind === k.key}
            style={{
              minHeight: 44,
              padding: '0 14px',
              borderRadius: 10,
              border: '1px solid var(--accent)',
              background: kind === k.key ? 'var(--accent)' : 'transparent',
              color: kind === k.key ? 'var(--bg-deep)' : 'var(--ink)',
              fontWeight: 600,
            }}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Classe</span>
          <input value={classKey} onChange={(e) => setClassKey(e.target.value)} placeholder="ex. terminale" style={{ minHeight: 44 }} />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Série (option)</span>
          <input value={serie} onChange={(e) => setSerie(e.target.value)} placeholder="ex. D" style={{ minHeight: 44 }} />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Matière</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="ex. Mathématiques" style={{ minHeight: 44 }} />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Notion (option)</span>
          <input value={notion} onChange={(e) => setNotion(e.target.value)} placeholder="ex. Logarithme népérien" style={{ minHeight: 44 }} />
        </label>
      </div>

      <label style={{ display: 'grid', gap: 4 }}>
        <span>Précisions (option)</span>
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="ex. niveau difficile, 1h, axe sur les équations" style={{ minHeight: 44 }} />
      </label>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => void generate()} disabled={busy || !classKey.trim() || !subject.trim()} style={{ minHeight: 44, minWidth: 160, fontWeight: 700 }}>
          {busy ? 'Génération…' : 'Générer'}
        </button>
        {out && !busy && (
          <button type="button" onClick={() => void save()} style={{ minHeight: 44, minWidth: 120 }}>
            {saved ? 'Enregistré ✓' : 'Enregistrer'}
          </button>
        )}
      </div>

      {out && (
        <pre aria-live="polite" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: 16, borderRadius: 12, background: 'var(--bg-deep)', border: '1px solid var(--accent)', maxHeight: 480, overflow: 'auto' }}>
          {out}
        </pre>
      )}
    </section>
  );
}

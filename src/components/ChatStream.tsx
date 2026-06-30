'use client';
import { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

/** Logo Éli officiel (cercle vert, « É » doré, flamme, 3 points) — présent partout dans le chat. */
function EliMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" style={{ flex: 'none' }}>
      <defs>
        <radialGradient id="elm1" cx="38%" cy="32%" r="70%"><stop offset="0%" stopColor="#388E3C" /><stop offset="100%" stopColor="#1B5E20" /></radialGradient>
        <linearGradient id="elm2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFE082" /><stop offset="100%" stopColor="#FFA000" /></linearGradient>
        <linearGradient id="elm3" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stopColor="#FFA000" /><stop offset="60%" stopColor="#FFD54F" /><stop offset="100%" stopColor="#FFFDE7" /></linearGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="url(#elm1)" />
      <rect x="61" y="44" width="13" height="108" rx="6" fill="url(#elm2)" /><rect x="61" y="44" width="78" height="13" rx="6" fill="url(#elm2)" /><rect x="61" y="91" width="60" height="13" rx="6" fill="url(#elm2)" /><rect x="61" y="139" width="78" height="13" rx="6" fill="url(#elm2)" />
      <path d="M147 44C145 34,141 24,147 12C150 5,156 1,156 1C156 1,167 10,164 24C162 32,156 38,156 44Z" fill="url(#elm3)" />
      <circle cx="82" cy="172" r="4.5" fill="url(#elm2)" /><circle cx="100" cy="176" r="5.5" fill="url(#elm2)" /><circle cx="118" cy="172" r="4.5" fill="url(#elm2)" />
    </svg>
  );
}

type Msg = { who: 'eli' | 'user'; text: string };

/** Chat Éli — vrai streaming Gemini (SSE parsé), logo présent, « Parler » (voix) ou « Écrire », Éli répond à voix haute. */
export default function ChatStream() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = useRef<any>(null);

  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight }); }, [messages]);

  /** Lecture vocale d'Éli (fr-FR), coupée en Mode Bougie / si désactivée. */
  function speak(text: string) {
    try {
      if (!voiceOn || typeof window === 'undefined' || !window.speechSynthesis) return;
      if (document.documentElement.classList.contains('bougie')) return;
      const u = new SpeechSynthesisUtterance(text.replace(/\[\/?VOIX\]/g, ''));
      u.lang = 'fr-FR'; u.rate = 1.02;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch { /* TTS indisponible : silencieux */ }
  }

  async function send(raw?: string) {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    setInput(''); setBusy(true);
    setMessages((m) => [...m, { who: 'user', text }]);
    try {
      const { data } = await supabaseBrowser().auth.getSession();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session?.access_token ?? ''}` },
        body: JSON.stringify({ message: text }),
      });
      if (res.status === 402) {
        setMessages((m) => [...m, { who: 'eli', text: 'Passe à Éli Premium pour continuer avec moi 🌱' }]);
        return;
      }
      if (!res.ok || !res.body) {
        setMessages((m) => [...m, { who: 'eli', text: 'Petit souci de connexion, réessaie 🌱' }]);
        return;
      }
      // Streaming progressif : on parse le SSE de Gemini et on remplit le DERNIER message d'Éli au fil de l'eau.
      setMessages((m) => [...m, { who: 'eli', text: '' }]);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '', acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop() ?? '';
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith('data:')) continue;
          const payload = t.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const j = JSON.parse(payload) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
            const parts = j.candidates?.[0]?.content?.parts;
            if (Array.isArray(parts)) {
              for (const p of parts) if (typeof p.text === 'string') acc += p.text;
              setMessages((m) => { const c = [...m]; c[c.length - 1] = { who: 'eli', text: acc }; return c; });
            }
          } catch { /* fragment partiel : ignoré */ }
        }
      }
      if (acc) speak(acc);
      else setMessages((m) => { const c = [...m]; c[c.length - 1] = { who: 'eli', text: '…' }; return c; });
    } finally { setBusy(false); }
  }

  /** « Parler » : reconnaissance vocale fr-FR (Web Speech). Remplit le champ et envoie. */
  function toggleListen() {
    try {
      const w = window as unknown as { webkitSpeechRecognition?: new () => unknown; SpeechRecognition?: new () => unknown };
      const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!Ctor) { alert('La saisie vocale n’est pas disponible sur ce navigateur. Tu peux écrire à Éli.'); return; }
      if (listening && recogRef.current) { recogRef.current.stop(); return; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r: any = new (Ctor as any)();
      recogRef.current = r;
      r.lang = 'fr-FR'; r.interimResults = false; r.maxAlternatives = 1;
      r.onresult = (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
        const said = e.results[0][0].transcript;
        setListening(false); void send(said);
      };
      r.onend = () => setListening(false);
      r.onerror = () => setListening(false);
      setListening(true); r.start();
    } catch { setListening(false); }
  }

  return (
    <section aria-label="Conversation avec Éli" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <EliMark size={38} />
        <div>
          <strong style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17 }}>Éli</strong>
          <div style={{ fontSize: 12, color: 'var(--accent, #00C271)' }}>● en ligne · ton professeur</div>
        </div>
        <button type="button" onClick={() => setVoiceOn((v) => !v)} aria-pressed={voiceOn}
          title={voiceOn ? 'Couper la voix d’Éli' : 'Activer la voix d’Éli'}
          style={{ marginLeft: 'auto', minHeight: 36, minWidth: 36, borderRadius: 10, border: '1px solid var(--line,#E8E3D7)', background: 'transparent', cursor: 'pointer' }}>
          {voiceOn ? '🔊' : '🔈'}
        </button>
      </div>

      <div ref={bodyRef} role="log" aria-live="polite" aria-relevant="additions"
        style={{ minHeight: 240, maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: 4 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <EliMark size={30} />
            <p style={{ background: 'rgba(0,194,113,.10)', borderRadius: 14, padding: '10px 14px', margin: 0 }}>
              Bonjour ! Je suis Éli 🌱. Pose-moi ta question, ou clique sur 🎤 pour me parler.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: m.who === 'user' ? 'row-reverse' : 'row' }}>
            {m.who === 'eli'
              ? <EliMark size={30} />
              : <span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gold,#F5B544)', color: '#231a06', display: 'grid', placeItems: 'center', fontWeight: 700, flex: 'none', fontSize: 12 }}>Moi</span>}
            <p style={{ margin: 0, maxWidth: '80%', padding: '10px 14px', borderRadius: 14,
              background: m.who === 'eli' ? 'rgba(0,194,113,.10)' : 'var(--accent,#00C271)',
              color: m.who === 'eli' ? 'inherit' : '#04140d' }}>
              {m.text || '…'}
            </p>
          </div>
        ))}
        {busy && messages[messages.length - 1]?.who === 'user' && (
          <p className="sk sk-line" aria-hidden="true" style={{ width: '55%' }} />
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={toggleListen} aria-pressed={listening}
          title="Parler à Éli" style={{ minHeight: 46, minWidth: 46, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: listening ? '#E0695A' : 'var(--accent,#00C271)', color: '#fff', fontSize: 18 }}>
          {listening ? '⏺' : '🎤'}
        </button>
        <label htmlFor="chat-in" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Écris à Éli</label>
        <input id="chat-in" value={input} placeholder="Écris à Éli, ou parle 🎤" onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void send(); }} autoComplete="off"
          style={{ flex: 1, minHeight: 46, borderRadius: 12, border: '1px solid var(--line,#E8E3D7)', padding: '0 14px', fontSize: 15 }} />
        <button type="button" onClick={() => void send()} disabled={busy}
          style={{ minWidth: 46, minHeight: 46, borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--gold,#F5B544)', color: '#231a06', fontWeight: 700, fontSize: 17 }}>➤</button>
      </div>
    </section>
  );
}

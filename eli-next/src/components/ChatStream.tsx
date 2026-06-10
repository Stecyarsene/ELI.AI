'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

/** Chat Éli accessible (MAD §2.3) : role="log" + aria-live="polite", annonce par message complet. */
export default function ChatStream() {
  const [messages, setMessages] = useState<Array<{ who: 'eli' | 'user'; text: string }>>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {
    const text = input.trim();
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
      if (res.status === 402) { setMessages((m) => [...m, { who: 'eli', text: 'Active ton abonnement pour continuer avec moi 🌱' }]); return; }
      const reader = res.body?.getReader();
      let acc = '';
      const dec = new TextDecoder();
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
      }
      setMessages((m) => [...m, { who: 'eli', text: acc || '…' }]);
    } finally { setBusy(false); }
  }

  return (
    <section aria-label="Conversation avec Éli">
      <div role="log" aria-live="polite" aria-relevant="additions" style={{ minHeight: 240 }}>
        {messages.map((m, i) => (
          <p key={i}><strong>{m.who === 'eli' ? 'Éli' : 'Toi'} :</strong> {m.text}</p>
        ))}
        {busy && <p className="sk sk-line" aria-hidden="true" style={{ width: '60%' }} />}
      </div>
      <label htmlFor="chat-in">Écris à Éli</label>
      <input id="chat-in" value={input} onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') void send(); }} autoComplete="off" style={{ minHeight: 44 }} />
      <button type="button" onClick={() => void send()} disabled={busy} style={{ minWidth: 44, minHeight: 44 }}>Envoyer</button>
    </section>
  );
}

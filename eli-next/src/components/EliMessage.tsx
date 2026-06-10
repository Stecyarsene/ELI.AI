'use client';
import { useEffect, useState } from 'react';
import { splitVoice } from '@/lib/llm/voiceSplit';
import { useEliVoice } from './useEliVoice';

/** Affiche une réponse d'Éli : il PARLE d'abord la réplique vocale, puis le texte écrit apparaît.
 *  Le texte écrit ne se révèle qu'une fois la voix lancée (cohérence audio→texte). */
export function EliMessage({ full }: { full: string }) {
  const { speech, written } = splitVoice(full);
  const { speak, muted, toggleMute, speaking } = useEliVoice();
  const [showWritten, setShowWritten] = useState(false);

  useEffect(() => {
    // Éli parle la réplique ; le texte écrit se dévoile dès le début de la parole (ou tout de suite si muet).
    let revealed = false;
    const reveal = () => { if (!revealed) { revealed = true; setShowWritten(true); } };
    speak(speech, { onBoundary: reveal, onEnd: reveal });
    const fallback = setTimeout(reveal, muted ? 0 : 350); // garantit l'affichage même sans events
    return () => clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  return (
    <div className="eli-message">
      <div className="eli-speech" aria-live="polite">
        <button className="eli-voice-toggle" onClick={toggleMute} aria-label={muted ? 'Activer la voix' : 'Couper la voix'}>
          {muted ? '🔇' : speaking ? '🔊…' : '🔊'}
        </button>
        <p className="eli-speech-text">{speech}</p>
      </div>
      {showWritten && written !== speech && (
        <div className="eli-written">{written}</div>
      )}
    </div>
  );
}

'use client';
/**
 * ÉLI — Voix-d'abord (Web Speech API en secours, prêt pour TTS premium).
 * Stratégie : Éli PARLE la réplique [VOIX], et le texte écrit se révèle pendant qu'il parle.
 * Auto avec coupure possible (mute) ; respecte les préférences et l'absence d'API.
 */
import { useCallback, useRef, useState } from 'react';

export interface SpeakOptions { onBoundary?: (charIndex: number) => void; onEnd?: () => void; }

export function useEliVoice() {
  const [muted, setMuted] = useState<boolean>(() => {
    try { return localStorage.getItem('eli.voice.muted') === '1'; } catch { return false; }
  });
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const toggleMute = useCallback(() => {
    setMuted((m) => { const n = !m; try { localStorage.setItem('eli.voice.muted', n ? '1' : '0'); } catch {} 
      if (n && typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); return n; });
  }, []);

  /** Premium hook : si une route /api/tts existe et qu'une clé est configurée, on l'utiliserait ici.
   *  Par défaut, Web Speech API (gratuite, hors-ligne, instantanée). */
  const speak = useCallback((text: string, opts: SpeakOptions = {}) => {
    if (muted || !text) { opts.onEnd?.(); return; }
    if (typeof speechSynthesis === 'undefined') { opts.onEnd?.(); return; } // dégradation : pas de voix → texte direct
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR'; u.rate = 1.0; u.pitch = 1.05;
    const frVoice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('fr'));
    if (frVoice) u.voice = frVoice;
    u.onstart = () => setSpeaking(true);
    u.onboundary = (e) => opts.onBoundary?.(e.charIndex);
    u.onend = () => { setSpeaking(false); opts.onEnd?.(); };
    u.onerror = () => { setSpeaking(false); opts.onEnd?.(); };
    utterRef.current = u;
    speechSynthesis.speak(u);
  }, [muted]);

  const stop = useCallback(() => { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); setSpeaking(false); }, []);

  return { muted, toggleMute, speaking, speak, stop };
}

/** ÉLI — Sépare la réplique orale [VOIX]…[/VOIX] du développement écrit. Robuste si la balise manque. */
export function splitVoice(full: string): { speech: string; written: string } {
  const m = full.match(/\[VOIX\]([\s\S]*?)\[\/VOIX\]/i);
  if (m) {
    const speech = m[1].trim();
    const written = full.replace(m[0], '').trim();
    return { speech, written: written || speech };
  }
  // Pas de balise : on prend la 1ère phrase comme voix, le reste comme écrit (dégradation propre).
  const firstSentence = (full.match(/^.*?[.!?](\s|$)/) || [full])[0].trim();
  return { speech: firstSentence, written: full.trim() };
}

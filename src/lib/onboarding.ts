/** T8 — Onboarding par le chat. Logique pure : détecter la classe/série énoncée
 *  par l'élève et juger s'il est « égaré » (a besoin d'être guidé) ou s'il sait
 *  déjà ce qu'il veut (ne pas l'interrompre). */

export type Intent = 'navigate_class' | 'guide' | 'normal';

const STRIP = (t: string) =>
  String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

/** Déduit la classe (class_key curriculum) mentionnée dans un texte libre, sinon null. */
export function detectClassKey(text: string): string | null {
  const t = STRIP(text);
  if (/\bterminale?\b|\btle?\b|\bterm\b/.test(t)) return 'terminale';
  if (/\b(premiere|1ere|1re)\b/.test(t)) return '1ere';
  if (/\b(seconde|2nde|2de)\b/.test(t)) return '2nde';
  if (/\b(troisieme|3eme|3e)\b/.test(t)) return '3e';
  if (/\b(quatrieme|4eme|4e)\b/.test(t)) return '4e';
  if (/\b(cinquieme|5eme|5e)\b/.test(t)) return '5e';
  if (/\b(sixieme|6eme|6e)\b/.test(t)) return '6e';
  if (/\bcm2\b/.test(t)) return 'cm2';
  if (/\bcm1\b/.test(t)) return 'cm1';
  if (/\bce2\b/.test(t)) return 'ce2';
  if (/\bce1\b/.test(t)) return 'ce1';
  if (/\bcp\s?2\b/.test(t)) return 'cp2';
  if (/\bcp\s?1\b|\bcp\b/.test(t)) return 'cp1';
  return null;
}

/** Déduit la série (A1, A2, B, C, D, E) mentionnée, sinon null. */
export function detectSerie(text: string): string | null {
  const t = STRIP(text);
  const m = t.match(/\bserie\s*([abcde][12]?)\b/) || t.match(/\bterminale?\s+([abcde][12]?)\b/) || t.match(/\b(a1|a2|[bcde])\b/);
  if (!m) return null;
  const raw = m[1].toUpperCase();
  return ['A1', 'A2', 'B', 'C', 'D', 'E'].includes(raw) ? raw : null;
}

/** L'élève semble-t-il égaré / demande-t-il de l'aide pour démarrer ? */
export function looksLost(text: string): boolean {
  const t = STRIP(text);
  if (!t) return true;
  if (/^(bonjour|salut|coucou|hello|bonsoir|hey|cc)\b/.test(t)) return true;
  return /\b(aide|aidez|aide moi|perdu|je sais pas|sais pas quoi|comment (ca|ça) marche|par ou commencer|par où|que faire|c est quoi eli|qu est ce que|commencer|sais pas)\b/.test(t)
    || /\?$/.test(t) && t.split(/\s+/).length <= 3 && !/\b(quoi|qui|quand|ou|comment|pourquoi)\b/.test(t);
}

/**
 * Décide l'aiguillage d'onboarding à partir d'un message :
 *  - 'navigate_class' : l'élève a nommé sa classe → on l'emmène à son menu.
 *  - 'guide' : 1er contact / égaré → afficher les boutons d'aide.
 *  - 'normal' : il sait ce qu'il veut → laisser le tuteur répondre.
 * @param firstContact true si c'est l'ouverture du chat (aucun échange encore).
 */
export function onboardingIntent(text: string, firstContact: boolean): {
  intent: Intent; classKey: string | null; serie: string | null;
} {
  const classKey = detectClassKey(text);
  const serie = detectSerie(text);
  if (classKey) return { intent: 'navigate_class', classKey, serie };
  // Guider seulement si l'élève est égaré (salutation, message vide, demande d'aide).
  // Une vraie question, même au premier contact, n'est PAS interrompue.
  if (looksLost(text) || (firstContact && !text.trim())) return { intent: 'guide', classKey: null, serie };
  return { intent: 'normal', classKey: null, serie };
}

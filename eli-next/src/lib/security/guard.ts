/**
 * ÉLI — BOUCLIER CYBER (Safety Layer LLM).
 * Inspecte CHAQUE message avant l'appel au LLM : bloque les injections de prompt,
 * les tentatives d'exfiltration (clés/SQL) et le contenu inapproprié pour mineurs.
 * Defense in depth : ce filtre s'ajoute au system prompt durci et au rate limiting.
 */
export type GuardVerdict =
  | { ok: true }
  | { ok: false; reason: 'prompt_injection' | 'secret_exfiltration' | 'sql_probe' | 'minor_safety'; matched: string };

const INJECTION = [
  /ignore (all |the |your )?(previous|above|prior) (instructions|prompts?)/i,
  /disregard (your|the|all) (rules|instructions|system prompt)/i,
  /\byou are now\b.*\b(dan|developer mode|jailbreak|unfiltered)\b/i,
  /\b(reveal|print|show|dump|repeat) (me )?(your )?(system prompt|instructions|prompt)\b/i,
  /\bact as\b.*\b(no restrictions|without filter|evil)\b/i,
  /oublie (toutes )?(les )?(instructions|consignes) (précédentes|ci-dessus)/i,
  /ignore (tes|les) (règles|consignes|instructions)/i,
];
const SECRET_EXFIL = [
  /\b(service[_-]?role|api[_-]?key|secret[_-]?key|supabase[_-]?key|env|process\.env|\.env)\b/i,
  /\b(database|db) (password|credentials?|connection string|url)\b/i,
  /\b(clé|mot de passe) (de la )?(base de données|api|secrète)\b/i,
];
const SQL_PROBE = [
  /\b(union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+\w+\s+set|select\s+\*\s+from)\b/i,
  /(--|\/\*|;\s*drop|or\s+1\s*=\s*1)/i,
];
// Sécurité mineurs : sujets sexuels/violents/auto-destructeurs explicites adressés à un public scolaire.
const MINOR_SAFETY = [
  /\b(sexual|porn|nude|nudes|explicit sexual)\b/i,
  /\b(self[- ]?harm|suicide method|how to (kill|hurt)|fabriquer (une arme|une bombe))\b/i,
  /\b(contenu sexuel|pornograph|drogue dure|comment me faire du mal)\b/i,
];

function scan(text: string, patterns: RegExp[]): string | null {
  for (const re of patterns) { const m = text.match(re); if (m) return m[0]; }
  return null;
}

export function inspectUserMessage(message: string): GuardVerdict {
  if (typeof message !== 'string' || message.length === 0 || message.length > 4000) {
    return { ok: false, reason: 'prompt_injection', matched: 'invalid_length' };
  }
  let m: string | null;
  if ((m = scan(message, INJECTION))) return { ok: false, reason: 'prompt_injection', matched: m };
  if ((m = scan(message, SECRET_EXFIL))) return { ok: false, reason: 'secret_exfiltration', matched: m };
  if ((m = scan(message, SQL_PROBE))) return { ok: false, reason: 'sql_probe', matched: m };
  if ((m = scan(message, MINOR_SAFETY))) return { ok: false, reason: 'minor_safety', matched: m };
  return { ok: true };
}

/** Inspecte aussi la SORTIE du LLM : ultime filet anti-fuite de secret/SQL avant envoi à l'élève. */
export function inspectAssistantOutput(text: string): GuardVerdict {
  let m: string | null;
  if ((m = scan(text, SECRET_EXFIL))) return { ok: false, reason: 'secret_exfiltration', matched: m };
  if ((m = scan(text, [/postgres(ql)?:\/\/[^\s]+/i, /eyJ[A-Za-z0-9_-]{20,}/]))) return { ok: false, reason: 'secret_exfiltration', matched: m ?? 'token' };
  return { ok: true };
}

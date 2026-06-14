import type { Program } from '@/types/db';

/** Clé de reprise directe (T1) : programme de la dernière session/visite. */
export const PROG_KEY = 'eli:prog';

export function normalizeProgram(v: unknown): Program | null {
  return v === 'national' || v === 'aefe' ? v : null;
}

export function rememberProgram(p: Program): void {
  try { localStorage.setItem(PROG_KEY, p); } catch { /* offline / SSR-safe */ }
}

export function recallProgram(): Program | null {
  try { return normalizeProgram(localStorage.getItem(PROG_KEY)); } catch { return null; }
}

export function forgetProgram(): void {
  try { localStorage.removeItem(PROG_KEY); } catch { /* noop */ }
}

export function pathForProgram(p: Program): string {
  return p === 'aefe' ? '/aefe' : '/nationale';
}

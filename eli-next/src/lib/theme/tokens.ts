import type { Program } from '@/types/db';
/** Design tokens — un composant, deux identités (MAD §2.1). Contrastes audités WCAG AA. */
export const THEMES: Record<Program, Record<string, string>> = {
  national: {
    '--bg': '#04140D', '--bg-deep': '#020806', '--ink': '#FFF8EC',
    '--accent': '#00C271', '--accent-soft': '#34D399', '--gold': '#F5B544', '--gold-bright': '#FFD479',
  },
  aefe: {
    '--bg': '#F7F5F0', '--bg-deep': '#FFFFFF', '--ink': '#0D1B3E',
    '--accent': '#1565C0', '--accent-soft': '#4A90D9', '--gold': '#F5B544', '--gold-bright': '#B8860B',
  },
};
export function themeStyle(program: Program): Record<string, string> { return THEMES[program]; }

/** ÉLI — Préférences anti-FOUC (doc 7, pilier 3). Script à inliner dans <head> AVANT tout rendu. */
export const ANTI_FOUC_SNIPPET = `(function(){try{
  var p=JSON.parse(localStorage.getItem('eli.prefs')||'{}');
  var h=document.documentElement;
  if(p.bougie)h.classList.add('bougie');
  if(p.theme==='dark')h.classList.add('dark');
  if(p.dyslexia)h.classList.add('font-dyslexia');
  if(p.highContrast)h.classList.add('high-contrast');
}catch(e){}})();`;

export interface Prefs { bougie?: boolean; theme?: 'light' | 'dark'; dyslexia?: boolean; highContrast?: boolean; }
export function savePrefs(p: Prefs): void { try { localStorage.setItem('eli.prefs', JSON.stringify(p)); } catch { /* offline ok */ } }
export function loadPrefs(): Prefs { try { return JSON.parse(localStorage.getItem('eli.prefs') || '{}'); } catch { return {}; } }

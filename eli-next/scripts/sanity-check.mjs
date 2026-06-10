#!/usr/bin/env node
/* ÉLI — Sanity Check pré-déploiement (doc 10). Vérifie config, secrets, latence endpoints tiers.
   Usage : node scripts/sanity-check.mjs   (codes de sortie : 0 = OK, 1 = bloquant) */
import { existsSync, readFileSync } from 'node:fs';

let fail = 0;
const ok = (m) => console.log('✔ ' + m);
const ko = (m) => { console.error('✖ ' + m); fail++; };

// 1. Mode données live obligatoire
process.env.NEXT_PUBLIC_DATA_MODE === 'live' ? ok('DATA_MODE=live') : ko('NEXT_PUBLIC_DATA_MODE doit valoir "live" en prod');

// 2. Aucun secret préfixé NEXT_PUBLIC_ dans l'environnement
const leaked = Object.keys(process.env).filter((k) => /^NEXT_PUBLIC_/.test(k) && /(SECRET|SERVICE_ROLE|GEMINI|RESEND|WEBHOOK|TOKEN)/.test(k));
leaked.length ? ko('secrets exposés via NEXT_PUBLIC_: ' + leaked.join(',')) : ok('aucun secret préfixé NEXT_PUBLIC_');

// 3. .env ignoré par git
existsSync('.gitignore') && /\.env/.test(readFileSync('.gitignore', 'utf8')) ? ok('.env ignoré par git') : ko('.gitignore ne protège pas .env');

// 4. Latence des endpoints tiers (< 200 ms) — best-effort, non bloquant si réseau restreint
async function ping(name, url) {
  if (!url) { console.log('· ' + name + ' non configuré (ignoré)'); return; }
  const t = Date.now();
  try {
    const c = new AbortController(); const to = setTimeout(() => c.abort(), 3000);
    await fetch(url, { signal: c.signal }).catch(() => {});
    clearTimeout(to);
    const ms = Date.now() - t;
    ms < 200 ? ok(`${name} ${ms}ms`) : console.log(`· ${name} ${ms}ms (>200ms, à surveiller)`);
  } catch { console.log('· ' + name + ' injoignable (réseau)'); }
}
await ping('Supabase', process.env.NEXT_PUBLIC_SUPABASE_URL);
await ping('Upstash', process.env.UPSTASH_REDIS_REST_URL);

console.log(fail ? `\n✖ SANITY CHECK : ${fail} problème(s) bloquant(s).` : '\n✔ SANITY CHECK : pile prête pour la mise en ligne.');
process.exit(fail ? 1 : 0);

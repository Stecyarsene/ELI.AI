// Verrou anti-mock (MAD §2.1) : un build de production avec DATA_MODE=mock est interdit.
const mode = process.env.NEXT_PUBLIC_DATA_MODE ?? 'live';
if (process.env.NODE_ENV === 'production' && mode !== 'live') {
  console.error('✖ BUILD BLOQUÉ : NEXT_PUBLIC_DATA_MODE doit être "live" en production.');
  process.exit(1);
}
console.log(`✔ Verrou anti-mock : DATA_MODE=${mode} accepté (NODE_ENV=${process.env.NODE_ENV ?? 'development'}).`);

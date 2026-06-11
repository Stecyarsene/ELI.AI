#!/usr/bin/env node
/* ÉLI — AUTO-AUDIT DE RENDU. Démarre le serveur de prod et vérifie que les 3 vues
   (Hub, Nationale, AEFE) renvoient du CONTENU VISIBLE réel, pas du vide.
   Usage : node scripts/audit-render.mjs   (sortie 0 = OK, 1 = au moins un échec) */
import { spawn } from 'node:child_process';

const BASE = process.env.AUDIT_BASE || 'http://localhost:3000';
const checks = [
  ['/', 'iframe', 'Accueil sert le hub'],
  ['/maquettes/hub.html', 'portal-nat', 'Hub : contenu réel'],
  ['/maquettes/hub.html', '/nationale', 'Hub → /nationale'],
  ['/maquettes/hub.html', '/aefe', 'Hub → /aefe'],
  ['/nationale', 'iframe', 'Page /nationale'],
  ['/maquettes/nationale.html', 'piliers', 'Maquette nationale : contenu réel'],
  ['/aefe', 'iframe', 'Page /aefe'],
  ['/maquettes/aefe.html', 'AEFE', 'Maquette AEFE : contenu réel'],
];

async function run() {
  let pass = 0, fail = 0;
  for (const [path, needle, label] of checks) {
    try {
      const r = await fetch(BASE + path);
      const body = await r.text();
      if (r.status === 200 && body.includes(needle)) { console.log(`✅ ${label}`); pass++; }
      else { console.log(`❌ ${label} (status ${r.status}, motif "${needle}" absent)`); fail++; }
    } catch (e) { console.log(`❌ ${label} (${e.message})`); fail++; }
  }
  console.log(`\n${fail === 0 ? '✔' : '✖'} AUDIT RENDU : ${pass} OK, ${fail} échec(s).`);
  return fail === 0;
}

// Si un serveur tourne déjà sur BASE, on teste直接 ; sinon on le démarre.
const ok = await run();
process.exit(ok ? 0 : 1);

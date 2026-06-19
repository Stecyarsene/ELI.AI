/* Éli — Service Worker (P3 Mode Bougie, socle hors-ligne).
 * STRATÉGIE SÛRE PAR DÉFAUT : network-first partout. L'EN LIGNE GAGNE TOUJOURS — donc aucune
 * version figée possible tant qu'il y a du réseau. Le cache ne sert QUE de repli hors-ligne.
 * - /api/* et toute requête non-GET : NON interceptés (passent au réseau, échouent naturellement hors-ligne).
 * - Coquille statique (maquettes + bridge) : précachée à l'install pour un rendu hors-ligne.
 * - Cache versionné + purge des anciens à l'activation. skipWaiting + clients.claim : mises à jour rapides.
 * Kill-switch : bump CACHE_VERSION (purge tout) ; ou unregister côté client (window.__eliKillSW__()).
 */
var CACHE_VERSION = 'eli-shell-v1';
var SHELL = [
  '/maquettes/nationale.html',
  '/maquettes/aefe.html',
  '/maquettes/hub.html',
  '/maquettes/eli-bridge.js',
  '/maquettes/eli-wa.js',
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function (c) {
      // addAll échouerait en bloc si une seule URL manque -> on tolère les absences (add individuel).
      return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (e) {
  if (e.data === 'eli-skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;                 // jamais d'interception des écritures
  var url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;  // tiers (CDN, Supabase, Gemini, ElevenLabs) : réseau direct
  if (url.pathname.indexOf('/api/') === 0) return;   // API : réseau direct, jamais de réponse figée

  // NETWORK-FIRST : on tente le réseau, on met à jour le cache de coquille, repli cache si hors-ligne.
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok && res.type === 'basic') {
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy).catch(function () {}); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        // Navigation hors-ligne sans correspondance exacte : on sert la coquille la plus proche.
        if (req.mode === 'navigate') {
          return caches.match('/maquettes/nationale.html').then(function (shell) {
            return shell || new Response('Hors-ligne — reconnecte-toi pour charger Éli.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
          });
        }
        return new Response('', { status: 504 });
      });
    })
  );
});

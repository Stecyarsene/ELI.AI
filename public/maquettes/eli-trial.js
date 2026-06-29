/* eli-trial.js — Essais de découverte Éli (avant passage en Premium payant).
   Règle produit : un nouveau visiteur teste un nombre limité de fois, puis Éli l'invite à passer en Premium (offre payante).
     • Éli Junior : 3 essais   • Les Piliers : 3 essais   • Mon Avenir : 1 essai
   100% autonome : aucune dépendance, ne casse rien. Si le module échoue, on n'empêche jamais l'usage (fail-open).
   Le décompte est local (localStorage) — c'est une découverte ; l'application connectée garde la vérité côté serveur. */
(function () {
  'use strict';
  if (window.EliTrial) return;

  var LIMITS = { junior: 3, piliers: 3, avenir: 1 };
  var LABELS = { junior: 'Éli Junior', piliers: 'Les Piliers', avenir: 'Mon Avenir' };
  var KEY = 'eli.trial.v1';
  var WA = 'https://wa.me/24177374043?text=' + encodeURIComponent('Salut Éli ! Je veux continuer 🌱');
  var SIGNUP = '/nationale'; // espace élève (création de compte / reprise)

  var LOGO = '<svg width="56" height="56" viewBox="0 0 200 200"><defs><radialGradient id="elt1" cx="38%" cy="32%" r="70%"><stop offset="0%" stop-color="#388E3C"/><stop offset="100%" stop-color="#1B5E20"/></radialGradient><linearGradient id="elt2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFE082"/><stop offset="100%" stop-color="#FFA000"/></linearGradient><linearGradient id="elt3" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#FFA000"/><stop offset="60%" stop-color="#FFD54F"/><stop offset="100%" stop-color="#FFFDE7"/></linearGradient></defs><circle cx="100" cy="100" r="86" fill="url(#elt1)"/><rect x="61" y="44" width="13" height="108" rx="6" fill="url(#elt2)"/><rect x="61" y="44" width="78" height="13" rx="6" fill="url(#elt2)"/><rect x="61" y="91" width="60" height="13" rx="6" fill="url(#elt2)"/><rect x="61" y="139" width="78" height="13" rx="6" fill="url(#elt2)"/><path d="M147 44C145 34,141 24,147 12C150 5,156 1,156 1C156 1,167 10,164 24C162 32,156 38,156 44Z" fill="url(#elt3)"/><circle cx="82" cy="172" r="4.5" fill="url(#elt2)" opacity=".9"/><circle cx="100" cy="176" r="5.5" fill="url(#elt2)"/><circle cx="118" cy="172" r="4.5" fill="url(#elt2)" opacity=".9"/></svg>';

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  function remaining(branch) {
    if (!(branch in LIMITS)) return Infinity;
    return Math.max(0, LIMITS[branch] - (load()[branch] || 0));
  }

  // Consomme un essai. Renvoie true si autorisé, false si épuisé (et affiche la porte d'inscription).
  function use(branch) {
    if (!(branch in LIMITS)) return true;            // branche inconnue → ne bloque jamais
    var st = load(), used = st[branch] || 0, lim = LIMITS[branch];
    if (used >= lim) { gate(branch); return false; }
    st[branch] = used + 1; save(st);
    var left = lim - st[branch];
    toast(LABELS[branch] + ' · essai ' + st[branch] + '/' + lim + (left === 0 ? ' — dernier !' : ' · ' + left + ' restant' + (left > 1 ? 's' : '')));
    return true;
  }

  function toast(msg) {
    try {
      var t = document.getElementById('eliTrialToast');
      if (!t) {
        t = document.createElement('div'); t.id = 'eliTrialToast';
        t.style.cssText = 'position:fixed;top:18px;left:50%;transform:translateX(-50%) translateY(-16px);z-index:100000;background:#0B3D2E;color:#fff;font-family:system-ui,sans-serif;font-size:13.5px;font-weight:600;padding:11px 18px;border-radius:12px;box-shadow:0 14px 40px rgba(0,0,0,.35);opacity:0;transition:.3s;pointer-events:none';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      requestAnimationFrame(function () { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
      clearTimeout(t._h); t._h = setTimeout(function () { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(-16px)'; }, 2600);
    } catch (e) {}
  }

  function gate(branch) {
    try {
      if (document.getElementById('eliTrialGate')) return;
      var ov = document.createElement('div'); ov.id = 'eliTrialGate';
      ov.style.cssText = 'position:fixed;inset:0;z-index:100001;background:rgba(2,8,6,.82);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:22px;font-family:system-ui,sans-serif';
      ov.innerHTML =
        '<div style="max-width:420px;width:100%;background:linear-gradient(160deg,#0A1E15,#04140D);border:1px solid rgba(245,181,68,.22);border-radius:24px;padding:30px 26px;text-align:center;color:#FFF8EC;box-shadow:0 30px 80px rgba(0,0,0,.6)">' +
          '<div style="display:flex;justify-content:center;margin-bottom:14px">' + LOGO + '</div>' +
          '<h2 style="font-family:Georgia,serif;font-size:23px;margin:0 0 10px">Tu as bien exploré ' + LABELS[branch] + ' 🌟</h2>' +
          '<p style="font-size:14.5px;line-height:1.6;color:rgba(255,248,236,.75);margin:0 0 22px">Tes essais de découverte sont terminés. Passe à <strong style="color:#FFD479">Éli Premium</strong> pour continuer sans limite : Éli se souvient de toi, de tes progrès et reprend là où tu t\'es arrêté.</p>' +
          '<button id="eliGateSignup" style="width:100%;background:linear-gradient(120deg,#F5B544,#FFD479);color:#231a06;font-weight:700;font-size:15.5px;border:none;border-radius:13px;padding:14px;cursor:pointer;font-family:inherit">Passer à Éli Premium →</button>' +
          '<button id="eliGateWa" style="width:100%;margin-top:10px;background:#25D366;color:#04140d;font-weight:700;font-size:15px;border:none;border-radius:13px;padding:13px;cursor:pointer;font-family:inherit">💬 En savoir plus sur WhatsApp</button>' +
          '<button id="eliGateClose" style="width:100%;margin-top:12px;background:none;border:none;color:rgba(255,248,236,.5);font-size:13px;cursor:pointer;font-family:inherit">Plus tard</button>' +
        '</div>';
      document.body.appendChild(ov);
      document.getElementById('eliGateSignup').onclick = function () { try { (window.top || window).location.href = SIGNUP; } catch (e) { location.href = SIGNUP; } };
      document.getElementById('eliGateWa').onclick = function () { window.open(WA, '_blank', 'noopener'); };
      document.getElementById('eliGateClose').onclick = function () { ov.remove(); };
    } catch (e) {}
  }

  window.EliTrial = { use: use, remaining: remaining, reset: function () { save({}); } };
})();

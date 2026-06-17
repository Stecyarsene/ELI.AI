/* eli-wa.js — Présence WhatsApp permanente + invitation web, autonome.
   À inclure sur les interfaces qui ne chargent pas eli-bridge.js (enseignant, parent, hub).
   Ultra-défensif : ne double jamais (garde par id), n'échoue jamais silencieusement. */
(function () {
  'use strict';
  if (window.__eliWaStandalone__) return;
  window.__eliWaStandalone__ = true;

  var WA_NUM = '24177374043'; // repli ; remplacé par /api/config si disponible
  function loadNum() {
    try {
      fetch('/api/config').then(function (r) { return r.json(); })
        .then(function (c) { if (c && c.whatsappBot) WA_NUM = String(c.whatsappBot).replace(/[^0-9]/g, ''); })
        .catch(function () {});
    } catch (e) {}
  }
  function waLink(text) {
    var n = (WA_NUM || '').replace(/[^0-9]/g, '');
    return 'https://wa.me/' + n + (text ? ('?text=' + encodeURIComponent(text)) : '');
  }
  function inApp() {
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
      if (window.navigator && window.navigator.standalone) return true;
    } catch (e) {}
    return false;
  }
  window.addEventListener('beforeinstallprompt', function (e) { try { e.preventDefault(); window.__eliDeferredInstall__ = e; } catch (x) {} });
  function toast(msg) {
    try {
      var t = document.createElement('div');
      t.style.cssText = 'position:fixed;left:18px;bottom:84px;z-index:10001;max-width:260px;background:#0B3D2E;color:#fff;font-family:inherit;font-size:13px;line-height:1.45;padding:12px 14px;border-radius:12px;box-shadow:0 14px 40px rgba(0,0,0,.3)';
      t.textContent = msg; document.body.appendChild(t);
      setTimeout(function () { try { t.remove(); } catch (e) {} }, 6000);
    } catch (e) {}
  }
  function mount() {
    try {
      if (document.getElementById('eliWaFab') || !document.body) return;
      var app = inApp();
      var wrap = document.createElement('div');
      wrap.id = 'eliWaFab';
      wrap.style.cssText = 'position:fixed;left:18px;bottom:18px;z-index:10000;font-family:inherit';
      var panel = document.createElement('div');
      panel.style.cssText = 'display:none;margin-bottom:10px;background:#fff;border-radius:16px;box-shadow:0 18px 48px rgba(0,0,0,.22);padding:14px;max-width:248px';
      var head = app ? '' : '<div style="font-size:12.5px;color:#5C6A60;margin:0 2px 10px;line-height:1.45">Retrouve Éli partout : sur WhatsApp et dans l\'application.</div>';
      var waBtn = '<a href="' + waLink('Salut Éli ! Je veux continuer sur WhatsApp 🌱') + '" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#25D366;color:#04140D;text-decoration:none;font-weight:800;padding:12px 13px;border-radius:12px;font-size:14px">💬 Continuer sur WhatsApp</a>';
      var dlBtn = app ? '' : '<button id="eliInstallBtn2" type="button" style="margin-top:9px;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:#0B3D2E;color:#fff;border:none;cursor:pointer;font-family:inherit;font-weight:700;padding:12px 13px;border-radius:12px;font-size:14px">📲 Télécharger l\'application</button>';
      panel.innerHTML = head + waBtn + dlBtn;
      var fab = document.createElement('button');
      fab.type = 'button'; fab.setAttribute('aria-label', 'Éli sur WhatsApp et application');
      fab.style.cssText = 'display:flex;align-items:center;gap:8px;background:#25D366;color:#04140D;border:none;cursor:pointer;font-family:inherit;font-weight:800;padding:12px 16px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.25);font-size:14px';
      fab.innerHTML = '💬 <span style="white-space:nowrap">Éli partout</span>';
      fab.onclick = function () { panel.style.display = (panel.style.display === 'none' ? 'block' : 'none'); };
      wrap.appendChild(panel); wrap.appendChild(fab); document.body.appendChild(wrap);
      var ib = document.getElementById('eliInstallBtn2');
      if (ib) ib.onclick = function () {
        var dp = window.__eliDeferredInstall__;
        if (dp && dp.prompt) { try { dp.prompt(); } catch (e) {} }
        else { toast("Pour installer Éli : menu du navigateur → « Ajouter à l'écran d'accueil » 📲"); }
      };
    } catch (e) {}
  }
  loadNum();
  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(mount, 500);
  else window.addEventListener('DOMContentLoaded', function () { setTimeout(mount, 500); });
})();

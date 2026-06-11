/* ÉLI — PONT RÉEL (chargé dans les maquettes). Branche le chat + la connexion sur le vrai moteur.
   Surcharge sendChat / loginReturn / submitSignup APRÈS le JS de la maquette.
   Le programme (national|aefe) est lu depuis l'attribut data-program du script. */
(function () {
  'use strict';
  var SELF = document.currentScript;
  var PROGRAM = (SELF && SELF.getAttribute('data-program')) || 'national';
  var SUPABASE_URL = '';
  var SUPABASE_ANON = '';

  var sbPromise = null;
  function getSb() {
    if (sbPromise) return sbPromise;
    sbPromise = fetch('/api/config').then(function (r) { return r.json(); }).then(function (cfg) {
      SUPABASE_URL = cfg.supabaseUrl; SUPABASE_ANON = cfg.supabaseAnon;
      return import('https://esm.sh/@supabase/supabase-js@2');
    }).then(function (m) {
      return m.createClient(SUPABASE_URL, SUPABASE_ANON);
    });
    return sbPromise;
  }

  // ── Voix-d'abord ──
  function splitVoice(full) {
    var m = full.match(/\[VOIX\]([\s\S]*?)\[\/VOIX\]/i);
    if (m) return { speech: m[1].trim(), written: (full.replace(m[0], '').trim()) || m[1].trim() };
    var first = (full.match(/^.*?[.!?](\s|$)/) || [full])[0].trim();
    return { speech: first, written: full.trim() };
  }
  function speak(text) {
    try {
      if (window.__eliMuted__ || typeof speechSynthesis === 'undefined' || !text) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'fr-FR'; u.rate = 1.0; u.pitch = 1.05;
      var vs = speechSynthesis.getVoices();
      var fr = vs.filter(function (v) { return v.lang && v.lang.indexOf('fr') === 0; })[0];
      if (fr) u.voice = fr;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function authedFetch(path, opts) {
    return getSb().then(function (client) {
      return client.auth.getSession().then(function (res) {
        var token = res && res.data && res.data.session ? res.data.session.access_token : '';
        opts = opts || {};
        opts.headers = Object.assign({ 'content-type': 'application/json', authorization: 'Bearer ' + token }, opts.headers || {});
        return fetch(path, opts);
      });
    });
  }

  // Récupère/ajoute une bulle Éli dans le flux de chat de la maquette
  function ensureEliBubble() {
    var stream = document.getElementById('chatStream');
    if (!stream) return null;
    var b = document.createElement('div');
    b.className = 'chat-msg eli msg eli';
    b.style.cssText = 'margin:8px 0;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.06);white-space:pre-wrap';
    b.textContent = '…';
    stream.appendChild(b);
    stream.scrollTop = stream.scrollHeight;
    return b;
  }

  function extractText(raw) {
    var out = '';
    raw.split('\n').forEach(function (line) {
      line = line.trim();
      if (line.indexOf('data:') === 0) {
        try {
          var j = JSON.parse(line.slice(5).trim());
          var parts = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
          if (parts) parts.forEach(function (p) { if (p.text) out += p.text; });
        } catch (e) {}
      }
    });
    return out;
  }

  // ── CHAT RÉEL ──
  function realSendChat() {
    var inp = document.getElementById('chatInput');
    if (!inp) return;
    var txt = inp.value.trim();
    if (!txt) return;
    if (typeof pushMsg === 'function') { try { pushMsg(txt, 'user'); } catch (e) {} }
    inp.value = '';
    var bubble = ensureEliBubble();
    var focus = window.__eliFocusSubject__ || undefined;

    authedFetch('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message: txt, focusSubject: focus }) })
      .then(function (res) {
        if (res.status === 401) { if (bubble) bubble.textContent = "Connecte-toi d'abord pour discuter avec moi 🌱 (bouton « S'inscrire »)."; return; }
        if (res.status === 402) { if (bubble) bubble.textContent = 'Active ton abonnement pour continuer 🌱'; if (typeof showPaywall === 'function') setTimeout(showPaywall, 400); return; }
        if (res.status === 403) { if (bubble) bubble.textContent = "Ton profil n'est pas encore complet. Termine ton inscription 🌱"; return; }
        if (!res.ok || !res.body) { if (bubble) bubble.textContent = "Je n'ai pas pu répondre, réessaie."; return; }
        var reader = res.body.getReader(); var dec = new TextDecoder(); var acc = '';
        function pump() {
          return reader.read().then(function (r) {
            if (r.done) {
              var full = extractText(acc) || '…';
              var parts = splitVoice(full);
              speak(parts.speech);
              if (bubble) bubble.textContent = (parts.written && parts.written !== parts.speech) ? ('🔊 ' + parts.speech + '\n\n' + parts.written) : ('🔊 ' + parts.speech);
              var st = document.getElementById('chatStream'); if (st) st.scrollTop = st.scrollHeight;
              return;
            }
            acc += dec.decode(r.value, { stream: true });
            return pump();
          });
        }
        return pump();
      })
      .catch(function () { if (bubble) bubble.textContent = "Connexion interrompue, réessaie."; });
  }

  // ── CONNEXION RÉELLE ──
  function findInput(scopeId, types) {
    var scope = document.getElementById(scopeId) || document;
    for (var i = 0; i < types.length; i++) {
      var el = scope.querySelector('input[type="' + types[i] + '"]');
      if (el) return el;
    }
    return null;
  }
  function realLogin() {
    var email = findInput('formLogin', ['email', 'tel']);
    var pass = findInput('formLogin', ['password']);
    var emailVal = email ? email.value.trim() : '';
    var passVal = pass ? pass.value : '';
    if (!emailVal || !passVal) { alert('Entre ton email et ton mot de passe.'); return; }
    getSb().then(function (client) { return client.auth.signInWithPassword({ email: emailVal, password: passVal }); })
      .then(function (res) {
        if (res.error) { alert('Connexion impossible : ' + res.error.message); return; }
        if (typeof closeAll === 'function') closeAll();
        if (typeof openDashboard === 'function') openDashboard();
        if (typeof showWelcomeBack === 'function') showWelcomeBack();
        loadRealDashboard();
      });
  }

  // ── INSCRIPTION RÉELLE ──
  function realSignup() {
    var email = findInput('formSignup', ['email']);
    var pass = findInput('formSignup', ['password']);
    if (!email || !pass) { if (window.__origSubmitSignup__) return window.__origSubmitSignup__(); return; }
    var emailVal = email.value.trim(), passVal = pass.value;
    if (!emailVal || !passVal) { alert('Email et mot de passe requis pour créer ton compte.'); return; }
    var nameEl = findInput('formSignup', ['text']);
    var classSel = document.getElementById('signupClass');
    getSb().then(function (client) { return client.auth.signUp({ email: emailVal, password: passVal }); })
      .then(function (res) {
        if (res.error) { alert('Inscription impossible : ' + res.error.message); return; }
        var uid = res.data && res.data.user ? res.data.user.id : null;
        if (uid) {
          getSb().then(function (client) {
            return client.from('profiles').upsert({
              id: uid, program: PROGRAM, country_code: PROGRAM === 'national' ? 'GA' : null,
              first_name: nameEl ? nameEl.value.trim() : '', class_key: classSel ? classSel.value : '',
            });
          });
        }
        if (typeof closeAll === 'function') closeAll();
        if (typeof openDashboard === 'function') openDashboard();
        loadRealDashboard();
      });
  }

  // ── Charger les vraies données dans le dashboard de la maquette ──
  function loadRealDashboard() {
    getSb().then(function (client) {
      return client.auth.getUser().then(function (u) {
        if (!u.data || !u.data.user) return;
        return Promise.all([
          client.from('profiles').select('*').eq('id', u.data.user.id).single(),
          client.from('progress').select('*').eq('user_id', u.data.user.id),
        ]).then(function (r) {
          var profile = r[0].data, progress = r[1].data || [];
          var head = document.querySelector('.dash-greeting, #dashGreeting');
          if (head && profile) head.textContent = 'Bonjour ' + (profile.first_name || '') + ' 👋';
          var grid = document.getElementById('dashSubjects');
          if (grid) {
            grid.innerHTML = progress.length
              ? progress.map(function (p) { return '<div class="dash-subj-card" style="padding:12px;border-radius:12px;background:rgba(255,255,255,.05);margin:6px 0"><strong>' + p.subject + '</strong><br><small>Statut : ' + p.status + (p.last_chapter ? ' · ' + p.last_chapter : '') + '</small></div>'; }).join('')
              : '<p style="opacity:.8;padding:14px">Aucune progression pour l\'instant. Lance une session avec Éli 🌱</p>';
          }
        });
      });
    }).catch(function () {});
  }

  window.__eliToggleMute__ = function () {
    window.__eliMuted__ = !window.__eliMuted__;
    if (window.__eliMuted__ && typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    return window.__eliMuted__;
  };

  function install() {
    if (typeof window.submitSignup === 'function') window.__origSubmitSignup__ = window.submitSignup;
    window.sendChat = realSendChat;
    window.loginReturn = realLogin;
    if (findInput('formSignup', ['email'])) window.submitSignup = realSignup;
    getSb().then(function (client) {
      return client.auth.getSession().then(function (res) { if (res.data && res.data.session) loadRealDashboard(); });
    }).catch(function () {});
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(install, 400);
  else window.addEventListener('DOMContentLoaded', function () { setTimeout(install, 400); });
})();

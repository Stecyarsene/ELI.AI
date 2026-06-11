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

  // ── Essais gratuits visiteur (2 par pilier/matière) ──
  var TRIAL_MAX = 2;
  function trialKey(focus) { return 'eli.trial.' + (PROGRAM || 'national') + '.' + (focus || 'general'); }
  function trialCount(focus) { try { return parseInt(localStorage.getItem(trialKey(focus)) || '0', 10) || 0; } catch (e) { return window.__trial__ && window.__trial__[focus] || 0; } }
  function trialInc(focus) {
    var n = trialCount(focus) + 1;
    try { localStorage.setItem(trialKey(focus), String(n)); } catch (e) { window.__trial__ = window.__trial__ || {}; window.__trial__[focus] = n; }
    return n;
  }

  // Injecte un bouton « S'inscrire » dans le flux de chat + dans la barre
  function showSignupInChat(msg) {
    var stream = document.getElementById('chatStream');
    if (stream) {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'margin:12px 0;padding:14px;border-radius:14px;background:rgba(0,194,113,.12);border:1px solid rgba(0,194,113,.3);text-align:center';
      wrap.innerHTML = '<div style="margin-bottom:10px">' + (msg || "Tu as utilisé tes 2 essais gratuits 🌱 Inscris-toi pour continuer avec Éli sans limite !") + '</div>';
      var btn = document.createElement('button');
      btn.textContent = "✨ M'inscrire maintenant";
      btn.style.cssText = 'background:linear-gradient(135deg,#00C271,#34D399);color:#04140D;border:none;padding:12px 22px;border-radius:999px;font-weight:700;cursor:pointer;font-size:15px';
      btn.onclick = function () { if (typeof openSignup === 'function') openSignup(); else window.location.href = '#signup'; };
      wrap.appendChild(btn);
      stream.appendChild(wrap);
      stream.scrollTop = stream.scrollHeight;
    }
    // Bouton permanent dans la barre du chat
    addSignupButtonToBar();
  }
  function addSignupButtonToBar() {
    var bar = document.getElementById('chatInputBar');
    if (!bar || document.getElementById('eliSignupBarBtn')) return;
    var b = document.createElement('button');
    b.id = 'eliSignupBarBtn';
    b.textContent = "S'inscrire";
    b.title = "S'inscrire pour continuer avec Éli";
    b.style.cssText = 'background:linear-gradient(135deg,#00C271,#34D399);color:#04140D;border:none;padding:8px 16px;border-radius:999px;font-weight:700;cursor:pointer;white-space:nowrap';
    b.onclick = function () { if (typeof openSignup === 'function') openSignup(); else window.location.href = '#signup'; };
    bar.appendChild(b);
  }

  // ── CHAT RÉEL (avec essais gratuits visiteur) ──
  function realSendChat() {
    var inp = document.getElementById('chatInput');
    if (!inp) return;
    var txt = inp.value.trim();
    if (!txt) return;
    if (typeof pushMsg === 'function') { try { pushMsg(txt, 'user'); } catch (e) {} }
    inp.value = '';
    var bubble = ensureEliBubble();
    var focus = window.__eliFocusSubject__ || 'general';

    // Visiteur connecté ou non ?
    getSb().then(function (client) {
      return client.auth.getSession().then(function (res) {
        var loggedIn = !!(res.data && res.data.session);
        if (loggedIn) { return streamChat('/api/ai/chat', { message: txt, focusSubject: focus !== 'general' ? focus : undefined }, bubble, true); }

        // ── Visiteur : vérifier le quota d'essais ──
        var used = trialCount(focus);
        if (used >= TRIAL_MAX) {
          if (bubble) bubble.textContent = "Tu as déjà profité de tes 2 essais gratuits sur ce thème 🌱";
          showSignupInChat();
          return;
        }
        var n = trialInc(focus);
        return streamChat('/api/ai/trial', { message: txt, focusSubject: focus !== 'general' ? focus : undefined, program: PROGRAM }, bubble, false)
          .then(function () {
            // Après le 2e essai (ou plus), inviter à s'inscrire
            if (n >= TRIAL_MAX) {
              setTimeout(function () { showSignupInChat("C'était ton dernier essai gratuit 🌱 Inscris-toi pour continuer avec Éli, partout et sans limite !"); }, 800);
            } else {
              addSignupButtonToBar(); // le bouton reste visible dès le 1er essai
            }
          });
      });
    }).catch(function () { if (bubble) bubble.textContent = "Connexion interrompue, réessaie."; });
  }

  // Flux SSE commun (chat réel ou essai)
  function streamChat(endpoint, payload, bubble, authed) {
    var p = authed
      ? authedFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) })
      : fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    return p.then(function (res) {
      if (res.status === 401) { if (bubble) bubble.textContent = "Connecte-toi pour continuer 🌱"; showSignupInChat(); return; }
      if (res.status === 402) { if (bubble) bubble.textContent = 'Active ton abonnement pour continuer 🌱'; if (typeof showPaywall === 'function') setTimeout(showPaywall, 400); return; }
      if (res.status === 403) { if (bubble) bubble.textContent = "Termine ton inscription pour continuer 🌱"; showSignupInChat(); return; }
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
    }).catch(function () { if (bubble) bubble.textContent = "Connexion interrompue, réessaie."; });
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

    // Mémoriser la matière quand le visiteur ouvre le chat depuis un pilier/matière
    ['openChatContext', 'openToolChat', 'startClassChat'].forEach(function (fn) {
      if (typeof window[fn] === 'function') {
        var orig = window[fn];
        window[fn] = function () {
          try {
            var a = arguments;
            // openChatContext(classKey, subject) → subject ; openToolChat(name/intro) → 1er arg ; sinon 'general'
            var subj = (fn === 'openChatContext') ? a[1] : (typeof a[0] === 'string' ? a[0] : 'general');
            window.__eliFocusSubject__ = subj || 'general';
          } catch (e) {}
          return orig.apply(this, arguments);
        };
      }
    });

    getSb().then(function (client) {
      return client.auth.getSession().then(function (res) { if (res.data && res.data.session) loadRealDashboard(); });
    }).catch(function () {});
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(install, 400);
  else window.addEventListener('DOMContentLoaded', function () { setTimeout(install, 400); });
})();

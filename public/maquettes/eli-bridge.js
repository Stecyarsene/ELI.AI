/* ÉLI — PONT RÉEL v2. Branche les maquettes sur le vrai moteur :
   - Chat Gemini en STREAMING PROGRESSIF (texte au fil de l'eau, fluide)
   - Voix ElevenLabs synchronisée (repli navigateur si indispo)
   - Connexion email/mot de passe + téléphone (OTP SMS)
   - Suppression des fausses données : dashboard rempli UNIQUEMENT par les vraies données
   - Bouton Centre de Commandement visible pour le super_admin */
(function () {
  'use strict';
  var SELF = document.currentScript;
  var PROGRAM = (SELF && SELF.getAttribute('data-program')) || 'national';
  var SB_URL = '', SB_ANON = '', sbPromise = null;

  function getSb() {
    if (sbPromise) return sbPromise;
    sbPromise = fetch('/api/config').then(function (r) { return r.json(); }).then(function (cfg) {
      SB_URL = cfg.supabaseUrl; SB_ANON = cfg.supabaseAnon;
      return import('https://esm.sh/@supabase/supabase-js@2');
    }).then(function (m) { return m.createClient(SB_URL, SB_ANON); });
    return sbPromise;
  }

  /* ───────── VOIX — FILE D'ATTENTE : lit TOUT le texte, paragraphe par paragraphe ───────── */
  var currentAudio = null;
  var speechQueue = [];
  var speechSeq = 0; // jeton : invalide une lecture en cours quand une nouvelle démarre

  // Découpe en segments parlables (≤ ~480 car.) : d'abord par paragraphes, puis par phrases.
  function chunkText(text) {
    var paras = String(text || '').split(/\n{2,}|\n/).map(function (p) { return p.trim(); }).filter(Boolean);
    var out = [];
    paras.forEach(function (p) {
      if (p.length <= 480) { out.push(p); return; }
      var sentences = p.match(/[^.!?…]+[.!?…]+(\s|$)|[^.!?…]+$/g) || [p];
      var buf = '';
      sentences.forEach(function (sn) {
        sn = sn.trim(); if (!sn) return;
        if ((buf + ' ' + sn).trim().length > 480) { if (buf) out.push(buf.trim()); buf = sn; }
        else { buf = (buf ? buf + ' ' : '') + sn; }
      });
      if (buf.trim()) out.push(buf.trim());
    });
    return out;
  }

  function stopSpeak() {
    speechSeq++;                 // toute lecture programmée devient caduque
    speechQueue = [];
    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
    if (typeof speechSynthesis !== 'undefined') { try { speechSynthesis.cancel(); } catch (e) {} }
  }

  // Lit l'intégralité du texte fourni : remplit la file et enchaîne segment après segment.
  function speakAll(text) {
    if (window.__eliMuted__ || !text) return;
    stopSpeak();
    var token = ++speechSeq;
    speechQueue = chunkText(text);
    playNext(token);
  }
  function speak(text) { speakAll(text); } // compat : un appel simple = lecture complète

  function playNext(token) {
    if (token !== speechSeq) return;                 // une autre lecture a pris la main
    if (!speechQueue.length) return;
    var seg = speechQueue.shift();
    elevenSpeak(seg, token, function () { if (token === speechSeq) playNext(token); });
  }

  // ElevenLabs d'abord ; repli navigateur si 503/erreur. Enchaînement via le callback "done".
  function elevenSpeak(text, token, done) {
    if (window.__eliMuted__ || token !== speechSeq) { done(); return; }
    fetch('/api/tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: text }) })
      .then(function (r) {
        if (token !== speechSeq) { done(); return; }
        var ct = r.headers.get('content-type') || '';
        if (r.ok && ct.indexOf('audio') === 0) {
          return r.blob().then(function (b) {
            if (token !== speechSeq) { done(); return; }
            var url = URL.createObjectURL(b);
            currentAudio = new Audio(url);
            currentAudio.onended = function () { try { URL.revokeObjectURL(url); } catch (e) {} done(); };
            currentAudio.onerror = function () { try { URL.revokeObjectURL(url); } catch (e) {} browserSpeak(text, done); };
            currentAudio.play().catch(function () { browserSpeak(text, done); });
          });
        }
        browserSpeak(text, done); // 503 → repli navigateur
      })
      .catch(function () { browserSpeak(text, done); });
  }

  function browserSpeak(text, done) {
    done = done || function () {};
    try {
      if (typeof speechSynthesis === 'undefined') { done(); return; }
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'fr-FR'; u.rate = 1.0; u.pitch = 1.05;
      var fr = speechSynthesis.getVoices().filter(function (v) { return v.lang && v.lang.indexOf('fr') === 0; })[0];
      if (fr) u.voice = fr;
      u.onend = function () { done(); };
      u.onerror = function () { done(); };
      speechSynthesis.speak(u);
    } catch (e) { done(); }
  }

  window.__eliToggleMute__ = function () {
    window.__eliMuted__ = !window.__eliMuted__;
    if (window.__eliMuted__) stopSpeak();
    return window.__eliMuted__;
  };

  /* ───────── Pilier courant + blocs techniques [FICHE]/[BILAN] (invisibles à l'élève) ───────── */
  function normalizePillar(name) {
    var v = String(name || '').toLowerCase().trim();
    if (!v) return '';
    if (/exerc/.test(v)) return 'exercices';
    if (/r[ée]vis|fiche/.test(v)) return 'revision';
    if (/exam|\bbac\b|bepc|\bcep\b|brevet|[ée]preuve/.test(v)) return 'examen';
    if (/avenir|orient|parcoursup|anbg/.test(v)) return 'avenir';
    if (/oral/.test(v)) return 'oral';
    if (/organ|plann|planif|agenda|emploi du temps/.test(v)) return 'organisation';
    if (/aide|question/.test(v)) return 'aide';
    if (/cours|le[çc]on/.test(v)) return 'cours';
    return v;
  }

  // Nettoyage live (pendant le stream) : on coupe avant tout bloc technique et on enlève les balises voix.
  function cleanForDisplay(t) {
    return String(t || '').split(/\[BILAN\]|\[FICHE\]/i)[0].replace(/\[VOIX\]|\[\/VOIX\]/gi, '');
  }

  // Extrait, poste (progress/fiches) puis RETIRE les blocs [BILAN]/[FICHE] ; renvoie le texte visible.
  function processBlocks(full, subject) {
    var text = String(full || '');
    var subj = (subject && subject !== 'general') ? subject : null;

    var bilanRe = /\[BILAN\]([\s\S]*?)\[\/BILAN\]/i;
    var mb = text.match(bilanRe);
    if (mb) {
      try {
        var bj = JSON.parse(mb[1].trim());
        var sb = subj || bj.matiere;
        if (sb) {
          authedFetch('/api/progress', { method: 'POST', body: JSON.stringify({
            subject: sb,
            bilan: {
              chapitre_travaille: bj.chapitre_travaille, reussites: bj.reussites,
              erreurs_types: bj.erreurs_types, statut_propose: bj.statut_propose, prochaine_etape: bj.prochaine_etape
            }
          }) }).then(function () { if (typeof window.eliHydrateProgress === 'function') window.eliHydrateProgress(); }).catch(function () {});
        }
      } catch (e) {}
      text = text.replace(bilanRe, '');
    }

    var ficheRe = /\[FICHE\]([\s\S]*?)\[\/FICHE\]/i;
    var mf = text.match(ficheRe);
    if (mf) {
      try {
        var fj = JSON.parse(mf[1].trim());
        var fsj = subj || fj.matiere;
        if (fsj) {
          authedFetch('/api/fiches', { method: 'POST', body: JSON.stringify({
            subject: fsj, kind: (fj.type || 'revision'), title: (fj.titre || ''), body: (fj.contenu || {})
          }) }).catch(function () {});
        }
      } catch (e) {}
      text = text.replace(ficheRe, '');
    }
    return text.trim();
  }

  function splitVoice(full) {
    var m = full.match(/\[VOIX\]([\s\S]*?)\[\/VOIX\]/i);
    if (m) return { speech: m[1].trim(), written: (full.replace(m[0], '').trim()) || m[1].trim() };
    var first = (full.match(/^.*?[.!?](\s|$)/) || [full])[0].trim();
    return { speech: first, written: full.trim() };
  }

  /* ───────── Bulles de chat ───────── */
  function ensureEliBubble() {
    var stream = document.getElementById('chatStream');
    if (!stream) return null;
    var b = document.createElement('div');
    b.className = 'chat-msg eli msg eli';
    b.style.cssText = 'margin:8px 0;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.06);white-space:pre-wrap';
    b.textContent = '…';
    stream.appendChild(b); stream.scrollTop = stream.scrollHeight;
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

  function authedFetch(path, opts) {
    return getSb().then(function (c) {
      return c.auth.getSession().then(function (res) {
        var token = res && res.data && res.data.session ? res.data.session.access_token : '';
        opts = opts || {};
        opts.headers = Object.assign({ 'content-type': 'application/json', authorization: 'Bearer ' + token }, opts.headers || {});
        return fetch(path, opts);
      });
    });
  }

  /* ───────── Essais gratuits visiteur (2 par matière) ───────── */
  var TRIAL_MAX = 2;
  function tKey(f) { return 'eli.trial.' + PROGRAM + '.' + (f || 'general'); }
  function tCount(f) { try { return parseInt(localStorage.getItem(tKey(f)) || '0', 10) || 0; } catch (e) { return 0; } }
  function tInc(f) { var n = tCount(f) + 1; try { localStorage.setItem(tKey(f), String(n)); } catch (e) {} return n; }

  function showSignup(msg) {
    var stream = document.getElementById('chatStream');
    if (stream) {
      var w = document.createElement('div');
      w.style.cssText = 'margin:12px 0;padding:14px;border-radius:14px;background:rgba(0,194,113,.12);border:1px solid rgba(0,194,113,.3);text-align:center';
      w.innerHTML = '<div style="margin-bottom:10px">' + (msg || "Tu as utilisé tes 2 essais gratuits 🌱 Inscris-toi pour continuer sans limite !") + '</div>';
      var btn = document.createElement('button');
      btn.textContent = "✨ M'inscrire maintenant";
      btn.style.cssText = 'background:linear-gradient(135deg,#00C271,#34D399);color:#04140D;border:none;padding:12px 22px;border-radius:999px;font-weight:700;cursor:pointer';
      btn.onclick = function () { if (typeof openSignup === 'function') openSignup(); };
      w.appendChild(btn); stream.appendChild(w); stream.scrollTop = stream.scrollHeight;
    }
  }

  /* ───────── Chat : STREAMING PROGRESSIF ───────── */
  function realSendChat() {
    var inp = document.getElementById('chatInput');
    if (!inp) return;
    var txt = inp.value.trim();
    if (!txt) return;
    if (typeof pushMsg === 'function') { try { pushMsg(txt, 'user'); } catch (e) {} }
    inp.value = '';
    var bubble = ensureEliBubble();
    var focus = window.__eliFocusSubject__ || 'general';

    getSb().then(function (c) {
      return c.auth.getSession().then(function (res) {
        var loggedIn = !!(res.data && res.data.session);
        if (loggedIn) return stream('/api/ai/chat', { message: txt, focusSubject: focus !== 'general' ? focus : undefined, pillar: window.__eliPillar__ || undefined }, bubble, true);
        // visiteur
        if (tCount(focus) >= TRIAL_MAX) { if (bubble) bubble.textContent = "Tu as profité de tes 2 essais gratuits 🌱"; showSignup(); return; }
        var n = tInc(focus);
        return stream('/api/ai/trial', { message: txt, focusSubject: focus !== 'general' ? focus : undefined, program: PROGRAM }, bubble, false)
          .then(function () { if (n >= TRIAL_MAX) setTimeout(function () { showSignup("C'était ton dernier essai gratuit 🌱 Inscris-toi pour continuer !"); }, 600); });
      });
    }).catch(function () { if (bubble) bubble.textContent = "Connexion interrompue, réessaie."; });
  }

  // STREAMING : on affiche le texte au fil de l'eau, et on parle la voix dès qu'elle est complète
  function stream(endpoint, payload, bubble, authed) {
    var p = authed ? authedFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) })
                   : fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    return p.then(function (res) {
      if (res.status === 401) { if (bubble) bubble.textContent = "Connecte-toi pour continuer 🌱"; showSignup(); return; }
      if (res.status === 402) { if (bubble) bubble.textContent = 'Active ton abonnement pour continuer 🌱'; if (typeof showPaywall === 'function') setTimeout(showPaywall, 400); return; }
      if (res.status === 403) { if (bubble) bubble.textContent = "Termine ton inscription 🌱"; showSignup(); return; }
      if (!res.ok || !res.body) { if (bubble) bubble.textContent = "Je n'ai pas pu répondre, réessaie."; return; }
      var reader = res.body.getReader(), dec = new TextDecoder(), acc = '', spoken = false;
      var st = document.getElementById('chatStream');
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) {
            var full = extractText(acc) || '…';
            if (authed) full = processBlocks(full, (payload && payload.focusSubject) || window.__eliFocusSubject__);
            else full = full.replace(/\[BILAN\][\s\S]*?\[\/BILAN\]/i, '').replace(/\[FICHE\][\s\S]*?\[\/FICHE\]/i, '');
            var parts = splitVoice(full);
            var hasVoiceTag = /\[VOIX\]/i.test(full);
            var body = (parts.written && parts.written !== parts.speech) ? parts.written : '';
            var toRead = hasVoiceTag ? (parts.speech + (body ? '\n\n' + body : '')) : (parts.written || parts.speech);
            if (!spoken) { speakAll(toRead); spoken = true; }
            if (bubble) bubble.textContent = body ? ('🔊 ' + parts.speech + '\n\n' + body) : ('🔊 ' + parts.speech);
            if (st) st.scrollTop = st.scrollHeight;
            return;
          }
          acc += dec.decode(r.value, { stream: true });
          // Affichage progressif : on montre le texte au fur et à mesure
          var soFar = extractText(acc);
          if (soFar) {
            var parts = splitVoice(soFar);
            // Dès que la réplique [VOIX] est complète, on la prononce sans attendre la fin
            if (bubble) bubble.textContent = cleanForDisplay(soFar) || '…';
            if (st) st.scrollTop = st.scrollHeight;
          }
          return pump();
        });
      }
      return pump();
    }).catch(function () { if (bubble) bubble.textContent = "Connexion interrompue, réessaie."; });
  }

  /* ───────── Connexion email/mot de passe ───────── */
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function realLogin() {
    var email = val('loginEmail'), pass = val('loginPassword');
    if (!email || !pass) { alert('Entre ton email et ton mot de passe.'); return; }
    getSb().then(function (c) { return c.auth.signInWithPassword({ email: email, password: pass }); })
      .then(function (res) {
        if (res.error) { alert('Connexion impossible : ' + res.error.message); return; }
        afterLogin();
      });
  }
  // Connexion par téléphone (OTP SMS) — nécessite un fournisseur SMS configuré dans Supabase
  function loginByPhone() {
    var phone = val('loginPhone'), otp = val('loginOtp');
    var otpField = document.getElementById('loginOtp');
    var btn = document.getElementById('loginPhoneBtn');
    if (!phone) { alert('Entre ton numéro de téléphone.'); return; }
    getSb().then(function (c) {
      if (!otp) {
        // étape 1 : envoyer le code
        return c.auth.signInWithOtp({ phone: phone }).then(function (res) {
          if (res.error) { alert('Envoi du code impossible : ' + res.error.message); return; }
          if (otpField) otpField.style.display = 'block';
          if (btn) btn.textContent = 'Valider le code';
          alert('Un code t\'a été envoyé par SMS 📱');
        });
      }
      // étape 2 : vérifier le code
      return c.auth.verifyOtp({ phone: phone, token: otp, type: 'sms' }).then(function (res) {
        if (res.error) { alert('Code incorrect : ' + res.error.message); return; }
        afterLogin();
      });
    });
  }
  function afterLogin() {
    if (typeof closeAll === 'function') closeAll();
    if (typeof openDashboard === 'function') openDashboard();
    if (typeof showWelcomeBack === 'function') showWelcomeBack();
    else if (typeof welcomeBack === 'function') welcomeBack();
    hideDemoData();
    loadRealDashboard();
  }

  /* ───────── Inscription email/mot de passe ───────── */
  function findIn(scopeId, type) { var s = document.getElementById(scopeId) || document; return s.querySelector('input[type="' + type + '"]'); }
  function realSignup() {
    var emailEl = findIn('formSignup', 'email') || findIn('formS', 'email');
    var passEl = findIn('formSignup', 'password') || findIn('formS', 'password');
    if (!emailEl || !passEl) { if (window.__origSubmitSignup__) return window.__origSubmitSignup__(); return; }
    var email = emailEl.value.trim(), pass = passEl.value;
    if (!email || !pass) { alert('Email et mot de passe requis.'); return; }
    if (pass.length < 6) { alert('Mot de passe : 6 caractères minimum.'); return; }
    var nameEl = findIn('formSignup', 'text') || findIn('formS', 'text');
    var classSel = document.getElementById('signupClass') || document.getElementById('levelSel');
    getSb().then(function (c) { return c.auth.signUp({ email: email, password: pass }); })
      .then(function (res) {
        if (res.error) { alert('Inscription impossible : ' + res.error.message); return; }
        var uid = res.data && res.data.user ? res.data.user.id : null;
        if (uid) {
          getSb().then(function (c) {
            return c.from('profiles').upsert({
              id: uid, program: PROGRAM, country_code: PROGRAM === 'national' ? 'GA' : null,
              first_name: nameEl ? nameEl.value.trim() : '', class_key: classSel ? classSel.value : '',
            });
          });
        }
        if (typeof closeAll === 'function') closeAll();
        if (typeof openOffersModal === 'function') openOffersModal(); // paiement après inscription
        else if (typeof openDashboard === 'function') openDashboard();
        hideDemoData();
        loadRealDashboard();
      });
  }

  /* ───────── Masquer les fausses données (mode réel) ───────── */
  function hideDemoData() {
    // Le dashboard de démo de la maquette contient des données fictives en dur → on le vide
    var dash = document.getElementById('dashboard');
    if (dash) {
      var grid = document.getElementById('dashSubjects');
      if (!grid) {
        // on neutralise le contenu fictif et on prépare un conteneur réel
        dash.querySelectorAll('[data-demo], .demo-only').forEach(function (el) { el.style.display = 'none'; });
      }
    }
  }

  function loadRealDashboard() {
    getSb().then(function (c) {
      return c.auth.getUser().then(function (u) {
        if (!u.data || !u.data.user) return;
        return Promise.all([
          c.from('profiles').select('*').eq('id', u.data.user.id).single(),
          c.from('progress').select('*').eq('user_id', u.data.user.id),
          c.from('user_roles').select('role').eq('user_id', u.data.user.id),
        ]).then(function (r) {
          var profile = r[0].data, progress = r[1].data || [], roles = (r[2].data || []).map(function (x) { return x.role; });
          // Greeting réel
          var head = document.querySelector('.dash-greeting, #dashGreeting');
          if (head && profile) head.textContent = 'Bonjour ' + (profile.first_name || '') + ' 👋';
          // Matières : structure vide qui se remplit (les deux : message + cases)
          renderRealDashboard(progress);
          // Bouton Centre de Commandement pour le super_admin
          if (roles.indexOf('super_admin') >= 0) addAdminButton();
          // Hydrate les dashboards des maquettes avec la vraie progression (/api/progress)
          if (typeof window.eliHydrateProgress === 'function') window.eliHydrateProgress();
        });
      });
    }).catch(function () {});
  }

  function renderRealDashboard(progress) {
    var dash = document.getElementById('dashboard');
    if (!dash) return;
    var grid = document.getElementById('dashSubjects');
    if (!grid) {
      grid = document.createElement('div');
      grid.id = 'dashSubjects';
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;padding:20px';
      // on insère au début du dashboard, et on masque l'ancien contenu fictif
      Array.prototype.slice.call(dash.children).forEach(function (ch) { if (ch.id !== 'dashSubjects') ch.style.display = 'none'; });
      dash.insertBefore(grid, dash.firstChild);
    }
    var welcome = '<div style="grid-column:1/-1;padding:18px;border-radius:14px;background:rgba(0,194,113,.1);margin-bottom:8px">'
      + '🌱 Bienvenue dans ton espace ! ' + (progress.length ? 'Voici tes matières.' : 'Commence ta première session avec Éli, tes matières apparaîtront ici au fur et à mesure.') + '</div>';
    var cards = progress.length
      ? progress.map(function (p) {
          var col = p.status === 'vert' ? '#34D399' : p.status === 'rouge' ? '#F87171' : '#FBBF24';
          return '<div style="padding:16px;border-radius:14px;background:rgba(255,255,255,.05);border-left:4px solid ' + col + '"><strong>' + p.subject + '</strong><br><small style="opacity:.7">' + (p.last_chapter || 'À commencer') + '</small></div>';
        }).join('')
      : '';
    grid.innerHTML = welcome + cards;
  }

  function addAdminButton() {
    if (document.getElementById('eliAdminBtn')) return;
    var b = document.createElement('button');
    b.id = 'eliAdminBtn';
    b.textContent = '🛡️ Centre de Commandement';
    b.style.cssText = 'position:fixed;bottom:18px;left:18px;z-index:9999;background:linear-gradient(135deg,#F5B544,#FFD479);color:#04140D;border:none;padding:12px 18px;border-radius:999px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.3)';
    b.onclick = function () { window.location.href = '/admin'; };
    document.body.appendChild(b);
  }

  /* ───────── Installation ───────── */
  function install() {
    if (typeof window.submitSignup === 'function') window.__origSubmitSignup__ = window.submitSignup;
    window.sendChat = realSendChat;
    window.loginReturn = realLogin;
    window.loginByPhone = loginByPhone;
    window.eliAuthedFetch = authedFetch; // exposé aux maquettes pour eliHydrateProgress()
    if (findIn('formSignup', 'email') || findIn('formS', 'email')) window.submitSignup = realSignup;

    ['openChatContext', 'openToolChat', 'startClassChat'].forEach(function (fn) {
      if (typeof window[fn] === 'function') {
        var orig = window[fn];
        window[fn] = function () {
          try {
            var a = arguments;
            if (fn === 'openChatContext') { window.__eliFocusSubject__ = a[1] || 'general'; }
            else if (fn === 'openToolChat') { if (typeof a[0] === 'string') window.__eliPillar__ = normalizePillar(a[0]); }
            else { window.__eliFocusSubject__ = (typeof a[0] === 'string' ? a[0] : 'general'); }
          } catch (e) {}
          return orig.apply(this, arguments);
        };
      }
    });

    // Au chargement : si déjà connecté → vraies données + masquer démo ; sinon rien (visiteur)
    getSb().then(function (c) {
      return c.auth.getSession().then(function (res) {
        if (res.data && res.data.session) { hideDemoData(); loadRealDashboard(); }
      });
    }).catch(function () {});
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(install, 400);
  else window.addEventListener('DOMContentLoaded', function () { setTimeout(install, 400); });
})();

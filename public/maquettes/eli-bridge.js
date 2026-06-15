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

  function loadSupabaseModule() {
    // Bundle local (même origine) = pas de round-trip externe au premier clic ; repli CDN si absent.
    return import('/maquettes/vendor/supabase-js.mjs').catch(function () { return import('https://esm.sh/@supabase/supabase-js@2'); });
  }
  function getSb() {
    if (sbPromise) return sbPromise;
    sbPromise = fetch('/api/config').then(function (r) { return r.json(); }).then(function (cfg) {
      SB_URL = cfg.supabaseUrl; SB_ANON = cfg.supabaseAnon;
      return loadSupabaseModule();
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

  // Nettoyage d'affichage ROBUSTE : aucune balise technique ne doit jamais apparaître,
  // ni en streaming (tags partiels en fin de flux) ni en final (tag mal fermé).
  function cleanForDisplay(t) {
    return String(t || '')
      .replace(/\[BILAN\][\s\S]*?\[\/BILAN\]/gi, '')          // blocs complets
      .replace(/\[FICHE\][\s\S]*?\[\/FICHE\]/gi, '')
      .replace(/\[\/?VOIX\]/gi, '')                            // balises voix (ouvrante/fermante)
      .replace(/\[(?:BILAN|FICHE)\][\s\S]*$/i, '')             // bloc technique ouvert, pas encore fermé (stream)
      .replace(/\[\/?[A-Z]{0,6}$/, '')                          // tag technique PARTIEL en fin de flux ([VOI, [BIL, [/VOIX…)
      .replace(/[ \t]+\n/g, '\n')
      .trim();
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

  /* ───────── T8 — Onboarding par le chat (miroir de src/lib/onboarding.ts, testé) ───────── */
  function eliStrip(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }
  function eliDetectClass(text) {
    var t = eliStrip(text);
    if (/\bterminale?\b|\btle?\b|\bterm\b/.test(t)) return 'terminale';
    if (/\b(premiere|1ere|1re)\b/.test(t)) return '1ere';
    if (/\b(seconde|2nde|2de)\b/.test(t)) return '2nde';
    if (/\b(troisieme|3eme|3e)\b/.test(t)) return '3e';
    if (/\b(quatrieme|4eme|4e)\b/.test(t)) return '4e';
    if (/\b(cinquieme|5eme|5e)\b/.test(t)) return '5e';
    if (/\b(sixieme|6eme|6e)\b/.test(t)) return '6e';
    if (/\bcm2\b/.test(t)) return 'cm2'; if (/\bcm1\b/.test(t)) return 'cm1';
    if (/\bce2\b/.test(t)) return 'ce2'; if (/\bce1\b/.test(t)) return 'ce1';
    if (/\bcp\s?2\b/.test(t)) return 'cp2'; if (/\bcp\b|\bcp\s?1\b/.test(t)) return 'cp1';
    return null;
  }
  function eliDetectSerie(text) {
    var t = eliStrip(text);
    var m = t.match(/\bserie\s*([abcde][12]?)\b/) || t.match(/\bterminale?\s+([abcde][12]?)\b/) || t.match(/\b(a1|a2|[bcde])\b/);
    if (!m) return null; var r = m[1].toUpperCase();
    return ['A1', 'A2', 'B', 'C', 'D', 'E'].indexOf(r) >= 0 ? r : null;
  }
  function eliLooksLost(text) {
    var t = eliStrip(text); if (!t) return true;
    if (/^(bonjour|salut|coucou|hello|bonsoir|hey|cc)\b/.test(t)) return true;
    return /\b(aide|aidez|aide moi|perdu|je sais pas|sais pas quoi|comment (ca|ca) marche|par ou commencer|que faire|c est quoi eli|qu est ce que|commencer)\b/.test(t);
  }
  function eliOnboard(text) {
    var c = eliDetectClass(text), s = eliDetectSerie(text);
    if (c) return { intent: 'navigate_class', classKey: c, serie: s };
    if (eliLooksLost(text)) return { intent: 'guide', classKey: null, serie: s };
    return { intent: 'normal', classKey: null, serie: s };
  }
  function eliOnboardButton(label, fn) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    b.style.cssText = 'margin:4px 6px 0 0;padding:9px 14px;border-radius:999px;border:1px solid rgba(0,194,113,.35);background:rgba(0,194,113,.12);color:inherit;font-weight:600;cursor:pointer;font-family:inherit;font-size:13.5px';
    b.onclick = fn; return b;
  }
  function eliRenderOnboarding(ob, bubble) {
    var stream = document.getElementById('chatStream');
    if (ob.intent === 'navigate_class') {
      var label = ob.classKey === 'terminale' ? ('Terminale' + (ob.serie ? ' ' + ob.serie : '')) : ob.classKey.toUpperCase();
      if (bubble) bubble.textContent = 'Parfait, on file vers ton espace ' + label + ' 🌱 Choisis ta matière dans ton menu.';
      if (ob.serie) { try { window.__ELI_SCOPE__ = window.__ELI_SCOPE__ || {}; window.__ELI_SCOPE__.serie = ob.serie; } catch (e) {} }
      if (stream) { var w = document.createElement('div'); w.style.cssText = 'margin:8px 0';
        w.appendChild(eliOnboardButton('➡ Ouvrir mon menu de classe', function () { eliGoClassMenu(); }));
        stream.appendChild(w); stream.scrollTop = stream.scrollHeight; }
      return;
    }
    // guide
    if (bubble) bubble.textContent = "Bienvenue 🌱 Je suis Éli, ton professeur particulier. Dis-moi par où commencer :";
    if (!stream) return;
    var box = document.createElement('div'); box.style.cssText = 'margin:8px 0';
    box.appendChild(eliOnboardButton('🎓 Choisir ma classe', function () { eliGoClassMenu(); }));
    box.appendChild(eliOnboardButton('📅 Mon examen', function () {
      var fns = ['openExamDash', 'openExamAEFE', 'eliGoClassMenu']; for (var i = 0; i < fns.length; i++) if (typeof window[fns[i]] === 'function') { window[fns[i]](); return; } eliGoClassMenu();
    }));
    box.appendChild(eliOnboardButton('🧭 Orientation', function () {
      var fns = ['openMonAvenir', 'openParcoursup', 'openPillar']; for (var i = 0; i < fns.length; i++) if (typeof window[fns[i]] === 'function') { window[fns[i]](); return; } eliGoClassMenu();
    }));
    box.appendChild(document.createElement('br'));
    var hint = document.createElement('small'); hint.style.cssText = 'opacity:.7'; hint.textContent = 'Ou pose-moi directement ta question !';
    box.appendChild(hint);
    stream.appendChild(box); stream.scrollTop = stream.scrollHeight;
  }
  window.eliOnboard = eliOnboard;

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

    // T8 — onboarding : si l'élève est égaré ou nomme sa classe, on le guide au lieu d'appeler le tuteur.
    try {
      var ob = eliOnboard(txt);
      if (ob.intent !== 'normal') { eliRenderOnboarding(ob, bubble); return; }
    } catch (e) {}

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
            var dispSpeech = cleanForDisplay(parts.speech);
            var dispBody = cleanForDisplay(body);
            var toRead = hasVoiceTag ? (dispSpeech + (dispBody ? '\n\n' + dispBody : '')) : (cleanForDisplay(parts.written) || dispSpeech);
            if (!spoken) { speakAll(toRead); spoken = true; }
            if (bubble) bubble.textContent = dispBody ? ('🔊 ' + dispSpeech + '\n\n' + dispBody) : ('🔊 ' + dispSpeech);
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
          // Engagement (flamme/série) + continuité + enregistrement push
          if (window.__eliEngageOnce__ !== true) { window.__eliEngageOnce__ = true; c.rpc('touch_engagement', { p_minutes: 1 }).then(function (er) { if (er && er.data) renderStreak(er.data); }).catch(function () {}); }
          // Périmètre réel (classe, examen, série) pour piloter l'affichage examen/normal des piliers
          c.rpc('my_scope').then(function (sr) { if (sr && sr.data) { window.__ELI_SCOPE__ = sr.data; if (typeof window.eliApplyScope === 'function') try { window.eliApplyScope(sr.data); } catch (e) {} } }).catch(function () {});
          renderContinuity(progress);
          renderResumable();
          renderBougie(!!(profile && profile.bougie));
          registerPush();
        });
      });
    }).catch(function () {});
  }

  function eliGoClassMenu() {
    var fns = ['openClassMenu', 'backToMenu', 'showClassMenu', 'goToMenu', 'closeAll', 'closeOverlay'];
    for (var i = 0; i < fns.length; i++) { if (typeof window[fns[i]] === 'function') { try { window[fns[i]](); return; } catch (e) {} } }
    window.location.href = (PROGRAM === 'aefe' ? '/aefe' : '/nationale');
  }
  window.eliGoClassMenu = eliGoClassMenu;

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
    // T6 — élève de retour : on met en avant SES matières travaillées + un retour au menu de classe.
    var worked = [];
    var seen = {};
    (progress || []).forEach(function (p) {
      var s = (p.subject || '').trim(); if (!s) return;
      if (seen[s] && (seen[s].updated_at || '') >= (p.updated_at || '')) return;
      seen[s] = p;
    });
    Object.keys(seen).forEach(function (k) { worked.push(seen[k]); });
    worked.sort(function (a, b) { return (b.updated_at || '').localeCompare(a.updated_at || ''); });

    var welcome = '<div style="grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:18px;border-radius:14px;background:rgba(0,194,113,.1);margin-bottom:8px">'
      + '<span>🌱 ' + (worked.length ? 'Reprends là où tu t\'étais arrêté.' : 'Commence ta première session avec Éli, tes matières apparaîtront ici au fur et à mesure.') + '</span>'
      + '<button type="button" id="eliBackMenu" style="background:rgba(255,255,255,.12);color:inherit;border:1px solid rgba(255,255,255,.25);padding:9px 15px;border-radius:999px;font-weight:600;cursor:pointer;font-family:inherit;font-size:13.5px">↩ Revenir au menu de ma classe</button>'
      + '</div>';
    var cards = worked.length
      ? worked.map(function (p) {
          var col = p.status === 'vert' ? '#34D399' : p.status === 'rouge' ? '#F87171' : '#FBBF24';
          var subjEsc = String(p.subject).replace(/"/g, '&quot;');
          return '<button type="button" class="eli-subj-card" data-subj="' + subjEsc + '" style="text-align:left;padding:16px;border-radius:14px;background:rgba(255,255,255,.05);border:none;border-left:4px solid ' + col + ';color:inherit;cursor:pointer;font-family:inherit"><strong>' + p.subject + '</strong><br><small style="opacity:.7">' + (p.last_chapter || 'À commencer') + '</small></button>';
        }).join('')
      : '';
    grid.innerHTML = welcome + cards;
    var bk = document.getElementById('eliBackMenu'); if (bk) bk.onclick = eliGoClassMenu;
    Array.prototype.forEach.call(grid.querySelectorAll('.eli-subj-card'), function (b) {
      b.onclick = function () {
        var subj = b.getAttribute('data-subj'); window.__eliFocusSubject__ = subj;
        if (typeof window.openChatContext === 'function') window.openChatContext('', subj);
      };
    });
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

  /* ───────── Engagement : flamme + série (streak) + paliers ───────── */
  function renderStreak(eng) {
    if (!eng) return;
    window.__ELI_ENGAGEMENT__ = eng;
    var n = eng.streak_current || 0;
    var chip = document.getElementById('eliStreak');
    if (!chip) {
      chip = document.createElement('div');
      chip.id = 'eliStreak';
      chip.style.cssText = 'position:fixed;top:14px;right:14px;z-index:9998;display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;background:linear-gradient(135deg,#F5B544,#FFD479);color:#04140D;font-weight:800;font-family:inherit;box-shadow:0 6px 20px rgba(245,181,68,.4)';
      document.body.appendChild(chip);
    }
    chip.textContent = '🔥 ' + n + ' jour' + (n > 1 ? 's' : '');
    chip.title = 'Série : ' + n + ' jours consécutifs · record ' + (eng.streak_best || n);
    celebrateStreak(n);
  }
  function celebrateStreak(n) {
    if ([3, 7, 14, 30].indexOf(n) < 0) return;
    var key = 'eli.celebrated.' + PROGRAM + '.' + n;
    try { if (localStorage.getItem(key)) return; localStorage.setItem(key, '1'); } catch (e) {}
    var msgs = { 3: '3 jours de suite 🔥 Tu prends le rythme !', 7: "1 semaine d'affilée 🎉 Une vraie habitude !", 14: '14 jours 💪 Tu es en feu !', 30: '30 jours 🏆 Champion(ne) de la régularité !' };
    showCelebration(msgs[n] || ('Série de ' + n + ' jours 🔥'));
  }
  function showCelebration(text) {
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.9);z-index:10000;padding:22px 30px;border-radius:20px;background:linear-gradient(135deg,#00C271,#34D399);color:#04140D;font-weight:800;font-size:18px;text-align:center;max-width:80vw;box-shadow:0 20px 60px rgba(0,0,0,.4);transition:all .4s cubic-bezier(.16,1,.3,1);opacity:0';
    t.textContent = '🎊 ' + text;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.style.opacity = '1'; t.style.transform = 'translate(-50%,-50%) scale(1)'; });
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { try { t.remove(); } catch (e) {} }, 400); }, 3200);
  }

  /* ───────── Continuité : « hier on s'est arrêtés à … » ───────── */
  function renderContinuity(progress) {
    if (!progress || !progress.length) return;
    var dash = document.getElementById('dashboard');
    if (!dash || document.getElementById('eliContinuity')) return;
    var sorted = progress.slice().sort(function (a, b) { return String(b.updated_at || '').localeCompare(String(a.updated_at || '')); });
    var last = null;
    for (var i = 0; i < sorted.length; i++) { if (sorted[i].last_chapter) { last = sorted[i]; break; } }
    if (!last) return;
    var subjEsc = String(last.subject || '').replace(/'/g, "\\'");
    var b = document.createElement('div');
    b.id = 'eliContinuity';
    b.style.cssText = 'margin:14px 20px;padding:16px 18px;border-radius:16px;background:linear-gradient(135deg,rgba(0,194,113,.14),rgba(245,181,68,.08));border:1px solid rgba(0,194,113,.3);display:flex;align-items:center;gap:14px;flex-wrap:wrap';
    b.innerHTML = '<div style="flex:1;min-width:200px"><strong>Hier on s\'est arrêtés à « ' + last.last_chapter + ' »' + (last.subject ? (' en ' + last.subject) : '') + '.</strong><br><span style="opacity:.8">On continue là où tu en étais ?</span></div>';
    var btn = document.createElement('button');
    btn.textContent = '▶ Reprendre';
    btn.style.cssText = 'background:linear-gradient(135deg,#00C271,#34D399);color:#04140D;border:none;padding:12px 22px;border-radius:999px;font-weight:700;cursor:pointer;font-family:inherit';
    btn.onclick = function () { window.__eliFocusSubject__ = last.subject; if (typeof window.openChatContext === 'function') window.openChatContext('', subjEsc); };
    b.appendChild(btn);
    dash.insertBefore(b, dash.firstChild);
  }

  /* ───────── Fin de session : streak + rappel de continuité ───────── */
  function onChatClose() {
    getSb().then(function (c) {
      return c.auth.getSession().then(function (res) {
        if (!(res.data && res.data.session)) return;
        var mins = window.__eliChatOpenedAt__ ? Math.max(1, Math.round((Date.now() - window.__eliChatOpenedAt__) / 60000)) : 1;
        c.rpc('touch_engagement', { p_minutes: mins }).then(function (r) { if (r && r.data) renderStreak(r.data); }).catch(function () {});
        var subj = (window.__eliFocusSubject__ && window.__eliFocusSubject__ !== 'general') ? window.__eliFocusSubject__ : null;
        var lastChap = (subj && window.__ELI_PROGRESS__ && window.__ELI_PROGRESS__[subj]) ? window.__ELI_PROGRESS__[subj].last_chapter : null;
        var tr = collectTranscript();
        if (window.__eliSessionId__) {
          authedFetch('/api/session', { method: 'POST', body: JSON.stringify({ action: 'close', id: window.__eliSessionId__, transcript: tr, minutes: mins }) })
            .then(function (r) { return r.json(); }).then(function (jj) { if (jj && jj.signedUrl) showPdfToast(jj.signedUrl); }).catch(function () {});
          window.__eliSessionId__ = null;
        } else {
          authedFetch('/api/session/continue', { method: 'POST', body: JSON.stringify({ subject: subj || undefined, lastChapter: lastChap || undefined, minutes: mins }) }).catch(function () {});
        }
      });
    }).catch(function () {});
  }

  /* ───────── Push natif (Capacitor) : enregistrement du jeton ───────── */
  function registerPush() {
    try {
      var Cap = window.Capacitor;
      if (!Cap || !Cap.Plugins || !Cap.Plugins.PushNotifications) return;
      var PN = Cap.Plugins.PushNotifications;
      if (PN.requestPermissions) PN.requestPermissions().then(function (p) { if (p && p.receive === 'granted' && PN.register) PN.register(); });
      if (PN.addListener) PN.addListener('registration', function (tok) {
        var token = tok && tok.value; if (!token) return;
        var platform = (Cap.getPlatform && Cap.getPlatform()) || 'web';
        authedFetch('/api/push/register', { method: 'POST', body: JSON.stringify({ platform: platform, token: token }) }).catch(function () {});
      });
    } catch (e) {}
  }

  /* ───────── Mode Bougie : interface allégée + persistance (set_bougie) ───────── */
  function injectBougieCss() {
    if (document.getElementById('eliBougieCss')) return;
    var st = document.createElement('style'); st.id = 'eliBougieCss';
    st.textContent = "body.eli-bougie *{animation:none!important;transition:none!important}body.eli-bougie .cosmos,body.eli-bougie .aurora,body.eli-bougie .aurora2,body.eli-bougie .stars,body.eli-bougie .orb,body.eli-bougie .bg-orbs,body.eli-bougie .particles,body.eli-bougie .hero-glow{display:none!important}body.eli-bougie{filter:saturate(.92)}";
    document.head.appendChild(st);
  }
  function renderBougie(on) {
    injectBougieCss();
    window.__eliBougie__ = !!on;
    document.body.classList.toggle('eli-bougie', !!on);
    var b = document.getElementById('eliBougie');
    if (!b) {
      b = document.createElement('button'); b.id = 'eliBougie';
      b.style.cssText = 'position:fixed;top:14px;left:14px;z-index:9998;display:flex;align-items:center;gap:7px;padding:8px 13px;border-radius:999px;border:1px solid rgba(245,181,68,.5);background:rgba(0,0,0,.30);color:#FFE7A8;font-weight:700;font-family:inherit;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)';
      b.title = "Mode Bougie 🕯️ — interface allégée, idéale en connexion faible ou pour se concentrer. Éli répond en version courte et te garde une trace PDF de la séance.";
      b.onclick = toggleBougie;
      document.body.appendChild(b);
    }
    b.innerHTML = '🕯️ <span style="font-size:12.5px">Mode Bougie · ' + (on ? 'ON' : 'OFF') + '</span>';
    b.style.opacity = on ? '1' : '.72';
  }
  function toggleBougie() {
    var next = !window.__eliBougie__;
    renderBougie(next);
    getSb().then(function (c) { c.rpc('set_bougie', { p_on: next }).catch(function () {}); }).catch(function () {});
  }

  /* ───────── Sessions de travail : transcript, ouverture, clôture + PDF ───────── */
  function collectTranscript() {
    var out = [], st = document.getElementById('chatStream'); if (!st) return out;
    var kids = st.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i], cls = (el.className || '') + '', txt = (el.innerText || '').trim(); if (!txt) continue;
      var role = /user|right|hcb-user|msg-user|bubble-me/i.test(cls) ? 'me' : 'eli';
      out.push({ role: role, text: txt.slice(0, 1500) });
    }
    return out.slice(-40);
  }
  function openWorkSession() {
    window.__eliChatOpenedAt__ = Date.now();
    getSb().then(function (c) {
      return c.auth.getSession().then(function (res) {
        if (!(res.data && res.data.session)) return;
        var subj = (window.__eliFocusSubject__ && window.__eliFocusSubject__ !== 'general') ? window.__eliFocusSubject__ : undefined;
        authedFetch('/api/session', { method: 'POST', body: JSON.stringify({ action: 'open', pillar: window.__eliPillar__ || undefined, subject: subj, title: subj ? ('Travail en ' + subj) : undefined }) })
          .then(function (r) { return r.json(); }).then(function (j) { if (j && j.id) window.__eliSessionId__ = j.id; }).catch(function () {});
      });
    }).catch(function () {});
  }
  function showPdfToast(url) {
    if (!url) return;
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:10000;display:flex;align-items:center;gap:12px;padding:13px 18px;border-radius:14px;background:#0B3D2E;color:#fff;font-family:inherit;box-shadow:0 14px 40px rgba(0,0,0,.35)';
    t.innerHTML = '📄 Ton récap de session est prêt ';
    var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Voir le PDF →';
    a.style.cssText = 'color:#FFE082;font-weight:800;text-decoration:none';
    t.appendChild(a); document.body.appendChild(t);
    setTimeout(function () { try { t.remove(); } catch (e) {} }, 9000);
  }

  /* ───────── « Reprendre mon travail » (my_resumable_work) ───────── */
  function renderResumable() {
    var dash = document.getElementById('dashboard'); if (!dash || document.getElementById('eliResume')) return;
    authedFetch('/api/session?resumable=1').then(function (r) { return r.json(); }).then(function (j) {
      var items = (j && j.items) || [];
      var wrap = document.createElement('div'); wrap.id = 'eliResume';
      wrap.style.cssText = 'margin:14px 20px;padding:16px 18px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12)';
      var h = '<div style="font-weight:800;margin-bottom:10px">↩️ Reprendre mon travail</div>';
      if (!items.length) {
        h += '<div style="opacity:.75;font-size:14px">Aucun travail en cours pour l\'instant. Lance une session avec Éli : tu pourras la reprendre ici exactement où tu t\'es arrêté(e).</div>';
        wrap.innerHTML = h; dash.insertBefore(wrap, dash.firstChild); return;
      }
      h += items.map(function (it) {
        var subj = it.subject || it.pillar || 'Session'; var sE = String(it.subject || '').replace(/'/g, "\\'");
        return '<button class="eli-resume-row" data-id="' + it.id + '" data-subj="' + sE + '" style="display:block;width:100%;text-align:left;margin:6px 0;padding:12px 14px;border-radius:12px;border:1px solid rgba(0,194,113,.3);background:rgba(0,194,113,.08);color:inherit;cursor:pointer;font-family:inherit"><strong>' + (it.title || subj) + '</strong><br><span style="opacity:.75;font-size:12.5px">' + subj + (it.summary ? (' · ' + String(it.summary).slice(0, 70)) : '') + '</span></button>';
      }).join('');
      wrap.innerHTML = h; dash.insertBefore(wrap, dash.firstChild);
      Array.prototype.forEach.call(wrap.querySelectorAll('.eli-resume-row'), function (btn) {
        btn.onclick = function () { var subj = btn.getAttribute('data-subj'); window.__eliFocusSubject__ = subj || 'general'; window.__eliResumeId__ = btn.getAttribute('data-id'); if (typeof window.openChatContext === 'function') window.openChatContext('', subj); };
      });
    }).catch(function () {});
  }

  /* ───────── Orientation : Parcoursup (AEFE) / Mon Avenir (national) ───────── */
  function eliMaybeMountOrientation() {
    var t = document.getElementById('uniTitle'); var title = t ? (t.textContent || '') : '';
    var body = document.getElementById('universeBody'); if (!body) return;
    var track = /Parcoursup/i.test(title) ? 'parcoursup' : (/Avenir/i.test(title) ? 'mon_avenir' : null);
    if (!track || body.querySelector('#eliWishes')) return;
    var mount = document.createElement('div'); mount.id = 'eliWishes'; mount.style.cssText = 'margin-top:16px'; body.appendChild(mount);
    eliRenderOrientation(track, mount);
  }
  function eliRenderOrientation(track, mount) {
    var STAT = { envisage: 'À envisager', candidate: 'Candidature', accepte: 'Accepté', refuse: 'Refusé', confirme: 'Confirmé' };
    authedFetch('/api/orientation?track=' + track).then(function (r) { return r.json(); }).then(function (j) {
      var items = (j && j.items) || [];
      var rows = items.length ? items.map(function (w) {
        return '<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid rgba(0,0,0,.1);border-radius:12px;margin:8px 0;background:#fff">'
          + '<span style="font-weight:800;min-width:26px;color:#0B3D2E">' + (w.rank || '•') + '</span>'
          + '<div style="flex:1;color:#16243a"><strong>' + w.formation + '</strong><br><span style="opacity:.7;font-size:12.5px">' + [w.etablissement, w.ville].filter(Boolean).join(' · ') + '</span></div>'
          + '<span style="font-size:11.5px;padding:4px 9px;border-radius:999px;background:rgba(11,61,46,.08);color:#0B3D2E">' + (STAT[w.status] || w.status) + '</span>'
          + '<button class="eli-wish-del" data-id="' + w.id + '" style="border:none;background:none;cursor:pointer;font-size:16px;color:#c0392b">✕</button></div>';
      }).join('') : '<div style="padding:18px;border:1px dashed rgba(0,0,0,.18);border-radius:12px;text-align:center;color:#16243a;opacity:.85">Ta liste de vœux apparaîtra ici. Commence à explorer les formations avec Éli.</div>';
      mount.innerHTML = '<div style="font-weight:800;margin:6px 0 8px;color:#0B3D2E">🎯 Mes vœux ' + (track === 'parcoursup' ? 'Parcoursup' : '— Mon Avenir') + '</div>'
        + rows
        + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">'
        + '<input id="eliWishF" placeholder="Formation / filière" style="flex:1;min-width:160px;padding:10px 12px;border:1px solid rgba(0,0,0,.18);border-radius:10px;font-family:inherit">'
        + '<input id="eliWishE" placeholder="Établissement (option)" style="flex:1;min-width:140px;padding:10px 12px;border:1px solid rgba(0,0,0,.18);border-radius:10px;font-family:inherit">'
        + '<button id="eliWishAdd" style="padding:10px 18px;border:none;border-radius:10px;background:#0B3D2E;color:#fff;font-weight:700;cursor:pointer;font-family:inherit">Ajouter</button></div>';
      var add = mount.querySelector('#eliWishAdd');
      if (add) add.onclick = function () {
        var f = (mount.querySelector('#eliWishF').value || '').trim(); if (!f) return;
        var e = (mount.querySelector('#eliWishE').value || '').trim();
        authedFetch('/api/orientation', { method: 'POST', body: JSON.stringify({ track: track, formation: f, etablissement: e || undefined }) }).then(function () { eliRenderOrientation(track, mount); }).catch(function () {});
      };
      Array.prototype.forEach.call(mount.querySelectorAll('.eli-wish-del'), function (b) {
        b.onclick = function () { authedFetch('/api/orientation?id=' + b.getAttribute('data-id'), { method: 'DELETE' }).then(function () { eliRenderOrientation(track, mount); }).catch(function () {}); };
      });
    }).catch(function () { mount.innerHTML = '<div style="opacity:.7;color:#16243a">Connecte-toi pour gérer tes vœux.</div>'; });
  }

  /* ───────── Calendrier examens : compte à rebours DYNAMIQUE (recalcul quotidien) ───────── */
  var ELI_EXAM_DATES = {
    // National (Gabon) — calendrier officiel 2026 (Min. Éducation nationale / union.ga)
    cep:           { date: '2026-06-15', label: 'CEP',           provisional: false },
    bepc:          { date: '2026-06-22', label: 'BEPC',          provisional: true  },
    bac:           { date: '2026-06-30', label: 'BAC',           provisional: false },
    bac_general:   { date: '2026-06-30', label: 'BAC général',   provisional: false },
    bac_technique: { date: '2026-06-30', label: 'BAC technique', provisional: true  },
    // AEFE — calendrier français 2026 (education.gouv.fr)
    brevet:        { date: '2026-06-26', label: 'Brevet (DNB)',  provisional: false },
    bac_aefe:      { date: '2026-06-15', label: 'Bac',           provisional: false }
  };
  function eliDaysUntil(key) {
    var e = ELI_EXAM_DATES[key]; if (!e || !e.date) return null;
    var target = new Date(e.date + 'T00:00:00');
    var today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((target - today) / 86400000));
  }
  function eliExamMeta(key) { return ELI_EXAM_DATES[key] || null; }
  function eliRefreshCountdowns() {
    var els = document.querySelectorAll('[data-exam-cd]');
    for (var i = 0; i < els.length; i++) {
      var k = els[i].getAttribute('data-exam-cd'); var d = eliDaysUntil(k);
      if (d != null) els[i].textContent = 'J-' + d;
    }
  }
  function eliLoadExamDates() {
    fetch('/api/exams').then(function (r) { return r.json(); }).then(function (j) {
      var items = (j && j.items) || [];
      items.forEach(function (it) { if (it.exam_key) ELI_EXAM_DATES[it.exam_key] = { date: it.exam_date, label: it.label, provisional: !!it.provisional }; });
      eliRefreshCountdowns();
    }).catch(function () { eliRefreshCountdowns(); });
  }
  window.eliDaysUntil = eliDaysUntil; window.eliExamMeta = eliExamMeta; window.eliRefreshCountdowns = eliRefreshCountdowns;

  /* ───────── Examens : fiches(kind=examen) réelles + PDF par épreuve ───────── */
  function eliExamLabelFromTitle() {
    var t = document.getElementById('uniTitle'); var x = t ? (t.textContent || '') : '';
    return x.replace(/^[^A-Za-zÀ-ÿ]+/, '').replace(/^Pr[ée]paration\s+/i, '').trim() || 'Examen';
  }
  function eliGenExamPdf(exam, subject, btn) {
    var old = btn ? btn.textContent : '';
    if (btn) { btn.textContent = '…'; btn.disabled = true; }
    authedFetch('/api/exam/pdf', { method: 'POST', body: JSON.stringify({ exam: exam, subject: subject }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.signedUrl) showPdfToast(j.signedUrl); else showPdfToast(''); })
      .catch(function () {})
      .then(function () { if (btn) { btn.textContent = old || '📄 PDF'; btn.disabled = false; } });
  }
  function eliMountSerieSelector(body, exam) {
    if (!body || body.querySelector('#eliSerieSelector')) return;
    if (PROGRAM !== 'national') return; // épreuves disponibles pour le programme national
    var SERIES = ['A1', 'A2', 'B', 'C', 'D', 'E'];
    var card = document.createElement('div'); card.id = 'eliSerieSelector'; card.className = 'examdash-card';
    card.style.cssText = 'margin-top:16px;padding:18px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12)';
    var btns = SERIES.map(function (s) {
      return '<button type="button" class="eli-serie" data-serie="' + s + '" style="padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.05);color:inherit;font-weight:700;cursor:pointer;font-family:inherit">' + s + '</button>';
    }).join('');
    card.innerHTML = '<div class="prog-title">🎓 Toutes les séries d\'examen</div>'
      + '<div style="opacity:.75;font-size:13.5px;margin:6px 0 12px">Choisis ta série (ou explore les autres) pour voir les épreuves et générer une fiche PDF.</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:8px">' + btns + '</div>'
      + '<div id="eliSerieResults" style="margin-top:14px;font-size:14px;opacity:.85"></div>';
    body.insertBefore(card, body.firstChild);
    var results = card.querySelector('#eliSerieResults');
    Array.prototype.forEach.call(card.querySelectorAll('.eli-serie'), function (b) {
      b.onclick = function () {
        Array.prototype.forEach.call(card.querySelectorAll('.eli-serie'), function (x) { x.style.background = 'rgba(255,255,255,.05)'; });
        b.style.background = 'rgba(0,194,113,.25)';
        var serie = b.getAttribute('data-serie');
        results.textContent = 'Chargement des épreuves de la série ' + serie + '…';
        authedFetch('/api/exam/papers?program=' + PROGRAM + '&serie=' + encodeURIComponent(serie))
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var papers = (j && j.papers) || [];
            if (!papers.length) { results.textContent = 'Aucune épreuve trouvée pour la série ' + serie + '.'; return; }
            results.innerHTML = papers.map(function (p) {
              var subjEsc = String(p.subject || '').replace(/"/g, '&quot;');
              var exEsc = String(p.exam || exam || 'BAC').replace(/"/g, '&quot;');
              return '<div class="ep-row" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;margin:6px 0;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03)">'
                + '<span><strong>' + (p.subject || '—') + '</strong> <span style="opacity:.6;font-size:12px">· ' + (p.exam || '') + (p.year ? ' ' + p.year : '') + '</span></span>'
                + '<button type="button" class="eli-serie-pdf" data-subj="' + subjEsc + '" data-exam="' + exEsc + '" style="padding:5px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.2);color:inherit;font-size:11.5px;cursor:pointer;font-family:inherit">📄 PDF</button>'
                + '</div>';
            }).join('');
            Array.prototype.forEach.call(results.querySelectorAll('.eli-serie-pdf'), function (pb) {
              pb.onclick = function () { eliGenExamPdf(pb.getAttribute('data-exam'), pb.getAttribute('data-subj'), pb); };
            });
          })
          .catch(function () { results.textContent = 'Connecte-toi pour explorer les épreuves.'; });
      };
    });
  }

  function eliMaybeMountExam() {
    var body = document.getElementById('universeBody'); if (!body) return;
    if (!body.querySelector('.examdash-epreuves') && !body.querySelector('.examdash-countdown')) return;
    var exam = eliExamLabelFromTitle();
    eliMountSerieSelector(body, exam);
    // 1) Bouton PDF par épreuve
    var rows = body.querySelectorAll('.ep-row');
    Array.prototype.forEach.call(rows, function (row) {
      if (row.getAttribute('data-eli-pdf')) return;
      row.setAttribute('data-eli-pdf', '1');
      var nameEl = row.querySelector('.ep-name'); if (!nameEl) return;
      var subject = (nameEl.textContent || '').trim();
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = '📄 PDF';
      b.style.cssText = 'margin-left:8px;padding:5px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.2);color:inherit;font-size:11.5px;cursor:pointer;font-family:inherit';
      b.onclick = function (ev) { ev.stopPropagation(); eliGenExamPdf(exam, subject, b); };
      row.appendChild(b);
    });
    // 2) Panneau « Mes fiches d'examen » (réel) + Empty State
    if (body.querySelector('#eliExamFiches')) return;
    var card = document.createElement('div'); card.id = 'eliExamFiches'; card.className = 'examdash-card';
    card.style.cssText = 'margin-top:16px;padding:18px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12)';
    card.innerHTML = '<div class="prog-title">📑 Mes fiches d\'examen</div><div id="eliExamFichesList" style="opacity:.75;font-size:14px;margin-top:8px">Chargement…</div>';
    body.appendChild(card);
    authedFetch('/api/fiches?kind=examen').then(function (r) { return r.json(); }).then(function (j) {
      var fiches = (j && j.fiches) || []; var list = card.querySelector('#eliExamFichesList');
      if (!list) return;
      if (!fiches.length) { list.innerHTML = "Pas encore de fiche d'examen. Éli en crée au fil de tes révisions — et tu peux générer une fiche PDF par épreuve via le bouton 📄 ci-dessus."; return; }
      list.style.opacity = '1';
      list.innerHTML = fiches.map(function (f) {
        var sE = String(f.subject || '').replace(/'/g, "\\'");
        return '<button class="eli-fiche-row" data-subj="' + sE + '" style="display:block;width:100%;text-align:left;margin:6px 0;padding:11px 13px;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:inherit;cursor:pointer;font-family:inherit"><strong>' + (f.title || f.subject) + '</strong> <span style="opacity:.65;font-size:12px">· ' + f.subject + '</span></button>';
      }).join('');
      Array.prototype.forEach.call(list.querySelectorAll('.eli-fiche-row'), function (b) {
        b.onclick = function () { var subj = b.getAttribute('data-subj'); window.__eliFocusSubject__ = subj; if (typeof window.openChatContext === 'function') window.openChatContext('', subj); };
      });
    }).catch(function () { var l = card.querySelector('#eliExamFichesList'); if (l) l.textContent = "Connecte-toi pour retrouver tes fiches d'examen."; });
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

    if (typeof window.openChat === 'function') { var _oc = window.openChat; window.openChat = function () { openWorkSession(); return _oc.apply(this, arguments); }; }
    ['openParcoursup', 'openPillar', 'openMonAvenir'].forEach(function (fn) {
      if (typeof window[fn] === 'function') { var of = window[fn]; window[fn] = function () { var rv = of.apply(this, arguments); try { setTimeout(eliMaybeMountOrientation, 60); } catch (e) {} return rv; }; }
    });
    ['openExamAEFE', 'openExamDash'].forEach(function (fn) {
      if (typeof window[fn] === 'function') { var oe = window[fn]; window[fn] = function () { var rv = oe.apply(this, arguments); try { setTimeout(function () { eliMaybeMountExam(); eliRefreshCountdowns(); }, 60); } catch (e) {} return rv; }; }
    });
    ['closeChat', 'closeMM', 'closeAll', 'closeOverlay'].forEach(function (fn) {
      if (typeof window[fn] === 'function') {
        var o = window[fn];
        window[fn] = function () { try { if (window.__eliChatOpenedAt__) onChatClose(); } catch (e) {} window.__eliChatOpenedAt__ = null; return o.apply(this, arguments); };
      }
    });

    // Au chargement : si déjà connecté → vraies données + masquer démo ; sinon rien (visiteur)
    getSb().then(function (c) {
      return c.auth.getSession().then(function (res) {
        if (res.data && res.data.session) { hideDemoData(); loadRealDashboard(); }
      });
    }).catch(function () {});
  }

  // Warm-up Supabase : résout config + module + client pendant l'idle (pas au 1er clic, sans gêner le 1er paint).
  try { var _warm = function () { try { getSb(); } catch (e) {} }; (window.requestIdleCallback ? requestIdleCallback(_warm, { timeout: 1500 }) : setTimeout(_warm, 300)); } catch (e) {}
  // Dates d'examens : charge le calendrier réel et rafraîchit les compte-à-rebours chaque jour.
  try { eliLoadExamDates(); setInterval(eliRefreshCountdowns, 60000); } catch (e) {}

  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(install, 400);
  else window.addEventListener('DOMContentLoaded', function () { setTimeout(install, 400); });
})();

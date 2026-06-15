# -*- coding: utf-8 -*-
"""cahier_des_charges.py — CDC + Cahier Technique d'Eli, a jour de toutes les features.
Contenu original. Notation cp1252. Utilise le moteur de marque (logo + devise)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from elidoc import build_document  # noqa: E402

TITLE = "Cahier des Charges & Cahier Technique"
SUBTITLE = "Eli - Plateforme EdTech IA - Gabon<br/>Bi-programme National &amp; AEFE - version de lancement"
BRAND_SUB = "CDC & Cahier Technique"
INTRO = ("Document de reference unique decrivant le perimetre fonctionnel et l'architecture technique "
         "d'Eli a jour de toutes les fonctionnalites livrees. Il sert de contrat entre le produit, la "
         "technique et les partenaires. Lancement vise : 1er juillet 2026.")

S = []

S.append({"h": "Presentation et vision", "blocks": [
    "Eli est un professeur particulier propulse par l'intelligence artificielle, concu pour le Gabon et "
    "le reseau francais a l'etranger. Il rend accessible, partout et a toute heure, un accompagnement "
    "scolaire de qualite : tutorat, cours, annales, suivi et preparation aux examens.",
    ("h2", "Objectifs"),
    ("li", "Reduire l'inegalite d'acces au soutien scolaire."),
    ("li", "Rendre chaque eleve plus autonome et plus confiant."),
    ("li", "Fonctionner meme en conditions degradees (Mode Bougie)."),
    ("li", "Monetiser de facon accessible via le mobile money."),
]})

S.append({"h": "Perimetre fonctionnel (bi-programme)", "blocks": [
    "Eli sert deux programmes officiels, sans melange des referentiels.",
    ("kv", [
        ("National (Gabon)", "Du CP1 a la Terminale, series A1, A2, B, C, D, E. Examens CEP, BEPC, BAC."),
        ("AEFE (francais)", "Du college (6e) a la Terminale, logique des specialites, Brevet, Bac, Parcoursup."),
    ]),
    "Les memes fonctionnalites s'appliquent aux deux interfaces (l'AEFE n'est plus gelee), avec une "
    "charte sobre et un respect strict de chaque programme.",
]})

S.append({"h": "Architecture technique", "blocks": [
    ("kv", [
        ("Front", "Next.js 14 + TypeScript, deploiement Vercel."),
        ("Interfaces", "Maquettes HTML statiques servies en iframe (hub, national, aefe, enseignant, parent)."),
        ("Plomberie", "eli-bridge.js : auth, streaming du chat, OTP WhatsApp, hydratation des donnees reelles."),
        ("Backend", "Supabase : Auth JWT, Postgres, RLS, fonctions security definer, Storage."),
        ("IA", "Modeles Gemini (flash / flash-lite) en streaming SSE pour le tuteur et l'espace prof."),
        ("Securite", "Rate limiting Upstash, en-tetes de securite, verrou anti-mock en production."),
    ]),
    "Le code applique un principe additif : chaque evolution est verifiee (typage, tests, build) avant "
    "livraison, sans rien casser.",
]})

S.append({"h": "Authentification, roles et etancheite", "blocks": [
    "Quatre espaces strictement cloisonnes : eleve, enseignant, parent, super-admin.",
    ("li", "Connexion par OTP WhatsApp (Supabase + Twilio) ou par compte selon le profil."),
    ("li", "Roles geres en base (student, teacher, school_admin, ministry, parent, super_admin)."),
    ("li", "Etancheite : un eleve n'accede jamais aux outils prof ni parent, et inversement."),
    ("li", "Module unique de decision d'acces (fonctions pures testees) partage par toutes les routes."),
    ("li", "Le tuteur eleve refuse les comptes purement prof ou parent (reponse dediee)."),
]})

S.append({"h": "Tuteur IA et onboarding", "blocks": [
    "Le coeur d'Eli est un tuteur conversationnel qui guide par la methode socratique.",
    ("li", "Streaming progressif des reponses pour un ressenti immediat."),
    ("li", "Bilans de fin de session (acquis, fragilites, zone rouge, prochaine etape)."),
    ("li", "Onboarding par le chat : si l'eleve est egare ou salue, Eli propose des boutons "
           "(choisir sa classe, examen, orientation)."),
    ("li", "Detection de la classe enoncee (ex. 'je suis en terminale C') et bascule vers le menu adapte."),
    ("li", "Une vraie question n'est jamais interrompue : le tuteur repond directement."),
]})

S.append({"h": "Reprise directe et espaces eleve", "blocks": [
    ("li", "Splash de reprise : a l'ouverture, Eli lit le programme de l'eleve (session ou memoire locale) "
           "et le ramene directement a son interface ; sinon il affiche le hub."),
    ("li", "Lien 'Changer d'espace' pour revenir au choix de programme."),
    ("li", "Dashboard de retour : on n'affiche QUE les matieres travaillees, plus un bouton accessible "
           "'revenir au menu de ma classe'."),
]})

S.append({"h": "Classes d'examen", "blocks": [
    ("li", "Acces ouvert a TOUTES les series via un selecteur (A1, A2, B, C, D, E)."),
    ("li", "Les epreuves sont filtrees par serie, y compris les series multiples et les epreuves communes."),
    ("li", "Generation d'une fiche PDF par epreuve."),
    ("li", "Appui sur la base d'epreuves (annales) et le curriculum par serie."),
]})

S.append({"h": "Espace enseignant (v2)", "blocks": [
    ("li", "Selection guidee de la matiere et de la notion a traiter."),
    ("li", "Generation rapide en streaming (modele flash)."),
    ("li", "PDF de marque systematique : reponse a l'ecran + fichier telechargeable et imprimable."),
    ("li", "Modele economique : 2 essais gratuits, puis abonnement au meme tarif que les eleves."),
    ("li", "Inscription automatique (role enseignant attribue a l'inscription)."),
]})

S.append({"h": "Espace parent", "blocks": [
    ("li", "Liaison parent-enfant verifiee (numero WhatsApp + prenom de l'enfant), avec trace de consentement."),
    ("li", "Tableau de bord du suivi : points forts, points a ameliorer, zones rouges, temps passe, "
           "matieres et historique."),
    ("li", "Etancheite stricte : un parent ne voit QUE ses enfants (controle en base, fonctions security definer)."),
]})

S.append({"h": "Centre de commandement (super-admin)", "blocks": [
    ("li", "Cartes KPI : eleves, enseignants, revenus, taux de reussite, actifs, temps d'apprentissage."),
    ("li", "Graphiques : croissance des inscriptions, statuts (vert/orange/rouge), canaux (site/app/WhatsApp)."),
    ("li", "Tables : usage par matiere, zones rouges, transactions et recus, temps par pilier."),
    ("li", "Acces reserve au super-admin (double garde route + base)."),
]})

S.append({"h": "Paiements et monetisation", "blocks": [
    ("li", "Mobile money par USSD Push, sans redirection ; le montant est resolu cote serveur."),
    ("li", "Plans par programme (mensuel et au-dela) ; meme tarif eleve et enseignant premium."),
    ("li", "Webhook d'activation : active l'abonnement du bon profil (eleve ou enseignant)."),
    ("li", "Recus generes et traces dans le suivi admin."),
]})

S.append({"h": "Marketing cross-canal", "blocks": [
    ("li", "Invitations discretes a continuer sur WhatsApp ou l'application, a des moments cles."),
    ("li", "Message de felicitations a l'inscription, avec passerelle vers WhatsApp."),
    ("li", "Mesure du canal d'usage (site, app, WhatsApp) branchee sur la telemetrie d'apprentissage."),
]})

S.append({"h": "Contenus pedagogiques", "blocks": [
    ("li", "Cours 100% originaux, structures (objectif, prerequis, cours, methode, exemple, erreurs, entrainement)."),
    ("li", "PDF de marque (logo, devise, charte) et Google Doc editable pour validation enseignante."),
    ("li", "Regle d'encodage stricte (cp1252) verifiee avant chaque generation."),
    ("li", "Validation par un enseignant avant ingestion dans la base de cours."),
    "Lots deja produits : Mathematiques Terminale, Physique-Chimie Terminale (AEFE), Philosophie Terminale "
    "(tronc commun), SVT Terminale (AEFE). Les autres matieres et series suivront par lots.",
]})

S.append({"h": "Securite, conformite et resilience", "blocks": [
    ("li", "RLS sur les donnees sensibles ; fonctions security definer pour les acces controles."),
    ("li", "Bonnes pratiques OWASP : validation stricte des entrees, protection des secrets, en-tetes."),
    ("li", "Protection des mineurs : priorite absolue (voir le Master Prompt Education engagee)."),
    ("li", "Mode Bougie : interface sobre, contenus hors ligne, faible consommation de donnees."),
    ("li", "Verrou anti-mock : impossible de livrer en production avec des donnees fictives."),
]})

S.append({"h": "Qualite et tests", "blocks": [
    "Avant chaque livraison du depot, la chaine de verification suivante doit passer :",
    ("li", "Installation des dependances."),
    ("li", "Verification de typage TypeScript (tsc, sans emission)."),
    ("li", "Verrou anti-mock (script dedie)."),
    ("li", "Suite de tests unitaires (94 tests au dernier point)."),
    ("li", "Build de production Next.js."),
    "Toute regression bloque la livraison. La verification se fait sur une extraction propre de l'archive.",
]})

S.append({"h": "Base de donnees et migrations", "blocks": [
    "Le schema est versionne par migrations numerotees (0001 a 0021), le depot etant la source de verite.",
    ("kv", [
        ("Coeur", "profils, progression, evenements d'apprentissage, engagement, sessions de travail, paiements, plans."),
        ("Enseignant", "classes, inscriptions, ressources, profils enseignants, facturation (essais, abonnement)."),
        ("Parent", "profils parents, liens parent-enfant, consentements ; fonctions de lecture controlee."),
        ("Admin", "fonctions d'analytics (vue d'ensemble, usage, zones rouges, piliers, paiements, croissance)."),
        ("Examens", "epreuves (annales) et curriculum par classe et par serie."),
    ]),
]})

S.append({"h": "Modele de donnees detaille", "blocks": [
    "Le schema Postgres est versionne par migrations (0001 a 0021). Tables principales et colonnes cles :",
    ("h2", "Coeur eleve"),
    ("kv", [
        ("profiles", "id, first_name, program, class_key, serie, is_paid, paid_until, parent_phone_enc, created_at."),
        ("progress", "user_id, program, subject, status (vert/orange/rouge), last_chapter, strengths, improvements, red_zones, history, updated_at."),
        ("learning_events", "user_id, program, subject, concept, success, channel (site/app/whatsapp), created_at."),
        ("engagement", "user_id, streak_current, streak_best, total_sessions, total_minutes, last_active_date."),
        ("work_sessions", "user_id, pillar, subject, title, summary, highlights, transcript, duration_min, started_at."),
    ]),
    ("h2", "Paiements"),
    ("kv", [
        ("plans", "id, program, label, amount_fcfa, duration_days."),
        ("payments", "tx_id, user_id, program, plan_id, amount_fcfa, status (pending/success/failed), payer_kind (student/teacher), invoice_path, created_at."),
        ("notifications", "user_id, channel, kind, status."),
    ]),
    ("h2", "Enseignant"),
    ("kv", [
        ("teacher_profiles", "user_id, program, status, is_paid, paid_until, trial_count, created_at."),
        ("classes / class_enrollments", "gestion des classes et inscriptions, avec fonctions anti-recursion."),
        ("teacher_resources", "program, class_key, subject, notion, kind, title, content."),
    ]),
    ("h2", "Parent"),
    ("kv", [
        ("parent_profiles", "user_id, full_name, whatsapp, created_at."),
        ("parent_links", "parent_user_id, child_user_id, status (active/revoked) ; cle d'etancheite."),
        ("parental_consents", "user_id (enfant), parent_name, parent_phone_enc (hache)."),
    ]),
    ("h2", "Examens et roles"),
    ("kv", [
        ("exam_papers", "exam, program, serie, subject, title, year, drive_file_id, status."),
        ("curriculum", "program, class_key, payload (subjects, by_serie...), country_code."),
        ("user_roles", "user_id, role (student, teacher, school_admin, ministry, parent, super_admin)."),
    ]),
]})

S.append({"h": "Fonctions de base (RPC) et securite des donnees", "blocks": [
    "Les acces sensibles passent par des fonctions security definer qui verifient le droit en base :",
    ("li", "is_super_admin() : garde des fonctions d'analytics."),
    ("li", "admin_overview, admin_usage_by_subject, admin_red_zones, admin_pillar_usage, "
           "admin_recent_payments, admin_signups_timeseries : alimentent le centre de commandement."),
    ("li", "parent_link_by_phone : lie un parent a un enfant apres verification (numero + prenom)."),
    ("li", "parent_children, parent_child_overview : lecture stricte limitee aux enfants du parent."),
    ("li", "my_scope, in_school_hours : perimetre eleve et controle des horaires de classe."),
    "Chaque fonction verifie auth.uid() et refuse l'acces (erreur 'forbidden') hors perimetre. Les tables "
    "portent en plus des politiques RLS limitant les lignes visibles au proprietaire.",
]})

S.append({"h": "Interfaces de programmation (API)", "blocks": [
    "Routes principales (Next.js), regroupees par espace :",
    ("h2", "Eleve"),
    ("kv", [
        ("POST /api/ai/chat", "Tuteur IA en streaming ; reserve aux apprenants (refus prof/parent)."),
        ("POST /api/ai/trial", "Essai du tuteur sans compte."),
        ("POST /api/progress", "Enregistre un bilan + un evenement d'apprentissage avec canal."),
        ("GET /api/exam/papers", "Epreuves filtrees par serie / programme / examen."),
    ]),
    ("h2", "Enseignant"),
    ("kv", [
        ("POST /api/teacher/register", "Inscription (role + profil enseignant)."),
        ("GET /api/teacher/me", "Profil enseignant."),
        ("POST /api/ai/teacher", "Generation de materiel ; gating 2 essais puis abonnement."),
        ("POST /api/teacher/pdf", "PDF de marque du materiel genere."),
    ]),
    ("h2", "Parent"),
    ("kv", [
        ("POST /api/parent/register", "Activation du compte parent."),
        ("POST /api/parent/link", "Liaison a un enfant (verifiee)."),
        ("GET /api/parent/me", "Profil + enfants relies."),
        ("GET /api/parent/child", "Tableau de bord d'un enfant (controle du lien)."),
    ]),
    ("h2", "Admin et paiement"),
    ("kv", [
        ("GET /api/admin/overview", "Agregat des analytics (super-admin)."),
        ("POST /api/pay/init", "Initie un paiement USSD (eleve ou enseignant)."),
        ("POST /api/pay/webhook", "Confirmation de paiement et activation."),
        ("GET /api/config", "Config publique (cles anon, numero du bot WhatsApp)."),
    ]),
]})

S.append({"h": "Flux d'authentification (OTP WhatsApp)", "blocks": [
    ("li", "1) L'utilisateur saisit son numero ; le client appelle signInWithOtp (canal WhatsApp)."),
    ("li", "2) Supabase, via Twilio, envoie un code sur WhatsApp."),
    ("li", "3) L'utilisateur saisit le code ; le client appelle verifyOtp (type sms)."),
    ("li", "4) Une session JWT est etablie ; le bridge l'utilise pour toutes les requetes."),
    ("li", "5) Selon l'espace, on cree le profil (eleve, enseignant, parent) et on attribue le role."),
    "A la reception du code, un message WhatsApp invite a poursuivre sur le bot (template a configurer "
    "cote operateur).",
]})

S.append({"h": "Flux de paiement (USSD Push)", "blocks": [
    ("li", "1) L'utilisateur choisit une formule et saisit son numero mobile money."),
    ("li", "2) /api/pay/init resout le montant cote serveur (table plans), cree un paiement 'pending' "
           "et declenche un USSD Push (sans redirection)."),
    ("li", "3) L'utilisateur valide le paiement sur son telephone (code USSD)."),
    ("li", "4) L'operateur notifie /api/pay/webhook (signature verifiee)."),
    ("li", "5) Le webhook passe le paiement en 'success' et active l'abonnement du bon profil "
           "(eleve ou enseignant selon payer_kind), genere le recu et notifie le parent si pertinent."),
]})

S.append({"h": "Matrice des roles et permissions", "blocks": [
    ("kv", [
        ("Eleve", "Tuteur IA, cours, annales, fiches, son propre suivi. Pas d'acces prof/parent/admin."),
        ("Enseignant", "Generation de materiel + PDF, ses classes et ressources. Pas le tuteur eleve."),
        ("Parent", "Suivi de ses enfants relies uniquement. Aucun acces eleve/prof/admin."),
        ("School_admin / Ministry", "Vues agregees selon le perimetre ; pas de generation eleve."),
        ("Super_admin", "Acces transverse complet (supervision et test), au-dessus des silos."),
    ]),
    "L'etancheite est garantie a deux niveaux : controle d'acces applicatif (module de decision teste) "
    "et controle en base (RLS + fonctions security definer).",
]})

S.append({"h": "Specifications par fonctionnalite (criteres d'acceptation)", "blocks": [
    ("kv", [
        ("Reprise directe", "A l'ouverture, un eleve connu est redirige vers son interface ; un visiteur voit le hub ; 'Changer d'espace' fonctionne."),
        ("Separation des acces", "Un eleve ne peut pas appeler les routes prof/parent ; un prof/parent ne peut pas appeler le tuteur eleve."),
        ("Espace enseignant", "Selection guidee ; generation en streaming ; PDF systematique ; 2 essais puis paywall."),
        ("Dashboard admin", "KPI, graphiques et tables se chargent depuis les RPC ; acces refuse hors super-admin."),
        ("Espace parent", "Liaison verifiee ; un parent ne voit que ses enfants ; donnees de suivi exactes."),
        ("Dashboard eleve de retour", "Seules les matieres travaillees apparaissent ; bouton retour au menu present."),
        ("Classes d'examen", "Selecteur de toutes les series ; epreuves correctes ; PDF par epreuve."),
        ("Onboarding chat", "Guidage si egare ; bascule si la classe est nommee ; pas d'interruption d'une vraie question."),
        ("Marketing cross-canal", "Invitations WhatsApp/app discretes ; felicitations a l'inscription ; canal mesure."),
    ]),
]})

S.append({"h": "Exigences non fonctionnelles", "blocks": [
    ("h2", "Performance"),
    ("li", "Streaming des reponses IA pour un ressenti immediat ; requetes paralleles cote serveur."),
    ("li", "Maquettes legeres ; chargement rapide meme en faible debit."),
    ("h2", "Securite"),
    ("li", "RLS, fonctions security definer, validation stricte des entrees, en-tetes de securite, rate limiting."),
    ("li", "Aucun secret cote client ; cles anon uniquement dans la config publique."),
    ("h2", "Accessibilite"),
    ("li", "Contrastes eleves, navigation clavier, libelles ARIA, hierarchie de titres, tableaux legendes."),
    ("h2", "Resilience (Mode Bougie)"),
    ("li", "Contenus essentiels hors ligne, faible consommation de donnees, interface sobre."),
    ("h2", "Confidentialite"),
    ("li", "Minimisation des donnees, cloisonnement, droit a l'oubli, pas de revente ni de publicite ciblee."),
]})

S.append({"h": "Plan de qualite et de tests", "blocks": [
    "Chaine de verification obligatoire avant toute livraison du depot, sur une extraction propre :",
    ("kv", [
        ("Dependances", "Installation reproductible."),
        ("Typage", "tsc --noEmit (sans faux positif de version)."),
        ("Anti-mock", "Script verrou : pas de donnees fictives en production."),
        ("Tests unitaires", "94 tests au dernier point (acces, gating, examens, onboarding, suivi, securite, etc.)."),
        ("Build", "Build de production Next.js sans erreur."),
        ("Maquettes", "Verification de syntaxe des scripts (bridge, espace parent)."),
    ]),
    "Toute regression bloque la livraison. Le depot est re-archive apres nettoyage des artefacts.",
]})

S.append({"h": "Glossaire technique", "blocks": [
    ("kv", [
        ("RLS", "Row Level Security : restriction des lignes visibles selon l'utilisateur."),
        ("Security definer", "Fonction s'executant avec les droits de son proprietaire, controle integre."),
        ("USSD Push", "Demande de paiement envoyee directement sur le telephone, sans redirection web."),
        ("Streaming SSE", "Envoi progressif de la reponse IA, token par token."),
        ("Gating", "Limitation d'acces (ex. 2 essais gratuits) avant abonnement."),
        ("Mode Bougie", "Fonctionnement sobre et hors ligne pour conditions degradees."),
        ("Verrou anti-mock", "Garde empechant la mise en production avec des donnees fictives."),
    ]),
]})

S.append({"h": "Parcours utilisateurs", "blocks": [
    ("h2", "Eleve"),
    ("li", "Decouverte (hub ou splash de reprise) -> choix du programme -> inscription/connexion."),
    ("li", "Menu de classe -> choix d'une matiere -> session avec le tuteur (guidage socratique)."),
    ("li", "Fin de session -> bilan (statut, prochaine etape) -> reprise ulterieure ciblee sur les zones rouges."),
    ("h2", "Enseignant"),
    ("li", "Inscription OTP WhatsApp -> selection guidee matiere/notion/type -> generation en streaming."),
    ("li", "Telechargement du PDF -> enregistrement de la ressource -> au-dela de 2 essais, abonnement."),
    ("h2", "Parent"),
    ("li", "Inscription OTP WhatsApp -> liaison d'un enfant (numero + prenom) -> tableau de bord de suivi."),
    ("li", "Consultation reguliere : forces, points a ameliorer, zones rouges, temps passe, historique."),
]})

S.append({"h": "Arborescence des ecrans", "blocks": [
    ("kv", [
        ("/", "Accueil : splash de reprise ou hub d'aiguillage."),
        ("/national, /aefe", "Interfaces eleve (maquettes), avec memorisation du programme."),
        ("/[program]/enseignant", "Espace enseignant (maquette)."),
        ("/[program]/parent", "Espace parent (maquette)."),
        ("/admin", "Centre de commandement super-admin."),
    ]),
    "La navigation interne aux maquettes (menus de classe, espaces examen, outils par pilier) est geree "
    "cote client et reliee au backend par eli-bridge.js.",
]})

S.append({"h": "Gestion des erreurs et cas limites", "blocks": [
    ("li", "Non authentifie : reponse 401 et invitation a se connecter."),
    ("li", "Mauvais espace (ex. prof appelant le tuteur eleve) : 403 avec message dedie."),
    ("li", "Paywall enseignant : 402 avec les formules disponibles."),
    ("li", "Liaison parent introuvable : 404 explicite (numero ou prenom incorrect)."),
    ("li", "Echec de generation PDF : message clair, pas de blocage de la session."),
    ("li", "Perte de connexion : Mode Bougie et reprise sans perte de progression."),
    ("li", "Telemetrie non bloquante : un echec d'ecriture d'evenement n'interrompt jamais l'eleve."),
]})

S.append({"h": "Hypotheses, contraintes et risques", "blocks": [
    ("h2", "Contraintes"),
    ("li", "Connectivite et electricite parfois limitees (d'ou le Mode Bougie)."),
    ("li", "Paiement principalement par mobile money (Airtel, Moov)."),
    ("li", "Encodage PDF restreint (cp1252) pour le rendu de marque."),
    ("h2", "Risques et parades"),
    ("li", "Dependance a un operateur OTP/paiement -> webhooks signes, etats de paiement traces et rejouables."),
    ("li", "Volume de contenu a produire (tous niveaux/series) -> production par lots, validation enseignante."),
    ("li", "Abus du tuteur ou de l'espace prof -> rate limiting, gating, etancheite des roles."),
    ("li", "Protection des mineurs -> regles intangibles et orientation vers les adultes de confiance."),
]})

S.append({"h": "Indicateurs de succes (produit)", "blocks": [
    ("li", "Nombre d'eleves actifs (7 jours) et regularite des sessions."),
    ("li", "Taux de reussite mesure sur les interactions d'apprentissage."),
    ("li", "Progression des statuts (passage du rouge vers le vert)."),
    ("li", "Taux de conversion vers l'abonnement (eleves et enseignants)."),
    ("li", "Repartition des canaux (site, application, WhatsApp)."),
    ("li", "Satisfaction des parents et des enseignants partenaires."),
    "Ces indicateurs sont consultables dans le centre de commandement super-admin et orientent les "
    "priorites produit.",
]})

S.append({"h": "Annexe : migrations de base de donnees", "blocks": [
    "Le schema est construit de maniere incrementale et idempotente :",
    ("kv", [
        ("0001 a 0015", "Socle : profils, progression, evenements, engagement, sessions, paiements, plans, RLS, curriculum, epreuves."),
        ("0016 teacher_space", "Classes, inscriptions, ressources enseignant, fonctions anti-recursion."),
        ("0017 teacher_profiles", "Profils enseignants."),
        ("0018 admin_analytics", "Colonnes canal/facturation + fonctions d'analytics super-admin."),
        ("0019 payments_payer_kind", "Distinction du payeur (eleve / enseignant)."),
        ("0020 role_parent", "Ajout du role parent."),
        ("0021 parent_space", "Profils parents, liens parent-enfant, consentements, fonctions de lecture controlee."),
    ]),
    "Le depot est la source de verite : toute migration appliquee en base y figure a l'identique.",
]})

S.append({"h": "Charte visuelle et identite", "blocks": [
    ("kv", [
        ("Nom", "Eli."),
        ("Devise", "L'intelligence au service de ta reussite."),
        ("Logo", "Cercle vert, lettre E doree, flamme de bougie (clin d'oeil au Mode Bougie), trois points en base."),
        ("Couleurs", "Verts profonds, or, fond creme ; contrastes eleves pour la lisibilite."),
        ("Ton", "Chaleureux, clair, encourageant ; tutoiement eleve, vouvoiement parent/enseignant."),
    ]),
    "Tous les documents de marque (cours, CDC, master prompt) reprennent ce logo et cette devise, en "
    "couverture et en pied de page, pour une identite coherente.",
]})

S.append({"h": "Gouvernance des contenus pedagogiques", "blocks": [
    ("li", "Tous les cours sont originaux : aucune reproduction de manuel ni de contenu protege."),
    ("li", "Production par lots, format pedagogique impose et constant."),
    ("li", "Double livrable : PDF de marque (impression) + Google Doc (edition et validation)."),
    ("li", "Validation par un enseignant avant ingestion dans la base de cours (statut a_valider)."),
    ("li", "Verification d'encodage (cp1252) systematique avant chaque generation."),
    "Cette gouvernance garantit la qualite et la conformite, condition de l'equite promise aux eleves.",
]})

S.append({"h": "Coordonnees et canaux", "blocks": [
    ("li", "Paiement mobile money : Airtel Money et Moov Money."),
    ("li", "Contact et support : courriel dedie et lien WhatsApp."),
    ("li", "Canaux d'usage suivis : site web, application, bot WhatsApp."),
    "Les coordonnees operationnelles precises (numeros, adresses) sont centralisees dans la "
    "configuration du projet et la console d'administration, et non codees en dur dans les contenus.",
]})

S.append({"h": "Deploiement et environnements", "blocks": [
    ("kv", [
        ("Hebergement", "Front et API sur Vercel ; base et auth sur Supabase (projet ELI)."),
        ("Environnements", "Previsualisation (preview) pour la recette, production pour le lancement."),
        ("Variables", "Cles publiques (URL et anon Supabase), cle de service cote serveur, cle IA, "
                      "numero du bot WhatsApp ; aucun secret expose au client."),
        ("Schema", "Migrations appliquees de maniere idempotente ; depot = source de verite."),
        ("Mise en ligne", "Verification complete (typage, anti-mock, tests, build) avant chaque "
                          "deploiement ; recette visuelle des maquettes en preview."),
    ]),
    "Le principe directeur reste l'absence de regression : on ne deploie que ce qui a passe l'integralite "
    "de la chaine de verification.",
]})

S.append({"h": "Roadmap et reste a faire", "blocks": [
    ("li", "Completer les cours pour toutes les matieres, niveaux et series (production par lots, en continu)."),
    ("li", "Finaliser le template du message WhatsApp post-OTP cote operateur (Twilio)."),
    ("li", "Recette visuelle complete des maquettes en environnement de preview."),
    ("li", "Strategie d'expansion internationale francophone (document dedie)."),
    ("quote", "L'intelligence au service de ta reussite."),
]})


if __name__ == "__main__":
    out = "/mnt/user-data/outputs/Eli-CDC-Cahier-Technique.pdf"
    build_document(out, TITLE, SUBTITLE, BRAND_SUB, S, intro=INTRO)
    print("OK ->", out, "| sections:", len(S))

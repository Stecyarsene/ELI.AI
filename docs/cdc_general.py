# -*- coding: utf-8 -*-
"""cdc_general.py — Cahier des Charges général de l'application Éli (premium, accents, ~60 pages)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from elidoc import build_document  # noqa: E402

TITLE = "Cahier des Charges général"
SUBTITLE = "Spécification complète de l'application"
BRAND_SUB = "Cahier des Charges — Éli"
INTRO = ("Éli — Plateforme éducative à intelligence artificielle, Gabon. Bi-programme National & AEFE. "
         "Spécification fonctionnelle et technique complète, référence unique du produit. "
         "Lancement visé : 1er juillet 2026.")

S = []
def P(t): S.append({"divider": t})
def sec(h, b): S.append({"h": h, "blocks": b})

# ===== PARTIE I =====
P("Partie I — Présentation et contexte")
sec("Objet du document", [
    "Ce cahier des charges décrit l'intégralité de l'application Éli, du besoin métier jusqu'aux détails "
    "techniques. Il sert de contrat de référence entre toutes les parties prenantes : produit, "
    "développement, pédagogie, partenaires et direction.",
    "Il est tenu à jour à chaque évolution majeure et constitue la source unique de vérité fonctionnelle "
    "et technique. En cas de divergence entre une pratique et ce document, ce document prévaut ou doit "
    "être amendé explicitement.",
    ("h2", "Portée"),
    ("li", "Périmètre fonctionnel complet des espaces élève, enseignant, parent et administration."),
    ("li", "Architecture technique, modèle de données et interfaces de programmation."),
    ("li", "Exigences de sécurité, de conformité, de qualité et d'exploitation."),
])
sec("Vision et mission", [
    "Éli est un professeur particulier propulsé par l'intelligence artificielle, conçu pour rendre "
    "accessible à chaque élève un accompagnement scolaire de qualité, partout et à toute heure.",
    "La mission est une mission d'équité : ne laisser aucun élève seul face à une difficulté, quels que "
    "soient ses moyens ou son lieu de vie. L'éducation engagée d'Éli ne transmet pas seulement des "
    "savoirs ; elle réveille la confiance, l'autonomie et la dignité de l'apprenant.",
    ("quote", "L'intelligence au service de ta réussite."),
])
sec("Valeurs fondatrices", [
    ("table", ["Valeur", "Ce qu'elle implique"],
     [["Bienveillance", "Accueil sans jugement ; la critique porte sur le travail, jamais sur la personne."],
      ["Honnêteté", "Éli ne ment pas, n'invente pas de fait, signale ses limites."],
      ["Équité", "Même qualité pour tous ; attention accrue aux plus fragiles."],
      ["Autonomie", "On rend l'élève capable ; l'objectif final est qu'il se passe d'Éli."],
      ["Sécurité", "La protection des mineurs prime sur toute autre considération."]],
     [45, 125]),
    "Ces valeurs guident chaque décision produit et chaque comportement de l'IA. Elles sont détaillées "
    "dans le document de référence « Master Prompt — Éducation engagée ».",
])
sec("Contexte et problème adressé", [
    "Au Gabon et dans l'espace francophone, l'accès à un accompagnement scolaire de qualité est inégal : "
    "cours particuliers coûteux, contenus en ligne non structurés, manuels statiques, et souvent rien du "
    "tout hors des grandes villes.",
    "S'ajoutent des contraintes concrètes : connexion et électricité intermittentes, paiement "
    "majoritairement par mobile money, usage massif de WhatsApp. Les solutions existantes répondent mal "
    "à ces réalités.",
    "Éli adresse ce problème par une plateforme sobre, alignée sur les programmes officiels, accessible "
    "hors ligne (Mode Bougie), payable en mobile money et présente sur WhatsApp.",
])
sec("Glossaire de départ", [
    ("table", ["Terme", "Définition"],
     [["National", "Programme gabonais, du CP1 à la Terminale, séries A1, A2, B, C, D, E."],
      ["AEFE", "Programme français à l'étranger, du collège à la Terminale, logique des spécialités."],
      ["Mode Bougie", "Fonctionnement sobre et hors ligne pour conditions dégradées."],
      ["Pilier", "Grande famille d'outils pédagogiques (tutorat, cours, annales, fiches, suivi…)."],
      ["Bilan", "Synthèse de fin de session : acquis, fragilités, zone rouge, prochaine étape."]],
     [40, 130]),
])

# ===== PARTIE II =====
P("Partie II — Marché, objectifs et indicateurs")
sec("Marché et opportunité", [
    "Le marché se caractérise par une population scolaire jeune et nombreuse, une forte valeur accordée à "
    "la réussite aux examens, une pénétration croissante du mobile et du mobile money, et un déficit "
    "d'accompagnement de qualité.",
    "L'opportunité pour Éli est de combiner ce que personne ne fait pleinement localement : tutorat "
    "personnalisé, alignement curriculaire, accessibilité hors ligne et paiement mobile.",
])
sec("Objectifs produit", [
    ("li", "Offrir un tutorat IA aligné sur le programme officiel de l'élève."),
    ("li", "Rendre chaque élève plus autonome et plus confiant."),
    ("li", "Fonctionner même en conditions dégradées (Mode Bougie)."),
    ("li", "Permettre un paiement simple par mobile money."),
    ("li", "Associer parents et enseignants autour de la réussite."),
])
sec("Indicateurs de succès", [
    ("li", "Nombre d'élèves actifs (7 jours) et régularité des sessions."),
    ("li", "Progression des statuts (passage du rouge vers le vert)."),
    ("li", "Taux de réussite mesuré sur les interactions d'apprentissage."),
    ("li", "Taux de conversion vers l'abonnement (élèves et enseignants)."),
    ("li", "Rétention mensuelle ; répartition des canaux (site, app, WhatsApp)."),
    "Ces indicateurs sont consultables dans le centre de commandement super-admin et orientent les "
    "priorités produit.",
])
sec("Contraintes et hypothèses", [
    ("table", ["Contrainte", "Réponse d'Éli"],
     [["Connectivité", "Intermittente ; d'où le Mode Bougie et les contenus hors ligne."],
      ["Paiement", "Mobile money (Airtel, Moov) plutôt que carte bancaire."],
      ["Appareils", "Majorité de smartphones d'entrée et de milieu de gamme."],
      ["Canal", "WhatsApp comme canal de proximité dominant."]],
     [42, 128]),
])

# ===== PARTIE III =====
P("Partie III — Utilisateurs et parcours")
sec("Personas", [
    ("table", ["Persona", "Besoin principal"],
     [["Élève", "Comprendre, réviser et réussir ses examens."],
      ["Parent", "Suivre les progrès de son enfant en toute transparence."],
      ["Enseignant", "Gagner du temps en générant fiches, contrôles et progressions."],
      ["Super-admin", "Superviser l'ensemble : usage, revenus, qualité, sécurité."]],
     [40, 130]),
])
sec("Parcours élève", [
    ("li", "Découverte (hub ou splash de reprise) puis choix du programme."),
    ("li", "Inscription / connexion, puis menu de sa classe."),
    ("li", "Choix d'une matière et session avec le tuteur (guidage socratique)."),
    ("li", "Bilan de fin de session, puis reprise ultérieure ciblée sur les zones rouges."),
    ("li", "Accès aux annales, fiches et préparation aux examens."),
])
sec("Parcours enseignant", [
    ("li", "Inscription par OTP WhatsApp ; rôle enseignant attribué automatiquement."),
    ("li", "Sélection guidée de la matière et de la notion dans tout son programme."),
    ("li", "Génération du matériel en streaming, téléchargement du PDF de marque."),
    ("li", "Au-delà de 2 essais gratuits, abonnement au même tarif que les élèves."),
])
sec("Parcours parent", [
    ("li", "Inscription par OTP WhatsApp."),
    ("li", "Liaison à un enfant (numéro WhatsApp + prénom), vérifiée."),
    ("li", "Consultation du tableau de bord : forces, points à améliorer, zones rouges, temps passé, historique."),
])
sec("Parcours administration", [
    ("li", "Connexion super-admin."),
    ("li", "Lecture des KPI, graphiques et tables (usage, revenus, zones rouges, paiements)."),
    ("li", "Pilotage des priorités à partir des indicateurs."),
])
sec("Exigences utilisateurs transverses", [
    ("li", "Simplicité : prise en main immédiate, peu d'étapes."),
    ("li", "Rapidité ressentie : réponses en streaming, interface légère, affichage ultra-rapide."),
    ("li", "Confiance : sécurité des mineurs, transparence parentale, données protégées."),
    ("li", "Accessibilité : lisibilité, contrastes, fonctionnement hors ligne."),
])

# ===== PARTIE IV =====
P("Partie IV — Périmètre fonctionnel")
sec("Vue d'ensemble fonctionnelle", [
    "L'application s'organise autour de quatre espaces (élève, enseignant, parent, admin) et de huit "
    "piliers pédagogiques. Les mêmes fonctionnalités s'appliquent aux deux programmes (National et AEFE).",
    ("table", ["Pilier", "Rôle"],
     [["Tuteur", "Répondre, expliquer, guider sur toute notion, à tout moment."],
      ["Cours", "Contenus originaux structurés, par niveau et programme."],
      ["Annales / examens", "S'entraîner sur de vraies épreuves."],
      ["Fiches", "Mémoriser l'essentiel, révisable hors ligne."],
      ["Suivi", "Bilans, statuts couleur, trajectoire dans le temps."],
      ["Orientation", "Aider l'élève à se connaître et à choisir sa voie."],
      ["Méthode", "Apprendre à apprendre, organiser son travail."],
      ["Lien", "Relier élève, parent et enseignant."]],
     [42, 128]),
])
sec("Bi-programme National / AEFE", [
    "Éli sert deux programmes officiels sans mélange des référentiels.",
    ("table", ["Programme", "Périmètre"],
     [["National", "CP1 à Terminale ; séries A1, A2, B, C, D, E ; examens CEP, BEPC, BAC."],
      ["AEFE", "6e à Terminale ; logique des spécialités ; Brevet, Bac, Parcoursup."]],
     [38, 132]),
    "Un élève reçoit un accompagnement cohérent avec SON programme ; les notions communes sont enrichies "
    "sans changer son cadre de référence. Les deux interfaces offrent strictement les mêmes services.",
])
sec("Tuteur IA et méthode", [
    "Le cœur d'Éli est un tuteur conversationnel qui guide par la méthode socratique : il ne donne pas la "
    "réponse d'un exercice, il fait chercher l'élève par questions successives.",
    ("li", "Streaming progressif des réponses pour un ressenti immédiat."),
    ("li", "Réponse directe pour les questions factuelles et rappels de cours."),
    ("li", "Bilans de fin de session avec statut et prochaine étape."),
    ("li", "Ton chaleureux, adapté à l'âge et au programme ; rien de générique."),
])
sec("Onboarding par le chat", [
    ("li", "Si l'élève est égaré ou salue simplement, le tuteur propose des boutons (classe, examen, orientation)."),
    ("li", "Détection de la classe énoncée (ex. « je suis en terminale C ») et bascule vers le menu adapté."),
    ("li", "Une vraie question n'est jamais interrompue : le tuteur y répond directement."),
])
sec("Reprise directe et espaces", [
    ("li", "Splash de reprise : à l'ouverture, redirection vers l'interface de l'élève connu ; sinon hub."),
    ("li", "Lien « Changer d'espace » pour revenir au choix de programme."),
    ("li", "Mémorisation du programme (session et mémoire locale)."),
])
sec("Dashboard élève", [
    ("li", "Affiche uniquement les matières réellement travaillées."),
    ("li", "Bouton accessible « revenir au menu de ma classe »."),
    ("li", "Statuts couleur par matière et dernière notion travaillée."),
])
sec("Classes d'examen", [
    ("li", "Sélecteur ouvrant l'accès à toutes les séries (A1, A2, B, C, D, E)."),
    ("li", "Épreuves filtrées par série, y compris séries multiples et épreuves communes."),
    ("li", "Génération d'une fiche PDF par épreuve."),
    ("li", "Appui sur la base d'annales et le curriculum par série."),
])
sec("Espace enseignant", [
    "L'enseignant accède à TOUT son programme et compose librement son besoin.",
    ("li", "Sélection guidée en cascade : matière, puis série/filière, puis notion."),
    ("li", "Quand l'enseignant choisit une filière (ex. F1), la liste des matières affiche celles de cette filière ; "
           "le choix d'une matière déroule toutes les notions prévues."),
    ("li", "Génération rapide en streaming, jusqu'à la fin de la réponse (jamais tronquée)."),
    ("li", "PDF de marque systématique, complet, premium et épuré, adapté au besoin pédagogique."),
    ("li", "Modèle économique : 2 essais gratuits puis abonnement."),
])
sec("Espace parent", [
    ("li", "Liaison parent-enfant vérifiée (numéro + prénom), avec trace de consentement."),
    ("li", "Tableau de bord épuré et professionnel : points forts, à améliorer, zones rouges, temps passé, matières, historique."),
    ("li", "Rendu fidèle et sans contradiction de l'activité réelle de l'enfant."),
    ("li", "Étanchéité stricte : un parent ne voit QUE ses enfants. Disponible sur les deux interfaces."),
])
sec("Centre de commandement (super-admin)", [
    ("li", "Cartes KPI : élèves, enseignants, revenus, taux de réussite, actifs, temps d'apprentissage."),
    ("li", "Graphiques : croissance, statuts, canaux d'usage."),
    ("li", "Tables : usage par matière, zones rouges, transactions, temps par pilier."),
    ("li", "Accès réservé au super-admin."),
])
sec("Paiements et monétisation", [
    ("li", "Mobile money par USSD Push, sans redirection ; montant résolu côté serveur."),
    ("li", "Plans par programme ; même tarif élève et enseignant premium."),
    ("li", "Webhook d'activation du bon profil (élève ou enseignant)."),
    ("li", "Reçus générés et tracés dans le suivi admin."),
])
sec("Marketing cross-canal", [
    ("li", "Lien WhatsApp visible et présent sur chaque interface, adapté au contexte."),
    ("li", "En version web : invitation à se connecter sur WhatsApp et à télécharger l'application."),
    ("li", "Félicitations à l'inscription, avec passerelle WhatsApp."),
    ("li", "Mesure du canal d'usage (site, app, WhatsApp)."),
])
sec("Contenus pédagogiques", [
    ("li", "Cours 100 % originaux, structurés (objectif, prérequis, cours, méthode, exemple, erreurs, entraînement)."),
    ("li", "PDF de marque + Google Doc éditable pour validation enseignante."),
    ("li", "Validation enseignante avant ingestion dans la base de cours."),
])
sec("Mode Bougie", [
    ("li", "Contenus essentiels téléchargeables et consultables hors ligne."),
    ("li", "Interface très légère, faible consommation de données, contrastes élevés."),
    ("li", "Reprise sans perte dès que la connexion revient."),
    "Le Mode Bougie est un engagement de respect envers les élèves en contexte difficile, pas une "
    "version au rabais.",
])

# ===== PARTIE V =====
P("Partie V — Spécifications détaillées")
def spec(h, regles, criteres):
    return sec(h, [("h2", "Règles")] + [("li", r) for r in regles] +
               [("h2", "Critères d'acceptation")] + [("li", c) for c in criteres])
spec("Spécification — Reprise directe",
     ["Lire le programme via la session ou la mémoire locale.",
      "Rediriger vers /national ou /aefe si connu ; afficher le hub sinon.",
      "Honorer un paramètre forçant le hub (changer d'espace)."],
     ["Un élève connu n'a pas à rechoisir son programme à chaque ouverture.",
      "Le lien « changer d'espace » ramène au hub de manière fiable."])
spec("Spécification — Séparation des accès",
     ["Module de décision d'accès unique, testé, partagé par toutes les routes.",
      "Le tuteur élève refuse les comptes purement prof ou parent.",
      "Les routes prof exigent un rôle enseignant ; les routes parent un compte parent lié."],
     ["Un élève ne peut pas appeler les routes prof/parent.",
      "Un prof/parent ne peut pas utiliser le tuteur élève."])
spec("Spécification — Tuteur et bilans",
     ["Guidage socratique pour les exercices ; réponse directe pour le factuel.",
      "Streaming token par token, jusqu'à la fin de la réponse.",
      "À la fin d'une session, produire un bilan (acquis, fragilités, zone rouge, prochaine étape)."],
     ["Le bilan met à jour le statut de la matière et la progression.",
      "Les zones rouges sont priorisées aux sessions suivantes."])
spec("Spécification — Onboarding chat",
     ["Détecter une salutation ou un égarement et proposer des options.",
      "Détecter une classe nommée et basculer vers son menu.",
      "Ne jamais interrompre une vraie question."],
     ["Un message « bonjour » propose un guidage ; une vraie question reçoit une réponse."])
spec("Spécification — Espace enseignant",
     ["Sélection guidée en cascade matière → filière → notion sur tout le programme.",
      "Choix d'une filière (ex. F1) → matières de la filière ; choix d'une matière → notions prévues.",
      "Génération en streaming complète (jamais tronquée), affichage ultra-rapide.",
      "PDF de marque systématique, complet, premium, épuré et pédagogique."],
     ["Le 3e usage sans abonnement renvoie le paywall.",
      "Le PDF généré n'est jamais vide et reflète exactement la demande.",
      "La réponse de l'IA se termine toujours proprement."])
spec("Spécification — Espace parent",
     ["Liaison vérifiée par numéro + prénom de l'enfant ; consentement tracé.",
      "Lecture contrôlée en base (un parent ne voit que ses enfants).",
      "Dashboard épuré, professionnel, détaillé et sans contradiction, sur les deux interfaces."],
     ["Une liaison erronée est refusée avec un message clair.",
      "Les données affichées correspondent au seul enfant lié et reflètent son activité réelle."])
spec("Spécification — Dashboard admin",
     ["Agréger les analytics via des fonctions de base réservées au super-admin."],
     ["Accès refusé hors super-admin.",
      "KPI, graphiques et tables se chargent depuis les fonctions dédiées."])
spec("Spécification — Classes d'examen",
     ["Sélecteur de série ; filtrage des épreuves ; PDF par épreuve."],
     ["Toutes les séries sont accessibles ; les épreuves correspondent à la série choisie."])
spec("Spécification — Paiement",
     ["Montant résolu côté serveur ; USSD Push ; webhook signé.",
      "Activation du profil selon le type de payeur."],
     ["Un paiement réussi active l'abonnement correct et génère un reçu.",
      "Un échec laisse l'état cohérent et rejouable."])
spec("Spécification — Marketing cross-canal",
     ["Lien WhatsApp présent et adapté sur chaque interface.",
      "En web, invitation à rejoindre WhatsApp et à télécharger l'application.",
      "Félicitations à l'inscription ; canal mesuré et enregistré."],
     ["Le lien WhatsApp est visible partout et fonctionne sur les deux interfaces."])

# ===== PARTIE VI =====
P("Partie VI — Architecture technique")
sec("Vue d'ensemble de l'architecture", [
    ("table", ["Couche", "Choix"],
     [["Front", "Next.js 14 + TypeScript, déploiement Vercel."],
      ["Interfaces", "Maquettes HTML servies en iframe."],
      ["Plomberie", "eli-bridge.js : auth, streaming, OTP, hydratation des données."],
      ["Backend", "Supabase : Auth JWT, Postgres, RLS, fonctions security definer, Storage."],
      ["IA", "Modèles Gemini en streaming SSE."],
      ["Sécurité", "Rate limiting, en-têtes de sécurité, verrou anti-mock."]],
     [38, 132]),
])
sec("Pile technique et déploiement", [
    ("li", "Hébergement front et API sur Vercel ; base et auth sur Supabase (projet ELI)."),
    ("li", "Environnements : prévisualisation (recette) et production."),
    ("li", "Variables : clés publiques anon, clé de service serveur, clé IA, numéro du bot WhatsApp."),
    ("li", "Aucun secret côté client."),
])
sec("Frontend et maquettes", [
    "Les interfaces élève, enseignant et parent sont des maquettes HTML soignées servies en iframe, "
    "tandis que le routage et les API sont gérés par Next.js.",
    ("li", "Pages : accueil, /national, /aefe, /[program]/enseignant, /[program]/parent, /admin."),
    ("li", "Navigation interne aux maquettes gérée côté client."),
])
sec("eli-bridge.js", [
    "Le bridge est la couche de liaison entre les maquettes et le backend.",
    ("li", "Initialise le client d'authentification et gère la session."),
    ("li", "Effectue les requêtes authentifiées (chat en streaming, progression, hydratation)."),
    ("li", "Gère l'OTP WhatsApp, l'onboarding, le sélecteur d'examen, le marketing cross-canal."),
])
sec("Backend Supabase", [
    ("li", "Authentification JWT (OTP WhatsApp)."),
    ("li", "Base Postgres avec RLS et fonctions security definer."),
    ("li", "Stockage des fichiers (PDF de marque, reçus)."),
    ("li", "Migrations versionnées (0001 à 0021)."),
])
sec("Couche IA", [
    ("li", "Modèles Gemini (flash / flash-lite) selon l'usage."),
    ("li", "Streaming SSE pour le tuteur et l'espace enseignant, jusqu'à la fin de la réponse."),
    ("li", "Prompts encadrés par le Master Prompt (pédagogie, sécurité mineurs)."),
])
sec("Sécurité applicative", [
    ("li", "Validation stricte des entrées (schémas)."),
    ("li", "Rate limiting et en-têtes de sécurité."),
    ("li", "Verrou anti-mock interdisant les données fictives en production."),
    ("li", "Gestion des secrets côté serveur uniquement."),
])

# ===== PARTIE VII =====
P("Partie VII — Modèle de données")
sec("Vue d'ensemble du schéma", [
    "Le schéma Postgres est versionné par migrations et constitue la source de vérité. Il couvre les "
    "domaines élève, paiement, enseignant, parent, examens, rôles et analytics.",
])
sec("Tables cœur élève", [
    ("table", ["Table", "Colonnes clés"],
     [["profiles", "id, first_name, program, class_key, serie, is_paid, paid_until, parent_phone_enc."],
      ["progress", "user_id, program, subject, status, last_chapter, strengths, improvements, red_zones."],
      ["learning_events", "user_id, program, subject, concept, success, channel, created_at."],
      ["engagement", "user_id, streak_current, streak_best, total_sessions, total_minutes, last_active_date."],
      ["work_sessions", "user_id, pillar, subject, title, summary, duration_min, started_at."]],
     [40, 130]),
])
sec("Tables paiement", [
    ("table", ["Table", "Colonnes clés"],
     [["plans", "id, program, label, amount_fcfa, duration_days."],
      ["payments", "tx_id, user_id, program, plan_id, amount_fcfa, status, payer_kind, invoice_path."],
      ["notifications", "user_id, channel, kind, status."]],
     [40, 130]),
])
sec("Tables enseignant", [
    ("table", ["Table", "Colonnes clés"],
     [["teacher_profiles", "user_id, program, status, is_paid, paid_until, trial_count."],
      ["classes / class_enrollments", "classes et inscriptions, avec fonctions anti-récursion."],
      ["teacher_resources", "program, class_key, subject, notion, kind, title, content."]],
     [48, 122]),
])
sec("Tables parent", [
    ("table", ["Table", "Colonnes clés"],
     [["parent_profiles", "user_id, full_name, whatsapp, created_at."],
      ["parent_links", "parent_user_id, child_user_id, status ; clé d'étanchéité."],
      ["parental_consents", "user_id (enfant), parent_name, parent_phone_enc (haché)."]],
     [42, 128]),
])
sec("Tables examens, curriculum et rôles", [
    ("table", ["Table", "Colonnes clés"],
     [["exam_papers", "exam, program, serie, subject, title, year, drive_file_id, status."],
      ["curriculum", "program, class_key, payload (subjects, by_serie…), country_code."],
      ["user_roles", "user_id, role (student, teacher, school_admin, ministry, parent, super_admin)."]],
     [38, 132]),
])
sec("Fonctions de base (RPC)", [
    ("li", "is_super_admin() : garde des fonctions d'analytics."),
    ("li", "admin_overview, admin_usage_by_subject, admin_red_zones, admin_pillar_usage, admin_recent_payments, admin_signups_timeseries."),
    ("li", "parent_link_by_phone : liaison vérifiée ; parent_children, parent_child_overview : lecture stricte."),
    ("li", "my_scope, in_school_hours : périmètre élève et horaires de classe."),
])
sec("Politiques RLS", [
    ("li", "Chaque table sensible limite les lignes visibles à leur propriétaire."),
    ("li", "Les accès transverses passent par des fonctions security definer qui vérifient le droit."),
    ("li", "Le rôle parent est cloisonné aux enfants explicitement liés."),
])
sec("Annexe des migrations", [
    ("table", ["Migrations", "Objet"],
     [["0001 à 0015", "Socle : profils, progression, événements, engagement, sessions, paiements, plans, RLS, curriculum, épreuves."],
      ["0016 / 0017", "Espace et profils enseignants."],
      ["0018", "Analytics admin + colonnes canal/facturation."],
      ["0019", "Distinction du payeur (élève / enseignant)."],
      ["0020 / 0021", "Rôle parent, profils, liens, consentements, fonctions de lecture contrôlée."]],
     [34, 136]),
])

# ===== PARTIE VIII =====
P("Partie VIII — Interfaces de programmation et flux")
sec("Conventions API", [
    ("li", "Routes Next.js, réponses JSON, authentification par jeton."),
    ("li", "Validation stricte des entrées ; codes d'erreur explicites (401, 402, 403, 404)."),
    ("li", "Pas de secret exposé ; clé de service côté serveur uniquement."),
])
sec("Endpoints élève", [
    ("table", ["Route", "Rôle"],
     [["POST /api/ai/chat", "Tuteur IA en streaming (réservé aux apprenants)."],
      ["POST /api/ai/trial", "Essai du tuteur sans compte."],
      ["POST /api/progress", "Bilan + événement d'apprentissage avec canal."],
      ["GET /api/exam/papers", "Épreuves filtrées par série / programme / examen."]],
     [55, 115]),
])
sec("Endpoints enseignant", [
    ("table", ["Route", "Rôle"],
     [["POST /api/teacher/register", "Inscription (rôle + profil)."],
      ["GET /api/teacher/me", "Profil enseignant."],
      ["POST /api/ai/teacher", "Génération de matériel ; gating essais/abonnement."],
      ["POST /api/teacher/pdf", "PDF de marque du matériel."]],
     [55, 115]),
])
sec("Endpoints parent", [
    ("table", ["Route", "Rôle"],
     [["POST /api/parent/register", "Activation du compte parent."],
      ["POST /api/parent/link", "Liaison à un enfant (vérifiée)."],
      ["GET /api/parent/me", "Profil + enfants reliés."],
      ["GET /api/parent/child", "Tableau de bord d'un enfant (contrôle du lien)."]],
     [55, 115]),
])
sec("Endpoints admin et configuration", [
    ("table", ["Route", "Rôle"],
     [["GET /api/admin/overview", "Agrégat des analytics (super-admin)."],
      ["POST /api/pay/init", "Initie un paiement USSD (élève ou enseignant)."],
      ["POST /api/pay/webhook", "Confirmation de paiement et activation."],
      ["GET /api/config", "Config publique (clés anon, numéro du bot WhatsApp)."]],
     [55, 115]),
])
sec("Flux d'authentification (OTP WhatsApp)", [
    ("li", "1) Saisie du numéro ; demande d'OTP (canal WhatsApp)."),
    ("li", "2) Envoi du code via l'opérateur."),
    ("li", "3) Vérification du code ; établissement de la session JWT."),
    ("li", "4) Création du profil et attribution du rôle selon l'espace."),
    ("li", "5) Message WhatsApp d'accueil (template à configurer côté opérateur)."),
])
sec("Flux de paiement (USSD Push)", [
    ("li", "1) Choix de la formule et saisie du numéro mobile money."),
    ("li", "2) Résolution serveur du montant ; création d'un paiement « pending » ; USSD Push."),
    ("li", "3) Validation sur le téléphone."),
    ("li", "4) Notification du webhook (signature vérifiée)."),
    ("li", "5) Passage en « success », activation du bon profil, reçu, notification parent si pertinent."),
])

# ===== PARTIE IX =====
P("Partie IX — Rôles, sécurité et conformité")
sec("Matrice des rôles et permissions", [
    ("table", ["Rôle", "Permissions"],
     [["Élève", "Tuteur, cours, annales, fiches, son suivi. Pas d'accès prof/parent/admin."],
      ["Enseignant", "Génération + PDF, ses classes/ressources. Pas le tuteur élève."],
      ["Parent", "Suivi de ses enfants reliés uniquement."],
      ["School_admin / Ministry", "Vues agrégées selon le périmètre."],
      ["Super_admin", "Accès transverse complet (supervision)."]],
     [42, 128]),
])
sec("Étanchéité des espaces", [
    "L'étanchéité est garantie à deux niveaux : contrôle applicatif (module de décision testé) et "
    "contrôle en base (RLS + fonctions security definer).",
    ("li", "Un élève, un prof et un parent ne voient jamais les données des autres rôles."),
    ("li", "Le tuteur élève est inaccessible aux comptes prof/parent."),
])
sec("Protection des mineurs", [
    "Priorité absolue, au-dessus de toute autre considération.",
    ("li", "Aucun contenu romantique, sexuel ou suggestif impliquant ou s'adressant à un mineur."),
    ("li", "Pas d'isolement de l'élève vis-à-vis de ses parents ou adultes de confiance ; pas de secret."),
    ("li", "Aucune incitation à un comportement dangereux."),
    ("li", "En cas de détresse : accueil, pas de diagnostic, orientation vers un adulte de confiance."),
    "Le détail figure dans le Master Prompt — Éducation engagée.",
])
sec("Confidentialité et données", [
    ("li", "Minimisation des données collectées."),
    ("li", "Cloisonnement par rôle et, à l'international, par code pays."),
    ("li", "Droit à l'oubli ; pas de revente ni de publicité ciblée à partir des données élèves."),
    ("li", "Consentement parental et transparence via l'espace parent."),
])
sec("Exigences non fonctionnelles", [
    ("table", ["Exigence", "Détail"],
     [["Performance", "Streaming des réponses ; interface légère ; affichage ultra-rapide."],
      ["Sécurité", "RLS, security definer, validation, en-têtes, rate limiting."],
      ["Accessibilité", "Contrastes, navigation clavier, libellés, hiérarchie de titres."],
      ["Résilience", "Mode Bougie : hors ligne, faible data, reprise sans perte."],
      ["Confidentialité", "Minimisation, cloisonnement, droit à l'oubli."]],
     [40, 130]),
])

# ===== PARTIE X =====
P("Partie X — Design, contenu, qualité et exploitation")
sec("Charte visuelle et identité", [
    ("table", ["Élément", "Définition"],
     [["Nom", "Éli."],
      ["Devise", "L'intelligence au service de ta réussite."],
      ["Logo", "Cercle vert, lettre É dorée, flamme de bougie, trois points en base."],
      ["Couleurs", "Verts profonds, or, fond crème ; contrastes élevés."],
      ["Ton", "Chaleureux, clair ; tutoiement élève, vouvoiement parent/enseignant."]],
     [38, 132]),
    "Tous les documents de marque reprennent ce logo et cette devise, en couverture et en pied de page.",
])
sec("Principes UX et accessibilité", [
    ("li", "Parcours courts, peu d'étapes, libellés clairs."),
    ("li", "Contrastes élevés, lisibilité, compatibilité Mode Bougie."),
    ("li", "Retours immédiats (streaming, états de chargement)."),
    ("li", "Messages d'erreur compréhensibles et orientés solution."),
])
sec("Gouvernance des contenus pédagogiques", [
    ("li", "Cours 100 % originaux, jamais de reproduction de contenu protégé."),
    ("li", "Production par lots, format pédagogique constant."),
    ("li", "Double livrable : PDF de marque + Google Doc éditable."),
    ("li", "Validation enseignante avant ingestion."),
])
sec("Format pédagogique des cours", [
    "Chaque chapitre suit un format constant : Objectif, Prérequis, Cours, Méthode, Exemple, Erreurs "
    "fréquentes, Entraînement.",
    "Ce cadre garantit la cohérence, facilite la révision et structure l'apprentissage de l'élève.",
])
sec("Plan de qualité et de tests", [
    "Chaîne de vérification obligatoire avant toute livraison, sur une extraction propre :",
    ("table", ["Étape", "Contrôle"],
     [["Dépendances", "Installation reproductible."],
      ["Typage", "Vérification TypeScript sans émission."],
      ["Anti-mock", "Verrou : pas de données fictives en production."],
      ["Tests", "Suite unitaire (94 tests au dernier point)."],
      ["Build", "Build de production sans erreur."],
      ["Maquettes", "Vérification de syntaxe des scripts."]],
     [40, 130]),
    "Toute régression bloque la livraison.",
])
sec("Déploiement et environnements", [
    ("li", "Prévisualisation pour la recette, production pour le lancement."),
    ("li", "Migrations idempotentes ; dépôt = source de vérité."),
    ("li", "Vérification complète avant chaque mise en ligne ; recette visuelle des maquettes."),
])
sec("Supervision et indicateurs", [
    ("li", "Indicateurs d'usage, de progression, de revenus et de canaux dans le centre de commandement."),
    ("li", "Suivi des paiements et des zones rouges."),
    ("li", "Alimentation des décisions produit par les données réelles."),
])
sec("Risques et parades", [
    ("table", ["Risque", "Parade"],
     [["Dépendances externes", "Webhooks signés, états rejouables, abstraction des fournisseurs."],
      ["Volume de contenu", "Production par lots, gouvernance éditoriale."],
      ["Abus", "Rate limiting, gating, étanchéité."],
      ["Infrastructure", "Mode Bougie."],
      ["Protection mineurs", "Règles intangibles et orientation vers adultes de confiance."]],
     [42, 128]),
])
sec("Roadmap", [
    ("li", "Compléter les cours pour toutes les matières, niveaux et séries (par lots, en continu)."),
    ("li", "Finaliser le template WhatsApp post-OTP côté opérateur."),
    ("li", "Recette visuelle complète des maquettes en préversion."),
    ("li", "Préparer l'expansion francophone (document dédié)."),
    ("quote", "L'intelligence au service de ta réussite."),
])
sec("Annexes et références", [
    ("li", "Master Prompt — Éducation engagée (pédagogie, ton, sécurité mineurs)."),
    ("li", "CDC & Cahier Technique (synthèse technique)."),
    ("li", "CDC Expansion internationale (stratégie multi-pays)."),
    ("li", "Analyse concurrentielle (positionnement)."),
])

# ===== PARTIE XI =====
P("Partie XI — Approfondissements techniques")
sec("Dictionnaire de données — profils et progression", [
    "Description fine des champs les plus utilisés côté élève.",
    ("table", ["Champ", "Type", "Description"],
     [["profiles.program", "enum", "national | aefe. Détermine l'interface et le référentiel."],
      ["profiles.class_key", "texte", "Classe de l'élève (ex. tle, 3e, cm2)."],
      ["profiles.serie", "texte", "Série pour le lycée national (A1, A2, B, C, D, E)."],
      ["progress.status", "enum", "vert | orange | rouge ; statut de maîtrise par matière."],
      ["progress.red_zones", "json", "Notions fragiles à retravailler en priorité."],
      ["learning_events.channel", "enum", "site | app | whatsapp ; canal de l'interaction."],
      ["engagement.streak_current", "entier", "Nombre de jours consécutifs d'activité."]],
     [44, 24, 102]),
])
sec("Dictionnaire de données — enseignant et parent", [
    ("table", ["Champ", "Type", "Description"],
     [["teacher_profiles.trial_count", "entier", "Nombre d'essais gratuits déjà consommés (max 2)."],
      ["teacher_profiles.is_paid", "booléen", "Abonnement enseignant actif."],
      ["teacher_resources.notion", "texte", "Notion précise traitée par la ressource générée."],
      ["parent_links.status", "enum", "active | revoked ; autorité de l'étanchéité parent-enfant."],
      ["parental_consents.parent_phone_enc", "binaire", "Empreinte du numéro parent (hachée, non réversible)."]],
     [50, 24, 96]),
])
sec("Catalogue des erreurs API", [
    "Codes normalisés renvoyés par les routes, pour un traitement client cohérent.",
    ("table", ["Code", "Signification", "Action client"],
     [["401", "Non authentifié", "Inviter à se connecter (OTP WhatsApp)."],
      ["402", "Paiement requis (paywall enseignant)", "Afficher les formules d'abonnement."],
      ["403", "Mauvais espace / accès interdit", "Message dédié, rediriger vers le bon espace."],
      ["404", "Ressource introuvable (ex. liaison enfant)", "Message clair, proposer une correction."],
      ["429", "Trop de requêtes (rate limit)", "Inviter à réessayer plus tard."],
      ["500", "Erreur serveur", "Message générique, journaliser, ne pas bloquer la session."]],
     [18, 80, 72]),
])
sec("Machine à états — session de tutorat", [
    ("li", "Ouverture : la session démarre, le contexte (matière, classe) est chargé."),
    ("li", "Échange : alternance question de l'élève / guidage d'Éli, en streaming."),
    ("li", "Détection de fin : l'élève clôt ou change de sujet."),
    ("li", "Bilan : génération du bilan (acquis, fragilités, zone rouge, prochaine étape)."),
    ("li", "Persistance : écriture de la progression et d'un événement d'apprentissage."),
    ("li", "Reprise : à la session suivante, priorité aux zones rouges identifiées."),
])
sec("Machine à états — paiement", [
    ("li", "Initié : paiement créé en statut « pending », montant résolu côté serveur."),
    ("li", "En attente : USSD Push envoyé, attente de validation sur le téléphone."),
    ("li", "Confirmé : webhook signé reçu, statut « success », profil activé, reçu généré."),
    ("li", "Échec : statut « failed », état cohérent, possibilité de rejouer."),
    ("li", "Expiré : sans validation dans le délai, le paiement est marqué expiré."),
])
sec("Sélecteur enseignant en cascade — spécification détaillée", [
    "L'enseignant doit accéder à l'intégralité de son programme et composer son besoin par étapes.",
    ("li", "Étape 1 — Filière/Série : l'enseignant choisit la filière (ex. F1, C, D, A…)."),
    ("li", "Étape 2 — Matière : la liste des matières se met à jour pour n'afficher que celles de la filière choisie."),
    ("li", "Étape 3 — Notion : un menu déroule toutes les notions prévues pour la matière et la filière retenues."),
    ("li", "L'enseignant peut sélectionner plusieurs notions ; la génération couvre exactement la sélection."),
    ("callout", "Critère d'acceptation",
     "À chaque changement de filière, la liste des matières et des notions est recalculée. Le PDF généré "
     "couvre précisément la sélection, est complet, premium et épuré, et s'affiche très rapidement."),
])
sec("Génération du PDF enseignant — exigences", [
    ("li", "Le PDF n'est jamais vide : il contient l'intégralité du contenu généré."),
    ("li", "Mise en page premium et épurée, identité Éli (logo, devise)."),
    ("li", "Ton et structure d'un véritable support pédagogique, jamais un rendu générique."),
    ("li", "Affichage et téléchargement rapides ; pas d'attente inutile."),
    ("li", "Disponible à l'identique sur les interfaces National et AEFE."),
])
sec("Dashboard parent — exigences détaillées", [
    ("li", "Vue épurée et professionnelle, lisible d'un coup d'œil."),
    ("li", "Synthèse fidèle : temps passé, séries de jours, nombre de sessions."),
    ("li", "Points forts, points à améliorer et zones rouges agrégés sans contradiction."),
    ("li", "Matières travaillées avec statut et dernière notion."),
    ("li", "Historique récent des séances (matière, durée, date, résumé)."),
    ("li", "Strictement limité aux enfants reliés ; identique sur les deux interfaces."),
])
sec("WhatsApp omniprésent — exigences", [
    ("li", "Le lien WhatsApp est visible et accessible sur chaque interface (élève, enseignant, parent)."),
    ("li", "Il s'adapte au contexte de la page et reste discret mais toujours présent."),
    ("li", "En version web, une invitation propose de poursuivre sur WhatsApp et de télécharger l'application."),
    ("li", "À l'inscription, un message de félicitations ouvre la passerelle WhatsApp."),
    ("li", "Le canal d'usage (site, app, WhatsApp) est mesuré pour le pilotage."),
])
sec("Journalisation et observabilité", [
    ("li", "Journaliser les erreurs serveur sans exposer de données sensibles."),
    ("li", "Tracer les paiements (création, confirmation, échec) pour le rapprochement."),
    ("li", "Suivre les indicateurs d'usage et de progression dans le centre de commandement."),
    ("li", "Conserver une trace de consentement parental."),
])
sec("Stratégie de tests détaillée", [
    ("table", ["Famille de tests", "Couverture"],
     [["Accès / rôles", "Étanchéité élève / prof / parent / admin."],
      ["Gating enseignant", "Essais gratuits puis paywall."],
      ["Examens", "Filtrage par série, séries multiples."],
      ["Onboarding", "Détection de classe, guidage, non-interruption d'une vraie question."],
      ["Suivi / progression", "Mise à jour des statuts, zones rouges."],
      ["Sécurité", "Validation des entrées, en-têtes, anti-mock."]],
     [48, 122]),
    "94 tests unitaires au dernier point de contrôle ; toute régression bloque la livraison.",
])
sec("Accessibilité — détail", [
    ("li", "Contrastes conformes pour la lisibilité, y compris en Mode Bougie."),
    ("li", "Navigation au clavier et libellés explicites (ARIA) sur les éléments interactifs."),
    ("li", "Hiérarchie de titres claire ; tableaux légendés."),
    ("li", "Tailles de police confortables et zones cliquables suffisantes sur mobile."),
])
sec("Internationalisation et contexte", [
    ("li", "Le français reste la langue d'enseignement ; les exemples sont ancrés localement."),
    ("li", "Le code pays prépare le cloisonnement multi-pays pour l'expansion."),
    ("li", "Les intitulés d'examens et de classes s'adaptent au pays."),
])
sec("Plan de reprise et continuité", [
    ("li", "Sauvegardes régulières de la base ; migrations idempotentes et rejouables."),
    ("li", "États de paiement rejouables en cas d'incident opérateur."),
    ("li", "Dégradation gracieuse en Mode Bougie lorsque le réseau est indisponible."),
])
sec("Conformité réglementaire", [
    ("li", "Respect des règles locales sur les données personnelles, en particulier des mineurs."),
    ("li", "Consentement parental documenté et accessible."),
    ("li", "Conformité aux règles de paiement et de facturation applicables."),
    ("li", "Revue de conformité préalable à toute ouverture d'un nouveau pays."),
])
sec("Critères de réception du lancement", [
    ("li", "Les deux interfaces (National et AEFE) offrent les mêmes services sans régression."),
    ("li", "Espaces élève, enseignant et parent fonctionnels et étanches."),
    ("li", "Génération de PDF enseignant complète, premium et rapide."),
    ("li", "Réponses IA toujours terminées proprement."),
    ("li", "Lien WhatsApp présent partout ; invitation web active."),
    ("li", "Chaîne de vérification (typage, tests, anti-mock, build) au vert."),
])


if __name__ == "__main__":
    out = "/mnt/user-data/outputs/Eli-CDC-General-Application.pdf"
    # Saut de page selectif (~1 section sur 2) pour caler le document autour de 60 pages.
    _hs = [s for s in S if s.get("h")]
    for _i, _s in enumerate(_hs):
        if _i % 2 == 1 or _i in (2, 12, 28):
            _s["brk"] = True
    build_document(out, TITLE, SUBTITLE, BRAND_SUB, S, intro=INTRO,
                   reference="ELI-CDC-2026", version="1.0", date="Juin 2026",
                   confidential=True, page_per_section=False)
    from pypdf import PdfReader
    print("OK ->", out, "| pages:", len(PdfReader(out).pages))

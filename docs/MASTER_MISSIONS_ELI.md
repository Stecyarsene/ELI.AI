# ELI — DOSSIER MAÎTRE DES MISSIONS
Version: 1.0
Statut: ACTIF
Mode de travail: LOT UNIQUE À LA FOIS
Référence: mission/lot-00-baseline

## RÈGLE ABSOLUE
ELI est désormais piloté par ce dossier maître.
Aucun lot suivant ne commence tant que le lot courant n'est pas déclaré CLOSED avec preuves.
Une mission CLOSED doit être vérifiée par code, tests, données/runtime lorsque pertinent, puis documentée.
Aucune affirmation "fait" sans preuve.
Les statuts autorisés sont: VERIFIED, PARTIAL, MISSING, UNKNOWN, DISCONNECTED, DEMO ONLY, PRODUCTION ONLY, NOT CLOSED, CLOSED.

## PROTOCOLE DE CLÔTURE D'UN LOT
1. État initial vérifié.
2. Sous-missions exécutées.
3. Fichiers/code concernés identifiés.
4. Données/runtime concernés vérifiés.
5. Tests exécutés.
6. Régressions recherchées.
7. Résultat avant/après consigné.
8. Preuves conservées.
9. Verdict CLOSED ou NOT CLOSED.
10. Seulement après CLOSED: passage au lot suivant.

## LOTS DE CLÔTURE

### LOT 00 — GEL ET BASELINE
Objectif: établir la photographie de référence incontestable d'ELI avant toute correction.
Sous-missions:
- geler la référence du code;
- identifier dépôt, branche, commit et source de référence;
- inventorier frontend, backend, packages, Supabase, Edge Functions, migrations, tests, maquette et artefacts;
- distinguer PRODUCTION, DEMO, SHARED, LEGACY, UNKNOWN;
- comparer source Git avec runtime Supabase;
- relever les divergences reproductibles;
- établir la baseline des tests/builds/architecture;
- enregistrer les risques et blocages connus;
- produire le rapport de clôture du lot 00.
Critère CLOSED: baseline complète, traçable et reproductible.

### LOT 01 — RÉCONCILIATION GIT ↔ SUPABASE
Objectif: rendre le dépôt capable de reconstruire le runtime.
- réconcilier migrations;
- fonctions SQL/RPC;
- policies/RLS;
- triggers/indexes/extensions/config;
- Edge Functions;
- vérifier que le runtime ne contient plus d'élément critique absent de la source canonique;
- tester une reconstruction/staging contrôlée.

### LOT 02 — SÉCURITÉ ET GOUVERNANCE SUPABASE
- RLS;
- policies;
- SECURITY DEFINER;
- fonctions exposées;
- OTP;
- rôles;
- permissions;
- secrets/service role;
- password protection;
- indexes/PK;
- politiques permissives multiples;
- matrice fonction → appelant → autorisation → test positif/négatif.

### LOT 03 — ARCHITECTURE FRONTEND
- réduire la concentration du runtime;
- découper app/routing/design-system/components/services/state/features;
- conserver les fonctionnalités;
- supprimer les couplages inutiles;
- tests de non-régression.

### LOT 04 — DESIGN SYSTEM ELI
- typographie;
- couleurs;
- espacements;
- boutons;
- formulaires;
- cartes;
- tableaux;
- navigation;
- modales;
- notifications;
- états de chargement/erreur;
- desktop/mobile;
- accessibilité;
- verrouillage contre les dérives visuelles.

### LOT 05 — HUB ET NAVIGATION GLOBALE
- onboarding;
- connexion;
- sessions;
- rôles;
- accès aux espaces;
- deep links;
- logout;
- navigation desktop/mobile;
- SuperAdmin;
- zéro clic mort;
- séparation claire des espaces.

### LOT 06 — ESPACE ÉLÈVE
- onboarding;
- rattachement automatique élève/école/classe;
- niveaux et cycles;
- cours;
- matières;
- leçons;
- exercices;
- QCM;
- corrections;
- progression;
- difficulté;
- reprise;
- emploi du temps;
- absences;
- notifications;
- projets;
- orientation;
- Éli conversationnel.

### LOT 07 — LEARNING OS / INTELLIGENCE PÉDAGOGIQUE
Chaîne cible:
learning_events → observations → mastery → compétences → progression → adaptation → recommandation.
- intégrité des événements;
- calculs;
- explicabilité;
- tests;
- validation psychométrique;
- aucune prétention scientifique non démontrée.

### LOT 08 — ESPACE PARENT
- relation parent/enfant;
- plusieurs enfants;
- suivi;
- emploi du temps;
- progrès;
- absences/exclusions;
- notifications;
- bulletins;
- XGEST;
- sécurité des données.

### LOT 09 — ESPACE ENSEIGNANT
- classes;
- élèves;
- multi-établissements;
- scopes;
- devoirs;
- leçons;
- ressources;
- suivi;
- difficultés;
- progression;
- génération PDF/Excel/diapo;
- contrôle strict du périmètre enseignant.

### LOT 10 — ESPACES INSTITUTIONNELS
Espaces distincts:
- établissement;
- inspection;
- académie;
- ministère.
- hiérarchie;
- périmètres;
- statistiques;
- gouvernance;
- isolation des données;
- routage direct selon rôle/scope.

### LOT 11 — CENTRE DE COMMANDEMENT / SUPERADMIN
- utilisateurs;
- rôles;
- établissements;
- contenus;
- curriculum;
- gouvernance;
- santé système;
- observabilité;
- configuration;
- audit;
- finance;
- séparation avec les espaces institutionnels.

### LOT 12 — CURRICULUM GABONAIS
- primaire: 1re année à 5e année;
- secondaire: 6e à Terminale;
- technique à partir de Seconde;
- compatibilité cycle ↔ établissement;
- filtres stricts.

### LOT 13 — CONTENUS PÉDAGOGIQUES
- matières;
- chapitres;
- notions;
- leçons;
- exercices;
- évaluations;
- corrections;
- références;
- niveaux/cycles;
- validation pédagogique, psychométrique et IA.

### LOT 14 — IA ÉLI
Chaîne:
frontend → API → AI Gateway → provider → guardrails → réponse → observabilité.
- OpenAI;
- Gemini;
- fallback;
- prompts;
- contexte;
- sécurité;
- quotas;
- coûts;
- timeout/retry;
- traçabilité;
- aucune clé fournisseur dans le frontend.

### LOT 15 — VOIX
- STT;
- TTS;
- ElevenLabs;
- navigateur;
- fallback;
- accessibilité;
- latence;
- interruption;
- historique;
- consentement.

### LOT 16 — NOTIFICATIONS / XGEST
- événements;
- outbox;
- notifications;
- canaux;
- app;
- parent;
- enseignant;
- établissement;
- WhatsApp;
- ingestion XGEST;
- bulletin → élève/parent;
- distinction création événement / livraison.

### LOT 17 — MON AVENIR / ORIENTATION
- profil;
- intérêts;
- compétences;
- résultats;
- recommandations;
- parcours;
- formations;
- métiers;
- contexte Gabon;
- limites psychométriques explicites.

### LOT 18 — TERRITOIRE GABONAIS
- 9 provinces;
- départements;
- villes;
- établissements;
- coordonnées;
- rattachements;
- filtres;
- statistiques territoriales.

### LOT 19 — ACCESSIBILITÉ / INCLUSION
- clavier;
- contraste;
- lecteur d'écran;
- taille du texte;
- voix;
- difficultés visuelles/auditives/lecture;
- mobile;
- faible connexion;
- offline.

### LOT 20 — PERFORMANCE
- bundles;
- lazy loading;
- cache;
- images/fonts;
- PWA;
- réseau;
- SQL;
- RPC;
- N+1;
- indexes;
- policies;
- backend.

### LOT 21 — OBSERVABILITÉ
- logs;
- métriques;
- traces;
- erreurs;
- audit;
- alertes;
- traçage requête élève → API → DB → IA;
- protection des données sensibles.

### LOT 22 — TESTS
- unit;
- intégration;
- API;
- DB;
- E2E;
- sécurité;
- performance;
- environnement;
- correction des tests rouges;
- branche de production sans échec bloquant.

### LOT 23 — DEMO / PRODUCTION
- données fictives uniquement en DEMO;
- données réelles uniquement en PRODUCTION;
- aucun fallback fictif en production;
- séparation des environnements;
- protection contre contamination croisée.

### LOT 24 — STAGING / PRODUCTION
Flux:
LOCAL → STAGING → PROD.
- bases séparées;
- secrets séparés;
- variables séparées;
- fonctions séparées;
- frontend séparé;
- rollback vérifié.

### LOT 25 — CI/CD
Pipeline:
push → lint → typecheck → tests → architecture → sécurité → build → staging → E2E → approbation → production.
- artefacts;
- logs;
- blocage automatique en cas d'échec critique.

### LOT 26 — DOCUMENTATION
- architecture;
- ADR;
- API;
- DB;
- rôles;
- sécurité;
- déploiement;
- runbook;
- incidents;
- sauvegarde;
- restauration;
- onboarding développeur.

### LOT 27 — AUDIT FINAL
Comparer et certifier:
- maquette;
- frontend production;
- backend;
- DB;
- sécurité;
- IA;
- Learning OS;
- psychométrie;
- tests;
- déploiement;
- documentation.
Livrable final: ELI_FINAL_AUDIT.md.
Aucun point critique ouvert.

## JOURNAL DE PROGRESSION
- LOT 00: EN COURS
- LOT 01: BLOQUÉ PAR LOT 00
- LOT 02: BLOQUÉ PAR LOT 01
- LOT 03: BLOQUÉ PAR LOT 02
- LOT 04: BLOQUÉ PAR LOT 03
- LOT 05: BLOQUÉ PAR LOT 04
- LOT 06: BLOQUÉ PAR LOT 05
- LOT 07: BLOQUÉ PAR LOT 06
- LOT 08: BLOQUÉ PAR LOT 07
- LOT 09: BLOQUÉ PAR LOT 08
- LOT 10: BLOQUÉ PAR LOT 09
- LOT 11: BLOQUÉ PAR LOT 10
- LOT 12: BLOQUÉ PAR LOT 11
- LOT 13: BLOQUÉ PAR LOT 12
- LOT 14: BLOQUÉ PAR LOT 13
- LOT 15: BLOQUÉ PAR LOT 14
- LOT 16: BLOQUÉ PAR LOT 15
- LOT 17: BLOQUÉ PAR LOT 16
- LOT 18: BLOQUÉ PAR LOT 17
- LOT 19: BLOQUÉ PAR LOT 18
- LOT 20: BLOQUÉ PAR LOT 19
- LOT 21: BLOQUÉ PAR LOT 20
- LOT 22: BLOQUÉ PAR LOT 21
- LOT 23: BLOQUÉ PAR LOT 22
- LOT 24: BLOQUÉ PAR LOT 23
- LOT 25: BLOQUÉ PAR LOT 24
- LOT 26: BLOQUÉ PAR LOT 25
- LOT 27: BLOQUÉ PAR LOT 26

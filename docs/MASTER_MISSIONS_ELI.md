# ELI — DOSSIER MAÎTRE DES MISSIONS
Version: 1.1
Statut: ACTIF
Mode de travail: LOT UNIQUE À LA FOIS
Branche de mission: mission/lot-00-baseline

## RÈGLE ABSOLUE
ELI est désormais piloté par ce dossier maître.
Aucun lot suivant ne commence tant que le lot courant n'est pas déclaré CLOSED avec preuves.
Une mission CLOSED doit être vérifiée par code, tests, données/runtime lorsque pertinent, puis documentée.
Aucune affirmation "fait" sans preuve.

## STATUTS
VERIFIED · PARTIAL · MISSING · UNKNOWN · DISCONNECTED · DEMO ONLY · PRODUCTION ONLY · NOT CLOSED · CLOSED

## PROTOCOLE DE CLÔTURE
1. État initial vérifié.
2. Sous-missions exécutées.
3. Fichiers/code concernés identifiés.
4. Données/runtime concernés vérifiés.
5. Tests exécutés.
6. Régressions recherchées.
7. Résultat avant/après consigné.
8. Preuves conservées.
9. Verdict CLOSED ou NOT CLOSED.
10. Passage au lot suivant uniquement après CLOSED.

## LOTS
Voir les 27 lots détaillés dans ce même fichier: LOT 00 à LOT 27.

### LOT 00 — GEL ET BASELINE
Objectif: photographie de référence incontestable avant toute correction.
Critère CLOSED: baseline complète, traçable et reproductible.

### LOT 01 — RÉCONCILIATION GIT ↔ SUPABASE
Migrations, fonctions, RPC, RLS, policies, triggers, indexes, extensions, configuration, Edge Functions et reconstruction staging.

### LOT 02 — SÉCURITÉ ET GOUVERNANCE SUPABASE
RLS, policies, SECURITY DEFINER, fonctions exposées, OTP, rôles, permissions, secrets, password protection, PK/indexes et matrice de sécurité.

### LOT 03 — ARCHITECTURE FRONTEND
Découpage progressif du runtime, sans réécriture destructive ni perte fonctionnelle.

### LOT 04 — DESIGN SYSTEM ELI
Typographie, palette, composants, états, responsive distinct, accessibilité et verrouillage visuel.

### LOT 05 — HUB ET NAVIGATION
Onboarding, sessions, rôles, espaces, deep links, logout, mobile/desktop, SuperAdmin, zéro clic mort.

### LOT 06 — ESPACE ÉLÈVE
Rattachement automatique, niveaux, contenus, progression, Éli, emploi du temps, notifications, projets, orientation.

### LOT 07 — LEARNING OS
Événements → observations → mastery → compétences → progression → adaptation → recommandations, avec validation psychométrique.

### LOT 08 — ESPACE PARENT
Enfants, suivi, emploi du temps, progrès, absences, exclusions, notifications, bulletins, XGEST, sécurité.

### LOT 09 — ESPACE ENSEIGNANT
Classes, élèves, multi-établissements, devoirs, leçons, ressources, suivi, génération et contrôle de périmètre.

### LOT 10 — ESPACES INSTITUTIONNELS
Établissement, inspection, académie, ministère, scopes, hiérarchie, statistiques, isolation, routage.

### LOT 11 — SUPERADMIN / CENTRE DE COMMANDEMENT
Utilisateurs, rôles, établissements, contenus, curriculum, gouvernance, santé, observabilité, audit, finance, configuration.

### LOT 12 — CURRICULUM GABONAIS
1re à 5e année au primaire; 6e à Terminale au secondaire; technique dès Seconde; compatibilité cycle/établissement.

### LOT 13 — CONTENUS PÉDAGOGIQUES
Matières, chapitres, notions, leçons, exercices, évaluations, corrections, références et validation.

### LOT 14 — IA ÉLI
Frontend → API → AI Gateway → provider → guardrails → réponse → observabilité; providers, fallback, sécurité, quotas, coûts, traçabilité.

### LOT 15 — VOIX
STT, TTS, ElevenLabs, navigateur, fallback, accessibilité, latence, interruption, historique, consentement.

### LOT 16 — NOTIFICATIONS / XGEST
Événements, outbox, canaux, livraison, app, parent, enseignant, établissement, WhatsApp, ingestion XGEST.

### LOT 17 — MON AVENIR / ORIENTATION
Profil, intérêts, compétences, résultats, recommandations, parcours, formations, métiers, contexte Gabon et limites psychométriques.

### LOT 18 — TERRITOIRE GABONAIS
9 provinces, départements, villes, établissements, coordonnées, rattachements, filtres, statistiques.

### LOT 19 — ACCESSIBILITÉ / INCLUSION
Clavier, contraste, lecteur d'écran, taille texte, voix, difficultés, mobile, faible connexion, offline.

### LOT 20 — PERFORMANCE
Bundles, lazy loading, cache, images/fonts, PWA, réseau, SQL/RPC, N+1, indexes, policies, backend.

### LOT 21 — OBSERVABILITÉ
Logs, métriques, traces, erreurs, audit, alertes, traçage requête → API → DB → IA, protection des données.

### LOT 22 — TESTS
Unit, intégration, API, DB, E2E, sécurité, performance, environnement et suppression des échecs bloquants.

### LOT 23 — DEMO / PRODUCTION
Fictif uniquement DEMO, réel uniquement PRODUCTION, aucun fallback fictif en production, isolation stricte.

### LOT 24 — STAGING / PRODUCTION
LOCAL → STAGING → PROD, bases/secrets/variables/fonctions/frontends séparés, rollback.

### LOT 25 — CI/CD
Push → lint → typecheck → tests → architecture → sécurité → build → staging → E2E → approbation → production.

### LOT 26 — DOCUMENTATION
Architecture, ADR, API, DB, rôles, sécurité, déploiement, runbook, incidents, sauvegarde, restauration, onboarding.

### LOT 27 — AUDIT FINAL
Certification finale maquette/frontend/backend/DB/sécurité/IA/Learning/psychométrie/tests/déploiement/documentation.

## LOT 00 — ÉTAT ACTUEL
Dépôt: Stecyarsene/ELI.AI
Branche principale observée: main
Commit main observé: 2c9c725d485de80d27f8787e7d57fefe7d50d373
Branche de travail: mission/lot-00-baseline
Projet Supabase audité: szhdlixejgaqzafpirwv

### Écarts bloquants découverts
B01 — Le dépôt GitHub observé ne correspond pas à la source ELI récente utilisée lors de l'audit de septembre 2026. Le commit main observé date de juin 2026.
Statut: NOT CLOSED.

B02 — Lors de l'audit récent, la source auditée contenait 54 migrations alors que le runtime Supabase en exposait 357.
Statut: NOT CLOSED, à traiter LOT 01.

B03 — xgest-bulletin-ingest était active dans le runtime Supabase mais absente de la source ZIP auditée.
Statut: NOT CLOSED, à traiter LOT 01.

B04 — Supabase Advisor: 1 table RLS sans policy signalée; 112 SECURITY DEFINER à examiner; 69 cas de policies permissives multiples; 2 tables sans PK; protection mots de passe compromis à vérifier.
Statut: NOT CLOSED, LOT 02.

B05 — Frontend runtime principal ~1,9 Mo lors de l'audit.
Statut: PARTIAL, LOT 03.

B06 — Learning Core observé: 4 learning_events, 0 tentative QCM.
Statut: PARTIAL, LOT 07.

B07 — Certaines intégrations runtime IA/voix/WhatsApp restaient à prouver.
Statut: UNKNOWN/PARTIAL, LOTS 14-16.

B08 — HTTPS/HSTS/CORS et garanties complètes de déploiement restent à vérifier.
Statut: UNKNOWN, LOT 24-25.

## BASELINE SUPABASE OBSERVÉE
ACTIVE_HEALTHY · eu-west-1 · Postgres 17.6.1
173 tables publiques · 171 RLS · 225 policies · 314 fonctions publiques · 240 SECURITY DEFINER.
profiles 7 · institutions 84 · classes 2 · eleves 2 · learning_events 4 · eli_qcm_attempts 0.
Edge Functions: memoire, learning-observation, xgest-bulletin-ingest.

## BASELINE QUALITÉ OBSERVÉE
Build frontend: PASS.
architecture:check: PASS.
architecture:frontend-boundary: PASS.
Maquette: 117 tests, 112 pass, 5 échecs au moment de l'audit; plusieurs liés à l'environnement Playwright, avec une régression fonctionnelle identifiée.

## VERDICT LOT 00
NOT CLOSED.

Raison unique de blocage: la référence exacte du code récent ayant servi à l'audit n'est pas encore réconciliée avec le dépôt GitHub canonique. Fermer ce lot maintenant créerait une fausse baseline.

## PROCHAINE ACTION OBLIGATOIRE
Reconstituer/identifier la source récente exacte, la rattacher au dépôt canonique, puis seulement figer le commit de référence définitif.
LOT 01 reste bloqué jusqu'à cette clôture.

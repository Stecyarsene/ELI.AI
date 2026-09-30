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
Source ELI actuelle figée: ELI_SOURCE_MAITRE_CONSOLIDE_2026-09-26_BOUGIE_EMPLOI_TEMPS_CLOSURE(2).zip
SHA-256: 692e24dfa788e512a34fd54add3e5731238bb3b09babfa94adc218a9650c6cea
Taille: 12,742,224 octets
Inventaire: 689 fichiers dans l'archive
Référence GitHub de mission: mission/lot-00-baseline
Dépôt: Stecyarsene/ELI.AI
Projet Supabase: szhdlixejgaqzafpirwv

### Vérification source actuelle
npm test: 117 tests, 112 PASS, 5 FAIL.
4 échecs sont bloqués par l'absence de playwright-core.
1 régression fonctionnelle reste dans maquette/repondre.test.js.
Aucun de ces résultats n'est transformé artificiellement en PASS.

### Blocage GitHub
Le dépôt GitHub contient actuellement 161 fichiers sur la référence précédente; la source actuelle en contient 689.
La source actuelle n'est donc pas encore intégralement poussée dans GitHub.
Le dossier maître et la fiche de gel ont été poussés dans la branche mission/lot-00-baseline, mais le code complet n'est pas déclaré synchronisé.

### VERDICT LOT 00
NOT CLOSED.

### Action restante obligatoire
Importer intégralement la source actuelle dans GitHub, vérifier le nombre de fichiers, le commit de référence et la cohérence du contenu, puis seulement déclarer LOT 00 CLOSED et commencer LOT 01.

# LOT 00 — GEL ET BASELINE ELI

Date de création: 2026-09-30
Branche de travail: mission/lot-00-baseline
Dépôt canonique identifié: Stecyarsene/ELI.AI
Branche principale: main

## 1. Référence Git
Commit main observé lors du gel:
2c9c725d485de80d27f8787e7d57fefe7d50d373

Branche mission:
mission/lot-00-baseline

Commit de création du dossier maître:
075d80dfabb3288396f850d3fd2cda407b32ed52

## 2. Source canonique
Le dépôt Git est la source canonique du code produit.
Les maquettes et anciens fichiers HTML monolithiques restent des références UX/démonstration lorsqu'ils ne sont pas explicitement intégrés à la production.

## 3. Architecture observée lors de l'audit initial
- apps/web
- apps/api
- packages/domain
- packages/application
- packages/contracts
- packages/infrastructure
- packages/intelligence
- packages/psychometrics
- packages/governance
- packages/observability
- supabase/functions
- migrations
- maquette
- corpus
- tests
- ADR
- CI/docs

## 4. Baseline fonctionnelle déjà vérifiée
- frontend production réel présent;
- backend/BFF réel présent;
- Supabase réel présent;
- Edge Functions présentes dans le runtime;
- architecture modulaire déjà engagée;
- AI Gateway préparé;
- Learning Core présent;
- séparation logique DEMO/PRODUCTION présente;
- maquette riche conservée comme référence UX.

## 5. Écarts critiques identifiés à la baseline
### B01 — Reproductibilité Git/Supabase
Le dépôt audité contenait 54 migrations SQL alors que le runtime Supabase en comportait 357.
=> Statut: NOT CLOSED / BLOQUANT LOT 01.

### B02 — Edge Function runtime non entièrement représentée dans la source auditée
xgest-bulletin-ingest était active dans Supabase mais absente de la source ZIP auditée.
=> Statut: NOT CLOSED / BLOQUANT LOT 01.

### B03 — Sécurité Supabase
Constats de l'audit:
- 1 table RLS sans policy signalée par l'advisor;
- 112 SECURITY DEFINER signalées pour vérification;
- protection contre mots de passe compromis à activer/vérifier;
- 69 cas de policies permissives multiples signalés;
- 2 tables sans clé primaire signalées.
=> Statut: NOT CLOSED / LOT 02.

### B04 — Frontend trop concentré
Le runtime frontend principal reste très volumineux (~1,9 Mo dans l'audit).
=> Statut: PARTIAL / LOT 03.

### B05 — Données Learning Core limitées
Lors de l'audit: 4 learning_events et 0 tentative QCM dans le projet observé.
=> Statut: PARTIAL / LOT 07.
Cela interdit de présenter comme validées à grande échelle des mesures psychométriques ou d'apprentissage qui ne le sont pas encore.

### B06 — Intégrations externes
La préparation de l'architecture IA était présente, mais certaines configurations runtime (providers, voix, WhatsApp) restaient à prouver.
=> Statut: UNKNOWN/PARTIAL / LOTS 14-16.

### B07 — Réseau/déploiement
HTTPS/HSTS/CORS et garanties complètes de déploiement restent à vérifier sur l'environnement réel.
=> Statut: UNKNOWN / LOT 24-25.

## 6. Baseline Supabase observée
Projet: szhdlixejgaqzafpirwv
Statut runtime observé: ACTIVE_HEALTHY
Région: eu-west-1
Postgres: 17.6.1

Objets observés:
- 173 tables publiques
- 171 tables avec RLS
- 225 policies
- 314 fonctions publiques
- 240 fonctions SECURITY DEFINER

Données observées:
- profiles: 7
- institutions: 84
- classes: 2
- eleves: 2
- learning_events: 4
- eli_qcm_attempts: 0

Edge Functions actives observées:
- memoire
- learning-observation
- xgest-bulletin-ingest

## 7. Baseline tests/qualité
- build frontend: PASS lors de l'audit;
- architecture:check: PASS;
- architecture:frontend-boundary: PASS;
- suite maquette: 117 tests, 112 pass, 5 échecs au moment de l'audit;
- une régression fonctionnelle maquette avait été identifiée;
- plusieurs échecs étaient liés à l'environnement Playwright.

## 8. Règles de gel
À partir de ce document:
1. aucune correction de fond du LOT 01+ ne doit être mélangée au LOT 00;
2. toute modification doit être commitée et traçable;
3. toute divergence runtime/source doit être documentée;
4. DEMO et PRODUCTION ne doivent jamais être confondues;
5. CLOSED exige des preuves.

## 9. Critère de clôture LOT 00
Le lot 00 sera CLOSED lorsque:
- la référence Git exacte est figée;
- l'inventaire du dépôt est complet;
- le runtime Supabase est comparé au dépôt;
- les environnements DEMO/PRODUCTION sont identifiés;
- la baseline tests/build est reproductible;
- les écarts sont enregistrés dans les lots concernés;
- le rapport de clôture est commitée.

## État
LOT 00: IN PROGRESS

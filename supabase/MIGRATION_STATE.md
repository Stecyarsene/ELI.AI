# MIGRATION_STATE.md — état réel des migrations (vérifié le 2026-06-19)

> But : dire la vérité sur l'écart repo ↔ prod, sans surgery risquée. **La PROD est la source de vérité.**

## 1. Constat vérifié

- **Prod `szhdlixejgaqzafpirwv`** : **39 migrations enregistrées** dans `supabase_migrations.schema_migrations`, identifiées par **version horodatée** (timestamp). Tous les objets correspondants existent et ont été vérifiés vivants cette session (tables, RPC, RLS, fonctions).
- **Repo** : **24 fichiers** `supabase/migrations/00NN_*.sql`, séquence **re-numérotée et consolidée à la main**, avec des **trous** (`0014`, `0015`, `0022` absents).
- **Cause de l'écart** : les migrations ont été appliquées en prod via l'outil MCP `apply_migration` au fil de plusieurs sessions, qui **horodate** la version et accepte un nom libre. Des libellés `00NN` ont été **réutilisés** (d'où des doublons de numéro dans l'historique : plusieurs `0010/0011/0012/0014/0015/0016…/0021`). En parallèle, le repo a été maintenu comme une séquence propre mais **distincte**, qui ne correspond donc pas 1:1 à l'historique prod.
- **Conséquence pratique** : le repo utilise le préfixe `00NN_` (pas le format `<timestamp>_nom.sql` attendu par la CLI Supabase) **et** les versions prod sont des timestamps. Donc **`supabase db push` n'est PAS un chemin fiable** en l'état (risque de re-jouer ou de désynchroniser). Les fichiers du repo valent comme **documentation idempotente**, pas comme source d'application.

## 2. Cartographie repo ↔ prod

| Fichier repo | Correspondance dans l'historique prod |
|---|---|
| 0001–0007 (init, analytics_iam, countries, fix_school_rls, rag_strict, audit_immutable, spaced_repetition) | Présents (mêmes noms, versions horodatées 2026-06-10) |
| 0008_fiches | Prod = `0009_fiches` (prod a aussi `0008_rls_catalog_tables`, sans fichier repo) |
| 0009_engagement_reminders | Consolidé ; prod = `0010_engagement` + `0011_touch_engagement_fn` + `0012_reminders` |
| 0010_push_and_prefs | Prod = `0010_push_and_prefs` |
| 0011_set_bougie | Prod = `0011_set_bougie` |
| 0012_exam_dates | Prod = `0012_exam_dates` |
| 0013_curriculum_aefe_seed | Lié à prod `0013_scope_curriculum` + `0022_set_curriculum_fn` |
| 0016_teacher_space → 0021_parent_space | **Correspondance directe** (mêmes noms en prod) |
| 0023_socle_session_columns | Documente prod `0019_commit_session_atomic` / colonnes de session |
| 0024_commit_session_rpc | Documente prod `0019_commit_session_atomic` + `0020_commit_session_perf_and_reflex` (renommé pour éviter la collision `0019/0020`) |
| 0025_capture_undocumented_functions | **Capture documentaire** de 6 fonctions vivantes-mais-non-fichées |
| 0026_avenir_referentiel | Prod = `avenir_referentiel` (appliqué cette session) |
| 0027_seed_gabon_exhaustif | Prod = `seed_gabon_exhaustif` (appliqué cette session) |

**Présents en prod SANS fichier repo** (vivants, à connaître) : `0008_rls_catalog_tables`, `0014_set_first_name`, `0015_school_hours`, `0016_in_school_hours_fn`, `0017_orientation`, `0018_work_sessions`, `0019_resume_work_fn`, `0020_class_catalog`, `0021_scope_with_exam`, `0014_exam_papers_annales`, `0015_cours_table`, `parent_child_overview_v2_aggregates`, `teacher_resources_summary_and_rls`. *(Plusieurs de leurs fonctions sont capturées dans `0025`.)*

## 3. Décision recommandée (sans risque)

1. **Traiter la prod comme source de vérité.** Ne PAS réécrire `schema_migrations` ni renuméroter les anciens fichiers (risque élevé, gain cosmétique).
2. **Garder les fichiers repo comme documentation idempotente.** Mes captures `0023`→`0027` sont idempotentes et certifiées conformes au vivant.
3. **Une seule méthode désormais** : continuer à appliquer via `apply_migration` (MCP), qui horodate proprement. Ne pas mélanger avec `db push` tant que l'alignement CLI n'est pas fait.
4. **Si un alignement CLI complet est souhaité un jour** (chantier délibéré, séparé) : renommer les fichiers locaux en `<version>_nom.sql` repris de l'historique prod, puis `supabase migration repair` pour réconcilier l'état — à faire à froid, jamais en pleine sprint.

## 4. Ce qui est sûr aujourd'hui
La prod est **correctement migrée et cohérente** (objets vérifiés). L'écart est **documentaire**, pas fonctionnel. Aucun correctif urgent ; la dette est tracée ici.

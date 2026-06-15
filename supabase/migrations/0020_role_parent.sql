-- 0020 — Ajoute le rôle 'parent' à l'enum role_t (T5).
-- ADD VALUE séparé (pré-commité) car la valeur est utilisée par la migration 0021.
-- Idempotent. DÉJÀ APPLIQUÉE en production (projet ELI) via MCP.
alter type public.role_t add value if not exists 'parent';

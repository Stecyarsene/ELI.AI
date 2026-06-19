-- 0023_socle_session_columns.sql
-- CAPTURE DOCUMENTAIRE (idempotente) — remet le repo en miroir fidèle de la PROD.
-- Le socle « monde inscrit » (chrono de réaction, grille de notes /20, tally d'erreurs)
-- a été appliqué en direct à la base via MCP sans fichier de migration correspondant.
-- Ce fichier reflète VERBATIM l'état vivant vérifié sur le projet szhdlixejgaqzafpirwv :
--   work_sessions.reaction_ms  integer  NOT NULL DEFAULT 0
--   work_sessions.notes        jsonb    NOT NULL DEFAULT '{}'::jsonb
--   progress.error_tally       jsonb    NOT NULL DEFAULT '{}'::jsonb
-- Idempotent (ADD COLUMN IF NOT EXISTS) : ré-exécutable sans effet si déjà présent.
-- Renuméroté 0023 pour lever la collision avec 0019_payments / 0020_role_parent.

alter table public.work_sessions
  add column if not exists reaction_ms integer not null default 0;

alter table public.work_sessions
  add column if not exists notes jsonb not null default '{}'::jsonb;

alter table public.progress
  add column if not exists error_tally jsonb not null default '{}'::jsonb;

comment on column public.work_sessions.reaction_ms is 'Temps de réaction moyen (ms) d''une session orale — moyenne des chronos Q->R capturés côté client.';
comment on column public.work_sessions.notes      is 'Grille de notation du jury /20 {conviction,rigueur,stress,structure} pour les piliers oraux.';
comment on column public.progress.error_tally     is 'Compteur d''erreurs par notion {"<notion>": <count>} — fondation du rituel « 3x = réflexe à corriger ».';

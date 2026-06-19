-- 0026_avenir_referentiel.sql
-- P4-a — PILIER « MON AVENIR » : référentiel de données réel (schools / concours / bourses).
-- RÈGLE D'OR (doc MISSION_mon_avenir) : ZÉRO hallucination. Toute ligne porte OBLIGATOIREMENT
-- une SOURCE et une DATE DE VÉRIFICATION. Le pilier reste VERROUILLÉ côté front tant que ces tables
-- sont vides — on ne fabrique JAMAIS un seuil, une date ou un prérequis. AUCUN seed ici : données curées à la main ensuite.
-- Écriture réservée super_admin/service_role (données curées) ; lecture réservée aux comptes connectés.
-- Idempotent (IF NOT EXISTS / drop policy if exists). NON appliqué en base par cette passe : DDL active -> attend ton « go ».

-- ───────── Fonction utilitaire : maj updated_at (générique, idempotente) ─────────
create or replace function public.touch_updated_at()
 returns trigger
 language plpgsql
as $function$
begin new.updated_at = now(); return new; end;
$function$;

-- ───────── 1) schools — établissements (écoles d'ingénieurs/commerce, universités, instituts) ─────────
create table if not exists public.schools (
  id             bigint generated always as identity primary key,
  country_code   text not null default 'GA',
  program        program_t,                 -- null = pertinent pour les deux programmes
  name           text not null,
  kind           text,                       -- ex. 'ingenieur' | 'commerce' | 'universite' | 'institut' (curé, jamais déduit)
  city           text,
  filieres_visees text[] not null default '{}',  -- séries/filières d'origine pertinentes (ex. {C,D,F3})
  prerequis      text,                        -- prérequis d'admission (texte curé)
  description    text,
  source         text not null,              -- OBLIGATOIRE : d'où vient l'information
  source_url     text,
  date_verif     date not null,              -- OBLIGATOIRE : date de vérification de l'information
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ───────── 2) concours — voies d'accès (ENSET, Polytechnique, Mines, concours ANBG…) ─────────
create table if not exists public.concours (
  id                 bigint generated always as identity primary key,
  country_code       text not null default 'GA',
  name               text not null,
  school_id          bigint references public.schools(id) on delete set null,
  series_admissibles text[] not null default '{}',  -- séries/filières admissibles
  date_ouverture     date,
  date_cloture       date,
  seuil_info         text,                    -- info de seuil (TEXTE curé et sourcé — jamais inventé)
  modalites          text,
  source             text not null,
  source_url         text,
  date_verif         date not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ───────── 3) bourses — bourses (ANBG excellence/sociales, autres) ─────────
create table if not exists public.bourses (
  id           bigint generated always as identity primary key,
  country_code text not null default 'GA',
  name         text not null,
  organisme    text,                          -- ex. 'ANBG'
  type         text,                           -- ex. 'excellence' | 'sociale'
  criteres     text,                           -- critères d'éligibilité (texte curé)
  seuil_info   text,
  date_limite  date,
  documents    text[] not null default '{}',  -- pièces requises
  source       text not null,
  source_url   text,
  date_verif   date not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ───────── Index de filtrage (pays / filière) ─────────
create index if not exists schools_country_idx   on public.schools (country_code);
create index if not exists schools_filieres_idx   on public.schools using gin (filieres_visees);
create index if not exists concours_country_idx   on public.concours (country_code);
create index if not exists concours_series_idx    on public.concours using gin (series_admissibles);
create index if not exists concours_school_idx    on public.concours (school_id);
create index if not exists bourses_country_idx     on public.bourses (country_code);

-- ───────── Triggers updated_at ─────────
drop trigger if exists schools_touch  on public.schools;
create trigger schools_touch  before update on public.schools  for each row execute function public.touch_updated_at();
drop trigger if exists concours_touch on public.concours;
create trigger concours_touch before update on public.concours for each row execute function public.touch_updated_at();
drop trigger if exists bourses_touch  on public.bourses;
create trigger bourses_touch  before update on public.bourses  for each row execute function public.touch_updated_at();

-- ───────── RLS : lecture comptes connectés, écriture super_admin/service_role uniquement ─────────
alter table public.schools  enable row level security;
alter table public.concours enable row level security;
alter table public.bourses  enable row level security;

drop policy if exists schools_read  on public.schools;
create policy schools_read  on public.schools  for select using (auth.uid() is not null);
drop policy if exists schools_write on public.schools;
create policy schools_write on public.schools  for all using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists concours_read  on public.concours;
create policy concours_read  on public.concours for select using (auth.uid() is not null);
drop policy if exists concours_write on public.concours;
create policy concours_write on public.concours for all using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists bourses_read  on public.bourses;
create policy bourses_read  on public.bourses  for select using (auth.uid() is not null);
drop policy if exists bourses_write on public.bourses;
create policy bourses_write on public.bourses  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ───────── Grants (RLS filtre derrière) ─────────
grant select on public.schools, public.concours, public.bourses to authenticated;
grant all    on public.schools, public.concours, public.bourses to service_role;

-- NB: aucune ligne insérée. Le pilier « Mon Avenir » reste VERROUILLÉ tant que ces tables ne sont pas
-- peuplées de données curées + sourcées (date_verif). Prochaines briques (P4-b radar, P4-c menu) : APRÈS peuplement réel.

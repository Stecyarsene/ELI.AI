-- 0008 — Table "fiches" (fiches mémoire générées par Éli via le bloc [FICHE]).
-- Idempotent : aligne le dépôt sur la base de production (déjà créée, RLS activée).

create table if not exists fiches (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references profiles(id) on delete cascade,
  program     program_t not null,
  subject     text not null,
  kind        text not null default 'revision' check (kind in ('revision','quiz','examen')),
  title       text not null default '',
  body        jsonb not null default '{}',
  status      text not null default 'pret' check (status in ('pret','archive')),
  created_at  timestamptz not null default now()
);

create index if not exists fiches_user_subject_idx on fiches (user_id, subject, created_at desc);

alter table fiches enable row level security;

-- L'élève ne voit et n'écrit QUE ses propres fiches (cohérent avec "own progress").
drop policy if exists "own fiches select" on fiches;
create policy "own fiches select" on fiches for select using (auth.uid() = user_id);
drop policy if exists "own fiches insert" on fiches;
create policy "own fiches insert" on fiches for insert with check (auth.uid() = user_id);
drop policy if exists "own fiches update" on fiches;
create policy "own fiches update" on fiches for update using (auth.uid() = user_id);

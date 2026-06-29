-- ÉLI — Intelligence Layer : maîtrise par compétence et par élève (skill graph).
-- Alimente la difficulté adaptative et la sélection des prochains exercices.
create table if not exists public.skill_mastery (
  student_id    uuid    not null references auth.users(id) on delete cascade,
  concept       text    not null,
  score         real    not null default 0 check (score >= 0 and score <= 1),
  attempts      integer not null default 0,
  last_practice timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (student_id, concept)
);

alter table public.skill_mastery enable row level security;

-- Chaque élève ne voit/écrit QUE ses propres lignes.
drop policy if exists skill_mastery_select_own on public.skill_mastery;
create policy skill_mastery_select_own on public.skill_mastery
  for select using (auth.uid() = student_id);

drop policy if exists skill_mastery_upsert_own on public.skill_mastery;
create policy skill_mastery_upsert_own on public.skill_mastery
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);

create index if not exists skill_mastery_student_idx on public.skill_mastery (student_id);

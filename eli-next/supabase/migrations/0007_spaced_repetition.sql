-- ÉLI · Cartes de répétition espacée (doc 9) — propres à chaque élève, RLS stricte
create table if not exists skill_cards (
  user_id uuid not null references profiles(id) on delete cascade,
  skill text not null,
  ease numeric not null default 2.5,
  interval_days int not null default 0,
  reps int not null default 0,
  next_review timestamptz not null default now(),
  fails int not null default 0,
  primary key (user_id, skill)
);
alter table skill_cards enable row level security;
drop policy if exists "own cards" on skill_cards;
create policy "own cards" on skill_cards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists skill_due_idx on skill_cards (user_id, next_review);

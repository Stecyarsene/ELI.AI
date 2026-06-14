-- Profils ENSEIGNANTS : infos officielles + WhatsApp. Additif.
create table if not exists public.teacher_profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  program program_t not null default 'national',
  full_name text not null,
  establishment text,
  subject text,
  whatsapp text,
  status text not null default 'actif',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.teacher_profiles enable row level security;
drop policy if exists tprof_self_read on public.teacher_profiles;
create policy tprof_self_read on public.teacher_profiles for select using (user_id = auth.uid());
drop policy if exists tprof_self_upsert on public.teacher_profiles;
create policy tprof_self_upsert on public.teacher_profiles for insert with check (user_id = auth.uid());
drop policy if exists tprof_self_update on public.teacher_profiles;
create policy tprof_self_update on public.teacher_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());

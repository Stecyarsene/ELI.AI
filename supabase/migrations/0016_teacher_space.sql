-- ESPACE ENSEIGNANT (additif, n'altère aucune table existante).
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  program program_t not null,
  class_key text not null,
  serie text,
  subject text,
  name text not null,
  join_code text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists classes_teacher_idx on public.classes(teacher_id);

create table if not exists public.class_enrollments (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);
create index if not exists enroll_student_idx on public.class_enrollments(student_id);

create table if not exists public.teacher_resources (
  id bigint generated always as identity primary key,
  teacher_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  program program_t not null,
  class_key text, subject text, notion text,
  kind text not null check (kind in ('fiche','controle','diapos','progression')),
  title text,
  content text,
  created_at timestamptz not null default now()
);
create index if not exists tres_teacher_idx on public.teacher_resources(teacher_id);

create or replace function public.owns_class(cid uuid) returns boolean
  language sql security definer stable set search_path = public as $$
    select exists(select 1 from public.classes c where c.id = cid and c.teacher_id = auth.uid());
  $$;
create or replace function public.is_enrolled(cid uuid) returns boolean
  language sql security definer stable set search_path = public as $$
    select exists(select 1 from public.class_enrollments e where e.class_id = cid and e.student_id = auth.uid());
  $$;

alter table public.classes enable row level security;
alter table public.class_enrollments enable row level security;
alter table public.teacher_resources enable row level security;

drop policy if exists classes_teacher_all on public.classes;
create policy classes_teacher_all on public.classes
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
drop policy if exists classes_student_read on public.classes;
create policy classes_student_read on public.classes
  for select using (public.is_enrolled(id));

drop policy if exists enroll_student_self on public.class_enrollments;
create policy enroll_student_self on public.class_enrollments
  for all using (student_id = auth.uid()) with check (student_id = auth.uid());
drop policy if exists enroll_teacher_read on public.class_enrollments;
create policy enroll_teacher_read on public.class_enrollments
  for select using (public.owns_class(class_id));

drop policy if exists tres_teacher_all on public.teacher_resources;
create policy tres_teacher_all on public.teacher_resources
  for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

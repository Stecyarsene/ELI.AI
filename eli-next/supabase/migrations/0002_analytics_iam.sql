do $$ begin create type role_t as enum ('student','teacher','school_admin','ministry','super_admin');
exception when duplicate_object then null; end $$;
create table if not exists institutions (
  id uuid primary key default gen_random_uuid(), name text not null, code text unique not null, program program_t not null default 'aefe');
alter table profiles add column if not exists institution_id uuid references institutions(id);
alter table profiles add column if not exists region text;
create table if not exists user_roles (
  user_id uuid not null references auth.users(id) on delete cascade, role role_t not null,
  institution_id uuid references institutions(id), primary key (user_id, role));
alter table user_roles enable row level security;
drop policy if exists "read own roles" on user_roles;
create policy "read own roles" on user_roles for select using (auth.uid() = user_id);
create or replace function public.has_role(r role_t) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from user_roles where user_id = auth.uid() and role = r) $$;
create or replace function public.my_institution() returns uuid language sql stable security definer set search_path = public as
$$ select institution_id from user_roles where user_id = auth.uid() and role in ('school_admin','teacher') limit 1 $$;
create table if not exists learning_events (
  id bigint generated always as identity primary key, user_id uuid not null references profiles(id) on delete cascade,
  program program_t not null, region text, institution_id uuid, subject text not null, concept text not null,
  success boolean not null, created_at timestamptz not null default now());
alter table learning_events enable row level security;
drop policy if exists "own events" on learning_events;
create policy "own events" on learning_events for select using (auth.uid() = user_id);
create table if not exists system_health (
  id bigint generated always as identity primary key, metric text not null, value numeric not null, detail text, at timestamptz not null default now());
alter table system_health enable row level security;
create or replace function public.ministry_subject_success()
returns table (program program_t, region text, subject text, success_rate numeric, sample bigint)
language plpgsql stable security definer set search_path = public as $fn$
begin
  if not (has_role('ministry') or has_role('super_admin')) then raise exception 'forbidden' using errcode = '42501'; end if;
  return query select e.program, e.region, e.subject, round(avg(case when e.success then 1 else 0 end)::numeric,3), count(*)
    from learning_events e group by e.program, e.region, e.subject having count(*) >= 10;
end $fn$;
create or replace function public.ministry_problem_concepts()
returns table (program program_t, region text, subject text, concept text, failure_rate numeric, sample bigint)
language plpgsql stable security definer set search_path = public as $fn$
begin
  if not (has_role('ministry') or has_role('super_admin')) then raise exception 'forbidden' using errcode = '42501'; end if;
  return query select e.program, e.region, e.subject, e.concept, round(avg(case when e.success then 0 else 1 end)::numeric,3), count(*)
    from learning_events e group by e.program, e.region, e.subject, e.concept having count(*) >= 10 order by 5 desc;
end $fn$;
create or replace function public.ministry_hourly_usage()
returns table (hour int, events bigint) language plpgsql stable security definer set search_path = public as $fn$
begin
  if not (has_role('ministry') or has_role('super_admin')) then raise exception 'forbidden' using errcode = '42501'; end if;
  return query select extract(hour from e.created_at)::int, count(*) from learning_events e group by 1 having count(*) >= 10 order by 1;
end $fn$;
drop policy if exists "school reads own students progress" on progress;
create policy "school reads own students progress" on progress for select using (
  exists (select 1 from user_roles ur join profiles p on p.id = progress.user_id
    where ur.user_id = auth.uid() and ur.role in ('school_admin','teacher')
      and ur.institution_id is not null and ur.institution_id = p.institution_id));
create or replace function public.school_gaps_overview()
returns table (class_key text, subject text, red_zone text, students bigint)
language plpgsql stable security definer set search_path = public as $fn$
declare inst uuid := my_institution();
begin
  if inst is null then raise exception 'forbidden' using errcode = '42501'; end if;
  return query select p.class_key, pr.subject, (rz.value #>> '{}'), count(distinct p.id)
    from profiles p join progress pr on pr.user_id = p.id
    cross join lateral jsonb_array_elements(pr.red_zones) rz
    where p.institution_id = inst group by p.class_key, pr.subject, (rz.value #>> '{}') order by 4 desc;
end $fn$;
create or replace function public.admin_ledger()
returns table (tx_id text, program program_t, plan_id text, amount_fcfa int, status text, invoice_path text, receipt_sent boolean, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $fn$
begin
  if not has_role('super_admin') then raise exception 'forbidden' using errcode = '42501'; end if;
  return query select pa.tx_id, pa.program, pa.plan_id, pa.amount_fcfa, pa.status, pa.invoice_path,
    exists (select 1 from notifications n where n.user_id = pa.user_id and n.kind='receipt' and n.status in ('queued','sent')), pa.created_at
    from payments pa order by pa.created_at desc;
end $fn$;
create or replace function public.admin_system_health()
returns table (metric text, value numeric, detail text, at timestamptz)
language plpgsql stable security definer set search_path = public as $fn$
begin
  if not has_role('super_admin') then raise exception 'forbidden' using errcode = '42501'; end if;
  return query select h.metric, h.value, h.detail, h.at from system_health h order by h.at desc limit 200;
end $fn$;

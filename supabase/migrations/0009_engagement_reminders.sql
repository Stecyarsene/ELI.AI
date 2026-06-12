-- 0009 — Engagement (streak) + Reminders + RPC my_scope / touch_engagement.
-- Idempotent : aligne le dépôt sur la base de production (objets déjà créés).

create table if not exists engagement (
  user_id          uuid primary key references profiles(id) on delete cascade,
  streak_current   integer not null default 0,
  streak_best      integer not null default 0,
  last_active_date date,
  total_sessions   integer not null default 0,
  total_minutes    integer not null default 0,
  updated_at       timestamptz not null default now()
);
alter table engagement enable row level security;
drop policy if exists "own engagement" on engagement;
create policy "own engagement" on engagement for select using (auth.uid() = user_id);

create table if not exists reminders (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references profiles(id) on delete cascade,
  kind         text not null,                 -- continuite | streak | examen | celebration | custom
  title        text not null default '',
  body         text not null default '',
  subject      text,
  scheduled_at timestamptz not null,
  sent_at      timestamptz,
  status       text not null default 'pending',
  created_at   timestamptz not null default now()
);
alter table reminders enable row level security;
drop policy if exists "own reminders" on reminders;
create policy "own reminders" on reminders for select using (auth.uid() = user_id);

-- Périmètre autorisé de l'élève (classe, série, technique, curriculum officiel).
create or replace function public.my_scope()
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare
  uid uuid := auth.uid();
  prof public.profiles;
  cur public.curriculum;
  result jsonb;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select * into prof from public.profiles where id = uid;
  if not found then raise exception 'no profile'; end if;
  select * into cur from public.curriculum
    where program = prof.program and class_key = prof.class_key limit 1;
  result := jsonb_build_object(
    'program', prof.program, 'class_key', prof.class_key, 'serie', prof.serie,
    'country_code', prof.country_code,
    'is_technical', (prof.serie is not null and prof.serie ~* '^(F|G|H|STI|STT|STG|technique|tech)'),
    'curriculum', coalesce(cur.payload, '{}'::jsonb)
  );
  return result;
end; $$;

-- Met à jour la série (streak) et renvoie l'état d'engagement à jour.
create or replace function public.touch_engagement(p_minutes integer default 0)
returns engagement language plpgsql security definer set search_path to 'public' as $$
declare
  uid uuid := auth.uid();
  today date := (now() at time zone 'UTC')::date;
  row public.engagement;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select * into row from public.engagement where user_id = uid;
  if not found then
    insert into public.engagement (user_id, streak_current, streak_best, last_active_date, total_sessions, total_minutes)
    values (uid, 1, 1, today, 1, greatest(p_minutes,0)) returning * into row;
    return row;
  end if;
  if row.last_active_date = today then
    update public.engagement set total_sessions = total_sessions + 1,
      total_minutes = total_minutes + greatest(p_minutes,0), updated_at = now()
      where user_id = uid returning * into row;
  elsif row.last_active_date = today - 1 then
    update public.engagement set streak_current = streak_current + 1,
      streak_best = greatest(streak_best, streak_current + 1), last_active_date = today,
      total_sessions = total_sessions + 1, total_minutes = total_minutes + greatest(p_minutes,0), updated_at = now()
      where user_id = uid returning * into row;
  else
    update public.engagement set streak_current = 1, last_active_date = today,
      total_sessions = total_sessions + 1, total_minutes = total_minutes + greatest(p_minutes,0), updated_at = now()
      where user_id = uid returning * into row;
  end if;
  return row;
end; $$;

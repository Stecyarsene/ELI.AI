-- 0021 — Espace parent (T5). Liaison parent<->enfant + lecture stricte (un parent ne voit QUE ses enfants).
-- Additive et idempotente. Le rôle 'parent' est ajouté en 0020 (ADD VALUE séparé, pré-commité).

-- ───────── Profil parent (miroir léger de teacher_profiles) ─────────
create table if not exists public.parent_profiles (
  user_id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  whatsapp text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────── Lien parent <-> enfant (autorité de l'étanchéité) ─────────
create table if not exists public.parent_links (
  parent_user_id uuid not null references auth.users on delete cascade,
  child_user_id  uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active','revoked')),
  created_at timestamptz not null default now(),
  primary key (parent_user_id, child_user_id)
);

alter table public.parent_profiles enable row level security;
alter table public.parent_links    enable row level security;

drop policy if exists "own parent profile sel" on public.parent_profiles;
create policy "own parent profile sel" on public.parent_profiles for select using (auth.uid() = user_id);
drop policy if exists "own parent profile ins" on public.parent_profiles;
create policy "own parent profile ins" on public.parent_profiles for insert with check (auth.uid() = user_id);
drop policy if exists "own parent profile upd" on public.parent_profiles;
create policy "own parent profile upd" on public.parent_profiles for update using (auth.uid() = user_id);

-- Un parent ne voit QUE ses propres liens (les écritures passent par la RPC security definer).
drop policy if exists "own parent links" on public.parent_links;
create policy "own parent links" on public.parent_links for select using (auth.uid() = parent_user_id);

-- ───────── Liaison par téléphone + prénom (vérification, consentement, rôle) ─────────
-- Security definer : peut lire auth.users pour retrouver l'enfant par son numéro WhatsApp.
create or replace function public.parent_link_by_phone(p_child_phone text, p_child_first_name text, p_parent_name text)
  returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_child uuid;
  v_first text;
  v_parent_phone text;
  v_norm_child text := regexp_replace(coalesce(p_child_phone,''), '[^0-9]', '', 'g');
begin
  if auth.uid() is null then raise exception 'unauthorized' using errcode='42501'; end if;
  -- Retrouve l'enfant : numéro WhatsApp (comparaison sur les chiffres) + prénom (insensible à la casse).
  select u.id, p.first_name into v_child, v_first
  from auth.users u join public.profiles p on p.id = u.id
  where regexp_replace(coalesce(u.phone,''), '[^0-9]', '', 'g') = v_norm_child
    and lower(trim(p.first_name)) = lower(trim(p_child_first_name))
  limit 1;
  if v_child is null then raise exception 'child_not_found' using errcode='P0002'; end if;
  if v_child = auth.uid() then raise exception 'cannot_link_self' using errcode='22023'; end if;

  -- Téléphone du parent (pour la trace de consentement, haché — non réversible).
  select regexp_replace(coalesce(phone,''), '[^0-9]', '', 'g') into v_parent_phone from auth.users where id = auth.uid();

  insert into public.parent_links (parent_user_id, child_user_id, status)
    values (auth.uid(), v_child, 'active')
    on conflict (parent_user_id, child_user_id) do update set status = 'active';

  insert into public.parental_consents (user_id, parent_name, parent_phone_enc)
    values (v_child, coalesce(p_parent_name,''), sha256(convert_to(coalesce(v_parent_phone,''), 'UTF8')));

  -- Octroie le rôle 'parent' (idempotent).
  insert into public.user_roles (user_id, role) values (auth.uid(), 'parent')
    on conflict do nothing;

  return jsonb_build_object('child_user_id', v_child, 'first_name', v_first);
end; $$;

-- ───────── Liste des enfants du parent courant ─────────
create or replace function public.parent_children()
  returns table(child_user_id uuid, first_name text, program text, class_key text, serie text)
  language sql security definer set search_path=public as $$
  select pl.child_user_id, p.first_name, p.program::text, p.class_key, p.serie
  from public.parent_links pl join public.profiles p on p.id = pl.child_user_id
  where pl.parent_user_id = auth.uid() and pl.status = 'active'
  order by p.first_name;
$$;

-- ───────── Vue détaillée d'UN enfant (vérifie le lien → étanchéité stricte) ─────────
create or replace function public.parent_child_overview(p_child uuid)
  returns jsonb language plpgsql security definer set search_path=public as $$
declare res jsonb;
begin
  if not exists (
    select 1 from public.parent_links
    where parent_user_id = auth.uid() and child_user_id = p_child and status = 'active'
  ) then raise exception 'forbidden' using errcode='42501'; end if;

  select jsonb_build_object(
    'child', (select jsonb_build_object('first_name', first_name, 'program', program::text, 'class_key', class_key, 'serie', serie)
              from public.profiles where id = p_child),
    'engagement', (select jsonb_build_object('streak_current', streak_current, 'streak_best', streak_best,
              'last_active_date', last_active_date, 'total_sessions', total_sessions, 'total_minutes', total_minutes)
              from public.engagement where user_id = p_child),
    'subjects', coalesce((select jsonb_agg(jsonb_build_object('subject', subject, 'status', status, 'last_chapter', last_chapter,
              'strengths', strengths, 'improvements', improvements, 'red_zones', red_zones) order by updated_at desc)
              from public.progress where user_id = p_child), '[]'::jsonb),
    'sessions', coalesce((select jsonb_agg(jsonb_build_object('subject', subject, 'pillar', pillar, 'title', title,
              'summary', summary, 'duration_min', duration_min, 'started_at', started_at) order by started_at desc)
              from (select * from public.work_sessions where user_id = p_child order by started_at desc nulls last limit 20) s), '[]'::jsonb)
  ) into res;
  return res;
end; $$;

grant execute on function public.parent_link_by_phone(text, text, text) to authenticated;
grant execute on function public.parent_children() to authenticated;
grant execute on function public.parent_child_overview(uuid) to authenticated;

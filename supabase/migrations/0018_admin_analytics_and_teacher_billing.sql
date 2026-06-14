-- 0018 — Analytics super-admin + facturation enseignant.
-- ÉTAT : DÉJÀ APPLIQUÉE en production (projet ELI szhdlixejgaqzafpirwv) via MCP.
-- Recopiée ici à l'identique pour que le dépôt soit la source de vérité du schéma.
-- Toutes les opérations sont idempotentes (add column if not exists / create or replace).

-- ───────── Colonnes additives ─────────
-- Canal d'usage pour le suivi WhatsApp / site / app (télémétrie).
alter table public.learning_events add column if not exists channel text not null default 'site';
do $$ begin
  if not exists (select 1 from pg_constraint where conname='learning_events_channel_chk') then
    alter table public.learning_events add constraint learning_events_channel_chk check (channel in ('site','app','whatsapp'));
  end if;
end $$;
-- Facturation enseignant (2 essais gratuits puis premium, même tarif que les élèves).
alter table public.teacher_profiles add column if not exists is_paid boolean not null default false;
alter table public.teacher_profiles add column if not exists paid_until timestamptz;
alter table public.teacher_profiles add column if not exists trial_count integer not null default 0;

-- ───────── Garde super-admin ─────────
create or replace function public.is_super_admin() returns boolean
  language sql security definer stable set search_path=public as $$
    select exists(select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin');
  $$;

-- ───────── Vue d'ensemble (KPIs + canaux + statuts + revenus) ─────────
create or replace function public.admin_overview() returns jsonb
  language plpgsql security definer set search_path=public as $$
  declare res jsonb;
  begin
    if not public.is_super_admin() then raise exception 'forbidden' using errcode='42501'; end if;
    select jsonb_build_object(
      'users', jsonb_build_object(
        'students',       (select count(*) from profiles),
        'teachers',       (select count(*) from teacher_profiles),
        'admins',         (select count(distinct user_id) from user_roles where role in ('super_admin','ministry','school_admin')),
        'paid_students',  (select count(*) from profiles where is_paid),
        'paid_teachers',  (select count(*) from teacher_profiles where is_paid),
        'total_auth',     (select count(*) from auth.users)
      ),
      'revenue', jsonb_build_object(
        'total_fcfa',     coalesce((select sum(amount_fcfa) from payments where status='success'),0),
        'success_count',  (select count(*) from payments where status='success'),
        'pending_count',  (select count(*) from payments where status='pending'),
        'failed_count',   (select count(*) from payments where status='failed')
      ),
      'activity', jsonb_build_object(
        'events_total',   (select count(*) from learning_events),
        'success_rate',   coalesce((select round(100.0*avg(case when success then 1 else 0 end),1) from learning_events),0),
        'active_7d',      (select count(*) from engagement where last_active_date >= current_date-7),
        'sessions',       coalesce((select sum(total_sessions) from engagement),0),
        'minutes',        coalesce((select sum(total_minutes) from engagement),0)
      ),
      'status', (select coalesce(jsonb_object_agg(status, c),'{}'::jsonb) from (select status, count(*) c from progress group by status) s),
      'channels', (select coalesce(jsonb_object_agg(channel, u),'{}'::jsonb) from (select channel, count(distinct user_id) u from learning_events group by channel) t)
    ) into res;
    return res;
  end; $$;

-- ───────── Usage par matière (+ taux de réussite) ─────────
create or replace function public.admin_usage_by_subject() returns table(subject text, events bigint, success_rate numeric)
  language plpgsql security definer set search_path=public as $$
  begin
    if not public.is_super_admin() then raise exception 'forbidden' using errcode='42501'; end if;
    return query select le.subject, count(*)::bigint, round(100.0*avg(case when le.success then 1 else 0 end),1)
      from learning_events le where le.subject is not null group by le.subject order by count(*) desc limit 50;
  end; $$;

-- ───────── Zones rouges (concepts au plus faible taux de réussite) ─────────
create or replace function public.admin_red_zones() returns table(subject text, concept text, attempts bigint, success_rate numeric)
  language plpgsql security definer set search_path=public as $$
  begin
    if not public.is_super_admin() then raise exception 'forbidden' using errcode='42501'; end if;
    return query select le.subject, le.concept, count(*)::bigint, round(100.0*avg(case when le.success then 1 else 0 end),1) sr
      from learning_events le where le.concept is not null group by le.subject, le.concept
      order by sr asc, count(*) desc limit 50;
  end; $$;

-- ───────── Usage par pilier (temps passé) ─────────
create or replace function public.admin_pillar_usage() returns table(pillar text, sessions bigint, minutes bigint)
  language plpgsql security definer set search_path=public as $$
  begin
    if not public.is_super_admin() then raise exception 'forbidden' using errcode='42501'; end if;
    return query select coalesce(ws.pillar,'(non précisé)'), count(*)::bigint, coalesce(sum(ws.duration_min),0)::bigint
      from work_sessions ws group by ws.pillar order by count(*) desc;
  end; $$;

-- ───────── Transactions récentes (avec reçu) ─────────
create or replace function public.admin_recent_payments(p_limit integer default 50)
  returns table(tx_id text, user_id uuid, program text, plan_id text, amount_fcfa integer, status text, invoice_path text, created_at timestamptz)
  language plpgsql security definer set search_path=public as $$
  begin
    if not public.is_super_admin() then raise exception 'forbidden' using errcode='42501'; end if;
    return query select p.tx_id, p.user_id, p.program::text, p.plan_id, p.amount_fcfa, p.status, p.invoice_path, p.created_at
      from payments p order by p.created_at desc limit p_limit;
  end; $$;

-- ───────── Croissance : inscriptions par jour ─────────
create or replace function public.admin_signups_timeseries(p_days integer default 30)
  returns table(day date, students bigint, teachers bigint)
  language plpgsql security definer set search_path=public as $$
  begin
    if not public.is_super_admin() then raise exception 'forbidden' using errcode='42501'; end if;
    return query
    with d as (select generate_series(current_date - (p_days-1), current_date, interval '1 day')::date as day)
    select d.day,
      (select count(*) from profiles p where p.created_at::date = d.day)::bigint,
      (select count(*) from teacher_profiles t where t.created_at::date = d.day)::bigint
    from d order by d.day;
  end; $$;

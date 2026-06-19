-- 0025_capture_undocumented_functions.sql
-- CAPTURE DOCUMENTAIRE (idempotente) — remet le repo en miroir fidèle de la PROD.
-- Audit de miroir (prod szhdlixejgaqzafpirwv) : 6 fonctions applicatives vivaient en base
-- SANS fichier de migration correspondant (appliquées en direct via MCP). Reproduites ici VERBATIM
-- (pg_get_functiondef), en CREATE OR REPLACE -> ré-exécutables sans effet de bord.
-- NON appliqué en base par cette passe : c'est de la documentation de schéma, pas une DDL active.
-- Renuméroté 0025 (après 0024) pour rester sans collision.

-- 1) in_school_hours() — anti-triche : statut "en classe" selon school_hours (heure locale Gabon UTC+1).
create or replace function public.in_school_hours()
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  uid uuid := auth.uid();
  prof public.profiles;
  loc timestamptz;
  local_ts timestamp;
  wd smallint;
  mins smallint;
  hit public.school_hours;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select * into prof from public.profiles where id = uid;
  if not found then raise exception 'no profile'; end if;

  -- Heure locale Gabon (UTC+1, pas de DST)
  local_ts := (now() at time zone 'Africa/Libreville');
  wd := extract(isodow from local_ts)::smallint;
  mins := (extract(hour from local_ts)*60 + extract(minute from local_ts))::smallint;

  select * into hit from public.school_hours
   where active
     and program = prof.program
     and country_code = coalesce(prof.country_code, 'GA')
     and weekday = wd
     and mins >= start_min and mins < end_min
   limit 1;

  return jsonb_build_object(
    'in_class', found,
    'now_local', to_char(local_ts, 'YYYY-MM-DD HH24:MI'),
    'slot', case when found then hit.label else null end
  );
end;
$function$;

-- 2) my_resumable_work(p_limit) — sessions reprenables de l'élève (scope auth.uid()).
create or replace function public.my_resumable_work(p_limit integer default 10)
 returns setof work_sessions
 language sql
 security definer
 set search_path to 'public'
as $function$
  select * from public.work_sessions
  where user_id = auth.uid()
    and status in ('open','resumable')
  order by created_at desc
  limit greatest(1, least(coalesce(p_limit,10), 50));
$function$;

-- 3) resolve_access(country_code, portal) — éligibilité multi-pays (fail-closed sur pays inconnu).
create or replace function public.resolve_access(p_country_code text, p_portal text)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
    v_row public.operating_countries%rowtype;
begin
    select * into v_row
    from public.operating_countries
    where country_code = upper(coalesce(p_country_code, ''));

    -- Pays inconnu -> accès refusé par défaut (fail-closed)
    if not found then
        return jsonb_build_object(
            'allowed', false,
            'reason',  'country_not_supported',
            'country_code', upper(coalesce(p_country_code, ''))
        );
    end if;

    return jsonb_build_object(
        'allowed', case p_portal
                     when 'national' then v_row.national_program_active
                     when 'aefe'     then v_row.aefe_program_active
                     else false
                   end,
        'country_code', v_row.country_code,
        'country_name', v_row.country_name,
        'program_id',   v_row.program_id,
        'portal',       p_portal
    );
end;
$function$;

-- 4) set_curriculum(program, class_key, country, payload) — upsert curriculum, réservé super_admin/service_role.
create or replace function public.set_curriculum(p_program program_t, p_class_key text, p_country text, p_payload jsonb)
 returns curriculum
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  row public.curriculum;
begin
  if not (public.has_role('super_admin') or auth.role() = 'service_role') then
    raise exception 'forbidden';
  end if;
  insert into public.curriculum (program, class_key, country_code, payload)
  values (p_program, p_class_key, coalesce(p_country,'GA'), coalesce(p_payload,'{}'::jsonb))
  on conflict (program, class_key) do update set
    country_code = excluded.country_code,
    payload = excluded.payload
  returning * into row;
  return row;
end;
$function$;

-- 5) set_first_name(name) — fixe le prénom de l'élève connecté (validation longueur, scope auth.uid()).
create or replace function public.set_first_name(p_name text)
 returns text
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  uid uuid := auth.uid();
  cleaned text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  cleaned := nullif(btrim(p_name), '');
  if cleaned is null or length(cleaned) > 40 then
    raise exception 'invalid name';
  end if;
  update public.profiles set first_name = cleaned where id = uid;
  return cleaned;
end;
$function$;

-- 6) touch_operating_countries() — trigger : maj updated_at sur operating_countries.
create or replace function public.touch_operating_countries()
 returns trigger
 language plpgsql
as $function$
begin new.updated_at = now(); return new; end; $function$;

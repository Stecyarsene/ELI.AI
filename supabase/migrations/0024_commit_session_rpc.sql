-- 0024_commit_session_rpc.sql
-- CAPTURE DOCUMENTAIRE (idempotente) — RPC commit_session telle qu'elle vit en PROD.
-- Reproduit VERBATIM la définition vérifiée (pg_get_functiondef) sur szhdlixejgaqzafpirwv :
--   17 arguments, SECURITY DEFINER, search_path=public, RETURNS bigint.
-- Les 3 derniers paramètres (p_reaction_ms, p_notes, p_error_notions) sont OPTIONNELS
-- avec défauts -> 100 % rétrocompatible avec les appels historiques à 14 arguments.
-- Atomique : insert work_sessions + incrément tally + upsert progress dans une seule transaction.
-- CREATE OR REPLACE : ré-exécutable sans effet de bord. Prérequis : 0023 (colonnes) appliqué.
-- Renuméroté 0024 pour lever la collision de numérotation 0019/0020.

create or replace function public.commit_session(
  p_program text,
  p_subject text,
  p_pillar text default null::text,
  p_status text default 'orange'::text,
  p_title text default ''::text,
  p_summary text default ''::text,
  p_highlights jsonb default '[]'::jsonb,
  p_last_chapter text default null::text,
  p_strengths jsonb default '[]'::jsonb,
  p_improvements jsonb default '[]'::jsonb,
  p_red_zones jsonb default '[]'::jsonb,
  p_class_key text default null::text,
  p_serie text default null::text,
  p_duration_min integer default 0,
  p_reaction_ms integer default 0,
  p_notes jsonb default '{}'::jsonb,
  p_error_notions text[] default '{}'::text[]
)
returns bigint
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid    uuid := auth.uid();
  v_sid    bigint;
  v_status text := lower(coalesce(p_status, 'orange'));
  v_prog   program_t := p_program::program_t;
  v_tally  jsonb;
  v_notion text;
begin
  if v_uid is null then raise exception 'unauthorized'; end if;
  if p_subject is null or length(trim(p_subject)) = 0 then raise exception 'subject_required'; end if;
  if v_status not in ('vert','orange','rouge') then v_status := 'orange'; end if;

  -- 1) HISTORIQUE — session close (+ performance orale : chrono moyen + grille de notes /20)
  insert into work_sessions(
    user_id, program, pillar, subject, class_key, serie,
    title, summary, highlights, status, duration_min, reaction_ms, notes, started_at, ended_at
  ) values (
    v_uid, v_prog, p_pillar, p_subject, p_class_key, p_serie,
    coalesce(nullif(p_title, ''), p_subject), coalesce(p_summary, ''), coalesce(p_highlights, '[]'::jsonb),
    'done', greatest(coalesce(p_duration_min, 0), 0), greatest(coalesce(p_reaction_ms, 0), 0),
    coalesce(p_notes, '{}'::jsonb), now(), now()
  ) returning id into v_sid;

  -- 2) TALLY D'ERREURS — incrément par notion (fondation du « 3× = réflexe à corriger »)
  select coalesce(error_tally, '{}'::jsonb) into v_tally from progress where user_id = v_uid and subject = p_subject;
  v_tally := coalesce(v_tally, '{}'::jsonb);
  if array_length(p_error_notions, 1) is not null then
    foreach v_notion in array p_error_notions loop
      if v_notion is not null and length(trim(v_notion)) > 0 then
        v_tally := jsonb_set(v_tally, array[v_notion], to_jsonb(coalesce((v_tally->>v_notion)::int, 0) + 1), true);
      end if;
    end loop;
  end if;

  -- 3) PROGRESSION — upsert + fusion + append historique de statut + tally
  insert into progress(
    user_id, program, subject, status, last_chapter,
    strengths, improvements, red_zones, history, error_tally, updated_at
  ) values (
    v_uid, v_prog, p_subject, v_status, p_last_chapter,
    coalesce(p_strengths, '[]'::jsonb), coalesce(p_improvements, '[]'::jsonb), coalesce(p_red_zones, '[]'::jsonb),
    jsonb_build_array(jsonb_build_object('s', v_status, 't', now())), v_tally, now()
  )
  on conflict (user_id, subject) do update set
    program      = excluded.program,
    status       = excluded.status,
    last_chapter = coalesce(excluded.last_chapter, progress.last_chapter),
    strengths    = case when jsonb_array_length(excluded.strengths)    > 0 then excluded.strengths    else progress.strengths    end,
    improvements = case when jsonb_array_length(excluded.improvements) > 0 then excluded.improvements else progress.improvements end,
    red_zones    = case when jsonb_array_length(excluded.red_zones)    > 0 then excluded.red_zones    else progress.red_zones    end,
    history      = progress.history || jsonb_build_array(jsonb_build_object('s', v_status, 't', now())),
    error_tally  = v_tally,
    updated_at   = now();

  return v_sid;
end
$function$;

-- Droits réels en prod (vérifiés via pg_proc.proacl) : authenticated + service_role exécutent, anon EXCLU.
revoke all on function public.commit_session(text, text, text, text, text, text, jsonb, text, jsonb, jsonb, jsonb, text, text, integer, integer, jsonb, text[]) from public;
grant execute on function public.commit_session(text, text, text, text, text, text, jsonb, text, jsonb, jsonb, jsonb, text, text, integer, integer, jsonb, text[]) to authenticated, service_role;

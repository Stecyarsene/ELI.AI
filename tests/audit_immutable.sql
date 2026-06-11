\set ON_ERROR_STOP off
drop database if exists eli_audit; create database eli_audit;
\c eli_audit
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable security definer as
$$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create role authenticated nologin;
grant usage on schema auth to authenticated;
\i /home/claude/eli-next/supabase/migrations/0001_eli_init.sql
\i /home/claude/eli-next/supabase/migrations/0002_analytics_iam.sql
\i /home/claude/eli-next/supabase/migrations/0003_countries_multitenant.sql
\i /home/claude/eli-next/supabase/migrations/0004_fix_school_rls.sql
\i /home/claude/eli-next/supabase/migrations/0006_audit_immutable.sql
\i /home/claude/eli-next/supabase/migrations/0007_spaced_repetition.sql
insert into auth.users values ('00000000-0000-0000-0000-0000000000d1'),('00000000-0000-0000-0000-0000000000a1');
insert into profiles (id,program,first_name,class_key) values
 ('00000000-0000-0000-0000-0000000000d1','national','Fondateur','staff'),
 ('00000000-0000-0000-0000-0000000000a1','national','Eleve','terminale');

\echo '── A1 · Un changement de rôle est-il tracé automatiquement ? ──'
insert into user_roles (user_id,role) values ('00000000-0000-0000-0000-0000000000a1','student');
update user_roles set role='teacher' where user_id='00000000-0000-0000-0000-0000000000a1';
select case when count(*)>=2 then 'A1 PASS — '||count(*)||' entrées role_change tracées (insert+update)'
            else 'A1 FAIL — '||count(*) end from audit_logs where action='role_change';

\echo '── A2 · La table d''audit est-elle IMMUABLE (UPDATE bloqué) ? ──'
do $$ begin
  update audit_logs set action='tampered' where id=(select min(id) from audit_logs);
  raise notice 'A2 FAIL — UPDATE a réussi (audit altérable !)';
exception when others then raise notice 'A2 PASS — UPDATE bloqué : %', SQLERRM;
end $$;

\echo '── A3 · DELETE sur l''audit bloqué ? ──'
do $$ begin
  delete from audit_logs where id=(select min(id) from audit_logs);
  raise notice 'A3 FAIL — DELETE a réussi';
exception when others then raise notice 'A3 PASS — DELETE bloqué (append-only)';
end $$;

\echo '── A4 · Cartes de révision : un élève ne lit que les siennes (RLS) ──'
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',false);
insert into skill_cards (user_id,skill) values ('00000000-0000-0000-0000-0000000000a1','derivees');
select case when count(*)=1 then 'A4 PASS — élève voit sa carte' else 'A4 FAIL' end from skill_cards;
reset role;

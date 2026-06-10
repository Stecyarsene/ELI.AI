\set ON_ERROR_STOP off
drop database if exists eli_test; create database eli_test;
\c eli_test
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
grant usage on schema public to authenticated;
grant select on all tables in schema public to authenticated;
insert into auth.users values
 ('00000000-0000-0000-0000-0000000000a1'),('00000000-0000-0000-0000-0000000000a2'),
 ('00000000-0000-0000-0000-0000000000b1'),('00000000-0000-0000-0000-0000000000c1'),
 ('00000000-0000-0000-0000-0000000000d1');
insert into institutions (id,name,code,program) values
 ('10000000-0000-0000-0000-000000000001','AEFE Libreville','AEFE-LBV','aefe'),
 ('10000000-0000-0000-0000-000000000002','AEFE Dakar','AEFE-DKR','aefe');
insert into profiles (id,program,first_name,class_key,institution_id,region,country_code) values
 ('00000000-0000-0000-0000-0000000000a1','aefe','EleveA','terminale','10000000-0000-0000-0000-000000000001','Estuaire',null),
 ('00000000-0000-0000-0000-0000000000a2','aefe','EleveB','terminale','10000000-0000-0000-0000-000000000002','Dakar',null),
 ('00000000-0000-0000-0000-0000000000b1','aefe','ProfA','staff','10000000-0000-0000-0000-000000000001','Estuaire',null),
 ('00000000-0000-0000-0000-0000000000c1','national','AgentMin','staff',null,'Estuaire','GA'),
 ('00000000-0000-0000-0000-0000000000d1','national','Fondateur','staff',null,'Estuaire','GA');
insert into user_roles (user_id,role,institution_id,country_code) values
 ('00000000-0000-0000-0000-0000000000b1','school_admin','10000000-0000-0000-0000-000000000001',null),
 ('00000000-0000-0000-0000-0000000000c1','ministry',null,'GA'),
 ('00000000-0000-0000-0000-0000000000d1','super_admin',null,null);
insert into progress (user_id,program,subject,status,red_zones) values
 ('00000000-0000-0000-0000-0000000000a1','aefe','Maths','rouge','["Equations"]'),
 ('00000000-0000-0000-0000-0000000000a2','aefe','Maths','orange','["Probas"]');
insert into learning_events (user_id,program,region,country_code,subject,concept,success)
 select '00000000-0000-0000-0000-0000000000a1','national','Estuaire','GA','Maths','Equations',(g%3=0) from generate_series(1,12) g;
insert into learning_events (user_id,program,region,country_code,subject,concept,success)
 select '00000000-0000-0000-0000-0000000000a2','national','Ogooue','GA','SVT','Mitose',(g%2=0) from generate_series(1,9) g;
insert into payments (tx_id,user_id,program,plan_id,amount_fcfa,status) values
 ('TX-REAL-001','00000000-0000-0000-0000-0000000000a1','aefe','aefe_mensuel',10000,'success');
insert into notifications (user_id,channel,kind,status) values ('00000000-0000-0000-0000-0000000000a1','email','receipt','sent');
insert into system_health (metric,value,detail) values ('llm_latency_ms',842,'gemini'),('api_error_rate',0.4,'%');
insert into curriculum (program,class_key,country_code,payload) values
 ('national','6eme','GA','{"m":["Maths"]}'),('aefe','6e',null,'{"m":["Maths"]}');
set role authenticated;
\echo 'T1'
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',false);
select case when count(*)=0 then 'T1 PASS isolation eleve<->eleve' else 'T1 FAIL' end from progress where user_id='00000000-0000-0000-0000-0000000000a2';
\echo 'T2'
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b1',false);
select case when count(*) filter (where user_id='00000000-0000-0000-0000-0000000000a1')>0 and count(*) filter (where user_id='00000000-0000-0000-0000-0000000000a2')=0
  then 'T2 PASS voit Libreville 0 ligne Dakar' else 'T2 FAIL lbv='||count(*) filter (where user_id='00000000-0000-0000-0000-0000000000a1')||' dkr='||count(*) filter (where user_id='00000000-0000-0000-0000-0000000000a2') end from progress;
select 'T2b '||count(*)||' lacune(s) etablissement sans PII' from school_gaps_overview();
\echo 'T3'
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c1',false);
select case when count(*)=0 then 'T3a PASS payments 0 ligne (RLS)' else 'T3a FAIL' end from payments;
do $$ begin perform count(*) from admin_ledger(); raise notice 'T3b FAIL'; exception when insufficient_privilege then raise notice 'T3b PASS admin_ledger 42501 (403)'; end $$;
\echo 'T4'
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b1',false);
do $$ begin perform count(*) from admin_ledger(); raise notice 'T4a FAIL'; exception when insufficient_privilege then raise notice 'T4a PASS AEFE->ledger 42501 (403)'; end $$;
do $$ begin perform count(*) from ministry_subject_success(); raise notice 'T4b FAIL'; exception when insufficient_privilege then raise notice 'T4b PASS AEFE->ministere 42501 (403)'; end $$;
\echo 'T5'
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c1',false);
select 'T5a '||program||'/'||region||'/'||subject||' reussite='||success_rate||' n='||sample from ministry_subject_success();
select case when count(*)=0 then 'T5b PASS groupe k=9 EXCLU (k>=10)' else 'T5b FAIL' end from ministry_subject_success() where subject='SVT';
select case when count(*)=0 then 'T5c PASS 0 PII (profiles)' else 'T5c FAIL' end from profiles where first_name like 'Eleve%';
\echo 'T6'
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000d1',false);
select 'T6a '||tx_id||' '||amount_fcfa||' FCFA '||status||' recu='||receipt_sent from admin_ledger();
select 'T6b '||metric||'='||value from admin_system_health();
\echo 'T7'
select set_config('request.jwt.claim.sub','',false);
select case when count(*)=0 then 'T7 PASS anonyme 0 donnee' else 'T7 FAIL' end from profiles;
\echo 'T8'
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c1',false);
select case when count(*) filter (where program='national')>0 then 'T8 PASS curriculum GA actif visible' else 'T8 FAIL' end from curriculum;
reset role;

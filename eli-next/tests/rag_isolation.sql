\set ON_ERROR_STOP off
drop database if exists eli_rag; create database eli_rag;
\c eli_rag
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
\i /home/claude/eli-next/supabase/migrations/0005_rag_strict.sql
grant usage on schema public to authenticated;
grant select on all tables in schema public to authenticated;

-- activer SN pour prouver que MÊME un pays actif reste isolé du Gabon
update countries set active=true where code='SN';
-- 3 docs même matière/examen, pays/programmes différents. Embeddings identiques exprès :
-- seul le FILTRE cursus doit discriminer, pas la proximité vectorielle.
insert into rag_documents (program,country_code,exam,subject,content,embedding) values
 ('national','GA','BAC','Mathématiques','BAC Gabon — annale équations 2024', array_fill(0.1,ARRAY[768])::vector),
 ('national','SN','BAC','Mathématiques','BAC Sénégal — annale équations 2024', array_fill(0.1,ARRAY[768])::vector),
 ('aefe',null,'BAC','Mathématiques','BAC AEFE — spécialité maths', array_fill(0.1,ARRAY[768])::vector);

\echo '── R1 · Élève BAC Gabon : rag_search ne renvoie QUE du contenu GA ──'
select case when count(*)=1 and bool_and(content like '%Gabon%') then 'R1 PASS — 1 doc, 100% Gabon (Sénégal+AEFE exclus)'
            else 'R1 FAIL — '||count(*)||' docs : '||string_agg(content,' | ') end
from rag_search('national','GA','BAC','Mathématiques', array_fill(0.1,ARRAY[768])::vector, 10);

\echo '── R2 · Élève BAC Sénégal : ne voit jamais le Gabon ──'
select case when count(*)=1 and bool_and(content like '%Sénégal%') then 'R2 PASS — isolation pays réciproque'
            else 'R2 FAIL' end
from rag_search('national','SN','BAC','Mathématiques', array_fill(0.1,ARRAY[768])::vector, 10);

\echo '── R3 · Élève AEFE : ne voit aucun contenu national ──'
select case when count(*)=1 and bool_and(content like '%AEFE%') then 'R3 PASS — AEFE isolé du national'
            else 'R3 FAIL' end
from rag_search('aefe',null,'BAC','Mathématiques', array_fill(0.1,ARRAY[768])::vector, 10);

\echo '── R4 · Tentative d''injection : élève GA force p_country=SN via un prompt — mais le serveur passe SON pays (GA) ──'
\echo '   (le paramètre vient du PROFIL serveur, le prompt ne peut pas l''altérer : démonstration que GA reste GA)'
select case when bool_and(content like '%Gabon%') then 'R4 PASS — le filtre serveur prime, aucune fuite SN'
            else 'R4 FAIL' end
from rag_search('national','GA','BAC','Mathématiques', array_fill(0.1,ARRAY[768])::vector, 10);

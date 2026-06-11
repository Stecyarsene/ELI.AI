-- ÉLI · Base vectorielle RAG à isolation stricte (cursus × pays × examen)
-- Garantit que l'IA ne mélange JAMAIS les programmes : un BAC gabonais ne récupère
-- jamais d'archive sénégalaise, ni le programme AEFE, ni un autre examen.
create extension if not exists vector;

do $$ begin create type exam_t as enum ('CEP','BEPC','BAC','BREVET','NONE');
exception when duplicate_object then null; end $$;

create table if not exists rag_documents (
  id bigint generated always as identity primary key,
  program program_t not null,                 -- 'national' | 'aefe'
  country_code text references countries(code),-- NULL pour AEFE (supranational)
  exam exam_t not null default 'NONE',         -- examen ciblé
  subject text not null,
  serie text,                                  -- A1..D / E,F1… / spécialités
  chapter text,
  content text not null,
  embedding vector(768),                       -- Gemini text-embedding-004 = 768 dims
  created_at timestamptz not null default now()
);
create index if not exists rag_filter_idx on rag_documents (program, country_code, exam, subject);
create index if not exists rag_vec_idx on rag_documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table rag_documents enable row level security;
-- Lecture : AEFE pour tous les comptes AEFE ; national filtré par pays ACTIF (cohérent multi-tenant pays)
drop policy if exists "rag readable" on rag_documents;
create policy "rag readable" on rag_documents for select using (
  program = 'aefe'
  or country_code in (select code from countries where active)
);

-- ════ RECHERCHE RAG STRICTE : le filtre cursus/pays/examen est NON-CONTOURNABLE ════
-- Les paramètres de cursus viennent du PROFIL (résolu côté serveur), jamais du prompt élève.
create or replace function public.rag_search(
  p_program program_t, p_country text, p_exam exam_t, p_subject text,
  p_query_embedding vector(768), p_k int default 5
) returns table (chapter text, content text, distance float)
language sql stable security definer set search_path = public as $$
  select d.chapter, d.content, (d.embedding <=> p_query_embedding) as distance
  from rag_documents d
  where d.program = p_program
    and (p_program = 'aefe' or d.country_code = p_country)   -- ISOLATION PAYS (national)
    and (p_exam = 'NONE' or d.exam = p_exam)                 -- ISOLATION EXAMEN
    and d.subject = p_subject                                -- ISOLATION MATIÈRE
  order by d.embedding <=> p_query_embedding
  limit greatest(1, least(p_k, 20));
$$;
revoke all on function rag_search(program_t,text,exam_t,text,vector,int) from public;
grant execute on function rag_search(program_t,text,exam_t,text,vector,int) to authenticated;

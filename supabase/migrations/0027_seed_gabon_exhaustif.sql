-- 0027_seed_gabon_exhaustif.sql
-- P4-a (SEED) — Référentiel « Mon Avenir » : données RÉELLES, SOURCÉES et DATÉES (vérif. 2026-06-19).
-- RÈGLE D'OR : zéro hallucination. Tout champ non vérifié reste NULL (jamais un seuil/une date inventé).
--   • filieres_visees / series_admissibles = guidage d'orientation d'Éli fondé sur la discipline ET les séries
--     officielles du bac gabonais (Office du Bac : A1,A2,B,C,D,E,F1-F4,G1-G3) ; lorsqu'un concours fixe
--     officiellement les séries admissibles (INSAB, USS), elles sont reprises telles quelles depuis la source.
--   • seuil_info / dates restent NULL quand la source ne les donne pas explicitement.
-- IDEMPOTENT : contraintes uniques (country_code, name) + ON CONFLICT DO UPDATE -> ré-exécutable sans doublon.
-- NON appliqué par cette passe : à valider d'abord. Sources listées dans les colonnes source/source_url.

-- ───────── Clés naturelles pour l'idempotence ─────────
do $$ begin
  if not exists (select 1 from pg_constraint where conname='schools_name_country_uk')  then
    alter table public.schools  add constraint schools_name_country_uk  unique (country_code, name); end if;
  if not exists (select 1 from pg_constraint where conname='concours_name_country_uk') then
    alter table public.concours add constraint concours_name_country_uk unique (country_code, name); end if;
  if not exists (select 1 from pg_constraint where conname='bourses_name_country_uk')  then
    alter table public.bourses  add constraint bourses_name_country_uk  unique (country_code, name); end if;
end $$;

-- ════════════════════════ 1) ÉTABLISSEMENTS (schools) ════════════════════════
insert into public.schools (country_code, name, kind, city, filieres_visees, prerequis, description, source, source_url, date_verif) values
('GA', $t$Université Omar Bongo (UOB)$t$, 'universite', 'Libreville', '{A1,A2,B,G1,G2,G3}',
  null, $t$Université pluridisciplinaire publique : lettres, sciences humaines, droit, économie-gestion.$t$,
  $t$Ministère de l'Enseignement supérieur (Gabon) ; orniformation$t$, 'https://www.enseignement-superieur.gouv.ga', '2026-06-19'),
('GA', $t$Université des Sciences et Techniques de Masuku (USTM)$t$, 'universite', 'Franceville', '{C,D,E,F1,F2,F3,F4}',
  null, $t$Université scientifique et technique publique (sciences exactes, technologie, ingénierie).$t$,
  $t$gabon4you ; Ministère de l'Enseignement supérieur (Gabon)$t$, 'https://gabon4you.com/business_guide_category/ecoles-formations/', '2026-06-19'),
('GA', $t$Université des Sciences de la Santé (USS)$t$, 'universite', 'Owendo', '{C,D}',
  null, $t$Université publique de santé : médecine (bac+7), pharmacie, formations paramédicales.$t$,
  $t$gabon4you$t$, 'https://gabon4you.com/business_guide_category/ecoles-formations/', '2026-06-19'),
('GA', $t$École Polytechnique de Masuku (EPM)$t$, 'ingenieur', 'Franceville', '{C,D,E,F1,F2,F3,F4}',
  null, $t$Grande école d'ingénieurs (au sein de l'USTM) : génie civil, informatique-télécom, mécanique, électrique, sciences de l'ingénieur.$t$,
  $t$gabon4you ; Ministère de l'Enseignement supérieur (Gabon)$t$, 'https://gabon4you.com/business_guide_category/ecoles-formations/', '2026-06-19'),
('GA', $t$École Normale Supérieure (ENS)$t$, 'ecole_normale', 'Libreville', '{A1,A2,B,C,D}',
  null, $t$Forme les enseignants des lycées et collèges, inspecteurs et conseillers pédagogiques de l'enseignement général.$t$,
  $t$gabon4you ; Ministère de l'Enseignement supérieur (Gabon)$t$, 'https://gabon4you.com/business_guide_category/ecoles-formations/', '2026-06-19'),
('GA', $t$École Normale Supérieure de l'Enseignement Technique (ENSET)$t$, 'ecole_normale', 'Libreville', '{C,E,F1,F2,F3,F4,G1,G2,G3}',
  null, $t$Forme techniciens supérieurs, ingénieurs et enseignants techniques (mécanique, électromécanique, dessin industriel, comptabilité).$t$,
  $t$gabon4you$t$, 'https://gabon4you.com/business_guide_category/ecoles-formations/', '2026-06-19'),
('GA', $t$Institut Supérieur de Technologie (IST)$t$, 'institut', 'Libreville', '{C,E,F1,F2,F3,F4,G1,G2,G3}',
  null, $t$Formations technologiques d'État : DTS, DUT, BTS, Licence Pro, Master.$t$,
  $t$orniformation ; gabon4you$t$, 'https://orniformation.com/index.php/fr/features/2014-06-25-09-56-46/435-grandes-ecoles-au-gabon', '2026-06-19'),
('GA', $t$École Nationale des Eaux et Forêts (ENEF)$t$, 'ecole', 'Libreville', '{C,D}',
  null, $t$Formations en foresterie, environnement, gestion de l'eau et sciences naturelles.$t$,
  $t$Ministère de l'Enseignement supérieur (Gabon) ; uni24k$t$, 'https://www.enseignement-superieur.gouv.ga', '2026-06-19'),
('GA', $t$Institut National Supérieur d'Agronomie et de Biotechnologies (INSAB)$t$, 'institut', 'Franceville', '{C,D,A1,B}',
  $t$Concours d'entrée. Agronomie : Bac C, D, STL, STA. Entrepreneuriat : Bac C, D, A1, B.$t$,
  $t$Institut d'agronomie et de biotechnologies au sein de l'USTM (agriculture, biotechnologie, agro-industrie, entrepreneuriat).$t$,
  $t$Gabon Opportunités (communiqué USTM/INSAB 2025-2026)$t$, 'https://gabonopportunites.com/category/nationaux/', '2026-06-19'),
('GA', $t$École Nationale de la Magistrature$t$, 'ecole', 'Libreville', '{A1,A2,B}',
  null, $t$Formation des magistrats et professions judiciaires (droit, droit pénal, droit civil, administration de la justice).$t$,
  $t$uni24k$t$, 'https://fr.uni24k.com/c/gabon/', '2026-06-19'),
('GA', $t$École des Mines, des Terres Rares et de Géologie (EMTRG)$t$, 'ingenieur', 'Moanda', '{C,D,E,F4}',
  null, $t$PROJET (statut à confirmer) — école des mines, terres rares et géologie annoncée à Moanda.$t$,
  $t$Ministère de l'Enseignement supérieur (Gabon) — liste « en projet »$t$, 'https://www.enseignement-superieur.gouv.ga', '2026-06-19')
on conflict (country_code, name) do update set
  kind=excluded.kind, city=excluded.city, filieres_visees=excluded.filieres_visees,
  prerequis=excluded.prerequis, description=excluded.description,
  source=excluded.source, source_url=excluded.source_url, date_verif=excluded.date_verif;

-- ════════════════════════ 2) CONCOURS ════════════════════════
insert into public.concours (country_code, name, school_id, series_admissibles, date_ouverture, date_cloture, seuil_info, modalites, source, source_url, date_verif) values
('GA', $t$Concours d'entrée INSAB 2025-2026$t$,
  (select id from public.schools where country_code='GA' and name=$t$Institut National Supérieur d'Agronomie et de Biotechnologies (INSAB)$t$),
  '{C,D,A1,B}', null, null, null,
  $t$Concours le 25/07/2025 ; inscriptions en ligne sur le site de l'USTM. Licence Agronomie (Bac C, D, STL, STA) ; Licence Entrepreneuriat (Bac C, D, A1, B).$t$,
  $t$Gabon Opportunités (communiqué INSAB/USTM)$t$, 'https://gabonopportunites.com/category/nationaux/', '2026-06-19'),
('GA', $t$Concours d'entrée USS — Médecine & Paramédical 2025-2026$t$,
  (select id from public.schools where country_code='GA' and name=$t$Université des Sciences de la Santé (USS)$t$),
  '{C,D}', null, null, null,
  $t$Nationalité gabonaise ; Bac série C ou D (session en cours). Âge : ≤ 19 ans (médecine), ≤ 21 ans (sages-femmes / sciences infirmières).$t$,
  $t$Gabon Opportunités (communiqué Recteur USS)$t$, 'https://gabonopportunites.com/category/nationaux/', '2026-06-19'),
('GA', $t$Concours d'entrée EPM (ingénieur)$t$,
  (select id from public.schools where country_code='GA' and name=$t$École Polytechnique de Masuku (EPM)$t$),
  '{C,D,E,F4}', null, null, null,
  $t$Recrutement sur concours (grande école d'ingénieurs). Calendrier et seuils publiés chaque année par l'EPM/USTM.$t$,
  $t$gabon4you ; Ministère de l'Enseignement supérieur (Gabon)$t$, 'https://gabon4you.com/business_guide_category/ecoles-formations/', '2026-06-19'),
('GA', $t$Concours d'entrée ENS (enseignement général)$t$,
  (select id from public.schools where country_code='GA' and name=$t$École Normale Supérieure (ENS)$t$),
  '{A1,A2,B,C,D}', null, null, null,
  $t$Recrutement sur concours. Calendrier publié chaque année par l'ENS.$t$,
  $t$gabon4you$t$, 'https://gabon4you.com/business_guide_category/ecoles-formations/', '2026-06-19'),
('GA', $t$Concours d'entrée ENSET (enseignement technique)$t$,
  (select id from public.schools where country_code='GA' and name=$t$École Normale Supérieure de l'Enseignement Technique (ENSET)$t$),
  '{C,E,F1,F2,F3,F4,G1,G2,G3}', null, null, null,
  $t$Recrutement sur concours. Calendrier publié chaque année par l'ENSET.$t$,
  $t$gabon4you$t$, 'https://gabon4you.com/business_guide_category/ecoles-formations/', '2026-06-19')
on conflict (country_code, name) do update set
  school_id=excluded.school_id, series_admissibles=excluded.series_admissibles,
  date_ouverture=excluded.date_ouverture, date_cloture=excluded.date_cloture,
  seuil_info=excluded.seuil_info, modalites=excluded.modalites,
  source=excluded.source, source_url=excluded.source_url, date_verif=excluded.date_verif;

-- ════════════════════════ 3) BOURSES (ANBG) ════════════════════════
insert into public.bourses (country_code, name, organisme, type, criteres, seuil_info, date_limite, documents, source, source_url, date_verif) values
('GA', $t$Bourse nationale (ANBG)$t$, 'ANBG', 'nationale',
  $t$Nationalité gabonaise ; demande déposée dans les délais (plateforme eBourse) ; titulaire du baccalauréat ; orienté par une entité compétente ; âge ≤ 22 ans (bac général/technique) ou ≤ 27 ans (bac professionnel). Les bacheliers admis aux concours des grandes écoles sont dispensés des critères d'âge et de moyenne. Cumul de bourses interdit.$t$,
  $t$Moyenne ≥ 10/20 en classe de terminale ET ≥ 10/20 au baccalauréat.$t$,
  null, '{}',
  $t$Gabonactu (clarifications ministère, 24/09/2024 et 16/07/2024) ; décret n°0065 de février 2024 ; ANBG$t$,
  'https://gabonactu.com/blog/2024/07/16/anbg-conditions-et-demandes-de-bourses-au-peigne-fin/', '2026-06-19'),
('GA', $t$Bourse d'études à l'étranger (ANBG)$t$, 'ANBG', 'etranger',
  $t$En plus des conditions de la bourse nationale : la filière choisie ne doit PAS être proposée sur le territoire national. Procédure via eBourse.$t$,
  $t$≥ 10/20 en terminale ; au baccalauréat : ≥ 13/20 pour les séries littéraires, ≥ 12/20 pour les séries scientifiques.$t$,
  null, '{}',
  $t$Gabonactu (16/07/2024, DGA ANBG) ; décret n°0065 de février 2024$t$,
  'https://gabonactu.com/blog/2024/07/16/anbg-conditions-et-demandes-de-bourses-au-peigne-fin/', '2026-06-19')
on conflict (country_code, name) do update set
  organisme=excluded.organisme, type=excluded.type, criteres=excluded.criteres,
  seuil_info=excluded.seuil_info, date_limite=excluded.date_limite, documents=excluded.documents,
  source=excluded.source, source_url=excluded.source_url, date_verif=excluded.date_verif;

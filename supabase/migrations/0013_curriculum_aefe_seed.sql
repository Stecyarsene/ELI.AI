-- 0013 — Seed curriculum AEFE (parité repo ; déjà ingéré en base via set_curriculum).
-- Niveau DOMAINES/THÈMES officiels EN VIGUEUR (eduscol/BO). Aucune notion "plausible" inventée.
-- NB: nouveau programme maths cycle 4 en vigueur progressivement (5e sept-2026, 4e 2027, 3e 2028).
-- National (Gabon) NON ingéré : programmes officiels IPN non disponibles en ligne sous forme structurée exploitable.
select set_curriculum('aefe','6e','GA','{"source":"eduscol/BO — programmes cycle 3 (2020/2023)","updated":"2026-06","granularity":"domaines","subjects":[{"name":"Mathématiques","chapters":[{"order":1,"title":"Nombres et calculs"},{"order":2,"title":"Grandeurs et mesures"},{"order":3,"title":"Espace et géométrie"}]},{"name":"Sciences et technologie","chapters":[{"order":1,"title":"Matière, mouvement, énergie, information"},{"order":2,"title":"Le vivant, sa diversité et les fonctions qui le caractérisent"},{"order":3,"title":"Matériaux et objets techniques"},{"order":4,"title":"La planète Terre, les êtres vivants dans leur environnement"}]}]}');
-- (5e/4e/3e Maths+Physique-Chimie+SVT ; 2nde Maths+PC+SVT ; 1re/Tle spécialité Mathématiques — voir base)

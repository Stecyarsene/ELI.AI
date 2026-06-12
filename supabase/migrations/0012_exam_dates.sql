-- 0012 — Dates d'examens (compte à rebours dynamique, recalculé chaque jour côté client).
-- Éditable sans redéploiement. Lisible par tous (info publique) ; écriture service_role.
create table if not exists exam_dates (
  id          bigint generated always as identity primary key,
  program     text not null check (program in ('national','aefe')),
  country_code text not null default 'GA',
  exam_key    text not null,
  label       text not null default '',
  exam_date   date not null,
  provisional boolean not null default false,
  year        int not null default 2026,
  updated_at  timestamptz not null default now(),
  unique (program, country_code, exam_key, year)
);
alter table exam_dates enable row level security;
drop policy if exists "exam dates readable" on exam_dates;
create policy "exam dates readable" on exam_dates for select using (true);

insert into exam_dates (program, country_code, exam_key, label, exam_date, provisional, year) values
  ('national','GA','cep',          'CEP',           '2026-06-15', false, 2026),
  ('national','GA','bepc',         'BEPC',          '2026-06-22', true,  2026),
  ('national','GA','bac_general',  'BAC général',   '2026-06-30', false, 2026),
  ('national','GA','bac_technique','BAC technique', '2026-06-30', true,  2026),
  ('aefe','GA','brevet',           'Brevet (DNB)',  '2026-06-26', false, 2026),
  ('aefe','GA','bac_aefe',         'Bac',           '2026-06-15', false, 2026)
on conflict (program, country_code, exam_key, year) do nothing;

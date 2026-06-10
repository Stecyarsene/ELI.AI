create table if not exists countries (
  code text primary key, name text not null, currency text not null default 'XAF', active boolean not null default false);
insert into countries (code,name,currency,active) values
  ('GA','Gabon','XAF',true),('SN','Senegal','XOF',false),('CI','Cote dIvoire','XOF',false),
  ('CM','Cameroun','XAF',false),('CD','RD Congo','CDF',false),('BJ','Benin','XOF',false),
  ('TG','Togo','XOF',false),('BF','Burkina Faso','XOF',false)
on conflict (code) do nothing;
alter table profiles add column if not exists country_code text references countries(code);
update profiles set country_code='GA' where program='national' and country_code is null;
alter table curriculum add column if not exists country_code text references countries(code);
update curriculum set country_code='GA' where program='national' and country_code is null;
alter table learning_events add column if not exists country_code text references countries(code);
alter table user_roles add column if not exists country_code text references countries(code);
drop policy if exists "curriculum readable" on curriculum;
create policy "curriculum readable" on curriculum for select using (
  program = 'aefe' or country_code in (select code from countries where active));

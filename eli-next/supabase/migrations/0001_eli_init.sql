-- ÉLI · Migration initiale (MAD §1.2) — idempotente, bi-programme
do $$ begin create type program_t as enum ('national','aefe');
exception when duplicate_object then null; end $$;

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  program program_t not null,
  first_name text not null default '',
  birth_date date,
  class_key text not null default '',
  serie text,
  parent_phone_enc bytea,
  is_paid boolean not null default false,
  paid_until timestamptz,
  bougie boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists progress (
  user_id uuid not null references profiles(id) on delete cascade,
  program program_t not null,
  subject text not null,
  status text not null default 'orange' check (status in ('vert','orange','rouge')),
  last_chapter text,
  strengths jsonb not null default '[]',
  improvements jsonb not null default '[]',
  red_zones jsonb not null default '[]',
  history jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  primary key (user_id, subject)
);

create table if not exists plans (
  id text primary key,
  program program_t not null,
  label text not null,
  amount_fcfa int not null,
  duration_days int not null
);
insert into plans (id, program, label, amount_fcfa, duration_days) values
  ('nat_mensuel','national','Mensuel',5000,30),
  ('nat_trimestriel','national','Trimestriel',15000,90),
  ('nat_annuel','national','Annuel',40000,300),
  ('aefe_mensuel','aefe','Mensuel',10000,30),
  ('aefe_trimestriel','aefe','Trimestriel',25000,90),
  ('aefe_annuel','aefe','Annuel',75000,300)
on conflict (id) do nothing;

create table if not exists payments (
  tx_id text primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  program program_t not null,
  plan_id text not null references plans(id),
  amount_fcfa int not null,
  status text not null default 'pending' check (status in ('pending','success','failed')),
  invoice_path text,
  created_at timestamptz not null default now()
);

create table if not exists parental_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  parent_name text not null,
  parent_phone_enc bytea not null,
  consented_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  channel text not null check (channel in ('email','sms')),
  kind text not null,
  status text not null default 'queued',
  retries int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists curriculum (
  program program_t not null,
  class_key text not null,
  payload jsonb not null,
  primary key (program, class_key)
);

-- ── RLS : Zero Trust (MAD §4.1) ──
alter table profiles enable row level security;
alter table progress enable row level security;
alter table payments enable row level security;
alter table parental_consents enable row level security;
alter table notifications enable row level security;
alter table curriculum enable row level security;

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles for select using (auth.uid() = id);
drop policy if exists "own profile update" on profiles;
create policy "own profile update" on profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and is_paid = (select p.is_paid from profiles p where p.id = auth.uid()));
drop policy if exists "own progress" on progress;
create policy "own progress" on progress for select using (auth.uid() = user_id);
drop policy if exists "own payments" on payments;
create policy "own payments" on payments for select using (auth.uid() = user_id);
drop policy if exists "own consents" on parental_consents;
create policy "own consents" on parental_consents for select using (auth.uid() = user_id);
drop policy if exists "own notifications" on notifications;
create policy "own notifications" on notifications for select using (auth.uid() = user_id);
drop policy if exists "curriculum readable" on curriculum;
create policy "curriculum readable" on curriculum for select using (true);

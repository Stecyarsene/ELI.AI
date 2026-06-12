-- 0010 — Notifications push : canal 'push', opt-out parental, tokens d'appareil, index reminders.

-- 1) Autoriser le canal 'push' (le journal n'acceptait que email|sms).
alter table notifications drop constraint if exists notifications_channel_check;
alter table notifications add constraint notifications_channel_check
  check (channel in ('email','sms','push'));

-- 2) Réglage parental : couper/réduire les rappels.
alter table profiles add column if not exists reminders_opt_out boolean not null default false;

-- 3) Jetons d'appareil (Capacitor Push) pour cibler l'envoi serveur.
create table if not exists device_tokens (
  user_id    uuid not null references profiles(id) on delete cascade,
  platform   text not null check (platform in ('android','ios','web')),
  token      text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, token)
);
alter table device_tokens enable row level security;
drop policy if exists "own device tokens select" on device_tokens;
create policy "own device tokens select" on device_tokens for select using (auth.uid() = user_id);
drop policy if exists "own device tokens insert" on device_tokens;
create policy "own device tokens insert" on device_tokens for insert with check (auth.uid() = user_id);
drop policy if exists "own device tokens update" on device_tokens;
create policy "own device tokens update" on device_tokens for update using (auth.uid() = user_id);

-- 4) Lecture rapide des rappels dus par le cron.
create index if not exists reminders_due_idx on reminders (status, scheduled_at);
create index if not exists notifications_user_day_idx on notifications (user_id, created_at);

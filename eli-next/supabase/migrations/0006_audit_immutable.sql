-- ÉLI · Journal d'audit IMMUABLE + détection de changement de rôle (doc 8, pilier 4)
-- Toute modification de rôle est tracée ; la table d'audit est append-only (ni UPDATE ni DELETE).
create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  actor uuid,                       -- qui (auth.uid())
  action text not null,             -- ex: 'role_change'
  target uuid,                      -- sur qui
  detail jsonb not null default '{}',
  at timestamptz not null default now()
);
alter table audit_logs enable row level security;
-- Lecture réservée au super_admin (via RPC dédiée) ; aucune policy d'écriture client.
drop policy if exists "audit super admin read" on audit_logs;
create policy "audit super admin read" on audit_logs for select using (public.has_role('super_admin'));

-- IMMUTABILITÉ : bloque tout UPDATE/DELETE, même par le propriétaire de la ligne.
create or replace function public.audit_no_mutation() returns trigger
language plpgsql as $fn$
begin
  raise exception 'audit_logs est append-only (ni modification ni suppression)' using errcode = '0A000';
end $fn$;
drop trigger if exists trg_audit_immutable on audit_logs;
create trigger trg_audit_immutable before update or delete on audit_logs
  for each row execute function public.audit_no_mutation();

-- TRACE AUTOMATIQUE des changements de rôle dans user_roles (insert/update/delete)
create or replace function public.trace_role_change() returns trigger
language plpgsql security definer set search_path = public as $fn$
begin
  insert into audit_logs(actor, action, target, detail)
  values (
    auth.uid(), 'role_change',
    coalesce(NEW.user_id, OLD.user_id),
    jsonb_build_object('op', TG_OP, 'old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  return coalesce(NEW, OLD);
end $fn$;
drop trigger if exists trg_trace_role on user_roles;
create trigger trg_trace_role after insert or update or delete on user_roles
  for each row execute function public.trace_role_change();

-- RPC de lecture (super_admin uniquement, sinon 403)
create or replace function public.admin_audit_logs()
returns setof audit_logs language plpgsql stable security definer set search_path = public as $fn$
begin
  if not has_role('super_admin') then raise exception 'forbidden' using errcode = '42501'; end if;
  return query select * from audit_logs order by at desc limit 500;
end $fn$;
revoke all on function admin_audit_logs() from public;
grant execute on function admin_audit_logs() to authenticated;

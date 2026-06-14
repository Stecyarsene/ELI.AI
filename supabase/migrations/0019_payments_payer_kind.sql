-- 0019 — Distingue le payeur (élève vs enseignant) pour router l'activation premium.
-- Additive et idempotente. Défaut 'student' : aucun impact sur les paiements existants.
alter table public.payments add column if not exists payer_kind text not null default 'student';
do $$ begin
  if not exists (select 1 from pg_constraint where conname='payments_payer_kind_chk') then
    alter table public.payments add constraint payments_payer_kind_chk check (payer_kind in ('student','teacher'));
  end if;
end $$;

-- 0011 — RPC set_bougie : persiste le Mode Bougie (profiles.bougie) au nom de l'élève.
-- Modèle calqué sur set_first_name (security definer, auth.uid()).
create or replace function public.set_bougie(p_on boolean)
returns boolean language plpgsql security definer set search_path to 'public' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  update public.profiles set bougie = coalesce(p_on, false) where id = uid;
  return coalesce(p_on, false);
end; $$;
grant execute on function public.set_bougie(boolean) to authenticated;

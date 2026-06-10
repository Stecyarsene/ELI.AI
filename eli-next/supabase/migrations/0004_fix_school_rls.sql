-- ÉLI · Correctif cloisonnement multi-tenant établissement (détecté par le test T2)
-- PIÈGE RLS : une sous-requête de policy qui joint `profiles` subit la RLS de `profiles`
-- (policy "own profile") → l'élève est invisible au prof → EXISTS=false → 0 ligne.
-- SOLUTION : encapsuler le test d'appartenance dans une fonction SECURITY DEFINER
-- qui lit l'établissement de l'élève en contournant la RLS, sans jamais exposer de PII.
create or replace function public.same_institution(child uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from user_roles ur
    join profiles p on p.id = child
    where ur.user_id = auth.uid()
      and ur.role in ('school_admin','teacher')
      and ur.institution_id is not null
      and ur.institution_id = p.institution_id
  )
$$;
revoke all on function same_institution(uuid) from public;
grant execute on function same_institution(uuid) to authenticated;

drop policy if exists "own progress" on progress;
create policy "own progress" on progress for select using (auth.uid() = user_id);

drop policy if exists "school reads own students progress" on progress;
create policy "school reads own students progress" on progress for select
  using (public.same_institution(progress.user_id));

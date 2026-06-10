import { requireRole, bearerOf, supabaseAsUser } from '@/lib/roles';
export async function GET(req: Request) {
  const auth = await requireRole(req, ['ministry', 'super_admin']);
  if ('error' in auth) return auth.error;
  const sb = supabaseAsUser(bearerOf(req)!);
  const [success, concepts, hourly] = await Promise.all([
    sb.rpc('ministry_subject_success'), sb.rpc('ministry_problem_concepts'), sb.rpc('ministry_hourly_usage')]);
  if (success.error || concepts.error || hourly.error) return Response.json({ error: 'forbidden' }, { status: 403 });
  return Response.json({ success: success.data, problemConcepts: concepts.data, hourlyUsage: hourly.data });
}

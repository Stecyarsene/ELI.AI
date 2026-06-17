import { supabaseAdmin } from '@/lib/supabase/server';
import { requireRole } from '@/lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/resources — historique DURABLE des ressources générées par l'enseignant
 * (accessible même longtemps après), avec un mini-résumé du travail effectué pour chacune.
 * Réservé aux rôles enseignants. Filtré côté serveur sur le propriétaire.
 */
export async function GET(req: Request) {
  const gate = await requireRole(req, ['teacher', 'school_admin', 'super_admin']);
  if ('error' in gate) return gate.error;

  const url = new URL(req.url);
  const subject = url.searchParams.get('subject');
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 60), 1), 200);

  const sb = supabaseAdmin();
  let q = sb
    .from('teacher_resources')
    .select('id, program, class_key, subject, notion, kind, title, summary, content, created_at')
    .eq('teacher_id', gate.user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (subject) q = q.eq('subject', subject);

  const { data, error } = await q;
  if (error) return Response.json({ error: 'db_error' }, { status: 500 });
  return Response.json({ ok: true, resources: data ?? [] });
}

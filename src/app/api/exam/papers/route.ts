import { supabaseAdmin, userFromRequest } from '@/lib/supabase/server';
import { filterPapersForSerie, type ExamPaperLike } from '@/lib/exam';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PaperRow extends ExamPaperLike {
  id: string; exam: string | null; serie: string | null; subject: string | null;
  title: string | null; year: number | null; drive_file_id: string | null; status: string | null;
}

/**
 * GET /api/exam/papers?serie=C&program=national&exam=BAC — épreuves d'une série (T7).
 * Ouvre l'accès à TOUTES les séries (sélecteur). Si serie absente, renvoie tout le programme.
 * Réservé aux utilisateurs connectés (espace examen post-connexion).
 */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const program = url.searchParams.get('program') === 'aefe' ? 'aefe' : 'national';
  const serie = (url.searchParams.get('serie') || '').trim();
  const exam = (url.searchParams.get('exam') || '').trim().toUpperCase();

  let q = supabaseAdmin().from('exam_papers')
    .select('id, exam, serie, subject, title, year, drive_file_id, status')
    .eq('program', program);
  if (exam) q = q.eq('exam', exam);
  const { data, error } = await q.order('subject', { ascending: true });
  if (error) return Response.json({ error: 'query_failed' }, { status: 500 });

  const rows = (data as PaperRow[] | null) ?? [];
  const papers = serie ? filterPapersForSerie(rows, serie) : rows;
  return Response.json({ program, serie: serie || null, exam: exam || null, count: papers.length, papers });
}

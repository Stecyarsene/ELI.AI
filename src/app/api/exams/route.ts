import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/exams?program=national|aefe — dates d'examens (info publique, pas d'auth).
 *  Le client recalcule le « J-XX » chaque jour à partir de exam_date. */
export async function GET(req: Request) {
  const program = new URL(req.url).searchParams.get('program');
  let q = supabaseAdmin().from('exam_dates')
    .select('program, country_code, exam_key, label, exam_date, provisional, year')
    .order('exam_date', { ascending: true });
  if (program === 'national' || program === 'aefe') q = q.eq('program', program);
  const { data, error } = await q;
  if (error) return Response.json({ items: [] });
  return Response.json({ items: data ?? [] }, { headers: { 'cache-control': 'public, max-age=3600' } });
}

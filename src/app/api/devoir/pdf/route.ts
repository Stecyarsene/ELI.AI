import { userFromRequest } from '@/lib/supabase/server';
import { buildExamPdf } from '@/lib/pdf/sessionPdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/devoir/pdf {title, subject, intro, sections:[{heading,items[]}]}
 *  Génère un PDF de marque (épreuves ou corrigé) directement à partir du contenu fourni.
 *  Aucune écriture en base : le fichier est renvoyé tel quel pour téléchargement depuis le chat. */
export async function POST(req: Request): Promise<Response> {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || typeof b !== 'object') return Response.json({ error: 'invalid_input' }, { status: 400 });

  const title = String(b.title || 'Épreuve').slice(0, 140);
  const subject = String(b.subject || title).slice(0, 140);
  const intro = String(b.intro || '').slice(0, 1200);

  type Sec = { heading: string; items: string[] };
  let sections: Sec[] = [];
  if (Array.isArray(b.sections)) {
    sections = (b.sections as Record<string, unknown>[]).slice(0, 30).map((s) => ({
      heading: String(s.heading || s.title || 'Partie').slice(0, 140),
      items: (Array.isArray(s.items) ? (s.items as unknown[]) : []).map((x) => String(x).slice(0, 600)).slice(0, 60),
    }));
  }
  sections = sections.filter((s) => s.items.length);
  if (!sections.length) sections = [{ heading: 'Consignes', items: [intro || 'Compose au calme, puis renvoie ta copie à Éli.'] }];

  const bytes = await buildExamPdf({ examName: title, subject, intro, sections });
  return new Response(Buffer.from(bytes), {
    headers: { 'content-type': 'application/pdf', 'content-disposition': 'inline; filename="epreuve.pdf"' },
  });
}

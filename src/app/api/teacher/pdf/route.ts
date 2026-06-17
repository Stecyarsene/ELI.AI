import { supabaseAdmin } from '@/lib/supabase/server';
import { requireRole } from '@/lib/roles';
import { safeParse, teacherPdfInput } from '@/lib/validation/schemas';
import { buildTeacherPdf } from '@/lib/pdf/sessionPdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KIND_LABEL: Record<string, string> = {
  fiche: 'Fiche de cours', controle: 'Contrôle + corrigé', diapos: 'Diapositives', progression: 'Progression',
};
function slug(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').toLowerCase().slice(0, 40) || 'doc';
}

/**
 * POST /api/teacher/pdf — transforme le matériel généré (affiché à l'écran) en PDF
 * de marque, imprimable et téléchargeable (T3 §c). Réservé aux enseignants/admins.
 * Stocké dans le bucket privé `documents`, renvoyé via lien signé (1 h).
 */
export async function POST(req: Request) {
  const gate = await requireRole(req, ['teacher', 'school_admin', 'super_admin']);
  if ('error' in gate) return gate.error;

  const parsed = safeParse(teacherPdfInput, await req.json().catch(() => null));
  if (!parsed.ok) return Response.json({ error: 'invalid_input', detail: parsed.error }, { status: 400 });
  const { program, classKey, serie, subject, notion, kind, markdown } = parsed.data;

  // Garde anti-PDF-vide : on ne génère jamais un document sans contenu réel.
  if (!markdown || markdown.replace(/[\s#*`>-]/g, '').length < 40) {
    return Response.json({ error: 'empty_content', detail: 'Le matériel généré est vide ou incomplet.' }, { status: 422 });
  }

  const meta = [
    program === 'aefe' ? 'AEFE' : 'National',
    classKey, serie || null, subject || null, notion || null, KIND_LABEL[kind] ?? kind,
  ].filter(Boolean) as string[];
  const title = `${KIND_LABEL[kind] ?? kind}${subject ? ' — ' + subject : ''}${notion ? ' · ' + notion : ''}`;

  let signedUrl: string | null = null;
  try {
    const bytes = await buildTeacherPdf({ title, meta, markdown });
    const sb = supabaseAdmin();
    const path = `${gate.user.id}/teacher/${slug(subject || kind)}-${slug(notion || classKey)}-${Date.now()}.pdf`;
    const up = await sb.storage.from('documents').upload(path, bytes, { contentType: 'application/pdf', upsert: true });
    if (!up.error) {
      const s = await sb.storage.from('documents').createSignedUrl(path, 3600);
      signedUrl = s.data?.signedUrl ?? null;
    }
  } catch {
    return Response.json({ error: 'pdf_failed' }, { status: 500 });
  }
  if (!signedUrl) return Response.json({ error: 'pdf_failed' }, { status: 500 });
  return Response.json({ ok: true, signedUrl });
}

import { supabaseAdmin, supabaseAsUser, tokenFromRequest, userFromRequest } from '@/lib/supabase/server';
import { safeParse, sessionOpenInput, sessionCloseInput } from '@/lib/validation/schemas';
import { buildSessionPdf } from '@/lib/pdf/sessionPdf';
import type { Profile, WorkSession } from '@/types/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function tomorrow18hUTC(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + 1, 17, 0, 0)).toISOString();
}

/** Résumé « Éli rédige » (heuristique robuste, sans dépendance LLM). */
function summarize(transcript: { role: string; text: string }[], subject?: string | null) {
  const mine = transcript.filter((t) => t.role !== 'eli' && t.role !== 'assistant').map((t) => t.text.trim()).filter(Boolean);
  const first = mine[0] || '';
  const summary = `Session de travail${subject ? ' en ' + subject : ''} : ${transcript.length} échanges avec Éli.` +
    (first ? ` On est partis de : « ${first.slice(0, 180)} ».` : '');
  const highlights = mine.slice(0, 4).map((m) => m.slice(0, 90));
  return { summary, highlights };
}

/** POST /api/session — ouvre ({action:'open'}) ou clôt ({action:'close'}) une session de travail.
 *  La clôture rédige summary/highlights, génère le PDF récap (bucket `documents`) et programme la continuité.
 *  Écriture service_role (work_sessions/reminders en RLS select-own). */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const sb = supabaseAdmin();
  const raw = (await req.json().catch(() => null)) as { action?: string } | null;

  // ── OUVERTURE ──
  if (raw?.action === 'open') {
    const parsed = safeParse(sessionOpenInput, raw);
    if (!parsed.ok) return Response.json({ error: 'invalid_input', detail: parsed.error }, { status: 400 });
    const { pillar, subject, classKey, serie, title } = parsed.data;
    const { data: prof } = await sb.from('profiles').select('program').eq('id', user.id).single();
    const program = (prof as Pick<Profile, 'program'> | null)?.program ?? 'national';
    const { data, error } = await sb.from('work_sessions').insert({
      user_id: user.id, program, pillar: pillar ?? null, subject: subject ?? null,
      class_key: classKey ?? null, serie: serie ?? null,
      title: title || (subject ? `Travail en ${subject}` : 'Session de travail'), status: 'open',
    }).select('id').single();
    if (error) return Response.json({ error: 'db_error' }, { status: 500 });
    return Response.json({ ok: true, id: (data as { id: number }).id }, { status: 201 });
  }

  // ── CLÔTURE ──
  const parsed = safeParse(sessionCloseInput, raw);
  if (!parsed.ok) return Response.json({ error: 'invalid_input', detail: parsed.error }, { status: 400 });
  const { id, transcript = [], done, minutes } = parsed.data;

  const { data: sessRow } = await sb.from('work_sessions').select('*').eq('id', id).eq('user_id', user.id).single();
  if (!sessRow) return Response.json({ error: 'not_found' }, { status: 404 });
  const sess = sessRow as WorkSession;

  const { summary, highlights } = summarize(transcript, sess.subject);
  const dur = minutes ?? Math.max(1, Math.round((Date.now() - new Date(sess.started_at).getTime()) / 60000));

  // PDF récap → bucket privé `documents`
  let pdf_path: string | null = sess.pdf_path;
  try {
    const bytes = await buildSessionPdf({
      title: sess.title, subject: sess.subject, classLabel: sess.class_key,
      dateLabel: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Libreville' }),
      summary, highlights, transcript,
    });
    const path = `${user.id}/sessions/${id}.pdf`;
    const up = await sb.storage.from('documents').upload(path, bytes, { contentType: 'application/pdf', upsert: true });
    if (!up.error) pdf_path = path;
  } catch { /* PDF best-effort : on n'échoue pas la clôture si la génération/stockage échoue */ }

  await sb.from('work_sessions').update({
    summary, highlights, transcript, duration_min: dur, pdf_path,
    status: done ? 'done' : 'resumable', ended_at: new Date().toISOString(),
  }).eq('id', id);

  // Continuité : ne jamais laisser sur un « fini ».
  if (!done && sess.subject) {
    await sb.from('reminders').update({ status: 'cancelled' })
      .eq('user_id', user.id).eq('kind', 'continuite').eq('status', 'pending');
    await sb.from('reminders').insert({
      user_id: user.id, kind: 'continuite', subject: sess.subject,
      title: 'On continue ? 🌱',
      body: `On reprend ${sess.subject} là où on s'est arrêtés ?`,
      scheduled_at: tomorrow18hUTC(), status: 'pending',
    });
  }

  // Lien signé (consultation immédiate du PDF)
  let signedUrl: string | null = null;
  if (pdf_path) {
    const s = await sb.storage.from('documents').createSignedUrl(pdf_path, 3600);
    signedUrl = s.data?.signedUrl ?? null;
  }
  return Response.json({ ok: true, id, pdfPath: pdf_path, signedUrl, summary, highlights });
}

/** GET /api/session — ?resumable=1 : travaux à reprendre (RPC my_resumable_work) ; sinon historique récent. */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const token = tokenFromRequest(req);

  if (url.searchParams.get('resumable') === '1' && token) {
    const { data, error } = await supabaseAsUser(token).rpc('my_resumable_work', { p_limit: 10 });
    if (error) return Response.json({ items: [] });
    return Response.json({ items: data ?? [] });
  }
  const { data } = await supabaseAdmin().from('work_sessions').select('*')
    .eq('user_id', user.id).order('started_at', { ascending: false }).limit(20);
  return Response.json({ items: (data as WorkSession[] | null) ?? [] });
}

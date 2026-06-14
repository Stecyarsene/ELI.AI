import { requireRole, bearerOf, supabaseAsUser } from '@/lib/roles';
import type {
  AdminDashboard, AdminOverview, SubjectUsage, RedZone, PillarUsage, RecentPayment, SignupPoint,
} from '@/types/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/overview — Centre de Commandement (T4).
 * Agrège les 6 RPC admin_* en un seul payload. Réservé super_admin
 * (double garde : requireRole côté route + is_super_admin() interne aux RPC).
 * Tolérant : si une RPC échoue, sa section est neutre (la page ne plante pas).
 */
export async function GET(req: Request) {
  const auth = await requireRole(req, ['super_admin']);
  if ('error' in auth) return auth.error;
  const sb = supabaseAsUser(bearerOf(req)!);

  const days = Math.min(90, Math.max(7, Number(new URL(req.url).searchParams.get('days')) || 30));

  const [ov, subj, red, pil, pay, sig] = await Promise.all([
    sb.rpc('admin_overview'),
    sb.rpc('admin_usage_by_subject'),
    sb.rpc('admin_red_zones'),
    sb.rpc('admin_pillar_usage'),
    sb.rpc('admin_recent_payments', { p_limit: 50 }),
    sb.rpc('admin_signups_timeseries', { p_days: days }),
  ]);

  // Si la vue d'ensemble elle-même est refusée → accès non autorisé (cohérence stricte).
  if (ov.error && /forbidden|42501/i.test(ov.error.message ?? '')) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  const payload: AdminDashboard = {
    overview: (ov.data as AdminOverview | null) ?? null,
    usageBySubject: (subj.data as SubjectUsage[] | null) ?? [],
    redZones: (red.data as RedZone[] | null) ?? [],
    pillarUsage: (pil.data as PillarUsage[] | null) ?? [],
    recentPayments: (pay.data as RecentPayment[] | null) ?? [],
    signups: (sig.data as SignupPoint[] | null) ?? [],
  };
  return Response.json(payload);
}

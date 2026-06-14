/** Types du tableau de bord super-admin (RPC admin_* — migration 0018). */
export interface AdminOverview {
  users: {
    students: number; teachers: number; admins: number;
    paid_students: number; paid_teachers: number; total_auth: number;
  };
  revenue: { total_fcfa: number; success_count: number; pending_count: number; failed_count: number };
  activity: { events_total: number; success_rate: number; active_7d: number; sessions: number; minutes: number };
  /** Répartition des statuts de progression (vert / orange / rouge). */
  status: Partial<Record<'vert' | 'orange' | 'rouge', number>> & Record<string, number>;
  /** Utilisateurs distincts par canal (site / app / whatsapp). */
  channels: Record<string, number>;
}
export interface SubjectUsage { subject: string; events: number; success_rate: number }
export interface RedZone { subject: string; concept: string; attempts: number; success_rate: number }
export interface PillarUsage { pillar: string; sessions: number; minutes: number }
export interface RecentPayment {
  tx_id: string; user_id: string; program: string; plan_id: string;
  amount_fcfa: number; status: 'pending' | 'success' | 'failed'; invoice_path: string | null; created_at: string;
}
export interface SignupPoint { day: string; students: number; teachers: number }

export interface AdminDashboard {
  overview: AdminOverview | null;
  usageBySubject: SubjectUsage[];
  redZones: RedZone[];
  pillarUsage: PillarUsage[];
  recentPayments: RecentPayment[];
  signups: SignupPoint[];
}

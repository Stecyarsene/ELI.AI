/**
 * ÉLI — Droit à l'oubli (RGPD / CDP), doc 10. Supprime en cascade les PII et l'historique,
 * ANONYMISE les transactions financières (obligation comptable) et PRÉSERVE les stats macro
 * (déjà anonymes : learning_events sans PII). À exécuter côté serveur (service_role).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export async function eraseUser(admin: SupabaseClient, userId: string): Promise<{ ok: boolean; steps: string[] }> {
  const steps: string[] = [];
  // 1. Anonymiser les paiements (on garde la ligne comptable, sans lien PII)
  await admin.from('payments').update({ user_id: null }).eq('user_id', userId);
  steps.push('payments anonymisés (user_id→null, montant conservé)');
  // 2. Supprimer historique chat, progress, consentements, notifications
  for (const t of ['progress', 'parental_consents', 'notifications', 'learning_events']) {
    await admin.from(t).delete().eq('user_id', userId);
    steps.push(`${t} supprimé`);
  }
  // 3. Supprimer le profil (PII) puis le compte auth (cascade)
  await admin.from('profiles').delete().eq('id', userId);
  steps.push('profil (PII) supprimé');
  await admin.auth.admin.deleteUser(userId);
  steps.push('compte auth supprimé (irréversible)');
  return { ok: true, steps };
}

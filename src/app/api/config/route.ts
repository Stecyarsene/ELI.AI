/** Config publique pour les maquettes (clés ANON uniquement — jamais de secret ici). */
export const runtime = 'nodejs';
export function GET() {
  return Response.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    // T9 — Marketing cross-canal : numéro du bot WhatsApp (configurable). Défaut = contact Éli.
    whatsappBot: (process.env.NEXT_PUBLIC_WHATSAPP_BOT ?? '+24177374043').replace(/[^0-9+]/g, ''),
  });
}

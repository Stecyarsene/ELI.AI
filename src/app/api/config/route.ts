/** Config publique pour les maquettes (clés ANON uniquement — jamais de secret ici). */
export const runtime = 'nodejs';
export function GET() {
  return Response.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  });
}

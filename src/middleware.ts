import { NextResponse, type NextRequest } from 'next/server';
import { checkLimit } from '@/lib/ratelimit';

/** Edge middleware (MAD §4) : rate limiting par IP/route AVANT tout rendu + headers durcis. */
export async function middleware(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const path = req.nextUrl.pathname;

  const kind = path.startsWith('/api/ai') ? 'ai'
    : path.startsWith('/api/pay') ? 'pay'
    : path.startsWith('/api/auth') ? 'auth'
    : null;
  if (kind) {
    const { ok, retryAfter } = await checkLimit(kind, ip);
    if (!ok) {
      return new NextResponse(JSON.stringify({ error: 'rate_limited' }), {
        status: 429,
        headers: { 'content-type': 'application/json', 'retry-after': String(retryAfter ?? 60) },
      });
    }
  }
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://esm.sh; img-src 'self' data: blob:; media-src 'self' blob: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://esm.sh https://generativelanguage.googleapis.com https://api.elevenlabs.io; frame-src 'self'; frame-ancestors 'self'"
  );
  return res;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|maquettes).*)'] };

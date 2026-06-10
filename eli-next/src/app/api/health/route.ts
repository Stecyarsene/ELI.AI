/** Sonde de latence du Mode Bougie (heuristique RTT) + healthcheck. */
export function GET() { return Response.json({ ok: true, ts: Date.now() }); }

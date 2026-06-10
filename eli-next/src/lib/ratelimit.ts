import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/** Rate limiting Edge (MAD §4.2) — fenêtre glissante par route. Passthrough si Upstash absent (dev). */
const enabled = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = enabled ? Redis.fromEnv() : null;

function make(tokens: number, window: `${number} ${'s' | 'm' | 'h'}`) {
  return redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(tokens, window), analytics: false }) : null;
}
const limiters = {
  ai: make(20, '1 m'),
  pay: make(5, '1 m'),
  auth: make(10, '15 m'),
  content: make(120, '1 h'),
} as const;

export async function checkLimit(kind: keyof typeof limiters, id: string): Promise<{ ok: boolean; retryAfter?: number }> {
  const l = limiters[kind];
  if (!l) return { ok: true };
  const r = await l.limit(`${kind}:${id}`);
  return r.success ? { ok: true } : { ok: false, retryAfter: Math.ceil((r.reset - Date.now()) / 1000) };
}

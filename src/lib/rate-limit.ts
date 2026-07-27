// In-memory rate limiter. Works well on Vercel Fluid Compute (instance reuse).
// For multi-region deployments, swap with @upstash/ratelimit + Redis.

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

let pruneCounter = 0;
function maybePrune() {
  if (++pruneCounter < 1000) return;
  pruneCounter = 0;
  const now = Date.now();
  for (const [k, v] of store) if (v.resetAt < now) store.delete(k);
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean } {
  maybePrune();
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (entry.count >= limit) return { allowed: false };
  entry.count++;
  return { allowed: true };
}

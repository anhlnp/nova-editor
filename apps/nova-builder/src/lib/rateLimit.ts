// Minimal in-memory sliding-window rate limiter for public, unauthenticated
// POST endpoints (form submissions, analytics beacons). Its job is abuse
// mitigation — blunting email-bomb / table-pollution amplification — not
// billing-grade accounting.
//
// Limitation: state is per-instance (per Worker isolate), so a distributed
// deployment enforces the limit per-edge, not globally. That is sufficient for
// the amplification class it defends against; a durable limiter (KV/DO) is a
// future upgrade if precise global limits are needed.

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, retryAfterSec: 0 };
}

// Best-effort client key from proxy headers; falls back to a shared bucket.
export function clientKey(req: Request, scope: string): string {
  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return `${scope}:${ip}`;
}

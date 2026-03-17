/**
 * In-memory sliding window rate limiter.
 *
 * Uses a fixed-window counter with sliding expiry for simplicity
 * and low memory overhead. Each IP gets a counter that resets
 * after the window expires.
 *
 * Note: In Workers/serverless, state is per-isolate. This provides
 * per-instance protection. For global rate limiting, use Cloudflare
 * Rate Limiting or KV-backed counters.
 */

interface RateLimitEntry {
  readonly count: number
  readonly resetAt: number
}

interface RateLimitConfig {
  readonly maxRequests: number
  readonly windowMs: number
}

interface RateLimitResult {
  readonly allowed: boolean
  readonly remaining: number
  readonly resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/** Periodically clean expired entries to prevent memory leaks */
const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

function cleanup(): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }
}

/**
 * Check rate limit for a given key (typically IP + route prefix).
 * Returns whether the request is allowed and remaining quota.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  cleanup()

  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + config.windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt }
  }

  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  const updated: RateLimitEntry = {
    count: existing.count + 1,
    resetAt: existing.resetAt,
  }
  store.set(key, updated)

  return {
    allowed: true,
    remaining: config.maxRequests - updated.count,
    resetAt: updated.resetAt,
  }
}

/** Rate limit tiers for different endpoint categories */
export const RATE_LIMITS = {
  /** General API reads: 60 requests per minute */
  api: { maxRequests: 60, windowMs: 60_000 },
  /** Auth endpoints (signin/signup): 10 requests per minute */
  auth: { maxRequests: 10, windowMs: 60_000 },
  /** Mutation endpoints (POST/PATCH/DELETE): 30 requests per minute */
  mutation: { maxRequests: 30, windowMs: 60_000 },
  /** OG image generation: 30 requests per minute */
  og: { maxRequests: 30, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitConfig>

/**
 * Build rate limit response headers.
 */
export function rateLimitHeaders(result: RateLimitResult, config: RateLimitConfig): HeadersInit {
  return {
    'X-RateLimit-Limit': String(config.maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  }
}

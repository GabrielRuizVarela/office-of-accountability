/**
 * In-memory sliding-window rate limiter for engine API routes (M10).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RateLimitConfig {
  max_requests: number
  window_ms: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset_at: number
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const timestamps = new Map<string, number[]>()

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now()
  const windowStart = now - config.window_ms

  let entries = timestamps.get(key) ?? []

  // Prune expired entries
  entries = entries.filter((t) => t > windowStart)

  if (entries.length < config.max_requests) {
    entries.push(now)
    timestamps.set(key, entries)
    return {
      allowed: true,
      remaining: config.max_requests - entries.length,
      reset_at: (entries[0] ?? now) + config.window_ms,
    }
  }

  timestamps.set(key, entries)
  return {
    allowed: false,
    remaining: 0,
    reset_at: (entries[0] ?? now) + config.window_ms,
  }
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

export const ENGINE_RATE_LIMITS = {
  run: { max_requests: 5, window_ms: 3_600_000 },       // 5/hr
  proposals: { max_requests: 60, window_ms: 3_600_000 }, // 60/hr
  state: { max_requests: 120, window_ms: 60_000 },       // 120/min
  focus: { max_requests: 10, window_ms: 3_600_000 },     // 10/hr
} as const satisfies Record<string, RateLimitConfig>

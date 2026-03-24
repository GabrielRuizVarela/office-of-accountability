/**
 * API key authentication for the MCP server.
 *
 * Keys are stored in Cloudflare KV as SHA-256 hashes.
 * Lookup: hash incoming key → find record in KV → verify not revoked → check scopes.
 */

import type { ApiKeyRecord, AuthContext, Env } from './types'

/**
 * SHA-256 hash a string using the Web Crypto API (available in Workers).
 */
async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Extract Bearer token from Authorization header.
 */
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  const match = authHeader.match(/^Bearer\s+(\S+)$/i)
  return match ? match[1] : null
}

/**
 * Authenticate an incoming request using the API key from the Authorization header.
 *
 * Returns the AuthContext if valid, or an error string if authentication fails.
 */
export async function authenticate(
  request: Request,
  env: Env,
): Promise<{ auth: AuthContext } | { error: string; status: number }> {
  const token = extractBearerToken(request.headers.get('Authorization'))

  if (!token) {
    return { error: 'Missing Authorization: Bearer <api-key> header', status: 401 }
  }

  const keyHash = await sha256(token)
  const record = await env.API_KEYS.get<ApiKeyRecord>(`key:${keyHash}`, 'json')

  if (!record) {
    return { error: 'Invalid API key', status: 401 }
  }

  if (record.revoked_at) {
    return { error: 'API key has been revoked', status: 401 }
  }

  // Update last_used_at asynchronously (best-effort, don't block the request)
  const updated: ApiKeyRecord = { ...record, last_used_at: new Date().toISOString() }
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  env.API_KEYS.put(`key:${keyHash}`, JSON.stringify(updated))

  return {
    auth: {
      key_id: record.id,
      user_id: record.user_id,
      scopes: record.scopes,
      investigation_ids: record.investigation_ids,
    },
  }
}

/**
 * Check if the auth context has the required scope for a tool call.
 */
export function hasScope(auth: AuthContext, requiredScope: string): boolean {
  // Wildcard scope grants all
  if (auth.scopes.includes('*')) return true

  // Check exact match
  if (auth.scopes.includes(requiredScope)) return true

  // Check namespace match (e.g., "investigation:*" matches "investigation:read")
  const [namespace] = requiredScope.split(':')
  if (auth.scopes.includes(`${namespace}:*`)) return true

  return false
}

/**
 * Check if the auth context has access to a specific investigation.
 */
export function hasInvestigationAccess(auth: AuthContext, investigationId: string): boolean {
  // Empty array = access to all investigations
  if (auth.investigation_ids.length === 0) return true
  return auth.investigation_ids.includes(investigationId)
}

/**
 * Rate limiting using KV counters with TTL.
 * Returns true if the request is allowed, false if rate-limited.
 */
export async function checkRateLimit(
  keyId: string,
  env: Env,
  maxPerMinute: number = 120,
): Promise<boolean> {
  const minute = Math.floor(Date.now() / 60_000)
  const counterKey = `ratelimit:${keyId}:${minute}`

  const current = await env.API_KEYS.get<number>(counterKey, 'json')
  const count = current ?? 0

  if (count >= maxPerMinute) {
    return false
  }

  // Increment counter with 120s TTL (covers current minute + buffer)
  await env.API_KEYS.put(counterKey, JSON.stringify(count + 1), {
    expirationTtl: 120,
  })

  return true
}

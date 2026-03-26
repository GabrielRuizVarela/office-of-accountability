/**
 * CSRF protection using the double-submit cookie pattern.
 *
 * Generates a per-session CSRF token (HMAC of session token + secret),
 * sets it in a non-HTTP-only cookie readable by JS, and validates it
 * from the X-CSRF-Token header on state-changing requests.
 *
 * Auth.js routes handle their own CSRF and are excluded.
 */

const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_TOKEN_BYTES = 32

/** Generate a random CSRF token (hex-encoded) */
export function generateCsrfToken(): string {
  const bytes = new Uint8Array(CSRF_TOKEN_BYTES)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Create an HMAC signature for a CSRF token using the auth secret */
export async function signCsrfToken(token: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(token))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Verify a CSRF token against its HMAC signature (constant-time) */
export async function verifyCsrfToken(
  token: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const expected = await signCsrfToken(token, secret)
  if (expected.length !== signature.length) return false

  // Constant-time comparison
  let mismatch = 0
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return mismatch === 0
}

/** Parse the CSRF cookie value (format: "token.signature") */
export function parseCsrfCookie(cookieValue: string): { token: string; signature: string } | null {
  const dotIndex = cookieValue.indexOf('.')
  if (dotIndex === -1) return null

  const token = cookieValue.slice(0, dotIndex)
  const signature = cookieValue.slice(dotIndex + 1)

  if (!token || !signature) return null
  // Validate hex format
  if (!/^[0-9a-f]+$/.test(token) || !/^[0-9a-f]+$/.test(signature)) return null

  return { token, signature }
}

/** Build the CSRF cookie value (format: "token.signature") */
export function buildCsrfCookieValue(token: string, signature: string): string {
  return `${token}.${signature}`
}

/** Build a full Set-Cookie header value for the CSRF token */
export function buildCsrfSetCookie(cookieValue: string, isSecure: boolean): string {
  const parts = [
    `${CSRF_COOKIE_NAME}=${cookieValue}`,
    'Path=/',
    'SameSite=Lax',
    'Max-Age=86400', // 24 hours
  ]
  if (isSecure) {
    parts.push('Secure')
  }
  // Deliberately NOT HttpOnly - JS needs to read it
  return parts.join('; ')
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME }

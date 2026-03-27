/**
 * Edge middleware for rate limiting, security headers, and CSRF protection.
 *
 * Applied to all /api/* routes. Uses in-memory sliding window
 * rate limiting with tiered limits per endpoint category.
 *
 * CSRF: Sets a signed CSRF cookie on every response. Validates
 * X-CSRF-Token header on POST/PATCH/DELETE requests (except Auth.js
 * routes, which handle their own CSRF).
 */

import { NextResponse, type NextRequest } from 'next/server'
import { checkRateLimit, rateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit'
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  generateCsrfToken,
  signCsrfToken,
  verifyCsrfToken,
  parseCsrfCookie,
  buildCsrfCookieValue,
  buildCsrfSetCookie,
} from '@/lib/auth/csrf'

/** Extract client IP from request headers */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

/** Determine which rate limit tier applies to a request */
function getRateLimitTier(pathname: string, method: string) {
  if (pathname.startsWith('/api/og/')) {
    return { config: RATE_LIMITS.og, prefix: 'og' }
  }

  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    return { config: RATE_LIMITS.mutation, prefix: 'mutation' }
  }

  return { config: RATE_LIMITS.api, prefix: 'api' }
}

/** Check if this is a state-changing method that requires CSRF validation */
function isMutationMethod(method: string): boolean {
  return method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE'
}

/** Routes exempt from CSRF validation */
function isCsrfExempt(pathname: string): boolean {
  // Investigation API — uses x-api-key header auth instead of CSRF (for MCP agent access)
  if (pathname.startsWith('/api/caso-libra/investigation')) return true
  return false
}

/** Validate the CSRF token from the request header against the cookie */
async function validateCsrf(request: NextRequest): Promise<boolean> {
  const secret = process.env.AUTH_SECRET
  if (!secret) return false

  // Read the CSRF cookie
  const cookieValue = request.cookies.get(CSRF_COOKIE_NAME)?.value
  if (!cookieValue) return false

  const parsed = parseCsrfCookie(cookieValue)
  if (!parsed) return false

  // Verify the cookie signature (prevents cookie tampering)
  const cookieValid = await verifyCsrfToken(parsed.token, parsed.signature, secret)
  if (!cookieValid) return false

  // Compare the header token against the cookie token
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  if (!headerToken) return false

  // Constant-time comparison
  if (headerToken.length !== parsed.token.length) return false
  let mismatch = 0
  for (let i = 0; i < headerToken.length; i++) {
    mismatch |= headerToken.charCodeAt(i) ^ parsed.token.charCodeAt(i)
  }
  return mismatch === 0
}

/** Security response headers applied to all matched routes */
const SECURITY_HEADERS: HeadersInit = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '0',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

/** Set the CSRF cookie on a response if it doesn't exist yet */
async function ensureCsrfCookie(
  request: NextRequest,
  response: NextResponse,
): Promise<void> {
  const secret = process.env.AUTH_SECRET
  if (!secret) return

  // Check if a valid CSRF cookie already exists
  const existing = request.cookies.get(CSRF_COOKIE_NAME)?.value
  if (existing) {
    const parsed = parseCsrfCookie(existing)
    if (parsed) {
      const valid = await verifyCsrfToken(parsed.token, parsed.signature, secret)
      if (valid) return // Cookie is still valid
    }
  }

  // Generate a new CSRF token + signature
  const token = generateCsrfToken()
  const signature = await signCsrfToken(token, secret)
  const cookieValue = buildCsrfCookieValue(token, signature)
  const isSecure = request.headers.get('x-forwarded-proto') === 'https'

  response.headers.append(
    'Set-Cookie',
    buildCsrfSetCookie(cookieValue, isSecure),
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // CSRF validation for state-changing API requests
  if (
    pathname.startsWith('/api/') &&
    isMutationMethod(method) &&
    !isCsrfExempt(pathname)
  ) {
    const csrfValid = await validateCsrf(request)
    if (!csrfValid) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'CSRF token missing or invalid' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...SECURITY_HEADERS,
          },
        },
      )
    }
  }

  // Rate limit API routes
  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(request)
    const { config, prefix } = getRateLimitTier(pathname, method)
    const key = `${prefix}:${ip}`
    const result = checkRateLimit(key, config)

    if (!result.allowed) {
      return new NextResponse(JSON.stringify({ success: false, error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          ...rateLimitHeaders(result, config),
          ...SECURITY_HEADERS,
        },
      })
    }

    const response = NextResponse.next()

    // Add rate limit + security headers to successful responses
    const headers = { ...rateLimitHeaders(result, config), ...SECURITY_HEADERS }
    for (const [name, value] of Object.entries(headers)) {
      response.headers.set(name, value)
    }

    // Set CSRF cookie on all responses
    await ensureCsrfCookie(request, response)

    return response
  }

  // For non-API routes, add security headers + CSRF cookie
  const response = NextResponse.next()
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value)
  }
  await ensureCsrfCookie(request, response)

  return response
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
}

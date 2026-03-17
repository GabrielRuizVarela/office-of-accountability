/**
 * Edge middleware for rate limiting and security headers.
 *
 * Applied to all /api/* routes. Uses in-memory sliding window
 * rate limiting with tiered limits per endpoint category.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { checkRateLimit, rateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit'

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
  if (pathname.startsWith('/api/auth/')) {
    return { config: RATE_LIMITS.auth, prefix: 'auth' }
  }

  if (pathname.startsWith('/api/og/')) {
    return { config: RATE_LIMITS.og, prefix: 'og' }
  }

  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    return { config: RATE_LIMITS.mutation, prefix: 'mutation' }
  }

  return { config: RATE_LIMITS.api, prefix: 'api' }
}

/** Security response headers applied to all matched routes */
const SECURITY_HEADERS: HeadersInit = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '0',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // Only rate-limit API routes
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

    return response
  }

  // For non-API routes, add security headers only
  const response = NextResponse.next()
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value)
  }

  return response
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
}

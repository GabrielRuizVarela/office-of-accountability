/**
 * CSRF-aware test fixtures for front-door E2E tests.
 *
 * The app uses a double-submit cookie pattern: a non-HttpOnly `csrf-token`
 * cookie is set on every response. The cookie value is `<token>.<signature>`.
 * POST/PATCH/PUT/DELETE requests must include the token (part before the dot)
 * as the `X-CSRF-Token` request header.
 *
 * This fixture provides a `csrfPost` helper that:
 *   1. GETs the base URL to receive the CSRF cookie.
 *   2. Extracts the token from the cookie.
 *   3. Re-sends the POST with the correct X-CSRF-Token header.
 */

import { test as base, type APIRequestContext } from '@playwright/test'

export type CsrfFixtures = {
  /** POST helper that automatically attaches a valid CSRF token. */
  csrfPost: (
    url: string,
    options?: { data?: unknown; headers?: Record<string, string> },
  ) => Promise<Awaited<ReturnType<APIRequestContext['post']>>>
}

/** Fetch a fresh CSRF token by hitting the home page and reading the cookie. */
async function fetchCsrfToken(request: APIRequestContext, baseURL: string): Promise<string | null> {
  // Any GET request causes the middleware to set the csrf-token cookie
  const res = await request.get(`${baseURL}/`)
  const setCookie = res.headers()['set-cookie'] ?? ''

  // The middleware may send multiple Set-Cookie headers; find the csrf-token one
  const match = setCookie.match(/(?:^|,\s*)csrf-token=([^;,]+)/)
  if (!match) return null

  const cookieValue = match[1] // format: "token.signature"
  const dotIdx = cookieValue.indexOf('.')
  if (dotIdx === -1) return null

  return cookieValue.slice(0, dotIdx) // just the token part
}

export const test = base.extend<CsrfFixtures>({
  csrfPost: async ({ request, baseURL }, use) => {
    const resolvedBase = baseURL ?? 'http://localhost:5174'
    let cachedToken: string | null = null

    const helper = async (
      url: string,
      options: { data?: unknown; headers?: Record<string, string> } = {},
    ) => {
      // Lazy-fetch token once per test
      if (!cachedToken) {
        cachedToken = await fetchCsrfToken(request, resolvedBase)
      }

      const extraHeaders: Record<string, string> = { ...(options.headers ?? {}) }
      if (cachedToken) {
        extraHeaders['X-CSRF-Token'] = cachedToken
      }

      return request.post(url, {
        data: options.data,
        headers: extraHeaders,
      })
    }

    await use(helper)
  },
})

export { expect } from '@playwright/test'

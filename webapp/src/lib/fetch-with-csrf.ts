/**
 * Fetch wrapper that automatically includes the CSRF token.
 *
 * Reads the csrf-token cookie (non-HTTP-only, set by middleware)
 * and includes the raw token in the X-CSRF-Token header.
 */

const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/** Extract the raw token from the CSRF cookie value (format: "token.signature") */
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=')
    if (name === CSRF_COOKIE_NAME) {
      const value = rest.join('=')
      const dotIndex = value.indexOf('.')
      if (dotIndex === -1) return null
      return value.slice(0, dotIndex)
    }
  }
  return null
}

/** Fetch wrapper that adds the CSRF token header to mutation requests */
export async function fetchWithCsrf(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const method = init?.method?.toUpperCase() ?? 'GET'
  const isMutation = method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE'

  if (!isMutation) {
    return fetch(input, init)
  }

  const csrfToken = getCsrfToken()
  const headers = new Headers(init?.headers)

  if (csrfToken) {
    headers.set(CSRF_HEADER_NAME, csrfToken)
  }

  return fetch(input, {
    ...init,
    headers,
  })
}

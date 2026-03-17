/**
 * Server-side session helper.
 *
 * Uses @auth/core/jwt getToken() to decode the JWT from cookies,
 * avoiding a full Auth() round-trip. Works in both Server Components
 * and Route Handlers.
 */

import { cookies, headers } from 'next/headers'
import { getToken } from '@auth/core/jwt'

export interface SessionUser {
  readonly id: string
  readonly email: string
  readonly name: string | null
  readonly image: string | null
}

export interface AppSession {
  readonly user: SessionUser
  readonly expires: string
}

const COOKIE_NAME = 'authjs.session-token'
const SECURE_COOKIE_NAME = '__Secure-authjs.session-token'

/**
 * Get the current user session from the JWT cookie.
 * Returns null if no valid session exists.
 *
 * Usage in Server Components / Route Handlers:
 * ```ts
 * const session = await getSession()
 * if (!session) redirect('/auth/signin')
 * ```
 */
export async function getSession(): Promise<AppSession | null> {
  const secret = process.env.AUTH_SECRET
  if (!secret) return null

  const cookieStore = await cookies()
  const headerStore = await headers()

  const secureCookie = headerStore.get('x-forwarded-proto') === 'https'
  const cookieName = secureCookie ? SECURE_COOKIE_NAME : COOKIE_NAME
  const sessionToken = cookieStore.get(cookieName)?.value

  if (!sessionToken) return null

  try {
    const token = await getToken({
      req: { headers: headerStore },
      secret,
      secureCookie,
      cookieName,
      salt: cookieName,
    })

    if (!token?.email) return null

    return {
      user: {
        id: (token.id as string) ?? token.sub ?? '',
        email: token.email,
        name: token.name ?? null,
        image: token.picture ?? null,
      },
      expires: token.exp
        ? new Date(token.exp * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  } catch {
    return null
  }
}

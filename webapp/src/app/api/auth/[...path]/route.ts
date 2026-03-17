/**
 * Catch-all route handler for Auth.js.
 *
 * Handles all /api/auth/* requests (signin, signout, callback, session, csrf, etc.)
 * using @auth/core directly with the Web Request/Response API.
 */

import { Auth } from '@auth/core'

import { authConfig } from '@/lib/auth/config'

async function handler(request: Request): Promise<Response> {
  return Auth(request, authConfig)
}

export { handler as GET, handler as POST }

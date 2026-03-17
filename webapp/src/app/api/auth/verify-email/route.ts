/**
 * POST /api/auth/verify-email
 *
 * Consumes an email verification token and marks the user as verified.
 * Upgrades verification_tier from 0 to 1.
 *
 * Body: { email: string, token: string }
 *
 * Responses:
 *   - 200: { success: true }
 *   - 400: invalid input or expired/invalid token
 */

import { z } from 'zod/v4'
import { consumeVerificationToken, markEmailVerified } from '@/lib/auth/verification'

const verifySchema = z.object({
  email: z.email(),
  token: z.string().length(64),
})

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = verifySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'Datos inválidos' },
      { status: 400 },
    )
  }

  const { email, token } = parsed.data

  try {
    const valid = await consumeVerificationToken(email, 'email-verification', token)
    if (!valid) {
      return Response.json(
        { success: false, error: 'El enlace de verificación expiró o ya fue usado' },
        { status: 400 },
      )
    }

    const updated = await markEmailVerified(email)
    if (!updated) {
      return Response.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 400 },
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    const isConnectionError =
      error instanceof Error &&
      (error.message.includes('connect') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ServiceUnavailable'))

    if (isConnectionError) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }

    throw error
  }
}

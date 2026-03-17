/**
 * POST /api/auth/reset-password
 *
 * Consumes a password reset token and sets the new password.
 * Validates the new password against strength requirements + breach check.
 * Uses constant-time token comparison.
 *
 * Body: { email: string, token: string, password: string }
 *
 * Responses:
 *   - 200: { success: true }
 *   - 400: invalid input, expired token, or weak password
 */

import { z } from 'zod/v4'
import { hashPassword } from '@/lib/auth/password'
import { checkBreachedPassword, validatePasswordStrength } from '@/lib/auth/password-strength'
import { consumeVerificationToken, updateUserPassword } from '@/lib/auth/verification'

const resetSchema = z.object({
  email: z.email(),
  token: z.string().length(64),
  password: z.string().min(8).max(128),
})

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = resetSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'Datos inválidos' },
      { status: 400 },
    )
  }

  const { email, token, password } = parsed.data

  // Validate password strength
  const strengthError = validatePasswordStrength(password)
  if (strengthError) {
    return Response.json(
      { success: false, error: strengthError },
      { status: 400 },
    )
  }

  // Check against breached passwords
  const breachCount = await checkBreachedPassword(password)
  if (breachCount > 0) {
    return Response.json(
      {
        success: false,
        error: 'Esta contraseña fue encontrada en filtraciones de datos. Elegí una contraseña diferente.',
      },
      { status: 400 },
    )
  }

  try {
    // Consume and validate token (constant-time comparison)
    const valid = await consumeVerificationToken(email, 'password-reset', token)
    if (!valid) {
      return Response.json(
        { success: false, error: 'El enlace para restablecer la contraseña expiró o ya fue usado' },
        { status: 400 },
      )
    }

    // Hash new password and update user
    const passwordHash = await hashPassword(password)
    const updated = await updateUserPassword(email, passwordHash)

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

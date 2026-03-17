/**
 * POST /api/auth/request-password-reset
 *
 * Generates a password reset token and sends a reset email.
 * Always returns success to prevent email enumeration.
 *
 * Body: { email: string }
 *
 * Responses:
 *   - 200: { success: true } (always, to prevent email enumeration)
 */

import { z } from 'zod/v4'
import { createVerificationToken, getUserNameByEmail } from '@/lib/auth/verification'
import { sendEmail } from '@/lib/email/send'
import { passwordResetEmail } from '@/lib/email/templates'
import { readQuery } from '@/lib/neo4j/client'

const requestSchema = z.object({
  email: z.email(),
})

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'Email inválido' },
      { status: 400 },
    )
  }

  const { email } = parsed.data

  try {
    // Check if user exists (don't leak info via response)
    const result = await readQuery(
      'MATCH (u:User {email: $email}) RETURN u.name AS name, u.password_hash AS hasPassword',
      { email },
      (record) => ({
        name: record.get('name') ? String(record.get('name')) : null,
        hasPassword: !!record.get('hasPassword'),
      }),
    )

    const user = result.records[0]

    // Always return success to prevent email enumeration
    if (!user || !user.hasPassword) {
      return Response.json({ success: true })
    }

    const { token } = await createVerificationToken(email, 'password-reset')
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
    const resetUrl = `${appUrl}/auth/reset-password?email=${encodeURIComponent(email)}&token=${token}`

    const template = passwordResetEmail(user.name ?? '', resetUrl)
    await sendEmail({ to: email, ...template })

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

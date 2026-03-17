/**
 * POST /api/auth/resend-verification
 *
 * Generates a new email verification token and sends a verification email.
 * Rate limited to 3 requests/hour per email in middleware.
 *
 * Body: { email: string }
 *
 * Responses:
 *   - 200: { success: true } (always, to prevent email enumeration)
 */

import { z } from 'zod/v4'
import { createVerificationToken, getUserNameByEmail } from '@/lib/auth/verification'
import { sendEmail } from '@/lib/email/send'
import { verificationEmail } from '@/lib/email/templates'
import { readQuery } from '@/lib/neo4j/client'

const resendSchema = z.object({
  email: z.email(),
})

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = resendSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'Email inválido' },
      { status: 400 },
    )
  }

  const { email } = parsed.data

  try {
    // Check if user exists and is not already verified (don't leak info via response)
    const result = await readQuery(
      'MATCH (u:User {email: $email}) RETURN u.emailVerified AS verified, u.name AS name',
      { email },
      (record) => ({
        verified: record.get('verified'),
        name: record.get('name') ? String(record.get('name')) : null,
      }),
    )

    const user = result.records[0]

    // Always return success to prevent email enumeration
    if (!user || user.verified) {
      return Response.json({ success: true })
    }

    const { token } = await createVerificationToken(email, 'email-verification')
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
    const verifyUrl = `${appUrl}/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`

    const template = verificationEmail(user.name ?? '', verifyUrl)
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

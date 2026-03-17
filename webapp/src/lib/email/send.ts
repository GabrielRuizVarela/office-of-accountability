/**
 * Email sending abstraction.
 *
 * Uses Resend in production (RESEND_API_KEY env var).
 * Falls back to console logging in development.
 *
 * Workers-compatible — uses fetch(), no Node.js dependencies.
 */

const RESEND_API_URL = 'https://api.resend.com/emails'
const SEND_TIMEOUT_MS = 10_000

interface EmailOptions {
  readonly to: string
  readonly subject: string
  readonly html: string
}

interface SendResult {
  readonly success: boolean
  readonly error?: string
}

/**
 * Send an email. Uses Resend API if RESEND_API_KEY is set,
 * otherwise logs to console (dev mode).
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const fromAddress = process.env.EMAIL_FROM ?? 'ORC <noreply@orc.ar>'

  if (!apiKey) {
    // Dev mode: log email to console
    console.info('[DEV EMAIL]', {
      to: options.to,
      subject: options.subject,
      html: options.html.slice(0, 200) + '...',
    })
    return { success: true }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS)

    try {
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [options.to],
          subject: options.subject,
          html: options.html,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const body = await response.text()
        return { success: false, error: `Email send failed: ${response.status} ${body}` }
      }

      return { success: true }
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: `Email send error: ${message}` }
  }
}

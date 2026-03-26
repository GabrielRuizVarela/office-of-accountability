/**
 * Password strength validation + HaveIBeenPwned breach check.
 *
 * Requirements:
 *   - Minimum 8 characters
 *   - Maximum 128 characters
 *   - Not in breached password database (k-anonymity API)
 *
 * Uses the HaveIBeenPwned k-anonymity API:
 *   1. SHA-1 hash the password
 *   2. Send only the first 5 chars of the hash to the API
 *   3. Check if the full hash appears in the returned list
 *   This means the full password hash never leaves the server.
 */

const HIBP_API_URL = 'https://api.pwnedpasswords.com/range/'
const HIBP_TIMEOUT_MS = 5_000

/**
 * Check if a password has been found in known data breaches
 * using the HaveIBeenPwned k-anonymity API.
 *
 * Returns the breach count if found, 0 if not found,
 * or -1 if the API is unreachable (fail-open - don't block signups).
 */
export async function checkBreachedPassword(password: string): Promise<number> {
  try {
    const hashBuffer = await crypto.subtle.digest(
      'SHA-1',
      new TextEncoder().encode(password),
    )
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()

    const prefix = hashHex.slice(0, 5)
    const suffix = hashHex.slice(5)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HIBP_TIMEOUT_MS)

    try {
      const response = await fetch(`${HIBP_API_URL}${prefix}`, {
        headers: { 'User-Agent': 'ORC-AccountSecurity' },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) return -1

      const text = await response.text()
      const lines = text.split('\n')

      for (const line of lines) {
        const [hashSuffix, countStr] = line.trim().split(':')
        if (hashSuffix === suffix) {
          return parseInt(countStr, 10) || 1
        }
      }

      return 0
    } finally {
      clearTimeout(timeoutId)
    }
  } catch {
    // Fail open - don't block signup if HIBP is unreachable
    return -1
  }
}

/**
 * Validate password meets strength requirements.
 * Returns null if valid, or an error message string if invalid.
 */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres'
  }

  if (password.length > 128) {
    return 'La contraseña no puede tener más de 128 caracteres'
  }

  return null
}

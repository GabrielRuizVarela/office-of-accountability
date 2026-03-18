/**
 * Email verification + password reset token management.
 *
 * Tokens are stored as VerificationToken nodes in Neo4j.
 * Each token is single-use and has an expiration time.
 *
 * Token format: 32 random bytes, hex-encoded (64 chars).
 * Comparison uses constant-time equality to prevent timing attacks.
 */

import { readQuery, writeQuery, executeWrite } from '../neo4j/client'

const TOKEN_BYTES = 32
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000 // 1 hour

type TokenPurpose = 'email-verification' | 'password-reset'

function generateToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function getTtl(purpose: TokenPurpose): number {
  return purpose === 'email-verification' ? EMAIL_VERIFICATION_TTL_MS : PASSWORD_RESET_TTL_MS
}

/**
 * Create a verification token for an email address.
 * Invalidates any existing tokens for the same identifier+purpose first.
 */
export async function createVerificationToken(
  email: string,
  purpose: TokenPurpose,
): Promise<{ token: string; expires: Date }> {
  const token = generateToken()
  const identifier = `${purpose}:${email}`
  const ttl = getTtl(purpose)
  const expires = new Date(Date.now() + ttl)

  // Delete any existing tokens for this identifier
  await executeWrite(
    'MATCH (vt:VerificationToken {identifier: $identifier}) DELETE vt',
    { identifier },
  )

  // Create new token
  await executeWrite(
    `CREATE (vt:VerificationToken {
      identifier: $identifier,
      token: $token,
      expires: $expires
    })`,
    {
      identifier,
      token,
      expires: expires.toISOString(),
    },
  )

  return { token, expires }
}

/**
 * Consume a verification token. Returns true if valid and not expired.
 * Token is deleted regardless of validity (single-use).
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function consumeVerificationToken(
  email: string,
  purpose: TokenPurpose,
  providedToken: string,
): Promise<boolean> {
  const identifier = `${purpose}:${email}`

  // Read token first, then delete — Neo4j can't access properties after DELETE
  const result = await writeQuery(
    `MATCH (vt:VerificationToken {identifier: $identifier})
     WITH vt, vt.token AS token, vt.expires AS expires
     DELETE vt
     RETURN token, expires`,
    { identifier },
    (record) => ({
      token: String(record.get('token')),
      expires: String(record.get('expires')),
    }),
  )

  const stored = result.records[0]
  if (!stored) return false

  // Check expiration
  const expiresAt = new Date(stored.expires).getTime()
  if (Date.now() > expiresAt) return false

  // Constant-time comparison
  return constantTimeEqual(providedToken, stored.token)
}

/**
 * Mark a user's email as verified and upgrade to tier 1.
 */
export async function markEmailVerified(email: string): Promise<boolean> {
  const now = new Date().toISOString()

  const result = await writeQuery(
    `MATCH (u:User {email: $email})
     SET u.emailVerified = $now,
         u.verification_tier = 1,
         u.updated_at = $now
     RETURN u.id AS id`,
    { email, now },
    (record) => String(record.get('id')),
  )

  return result.records.length > 0
}

/**
 * Update a user's password hash.
 */
export async function updateUserPassword(email: string, passwordHash: string): Promise<boolean> {
  const now = new Date().toISOString()

  const result = await writeQuery(
    `MATCH (u:User {email: $email})
     SET u.password_hash = $passwordHash,
         u.failed_login_attempts = 0,
         u.locked_until = null,
         u.updated_at = $now
     RETURN u.id AS id`,
    { email, passwordHash, now },
    (record) => String(record.get('id')),
  )

  return result.records.length > 0
}

/**
 * Get user name by email (for email templates).
 */
export async function getUserNameByEmail(email: string): Promise<string | null> {
  const result = await readQuery(
    'MATCH (u:User {email: $email}) RETURN u.name AS name',
    { email },
    (record) => record.get('name') ? String(record.get('name')) : null,
  )

  return result.records[0] ?? null
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Account lockout after repeated failed login attempts.
 *
 * After 10 failed attempts, the account is locked for 15 minutes.
 * On successful login, the counter resets.
 * When the lockout window expires, the counter resets on next attempt.
 */

import { writeQuery } from '../neo4j/client'

const MAX_FAILED_ATTEMPTS = 10
const LOCKOUT_DURATION_MS = 15 * 60 * 1000

interface LockoutState {
  readonly failedAttempts: number
  readonly lockedUntil: string | null
}

/**
 * Check whether an account is currently locked.
 * Returns true if the account is locked and the lockout has not expired.
 */
export function isAccountLocked(state: LockoutState): boolean {
  if (!state.lockedUntil) return false
  return new Date(state.lockedUntil).getTime() > Date.now()
}

/**
 * Record a failed login attempt for the given user.
 * If the failure count reaches MAX_FAILED_ATTEMPTS, sets locked_until.
 * If the previous lockout has expired, resets the counter first.
 */
export async function recordFailedAttempt(userId: string, currentState: LockoutState): Promise<void> {
  const lockoutExpired = currentState.lockedUntil
    && new Date(currentState.lockedUntil).getTime() <= Date.now()

  const newCount = lockoutExpired ? 1 : currentState.failedAttempts + 1
  const shouldLock = newCount >= MAX_FAILED_ATTEMPTS
  const lockedUntil = shouldLock
    ? new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString()
    : null

  await writeQuery(
    `MATCH (u:User {id: $userId})
     SET u.failed_login_attempts = $count,
         u.locked_until = $lockedUntil,
         u.updated_at = $now
     RETURN u.id AS id`,
    {
      userId,
      count: newCount,
      lockedUntil,
      now: new Date().toISOString(),
    },
    (record) => String(record.get('id')),
  )
}

/**
 * Reset the failed login counter after a successful login.
 */
export async function resetFailedAttempts(userId: string): Promise<void> {
  await writeQuery(
    `MATCH (u:User {id: $userId})
     SET u.failed_login_attempts = 0,
         u.locked_until = null,
         u.updated_at = $now
     RETURN u.id AS id`,
    {
      userId,
      now: new Date().toISOString(),
    },
    (record) => String(record.get('id')),
  )
}

/**
 * Parse lockout fields from a Neo4j query result into a LockoutState.
 */
export function parseLockoutState(
  failedAttempts: unknown,
  lockedUntil: unknown,
): LockoutState {
  return {
    failedAttempts: typeof failedAttempts === 'number' ? failedAttempts : Number(failedAttempts ?? 0),
    lockedUntil: lockedUntil ? String(lockedUntil) : null,
  }
}

/**
 * Auth.js configuration for @auth/core.
 *
 * Framework-agnostic setup using Credentials (email/password)
 * and Google OAuth providers. JWT sessions — no session storage in Neo4j.
 *
 * Uses custom Neo4j adapter for User/Account/VerificationToken persistence.
 */

import type { AuthConfig } from '@auth/core'
import type { Provider } from '@auth/core/providers'
import Credentials from '@auth/core/providers/credentials'
import Google from '@auth/core/providers/google'

import { Neo4jAdapter } from './neo4j-adapter'
import { isAccountLocked, parseLockoutState, recordFailedAttempt, resetFailedAttempts } from './lockout'
import { verifyPassword } from './password'
import { signInSchema } from './types'
import { readQuery, executeWrite } from '../neo4j/client'

function getAuthConfig(): AuthConfig {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required')
  }

  const KNOWN_WEAK_SECRETS = [
    'dev-secret-not-for-production-use-only',
    'change-me',
    'secret',
    'your-secret-here',
  ]

  if (process.env.NODE_ENV === 'production') {
    if (secret.length < 32) {
      throw new Error('AUTH_SECRET must be at least 32 characters in production (use: openssl rand -base64 32)')
    }
    if (KNOWN_WEAK_SECRETS.includes(secret)) {
      throw new Error('AUTH_SECRET is a known weak value — generate a secure secret for production')
    }
  }

  const providers: Provider[] = [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const result = await readQuery(
          `MATCH (u:User {email: $email})
           RETURN u.id AS id, u.email AS email, u.name AS name,
                  u.image AS image, u.password_hash AS passwordHash,
                  u.verification_tier AS verificationTier,
                  u.failed_login_attempts AS failedAttempts,
                  u.locked_until AS lockedUntil`,
          { email },
          (record) => ({
            id: String(record.get('id')),
            email: String(record.get('email')),
            name: record.get('name') ? String(record.get('name')) : null,
            image: record.get('image') ? String(record.get('image')) : null,
            passwordHash: record.get('passwordHash') ? String(record.get('passwordHash')) : null,
            verificationTier: Number(record.get('verificationTier') ?? 0),
            failedAttempts: record.get('failedAttempts'),
            lockedUntil: record.get('lockedUntil'),
          }),
        )

        const user = result.records[0]
        if (!user) return null
        if (!user.passwordHash) return null

        const lockoutState = parseLockoutState(user.failedAttempts, user.lockedUntil)

        if (isAccountLocked(lockoutState)) {
          return null
        }

        const valid = await verifyPassword(password, user.passwordHash)
        if (!valid) {
          await recordFailedAttempt(user.id, lockoutState)
          return null
        }

        if (lockoutState.failedAttempts > 0) {
          await resetFailedAttempts(user.id)
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ]

  const googleId = process.env.AUTH_GOOGLE_ID
  const googleSecret = process.env.AUTH_GOOGLE_SECRET
  if (googleId && googleSecret) {
    providers.push(
      Google({
        clientId: googleId,
        clientSecret: googleSecret,
        allowDangerousEmailAccountLinking: true,
      }),
    )
  }

  const IDLE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
  const ABSOLUTE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

  return {
    providers,
    adapter: Neo4jAdapter(),
    secret,
    session: {
      strategy: 'jwt',
      maxAge: ABSOLUTE_MAX_AGE,
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
    callbacks: {
      async jwt({ token, user }) {
        const now = Date.now()

        if (user) {
          return {
            ...token,
            id: user.id,
            lastActive: now,
          }
        }

        // Check idle timeout (7 days since last activity)
        const lastActive = typeof token.lastActive === 'number' ? token.lastActive : now
        if (now - lastActive > IDLE_TIMEOUT_MS) {
          // Return empty token to invalidate the session
          return { ...token, expired: true }
        }

        // Update last activity timestamp
        return {
          ...token,
          lastActive: now,
        }
      },
      async session({ session, token }) {
        // If token was marked as expired by idle timeout, return expired session
        if (token.expired) {
          return {
            ...session,
            expires: new Date(0).toISOString(),
            user: {
              ...session.user,
              id: '',
            },
          }
        }

        return {
          ...session,
          user: {
            ...session.user,
            id: token.id as string,
          },
        }
      },
    },
    events: {
      async linkAccount({ user, account }) {
        // When a Google OAuth account is linked, mark email as verified (tier 1)
        // Google has already verified the email address
        if (account.provider === 'google' && user.id) {
          const now = new Date().toISOString()
          await executeWrite(
            `MATCH (u:User {id: $userId})
             WHERE u.emailVerified IS NULL OR u.verification_tier < 1
             SET u.emailVerified = $now,
                 u.verification_tier = 1,
                 u.updated_at = $now`,
            { userId: user.id, now },
          )
        }
      },
    },
    trustHost: true,
    basePath: '/api/auth',
  }
}

export const authConfig = getAuthConfig()

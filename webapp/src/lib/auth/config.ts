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
import { readQuery } from '../neo4j/client'

function getAuthConfig(): AuthConfig {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required')
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
      }),
    )
  }

  return {
    providers,
    adapter: Neo4jAdapter(),
    secret,
    session: {
      strategy: 'jwt',
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          return {
            ...token,
            id: user.id,
          }
        }
        return token
      },
      async session({ session, token }) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id as string,
          },
        }
      },
    },
    trustHost: true,
    basePath: '/api/auth',
  }
}

export const authConfig = getAuthConfig()

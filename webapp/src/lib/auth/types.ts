import { z } from 'zod/v4'

/** User verification tiers */
export type VerificationTier = 0 | 1 | 2

/** Auth user as stored in Neo4j */
export interface AuthUser {
  readonly id: string
  readonly email: string
  readonly name: string | null
  readonly image: string | null
  readonly emailVerified: Date | null
  readonly verification_tier: VerificationTier
  readonly created_at: string
  readonly updated_at: string
}

/** OAuth/credentials account linked to a user */
export interface AuthAccount {
  readonly id: string
  readonly userId: string
  readonly type: string
  readonly provider: string
  readonly providerAccountId: string
  readonly refresh_token: string | null
  readonly access_token: string | null
  readonly expires_at: number | null
  readonly token_type: string | null
  readonly scope: string | null
  readonly id_token: string | null
}

/** Email verification token */
export interface AuthVerificationToken {
  readonly identifier: string
  readonly token: string
  readonly expires: Date
}

/** Sign-up input validation */
export const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(200),
})

export type SignUpInput = z.infer<typeof signUpSchema>

/** Sign-in input validation */
export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export type SignInInput = z.infer<typeof signInSchema>

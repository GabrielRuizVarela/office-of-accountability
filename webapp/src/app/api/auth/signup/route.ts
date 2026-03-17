/**
 * POST /api/auth/signup
 *
 * Creates a new user account with email/password credentials.
 * Validates input with Zod, checks for duplicate emails,
 * hashes password with PBKDF2, and creates User + Account nodes in Neo4j.
 *
 * Responses:
 *   - 201: { success, data: { id, email, name } }
 *   - 400: invalid input
 *   - 409: email already registered
 *   - 503: Neo4j unreachable
 */

import { signUpSchema } from '@/lib/auth/types'
import { hashPassword } from '@/lib/auth/password'
import { readQuery, writeQuery } from '@/lib/neo4j/client'

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = signUpSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: 'Invalid input',
        details: parsed.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 },
    )
  }

  const { email, password, name } = parsed.data

  try {
    const existing = await readQuery(
      'MATCH (u:User {email: $email}) RETURN u.id AS id',
      { email },
      (record) => String(record.get('id')),
    )

    if (existing.records.length > 0) {
      return Response.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 },
      )
    }

    const passwordHash = await hashPassword(password)
    const now = new Date().toISOString()
    const userId = crypto.randomUUID()

    const result = await writeQuery(
      `CREATE (u:User {
        id: $id,
        email: $email,
        name: $name,
        image: null,
        emailVerified: null,
        password_hash: $passwordHash,
        verification_tier: 0,
        created_at: $now,
        updated_at: $now
      })
      CREATE (a:Account {
        userId: $id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: $email
      })-[:BELONGS_TO]->(u)
      RETURN u.id AS id, u.email AS email, u.name AS name`,
      { id: userId, email, name, passwordHash, now },
      (record) => ({
        id: String(record.get('id')),
        email: String(record.get('email')),
        name: String(record.get('name')),
      }),
    )

    return Response.json(
      {
        success: true,
        data: result.records[0],
      },
      { status: 201 },
    )
  } catch (error) {
    const isConnectionError =
      error instanceof Error &&
      (error.message.includes('connect') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ServiceUnavailable') ||
        error.message.includes('SessionExpired'))

    if (isConnectionError) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }

    throw error
  }
}

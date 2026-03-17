/**
 * GET /api/profile — Fetch current user's full profile
 * PATCH /api/profile — Update current user's name
 *
 * Requires authenticated session (JWT).
 * PATCH is CSRF-protected by middleware (outside /api/auth/ exemption).
 *
 * Responses:
 *   - 200: { success, data: { id, email, name, image, verification_tier, created_at } }
 *   - 400: invalid input
 *   - 401: not authenticated
 *   - 503: Neo4j unreachable
 */

import { z } from 'zod/v4'

import { getSession } from '@/lib/auth/session'
import { readQuery, writeQuery } from '@/lib/neo4j/client'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
})

interface UserProfile {
  readonly id: string
  readonly email: string
  readonly name: string | null
  readonly image: string | null
  readonly verification_tier: number
  readonly created_at: string
}

function transformUserRecord(record: { get: (key: string) => unknown }): UserProfile {
  return {
    id: String(record.get('id')),
    email: String(record.get('email')),
    name: record.get('name') ? String(record.get('name')) : null,
    image: record.get('image') ? String(record.get('image')) : null,
    verification_tier: Number(record.get('verification_tier') ?? 0),
    created_at: String(record.get('created_at')),
  }
}

export async function GET(): Promise<Response> {
  const session = await getSession()
  if (!session) {
    return Response.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const result = await readQuery(
      `MATCH (u:User {id: $userId})
       RETURN u.id AS id, u.email AS email, u.name AS name, u.image AS image,
              u.verification_tier AS verification_tier, u.created_at AS created_at`,
      { userId: session.user.id },
      transformUserRecord,
    )

    if (result.records.length === 0) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return Response.json({ success: true, data: result.records[0] })
  } catch (error) {
    if (isConnectionError(error)) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    throw error
  }
}

export async function PATCH(request: Request): Promise<Response> {
  const session = await getSession()
  if (!session) {
    return Response.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = updateProfileSchema.safeParse(body)
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

  const { name } = parsed.data

  try {
    const result = await writeQuery(
      `MATCH (u:User {id: $userId})
       SET u.name = $name, u.updated_at = $now
       RETURN u.id AS id, u.email AS email, u.name AS name, u.image AS image,
              u.verification_tier AS verification_tier, u.created_at AS created_at`,
      { userId: session.user.id, name, now: new Date().toISOString() },
      transformUserRecord,
    )

    if (result.records.length === 0) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    return Response.json({ success: true, data: result.records[0] })
  } catch (error) {
    if (isConnectionError(error)) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    throw error
  }
}

function isConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('connect') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ServiceUnavailable') ||
      error.message.includes('SessionExpired'))
  )
}

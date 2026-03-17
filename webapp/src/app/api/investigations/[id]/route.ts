/**
 * /api/investigations/[id]
 *
 * GET    — Get investigation by ID (public for published, auth for drafts)
 * PATCH  — Update investigation (auth required, author only)
 * DELETE — Delete investigation (auth required, author only)
 *
 * Responses:
 *   GET    200: investigation with author
 *   GET    404: not found
 *   PATCH  200: updated investigation
 *   PATCH  400: invalid input
 *   PATCH  401: not authenticated
 *   PATCH  403: not the author
 *   PATCH  404: not found
 *   DELETE 200: deleted confirmation
 *   DELETE 401: not authenticated
 *   DELETE 403: not the author
 *   DELETE 404: not found
 *   503: Neo4j unreachable
 */

import { z } from 'zod/v4'

import {
  updateInvestigationSchema,
  getInvestigationById,
  updateInvestigation,
  deleteInvestigation,
} from '@/lib/investigation'
import { getSession } from '@/lib/auth/session'

const idSchema = z.string().min(1).max(200)

function isConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('connect') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ServiceUnavailable') ||
      error.message.includes('SessionExpired'))
  )
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params

  const idResult = idSchema.safeParse(id)
  if (!idResult.success) {
    return Response.json({ success: false, error: 'Invalid investigation ID' }, { status: 400 })
  }

  try {
    const result = await getInvestigationById(idResult.data)

    if (!result) {
      return Response.json({ success: false, error: 'Investigation not found' }, { status: 404 })
    }

    // Drafts and archived investigations require auth from the author
    if (result.investigation.status !== 'published') {
      const session = await getSession()
      if (!session || session.user.id !== result.investigation.author_id) {
        return Response.json({ success: false, error: 'Investigation not found' }, { status: 404 })
      }
    }

    return Response.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (isConnectionError(error)) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    throw error
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getSession()
  if (!session) {
    return Response.json({ success: false, error: 'Authentication required' }, { status: 401 })
  }

  const { id } = await params

  const idResult = idSchema.safeParse(id)
  if (!idResult.success) {
    return Response.json({ success: false, error: 'Invalid investigation ID' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = updateInvestigationSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'Invalid input', details: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const result = await updateInvestigation(idResult.data, parsed.data, session.user.id)

    if (!result) {
      return Response.json({ success: false, error: 'Investigation not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Unauthorized: not the investigation author')
    ) {
      return Response.json(
        { success: false, error: 'You are not the author of this investigation' },
        { status: 403 },
      )
    }
    if (isConnectionError(error)) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    throw error
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getSession()
  if (!session) {
    return Response.json({ success: false, error: 'Authentication required' }, { status: 401 })
  }

  const { id } = await params

  const idResult = idSchema.safeParse(id)
  if (!idResult.success) {
    return Response.json({ success: false, error: 'Invalid investigation ID' }, { status: 400 })
  }

  try {
    const deleted = await deleteInvestigation(idResult.data, session.user.id)

    if (!deleted) {
      return Response.json({ success: false, error: 'Investigation not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data: { id: idResult.data, deleted: true },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Unauthorized: not the investigation author')
    ) {
      return Response.json(
        { success: false, error: 'You are not the author of this investigation' },
        { status: 403 },
      )
    }
    if (isConnectionError(error)) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    throw error
  }
}

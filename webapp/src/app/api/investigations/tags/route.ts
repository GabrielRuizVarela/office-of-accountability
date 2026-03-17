/**
 * GET /api/investigations/tags
 *
 * Returns all unique tags from published investigations.
 * Used for tag filter dropdowns on the investigations index.
 *
 * Responses:
 *   200: array of tag strings
 *   503: Neo4j unreachable
 */

import { getAllTags } from '@/lib/investigation'

function isConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('connect') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ServiceUnavailable') ||
      error.message.includes('SessionExpired'))
  )
}

export async function GET(): Promise<Response> {
  try {
    const tags = await getAllTags()

    return Response.json({
      success: true,
      data: tags,
    })
  } catch (error) {
    if (isConnectionError(error)) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    throw error
  }
}

/**
 * GET /api/graph/showcase
 *
 * Returns curated graph relationship examples and top hub nodes
 * for display in showcase components across the site.
 *
 * No parameters required. Results are lightweight (max ~15 items).
 *
 * Responses:
 *   - 200: { success: true, data: ShowcaseData }
 *   - 503: Neo4j unreachable
 */

import { getShowcaseData } from '@/lib/graph'

export async function GET(): Promise<Response> {
  try {
    const data = await getShowcaseData()

    return Response.json({
      success: true,
      data,
      meta: {
        edgeCount: data.edges.length,
        hubCount: data.hubs.length,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      const msg = error.message

      const isTimeout =
        msg.includes('transaction has been terminated') ||
        msg.includes('Transaction timed out') ||
        msg.includes('LockClient') ||
        msg.includes('TransactionTimedOut')

      if (isTimeout) {
        return Response.json({ success: false, error: 'Query timed out' }, { status: 504 })
      }

      const isConnectionError =
        msg.includes('connect') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('ServiceUnavailable') ||
        msg.includes('SessionExpired')

      if (isConnectionError) {
        return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
      }
    }
    throw error
  }
}

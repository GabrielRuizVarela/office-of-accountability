import { NextRequest } from 'next/server'

import { getFlightLog } from '../../../../../lib/caso-epstein/queries'
import { CASO_EPSTEIN_SLUG } from '../../../../../lib/caso-epstein/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  // Currently only the Epstein case is supported — accept any slug
  try {
    const data = await getFlightLog(CASO_EPSTEIN_SLUG)
    return Response.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (
      message.includes('connect') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ServiceUnavailable')
    ) {
      return Response.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 },
      )
    }

    return Response.json(
      { success: false, error: 'Failed to load flight data' },
      { status: 500 },
    )
  }
}

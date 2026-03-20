/**
 * API route: GET /api/caso-libra/simulate/[sessionId]
 * Poll simulation status and results from MiroFish backend.
 */

import { NextRequest, NextResponse } from 'next/server'

const MIROFISH_API_URL = process.env.MIROFISH_API_URL

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
): Promise<Response> {
  if (!MIROFISH_API_URL) {
    return NextResponse.json(
      { error: 'MiroFish backend not configured.' },
      { status: 503 },
    )
  }

  const { sessionId } = await params

  if (!sessionId || sessionId.length > 200) {
    return NextResponse.json({ error: 'Invalid session ID.' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${MIROFISH_API_URL}/simulate/${encodeURIComponent(sessionId)}`,
      { method: 'GET' },
    )

    if (!response.ok) {
      const text = await response.text()
      console.error('MiroFish status error:', response.status, text)
      return NextResponse.json(
        { error: 'Failed to fetch simulation status.' },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to poll simulation status:', error)
    return NextResponse.json({ error: 'Failed to connect to simulation backend.' }, { status: 502 })
  }
}

/**
 * API route: POST /api/caso-libra/simulate/[sessionId]/chat
 * Chat with simulated agents after a simulation completes.
 */

import { NextRequest, NextResponse } from 'next/server'

const MIROFISH_API_URL = process.env.MIROFISH_API_URL

export async function POST(
  request: NextRequest,
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
    const body = await request.json()
    const { message, agentId } = body as { message?: string; agentId?: string }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }

    const response = await fetch(
      `${MIROFISH_API_URL}/simulate/${encodeURIComponent(sessionId)}/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          agent_id: agentId,
        }),
      },
    )

    if (!response.ok) {
      const text = await response.text()
      console.error('MiroFish chat error:', response.status, text)
      return NextResponse.json(
        { error: 'Chat request failed.' },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to chat with simulation:', error)
    return NextResponse.json({ error: 'Failed to connect to simulation backend.' }, { status: 502 })
  }
}

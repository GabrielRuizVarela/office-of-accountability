/**
 * API route: POST /api/caso-libra/simulate
 * Start a new MiroFish simulation with a scenario description.
 */

import { NextRequest, NextResponse } from 'next/server'

const MIROFISH_API_URL = process.env.MIROFISH_API_URL

export async function POST(request: NextRequest): Promise<Response> {
  if (!MIROFISH_API_URL) {
    return NextResponse.json(
      { error: 'MiroFish backend not configured. Set MIROFISH_API_URL environment variable.' },
      { status: 503 },
    )
  }

  try {
    const body = await request.json()
    const { scenario, rounds = 40, agentCount } = body as {
      scenario?: string
      rounds?: number
      agentCount?: number
    }

    if (!scenario || typeof scenario !== 'string' || scenario.trim().length === 0) {
      return NextResponse.json({ error: 'Scenario description is required.' }, { status: 400 })
    }

    if (!Number.isFinite(rounds) || rounds < 1 || rounds > 100) {
      return NextResponse.json({ error: 'Rounds must be a number between 1 and 100.' }, { status: 400 })
    }

    if (agentCount !== undefined && (!Number.isFinite(agentCount) || agentCount < 1 || agentCount > 50)) {
      return NextResponse.json({ error: 'Agent count must be a number between 1 and 50.' }, { status: 400 })
    }

    const response = await fetch(`${MIROFISH_API_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario: scenario.trim(),
        rounds,
        agent_count: agentCount,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('MiroFish simulate error:', response.status, text)
      return NextResponse.json(
        { error: 'Simulation backend returned an error.' },
        { status: 502 },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to start simulation:', error)
    return NextResponse.json({ error: 'Failed to connect to simulation backend.' }, { status: 502 })
  }
}

/**
 * API route: GET /api/caso-libra/graph
 * Returns the full Caso Libra knowledge graph.
 */

import { NextResponse } from 'next/server'

import { getInvestigationGraph } from '@/lib/caso-libra'

export async function GET(): Promise<Response> {
  try {
    const data = await getInvestigationGraph()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch Caso Libra graph:', error)
    return NextResponse.json({ nodes: [], links: [] }, { status: 500 })
  }
}

/**
 * API route: GET /api/caso-libra/wallets
 * Returns the wallet flow subgraph.
 */

import { NextResponse } from 'next/server'

import { getWalletFlows } from '@/lib/caso-libra'

export async function GET(): Promise<Response> {
  try {
    const data = await getWalletFlows()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch wallet flows:', error)
    return NextResponse.json({ nodes: [], links: [] }, { status: 500 })
  }
}

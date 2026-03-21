/**
 * API route: GET /api/caso/[slug]/wallets
 * Returns the wallet flow subgraph for investigations that have wallet data.
 */

import { NextRequest } from 'next/server'

import { getClientConfig } from '@/lib/investigations/registry'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const config = getClientConfig(slug)
  if (!config) {
    return Response.json(
      { success: false, error: 'Unknown investigation' },
      { status: 404 },
    )
  }

  try {
    // Wallet flows are currently only available for caso-libra
    if (slug === 'caso-libra') {
      const { getWalletFlows } = await import('@/lib/caso-libra')
      const data = await getWalletFlows()
      return Response.json(data)
    }

    return Response.json({ nodes: [], links: [] })
  } catch (error) {
    console.error('Failed to fetch wallet flows:', error)
    return Response.json({ nodes: [], links: [] }, { status: 500 })
  }
}

/**
 * API route: GET /api/caso/[slug]/wallets
 * Returns wallet flow subgraph for a given investigation.
 * Currently only caso-libra has wallet data.
 */

import { getClientConfig } from '@/lib/investigations/registry'
import { getWalletFlows } from '@/lib/caso-libra'

export async function GET(
  _request: Request,
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

  if (slug !== 'caso-libra') {
    return Response.json(
      { success: false, error: 'Wallet data not available for this investigation' },
      { status: 404 },
    )
  }

  try {
    const data = await getWalletFlows()
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
      { success: false, error: 'Failed to load wallet flows' },
      { status: 500 },
    )
  }
}

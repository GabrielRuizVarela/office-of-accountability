/**
 * API route: GET/POST /api/caso/[slug]/investigation
 * Proxies to the caso-specific investigation submission endpoint.
 */

import { NextRequest } from 'next/server'

import { getClientConfig } from '@/lib/investigations/registry'

export async function GET(
  request: NextRequest,
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

  // Currently only caso-libra has the investigation submission store
  if (slug === 'caso-libra') {
    const { GET: handler } = await import('@/app/api/caso-libra/investigation/route')
    return handler(request)
  }

  return Response.json({ count: 0, items: [] })
}

export async function POST(
  request: NextRequest,
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

  if (slug === 'caso-libra') {
    const { POST: handler } = await import('@/app/api/caso-libra/investigation/route')
    return handler(request)
  }

  return Response.json(
    { error: 'Investigation submissions not available for this case' },
    { status: 404 },
  )
}

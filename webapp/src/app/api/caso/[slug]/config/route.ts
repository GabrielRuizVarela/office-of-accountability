import { NextRequest } from 'next/server'

import { getClientConfig, getClientConfigDynamic } from '@/lib/investigations/registry'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  // Validate slug against static registry, then dynamic
  const config = getClientConfig(slug) ?? await getClientConfigDynamic(slug)
  if (!config) {
    return Response.json(
      { success: false, error: 'Unknown investigation' },
      { status: 404 },
    )
  }

  return Response.json({
    success: true,
    name: config.name,
    description: config.description,
    casoSlug: config.casoSlug,
    tabs: config.tabs,
    features: config.features,
  })
}

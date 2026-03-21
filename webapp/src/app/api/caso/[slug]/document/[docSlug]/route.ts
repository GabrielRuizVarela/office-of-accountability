/**
 * API route: GET /api/caso/[slug]/document/[docSlug]
 * Returns document data with connected entities.
 */

import { getClientConfig } from '@/lib/investigations/registry'
import { getDocumentBySlug as getLibraDocumentBySlug } from '@/lib/caso-libra'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; docSlug: string }> },
): Promise<Response> {
  const { slug, docSlug } = await params

  const config = getClientConfig(slug)
  if (!config) {
    return Response.json(
      { success: false, error: 'Unknown investigation' },
      { status: 404 },
    )
  }

  if (!docSlug || docSlug.length > 200) {
    return Response.json(
      { success: false, error: 'Invalid slug' },
      { status: 400 },
    )
  }

  try {
    // Currently only caso-libra has getDocumentBySlug
    const data = await getLibraDocumentBySlug(slug, docSlug)

    if (!data) {
      return Response.json(
        { success: false, error: 'Document not found' },
        { status: 404 },
      )
    }

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
      { success: false, error: 'Failed to load document data' },
      { status: 500 },
    )
  }
}

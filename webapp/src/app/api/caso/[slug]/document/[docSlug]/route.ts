/**
 * API route: GET /api/caso/[slug]/document/[docSlug]
 * Returns document data with connected entities for a given investigation.
 */

import { getClientConfig } from '@/lib/investigations/registry'
import { getDocumentBySlug as getLibraDocumentBySlug } from '@/lib/caso-libra'
import { getDocumentBySlug as getEpsteinDocumentBySlug } from '@/lib/caso-epstein'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; docSlug: string }> },
) {
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

  const getDocument =
    slug === 'caso-libra' ? () => getLibraDocumentBySlug(docSlug) :
    slug === 'caso-epstein' ? () => getEpsteinDocumentBySlug(slug, docSlug) :
    null

  if (!getDocument) {
    return Response.json(
      { success: false, error: 'Document lookup not available for this investigation' },
      { status: 404 },
    )
  }

  try {
    const data = await getDocument()

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

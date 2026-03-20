/**
 * API route: GET /api/caso-libra/document/[docSlug]
 * Returns document data with connected entities.
 */

import { NextResponse } from 'next/server'

import { getDocumentBySlug } from '@/lib/caso-libra'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ docSlug: string }> },
): Promise<Response> {
  const { docSlug } = await params

  if (!docSlug || docSlug.length > 200) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  try {
    const data = await getDocumentBySlug(docSlug)

    if (!data) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch document:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

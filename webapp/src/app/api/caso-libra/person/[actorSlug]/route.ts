/**
 * API route: GET /api/caso-libra/person/[actorSlug]
 * Returns person data with graph, events, and documents.
 */

import { NextResponse } from 'next/server'

import { getPersonBySlug } from '@/lib/caso-libra'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ actorSlug: string }> },
): Promise<Response> {
  const { actorSlug } = await params

  if (!actorSlug || actorSlug.length > 200) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  try {
    const data = await getPersonBySlug(actorSlug)

    if (!data) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch person:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

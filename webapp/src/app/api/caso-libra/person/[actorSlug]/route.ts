/**
 * API route: GET /api/caso-libra/person/[actorSlug]
 * 301 redirect to the unified endpoint at /api/caso/caso-libra/person/[actorSlug].
 */

import { type NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ actorSlug: string }> },
): Promise<Response> {
  const { actorSlug } = await params
  const target = new URL(`/api/caso/caso-libra/person/${encodeURIComponent(actorSlug)}`, request.url)

  const { searchParams } = request.nextUrl
  searchParams.forEach((value, key) => {
    target.searchParams.set(key, value)
  })

  return NextResponse.redirect(target, 301)
}

/**
 * API route: GET /api/caso-libra/document/[docSlug]
 * 301 redirect to the unified endpoint at /api/caso/caso-libra/document/[docSlug].
 */

import { type NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docSlug: string }> },
): Promise<Response> {
  const { docSlug } = await params
  const target = new URL(`/api/caso/caso-libra/document/${encodeURIComponent(docSlug)}`, request.url)

  const { searchParams } = request.nextUrl
  searchParams.forEach((value, key) => {
    target.searchParams.set(key, value)
  })

  return NextResponse.redirect(target, 301)
}

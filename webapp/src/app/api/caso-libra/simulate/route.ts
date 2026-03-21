/**
 * API route: POST /api/caso-libra/simulate
 * 301 redirect to the unified endpoint at /api/caso/caso-libra/simulation/init.
 */

import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl
  const target = new URL('/api/caso/caso-libra/simulation/init', request.url)

  // Preserve any query parameters
  searchParams.forEach((value, key) => {
    target.searchParams.set(key, value)
  })

  return NextResponse.redirect(target, 301)
}

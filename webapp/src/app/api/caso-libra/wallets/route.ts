/**
 * API route: GET /api/caso-libra/wallets
 * 301 redirect to the unified endpoint at /api/caso/caso-libra/wallets.
 */

import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<Response> {
  const target = new URL('/api/caso/caso-libra/wallets', request.url)

  const { searchParams } = request.nextUrl
  searchParams.forEach((value, key) => {
    target.searchParams.set(key, value)
  })

  return NextResponse.redirect(target, 301)
}

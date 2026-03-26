/**
 * OG image rendering utility.
 *
 * Uses satori (JSX→SVG) + @resvg/resvg-wasm (SVG→PNG) for
 * Cloudflare Workers–compatible image generation.
 *
 * Images are 1200x630 to match WhatsApp/social card requirements.
 */

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'

import satori from 'satori'
import { initWasm, Resvg } from '@resvg/resvg-wasm'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

// ---------------------------------------------------------------------------
// Font loading (cached at module level)
// ---------------------------------------------------------------------------

let fontCache: ArrayBuffer | null = null
let fontBoldCache: ArrayBuffer | null = null
let wasmInitialized = false

/**
 * Extract the first font URL from a Google Fonts CSS response.
 */
function extractFontUrl(css: string): string | null {
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)
  return match ? match[1] : null
}

/**
 * Fetch a Google Fonts font file by weight and cache it.
 */
async function fetchGoogleFont(weight: number): Promise<ArrayBuffer> {
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`,
    {
      headers: {
        // Request TTF format - satori does not support WOFF2.
        // An older IE User-Agent tricks Google Fonts into serving TTF.
        'User-Agent':
          'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
      },
    },
  )

  const css = await cssRes.text()
  const fontUrl = extractFontUrl(css)

  if (!fontUrl) {
    throw new Error(`Could not extract font URL for weight ${weight}`)
  }

  const fontRes = await fetch(fontUrl)
  return fontRes.arrayBuffer()
}

/**
 * Load fonts, caching at module level so subsequent calls are instant.
 */
async function loadFonts(): Promise<
  ReadonlyArray<{ name: string; data: ArrayBuffer; weight: 400 | 600 | 700; style: 'normal' }>
> {
  if (!fontCache || !fontBoldCache) {
    const [regular, bold] = await Promise.all([fetchGoogleFont(400), fetchGoogleFont(700)])
    fontCache = regular
    fontBoldCache = bold
  }

  return [
    { name: 'Inter', data: fontCache, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: fontBoldCache, weight: 700 as const, style: 'normal' as const },
  ]
}

// ---------------------------------------------------------------------------
// WASM initialization
// ---------------------------------------------------------------------------

function findWasmPath(): string {
  // Walk up from node_modules/@resvg/resvg-wasm to find the wasm file
  try {
    const resvgPkg = require.resolve('@resvg/resvg-wasm/package.json')
    return join(dirname(resvgPkg), 'index_bg.wasm')
  } catch {
    // Fallback: assume standard node_modules layout
    return join(process.cwd(), 'node_modules', '@resvg', 'resvg-wasm', 'index_bg.wasm')
  }
}

async function ensureWasm(): Promise<void> {
  if (wasmInitialized) return

  try {
    const wasmPath = findWasmPath()
    const buffer = readFileSync(wasmPath)
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    await initWasm(arrayBuffer)
  } catch (err: unknown) {
    // initWasm throws if called twice - safe to ignore
    if (err instanceof Error && err.message.includes('Already initialized')) {
      // no-op
    } else {
      throw err
    }
  }

  wasmInitialized = true
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface RenderOgImageOptions {
  /** React-like JSX element (satori compatible) */
  readonly element: React.ReactNode
  /** Image width (default: 1200) */
  readonly width?: number
  /** Image height (default: 630) */
  readonly height?: number
}

/**
 * Render a JSX element to a PNG buffer suitable for OG images.
 *
 * @returns PNG data as Uint8Array
 */
export async function renderOgImage({
  element,
  width = OG_WIDTH,
  height = OG_HEIGHT,
}: RenderOgImageOptions): Promise<Uint8Array> {
  const [fonts] = await Promise.all([loadFonts(), ensureWasm()])

  const svg = await satori(element as React.ReactElement, {
    width,
    height,
    fonts: fonts as Parameters<typeof satori>[1]['fonts'],
  })

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
  })

  const rendered = resvg.render()
  return rendered.asPng()
}

/**
 * Create a Response with the rendered OG image.
 *
 * Sets appropriate headers for caching and content type.
 */
export async function ogImageResponse(options: RenderOgImageOptions): Promise<Response> {
  try {
    const png = await renderOgImage(options)

    return new Response(png.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      },
    })
  } catch (error) {
    console.error('OG image generation failed:', error)
    return new Response('OG image generation failed', { status: 500 })
  }
}

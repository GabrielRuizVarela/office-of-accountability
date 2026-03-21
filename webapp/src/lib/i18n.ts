/**
 * Minimal bilingual metadata utilities.
 *
 * Detects preferred language from Accept-Language header (server-side)
 * and provides helpers for bilingual page titles/descriptions.
 */

import { headers } from 'next/headers'

import type { Lang } from './language-context'

/**
 * Detect preferred language from Accept-Language header.
 * Returns 'es' if Spanish is preferred, 'en' otherwise.
 * Falls back to the provided default (or 'es').
 */
export async function detectLang(fallback: Lang = 'es'): Promise<Lang> {
  const hdrs = await headers()
  const accept = hdrs.get('accept-language') ?? ''
  // Parse Accept-Language: e.g. "es-AR,es;q=0.9,en;q=0.8"
  const langs = accept
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { lang: tag.split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1.0 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { lang } of langs) {
    if (lang === 'es') return 'es'
    if (lang === 'en') return 'en'
  }
  return fallback
}

/** Bilingual string pair. */
export type BilingualText = Readonly<Record<Lang, string>>

/** Pick the right language from a bilingual pair. */
export function t(text: BilingualText, lang: Lang): string {
  return text[lang]
}

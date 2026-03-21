import type { Lang } from './language-context'

/**
 * Parse Accept-Language header and return best matching language.
 * Falls back to 'es' (primary audience is Argentine).
 */
export function detectLang(acceptLanguage: string | null): Lang {
  if (!acceptLanguage) return 'es'

  const entries = acceptLanguage
    .split(',')
    .map((part) => {
      const [locale, qPart] = part.trim().split(';')
      const q = qPart ? parseFloat(qPart.replace('q=', '')) : 1
      return { locale: locale.trim().toLowerCase(), q: Number.isNaN(q) ? 0 : q }
    })
    .sort((a, b) => b.q - a.q)

  for (const { locale } of entries) {
    if (locale.startsWith('en')) return 'en'
    if (locale.startsWith('es')) return 'es'
  }

  return 'es'
}

/** Bilingual metadata strings for root layout */
export const SITE_META: Record<Lang, { title: string; description: string }> = {
  es: {
    title: 'Oficina de Rendición de Cuentas',
    description:
      'Plataforma de conocimiento cívico para la política argentina. Explorá las conexiones entre legisladores, votaciones y legislación.',
  },
  en: {
    title: 'Office of Accountability',
    description:
      'Civic knowledge platform for Argentine politics. Explore the connections between legislators, votes, and legislation.',
  },
}

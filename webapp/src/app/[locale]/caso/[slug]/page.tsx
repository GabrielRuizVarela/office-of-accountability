/**
 * Caso landing page — routes to the correct investigation component based on slug.
 */

import { redirect } from '@/i18n/navigation'
import { getStats, getActors, getDocuments } from '@/lib/caso-libra'
import { CasoLandingContent } from './CasoLandingContent'
import { NuclearRiskLanding } from './NuclearRiskLanding'

const nuclearStatLabels: Record<string, Record<'en' | 'es', string>> = {
  Signals: { en: 'Signals', es: 'Senales' },
  Actors: { en: 'Actors', es: 'Actores' },
  Weapons: { en: 'Weapons', es: 'Armas' },
  Treaties: { en: 'Treaties', es: 'Tratados' },
  Facilities: { en: 'Facilities', es: 'Instalaciones' },
}

const nuclearTheaterNames: Record<string, Record<'en' | 'es', string>> = {
  'Korean Peninsula': { en: 'Korean Peninsula', es: 'Peninsula Coreana' },
  'Middle East': { en: 'Middle East', es: 'Medio Oriente' },
  'South Asia': { en: 'South Asia', es: 'Asia del Sur' },
  'US-Russia': { en: 'US-Russia', es: 'EE.UU.-Rusia' },
  'Global': { en: 'Global', es: 'Global' },
  'Europe': { en: 'Europe', es: 'Europa' },
}

async function getNuclearStats(locale: 'en' | 'es') {
  return {
    stats: [
      { label: nuclearStatLabels.Signals[locale], value: '29', color: 'yellow' },
      { label: nuclearStatLabels.Actors[locale], value: '14', color: 'red' },
      { label: nuclearStatLabels.Weapons[locale], value: '29', color: 'orange' },
      { label: nuclearStatLabels.Treaties[locale], value: '8', color: 'blue' },
      { label: nuclearStatLabels.Facilities[locale], value: '28', color: 'emerald' },
    ],
    theaters: [
      { theater: nuclearTheaterNames['Korean Peninsula'][locale], signalCount: 5, avgSeverity: 87, maxLevel: 'critical' },
      { theater: nuclearTheaterNames['Middle East'][locale], signalCount: 9, avgSeverity: 70, maxLevel: 'critical' },
      { theater: nuclearTheaterNames['South Asia'][locale], signalCount: 2, avgSeverity: 70, maxLevel: 'critical' },
      { theater: nuclearTheaterNames['US-Russia'][locale], signalCount: 2, avgSeverity: 53, maxLevel: 'serious' },
      { theater: nuclearTheaterNames['Global'][locale], signalCount: 9, avgSeverity: 51, maxLevel: 'critical' },
      { theater: nuclearTheaterNames['Europe'][locale], signalCount: 2, avgSeverity: 50, maxLevel: 'elevated' },
    ],
  }
}

const KNOWN_SLUGS = new Set(['caso-epstein', 'caso-libra', 'finanzas-politicas', 'monopolios', 'obras-publicas'])

export default async function CasoFallbackPage({
  params,
}: {
  readonly params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params

  // Nuclear risk has its own component in [slug]
  if (slug === 'riesgo-nuclear') {
    const { stats, theaters } = await getNuclearStats((locale === 'es' ? 'es' : 'en') as 'en' | 'es')
    return <NuclearRiskLanding slug={slug} stats={stats} theaters={theaters} />
  }

  // Known slugs with their own directories won't reach here.
  // Unknown slugs redirect home.
  if (!KNOWN_SLUGS.has(slug)) {
    redirect('/')
  }

  // Fallback for caso-libra style landing (shouldn't normally be reached)
  const [_stats, actors, documents] = await Promise.all([getStats(), getActors(), getDocuments()])
  return <CasoLandingContent slug={slug} actors={actors} documents={documents} />
}

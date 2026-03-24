/**
 * Caso landing page — routes to the correct investigation component based on slug.
 */

import { getStats, getActors, getDocuments } from '@/lib/caso-libra'
import { CasoLandingContent } from './CasoLandingContent'
import { NuclearRiskLanding } from './NuclearRiskLanding'

async function getNuclearStats() {
  // Static stats for now — will be dynamic when API routes are built
  return {
    stats: [
      { label: 'Signals', value: '29', color: 'yellow' },
      { label: 'Actors', value: '14', color: 'red' },
      { label: 'Weapons', value: '29', color: 'orange' },
      { label: 'Treaties', value: '8', color: 'blue' },
      { label: 'Facilities', value: '28', color: 'emerald' },
    ],
    theaters: [
      { theater: 'Korean Peninsula', signalCount: 5, avgSeverity: 87, maxLevel: 'critical' },
      { theater: 'Middle East', signalCount: 9, avgSeverity: 70, maxLevel: 'critical' },
      { theater: 'South Asia', signalCount: 2, avgSeverity: 70, maxLevel: 'critical' },
      { theater: 'US-Russia', signalCount: 2, avgSeverity: 53, maxLevel: 'serious' },
      { theater: 'Global', signalCount: 9, avgSeverity: 51, maxLevel: 'critical' },
      { theater: 'Europe', signalCount: 2, avgSeverity: 50, maxLevel: 'elevated' },
    ],
  }
}

export default async function CasoLandingPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (slug === 'riesgo-nuclear') {
    const { stats, theaters } = await getNuclearStats()
    return <NuclearRiskLanding slug={slug} stats={stats} theaters={theaters} />
  }

  // Default: Caso Libra / Epstein landing
  const [_stats, actors, documents] = await Promise.all([getStats(), getActors(), getDocuments()])
  return <CasoLandingContent slug={slug} actors={actors} documents={documents} />
}

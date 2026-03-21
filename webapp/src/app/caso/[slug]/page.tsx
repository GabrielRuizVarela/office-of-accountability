/**
 * Investigation landing page — routes to case-specific content based on slug.
 */

import { getStats, getActors, getDocuments } from '@/lib/caso-libra'

import { CasoLandingContent } from './CasoLandingContent'
import { OverviewContent } from './OverviewContent'

const EPSTEIN_STATS = [
  { label: 'Persons', value: '355', color: '#ef4444' },
  { label: 'Events', value: '27', color: '#f59e0b' },
  { label: 'Documents', value: '1,044', color: '#3b82f6' },
  { label: 'Legal Cases', value: '12', color: '#10b981' },
] as const

export default async function CasoLandingPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (slug === 'caso-epstein') {
    return <OverviewContent slug={slug} stats={EPSTEIN_STATS} />
  }

  const [_stats, actors, documents] = await Promise.all([getStats(), getActors(), getDocuments()])

  return <CasoLandingContent slug={slug} actors={actors} documents={documents} />
}

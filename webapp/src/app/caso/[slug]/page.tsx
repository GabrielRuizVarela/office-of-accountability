import type { Metadata } from 'next'

import { CASO_EPSTEIN_SLUG } from '../../../lib/caso-epstein/types'
import { getActors, getTimeline, getDocuments, getLegalCases } from '../../../lib/caso-epstein/queries'
import { OverviewContent } from './OverviewContent'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  return {
    title: 'Epstein Investigation — Network Analysis',
    description:
      'Interactive investigation into the Jeffrey Epstein network — 7,287 connected nodes, 21,944 verified relationships, 355 web-verified persons, 72 factchecked claims, 4,153 flights spanning 1991–2019, quality score 8.5/10. Explore connections between persons, organizations, locations, and events through court records, DOJ file releases, flight logs, and investigative reporting.',
  }
}

export default async function CasoLandingPage({ params }: PageProps) {
  const { slug } = await params

  const [actors, timeline, documents, legalCases] = await Promise.all([
    getActors(CASO_EPSTEIN_SLUG),
    getTimeline(CASO_EPSTEIN_SLUG),
    getDocuments(CASO_EPSTEIN_SLUG),
    getLegalCases(CASO_EPSTEIN_SLUG),
  ])

  const stats = [
    { label: 'Persons', value: actors.length, color: '#3b82f6' },
    { label: 'Events', value: timeline.length, color: '#f59e0b' },
    { label: 'Documents', value: documents.length, color: '#ef4444' },
    { label: 'Legal Cases', value: legalCases.length, color: '#ec4899' },
  ]

  return <OverviewContent slug={slug} stats={stats} />
}

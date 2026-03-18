import type { Metadata } from 'next'
import Link from 'next/link'

import { KeyStats } from '../../../components/investigation/KeyStats'
import { CASO_EPSTEIN_SLUG } from '../../../lib/caso-epstein/types'
import { getActors, getTimeline, getDocuments, getLegalCases } from '../../../lib/caso-epstein/queries'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  return {
    title: 'Epstein Investigation — Network Analysis',
    description:
      'Interactive investigation into the Jeffrey Epstein network. Explore connections between people, organizations, locations, and events through public court records and verified reporting.',
  }
}

interface EntryCard {
  readonly title: string
  readonly description: string
  readonly href: string
  readonly color: string
}

export default async function CasoLandingPage({ params }: PageProps) {
  const { slug } = await params
  const basePath = `/caso/${slug}`

  // Fetch data in parallel
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

  const entryCards: EntryCard[] = [
    {
      title: 'Network Graph',
      description: 'Explore the full network of connections between people, organizations, locations, and events.',
      href: `${basePath}/grafo`,
      color: '#3b82f6',
    },
    {
      title: 'Timeline',
      description: 'Follow the chronological progression from the first investigation to document releases.',
      href: `${basePath}/cronologia`,
      color: '#f59e0b',
    },
    {
      title: 'Flight Records',
      description: 'Visualize flight logs with passengers, routes, and connections to key locations.',
      href: `${basePath}/vuelos`,
      color: '#f97316',
    },
    {
      title: 'Evidence',
      description: 'Browse court filings, depositions, flight logs, and investigative reports.',
      href: `${basePath}/evidencia`,
      color: '#ef4444',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
          Epstein Investigation
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">
          An interactive, open-source investigation into the Jeffrey Epstein network. Built from public court records, government filings, flight logs, and verified investigative reporting.
        </p>
      </div>

      {/* Key Stats */}
      <div className="mb-12">
        <KeyStats stats={stats} />
      </div>

      {/* Entry Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {entryCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
          >
            <h2
              className="text-lg font-semibold transition-colors group-hover:text-blue-400"
              style={{ color: card.color }}
            >
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

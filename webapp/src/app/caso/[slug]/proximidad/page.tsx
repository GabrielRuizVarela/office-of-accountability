import type { Metadata } from 'next'

import { ProximityPanel } from '../../../../components/investigation/ProximityPanel'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Proximity Analysis',
  description: 'Analyze where and when persons of interest overlap in locations, events, and documents.',
}

export default async function ProximidadPage({ params }: PageProps) {
  const { slug } = await params

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-50">Proximity & Temporal Alignment</h1>
      <p className="mb-8 text-sm text-zinc-400">
        Select 2-3 persons to analyze where and when their timelines overlap across locations, events, and documents.
      </p>
      <ProximityPanel casoSlug={slug} />
    </div>
  )
}

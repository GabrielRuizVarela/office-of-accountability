import type { Metadata } from 'next'

import { SimulationPanel } from '../../../../../components/investigation/SimulationPanel'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Simulation',
  description: 'AI-powered network analysis using swarm intelligence.',
}

export default async function SimulacionPage({ params }: PageProps) {
  const { slug } = await params

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <SimulationPanel casoSlug={slug} />
    </div>
  )
}

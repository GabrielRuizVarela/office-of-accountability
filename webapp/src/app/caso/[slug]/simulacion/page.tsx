import type { Metadata } from 'next'

import { detectLang } from '@/lib/i18n'
import { SimulationPanel } from '../../../../components/investigation/SimulationPanel'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await detectLang()
  return {
    title: lang === 'es' ? 'Simulacion' : 'Simulation',
    description:
      lang === 'es'
        ? 'Analisis de redes con inteligencia de enjambre MiroFish.'
        : 'AI-powered network analysis using MiroFish swarm intelligence.',
  }
}

export default async function SimulacionPage({ params }: PageProps) {
  const { slug } = await params

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <SimulationPanel casoSlug={slug} />
    </div>
  )
}

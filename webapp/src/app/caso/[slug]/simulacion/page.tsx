import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { detectLang } from '@/lib/i18n'
import type { Lang } from '@/lib/language-context'
import { SimulationPanel } from '../../../../components/investigation/SimulationPanel'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

const PAGE_META: Record<Lang, { title: string; description: string }> = {
  es: {
    title: 'Simulación',
    description: 'Análisis de redes impulsado por IA usando inteligencia de enjambre MiroFish.',
  },
  en: {
    title: 'Simulation',
    description: 'AI-powered network analysis using MiroFish swarm intelligence.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const lang = detectLang(h.get('accept-language'))
  const meta = PAGE_META[lang]
  return { title: meta.title, description: meta.description }
}

export default async function SimulacionPage({ params }: PageProps) {
  const { slug } = await params

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <SimulationPanel casoSlug={slug} />
    </div>
  )
}

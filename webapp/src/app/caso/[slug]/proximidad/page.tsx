import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { detectLang } from '@/lib/i18n'
import type { Lang } from '@/lib/language-context'
import { ProximityPanel } from '../../../../components/investigation/ProximityPanel'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

const PAGE_META: Record<Lang, { title: string; description: string }> = {
  es: {
    title: 'Análisis de Proximidad',
    description: 'Analizar dónde y cuándo personas de interés coinciden en ubicaciones, eventos y documentos.',
  },
  en: {
    title: 'Proximity Analysis',
    description: 'Analyze where and when persons of interest overlap in locations, events, and documents.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const lang = detectLang(h.get('accept-language'))
  const meta = PAGE_META[lang]
  return { title: meta.title, description: meta.description }
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

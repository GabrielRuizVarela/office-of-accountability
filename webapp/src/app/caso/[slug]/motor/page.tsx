import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { detectLang } from '@/lib/i18n'
import type { Lang } from '@/lib/language-context'
import { EngineDashboard } from '../../../../components/engine/EngineDashboard'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

const PAGE_META: Record<Lang, { title: string; description: string }> = {
  es: {
    title: 'Motor de Investigación',
    description: 'Panel de control del motor de investigación autónomo - pipeline, propuestas, auditoría y snapshots.',
  },
  en: {
    title: 'Investigation Engine',
    description: 'Autonomous investigation engine dashboard - pipeline, proposals, audit trail and snapshots.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const lang = detectLang(h.get('accept-language'))
  const meta = PAGE_META[lang]
  return { title: meta.title, description: meta.description }
}

export default async function MotorPage({ params }: PageProps) {
  const { slug } = await params

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <EngineDashboard casoSlug={slug} />
    </div>
  )
}

import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { detectLang } from '@/lib/i18n'
import type { Lang } from '@/lib/language-context'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

const PAGE_META: Record<Lang, { title: string; description: string }> = {
  es: {
    title: 'Análisis',
    description: 'Análisis de redes impulsado por IA.',
  },
  en: {
    title: 'Analysis',
    description: 'AI-powered network analysis.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const lang = detectLang(h.get('accept-language'))
  const meta = PAGE_META[lang]
  return { title: meta.title, description: meta.description }
}

export default async function SimulacionPage({ params }: PageProps) {
  const { slug: _slug } = await params

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center">
      <p className="text-zinc-500">Coming soon.</p>
    </div>
  )
}

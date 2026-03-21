/**
 * Caso landing page — investigation overview with stats,
 * entry points, actor grid, and latest documents.
 */

import type { Metadata } from 'next'

import { detectLang } from '@/lib/i18n'
import { getStats, getActors, getDocuments } from '@/lib/caso-libra'

import { CasoLandingContent } from './CasoLandingContent'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await detectLang()
  return {
    title: lang === 'es' ? 'Vista General' : 'Overview',
    description:
      lang === 'es'
        ? 'Resumen de la investigacion: estadisticas, actores clave y documentos recientes.'
        : 'Investigation overview: stats, key actors, and recent documents.',
  }
}


export default async function CasoLandingPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [_stats, actors, documents] = await Promise.all([getStats(), getActors(), getDocuments()])

  return <CasoLandingContent slug={slug} actors={actors} documents={documents} />
}

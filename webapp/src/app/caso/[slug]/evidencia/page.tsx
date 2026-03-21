/**
 * Evidence/documents list page for Caso Libra.
 */

import type { Metadata } from 'next'

import { detectLang } from '@/lib/i18n'
import { getDocuments } from '@/lib/caso-libra'

import { EvidenciaContent } from './EvidenciaContent'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await detectLang()
  return {
    title: lang === 'es' ? 'Evidencia' : 'Evidence',
    description:
      lang === 'es'
        ? 'Documentos judiciales, informes y fuentes de la investigacion.'
        : 'Court documents, reports, and investigation sources.',
  }
}

export default async function EvidenciaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const documents = await getDocuments()

  return <EvidenciaContent slug={slug} documents={documents} />
}

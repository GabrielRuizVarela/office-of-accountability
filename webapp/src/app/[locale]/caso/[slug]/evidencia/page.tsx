/**
 * Evidence/documents list page — routes to correct data source based on slug.
 */

import { getDocuments } from '@/lib/caso-libra'
import { getNuclearSources } from '@/lib/caso-nuclear-risk'

import { EvidenciaContent } from './EvidenciaContent'

export default async function EvidenciaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (slug === 'riesgo-nuclear') {
    const documents = await getNuclearSources()
    return <EvidenciaContent slug={slug} documents={documents} />
  }

  const documents = await getDocuments()
  return <EvidenciaContent slug={slug} documents={documents} />
}

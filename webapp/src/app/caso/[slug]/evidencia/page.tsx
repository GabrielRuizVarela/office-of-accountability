/**
 * Evidence/documents list page for an investigation.
 */

import { getQueryBuilder } from '@/lib/investigations/query-builder'

import { EvidenciaContent } from './EvidenciaContent'

export default async function EvidenciaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const qb = getQueryBuilder()
  const nodes = await qb.getNodesByType(slug, 'Document')
  const documents = nodes.map(n => n.properties)

  return <EvidenciaContent slug={slug} documents={documents} />
}

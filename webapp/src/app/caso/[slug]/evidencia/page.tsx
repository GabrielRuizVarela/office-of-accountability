/**
 * Evidence/documents list page — works for any investigation case.
 */

import { getQueryBuilder } from '@/lib/investigations/query-builder'

import { EvidenciaContent } from './EvidenciaContent'

export default async function EvidenciaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const nodes = await getQueryBuilder().getNodesByType(slug, 'Document', { limit: 200 })
  const documents = nodes.map((n) => ({ id: n.id, slug: n.slug, ...n.properties }))

  return <EvidenciaContent slug={slug} documents={documents} />
}

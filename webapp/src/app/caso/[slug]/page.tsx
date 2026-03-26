/**
 * Case landing page - investigation overview with actor grid and latest documents.
 */

import { getQueryBuilder } from '@/lib/investigations/query-builder'

import { CasoLandingContent } from './CasoLandingContent'

export default async function CasoLandingPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const qb = getQueryBuilder()
  const [actorNodes, docNodes] = await Promise.all([
    qb.getNodesByType(slug, 'Person', { limit: 20 }),
    qb.getNodesByType(slug, 'Document', { limit: 10 }),
  ])
  const actors = actorNodes.map((n) => ({ id: n.id, slug: n.slug, ...n.properties }))
  const documents = docNodes.map((n) => ({ id: n.id, slug: n.slug, ...n.properties }))

  return <CasoLandingContent slug={slug} actors={actors} documents={documents} />
}

/**
 * Investigation landing page — overview with actor grid and latest documents.
 * Works for any registered investigation via the generic query builder.
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
  const [actors, documents] = await Promise.all([
    qb.getNodesByType(slug, 'Person'),
    qb.getNodesByType(slug, 'Document'),
  ])

  return (
    <CasoLandingContent
      slug={slug}
      actors={actors.map((n) => n.properties)}
      documents={documents.map((n) => n.properties)}
    />
  )
}

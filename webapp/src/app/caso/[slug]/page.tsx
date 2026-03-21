/**
 * Caso Libra landing page — investigation overview with stats,
 * entry points, actor grid, and latest documents.
 */

import { getStats, getActors, getDocuments } from '@/lib/caso-libra'

import { CasoLandingContent } from './CasoLandingContent'

export default async function CasoLandingPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [_stats, actors, documents] = await Promise.all([getStats(slug), getActors(slug), getDocuments(slug)])

  return <CasoLandingContent slug={slug} actors={actors} documents={documents} />
}

/**
 * Evidence/documents list page — routes to case-specific content based on slug.
 */

import { getDocuments } from '@/lib/caso-libra'

import { EvidenciaContent } from './EvidenciaContent'
import { EpsteinEvidenciaContent } from './EpsteinEvidenciaContent'

export default async function EvidenciaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (slug === 'caso-epstein') {
    return <EpsteinEvidenciaContent slug={slug} />
  }

  const documents = await getDocuments()

  return <EvidenciaContent slug={slug} documents={documents} />
}

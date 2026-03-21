/**
 * Evidence/documents list page for Caso Libra.
 */

import { getDocuments } from '@/lib/caso-libra'

import { EvidenciaContent } from './EvidenciaContent'

export default async function EvidenciaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const documents = await getDocuments()

  return <EvidenciaContent slug={slug} documents={documents} />
}

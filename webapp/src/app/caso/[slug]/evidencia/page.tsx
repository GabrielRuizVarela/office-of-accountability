import type { Metadata } from 'next'

import { EvidenceExplorer } from '../../../../components/investigation/EvidenceExplorer'
import { CASO_EPSTEIN_SLUG } from '../../../../lib/caso-epstein/types'
import { getDocuments } from '../../../../lib/caso-epstein/queries'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Evidence',
  description:
    'Court filings, depositions, flight logs, and investigative reports from the Epstein investigation.',
}

export default async function EvidenciaPage({ params }: PageProps) {
  const { slug } = await params
  const documents = await getDocuments(CASO_EPSTEIN_SLUG)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-50">Evidence</h1>
      <p className="mb-8 text-sm text-zinc-400">
        {documents.length} documents from court filings, government records, and verified
        investigative reporting.
      </p>

      <EvidenceExplorer documents={documents} casoSlug={slug} />
    </div>
  )
}

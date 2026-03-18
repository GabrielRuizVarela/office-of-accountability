import type { Metadata } from 'next'

import { DocumentCard } from '../../../../components/investigation/DocumentCard'
import { CASO_EPSTEIN_SLUG } from '../../../../lib/caso-epstein/types'
import { getDocuments } from '../../../../lib/caso-epstein/queries'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Evidence',
  description: 'Court filings, depositions, flight logs, and investigative reports from the Epstein investigation.',
}

export default async function EvidenciaPage({ params }: PageProps) {
  const { slug } = await params
  const documents = await getDocuments(CASO_EPSTEIN_SLUG)

  // Group by doc_type
  const grouped = new Map<string, typeof documents>()
  for (const doc of documents) {
    const group = grouped.get(doc.doc_type) ?? []
    group.push(doc)
    grouped.set(doc.doc_type, group)
  }

  const typeLabels: Record<string, string> = {
    court_filing: 'Court Filings',
    deposition: 'Depositions',
    fbi: 'FBI Records',
    flight_log: 'Flight Logs',
    police_report: 'Police Reports',
    financial: 'Financial Records',
    media_investigation: 'Investigative Journalism',
    medical: 'Medical Records',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-50">Evidence</h1>
      <p className="mb-8 text-sm text-zinc-400">
        {documents.length} documents from court filings, government records, and verified investigative reporting.
      </p>

      <div className="space-y-8">
        {[...grouped.entries()].map(([docType, docs]) => (
          <div key={docType}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              {typeLabels[docType] ?? docType} ({docs.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {docs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  slug={doc.slug}
                  docType={doc.doc_type}
                  summary={doc.summary}
                  sourceUrl={doc.source_url}
                  casoSlug={slug}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

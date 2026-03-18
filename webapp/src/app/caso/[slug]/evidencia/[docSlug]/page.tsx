import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CASO_EPSTEIN_SLUG } from '../../../../../lib/caso-epstein/types'
import { getDocuments } from '../../../../../lib/caso-epstein/queries'

interface PageProps {
  readonly params: Promise<{ slug: string; docSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { docSlug } = await params
  const documents = await getDocuments(CASO_EPSTEIN_SLUG)
  const doc = documents.find((d) => d.slug === docSlug)
  if (!doc) return { title: 'Document Not Found' }

  return {
    title: doc.title,
    description: doc.summary,
  }
}

const TYPE_LABELS: Record<string, string> = {
  court_filing: 'Court Filing',
  deposition: 'Deposition',
  fbi: 'FBI Record',
  flight_log: 'Flight Log',
  police_report: 'Police Report',
  financial: 'Financial Record',
  media_investigation: 'Investigative Journalism',
  medical: 'Medical Record',
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { slug, docSlug } = await params
  const documents = await getDocuments(CASO_EPSTEIN_SLUG)
  const doc = documents.find((d) => d.slug === docSlug)

  if (!doc) return notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
        <Link href={`/caso/${slug}`} className="hover:text-zinc-300">
          Investigation
        </Link>
        <span>/</span>
        <Link href={`/caso/${slug}/evidencia`} className="hover:text-zinc-300">
          Evidence
        </Link>
        <span>/</span>
        <span className="text-zinc-300">{doc.title}</span>
      </div>

      {/* Document header */}
      <div className="mb-6">
        <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
          {TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
        </span>
        <h1 className="mt-3 text-2xl font-bold text-zinc-50">{doc.title}</h1>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-2 text-sm font-semibold text-zinc-300">Summary</h2>
        <p className="text-sm leading-relaxed text-zinc-400">{doc.summary}</p>
      </div>

      {/* Source link */}
      {doc.source_url && (
        <div className="mt-4">
          <a
            href={doc.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"
          >
            View original source →
          </a>
        </div>
      )}
    </div>
  )
}

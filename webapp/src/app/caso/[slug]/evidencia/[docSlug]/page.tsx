import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CASO_EPSTEIN_SLUG, DOCUMENT_TYPE_LABELS } from '../../../../../lib/caso-epstein/types'
import { getDocumentBySlug } from '../../../../../lib/caso-epstein/queries'
import { DocumentCard } from '../../../../../components/investigation/DocumentCard'

interface PageProps {
  readonly params: Promise<{ slug: string; docSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { docSlug } = await params
  const result = await getDocumentBySlug(CASO_EPSTEIN_SLUG, docSlug)
  if (!result) return { title: 'Document Not Found' }

  return {
    title: result.document.title,
    description: result.document.summary,
  }
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { slug, docSlug } = await params
  const result = await getDocumentBySlug(CASO_EPSTEIN_SLUG, docSlug)

  if (!result) return notFound()

  const { document: doc, mentionedPersons, legalCases, relatedEvents, relatedDocuments } = result

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
        <Link href={`/caso/${slug}`} className="hover:text-zinc-300">Investigation</Link>
        <span>/</span>
        <Link href={`/caso/${slug}/evidencia`} className="hover:text-zinc-300">Evidence</Link>
        <span>/</span>
        <span className="text-zinc-300">{doc.title}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
            {DOCUMENT_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
          </span>
          {doc.date && (
            <span className="text-xs text-zinc-500">{doc.date}</span>
          )}
          {doc.page_count && (
            <span className="text-xs text-zinc-500">{doc.page_count} pages</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-zinc-50">{doc.title}</h1>
      </div>

      {/* Summary */}
      <p className="mb-6 text-sm leading-relaxed text-zinc-400">{doc.summary}</p>

      {/* Key Findings */}
      {doc.key_findings.length > 0 && (
        <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">Key Findings</h2>
          <ul className="space-y-2">
            {doc.key_findings.map((finding, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Excerpt */}
      {doc.excerpt && (
        <blockquote className="mb-6 border-l-2 border-zinc-700 pl-4 text-sm italic text-zinc-500">
          &ldquo;{doc.excerpt}&rdquo;
        </blockquote>
      )}

      {/* Graph connections */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {/* People Mentioned */}
        {mentionedPersons.length > 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-300">People Mentioned</h2>
            <div className="flex flex-wrap gap-2">
              {mentionedPersons.map((person) => (
                <Link
                  key={person.id}
                  href={`/caso/${slug}/grafo?highlight=${person.slug}`}
                  className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400 hover:bg-blue-500/20"
                >
                  {person.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filed In */}
        {legalCases.length > 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-300">Filed In</h2>
            <div className="space-y-2">
              {legalCases.map((lc) => (
                <div key={lc.id} className="text-sm">
                  <div className="font-medium text-zinc-300">{lc.title}</div>
                  <div className="text-xs text-zinc-500">{lc.court} — {lc.case_number}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">Related Events</h2>
          <div className="space-y-2">
            {relatedEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 text-xs text-zinc-500">{event.date}</span>
                <span className="text-zinc-400">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Documents */}
      {relatedDocuments.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">Related Documents</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedDocuments.map((relDoc) => (
              <DocumentCard
                key={relDoc.id}
                title={relDoc.title}
                slug={relDoc.slug}
                docType={relDoc.doc_type}
                summary={relDoc.summary}
                date={relDoc.date}
                mentionedPersonCount={0}
                casoSlug={slug}
              />
            ))}
          </div>
        </div>
      )}

      {/* Source link */}
      {doc.source_url && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
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

'use client'

/**
 * Document/signal detail page — routes based on investigation slug.
 */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'

import { ShareButton } from '@/components/ui/ShareButton'

interface DocumentData {
  readonly document: Record<string, unknown>
  readonly mentionedEntities: readonly {
    readonly id: string
    readonly name: string
    readonly type: string
  }[]
}

export default function DocumentDetailPage() {
  const params = useParams()
  const docSlug = params.docSlug as string
  const slug = params.slug as string

  const [data, setData] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        // Route to the correct API based on investigation
        const apiUrl = slug === 'riesgo-nuclear'
          ? `/api/caso/riesgo-nuclear/signal/${docSlug}`
          : `/api/caso-libra/document/${docSlug}`

        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error('Not found')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [docSlug, slug])

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-zinc-500">Loading...</div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-red-400">
        {error ?? 'Not found'}
      </div>
    )
  }

  const doc = data.document
  const docTitle = String(doc.title_en ?? doc.title ?? '')
  const docType = doc.signal_type ?? doc.doc_type ? String(doc.signal_type ?? doc.doc_type) : null
  const datePublished = doc.date ?? doc.date_published ? String(doc.date ?? doc.date_published) : null
  const summary = doc.summary_en ?? doc.summary ? String(doc.summary_en ?? doc.summary) : null
  const sourceUrl = doc.source_url ? String(doc.source_url) : null
  const severity = typeof doc.severity === 'number' ? doc.severity : null
  const escalationLevel = doc.escalation_level ? String(doc.escalation_level) : null
  const theater = doc.theater ? String(doc.theater) : null

  const isNuclear = slug === 'riesgo-nuclear'
  const accent = isNuclear ? 'yellow' : 'purple'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          {docType && (
            <span className="inline-block rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {docType}
            </span>
          )}
          {escalationLevel && (
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              escalationLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
              escalationLevel === 'serious' ? 'bg-orange-500/20 text-orange-400' :
              escalationLevel === 'elevated' ? 'bg-yellow-500/20 text-yellow-400' :
              escalationLevel === 'notable' ? 'bg-blue-500/20 text-blue-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {escalationLevel}
            </span>
          )}
          {theater && (
            <span className="inline-block rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {theater}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-zinc-50">{docTitle}</h1>
        {datePublished && <p className="mt-1 text-sm text-zinc-500">{datePublished}</p>}
        {severity != null && (
          <p className="mt-1 text-sm text-zinc-500">
            Severity: <span className={`font-medium text-${accent}-400`}>{severity}/100</span>
          </p>
        )}
      </div>

      {summary && <p className="text-sm leading-relaxed text-zinc-300">{summary}</p>}

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 text-sm text-${accent}-400 hover:text-${accent}-300`}
        >
          View original source &rarr;
        </a>
      )}

      <ShareButton text={docTitle} title={docTitle} />

      {/* Connected entities */}
      {data.mentionedEntities.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-zinc-50">
            {isNuclear ? 'Involved Actors' : 'Mentioned Entities'}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.mentionedEntities.map((entity) => (
              <span
                key={entity.id}
                className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
              >
                {entity.name}
                <span className="ml-1 text-zinc-600">({entity.type})</span>
              </span>
            ))}
          </div>
        </section>
      )}

      <Link
        href={`/caso/${slug}/evidencia`}
        className="inline-block text-sm text-zinc-400 hover:text-zinc-200"
      >
        &larr; Back to {isNuclear ? 'sources' : 'evidence'}
      </Link>
    </div>
  )
}

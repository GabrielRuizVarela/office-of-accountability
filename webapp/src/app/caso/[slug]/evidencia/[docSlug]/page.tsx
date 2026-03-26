'use client'

/**
 * Document detail page - full summary, source link, connected entities.
 */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

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
        const res = await fetch(`/api/caso/${slug}/document/${docSlug}`)
        if (!res.ok) throw new Error('Documento no encontrado')
        const json = await res.json()
        setData(json.data ?? json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, docSlug])

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-zinc-500">Cargando...</div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-red-400">
        {error ?? 'No encontrado'}
      </div>
    )
  }

  const doc = data.document
  const docTitle = String(doc.title ?? '')
  const docType = doc.doc_type ? String(doc.doc_type) : null
  const datePublished = doc.date_published ? String(doc.date_published) : null
  const summary = doc.summary ? String(doc.summary) : null
  const sourceUrl = doc.source_url ? String(doc.source_url) : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        {docType && (
          <span className="mb-2 inline-block rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {docType}
          </span>
        )}
        <h1 className="text-2xl font-bold text-zinc-50">{docTitle}</h1>
        {datePublished && <p className="mt-1 text-sm text-zinc-500">Publicado: {datePublished}</p>}
      </div>

      {summary && <p className="text-sm leading-relaxed text-zinc-300">{summary}</p>}

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
        >
          Ver fuente original &rarr;
        </a>
      )}

      <ShareButton text={`Caso Libra - ${docTitle}`} title={docTitle} />

      {/* Connected entities */}
      {data.mentionedEntities.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-zinc-50">Entidades Mencionadas</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.mentionedEntities.map((entity) => (
              <span
                key={entity.id}
                className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
              >
                {entity.name}
                <span className="ml-1 text-zinc-600">({entityTypeLabel(entity.type)})</span>
              </span>
            ))}
          </div>
        </section>
      )}

      <Link
        href={`/caso/${slug}/evidencia`}
        className="inline-block text-sm text-zinc-400 hover:text-zinc-200"
      >
        &larr; Volver a evidencia
      </Link>
    </div>
  )
}

function entityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    Person: 'Persona',
    Organization: 'Organizacion',
    Location: 'Ubicacion',
    Event: 'Evento',
    Document: 'Documento',
    LegalCase: 'Caso Legal',
    Flight: 'Vuelo',
    Wallet: 'Billetera',
    Token: 'Token',
  }
  return labels[type] ?? type
}

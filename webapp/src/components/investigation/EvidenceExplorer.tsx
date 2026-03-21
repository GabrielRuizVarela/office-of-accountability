'use client'

import { useState, useMemo } from 'react'
import { DocumentCard } from './DocumentCard'
import { DOCUMENT_TYPE_LABELS_PLURAL } from '../../lib/caso-epstein/types'
import type { EpsteinDocumentWithCount, DocumentType } from '../../lib/caso-epstein/types'

interface EvidenceExplorerProps {
  readonly documents: EpsteinDocumentWithCount[]
  readonly casoSlug: string
}

export function EvidenceExplorer({ documents, casoSlug }: EvidenceExplorerProps) {
  const [search, setSearch] = useState('')
  const [activeTypes, setActiveTypes] = useState<Set<DocumentType>>(new Set())
  const [tierFilter, setTierFilter] = useState<string>('all')

  const isFiltering = search.length > 0 || activeTypes.size > 0 || tierFilter !== 'all'

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const doc of documents) {
      counts.set(doc.doc_type, (counts.get(doc.doc_type) ?? 0) + 1)
    }
    return counts
  }, [documents])

  const filtered = useMemo(() => {
    let result = documents

    if (activeTypes.size > 0) {
      result = result.filter((d) => activeTypes.has(d.doc_type))
    }

    if (search.length > 0) {
      const q = search.toLowerCase()
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.summary.toLowerCase().includes(q) ||
          d.key_findings.some((f) => f.toLowerCase().includes(q)),
      )
    }

    if (tierFilter === 'verified') {
      result = result.filter((d) => d.confidence_tier !== 'bronze')
    }
    if (tierFilter === 'gold') {
      result = result.filter((d) => !d.confidence_tier || d.confidence_tier === 'gold')
    }

    return result
  }, [documents, search, activeTypes, tierFilter])

  const grouped = useMemo(() => {
    const groups = new Map<string, EpsteinDocumentWithCount[]>()
    for (const doc of filtered) {
      const group = groups.get(doc.doc_type) ?? []
      group.push(doc)
      groups.set(doc.doc_type, group)
    }
    return groups
  }, [filtered])

  const sortedFlat = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered],
  )

  function toggleType(type: DocumentType) {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  return (
    <div>
      {/* Search bar + confidence filter */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded px-2 py-1.5 text-sm"
        >
          <option value="all">All data</option>
          <option value="verified">Verified only</option>
          <option value="gold">Gold only</option>
        </select>
      </div>

      {/* Type filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[...typeCounts.entries()].map(([type, count]) => (
          <button
            key={type}
            onClick={() => toggleType(type as DocumentType)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              activeTypes.has(type as DocumentType)
                ? 'bg-red-500/20 text-red-400'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {DOCUMENT_TYPE_LABELS_PLURAL[type as DocumentType] ?? type} ({count})
          </button>
        ))}
      </div>

      {/* Results count when filtering */}
      {isFiltering && (
        <p className="mb-4 text-xs text-zinc-500">
          {filtered.length} {filtered.length === 1 ? 'document' : 'documents'} found
          {search && (
            <button
              onClick={() => {
                setSearch('')
                setActiveTypes(new Set())
              }}
              className="ml-2 text-blue-400 hover:text-blue-300"
            >
              Clear filters
            </button>
          )}
        </p>
      )}

      {/* Category view (default) or flat view (when filtering) */}
      {isFiltering ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedFlat.map((doc) => (
            <DocumentCard
              key={doc.id}
              title={doc.title}
              slug={doc.slug}
              docType={doc.doc_type}
              summary={doc.summary}
              datePublished={doc.date}
              investigationSlug={casoSlug}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {[...grouped.entries()].map(([docType, docs]) => (
            <div key={docType}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                {DOCUMENT_TYPE_LABELS_PLURAL[docType as DocumentType] ?? docType} ({docs.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {docs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    title={doc.title}
                    slug={doc.slug}
                    docType={doc.doc_type}
                    summary={doc.summary}
                    datePublished={doc.date}
                    investigationSlug={casoSlug}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

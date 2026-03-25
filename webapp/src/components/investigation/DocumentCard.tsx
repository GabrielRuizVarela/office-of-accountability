/**
 * Document card for the evidence grid.
 */

import { Link } from '@/i18n/navigation'

interface DocumentCardProps {
  readonly slug: string
  readonly investigationSlug: string
  readonly title: string
  readonly docType: string
  readonly summary?: string
  readonly datePublished?: string
}

const DOC_TYPE_COLORS: Readonly<Record<string, string>> = {
  'informe-parlamentario': '#3b82f6',
  'analisis-blockchain': '#10b981',
  'articulo-periodistico': '#a855f7',
  'documento-judicial': '#ef4444',
  'registro-publico': '#f59e0b',
}

export function DocumentCard({
  slug,
  investigationSlug,
  title,
  docType,
  summary,
  datePublished,
}: DocumentCardProps) {
  const color = DOC_TYPE_COLORS[docType] ?? '#6b7280'

  return (
    <Link
      href={`/caso/${investigationSlug}/evidencia/${slug}`}
      className="group flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {docType}
        </span>
        {datePublished && (
          <time className="text-[10px] text-zinc-500" dateTime={datePublished}>
            {datePublished}
          </time>
        )}
      </div>
      <h3 className="mt-2 text-sm font-semibold leading-snug text-zinc-100 group-hover:text-purple-400">
        {title}
      </h3>
      {summary && (
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-zinc-400">{summary}</p>
      )}
    </Link>
  )
}

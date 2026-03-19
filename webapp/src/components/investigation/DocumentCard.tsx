import Link from 'next/link'
import { DOCUMENT_TYPE_LABELS } from '../../lib/caso-epstein/types'

interface DocumentCardProps {
  readonly title: string
  readonly slug: string
  readonly docType: string
  readonly summary: string
  readonly date: string
  readonly mentionedPersonCount: number
  readonly casoSlug: string
}

export function DocumentCard({
  title,
  slug,
  docType,
  summary,
  date,
  mentionedPersonCount,
  casoSlug,
}: DocumentCardProps) {
  return (
    <Link
      href={`/caso/${casoSlug}/evidencia/${slug}`}
      className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
          {DOCUMENT_TYPE_LABELS[docType as keyof typeof DOCUMENT_TYPE_LABELS] ?? docType}
        </span>
        {date && (
          <span className="text-[10px] text-zinc-500">{date}</span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400">
        {title}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-500">
        {summary}
      </p>
      {mentionedPersonCount > 0 && (
        <p className="mt-2 text-[10px] text-zinc-600">
          {mentionedPersonCount} {mentionedPersonCount === 1 ? 'person' : 'persons'} mentioned
        </p>
      )}
    </Link>
  )
}

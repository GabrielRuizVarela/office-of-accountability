import Link from 'next/link'

interface DocumentCardProps {
  readonly title: string
  readonly slug: string
  readonly docType: string
  readonly summary: string
  readonly sourceUrl: string
  readonly casoSlug: string
}

const TYPE_LABELS: Record<string, string> = {
  court_filing: 'Court Filing',
  deposition: 'Deposition',
  fbi: 'FBI Record',
  flight_log: 'Flight Log',
  police_report: 'Police Report',
  financial: 'Financial Record',
  media_investigation: 'Investigation',
  medical: 'Medical Record',
}

export function DocumentCard({ title, slug, docType, summary, sourceUrl, casoSlug }: DocumentCardProps) {
  return (
    <Link
      href={`/caso/${casoSlug}/evidencia/${slug}`}
      className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
          {TYPE_LABELS[docType] ?? docType}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400">
        {title}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-500">
        {summary}
      </p>
    </Link>
  )
}

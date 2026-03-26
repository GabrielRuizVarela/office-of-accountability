'use client'

import { useLanguage } from '@/lib/language-context'
import { TIMELINE_EVENTS } from '@/lib/caso-monopolios/investigation-data'

const SECTOR_COLORS: Record<string, string> = {
  telecom: '#3b82f6',
  energy: '#f59e0b',
  food: '#10b981',
  media: '#a855f7',
  banking: '#06b6d4',
  mining: '#ef4444',
  agroexport: '#84cc16',
  construction: '#f97316',
  pharma: '#ec4899',
  transport: '#6366f1',
  cross_sector: '#71717a',
  regulatory_capture: '#dc2626',
}

function formatDate(dateStr: string, lang: 'en' | 'es'): string {
  const locale = lang === 'es' ? 'es-AR' : 'en-US'
  if (/^\d{4}$/.test(dateStr)) return dateStr
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function CronologiaPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-100">
        {lang === 'es' ? 'Cronologia' : 'Timeline'}
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        {lang === 'es'
          ? 'Desde las privatizaciones de 1989 hasta la venta de Telefe en 2025. Las mismas familias aparecen en cada punto de inflexión.'
          : 'From the 1989 privatizations to the 2025 Telefe sale. The same families appear at every turning point.'}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {TIMELINE_EVENTS.length} {lang === 'es' ? 'eventos documentados' : 'documented events'}
      </p>

      <div className="mt-8 space-y-0">
        {TIMELINE_EVENTS.map((event, i) => (
          <div key={event.id} className="relative flex gap-4 pb-8">
            {/* Timeline line */}
            {i < TIMELINE_EVENTS.length - 1 && (
              <div className="absolute left-[7px] top-4 h-full w-px bg-zinc-800" />
            )}
            {/* Dot */}
            <div
              className="mt-1.5 h-4 w-4 shrink-0 rounded-full border-2 border-zinc-800"
              style={{ backgroundColor: SECTOR_COLORS[event.category] ?? '#71717a' }}
            />
            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono text-zinc-500">
                  {formatDate(event.date, lang)}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase"
                  style={{
                    backgroundColor: (SECTOR_COLORS[event.category] ?? '#71717a') + '22',
                    color: SECTOR_COLORS[event.category] ?? '#71717a',
                  }}
                >
                  {event.category}
                </span>
              </div>
              <h3 className="mt-1 text-sm font-semibold text-zinc-200">
                {lang === 'es' ? event.title_es : event.title_en}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {lang === 'es' ? event.description_es : event.description_en}
              </p>
              {/* Source link */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-zinc-600">{event.sources.join(', ')}</span>
                {event.source_url && (
                  <a
                    href={event.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-amber-500/70 underline decoration-amber-500/30 hover:text-amber-400"
                  >
                    {lang === 'es' ? 'fuente' : 'source'} ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

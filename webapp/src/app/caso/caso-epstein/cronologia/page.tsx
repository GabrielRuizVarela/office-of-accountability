/**
 * Caso Epstein — Cronologia (full timeline page).
 *
 * Vertical timeline layout with category-colored badges,
 * built from TIMELINE_EVENTS in investigation-data.ts.
 * Uses _es fields for Spanish content.
 */

import Link from 'next/link'

import {
  TIMELINE_EVENTS,
  type InvestigationCategory,
} from '@/lib/caso-epstein/investigation-data'

// ---------------------------------------------------------------------------
// Category badge config
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG: Record<
  InvestigationCategory,
  { label: string; cls: string; dotCls: string }
> = {
  political: {
    label: 'Politico',
    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dotCls: 'border-blue-500',
  },
  financial: {
    label: 'Financiero',
    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotCls: 'border-emerald-500',
  },
  legal: {
    label: 'Legal',
    cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dotCls: 'border-amber-500',
  },
  media: {
    label: 'Medios',
    cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dotCls: 'border-purple-500',
  },
  coverup: {
    label: 'Encubrimiento',
    cls: 'bg-red-500/15 text-red-400 border-red-500/30',
    dotCls: 'border-red-500',
  },
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CronologiaPage() {
  // Group events by year for visual organization
  const eventsByYear = new Map<string, typeof TIMELINE_EVENTS>()
  for (const event of TIMELINE_EVENTS) {
    const year = event.date.slice(0, 4)
    const existing = eventsByYear.get(year) ?? []
    existing.push(event)
    eventsByYear.set(year, existing)
  }

  const years = [...eventsByYear.keys()].sort()

  return (
    <div className="space-y-12 pb-16">
      {/* --------------------------------------------------------------- */}
      {/* Header                                                          */}
      {/* --------------------------------------------------------------- */}
      <header className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-red-400">
          Cronologia completa
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          Caso Epstein: Linea de tiempo
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
          {TIMELINE_EVENTS.length} eventos documentados desde los primeros abusos hasta las
          condenas, los documentos desclasificados y los arrestos internacionales de 2026.
        </p>
      </header>

      {/* --------------------------------------------------------------- */}
      {/* Category legend                                                  */}
      {/* --------------------------------------------------------------- */}
      <div className="flex flex-wrap justify-center gap-3">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <span
            key={key}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.cls}`}
          >
            {config.label}
          </span>
        ))}
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Timeline                                                         */}
      {/* --------------------------------------------------------------- */}
      <div className="relative mx-auto max-w-3xl">
        {years.map((year) => {
          const events = eventsByYear.get(year)!
          return (
            <section key={year} className="mb-12 last:mb-0">
              {/* Year marker */}
              <div className="mb-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-lg font-bold text-red-400">{year}</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              {/* Events in this year */}
              <div className="relative ml-4 border-l-2 border-zinc-800 pl-6">
                {events.map((event) => {
                  const catConfig = CATEGORY_CONFIG[event.category]
                  return (
                    <div key={event.id} className="relative mb-8 last:mb-0">
                      {/* Timeline dot — colored by category */}
                      <div
                        className={`absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 bg-zinc-950 ${catConfig.dotCls}`}
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <time className="text-xs font-medium text-zinc-500">
                          {new Date(event.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${catConfig.cls}`}
                        >
                          {catConfig.label}
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-sm font-semibold text-zinc-100">
                        {event.title_es}
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                        {event.description_es}
                      </p>

                      {/* Sources */}
                      {event.sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {event.sources.map((src, i) => (
                            <a
                              key={i}
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-red-400/60 underline decoration-red-400/15 hover:text-red-300"
                            >
                              Fuente {event.sources.length > 1 ? i + 1 : ''}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Navigation                                                       */}
      {/* --------------------------------------------------------------- */}
      <nav className="flex flex-col gap-3 border-t border-zinc-800 pt-8 sm:flex-row">
        <Link
          href="/caso/caso-epstein/resumen"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          &larr; Resumen
        </Link>
        <Link
          href="/caso/caso-epstein/investigacion"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          Investigacion
        </Link>
        <Link
          href="/caso/caso-epstein/evidencia"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          Evidencia &rarr;
        </Link>
      </nav>
    </div>
  )
}

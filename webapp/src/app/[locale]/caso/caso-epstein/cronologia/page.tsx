'use client'
import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/config'

/**
 * Caso Epstein — Timeline (full timeline page).
 *
 * Vertical timeline layout with category-colored badges,
 * built from TIMELINE_EVENTS in investigation-data.ts.
 */

import { Link } from '@/i18n/navigation'

import {
  TIMELINE_EVENTS,
  type InvestigationCategory,
} from '@/lib/caso-epstein/investigation-data'

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const t = {
  headerBadge: { en: 'Full timeline', es: 'Cronologia completa' },
  headerTitle: { en: 'Epstein Case: Timeline', es: 'Caso Epstein: Linea de tiempo' },
  headerDesc: {
    en: (n: number) => `${n} documented events from the earliest abuses through convictions, declassified documents, and the 2026 international arrests.`,
    es: (n: number) => `${n} eventos documentados desde los primeros abusos hasta las condenas, los documentos desclasificados y los arrestos internacionales de 2026.`,
  },
  source: { en: 'Source', es: 'Fuente' },
  navSummary: { en: '\u2190 Summary', es: '\u2190 Resumen' },
  navInvestigation: { en: 'Investigation', es: 'Investigacion' },
  navEvidence: { en: 'Evidence \u2192', es: 'Evidencia \u2192' },
} as const

const CATEGORY_LABELS: Record<InvestigationCategory, Record<Locale, string>> = {
  political: { en: 'Political', es: 'Politico' },
  financial: { en: 'Financial', es: 'Financiero' },
  legal: { en: 'Legal', es: 'Legal' },
  media: { en: 'Media', es: 'Medios' },
  coverup: { en: 'Cover-up', es: 'Encubrimiento' },
}

const CATEGORY_CLS: Record<InvestigationCategory, { cls: string; dotCls: string }> = {
  political: { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dotCls: 'border-blue-500' },
  financial: { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dotCls: 'border-emerald-500' },
  legal: { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dotCls: 'border-amber-500' },
  media: { cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30', dotCls: 'border-purple-500' },
  coverup: { cls: 'bg-red-500/15 text-red-400 border-red-500/30', dotCls: 'border-red-500' },
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CronologiaPage() {
  const locale = useLocale() as Locale

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
      {/* Header */}
      <header className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-red-400">
          {t.headerBadge[locale]}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          {t.headerTitle[locale]}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
          {t.headerDesc[locale](TIMELINE_EVENTS.length)}
        </p>
      </header>

      {/* Category legend */}
      <div className="flex flex-wrap justify-center gap-3">
        {Object.entries(CATEGORY_LABELS).map(([key, labels]) => (
          <span
            key={key}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${CATEGORY_CLS[key as InvestigationCategory].cls}`}
          >
            {labels[locale]}
          </span>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative mx-auto max-w-3xl">
        {years.map((year) => {
          const events = eventsByYear.get(year)!
          return (
            <section key={year} className="mb-12 last:mb-0">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-lg font-bold text-red-400">{year}</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              <div className="relative ml-4 border-l-2 border-zinc-800 pl-6">
                {events.map((event) => {
                  const catCls = CATEGORY_CLS[event.category]
                  return (
                    <div key={event.id} className="relative mb-8 last:mb-0">
                      <div className={`absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 bg-zinc-950 ${catCls.dotCls}`} />

                      <div className="flex flex-wrap items-center gap-2">
                        <time className="text-xs font-medium text-zinc-500">
                          {new Date(event.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${catCls.cls}`}>
                          {CATEGORY_LABELS[event.category][locale]}
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-sm font-semibold text-zinc-100">
                        {locale === 'en' ? event.title_en : event.title_es}
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                        {locale === 'en' ? event.description_en : event.description_es}
                      </p>

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
                              {t.source[locale]} {event.sources.length > 1 ? i + 1 : ''}
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

      {/* Navigation */}
      <nav className="flex flex-col gap-3 border-t border-zinc-800 pt-8 sm:flex-row">
        <Link
          href="/caso/caso-epstein/resumen"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navSummary[locale]}
        </Link>
        <Link
          href="/caso/caso-epstein/investigacion"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navInvestigation[locale]}
        </Link>
        <Link
          href="/caso/caso-epstein/evidencia"
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navEvidence[locale]}
        </Link>
      </nav>
    </div>
  )
}

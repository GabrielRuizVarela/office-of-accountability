'use client'

import { useLanguage } from '@/lib/language-context'
import { TIMELINE_EVENTS } from '@/lib/caso-dictadura/investigation-data'

const CATEGORY_COLORS: Record<string, string> = {
  represion: '#ef4444',
  judicial: '#3b82f6',
  diplomatico: '#8b5cf6',
  economico: '#10b981',
  ddhh: '#f59e0b',
  politico: '#ec4899',
}

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  represion: { en: 'Repression', es: 'Represion' },
  judicial: { en: 'Judicial', es: 'Judicial' },
  diplomatico: { en: 'Diplomatic', es: 'Diplomatico' },
  economico: { en: 'Economic', es: 'Economico' },
  ddhh: { en: 'Human Rights', es: 'DDHH' },
  politico: { en: 'Political', es: 'Politico' },
}

export default function CronologiaPage() {
  const { lang } = useLanguage()

  const grouped = TIMELINE_EVENTS.reduce<Record<string, typeof TIMELINE_EVENTS>>((acc, evt) => {
    const year = evt.date.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(evt)
    return acc
  }, {})

  const years = Object.keys(grouped).sort()

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
          {lang === 'es' ? 'Cronologia' : 'Timeline'}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {lang === 'es'
            ? `${TIMELINE_EVENTS.length} eventos documentados — 1972 a 2016`
            : `${TIMELINE_EVENTS.length} documented events — 1972 to 2016`}
        </p>
      </header>

      {/* Year navigation */}
      <nav className="flex flex-wrap justify-center gap-2">
        {years.map((year) => (
          <a
            key={year}
            href={`#year-${year}`}
            className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
          >
            {year}
          </a>
        ))}
      </nav>

      {/* Timeline */}
      <div className="relative border-l-2 border-zinc-800 pl-6">
        {years.map((year) => (
          <div key={year} id={`year-${year}`} className="mb-8 scroll-mt-24">
            <h2 className="mb-4 text-lg font-bold text-zinc-100">{year}</h2>
            <div className="space-y-4">
              {grouped[year].map((evt) => {
                const color = CATEGORY_COLORS[evt.category] ?? '#71717a'
                const catLabel = CATEGORY_LABELS[evt.category]?.[lang] ?? evt.category
                return (
                  <div key={evt.id} className="relative">
                    {/* Dot on timeline */}
                    <div
                      className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-zinc-950"
                      style={{ backgroundColor: color }}
                    />
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">{evt.date}</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {catLabel}
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-semibold text-zinc-200">
                        {lang === 'es' ? evt.title_es : evt.title_en}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                        {lang === 'es' ? evt.description_es : evt.description_en}
                      </p>
                      {evt.sources.length > 0 && (
                        <p className="mt-2 text-xs text-zinc-600">
                          {evt.sources.join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

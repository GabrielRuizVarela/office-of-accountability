'use client'
import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/config'

import { TIMELINE_EVENTS } from '@/lib/caso-obras-publicas/investigation-data'

const CATEGORY_COLORS: Record<string, string> = {
  political: '#3b82f6',
  financial: '#f59e0b',
  legal: '#ef4444',
  media: '#8b5cf6',
  coverup: '#6b7280',
  infrastructure: '#10b981',
}

export default function CronologiaPage() {
  const locale = useLocale() as Locale

  const sorted = [...TIMELINE_EVENTS].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <header className="text-center">
        <h1 className="mb-1 text-2xl font-bold text-zinc-50 sm:text-3xl">
          {locale === 'en' ? 'Timeline' : 'Cronologia'}
        </h1>
        <p className="text-sm text-zinc-400">
          {locale === 'en'
            ? `${sorted.length} key events from the investigation`
            : `${sorted.length} eventos clave de la investigacion`}
        </p>
      </header>

      <div className="relative border-l-2 border-zinc-800 pl-8">
        {sorted.map((event) => {
          const color = CATEGORY_COLORS[event.category] || '#6b7280'
          return (
            <div key={event.id} className="relative mb-8">
              {/* Dot */}
              <div
                className="absolute -left-[2.6rem] top-1 h-4 w-4 rounded-full border-2 border-zinc-900"
                style={{ backgroundColor: color }}
              />

              {/* Date + category badge */}
              <div className="mb-1 flex items-center gap-2">
                <time className="text-xs font-medium text-zinc-500">{event.date}</time>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: color + '22', color }}
                >
                  {event.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-zinc-100">
                {locale === 'en' ? event.title_en : event.title_es}
              </h3>

              {/* Description */}
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {locale === 'en' ? event.description_en : event.description_es}
              </p>

              {/* Sources */}
              {event.sources && event.sources.length > 0 && (
                <p className="mt-1 text-[10px] text-zinc-600">
                  {event.sources.join(' | ')}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

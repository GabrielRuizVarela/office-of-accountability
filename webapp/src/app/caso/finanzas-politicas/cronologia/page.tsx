'use client'

import { useLanguage } from '@/lib/language-context'
import { TIMELINE_EVENTS } from '@/lib/caso-finanzas-politicas/investigation-data'

const t = {
  title: { en: 'Chronology', es: 'Cronologia' },
  subtitle: {
    en: 'Key events in the investigation of Argentine political finance, from the founding of SOCMA (1976) to the criminal complaint by Mariano Macri (2024).',
    es: 'Eventos clave en la investigacion de finanzas politicas argentinas, desde la fundacion de SOCMA (1976) hasta la denuncia penal de Mariano Macri (2024).',
  },
  documentedEvents: { en: 'documented events', es: 'eventos documentados' },
  source: { en: 'Source', es: 'Fuente' },
} as const

const CATEGORY_COLORS: Record<string, string> = {
  political: '#3b82f6',
  financial: '#10b981',
  legal: '#ef4444',
  corporate: '#a855f7',
}

const CATEGORY_LABELS: Record<string, Record<'en' | 'es', string>> = {
  political: { en: 'Political', es: 'Politico' },
  financial: { en: 'Financial', es: 'Financiero' },
  legal: { en: 'Legal', es: 'Legal' },
  corporate: { en: 'Corporate', es: 'Corporativo' },
}

function formatDate(dateStr: string, lang: 'en' | 'es'): string {
  const locale = lang === 'es' ? 'es-AR' : 'en-US'
  if (/^\d{4}[–-]\d{4}$/.test(dateStr)) return dateStr
  if (/^\d{4}$/.test(dateStr)) return dateStr
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr + '-01T00:00:00')
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'short' })
  }
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function CronologiaPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-50">{t.title[lang]}</h1>
      <p className="mb-8 text-sm text-zinc-400">
        {t.subtitle[lang]} {TIMELINE_EVENTS.length} {t.documentedEvents[lang]}.
      </p>

      <div className="relative space-y-4 pl-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-800" />
        {TIMELINE_EVENTS.map((event) => {
          const catColor = CATEGORY_COLORS[event.category] ?? '#6b7280'
          const catLabel = CATEGORY_LABELS[event.category]?.[lang] ?? event.category
          return (
            <div key={event.id} className="relative">
              <div
                className="absolute -left-[17px] top-3 h-3.5 w-3.5 rounded-full border-2 border-zinc-950"
                style={{ backgroundColor: catColor }}
              />
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-zinc-500">
                    {formatDate(event.date, lang)}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: catColor }}
                  >
                    {catLabel}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold text-zinc-100">
                  {lang === 'en' ? event.title_en : event.title_es}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {lang === 'en' ? event.description_en : event.description_es}
                </p>
                {event.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.sources.map((src) => (
                      <a
                        key={src}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline"
                      >
                        {t.source[lang]} ↗
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

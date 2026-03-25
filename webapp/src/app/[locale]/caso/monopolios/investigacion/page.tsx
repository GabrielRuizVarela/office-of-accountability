'use client'
import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/config'

import { useState, useMemo } from 'react'

import {
  FACTCHECK_ITEMS,
  TIMELINE_EVENTS,
  ACTORS,
  type FactcheckStatus,
  type InvestigationCategory,
} from '@/lib/caso-monopolios/investigation-data'

const STATUS_COLORS: Record<FactcheckStatus, string> = {
  confirmed: '#10b981',
  alleged: '#f59e0b',
  confirmed_cleared: '#3b82f6',
  unconfirmed: '#6b7280',
}

const STATUS_LABELS: Record<FactcheckStatus, Record<Locale, string>> = {
  confirmed: { es: 'Confirmado', en: 'Confirmed' },
  alleged: { es: 'Presunto', en: 'Alleged' },
  confirmed_cleared: { es: 'Sobreseido', en: 'Cleared' },
  unconfirmed: { es: 'No confirmado', en: 'Unconfirmed' },
}

const SECTOR_LABELS: Record<string, Record<Locale, string>> = {
  telecom: { es: 'Telecomunicaciones', en: 'Telecom' },
  energy: { es: 'Energia', en: 'Energy' },
  food: { es: 'Alimentos', en: 'Food' },
  media: { es: 'Medios', en: 'Media' },
  banking: { es: 'Banca', en: 'Banking' },
  mining: { es: 'Mineria', en: 'Mining' },
  agroexport: { es: 'Agroexportacion', en: 'Agro-export' },
  construction: { es: 'Construccion', en: 'Construction' },
  pharma: { es: 'Farmaceutica', en: 'Pharma' },
  transport: { es: 'Transporte', en: 'Transport' },
  cross_sector: { es: 'Inter-sectorial', en: 'Cross-sector' },
  regulatory_capture: { es: 'Captura regulatoria', en: 'Regulatory capture' },
}

const TIER_LABELS: Record<number, Record<Locale, string>> = {
  1: { es: 'Critico', en: 'Critical' },
  2: { es: 'Alto', en: 'High' },
  3: { es: 'Notable', en: 'Notable' },
}

export default function InvestigacionPage() {
  const locale = useLocale() as Locale
  const [filterSector, setFilterSector] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const sectors = useMemo(() => {
    const s = new Set(FACTCHECK_ITEMS.map((i) => i.sector))
    return Array.from(s).sort()
  }, [])

  const filtered = useMemo(() => {
    return FACTCHECK_ITEMS.filter((item) => {
      if (filterSector !== 'all' && item.sector !== filterSector) return false
      if (filterStatus !== 'all' && item.status !== filterStatus) return false
      return true
    })
  }, [filterSector, filterStatus])

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-zinc-100">
          {locale === 'es' ? 'Investigacion: Monopolios en Argentina' : 'Investigation: Argentine Monopolies'}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {FACTCHECK_ITEMS.length} {locale === 'es' ? 'hallazgos verificados' : 'verified findings'} | {ACTORS.length} {locale === 'es' ? 'actores clave' : 'key actors'} | {TIMELINE_EVENTS.length} {locale === 'es' ? 'eventos' : 'events'}
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300"
        >
          <option value="all">{locale === 'es' ? 'Todos los sectores' : 'All sectors'}</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {SECTOR_LABELS[s]?.[locale] ?? s}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300"
        >
          <option value="all">{locale === 'es' ? 'Todos los estados' : 'All statuses'}</option>
          <option value="confirmed">{STATUS_LABELS.confirmed[locale]}</option>
          <option value="alleged">{STATUS_LABELS.alleged[locale]}</option>
        </select>
        <span className="self-center text-xs text-zinc-500">
          {filtered.length} / {FACTCHECK_ITEMS.length}
        </span>
      </div>

      {/* Factcheck items */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <article key={item.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                T{item.tier} — {TIER_LABELS[item.tier]?.[locale] ?? ''}
              </span>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: STATUS_COLORS[item.status] + '22', color: STATUS_COLORS[item.status] }}
              >
                {STATUS_LABELS[item.status]?.[locale]}
              </span>
              <span className="rounded bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-500">
                {SECTOR_LABELS[item.sector]?.[locale] ?? item.sector}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-200">
              {locale === 'es' ? item.claim_es : item.claim_en}
            </p>
            {(locale === 'es' ? item.detail_es : item.detail_en) && (
              <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                {locale === 'es' ? item.detail_es : item.detail_en}
              </p>
            )}
            <div className="mt-3 text-[10px] text-zinc-600">
              {item.source} —{' '}
              <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-400">
                source
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

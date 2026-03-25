'use client'
import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/config'

/**
 * Obras Publicas — Money flow page.
 *
 * Displays money trails: Odebrecht bribes, Siemens FCPA, Cuadernos cash,
 * and contract-level spending from the investigation data.
 */

import { Link } from '@/i18n/navigation'

import { MONEY_FLOWS } from '@/lib/caso-obras-publicas/investigation-data'

const SLUG = 'obras-publicas'

const t = {
  title: { en: 'The Money', es: 'El Dinero' },
  subtitle: {
    en: 'Tracking bribery and procurement spending: Odebrecht bribes ($35M USD), Siemens DNI bribes ($100M+ USD), Cuadernos cash deliveries, and contract-level public works spending across national, provincial, and multilateral jurisdictions.',
    es: 'Rastreo de sobornos y gasto en contrataciones: sobornos Odebrecht ($35M USD), sobornos Siemens DNI ($100M+ USD), entregas de efectivo Cuadernos, y gasto de obra publica a nivel de contratos en jurisdicciones nacionales, provinciales y multilaterales.',
  },
  totalTracked: { en: 'Total tracked (USD)', es: 'Total rastreado (USD)' },
  totalNote: {
    en: 'Includes documented bribes, FCPA settlements, and contract amounts',
    es: 'Incluye sobornos documentados, acuerdos FCPA, y montos de contratos',
  },
  unknownAmount: { en: 'Amount under investigation', es: 'Monto en investigacion' },
  navSummary: { en: '\u2190 Summary', es: '\u2190 Resumen' },
  navInvestigation: { en: 'Investigation', es: 'Investigacion' },
  navConnections: { en: 'Connections \u2192', es: 'Conexiones \u2192' },
} as const

function formatUSD(amount: number, locale: 'en' | 'es'): string {
  if (amount === 0) return locale === 'en' ? 'Under investigation' : 'En investigacion'
  if (amount >= 1_000_000_000) return `USD ${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `USD ${(amount / 1_000_000).toFixed(0)}M`
  if (amount >= 1_000) return `USD ${(amount / 1_000).toFixed(0)}K`
  return `USD ${amount.toLocaleString()}`
}

function formatDate(dateStr: string, locale: 'en' | 'es'): string {
  if (/^\d{4}[–-]\d{4}$/.test(dateStr)) return dateStr
  if (/^\d{4}$/.test(dateStr)) return dateStr
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr + '-01T00:00:00')
    return d.toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', {
      year: 'numeric',
      month: 'short',
    })
  }
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function DineroPage() {
  const locale = useLocale() as Locale

  const totalUsd = MONEY_FLOWS.reduce((sum, f) => sum + f.amount_usd, 0)

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <header className="text-center">
        <h1 className="mb-1 text-2xl font-bold text-zinc-50 sm:text-3xl">
          {t.title[locale]}
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-zinc-400">
          {t.subtitle[locale]}
        </p>
      </header>

      {/* Total */}
      <div className="mx-auto max-w-sm rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <p className="text-3xl font-bold text-amber-400">{formatUSD(totalUsd, locale)}</p>
        <p className="mt-1 text-xs text-zinc-400">{t.totalTracked[locale]}</p>
        <p className="mt-0.5 text-[10px] text-zinc-600">{t.totalNote[locale]}</p>
      </div>

      {/* Flow list */}
      <div className="space-y-3">
        {MONEY_FLOWS.map((flow) => (
          <div
            key={flow.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-2 text-sm">
                <span className="font-medium text-zinc-200">
                  {flow.from_label}
                </span>
                <svg
                  className="h-4 w-4 shrink-0 text-zinc-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                <span className="font-medium text-zinc-200">
                  {flow.to_label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-right">
                <span className="text-sm font-bold text-amber-400">
                  {formatUSD(flow.amount_usd, locale)}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatDate(flow.date, locale)}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {flow.source}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 border-t border-zinc-800 pt-8 sm:flex-row">
        <Link
          href={`/caso/${SLUG}/resumen`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navSummary[locale]}
        </Link>
        <Link
          href={`/caso/${SLUG}/investigacion`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navInvestigation[locale]}
        </Link>
        <Link
          href={`/caso/${SLUG}/conexiones`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navConnections[locale]}
        </Link>
      </nav>
    </div>
  )
}

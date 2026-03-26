'use client'

import { useLanguage } from '@/lib/language-context'
import { MONEY_FLOWS } from '@/lib/caso-finanzas-politicas/investigation-data'

const t = {
  title: { en: 'The Money', es: 'El Dinero' },
  subtitle: {
    en: 'Tracking $674 billion ARS in public procurement. Nacion Seguros monopoly ($28.5B), broker commissions ($3.5B), PAMI 16x overpricing, SIDE reserved funds ($13.4B), $LIBRA cashout ($107M USD), Correo debt, SOCMA amnesty.',
    es: 'Rastreo de $674 mil millones ARS en contrataciones publicas. Monopolio de Nacion Seguros ($28.5B), comisiones de brokers ($3.5B), sobreprecio PAMI (16x), fondos reservados SIDE ($13.4B), cashout $LIBRA ($107M USD), deuda del Correo, blanqueo SOCMA.',
  },
  totalTracked: { en: 'Total tracked (ARS)', es: 'Total rastreado (ARS)' },
  totalNote: {
    en: 'Includes debt, amnesty, assets and documented donations',
    es: 'Incluye deuda, blanqueo, patrimonio y donaciones documentadas',
  },
  unknownAmount: { en: 'Unknown amount', es: 'Monto desconocido' },
} as const

function formatArs(amount: number, lang: 'en' | 'es'): string {
  if (amount === 0) return lang === 'en' ? 'Unknown amount' : 'Monto desconocido'
  if (amount >= 1_000_000_000) {
    return `ARS ${(amount / 1_000_000_000).toFixed(1)}B`
  }
  if (amount >= 1_000_000) {
    return `ARS ${(amount / 1_000_000).toFixed(0)}M`
  }
  if (amount >= 1_000) {
    return `ARS ${(amount / 1_000).toFixed(0)}K`
  }
  return `ARS ${amount.toLocaleString()}`
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

export default function DineroPage() {
  const { lang } = useLanguage()
  const totalTracked = MONEY_FLOWS.reduce((sum, f) => sum + f.amount_ars, 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-50">{t.title[lang]}</h1>
      <p className="mb-8 text-sm text-zinc-400">
        {t.subtitle[lang]}
      </p>

      {/* Total tracked highlight */}
      <div className="mb-8 rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-4 text-center">
        <p className="text-xs uppercase tracking-wider text-emerald-400">
          {t.totalTracked[lang]}
        </p>
        <p className="mt-1 text-3xl font-bold text-emerald-300">
          {formatArs(totalTracked, lang)}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {t.totalNote[lang]}
        </p>
      </div>

      {/* Flow list */}
      <div className="space-y-4">
        {MONEY_FLOWS.map((flow) => (
          <div
            key={flow.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5"
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
                <span className="text-sm font-bold text-emerald-400">
                  {formatArs(flow.amount_ars, lang)}
                </span>
                <span className="text-xs text-zinc-500">
                  {formatDate(flow.date, lang)}
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {lang === 'en' ? flow.description_en : flow.description_es}
            </p>
            <a
              href={flow.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-emerald-400 hover:underline"
            >
              {flow.source} ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

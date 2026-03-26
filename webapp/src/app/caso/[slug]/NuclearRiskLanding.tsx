'use client'

import Link from 'next/link'
import { useLanguage, type Lang } from '@/lib/language-context'

const t = {
  badge: {
    es: 'Monitoreo diario · Oficina de Rendición de Cuentas',
    en: 'Daily monitoring · Office of Accountability',
  },
  title: {
    es: 'Riesgo Nuclear Global',
    en: 'Global Nuclear Risk',
  },
  hook: {
    es: 'Monitoreo de señales de escalada nuclear en todos los estados con armas nucleares. Desarrollos militares, declaraciones oficiales, estado de tratados e inteligencia de fuentes abiertas.',
    en: 'Monitoring nuclear escalation signals across all nuclear-armed states. Military developments, official statements, treaty status, and open-source intelligence.',
  },
  theatersTitle: {
    es: 'Teatros activos',
    en: 'Active theaters',
  },
  signals: { en: 'signals', es: 'señales' },
  severity: { en: 'severity', es: 'severidad' },
  cta: {
    es: 'Leer análisis completo',
    en: 'Read full analysis',
  },
  ctaDesc: {
    es: '7 teatros analizados · 31 fuentes · evaluación de riesgo con metodología publicada',
    en: '7 theaters analyzed · 31 sources · risk assessment with published methodology',
  },
} as const

const LEVEL_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  serious: 'bg-orange-500',
  elevated: 'bg-yellow-500',
  notable: 'bg-blue-500',
  routine: 'bg-green-500',
}

const LEVEL_DOT: Record<string, string> = {
  critical: 'bg-red-400',
  serious: 'bg-orange-400',
  elevated: 'bg-yellow-400',
  notable: 'bg-blue-400',
  routine: 'bg-green-400',
}

const LEVEL_TEXT: Record<string, string> = {
  critical: 'text-red-400',
  serious: 'text-orange-400',
  elevated: 'text-yellow-400',
  notable: 'text-blue-400',
  routine: 'text-green-400',
}

const LEVEL_LABELS: Record<string, Record<Lang, string>> = {
  critical: { en: 'Critical', es: 'Crítico' },
  serious: { en: 'Serious', es: 'Serio' },
  elevated: { en: 'Elevated', es: 'Elevado' },
  notable: { en: 'Notable', es: 'Notable' },
  routine: { en: 'Routine', es: 'Rutina' },
}

interface TheaterSummary {
  readonly theater: string
  readonly signalCount: number
  readonly avgSeverity: number
  readonly maxLevel: string
}

const LINKS = [
  {
    href: '/caso/riesgo-nuclear/grafo',
    label: { es: 'Grafo', en: 'Graph' },
    desc: {
      es: 'Actores, armas, tratados y señales — mapeados',
      en: 'Actors, weapons, treaties, and signals — mapped',
    },
  },
  {
    href: '/caso/riesgo-nuclear/cronologia',
    label: { es: 'Cronología', en: 'Chronology' },
    desc: {
      es: 'Señales de escalada en orden cronológico',
      en: 'Escalation signals in chronological order',
    },
  },
  {
    href: '/caso/riesgo-nuclear/evidencia',
    label: { es: 'Evidencia', en: 'Evidence' },
    desc: {
      es: 'Documentos fuente y verificación de señales',
      en: 'Source documents and signal verification',
    },
  },
]

export function NuclearRiskLanding({
  slug,
  stats,
  theaters,
}: {
  readonly slug: string
  readonly stats: { label: string; value: string | number; color: string }[]
  readonly theaters: readonly TheaterSummary[]
}) {
  const { lang } = useLanguage()

  // Pick 4 key stats for the big numbers
  const bigStats = stats.slice(0, 4)

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <p className="reveal-on-mount reveal-d1 text-center text-[11px] tracking-[3px] text-yellow-400/80 uppercase">
        {t.badge[lang]}
      </p>

      <h1 className="reveal-on-mount reveal-d2 mt-5 text-center font-serif text-4xl font-black leading-tight text-zinc-50 sm:text-5xl lg:text-[48px]">
        {t.title[lang]}
      </h1>

      <p className="reveal-on-mount reveal-d3 mx-auto mt-6 max-w-lg text-center text-base leading-relaxed text-zinc-400 sm:text-lg">
        {t.hook[lang]}
      </p>

      <div className="reveal-on-mount reveal-d4 mt-14 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
        {bigStats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-serif text-3xl font-black text-zinc-50 sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] leading-tight tracking-wide text-zinc-500 uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="reveal-on-mount reveal-d5 mx-auto mt-14 mb-10 border-t border-double border-zinc-700" />

      <div className="reveal-on-mount reveal-d5">
        <h2 className="mb-6 text-center font-serif text-xl font-bold text-zinc-200 sm:text-2xl">
          {t.theatersTitle[lang]}
        </h2>

        <div className="space-y-0">
          {theaters.map((th) => (
              <div key={th.theater} className="flex items-center gap-4 border-b border-zinc-800/40 py-4">
                <span className={`block h-2.5 w-2.5 shrink-0 rounded-full ${LEVEL_DOT[th.maxLevel] ?? 'bg-zinc-500'}`} />
                <span className="min-w-[140px] font-serif text-base font-bold text-zinc-100 sm:text-lg">
                  {th.theater}
                </span>
                <span className={`text-xs font-semibold uppercase tracking-wider ${LEVEL_TEXT[th.maxLevel] ?? 'text-zinc-500'}`}>
                  {LEVEL_LABELS[th.maxLevel]?.[lang] ?? th.maxLevel}
                </span>
                <span className="flex-1" />
                <span className="text-right text-xs text-zinc-500">
                  {th.signalCount} {t.signals[lang]} · {t.severity[lang]} {th.avgSeverity}
                </span>
                <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${LEVEL_COLORS[th.maxLevel] ?? 'bg-zinc-500'}`}
                    style={{ width: `${Math.min(100, th.avgSeverity)}%` }}
                  />
                </div>
              </div>
          ))}
        </div>
      </div>

      <div className="reveal-on-mount reveal-d6 mx-auto mt-10 mb-10 border-t border-zinc-800/60" />

      <Link
        href={`/caso/${slug}/resumen`}
        className="reveal-on-mount reveal-d7 group block py-6 text-center"
      >
        <span className="font-serif text-2xl font-bold text-zinc-50 transition-colors group-hover:text-yellow-400 sm:text-3xl">
          {t.cta[lang]} →
        </span>
        <p className="mt-2 text-sm tracking-wide text-zinc-500">
          {t.ctaDesc[lang]}
        </p>
      </Link>

      <div className="reveal-on-mount reveal-d7 mx-auto mt-2 mb-2 border-t border-zinc-800/60" />

      <nav className="reveal-on-mount reveal-d8 mt-8">
        {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-4 border-b border-zinc-800/40 py-7 transition-colors hover:border-yellow-500/30"
            >
              <span className="mt-2.5 block h-2 w-2 shrink-0 rounded-full bg-yellow-500/50 transition-colors group-hover:bg-yellow-400" />
              <div>
                <span className="font-serif text-lg font-bold text-zinc-100 transition-colors group-hover:text-yellow-400 sm:text-xl">
                  {link.label[lang]}
                </span>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500 sm:text-base">
                  {link.desc[lang]}
                </p>
              </div>
            </Link>
        ))}
      </nav>
    </div>
  )
}

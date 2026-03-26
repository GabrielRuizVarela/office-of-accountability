'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'

const t = {
  badge: {
    es: 'Investigacion · Oficina de Rendicion de Cuentas',
    en: 'Investigation · Office of Accountability',
  },
  title: {
    es: 'Obra Publica Argentina',
    en: 'Argentine Public Works',
  },
  hook: {
    es: 'Tres casos internacionales de soborno — Odebrecht, Siemens, Cuadernos — se mapean directamente a contratos de obra publica. Esta investigacion cruzo 14 fuentes de datos para rastrear contratistas, intermediarios y flujos de dinero a traves de jurisdicciones nacionales, provinciales e internacionales.',
    en: 'Three international bribery cases — Odebrecht, Siemens, Cuadernos — map directly to public works contracts. This investigation cross-referenced 14 data sources to trace contractors, intermediaries, and money flows across national, provincial, and international jurisdictions.',
  },
  cta: {
    es: 'Leer investigacion completa',
    en: 'Read full investigation',
  },
  ctaDesc: {
    es: '14 fuentes de datos · 3 casos internacionales · metodologia reproducible',
    en: '14 data sources · 3 international cases · reproducible methodology',
  },
} as const

const STATS = [
  { value: '$135M+', label: { es: 'en sobornos documentados', en: 'in documented bribes' } },
  { value: '14', label: { es: 'fuentes de datos cruzadas', en: 'cross-referenced sources' } },
  { value: '3', label: { es: 'casos internacionales', en: 'international cases' } },
  { value: '1998–2025', label: { es: 'periodo investigado', en: 'period investigated' } },
]

const LINKS = [
  {
    href: '/caso/obras-publicas/resumen',
    label: { es: 'Resumen', en: 'Summary' },
    desc: {
      es: 'Resumen ejecutivo. Catorce fuentes, tres casos de soborno internacional, y resolucion de entidades contra el grafo de finanzas-politicas.',
      en: 'Executive summary. Fourteen sources, three international bribery cases, and entity resolution against the political-finance graph.',
    },
  },
  {
    href: '/caso/obras-publicas/cronologia',
    label: { es: 'Cronologia', en: 'Chronology' },
    desc: {
      es: 'Desde el contrato Siemens-DNI (1998) hasta el juicio Cuadernos (2025). Cada hito con fuente documental.',
      en: 'From the Siemens-DNI contract (1998) to the Cuadernos trial (2025). Every milestone with documentary source.',
    },
  },
  {
    href: '/caso/obras-publicas/dinero',
    label: { es: 'Siga el Dinero', en: 'Follow the Money' },
    desc: {
      es: 'Sobornos Odebrecht ($35M), Siemens ($100M+), entregas de efectivo Cuadernos, y gasto a nivel de contratos.',
      en: 'Odebrecht bribes ($35M), Siemens ($100M+), Cuadernos cash deliveries, and contract-level spending.',
    },
  },
  {
    href: '/caso/obras-publicas/conexiones',
    label: { es: 'Conexiones', en: 'Connections' },
    desc: {
      es: 'Grafo interactivo: contratistas, politicos, intermediarios y casos de soborno. Filtros por Contratista-Donante, Offshore, Inhabilitado.',
      en: 'Interactive graph: contractors, politicians, intermediaries, and bribery cases. Filter by Contractor-Donor, Offshore, Debarred.',
    },
  },
  {
    href: '/caso/obras-publicas/investigacion',
    label: { es: 'Hallazgos verificados', en: 'Verified findings' },
    desc: {
      es: 'Cada afirmacion con fuente. Odebrecht, Cuadernos, Siemens FCPA, y datos de contratacion cruzados contra registros judiciales.',
      en: 'Every claim with source. Odebrecht, Cuadernos, Siemens FCPA, and procurement data cross-referenced against court records.',
    },
  },
  {
    href: '/caso/obras-publicas/mapa',
    label: { es: 'Mapa', en: 'Map' },
    desc: {
      es: 'Visualizacion geografica de obras publicas con capas de contratistas, codificadas por alertas de investigacion.',
      en: 'Geographic visualization of public works with contractor overlays, color-coded by investigation flags.',
    },
  },
]

export default function ObrasPublicasPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <p className="reveal-on-mount reveal-d1 text-center text-[11px] tracking-[3px] text-sky-400/80 uppercase">
        {t.badge[lang]}
      </p>

      <h1 className="reveal-on-mount reveal-d2 mt-5 text-center font-serif text-4xl font-black leading-tight text-zinc-50 sm:text-5xl lg:text-[48px]">
        {t.title[lang]}
      </h1>

      <p className="reveal-on-mount reveal-d3 mx-auto mt-6 max-w-lg text-center text-base leading-relaxed text-zinc-400 sm:text-lg">
        {t.hook[lang]}
      </p>

      <div className="reveal-on-mount reveal-d4 mt-14 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.value} className="text-center">
            <p className="font-serif text-3xl font-black text-zinc-50 sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] leading-tight tracking-wide text-zinc-500 uppercase">
              {stat.label[lang]}
            </p>
          </div>
        ))}
      </div>

      <div className="reveal-on-mount reveal-d5 mx-auto mt-14 mb-14 border-t border-double border-zinc-700" />

      <Link
        href="/caso/obras-publicas/resumen"
        className="reveal-on-mount reveal-d6 group block py-6 text-center"
      >
        <span className="font-serif text-2xl font-bold text-zinc-50 transition-colors group-hover:text-sky-400 sm:text-3xl">
          {t.cta[lang]} →
        </span>
        <p className="mt-2 text-sm tracking-wide text-zinc-500">
          {t.ctaDesc[lang]}
        </p>
      </Link>

      <div className="reveal-on-mount reveal-d6 mx-auto mt-2 mb-2 border-t border-zinc-800/60" />

      <nav className="reveal-on-mount reveal-d7 mt-8">
        {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-4 border-b border-zinc-800/40 py-7 transition-colors hover:border-sky-500/30"
            >
              <span className="mt-2.5 block h-2 w-2 shrink-0 rounded-full bg-sky-500/50 transition-colors group-hover:bg-sky-400" />
              <div>
                <span className="font-serif text-lg font-bold text-zinc-100 transition-colors group-hover:text-sky-400 sm:text-xl">
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

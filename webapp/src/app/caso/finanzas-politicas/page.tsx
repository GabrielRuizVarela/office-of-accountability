'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'

const t = {
  badge: {
    es: 'Investigacion · Oficina de Rendicion de Cuentas',
    en: 'Investigation · Office of Accountability',
  },
  title: {
    es: 'Finanzas Politicas Argentinas',
    en: 'Argentine Political Finance',
  },
  hook: {
    es: 'Cruzamos 34.776 entidades contra 14 fuentes de datos publicos para mapear como el dinero conecta al poder politico, corporativo y judicial en Argentina. 40 anos de gobernanza democratica. Cada afirmacion verificable.',
    en: 'We cross-referenced 34,776 entities against 14 public data sources to map how money connects political, corporate, and judicial power in Argentina. 40 years of democratic governance. Every claim verifiable.',
  },
  cta: {
    es: 'Leer investigacion completa',
    en: 'Read full investigation',
  },
  ctaDesc: {
    es: '6 capitulos · 14 fuentes de datos · metodologia reproducible',
    en: '6 chapters · 14 data sources · reproducible methodology',
  },
} as const

const STATS = [
  { value: '34,776', label: { es: 'entidades cruzadas', en: 'cross-referenced entities' } },
  { value: '$63B', label: { es: 'en contrataciones rastreadas', en: 'in procurement traced' } },
  { value: '247', label: { es: 'donantes vinculados a contratistas', en: 'donors linked to contractors' } },
  { value: '2%', label: { es: 'tasa de condena por corrupcion', en: 'corruption conviction rate' } },
]

const LINKS = [
  {
    href: '/caso/finanzas-politicas/resumen',
    label: { es: 'Resumen', en: 'Summary' },
    desc: {
      es: 'Resumen ejecutivo de la investigacion. 14 fuentes, 294 entidades, 2.391 relaciones. Los patrones estructurales detras de la superposicion institucional.',
      en: 'Executive summary of the investigation. 14 sources, 294 entities, 2,391 relationships. The structural patterns behind institutional overlap.',
    },
  },
  {
    href: '/caso/finanzas-politicas/cronologia',
    label: { es: 'Cronologia', en: 'Chronology' },
    desc: {
      es: '40 anos de eventos documentados — desde las privatizaciones de Menem (1989) pasando por el juicio Cuadernos (2025), el encubrimiento de AMIA, el escandalo $LIBRA, y el envio de oro del BCRA a Londres.',
      en: '40 years of documented events — from Menem privatizations (1989) through Cuadernos trial (2025), AMIA cover-up, $LIBRA scandal, and BCRA gold shipment to London.',
    },
  },
  {
    href: '/caso/finanzas-politicas/dinero',
    label: { es: 'Siga el Dinero', en: 'Follow the Money' },
    desc: {
      es: '7 rutas del dinero trazadas: donantes a contratistas ($63.000M), estructuras offshore ($483.000M), sobreprecios en compras ($80.000M en 13 anos), fuga cripto ($91.000M/ano).',
      en: '7 money trails traced: campaign donors to contractors ($63B), offshore structures ($483B), procurement overpricing ($80B over 13 years), crypto capital flight ($91B/year).',
    },
  },
  {
    href: '/caso/finanzas-politicas/conexiones',
    label: { es: 'Conexiones', en: 'Connections' },
    desc: {
      es: 'Grafo interactivo: 294 nodos de investigacion, 2.391 relaciones. Filtre por Puerta Giratoria, Offshore, Rastro del Dinero, Familias del Poder.',
      en: 'Interactive graph: 294 investigation nodes, 2,391 relationships. Filter by Revolving Door, Offshore, Money Trail, Power Families.',
    },
  },
  {
    href: '/caso/finanzas-politicas/investigacion',
    label: { es: 'Hallazgos verificados', en: 'Verified findings' },
    desc: {
      es: 'Cada afirmacion con fuente. Offshore, contratistas, conexiones politicas y causas judiciales clasificadas por severidad.',
      en: 'Every claim with source. Offshore entities, contractors, political connections, and judicial cases classified by severity.',
    },
  },
  {
    href: '/caso/finanzas-politicas/metodologia',
    label: { es: 'Metodologia', en: 'Methodology' },
    desc: {
      es: 'Como se construyo esta investigacion. 14 fuentes, verificacion, marcos de cumplimiento, limitaciones.',
      en: 'How this investigation was built. 14 sources, verification, compliance frameworks, limitations.',
    },
  },
]

export default function FinanzasPoliticasPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <p className="reveal-on-mount reveal-d1 text-center text-[11px] tracking-[3px] text-emerald-400/80 uppercase">
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
        href="/caso/finanzas-politicas/resumen"
        className="reveal-on-mount reveal-d6 group block py-6 text-center"
      >
        <span className="font-serif text-2xl font-bold text-zinc-50 transition-colors group-hover:text-emerald-400 sm:text-3xl">
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
              className="group flex items-start gap-4 border-b border-zinc-800/40 py-7 transition-colors hover:border-emerald-500/30"
            >
              <span className="mt-2.5 block h-2 w-2 shrink-0 rounded-full bg-emerald-500/50 transition-colors group-hover:bg-emerald-400" />
              <div>
                <span className="font-serif text-lg font-bold text-zinc-100 transition-colors group-hover:text-emerald-400 sm:text-xl">
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

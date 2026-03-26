'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'

const t = {
  badge: {
    es: 'Investigación · Oficina de Rendición de Cuentas',
    en: 'Investigation · Office of Accountability',
  },
  title: {
    es: 'Caso Libra: La Memecoin del Presidente',
    en: 'The Libra Case: The President\'s Memecoin',
  },
  hook: {
    es: 'El 14 de febrero de 2025, el presidente Milei promocionó el token $LIBRA a 19 millones de seguidores. En horas, el precio colapsó un 94%. Aproximadamente 114.000 billeteras perdieron USD 251M+. Un año después, cero imputados.',
    en: 'On February 14, 2025, President Milei promoted the $LIBRA token to 19 million followers. Within hours, the price collapsed 94%. Approximately 114,000 wallets lost $251M+. One year later, zero indictments.',
  },
  cta: {
    es: 'Leer la historia completa',
    en: 'Read the full story',
  },
  ctaDesc: {
    es: '8 capítulos · 26 hechos verificados · 14 actores identificados',
    en: '8 chapters · 26 verified facts · 14 actors identified',
  },
} as const

const STATS = [
  { value: 'USD 251M+', label: { es: 'pérdidas totales', en: 'total losses' } },
  { value: '114K', label: { es: 'billeteras afectadas', en: 'wallets affected' } },
  { value: '94%', label: { es: 'colapso del precio', en: 'price collapse' } },
  { value: '0', label: { es: 'imputados', en: 'indictments' } },
]

const LINKS = [
  {
    href: '/caso/caso-libra/cronologia',
    label: { es: 'Cronología', en: 'Timeline' },
    desc: {
      es: 'Desde el tuit presidencial hasta las investigaciones judiciales. 27 eventos documentados hora por hora.',
      en: 'From the presidential tweet to the judicial investigations. 27 events documented hour by hour.',
    },
  },
  {
    href: '/caso/caso-libra/investigacion',
    label: { es: 'Hallazgos verificados', en: 'Verified findings' },
    desc: {
      es: '26 hechos con fuente. Flujos de dinero, conexiones políticas y estructuras offshore clasificadas por severidad.',
      en: '26 facts with sources. Money flows, political connections, and offshore structures classified by severity.',
    },
  },
  {
    href: '/caso/caso-libra/dinero',
    label: { es: 'El Dinero', en: 'The Money' },
    desc: {
      es: 'USD 107M extraídos por insiders. Visualización del flujo de fondos desde el lanzamiento hasta la liquidación.',
      en: '$107M extracted by insiders. Fund flow visualization from launch to liquidation.',
    },
  },
  {
    href: '/caso/caso-libra/grafo',
    label: { es: 'Conexiones', en: 'Connections' },
    desc: {
      es: 'Red de actores: quién conoce a quién, quién pagó a quién. Grafo interactivo con 14 actores clave.',
      en: 'Actor network: who knows whom, who paid whom. Interactive graph with 14 key actors.',
    },
  },
]

export default function CasoLibraPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <p className="reveal-on-mount reveal-d1 text-center text-[11px] tracking-[3px] text-purple-400/80 uppercase">
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
        href="/caso/caso-libra/resumen"
        className="reveal-on-mount reveal-d6 group block py-6 text-center"
      >
        <span className="font-serif text-2xl font-bold text-zinc-50 transition-colors group-hover:text-purple-400 sm:text-3xl">
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
              className="group flex items-start gap-4 border-b border-zinc-800/40 py-7 transition-colors hover:border-purple-500/30"
            >
              <span className="mt-2.5 block h-2 w-2 shrink-0 rounded-full bg-purple-500/50 transition-colors group-hover:bg-purple-400" />
              <div>
                <span className="font-serif text-lg font-bold text-zinc-100 transition-colors group-hover:text-purple-400 sm:text-xl">
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

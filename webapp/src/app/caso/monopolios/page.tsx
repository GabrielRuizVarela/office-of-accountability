'use client'



import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'


const t = {
  badge: {
    es: 'Investigación · Oficina de Rendición de Cuentas',
    en: 'Investigation · Office of Accountability',
  },
  title: {
    es: 'Mercados Monopolizados en Argentina',
    en: 'Monopolized Markets in Argentina',
  },
  hook: {
    es: 'Diez grupos familiares controlan 18 sectores de la economía argentina. Esta investigación cruzó 2,45 millones de nodos contra 44 archivos de investigación para cuantificar el costo.',
    en: 'Ten family groups control 18 sectors of the Argentine economy. This investigation cross-referenced 2.45 million nodes against 44 research files to quantify the cost.',
  },
  cta: {
    es: 'Leer investigación completa',
    en: 'Read full investigation',
  },
  ctaDesc: {
    es: '8 capítulos · 829+ hallazgos verificados · 44 archivos de investigación',
    en: '8 chapters · 829+ verified findings · 44 research files',
  },
} as const

const STATS = [
  { value: 'USD 22.5B', label: { es: 'costo anual para el consumidor', en: 'annual cost to consumers' } },
  { value: '829+', label: { es: 'hallazgos verificados', en: 'verified findings' } },
  { value: '10', label: { es: 'grupos familiares', en: 'family groups' } },
  { value: '18', label: { es: 'sectores controlados', en: 'sectors controlled' } },
]

const LINKS = [
  {
    href: '/caso/monopolios/cronologia',
    label: { es: 'Cronología', en: 'Chronology' },
    desc: {
      es: 'Desde las privatizaciones de 1989 hasta la venta de Telefe en 2025. Las mismas familias aparecen en cada punto de inflexión.',
      en: 'From the 1989 privatizations to the 2025 Telefe sale. The same families appear at every turning point.',
    },
  },
  {
    href: '/caso/monopolios/actores',
    label: { es: 'Actores', en: 'Actors' },
    desc: {
      es: 'Trece grupos. Sesenta entidades offshore. Todos los gobiernos desde 1989. Perfiles con empresas, estructuras y control sectorial.',
      en: 'Thirteen groups. Sixty offshore entities. Every government since 1989. Profiles with companies, structures, and sector control.',
    },
  },
  {
    href: '/caso/monopolios/conexiones',
    label: { es: 'Conexiones', en: 'Connections' },
    desc: {
      es: 'Grafo interactivo de redes de propiedad, vínculos políticos y relaciones intersectoriales entre los grupos monopolicos.',
      en: 'Interactive graph of ownership networks, political ties, and cross-sector relationships between monopoly groups.',
    },
  },
  {
    href: '/caso/monopolios/investigacion',
    label: { es: 'Hallazgos verificados', en: 'Verified findings' },
    desc: {
      es: 'Cada afirmación con fuente. Offshore, cuotas de mercado, conexiones políticas y causas judiciales clasificadas por severidad.',
      en: 'Every claim with source. Offshore entities, market shares, political connections, and judicial cases classified by severity.',
    },
  },
]

export default function MonopoliosPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <p className="reveal-on-mount reveal-d1 text-center text-[11px] tracking-[3px] text-amber-400/80 uppercase">
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
        href="/caso/monopolios/resumen"
        className="reveal-on-mount reveal-d6 group block py-6 text-center"
      >
        <span className="font-serif text-2xl font-bold text-zinc-50 transition-colors group-hover:text-amber-400 sm:text-3xl">
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
              className="group flex items-start gap-4 border-b border-zinc-800/40 py-7 transition-colors hover:border-amber-500/30"
            >
              <span className="mt-2.5 block h-2 w-2 shrink-0 rounded-full bg-amber-500/50 transition-colors group-hover:bg-amber-400" />
              <div>
                <span className="font-serif text-lg font-bold text-zinc-100 transition-colors group-hover:text-amber-400 sm:text-xl">
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

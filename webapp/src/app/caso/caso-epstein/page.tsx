'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'

const t = {
  badge: {
    es: 'Investigacion · Oficina de Rendicion de Cuentas',
    en: 'Investigation · Office of Accountability',
  },
  title: {
    es: 'Caso Epstein',
    en: 'The Epstein Case',
  },
  hook: {
    es: 'Una red que abarca 7.276 entidades, 374 actores verificados y decadas de impunidad institucional. Esta investigacion cruzo documentos judiciales, registros de vuelo y estructuras offshore para reconstruir la trama.',
    en: 'A network spanning 7,276 entities, 374 verified actors, and decades of institutional impunity. This investigation cross-referenced court documents, flight logs, and offshore structures to reconstruct the web.',
  },
  cta: {
    es: 'Leer resumen de la investigacion',
    en: 'Read investigation summary',
  },
  ctaDesc: {
    es: '374 actores · 1.044 documentos · 12 causas judiciales',
    en: '374 actors · 1,044 documents · 12 legal cases',
  },
} as const

const STATS = [
  { value: '7,276', label: { es: 'entidades en el grafo', en: 'entities in the graph' } },
  { value: '374', label: { es: 'actores verificados', en: 'verified actors' } },
  { value: '1,044', label: { es: 'documentos procesados', en: 'documents processed' } },
  { value: '12', label: { es: 'causas judiciales', en: 'legal cases' } },
]

const LINKS = [
  {
    href: '/caso/caso-epstein/cronologia',
    label: { es: 'Cronologia', en: 'Chronology' },
    desc: {
      es: 'Desde los primeros vinculos en los anos noventa hasta las causas judiciales abiertas. Cada evento clave con fecha, fuente y contexto.',
      en: 'From the earliest ties in the 1990s to open legal proceedings. Every key event with date, source, and context.',
    },
  },
  {
    href: '/caso/caso-epstein/investigacion',
    label: { es: 'Hallazgos verificados', en: 'Verified findings' },
    desc: {
      es: 'Cada afirmacion respaldada por documentos judiciales, registros de vuelo o declaraciones testimoniales. Clasificados por severidad y nivel de confianza.',
      en: 'Every claim backed by court documents, flight logs, or testimonial statements. Classified by severity and confidence level.',
    },
  },
  {
    href: '/caso/caso-epstein/evidencia',
    label: { es: 'Evidencia', en: 'Evidence' },
    desc: {
      es: 'Documentos originales, registros publicos y fuentes primarias organizados por tipo y relevancia para cada linea de investigacion.',
      en: 'Original documents, public records, and primary sources organized by type and relevance to each investigation thread.',
    },
  },
]

export default function CasoEpsteinPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <p className="reveal-on-mount reveal-d1 text-center text-[11px] tracking-[3px] text-red-400/80 uppercase">
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
        href="/caso/caso-epstein/resumen"
        className="reveal-on-mount reveal-d6 group block py-6 text-center"
      >
        <span className="font-serif text-2xl font-bold text-zinc-50 transition-colors group-hover:text-red-400 sm:text-3xl">
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
              className="group flex items-start gap-4 border-b border-zinc-800/40 py-7 transition-colors hover:border-red-500/30"
            >
              <span className="mt-2.5 block h-2 w-2 shrink-0 rounded-full bg-red-500/50 transition-colors group-hover:bg-red-400" />
              <div>
                <span className="font-serif text-lg font-bold text-zinc-100 transition-colors group-hover:text-red-400 sm:text-xl">
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

'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/language-context'

const t = {
  badge: {
    es: 'Investigacion · Oficina de Rendicion de Cuentas',
    en: 'Investigation · Office of Accountability',
  },
  title: {
    es: 'Dictadura Militar Argentina (1976-1983)',
    en: 'Argentine Military Dictatorship (1976-1983)',
  },
  hook: {
    es: '9.415 victimas documentadas, 774 centros clandestinos de detencion, 14.512 nodos en el grafo de conocimiento y 81,5% de impunidad. Esta investigacion cruzo 12 fuentes publicas para mapear el aparato represivo completo y las brechas de rendicion de cuentas que persisten 50 anos despues.',
    en: '9,415 documented victims, 774 clandestine detention centers, 14,512 nodes in the knowledge graph, and 81.5% impunity. This investigation cross-referenced 12 public sources to map the complete repressive apparatus and the accountability gaps that persist 50 years later.',
  },
  cta: {
    es: 'Leer investigacion completa',
    en: 'Read full investigation',
  },
  ctaDesc: {
    es: '9 capitulos · 12 fuentes de datos · 25 olas de ingestion automatizada',
    en: '9 chapters · 12 data sources · 25 automated ingestion waves',
  },
} as const

const STATS = [
  { value: '9,415', label: { es: 'victimas documentadas', en: 'documented victims' } },
  { value: '81.5%', label: { es: 'represores sin causa judicial', en: 'represors without trial' } },
  { value: '774', label: { es: 'centros clandestinos de detencion', en: 'clandestine detention centers' } },
  { value: '14,512', label: { es: 'nodos en el grafo', en: 'nodes in the graph' } },
]

const BASE_PATH = '/caso/caso-dictadura'

const LINKS = [
  {
    href: `${BASE_PATH}/cronologia`,
    label: { es: 'Cronologia', en: 'Chronology' },
    desc: {
      es: 'Desde el Operativo Independencia (1975) hasta la desclasificacion SIDE (2026). Golpe, leyes de impunidad, indultos, megacausas.',
      en: 'From Operativo Independencia (1975) to the SIDE declassification (2026). Coup, impunity laws, pardons, megacausas.',
    },
  },
  {
    href: `${BASE_PATH}/actores`,
    label: { es: 'Actores', en: 'Actors' },
    desc: {
      es: 'Junta Militar, comandantes de zona, agentes SIDE, corporaciones complices. Perfiles con cadena de mando y vinculo judicial.',
      en: 'Military Junta, zone commanders, SIDE agents, complicit corporations. Profiles with chain of command and judicial links.',
    },
  },
  {
    href: `${BASE_PATH}/investigacion`,
    label: { es: 'Hallazgos verificados', en: 'Verified findings' },
    desc: {
      es: 'Cada afirmacion con fuente. Desapariciones, centros clandestinos, complicidad empresarial, Plan Condor y brechas de rendicion de cuentas.',
      en: 'Every claim with source. Disappearances, clandestine centers, corporate complicity, Plan Condor, and accountability gaps.',
    },
  },
  {
    href: `${BASE_PATH}/evidencia`,
    label: { es: 'Evidencia', en: 'Evidence' },
    desc: {
      es: '535 documentos SIDE, 30 cables desclasificados de EE.UU., 40 testimonios del Nunca Mas, 281 actas de la Junta, 12 sentencias judiciales.',
      en: '535 SIDE documents, 30 declassified US cables, 40 Nunca Mas testimonies, 281 Junta meeting minutes, 12 court verdicts.',
    },
  },
]

export default function CasoDictaduraPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <p className="reveal-on-mount reveal-d1 text-center text-[11px] tracking-[3px] text-stone-400/80 uppercase">
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
        href={`${BASE_PATH}/resumen`}
        className="reveal-on-mount reveal-d6 group block py-6 text-center"
      >
        <span className="font-serif text-2xl font-bold text-zinc-50 transition-colors group-hover:text-stone-400 sm:text-3xl">
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
              className="group flex items-start gap-4 border-b border-zinc-800/40 py-7 transition-colors hover:border-stone-500/30"
            >
              <span className="mt-2.5 block h-2 w-2 shrink-0 rounded-full bg-stone-500/50 transition-colors group-hover:bg-stone-400" />
              <div>
                <span className="font-serif text-lg font-bold text-zinc-100 transition-colors group-hover:text-stone-400 sm:text-xl">
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

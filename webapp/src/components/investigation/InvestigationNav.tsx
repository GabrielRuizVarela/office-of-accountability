'use client'

/**
 * Sub-navigation tabs for the investigation layout.
 * Tab configuration driven by registry config per case.
 * Includes a language toggle that reads/writes from LanguageContext.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useLanguage, type Lang } from '@/lib/language-context'
import { getClientConfig } from '@/lib/investigations/registry'
import type { TabId } from '@/lib/investigations/types'

interface InvestigationNavProps {
  readonly slug: string
}

// ---------------------------------------------------------------------------
// Tab definitions — maps each TabId to its route suffix and bilingual label
// ---------------------------------------------------------------------------

const TAB_DEFS: Readonly<Record<TabId, { readonly href: string; readonly label: Record<Lang, string> }>> = {
  resumen: { href: '/resumen', label: { en: 'Summary', es: 'Resumen' } },
  investigacion: { href: '/investigacion', label: { en: 'Investigation', es: 'Investigacion' } },
  cronologia: { href: '/cronologia', label: { en: 'Timeline', es: 'Cronologia' } },
  evidencia: { href: '/evidencia', label: { en: 'Evidence', es: 'Evidencia' } },
  grafo: { href: '/grafo', label: { en: 'Connections', es: 'Conexiones' } },
  dinero: { href: '/dinero', label: { en: 'The Money', es: 'El Dinero' } },
  simular: { href: '/simular', label: { en: 'Simulation', es: 'Simulacion' } },
  vuelos: { href: '/vuelos', label: { en: 'Flights', es: 'Vuelos' } },
  proximidad: { href: '/proximidad', label: { en: 'Proximity', es: 'Proximidad' } },
  conexiones: { href: '/conexiones', label: { en: 'Connections', es: 'Conexiones' } },
}

const HOME_TAB = { href: '', label: { en: 'Overview', es: 'Inicio' } } as const

const DEFAULT_TAB_IDS: readonly TabId[] = [
  'resumen', 'investigacion', 'grafo', 'cronologia', 'evidencia',
]

export function InvestigationNav({ slug }: InvestigationNavProps) {
  const pathname = usePathname()
  const { lang, setLang } = useLanguage()
  const base = `/caso/${slug}`

  const config = getClientConfig(slug)
  const tabIds = config?.tabs ?? DEFAULT_TAB_IDS
  const tabs = [
    { href: base, label: HOME_TAB.label[lang] },
    ...tabIds.map((id) => ({
      href: `${base}${TAB_DEFS[id].href}`,
      label: TAB_DEFS[id].label[lang],
    })),
  ]

  return (
    <nav className="scrollbar-none flex items-center gap-1 overflow-x-auto border-b border-zinc-800 px-4">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}

      {/* Language toggle */}
      <div className="ml-auto flex shrink-0 items-center gap-1 rounded-lg border border-zinc-800 p-0.5">
        <button
          onClick={() => setLang('en')}
          className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
            lang === 'en'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLang('es')}
          className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
            lang === 'es'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          ES
        </button>
      </div>
    </nav>
  )
}

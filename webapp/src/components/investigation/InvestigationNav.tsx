'use client'

/**
 * Sub-navigation tabs for the investigation layout.
 * Per-case tab configuration via CASE_TABS map.
 * Includes a language toggle that reads/writes from LanguageContext.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useLanguage, type Lang } from '@/lib/language-context'
import type { TabId } from '@/lib/investigations/types'

interface NavTab {
  readonly href: string
  readonly label: Record<Lang, string>
}

interface InvestigationNavProps {
  readonly slug: string
  readonly tabs?: readonly TabId[]
}

// ---------------------------------------------------------------------------
// Standard tab labels — maps each TabId to its href suffix and bilingual label
// ---------------------------------------------------------------------------

const HOME_TAB: NavTab = { href: '', label: { en: 'Home', es: 'Inicio' } }

const TAB_LABELS: Readonly<Record<TabId, NavTab>> = {
  resumen:       { href: '/resumen',       label: { en: 'Summary',       es: 'Resumen' } },
  investigacion: { href: '/investigacion', label: { en: 'Investigation', es: 'Investigacion' } },
  cronologia:    { href: '/cronologia',    label: { en: 'Timeline',      es: 'Cronologia' } },
  evidencia:     { href: '/evidencia',     label: { en: 'Evidence',      es: 'Evidencia' } },
  grafo:         { href: '/grafo',         label: { en: 'Connections',   es: 'Conexiones' } },
  dinero:        { href: '/dinero',        label: { en: 'The Money',     es: 'El Dinero' } },
  simular:       { href: '/simular',       label: { en: 'Simulation',    es: 'Simulacion' } },
  vuelos:        { href: '/vuelos',        label: { en: 'Flights',       es: 'Vuelos' } },
  proximidad:    { href: '/proximidad',    label: { en: 'Proximity',     es: 'Proximidad' } },
  conexiones:    { href: '/conexiones',    label: { en: 'Connections',   es: 'Conexiones' } },
}

const DEFAULT_TABS: readonly NavTab[] = [
  HOME_TAB,
  TAB_LABELS.resumen,
  TAB_LABELS.investigacion,
  TAB_LABELS.grafo,
  TAB_LABELS.cronologia,
  TAB_LABELS.evidencia,
]

export function InvestigationNav({ slug, tabs: tabIds }: InvestigationNavProps) {
  const pathname = usePathname()
  const { lang, setLang } = useLanguage()
  const base = `/caso/${slug}`
  const tabDefs = tabIds
    ? [HOME_TAB, ...tabIds.map((id) => TAB_LABELS[id])]
    : DEFAULT_TABS
  const tabs = tabDefs.map((t) => ({ href: `${base}${t.href}`, label: t.label[lang] }))

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

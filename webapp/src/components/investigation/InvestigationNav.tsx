'use client'

/**
 * Sub-navigation tabs for the investigation layout.
 * Tab list driven by investigation registry config; label/href overrides here.
 * Includes a language toggle that reads/writes from LanguageContext.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useLanguage, type Lang } from '@/lib/language-context'
import { getClientConfig } from '@/lib/investigations/registry'
import type { TabId } from '@/lib/investigations/types'

interface NavTab {
  readonly href: string
  readonly label: Record<Lang, string>
}

interface InvestigationNavProps {
  readonly slug: string
}

// ---------------------------------------------------------------------------
// Tab metadata defaults (one entry per TabId)
// ---------------------------------------------------------------------------

const TAB_DEFAULTS: Record<TabId, NavTab> = {
  resumen:       { href: '/resumen',       label: { en: 'Summary',        es: 'Resumen' } },
  investigacion: { href: '/investigacion', label: { en: 'Investigation',  es: 'Investigacion' } },
  cronologia:    { href: '/cronologia',    label: { en: 'Timeline',       es: 'Cronologia' } },
  evidencia:     { href: '/evidencia',     label: { en: 'Evidence',       es: 'Evidencia' } },
  grafo:         { href: '/grafo',         label: { en: 'Connections',    es: 'Conexiones' } },
  dinero:        { href: '/dinero',        label: { en: 'The Money',      es: 'El Dinero' } },
  simular:       { href: '/simular',       label: { en: 'Simulation',     es: 'Simulacion' } },
  vuelos:        { href: '/vuelos',        label: { en: 'Flights',        es: 'Vuelos' } },
  proximidad:    { href: '/proximidad',    label: { en: 'Proximity',      es: 'Proximidad' } },
  conexiones:    { href: '/conexiones',    label: { en: 'Connections',    es: 'Conexiones' } },
}

// ---------------------------------------------------------------------------
// Per-slug overrides (only where defaults don't match current labels)
// ---------------------------------------------------------------------------

const LABEL_OVERRIDES: Partial<Record<string, Partial<Record<TabId, Record<Lang, string>>>>> = {
  'caso-libra': {
    resumen:       { en: 'What happened', es: 'Que paso' },
    investigacion: { en: 'Evidence',      es: 'Pruebas' },
    evidencia:     { en: 'Documents',     es: 'Evidencia' },
    simular:       { en: 'Predictions',   es: 'Predicciones' },
    dinero:        { en: 'The Money',     es: 'El dinero' },
  },
}

const HREF_OVERRIDES: Partial<Record<string, Partial<Record<TabId, string>>>> = {
  'caso-epstein': {
    simular: '/simulacion',
  },
}

// ---------------------------------------------------------------------------
// Home tab (always first)
// ---------------------------------------------------------------------------

const HOME_TAB: NavTab = { href: '', label: { en: 'Home', es: 'Inicio' } }

const HOME_LABEL_OVERRIDES: Record<string, Record<Lang, string>> = {
  'caso-epstein': { en: 'Overview', es: 'Inicio' },
}

// ---------------------------------------------------------------------------
// Fallback for unregistered slugs
// ---------------------------------------------------------------------------

const DEFAULT_TABS: readonly NavTab[] = [
  { href: '', label: { en: 'Home', es: 'Inicio' } },
  { href: '/resumen', label: { en: 'Summary', es: 'Resumen' } },
  { href: '/investigacion', label: { en: 'Investigation', es: 'Investigacion' } },
  { href: '/grafo', label: { en: 'Connections', es: 'Conexiones' } },
  { href: '/cronologia', label: { en: 'Timeline', es: 'Cronologia' } },
  { href: '/evidencia', label: { en: 'Evidence', es: 'Evidencia' } },
]

// ---------------------------------------------------------------------------
// Build tabs from registry config
// ---------------------------------------------------------------------------

function buildTabs(slug: string): readonly NavTab[] {
  // Try direct slug, then with caso- prefix (handles finanzas-politicas → caso-finanzas-politicas)
  const config = getClientConfig(slug) ?? getClientConfig(`caso-${slug}`)
  if (!config) return DEFAULT_TABS

  const homeLabel = HOME_LABEL_OVERRIDES[slug] ?? HOME_TAB.label
  const homeDef: NavTab = { href: '', label: homeLabel }

  return [
    homeDef,
    ...config.tabs.map((id) => {
      const base = TAB_DEFAULTS[id]
      const labelOverride = LABEL_OVERRIDES[slug]?.[id]
      const hrefOverride = HREF_OVERRIDES[slug]?.[id]
      return {
        href: hrefOverride ?? base.href,
        label: labelOverride ?? base.label,
      }
    }),
  ]
}

export function InvestigationNav({ slug }: InvestigationNavProps) {
  const pathname = usePathname()
  const { lang, setLang } = useLanguage()
  const base = `/caso/${slug}`
  const tabDefs = buildTabs(slug)
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

'use client'

/**
 * Sub-navigation tabs for the investigation layout.
 * Per-case tab configuration via CASE_TABS map.
 * Locale comes from the URL via next-intl.
 */

import { useLocale } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { usePathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'

interface NavTab {
  readonly href: string
  readonly label: Record<Locale, string>
}

interface InvestigationNavProps {
  readonly slug: string
}

// ---------------------------------------------------------------------------
// Per-case tab configuration (bilingual labels)
// ---------------------------------------------------------------------------

const CASE_TABS: Readonly<Record<string, readonly NavTab[]>> = {
  'caso-epstein': [
    { href: '', label: { en: 'Overview', es: 'Inicio' } },
    { href: '/resumen', label: { en: 'Summary', es: 'Resumen' } },
    { href: '/investigacion', label: { en: 'Investigation', es: 'Investigacion' } },
    { href: '/objetivos', label: { en: 'Targets', es: 'Objetivos' } },
    { href: '/grafo', label: { en: 'Connections', es: 'Conexiones' } },
    { href: '/cronologia', label: { en: 'Timeline', es: 'Cronologia' } },
    { href: '/vuelos', label: { en: 'Flights', es: 'Vuelos' } },
    { href: '/evidencia', label: { en: 'Evidence', es: 'Evidencia' } },
    { href: '/proximidad', label: { en: 'Proximity', es: 'Proximidad' } },
  ],
  'caso-libra': [
    { href: '', label: { en: 'Home', es: 'Inicio' } },
    { href: '/resumen', label: { en: 'What happened', es: 'Que paso' } },
    { href: '/investigacion', label: { en: 'Evidence', es: 'Pruebas' } },
    { href: '/objetivos', label: { en: 'Targets', es: 'Objetivos' } },
    { href: '/cronologia', label: { en: 'Timeline', es: 'Cronologia' } },
    { href: '/dinero', label: { en: 'The Money', es: 'El dinero' } },
    { href: '/evidencia', label: { en: 'Documents', es: 'Evidencia' } },
    { href: '/grafo', label: { en: 'Connections', es: 'Conexiones' } },
  ],
  'riesgo-nuclear': [
    { href: '', label: { en: 'Dashboard', es: 'Panel' } },
    { href: '/resumen', label: { en: 'Report', es: 'Informe' } },
    { href: '/grafo', label: { en: 'Graph', es: 'Grafo' } },
    { href: '/cronologia', label: { en: 'Timeline', es: 'Cronologia' } },
    { href: '/evidencia', label: { en: 'Sources', es: 'Fuentes' } },
  ],
  'caso-dictadura': [
    { href: '', label: { en: 'Overview', es: 'Inicio' } },
    { href: '/resumen', label: { en: 'Summary', es: 'Resumen' } },
    { href: '/investigacion', label: { en: 'Investigation', es: 'Investigación' } },
    { href: '/actores', label: { en: 'Actors', es: 'Actores' } },
    { href: '/cronologia', label: { en: 'Timeline', es: 'Cronología' } },
    { href: '/grafo', label: { en: 'Connections', es: 'Conexiones' } },
    { href: '/evidencia', label: { en: 'Evidence', es: 'Evidencia' } },
  ],
  'finanzas-politicas': [
    { href: '', label: { en: 'Home', es: 'Inicio' } },
    { href: '/resumen', label: { en: 'Summary', es: 'Resumen' } },
    { href: '/investigacion', label: { en: 'Investigation', es: 'Investigacion' } },
    { href: '/objetivos', label: { en: 'Targets', es: 'Objetivos' } },
    { href: '/cronologia', label: { en: 'Timeline', es: 'Cronologia' } },
    { href: '/dinero', label: { en: 'The Money', es: 'El Dinero' } },
    { href: '/conexiones', label: { en: 'Connections', es: 'Conexiones' } },
  ],
  'monopolios': [
    { href: '', label: { en: 'Home', es: 'Inicio' } },
    { href: '/resumen', label: { en: 'Summary', es: 'Resumen' } },
    { href: '/investigacion', label: { en: 'Investigation', es: 'Investigacion' } },
    { href: '/cronologia', label: { en: 'Timeline', es: 'Cronologia' } },
    { href: '/actores', label: { en: 'Actors', es: 'Actores' } },
    { href: '/conexiones', label: { en: 'Connections', es: 'Conexiones' } },
  ],
  'obras-publicas': [
    { href: '', label: { en: 'Home', es: 'Inicio' } },
    { href: '/resumen', label: { en: 'Summary', es: 'Resumen' } },
    { href: '/investigacion', label: { en: 'Investigation', es: 'Investigacion' } },
    { href: '/cronologia', label: { en: 'Timeline', es: 'Cronologia' } },
    { href: '/dinero', label: { en: 'The Money', es: 'El Dinero' } },
    { href: '/conexiones', label: { en: 'Connections', es: 'Conexiones' } },
    { href: '/mapa', label: { en: 'Map', es: 'Mapa' } },
  ],
}

const DEFAULT_TABS: readonly NavTab[] = [
  { href: '', label: { en: 'Home', es: 'Inicio' } },
  { href: '/resumen', label: { en: 'Summary', es: 'Resumen' } },
  { href: '/investigacion', label: { en: 'Investigation', es: 'Investigacion' } },
  { href: '/objetivos', label: { en: 'Targets', es: 'Objetivos' } },
  { href: '/grafo', label: { en: 'Connections', es: 'Conexiones' } },
  { href: '/cronologia', label: { en: 'Timeline', es: 'Cronologia' } },
  { href: '/evidencia', label: { en: 'Evidence', es: 'Evidencia' } },
]

export function InvestigationNav({ slug }: InvestigationNavProps) {
  const pathname = usePathname()
  const locale = useLocale() as Locale
  const base = `/caso/${slug}`
  const tabDefs = CASE_TABS[slug] ?? DEFAULT_TABS
  const tabs = tabDefs.map((t) => ({ href: `${base}${t.href}`, label: t.label[locale] }))

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
    </nav>
  )
}

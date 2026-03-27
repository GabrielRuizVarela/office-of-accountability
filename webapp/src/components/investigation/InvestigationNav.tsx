'use client'

/**
 * Sub-navigation tabs for the investigation layout.
 * Per-case tab configuration via CASE_TABS map.
 * Includes a language toggle that reads/writes from LanguageContext.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useLanguage, type Lang } from '@/lib/language-context'


interface NavTab {
  readonly href: string
  readonly label: Record<Lang, string>
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
  'adorni': [
    { href: '', label: { en: 'Home', es: 'Inicio' } },
    { href: '/resumen', label: { en: 'Summary', es: 'Resumen' } },
    { href: '/investigacion', label: { en: 'Investigation', es: 'Investigacion' } },
    { href: '/cronologia', label: { en: 'Timeline', es: 'Cronologia' } },
    { href: '/dinero', label: { en: 'The Money', es: 'El Dinero' } },
    { href: '/conexiones', label: { en: 'Connections', es: 'Conexiones' } },
    { href: '/metodologia', label: { en: 'Methodology', es: 'Metodologia' } },
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
  const { lang } = useLanguage()
  const base = `/caso/${slug}`
  const tabDefs = CASE_TABS[slug] ?? DEFAULT_TABS
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

    </nav>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavTab {
  readonly href: string
  readonly label: string
}

interface InvestigationNavProps {
  readonly slug: string
}

// ---------------------------------------------------------------------------
// Per-case tab configuration
// ---------------------------------------------------------------------------

const CASE_TABS: Readonly<Record<string, readonly NavTab[]>> = {
  'caso-epstein': [
    { href: '', label: 'Inicio' },
    { href: '/resumen', label: 'Resumen' },
    { href: '/investigacion', label: 'Investigacion' },
    { href: '/grafo', label: 'Conexiones' },
    { href: '/cronologia', label: 'Cronologia' },
    { href: '/vuelos', label: 'Vuelos' },
    { href: '/evidencia', label: 'Evidencia' },
    { href: '/proximidad', label: 'Proximidad' },
    { href: '/simulacion', label: 'Simulacion' },
  ],
  'caso-libra': [
    { href: '', label: 'Inicio' },
    { href: '/resumen', label: 'Que paso' },
    { href: '/investigacion', label: 'Pruebas' },
    { href: '/cronologia', label: 'Cronologia' },
    { href: '/dinero', label: 'El dinero' },
    { href: '/evidencia', label: 'Evidencia' },
    { href: '/grafo', label: 'Conexiones' },
    { href: '/simular', label: 'Predicciones' },
  ],
}

const DEFAULT_TABS: readonly NavTab[] = [
  { href: '', label: 'Inicio' },
  { href: '/resumen', label: 'Resumen' },
  { href: '/investigacion', label: 'Investigacion' },
  { href: '/grafo', label: 'Conexiones' },
  { href: '/cronologia', label: 'Cronologia' },
  { href: '/evidencia', label: 'Evidencia' },
]

export function InvestigationNav({ slug }: InvestigationNavProps) {
  const pathname = usePathname()
  const base = `/caso/${slug}`
  const tabDefs = CASE_TABS[slug] ?? DEFAULT_TABS
  const tabs = tabDefs.map((t) => ({ href: `${base}${t.href}`, label: t.label }))

  return (
    <nav className="scrollbar-none flex gap-1 overflow-x-auto border-b border-zinc-800 px-4">
      <Link
        href="/"
        className="whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm font-bold text-zinc-50 transition-colors hover:text-purple-300"
      >
        ORC
      </Link>
      <span className="self-center text-zinc-700">|</span>
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

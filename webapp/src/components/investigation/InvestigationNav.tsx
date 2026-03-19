'use client'

/**
 * Sub-navigation tabs for the investigation layout.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavTab {
  readonly href: string
  readonly label: string
}

interface InvestigationNavProps {
  readonly slug: string
}

export function InvestigationNav({ slug }: InvestigationNavProps) {
  const pathname = usePathname()
  const base = `/caso/${slug}`

  const tabs: readonly NavTab[] = [
    { href: base, label: 'Inicio' },
    { href: `${base}/resumen`, label: 'Que paso' },
    { href: `${base}/investigacion`, label: 'Pruebas' },
    { href: `${base}/cronologia`, label: 'Cronologia' },
    { href: `${base}/dinero`, label: 'El dinero' },
    { href: `${base}/evidencia`, label: 'Evidencia' },
    { href: `${base}/grafo`, label: 'Conexiones' },
    { href: `${base}/simular`, label: 'Simular' },
  ]

  return (
    <nav className="scrollbar-none flex gap-1 overflow-x-auto border-b border-zinc-800 px-4">
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

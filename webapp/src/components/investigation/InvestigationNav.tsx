'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavTab {
  readonly href: string
  readonly label: string
}

interface InvestigationNavProps {
  readonly casoSlug: string
}

export function InvestigationNav({ casoSlug }: InvestigationNavProps) {
  const pathname = usePathname()
  const basePath = `/caso/${casoSlug}`

  const tabs: NavTab[] = [
    { href: basePath, label: 'Overview' },
    { href: `${basePath}/resumen`, label: 'Summary' },
    { href: `${basePath}/investigacion`, label: 'Investigation' },
    { href: `${basePath}/grafo`, label: 'Network Graph' },
    { href: `${basePath}/cronologia`, label: 'Timeline' },
    { href: `${basePath}/vuelos`, label: 'Flights' },
    { href: `${basePath}/evidencia`, label: 'Evidence' },
    { href: `${basePath}/proximidad`, label: 'Proximity' },
    { href: `${basePath}/simulacion`, label: 'Simulation' },
  ]

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex gap-1 overflow-x-auto py-1 scrollbar-hide">
          <Link
            href="/"
            className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-bold text-zinc-50 transition-colors hover:bg-zinc-800/50"
          >
            ORC
          </Link>
          <span className="self-center text-zinc-700">|</span>
          {tabs.map((tab) => {
            const isActive = pathname === tab.href ||
              (tab.href !== basePath && pathname.startsWith(tab.href))

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-50'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

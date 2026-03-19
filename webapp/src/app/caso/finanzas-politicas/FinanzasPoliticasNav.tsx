'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavTab {
  readonly href: string
  readonly label: string
}

const BASE_PATH = '/caso/finanzas-politicas'

const TABS: readonly NavTab[] = [
  { href: BASE_PATH, label: 'Inicio' },
  { href: `${BASE_PATH}/investigacion`, label: 'Investigacion' },
  { href: `${BASE_PATH}/cronologia`, label: 'Cronologia' },
  { href: `${BASE_PATH}/dinero`, label: 'El Dinero' },
  { href: `${BASE_PATH}/conexiones`, label: 'Conexiones' },
]

export function FinanzasPoliticasNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex gap-1 overflow-x-auto py-1 scrollbar-hide">
          {TABS.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== BASE_PATH && pathname.startsWith(tab.href))

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

'use client'

import Link from 'next/link'
import { investigations } from '@/config/investigations'
import { useState } from 'react'

const ACTIVE = investigations.filter((i) => i.status === 'active')

const DOT_COLORS: Record<string, string> = {
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
  yellow: 'bg-yellow-500',
  stone: 'bg-stone-400',
}

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-zinc-50">
          ORC
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 text-xs sm:flex">
          {ACTIVE.map((inv) => (
            <Link
              key={inv.slug}
              href={inv.href}
              className="flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${DOT_COLORS[inv.color] ?? 'bg-zinc-500'}`} />
              {inv.title.replace(/^Caso /, '').split(':')[0]}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="text-zinc-400 sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-zinc-800 px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-2.5 text-sm">
            {ACTIVE.map((inv) => (
              <Link
                key={inv.slug}
                href={inv.href}
                className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-zinc-100"
                onClick={() => setMenuOpen(false)}
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${DOT_COLORS[inv.color] ?? 'bg-zinc-500'}`} />
                {inv.title.replace(/^Caso /, '').split(':')[0]}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}

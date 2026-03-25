'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { LanguageToggle } from './LanguageToggle'

export function SiteNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/explorar' as const, label: t('explore') },
    { href: '/investigaciones' as const, label: t('investigations') },
  ]

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-zinc-50">
          ORC
        </Link>

        <nav className="hidden items-center gap-6 text-sm sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                pathname.startsWith(link.href)
                  ? 'text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth/signin"
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            {t('signIn')}
          </Link>
          <LanguageToggle />
        </nav>

        <div className="flex items-center gap-3 sm:hidden">
          <LanguageToggle />
          <button
            type="button"
            className="text-zinc-400"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-zinc-800 px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auth/signin"
              className="text-zinc-400 transition-colors hover:text-zinc-100"
              onClick={() => setMenuOpen(false)}
            >
              {t('signIn')}
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}

'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function Hero() {
  const t = useTranslations('hero')

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-zinc-800 px-4 py-1.5 text-xs text-zinc-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-500" />
          {t('badge')}
        </div>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
          {t('title')}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
          {t('subtitle')}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/explorar"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500"
          >
            {t('ctaExplore')}
          </Link>
          <Link
            href="/investigaciones"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
          >
            {t('ctaInvestigations')}
          </Link>
        </div>
      </div>
    </section>
  )
}

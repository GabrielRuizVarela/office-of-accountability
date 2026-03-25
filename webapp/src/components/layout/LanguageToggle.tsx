'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'

export function LanguageToggle() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const other = locale === 'es' ? 'en' : 'es'

  function switchLocale() {
    router.replace(pathname, { locale: other })
  }

  return (
    <button
      onClick={switchLocale}
      className="rounded-md border border-zinc-700 px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
    >
      {other.toUpperCase()}
    </button>
  )
}

'use client'

import { createTranslator } from '@/i18n/messages'
import { useLanguage } from '@/lib/language-context'

export function Masthead() {
  const { lang } = useLanguage()
  const t = createTranslator('masthead', lang)

  return (
    <header className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center sm:pt-24">
      <div className="border-b-[3px] border-double border-zinc-600 pb-8">
        <h1 className="animate-tracking-tighten font-serif text-4xl font-black text-zinc-50 sm:text-5xl lg:text-[42px]">
          {t('title')}
        </h1>
        <p className="animate-fade-in-up mt-2 text-[12px] tracking-[2px] text-zinc-500 uppercase">
          {t('tagline')}
        </p>
      </div>
    </header>
  )
}

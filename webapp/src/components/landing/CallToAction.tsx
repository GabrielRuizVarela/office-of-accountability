'use client'

import { createTranslator } from '@/i18n/messages'
import { useLanguage } from '@/lib/language-context'
import { ScrollReveal } from './ScrollReveal'

export function CallToAction() {
  const { lang } = useLanguage()
  const t = createTranslator('cta', lang)

  return (
    <section className="mx-auto max-w-xl border-t border-zinc-800 px-4 py-12 text-center">
      <ScrollReveal>
        <h2 className="font-serif text-xl font-bold text-zinc-50 sm:text-[22px]">{t('title')}</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
          {t('description')}
        </p>
        <div className="mt-6 flex flex-col items-center gap-4">
          <a
            href="mailto:contact@officeofaccountability.org"
            className="btn-press rounded bg-zinc-50 px-6 py-2.5 text-[13px] font-semibold text-zinc-950"
          >
            {t('ctaContact')}
          </a>
          <span className="text-[13px] text-zinc-500 select-all">contact@officeofaccountability.org</span>
        </div>
      </ScrollReveal>
    </section>
  )
}

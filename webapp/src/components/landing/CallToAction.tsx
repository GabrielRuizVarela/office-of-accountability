import { createTranslator } from '@/i18n/messages'

export function CallToAction() {
  const t = createTranslator('cta')

  return (
    <section className="mx-auto max-w-xl border-t border-zinc-800 px-4 py-12 text-center">
      <h2 className="font-serif text-xl font-bold text-zinc-50 sm:text-[22px]">{t('title')}</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
        {t('description')}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          href="mailto:contact@officeofaccountability.org"
          className="rounded bg-zinc-50 px-6 py-2.5 text-[13px] font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          {t('ctaContact')}
        </a>
      </div>
    </section>
  )
}

import { createTranslator } from '@/i18n/messages'

export function NarrativeIntro() {
  const t = createTranslator('narrative')

  return (
    <section className="mx-auto max-w-xl border-b border-zinc-800 px-4 py-12 text-center sm:py-16">
      <h2 className="font-serif text-2xl leading-snug text-zinc-200 sm:text-[28px]">
        {t('intro')}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
        {t('subtitle')}
      </p>
    </section>
  )
}

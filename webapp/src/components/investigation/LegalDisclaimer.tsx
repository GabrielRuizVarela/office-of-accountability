'use client'
import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/config'

/**
 * Legal disclaimer shown on investigation pages.
 * LegalDisclaimer — static, pass locale prop directly.
 * BilingualLegalDisclaimer — reads locale from LanguageContext.
 */


interface LegalDisclaimerProps {
  readonly locale?: 'en' | 'es'
}

export function LegalDisclaimer({ locale = 'es' }: LegalDisclaimerProps) {
  return <DisclaimerContent locale={locale} />
}

export function BilingualLegalDisclaimer() {
  const locale = useLocale() as Locale
  return <DisclaimerContent locale={locale} />
}

function DisclaimerContent({ locale }: { readonly locale: 'en' | 'es' }) {
  if (locale === 'en') {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-xs leading-relaxed text-zinc-500">
        <strong className="text-zinc-400">Legal notice:</strong> This is a community investigation
        based exclusively on public data (court records, congressional testimony, flight logs,
        investigative journalism, and government file releases). It does not constitute a formal
        accusation. All persons mentioned are presumed innocent.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-xs leading-relaxed text-zinc-500">
      <strong className="text-zinc-400">Aviso legal:</strong> Esta es una investigacion comunitaria
      basada exclusivamente en datos publicos (registros judiciales, testimonios del Congreso,
      bitacoras de vuelo, periodismo de investigacion y documentos gubernamentales desclasificados).
      No constituye acusacion formal. Las personas mencionadas gozan de presuncion de inocencia.
    </div>
  )
}

'use client'

/**
 * Legal disclaimer shown on investigation pages.
 * LegalDisclaimer — static, pass lang prop directly.
 * BilingualLegalDisclaimer — reads lang from LanguageContext.
 */

import { useLanguage } from '@/lib/language-context'

interface LegalDisclaimerProps {
  readonly lang?: 'en' | 'es'
}

export function LegalDisclaimer({ lang = 'es' }: LegalDisclaimerProps) {
  return <DisclaimerContent lang={lang} />
}

export function BilingualLegalDisclaimer() {
  const { lang } = useLanguage()
  return <DisclaimerContent lang={lang} />
}

function DisclaimerContent({ lang }: { readonly lang: 'en' | 'es' }) {
  if (lang === 'en') {
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

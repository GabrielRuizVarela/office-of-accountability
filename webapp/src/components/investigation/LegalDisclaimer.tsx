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
        <strong className="text-zinc-400">Legal notice:</strong> This investigation uses exclusively
        verified public sources (court records, congressional testimony, government registries, ICIJ
        offshore leaks, investigative journalism, and official file releases). No finding constitutes
        a legal accusation. Inclusion of a person does not imply guilt beyond what is documented in
        judicial records. Where &ldquo;alleged&rdquo; or &ldquo;under investigation&rdquo; is
        indicated, the claim has not been independently confirmed. All persons mentioned are presumed
        innocent unless convicted by a court of law.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-xs leading-relaxed text-zinc-500">
      <strong className="text-zinc-400">Aviso legal:</strong> Esta investigacion utiliza
      exclusivamente fuentes publicas verificadas (registros judiciales, testimonios del Congreso,
      registros gubernamentales, filtraciones offshore del ICIJ, periodismo de investigacion y
      documentos oficiales desclasificados). Ningun hallazgo constituye acusacion legal. La inclusion
      de una persona no implica culpabilidad mas alla de lo documentado en registros judiciales.
      Donde se indica &laquo;presunto&raquo; o &laquo;en investigacion&raquo;, el dato no ha sido
      confirmado de forma independiente. Todas las personas mencionadas gozan de presuncion de
      inocencia salvo condena judicial firme.
    </div>
  )
}

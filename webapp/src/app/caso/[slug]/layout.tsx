import type { Metadata } from 'next'

import { LanguageProvider } from '@/lib/language-context'
import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'
import { getClientConfig } from '@/lib/investigations/registry'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const config = getClientConfig(slug)

  if (!config) {
    return { title: 'Investigacion — Oficina de Rendicion de Cuentas' }
  }

  const lang = config.defaultLang
  const suffix =
    lang === 'es'
      ? ' — Oficina de Rendicion de Cuentas'
      : ' — Office of Accountability'

  return {
    title: `${config.name[lang]}${suffix}`,
    description: config.description[lang],
  }
}

export default async function CasoLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const config = getClientConfig(slug)
  const defaultLang = config?.defaultLang ?? 'es'

  return (
    <LanguageProvider defaultLang={defaultLang}>
      <InvestigationNav slug={slug} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <BilingualLegalDisclaimer />
        </div>
      </main>
    </LanguageProvider>
  )
}

import type { Metadata } from 'next'

import { LanguageProvider } from '@/lib/language-context'
import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'
import { getClientConfig } from '@/lib/investigations/registry'

function resolveConfig(slug: string) {
  return getClientConfig(slug) ?? getClientConfig('caso-' + slug)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const config = resolveConfig(slug)

  return {
    title: config
      ? `${config.name.en} — Office of Accountability`
      : 'Investigacion — Oficina de Rendicion de Cuentas',
    description: config?.description.en,
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
  const config = resolveConfig(slug)
  const defaultLang = config?.casoSlug === 'caso-epstein' ? 'en' : 'es'

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

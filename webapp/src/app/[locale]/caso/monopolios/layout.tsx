import type { Metadata } from 'next'

import { LanguageProvider } from '@/lib/language-context'
import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

export const metadata: Metadata = {
  title: {
    template: '%s | Monopolios en Argentina',
    default: 'Monopolios en Argentina',
  },
  description:
    'Investigacion sobre mercados monopolizados en Argentina. 44 archivos de investigacion, 829+ cruces Neo4j, 18 sectores analizados.',
  openGraph: {
    type: 'website',
    siteName: 'Oficina de Rendicion de Cuentas',
  },
}

export default function MonopoliosLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <LanguageProvider defaultLang="es">
      <div className="flex min-h-screen flex-col">
        <InvestigationNav slug="monopolios" />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
          {children}
          <div className="mt-8 border-t border-zinc-800 pt-6">
            <BilingualLegalDisclaimer />
          </div>
        </main>
      </div>
    </LanguageProvider>
  )
}

import type { Metadata } from 'next'

import { LanguageProvider } from '@/lib/language-context'
import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

export const metadata: Metadata = {
  title: {
    template: '%s | Finanzas Politicas Argentinas',
    default: 'Finanzas Politicas Argentinas',
  },
  description:
    'Investigacion sobre conexiones entre poder politico y dinero en Argentina. 617 politicos en 2+ datasets, 8 fuentes cruzadas.',
  openGraph: {
    type: 'website',
    siteName: 'Oficina de Rendicion de Cuentas',
  },
}

export default function FinanzasPoliticasLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <LanguageProvider defaultLang="es">
      <div className="flex min-h-screen flex-col">
        <InvestigationNav slug="finanzas-politicas" />
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

import type { Metadata } from 'next'

import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

export const metadata: Metadata = {
  title: {
    template: '%s | Caso Adorni',
    default: 'Caso Adorni',
  },
  description:
    'Investigacion sobre Manuel Adorni, Vocero Presidencial. Declaraciones publicas, patrimonio, conexiones corporativas, pauta oficial y cruces con otras investigaciones.',
  openGraph: {
    type: 'website',
    siteName: 'Oficina de Rendicion de Cuentas',
  },
}

export default function AdorniLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <InvestigationNav slug="adorni" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <BilingualLegalDisclaimer />
        </div>
      </main>
    </div>
  )
}

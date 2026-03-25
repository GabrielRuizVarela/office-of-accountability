import type { Metadata } from 'next'

import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

export const metadata: Metadata = {
  title: {
    template: '%s | Obras Publicas Argentinas',
    default: 'Obras Publicas Argentinas',
  },
  description:
    'Investigacion sobre contrataciones publicas en Argentina. 37,351 entidades, 7,481 obras, 3 casos internacionales de soborno. 14 fuentes de datos cruzadas.',
  openGraph: {
    type: 'website',
    siteName: 'Oficina de Rendicion de Cuentas',
  },
}

export default function ObrasPublicasLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <InvestigationNav slug="obras-publicas" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <BilingualLegalDisclaimer />
        </div>
      </main>
    </div>
  )
}

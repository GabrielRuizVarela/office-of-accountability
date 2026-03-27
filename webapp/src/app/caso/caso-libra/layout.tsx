import type { Metadata } from 'next'

import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

export const metadata: Metadata = {
  title: 'Caso Libra — Oficina de Rendicion de Cuentas',
  description:
    'Investigacion comunitaria sobre el token $LIBRA promovido por el presidente Milei. Datos publicos, blockchain, y documentos parlamentarios.',
}

export default function CasoLibraLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <InvestigationNav slug="caso-libra" />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <BilingualLegalDisclaimer />
        </div>
      </main>
    </>
  )
}

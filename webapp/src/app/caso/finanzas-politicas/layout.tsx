import { LanguageProvider } from '@/lib/language-context'
import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

export const metadata = {
  title: 'Finanzas Políticas — Oficina de Rendición de Cuentas',
  description:
    'Análisis de redes de relaciones institucionales en Argentina. 14 fuentes de datos públicos, 40 años de gobernanza democrática.',
}

export default function FinanzasPoliticasLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <LanguageProvider defaultLang="es">
      <InvestigationNav slug="finanzas-politicas" />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <BilingualLegalDisclaimer />
        </div>
      </main>
    </LanguageProvider>
  )
}

import type { Metadata } from 'next'

import { InvestigationNav } from '../../../components/investigation/InvestigationNav'
import { LegalDisclaimer } from '../../../components/investigation/LegalDisclaimer'

interface LayoutProps {
  readonly children: React.ReactNode
  readonly params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params

  return {
    title: {
      template: '%s | Epstein Investigation',
      default: 'Epstein Investigation',
    },
    openGraph: {
      type: 'website',
      siteName: 'Office of Accountability',
    },
  }
}

export default async function CasoLayout({ children, params }: LayoutProps) {
  const { slug } = await params

  return (
    <div className="flex min-h-screen flex-col">
      <InvestigationNav casoSlug={slug} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-800 px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <LegalDisclaimer />
        </div>
      </footer>
    </div>
  )
}

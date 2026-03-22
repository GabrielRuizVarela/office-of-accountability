import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Geist, Geist_Mono } from 'next/font/google'

import { detectLang, SITE_META } from '@/lib/i18n'
import { LanguageProvider } from '@/lib/language-context'
import { SessionProvider } from '@/components/auth/SessionProvider'
import { SiteNav } from '@/components/layout/SiteNav'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const lang = detectLang(h.get('accept-language'))
  const meta = SITE_META[lang]

  return {
    title: meta.title,
    description: meta.description,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const h = await headers()
  const lang = detectLang(h.get('accept-language'))

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <LanguageProvider defaultLang={lang}>
            <div className="flex min-h-screen flex-col bg-zinc-950">
              <SiteNav />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'
import { SiteNav } from '@/components/layout/SiteNav'
import { Footer } from '@/components/layout/Footer'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

// TODO: generateMetadata depends on 'metadata' namespace in message files (Task 4)
// Uncomment once messages/es.json and messages/en.json have the metadata namespace
// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ locale: string }>
// }): Promise<Metadata> {
//   const { locale } = await params
//   const t = await getTranslations({ locale, namespace: 'metadata' })
//   return {
//     title: t('siteTitle'),
//     description: t('siteDescription'),
//     alternates: {
//       languages: { es: '/es', en: '/en' },
//     },
//   }
// }

export const metadata: Metadata = {
  title: 'Oficina de Rendición de Cuentas',
  description:
    'Plataforma de conocimiento cívico para la política argentina. Explorá las conexiones entre legisladores, votaciones y legislación.',
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'es' | 'en')) {
    notFound()
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex min-h-screen flex-col bg-zinc-950">
            <SiteNav />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

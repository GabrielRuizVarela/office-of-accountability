import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

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

export const metadata: Metadata = {
  title: 'Oficina de Rendición de Cuentas',
  description:
    'Plataforma de conocimiento cívico para la política argentina. Explorá las conexiones entre legisladores, votaciones y legislación.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen flex-col bg-zinc-950">
          <SiteNav />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  )
}

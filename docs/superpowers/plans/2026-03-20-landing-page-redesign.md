# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the ORC homepage into a component-driven, i18n-ready page with global nav/footer, dynamic investigation cards from static config, feature showcase, and phased roadmap.

**Architecture:** Component-driven rebuild. Static config files mirror future Neo4j queries. Global `SiteNav` and `Footer` in root layout replace per-page inline headers/footers. i18n via next-intl (with Vinext compatibility spike and plain-JSON fallback).

**Tech Stack:** Next.js 16 (Vinext), React 19, TypeScript, Tailwind v4, next-intl (or custom fallback)

**Spec:** `docs/superpowers/specs/2026-03-20-landing-page-redesign.md`

---

## File Structure

### New files

| File | Responsibility |
|------|---------------|
| `webapp/src/config/investigations.ts` | Typed investigation config array (static data for homepage cards) |
| `webapp/src/config/roadmap.ts` | Typed roadmap phase config (static data from PRD) |
| `webapp/src/i18n/config.ts` | Locale list, default locale |
| `webapp/src/i18n/request.ts` | next-intl `getRequestConfig` (or custom fallback) |
| `webapp/messages/es.json` | Spanish UI strings for all new components |
| `webapp/messages/en.json` | English stub (partial/empty) |
| `webapp/src/components/layout/SiteNav.tsx` | Global minimal nav — client component |
| `webapp/src/components/layout/Footer.tsx` | Global footer — server component |
| `webapp/src/components/landing/Hero.tsx` | Mission-focused hero — server component |
| `webapp/src/components/landing/InvestigationCard.tsx` | Reusable investigation card — server component |
| `webapp/src/components/landing/FeatureShowcase.tsx` | Platform capability grid — server component |
| `webapp/src/components/landing/Roadmap.tsx` | Phased roadmap timeline — server component |

### Modified files

| File | Change |
|------|--------|
| `webapp/package.json` | Add `next-intl` (or no change if using custom fallback) |
| `webapp/src/app/layout.tsx` | Add SessionProvider, i18n provider, SiteNav, Footer |
| `webapp/src/app/page.tsx` | Full rewrite — compose from new components |
| `webapp/src/app/caso/[slug]/layout.tsx` | Remove inline header/footer, keep InvestigationNav + main |
| `webapp/src/app/caso/finanzas-politicas/layout.tsx` | Remove inline footer |
| `webapp/src/app/caso/finanzas-politicas/FinanzasPoliticasNav.tsx` | Remove ORC logo link |
| `webapp/src/app/explorar/page.tsx` | Remove inline header |
| `webapp/src/app/politico/[slug]/page.tsx` | Remove inline header |
| `webapp/src/app/provincias/page.tsx` | Remove inline header |
| `webapp/src/app/provincias/[province]/page.tsx` | Remove inline header |
| `webapp/src/app/investigaciones/page.tsx` | Remove inline header |
| `webapp/src/app/investigacion/[slug]/page.tsx` | Remove inline header |
| `webapp/src/app/mis-investigaciones/page.tsx` | Remove inline header |
| `webapp/src/app/perfil/page.tsx` | Remove inline header |

---

## Task 1: i18n Spike — Validate next-intl with Vinext

**Files:**
- Create: `webapp/src/i18n/config.ts`
- Create: `webapp/src/i18n/request.ts`
- Create: `webapp/messages/es.json`
- Create: `webapp/messages/en.json`
- Modify: `webapp/package.json`
- Modify: `webapp/src/app/layout.tsx`

This task validates whether `next-intl` works under Vinext. If it fails, we implement a plain-JSON fallback. The spike result determines the approach for all subsequent tasks.

- [ ] **Step 1: Install next-intl**

```bash
cd webapp && pnpm add next-intl
```

- [ ] **Step 2: Create locale config**

Create `webapp/src/i18n/config.ts`:

```typescript
export const locales = ['es', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'es'
```

- [ ] **Step 3: Create request config**

Create `webapp/src/i18n/request.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server'
import { defaultLocale } from './config'

export default getRequestConfig(async () => {
  const locale = defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

- [ ] **Step 4: Create minimal message files**

Create `webapp/messages/es.json`:

```json
{
  "nav": {
    "explore": "Explorar",
    "investigations": "Investigaciones",
    "signIn": "Iniciar sesion"
  }
}
```

Create `webapp/messages/en.json`:

```json
{
  "nav": {
    "explore": "Explore",
    "investigations": "Investigations",
    "signIn": "Sign in"
  }
}
```

- [ ] **Step 5: Add NextIntlClientProvider to root layout**

Modify `webapp/src/app/layout.tsx` — wrap `{children}` with the provider:

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Verify the app still builds and runs**

```bash
cd webapp && pnpm dev
```

Visit `http://localhost:3000` — the existing homepage should render without errors. Check browser console for i18n-related warnings.

- [ ] **Step 7: Decision gate**

If the app runs with `next-intl`: proceed with next-intl for all tasks.

If it fails (Vinext incompatibility): uninstall next-intl and implement the fallback:
- Replace `webapp/src/i18n/request.ts` with a plain helper:

```typescript
import { defaultLocale, type Locale } from './config'

const messageCache = new Map<string, Record<string, unknown>>()

export async function getMessages(locale: Locale = defaultLocale) {
  const key = locale
  if (!messageCache.has(key)) {
    messageCache.set(key, (await import(`../../messages/${locale}.json`)).default)
  }
  return messageCache.get(key)!
}

export function t(messages: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = messages
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return path
    }
  }
  return typeof current === 'string' ? current : path
}
```

- Remove `NextIntlClientProvider` from layout, pass messages via props or context instead.
- Update `layout.tsx` to use `getMessages()` directly.

- [ ] **Step 8: Commit**

```bash
git add webapp/src/i18n/ webapp/messages/ webapp/src/app/layout.tsx webapp/package.json webapp/pnpm-lock.yaml
git commit -m "feat: add i18n foundation (next-intl or custom fallback)"
```

---

## Task 2: Static Config Files

**Files:**
- Create: `webapp/src/config/investigations.ts`
- Create: `webapp/src/config/roadmap.ts`

- [ ] **Step 1: Create investigation config**

Create `webapp/src/config/investigations.ts`:

```typescript
export interface InvestigationConfig {
  slug: string
  title: string
  subtitle: string
  description: string
  status: 'active' | 'archived' | 'draft'
  color: string
  stats: { label: string; value: string }[]
  href: string
}

export const investigations: InvestigationConfig[] = [
  {
    slug: 'caso-libra',
    title: 'Caso Libra: La Memecoin del Presidente',
    subtitle: 'Investigacion activa',
    description:
      'Milei promovio $LIBRA a 19M de seguidores. El precio colapso 94% en horas. 114,000+ billeteras perdieron $251M+.',
    status: 'active',
    color: 'purple',
    stats: [
      { label: 'Perdidas', value: '$251M+' },
      { label: 'Billeteras afectadas', value: '114,000+' },
      { label: 'Caida', value: '94%' },
    ],
    href: '/caso/caso-libra',
  },
  {
    slug: 'caso-epstein',
    title: 'Caso Epstein: Red de trafico y poder',
    subtitle: 'Investigacion activa',
    description:
      '7,287 entidades y 21,944 relaciones documentadas. Documentos judiciales, registros de vuelo, 72 verificaciones de hechos.',
    status: 'active',
    color: 'red',
    stats: [
      { label: 'Entidades', value: '7,287' },
      { label: 'Actores', value: '355' },
      { label: 'Documentos', value: '1,044' },
    ],
    href: '/caso/caso-epstein',
  },
  {
    slug: 'finanzas-politicas',
    title: 'Finanzas Politicas Argentinas',
    subtitle: 'Investigacion activa',
    description:
      'Financiamiento de campanas, declaraciones juradas patrimoniales, sociedades offshore y conexiones entre politicos y empresas.',
    status: 'active',
    color: 'emerald',
    stats: [
      { label: 'Legisladores', value: '329' },
      { label: 'Fuentes ETL', value: '7' },
    ],
    href: '/caso/finanzas-politicas',
  },
]
```

- [ ] **Step 2: Create roadmap config**

Create `webapp/src/config/roadmap.ts`:

```typescript
export interface RoadmapPhase {
  id: string
  title: string
  goal: string
  status: 'completed' | 'in-progress' | 'next' | 'future'
  statusLabel: string
  features: string[]
}

export const roadmapPhases: RoadmapPhase[] = [
  {
    id: 'phase-1',
    title: 'Fase 1 — Motor de Grafos + Investigaciones',
    goal: 'Explorador interactivo con datos legislativos, perfiles de politicos y editor de investigaciones.',
    status: 'in-progress',
    statusLabel: 'En progreso',
    features: [
      'Explorador de grafo interactivo',
      'Ingestion de datos legislativos (Como Voto)',
      'Perfiles de politicos con historial de votos',
      'Editor de investigaciones con embeds de grafo',
      'Sistema de endorsement',
      'Cuentas de usuario y autenticacion',
    ],
  },
  {
    id: 'phase-2',
    title: 'Fase 2 — Grafos Avanzados + IA',
    goal: 'Consultas avanzadas, asistencia de IA para investigaciones y API publica.',
    status: 'next',
    statusLabel: 'Proximo',
    features: [
      'Consultas multi-hop y extraccion de sub-grafos',
      'IA para sugerir nodos relacionados y resumir documentos',
      'Extraccion automatica de promesas de discursos',
      'Verificacion de identidad (DNI/CUIL)',
      'API publica para periodistas e investigadores',
      'Mapas por jurisdiccion',
    ],
  },
  {
    id: 'phase-3',
    title: 'Fase 3 — Vision Futura',
    goal: 'Scoring de rendicion de cuentas, mecanismos de gobernanza y cobertura provincial.',
    status: 'future',
    statusLabel: 'Futuro',
    features: [
      'Scoring de rendicion de cuentas (A/B/C/D por politico)',
      'Democracia liquida y votacion cuadratica',
      'Mandatos ciudadanos',
      'Resistencia a Sybil y deteccion de anomalias',
      'Cobertura legislativa provincial',
    ],
  },
]
```

- [ ] **Step 3: Commit**

```bash
git add webapp/src/config/investigations.ts webapp/src/config/roadmap.ts
git commit -m "feat: add static config for investigations and roadmap"
```

---

## Task 3: SiteNav Component

**Files:**
- Create: `webapp/src/components/layout/SiteNav.tsx`
- Modify: `webapp/messages/es.json`
- Modify: `webapp/messages/en.json`

- [ ] **Step 1: Add nav messages to es.json**

Update `webapp/messages/es.json` to the full nav section (should already exist from Task 1, extend if needed):

```json
{
  "nav": {
    "explore": "Explorar",
    "investigations": "Investigaciones",
    "signIn": "Iniciar sesion"
  }
}
```

Update `webapp/messages/en.json`:

```json
{
  "nav": {
    "explore": "Explore",
    "investigations": "Investigations",
    "signIn": "Sign in"
  }
}
```

- [ ] **Step 2: Create SiteNav component**

Create `webapp/src/components/layout/SiteNav.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { useSession } from '@/components/auth/SessionProvider'
import { UserMenu } from '@/components/auth/UserMenu'

export function SiteNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const { status } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/explorar', label: t('explore') },
    { href: '/investigaciones', label: t('investigations') },
  ]

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-zinc-50">
          ORC
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                pathname.startsWith(link.href)
                  ? 'text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {status === 'authenticated' ? (
            <UserMenu />
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
              {t('signIn')}
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="text-zinc-400 sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-zinc-800 px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {status === 'authenticated' ? (
              <UserMenu />
            ) : (
              <Link
                href="/auth/signin"
                className="text-zinc-400 transition-colors hover:text-zinc-100"
                onClick={() => setMenuOpen(false)}
              >
                {t('signIn')}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
```

**Note:** If the i18n spike (Task 1) chose the custom fallback instead of next-intl, replace `useTranslations('nav')` with the custom `t()` helper using props or context.

- [ ] **Step 3: Verify SiteNav renders**

Start dev server (`pnpm dev`), temporarily add `<SiteNav />` import to `page.tsx` to test rendering. Verify:
- Logo links to `/`
- Two nav links render with correct text
- Mobile hamburger toggles on narrow viewport
- Auth state renders correctly (sign-in link or UserMenu)

Remove the temporary import after verification.

- [ ] **Step 4: Commit**

```bash
git add webapp/src/components/layout/SiteNav.tsx webapp/messages/
git commit -m "feat: add SiteNav global navigation component"
```

---

## Task 4: Footer Component

**Files:**
- Create: `webapp/src/components/layout/Footer.tsx`
- Modify: `webapp/messages/es.json`
- Modify: `webapp/messages/en.json`

- [ ] **Step 1: Add footer messages**

Add to `webapp/messages/es.json`:

```json
{
  "nav": { ... },
  "footer": {
    "tagline": "Oficina de Rendicion de Cuentas — Datos abiertos",
    "explore": "Explorar",
    "investigations": "Investigaciones"
  }
}
```

Add matching keys to `webapp/messages/en.json`:

```json
{
  "nav": { ... },
  "footer": {
    "tagline": "Office of Accountability — Open data",
    "explore": "Explore",
    "investigations": "Investigations"
  }
}
```

- [ ] **Step 2: Create Footer component**

Create `webapp/src/components/layout/Footer.tsx`:

```tsx
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function Footer() {
  const t = await getTranslations('footer')

  return (
    <footer className="border-t border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-xs text-zinc-500 sm:flex-row sm:justify-between">
        <p>{t('tagline')}</p>
        <nav className="flex gap-4">
          <Link href="/explorar" className="transition-colors hover:text-zinc-300">
            {t('explore')}
          </Link>
          <Link href="/investigaciones" className="transition-colors hover:text-zinc-300">
            {t('investigations')}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
```

**Note:** If using custom i18n fallback, replace `getTranslations` with the custom `getMessages` + `t()` helper.

- [ ] **Step 3: Commit**

```bash
git add webapp/src/components/layout/Footer.tsx webapp/messages/
git commit -m "feat: add Footer global component"
```

---

## Task 5: Wire SiteNav + Footer into Root Layout

**Files:**
- Modify: `webapp/src/app/layout.tsx`

- [ ] **Step 1: Update root layout**

Replace `webapp/src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'

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

export const metadata: Metadata = {
  title: 'Oficina de Rendición de Cuentas',
  description:
    'Plataforma de conocimiento cívico para la política argentina. Explorá las conexiones entre legisladores, votaciones y legislación.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <div className="flex min-h-screen flex-col bg-zinc-950">
              <SiteNav />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify the app runs**

```bash
cd webapp && pnpm dev
```

Visit `http://localhost:3000`. Expect:
- SiteNav visible at top of page
- Footer visible at bottom
- Existing homepage content renders between them (will have duplicate headers — that's expected, fixed in Task 7)

- [ ] **Step 3: Commit**

```bash
git add webapp/src/app/layout.tsx
git commit -m "feat: wire SiteNav and Footer into root layout with SessionProvider and i18n"
```

---

## Task 6: Landing Page Components (Hero, InvestigationCard, FeatureShowcase, Roadmap)

**Files:**
- Create: `webapp/src/components/landing/Hero.tsx`
- Create: `webapp/src/components/landing/InvestigationCard.tsx`
- Create: `webapp/src/components/landing/FeatureShowcase.tsx`
- Create: `webapp/src/components/landing/Roadmap.tsx`
- Modify: `webapp/messages/es.json`
- Modify: `webapp/messages/en.json`

- [ ] **Step 1: Add all landing page messages to es.json**

Update `webapp/messages/es.json` — add `hero`, `features`, and `roadmap` sections:

```json
{
  "nav": {
    "explore": "Explorar",
    "investigations": "Investigaciones",
    "signIn": "Iniciar sesion"
  },
  "footer": {
    "tagline": "Oficina de Rendicion de Cuentas — Datos abiertos",
    "explore": "Explorar",
    "investigations": "Investigaciones"
  },
  "hero": {
    "badge": "Plataforma de conocimiento civico",
    "title": "Oficina de Rendicion de Cuentas",
    "subtitle": "Investigaciones abiertas con datos verificables. Grafos de conocimiento, cronologias, evidencia documental y analisis de red.",
    "ctaExplore": "Explorar el grafo",
    "ctaInvestigations": "Ver investigaciones"
  },
  "investigations": {
    "title": "Investigaciones",
    "explore": "Explorar"
  },
  "features": {
    "title": "Que podes hacer",
    "graph": {
      "title": "Grafo interactivo",
      "description": "Explora conexiones entre politicos, votaciones, legislacion y donantes."
    },
    "timeline": {
      "title": "Cronologias",
      "description": "Visualiza la secuencia de eventos en cada investigacion."
    },
    "evidence": {
      "title": "Evidencia documental",
      "description": "Documentos judiciales, registros oficiales y fuentes verificadas."
    },
    "community": {
      "title": "Investigaciones comunitarias",
      "description": "Crea y publica investigaciones respaldadas por datos del grafo."
    },
    "network": {
      "title": "Analisis de red",
      "description": "Descubri patrones: quien conoce a quien, quien financia a quien."
    },
    "money": {
      "title": "Flujos de dinero",
      "description": "Seguimiento de fondos: donantes, campanas y conexiones financieras."
    }
  },
  "roadmap": {
    "title": "Hoja de ruta"
  }
}
```

Update `webapp/messages/en.json` with corresponding English translations (stub — can be partial):

```json
{
  "nav": {
    "explore": "Explore",
    "investigations": "Investigations",
    "signIn": "Sign in"
  },
  "footer": {
    "tagline": "Office of Accountability — Open data",
    "explore": "Explore",
    "investigations": "Investigations"
  },
  "hero": {
    "badge": "Civic knowledge platform",
    "title": "Office of Accountability",
    "subtitle": "Open investigations with verifiable data. Knowledge graphs, timelines, documentary evidence, and network analysis.",
    "ctaExplore": "Explore the graph",
    "ctaInvestigations": "View investigations"
  },
  "investigations": {
    "title": "Investigations",
    "explore": "Explore"
  },
  "features": {
    "title": "What you can do",
    "graph": {
      "title": "Interactive graph",
      "description": "Explore connections between politicians, votes, legislation, and donors."
    },
    "timeline": {
      "title": "Timelines",
      "description": "Visualize the sequence of events in each investigation."
    },
    "evidence": {
      "title": "Documentary evidence",
      "description": "Court documents, official records, and verified sources."
    },
    "community": {
      "title": "Community investigations",
      "description": "Create and publish investigations backed by graph data."
    },
    "network": {
      "title": "Network analysis",
      "description": "Discover patterns: who knows whom, who funds whom."
    },
    "money": {
      "title": "Money flows",
      "description": "Track funds: donors, campaigns, and financial connections."
    }
  },
  "roadmap": {
    "title": "Roadmap"
  }
}
```

- [ ] **Step 2: Create Hero component**

Create `webapp/src/components/landing/Hero.tsx`:

```tsx
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function Hero() {
  const t = await getTranslations('hero')

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-zinc-800 px-4 py-1.5 text-xs text-zinc-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-500" />
          {t('badge')}
        </div>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
          {t('title')}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
          {t('subtitle')}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/explorar"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500"
          >
            {t('ctaExplore')}
          </Link>
          <Link
            href="/investigaciones"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
          >
            {t('ctaInvestigations')}
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create InvestigationCard component**

Create `webapp/src/components/landing/InvestigationCard.tsx`:

```tsx
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { InvestigationConfig } from '@/config/investigations'

const COLOR_MAP: Record<string, { border: string; borderHover: string; bg: string; accent: string; titleHover: string; dot: string }> = {
  purple: {
    border: 'border-purple-600/30',
    borderHover: 'hover:border-purple-500/50',
    bg: 'from-zinc-900 to-purple-950/20',
    accent: 'text-purple-400',
    titleHover: 'group-hover:text-purple-300',
    dot: 'bg-purple-500',
  },
  red: {
    border: 'border-red-500/20',
    borderHover: 'hover:border-red-500/40',
    bg: 'from-zinc-900 to-red-950/20',
    accent: 'text-red-400',
    titleHover: 'group-hover:text-red-300',
    dot: 'bg-red-500',
  },
  emerald: {
    border: 'border-emerald-500/20',
    borderHover: 'hover:border-emerald-500/40',
    bg: 'from-zinc-900 to-emerald-950/20',
    accent: 'text-emerald-400',
    titleHover: 'group-hover:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  amber: {
    border: 'border-amber-500/20',
    borderHover: 'hover:border-amber-500/40',
    bg: 'from-zinc-900 to-amber-950/20',
    accent: 'text-amber-400',
    titleHover: 'group-hover:text-amber-300',
    dot: 'bg-amber-500',
  },
  blue: {
    border: 'border-blue-500/20',
    borderHover: 'hover:border-blue-500/40',
    bg: 'from-zinc-900 to-blue-950/20',
    accent: 'text-blue-400',
    titleHover: 'group-hover:text-blue-300',
    dot: 'bg-blue-500',
  },
}

const DEFAULT_COLORS = COLOR_MAP.purple

interface InvestigationCardProps {
  readonly config: InvestigationConfig
}

export async function InvestigationCard({ config }: InvestigationCardProps) {
  const t = await getTranslations('investigations')
  const colors = COLOR_MAP[config.color] ?? DEFAULT_COLORS

  return (
    <Link
      href={config.href}
      className={`group flex flex-col gap-4 rounded-xl border bg-gradient-to-br p-6 transition-colors ${colors.border} ${colors.borderHover} ${colors.bg}`}
    >
      <div className={`flex items-center gap-2 text-xs ${colors.accent}`}>
        <span className={`inline-block h-2 w-2 rounded-full ${colors.dot}`} />
        {config.subtitle}
      </div>
      <h3 className={`text-xl font-bold text-zinc-50 ${colors.titleHover}`}>
        {config.title}
      </h3>
      <p className="text-sm leading-relaxed text-zinc-400">
        {config.description}
      </p>
      {config.stats.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {config.stats.map((stat, i) => (
            <span key={stat.label} className="flex items-center gap-1">
              {i > 0 && <span className="mr-2 text-zinc-600">|</span>}
              <span className={i === 0 ? `font-semibold ${colors.accent}` : 'text-zinc-400'}>
                {stat.value}
              </span>
              <span className="text-zinc-500">{stat.label}</span>
            </span>
          ))}
        </div>
      )}
      <span className={`text-sm font-medium ${colors.accent}`}>
        {t('explore')} &rarr;
      </span>
    </Link>
  )
}
```

- [ ] **Step 4: Create FeatureShowcase component**

Create `webapp/src/components/landing/FeatureShowcase.tsx`:

```tsx
import { getTranslations } from 'next-intl/server'

const FEATURE_KEYS = ['graph', 'timeline', 'evidence', 'community', 'network', 'money'] as const

const FEATURE_ICONS: Record<string, string> = {
  graph: 'M12 4.5v15m7.5-7.5h-15',
  timeline: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  evidence: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
  community: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z',
  network: 'M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z',
  money: 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
}

export async function FeatureShowcase() {
  const t = await getTranslations('features')

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-8 text-xl font-bold text-zinc-50 sm:text-2xl">{t('title')}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_KEYS.map((key) => (
          <div
            key={key}
            className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <svg
              className="h-6 w-6 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={FEATURE_ICONS[key]} />
            </svg>
            <h3 className="text-sm font-semibold text-zinc-100">{t(`${key}.title`)}</h3>
            <p className="text-xs leading-relaxed text-zinc-400">{t(`${key}.description`)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create Roadmap component**

Create `webapp/src/components/landing/Roadmap.tsx`:

```tsx
import { getTranslations } from 'next-intl/server'
import { roadmapPhases } from '@/config/roadmap'

const STATUS_STYLES: Record<string, { badge: string; line: string }> = {
  'completed': { badge: 'bg-emerald-500/20 text-emerald-400', line: 'bg-emerald-500' },
  'in-progress': { badge: 'bg-purple-500/20 text-purple-400', line: 'bg-purple-500' },
  'next': { badge: 'bg-amber-500/20 text-amber-400', line: 'bg-amber-500/40' },
  'future': { badge: 'bg-zinc-700/50 text-zinc-500', line: 'bg-zinc-700' },
}

const DEFAULT_STATUS = STATUS_STYLES['future']

export async function Roadmap() {
  const t = await getTranslations('roadmap')

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-8 text-xl font-bold text-zinc-50 sm:text-2xl">{t('title')}</h2>
      <div className="space-y-6">
        {roadmapPhases.map((phase) => {
          const styles = STATUS_STYLES[phase.status] ?? DEFAULT_STATUS
          return (
            <div
              key={phase.id}
              className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`inline-block h-2 w-2 rounded-full ${styles.line}`} />
                    <h3 className="text-base font-bold text-zinc-100">{phase.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}>
                      {phase.statusLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{phase.goal}</p>
                </div>
              </div>
              <ul className="mt-4 grid gap-1.5 text-xs text-zinc-500 sm:grid-cols-2">
                {phase.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-zinc-600">—</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add webapp/src/components/landing/ webapp/messages/
git commit -m "feat: add Hero, InvestigationCard, FeatureShowcase, and Roadmap landing components"
```

---

## Task 7: Rewrite Homepage

**Files:**
- Modify: `webapp/src/app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx**

Replace `webapp/src/app/page.tsx` with:

```tsx
import { getTranslations } from 'next-intl/server'

import { Hero } from '@/components/landing/Hero'
import { InvestigationCard } from '@/components/landing/InvestigationCard'
import { FeatureShowcase } from '@/components/landing/FeatureShowcase'
import { Roadmap } from '@/components/landing/Roadmap'
import { investigations } from '@/config/investigations'

export default async function Home() {
  const t = await getTranslations('investigations')
  const activeInvestigations = investigations.filter((i) => i.status === 'active')

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="mb-6 text-xl font-bold text-zinc-50 sm:text-2xl">{t('title')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeInvestigations.map((config) => (
            <InvestigationCard key={config.slug} config={config} />
          ))}
        </div>
      </section>

      <FeatureShowcase />

      <Roadmap />
    </>
  )
}
```

- [ ] **Step 2: Verify the homepage**

```bash
cd webapp && pnpm dev
```

Visit `http://localhost:3000`. Verify:
- SiteNav at top (from layout)
- Hero section with mission text and 2 CTAs
- 3 investigation cards in a grid
- Feature showcase with 6 cards
- Roadmap with 3 phases
- Footer at bottom (from layout)
- Mobile responsive (check at 375px viewport)

- [ ] **Step 3: Commit**

```bash
git add webapp/src/app/page.tsx
git commit -m "feat: rewrite homepage with component-driven landing page"
```

---

## Task 8: Remove Duplicate Headers from Existing Pages

**Files:**
- Modify: `webapp/src/app/caso/[slug]/layout.tsx`
- Modify: `webapp/src/app/caso/finanzas-politicas/layout.tsx`
- Modify: `webapp/src/app/caso/finanzas-politicas/FinanzasPoliticasNav.tsx`
- Modify: `webapp/src/app/explorar/page.tsx`
- Modify: `webapp/src/app/politico/[slug]/page.tsx`
- Modify: `webapp/src/app/provincias/page.tsx`
- Modify: `webapp/src/app/provincias/[province]/page.tsx`
- Modify: `webapp/src/app/investigaciones/page.tsx`
- Modify: `webapp/src/app/investigacion/[slug]/page.tsx`
- Modify: `webapp/src/app/mis-investigaciones/page.tsx`
- Modify: `webapp/src/app/perfil/page.tsx`

This is the largest task — it touches many files, but each change is mechanical: remove the inline `<header>` block and any inline `<footer>` that duplicates the global ones.

- [ ] **Step 1: Refactor caso/[slug]/layout.tsx**

In `webapp/src/app/caso/[slug]/layout.tsx`:
- Remove the `<header>` block (lines 53-69 — the one with ORC logo, breadcrumb, and backdrop blur)
- Remove the `<footer>` block (lines 75-83 — the one with LegalDisclaimer)
- Remove the outer `<div className="min-h-screen bg-zinc-950">` wrapper (layout.tsx now handles this)
- Keep `<InvestigationNav slug={slug} />` — render it above `<main>`
- Keep `<main>` wrapper with its `max-w-6xl` padding
- Keep `<LegalDisclaimer />` — move it inside `<main>` or above the closing of the content area

The resulting structure should be:

```tsx
export default async function CasoLayout({ children, params }: { ... }) {
  const { slug } = await params
  return (
    <>
      <InvestigationNav slug={slug} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <LegalDisclaimer />
        </div>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Refactor caso/finanzas-politicas/layout.tsx**

Remove the inline `<footer>` block but **preserve the case-specific legal disclaimer** ("Aviso Legal: Esta investigacion se basa en fuentes publicas verificadas..."). Move it inside `<main>`, similar to how `LegalDisclaimer` is handled in `caso/[slug]/layout.tsx`. Keep the `FinanzasPoliticasNav` and `<main>` wrapper.

- [ ] **Step 3: Refactor FinanzasPoliticasNav.tsx**

Remove the ORC logo `<Link>` from the nav (lines 29-34). The global `SiteNav` now handles the logo.

- [ ] **Step 4: Remove inline headers from all other pages**

For each of these files, remove the `<header>` block that contains the ORC breadcrumb nav. The content below the header stays. If the page wraps everything in a `<div className="min-h-screen bg-zinc-950">`, remove that wrapper too (the root layout handles it).

Pages to modify:
- `webapp/src/app/explorar/page.tsx`
- `webapp/src/app/politico/[slug]/page.tsx`
- `webapp/src/app/provincias/page.tsx`
- `webapp/src/app/provincias/[province]/page.tsx`
- `webapp/src/app/investigaciones/page.tsx`
- `webapp/src/app/investigacion/[slug]/page.tsx`
- `webapp/src/app/mis-investigaciones/page.tsx`
- `webapp/src/app/perfil/page.tsx`

For each file:
1. Read the file
2. Identify the `<header>` block (typically starts with `<header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">`)
3. Remove it
4. If the page has `<div className="min-h-screen bg-zinc-950">` as a wrapper, remove the wrapper (keep inner content)
5. Keep `<main>` and all page content intact

- [ ] **Step 5: Verify all pages still work**

```bash
cd webapp && pnpm dev
```

Visit each page and verify:
- `http://localhost:3000/` — homepage with new design
- `http://localhost:3000/caso/caso-libra` — SiteNav + InvestigationNav + content (no duplicate header)
- `http://localhost:3000/caso/finanzas-politicas` — SiteNav + FinanzasPoliticasNav (no ORC logo in sub-nav)
- `http://localhost:3000/explorar` — SiteNav + content
- `http://localhost:3000/investigaciones` — SiteNav + content
- `http://localhost:3000/politico/fernandez-de-kirchner-cristina` — SiteNav + content
- `http://localhost:3000/provincias` — SiteNav + content

- [ ] **Step 6: Commit**

```bash
git add webapp/src/app/
git commit -m "refactor: remove duplicate inline headers/footers from all pages

Global SiteNav and Footer from root layout now handle navigation
consistently across all routes."
```

---

## Task 9: Final Verification and Cleanup

- [ ] **Step 1: Run type check**

```bash
cd webapp && pnpm tsc --noEmit
```

Fix any TypeScript errors.

- [ ] **Step 2: Run linter**

```bash
cd webapp && pnpm lint
```

Fix any lint errors.

- [ ] **Step 3: Build check**

```bash
cd webapp && pnpm build
```

Verify the production build succeeds.

- [ ] **Step 4: Visual verification**

Visit all key pages on both desktop and mobile viewports:

| Page | Desktop | Mobile (375px) |
|------|---------|----------------|
| `/` | Hero + cards + features + roadmap + footer | Stacked layout, hamburger nav |
| `/caso/caso-libra` | SiteNav + InvestigationNav + content | Scrollable sub-nav |
| `/caso/finanzas-politicas` | SiteNav + FinanzasPoliticasNav + content | No duplicate ORC logo |
| `/explorar` | SiteNav + graph explorer | Full-width graph |
| `/investigaciones` | SiteNav + investigation grid | Stacked cards |
| `/auth/signin` | SiteNav + sign-in form | Responsive form |

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: address typecheck, lint, and visual issues from landing page redesign"
```

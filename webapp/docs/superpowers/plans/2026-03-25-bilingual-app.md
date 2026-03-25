# Bilingual App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the entire webapp fully bilingual (ES/EN) with URL-based routing, browser locale detection, and a global language toggle.

**Architecture:** next-intl with `[locale]` route segment. Middleware detects browser locale and redirects. All UI strings in JSON message files. Investigation data keeps existing `_es`/`_en` field pattern. Global toggle in SiteNav replaces per-case toggles.

**Tech Stack:** next-intl ^4.8.3, Next.js 16, Vite/vinext, React 19, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-24-bilingual-app-design.md`

---

## File Structure

### New Files
- `src/middleware-intl.ts` — locale detection + redirect logic (composed into existing middleware)
- `src/i18n/navigation.ts` — next-intl `createNavigation()` exports (`Link`, `redirect`, `usePathname`, `useRouter`)
- `src/i18n/routing.ts` — next-intl routing config (`defineRouting`)
- `src/app/[locale]/layout.tsx` — locale-aware root layout (moved from `src/app/layout.tsx`)
- `src/app/[locale]/page.tsx` — landing page (moved from `src/app/page.tsx`)
- `src/app/[locale]/caso/[slug]/layout.tsx` — case layout (moved from `src/app/caso/[slug]/layout.tsx`)
- All other pages moved under `src/app/[locale]/`
- `src/components/layout/LanguageToggle.tsx` — global EN/ES toggle component

### Modified Files
- `src/middleware.ts` — compose locale middleware with existing CSRF/rate-limit
- `src/i18n/config.ts` — keep as-is (already exports `locales`, `defaultLocale`)
- `src/i18n/request.ts` — read locale from request instead of hardcoding
- `next.config.ts` — wrap with `createNextIntlPlugin()` (spike first)
- `messages/es.json` — expand with all UI strings
- `messages/en.json` — expand with all UI strings
- `src/components/layout/SiteNav.tsx` — add language toggle, switch to next-intl Link
- `src/components/layout/Footer.tsx` — switch from `createTranslator` to `useTranslations`
- `src/components/investigation/InvestigationNav.tsx` — remove per-case toggle, use next-intl Link + `useLocale()`
- `src/config/investigations.ts` — remove display strings, keep structural data
- `src/config/roadmap.ts` — remove display strings, keep structural data
- `src/app/page.tsx` → `src/app/[locale]/page.tsx` — use message keys for chapter content
- All landing components (`Hero`, `Masthead`, `Chapter`, etc.) — switch to next-intl
- All case pages — replace `useLanguage()` with `useLocale()` from next-intl
- All auth pages — extract hardcoded strings to message files

### Deleted Files
- `src/lib/language-context.tsx` — replaced by next-intl locale from URL
- `src/i18n/messages.ts` — replaced by next-intl `useTranslations`/`getTranslations`

---

## Task 1: Spike — Verify next-intl works with vinext

**Files:**
- Modify: `next.config.ts`
- Modify: `src/i18n/request.ts`
- Create: `src/i18n/routing.ts`

This spike validates that next-intl integrates with the Vite/vinext build before committing to the full migration.

- [ ] **Step 1: Create routing config**

Create `src/i18n/routing.ts`:

```typescript
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
})
```

- [ ] **Step 2: Update request config**

Update `src/i18n/request.ts` to read the actual locale:

```typescript
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as 'es' | 'en')) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

- [ ] **Step 3: Try wrapping next.config.ts with plugin**

```typescript
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  /* config options here */
}

export default withNextIntl(nextConfig)
```

- [ ] **Step 4: Run dev server and check for errors**

Run: `pnpm run dev`

If the plugin errors with vinext, revert `next.config.ts` and proceed without it (next-intl works without the plugin — the plugin just enables auto-detection of the request config path). Document findings.

- [ ] **Step 5: Commit spike results**

```bash
git add src/i18n/routing.ts src/i18n/request.ts next.config.ts
git commit -m "spike: verify next-intl compatibility with vinext"
```

---

## Task 2: Create navigation helpers and locale middleware

**Files:**
- Create: `src/i18n/navigation.ts`
- Modify: `src/middleware.ts`

- [ ] **Step 1: Create navigation module**

Create `src/i18n/navigation.ts`:

```typescript
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
```

- [ ] **Step 2: Compose locale middleware with existing middleware**

Modify `src/middleware.ts`. The existing file handles CSRF + rate limiting for `/api/*` routes and security headers for all routes. Add locale handling for non-API routes:

```typescript
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { checkRateLimit, rateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit'
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  generateCsrfToken,
  signCsrfToken,
  verifyCsrfToken,
  parseCsrfCookie,
  buildCsrfCookieValue,
  buildCsrfSetCookie,
} from '@/lib/auth/csrf'

// ... keep ALL existing helper functions unchanged (getClientIp, getRateLimitTier,
//     isMutationMethod, isCsrfExempt, validateCsrf, SECURITY_HEADERS, ensureCsrfCookie) ...

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // API routes: existing rate-limit + CSRF logic only (no locale)
  if (pathname.startsWith('/api/')) {
    // ... existing API middleware logic unchanged ...
    // (CSRF validation → rate limiting → security headers → CSRF cookie)
    // keep all existing code for this branch
  }

  // Non-API routes: locale middleware first, then security headers + CSRF cookie
  const response = intlMiddleware(request)
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value)
  }
  await ensureCsrfCookie(request, response)
  return response
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 3: Run dev server and verify redirect**

Run: `pnpm run dev`

Visit `http://localhost:3000/` — should redirect to `/es/` (or `/en/` based on browser Accept-Language).

- [ ] **Step 4: Commit**

```bash
git add src/i18n/navigation.ts src/middleware.ts
git commit -m "feat: add locale middleware and navigation helpers"
```

---

## Task 3: Move route structure under [locale]

**Files:**
- Modify: `src/app/layout.tsx` (strip to minimal shell)
- Create: `src/app/[locale]/layout.tsx` (locale-aware layout)
- Move: all pages/layouts from `src/app/` to `src/app/[locale]/`

This is the big structural move. Every page route goes under `[locale]`.

- [ ] **Step 1: Create minimal root layout**

Replace `src/app/layout.tsx` with a minimal shell (no `lang`, no nav/footer — those move to `[locale]/layout.tsx`):

```tsx
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
```

- [ ] **Step 2: Create locale layout**

Create `src/app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { NextIntlClientProvider, useMessages } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'
import { SiteNav } from '@/components/layout/SiteNav'
import { Footer } from '@/components/layout/Footer'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('siteTitle'),
    description: t('siteDescription'),
    alternates: {
      languages: { es: '/es', en: '/en' },
    },
  }
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
```

- [ ] **Step 3: Move all pages under [locale]**

Move every directory and page from `src/app/` into `src/app/[locale]/`:

```bash
# Create [locale] directory
mkdir -p src/app/\[locale\]

# Move page routes (NOT layout.tsx, NOT api/, NOT globals.css)
mv src/app/page.tsx src/app/\[locale\]/page.tsx
mv src/app/caso src/app/\[locale\]/caso
mv src/app/auth src/app/\[locale\]/auth
mv src/app/explorar src/app/\[locale\]/explorar
mv src/app/investigaciones src/app/\[locale\]/investigaciones
mv src/app/investigacion src/app/\[locale\]/investigacion
mv src/app/mis-investigaciones src/app/\[locale\]/mis-investigaciones
mv src/app/perfil src/app/\[locale\]/perfil
mv src/app/politico src/app/\[locale\]/politico
mv src/app/provincias src/app/\[locale\]/provincias
```

- [ ] **Step 4: Run dev server and verify basic rendering**

Run: `pnpm run dev`

Visit `http://localhost:3000/es` — should render the landing page. The content will still be in Spanish (existing strings) — that's expected. The key test is that the route structure works.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: move all routes under [locale] segment"
```

---

## Task 4: Expand message files with all UI strings

**Files:**
- Modify: `messages/es.json`
- Modify: `messages/en.json`

This task adds all UI strings to the message files. This is the biggest content task.

- [ ] **Step 1: Expand es.json with investigation card strings**

Add investigation metadata (titles, subtitles, descriptions, stat labels) for all 7 cases. Add case tab labels. Add auth strings. Add metadata strings. Add chapter strings for the landing page. Add roadmap strings.

The full expanded `messages/es.json` should include these new namespaces:

```json
{
  "metadata": {
    "siteTitle": "Oficina de Rendición de Cuentas",
    "siteDescription": "Plataforma de conocimiento cívico para la política argentina. Explorá las conexiones entre legisladores, votaciones y legislación.",
    "cases": {
      "caso-libra": {
        "title": "Caso Libra — Oficina de Rendicion de Cuentas",
        "description": "Investigacion comunitaria sobre el token $LIBRA promovido por el presidente Milei."
      },
      "caso-epstein": {
        "title": "Caso Epstein — Oficina de Rendicion de Cuentas",
        "description": "Red de tráfico y poder. 7,276 entidades, documentos judiciales, registros de vuelo."
      },
      "caso-dictadura": {
        "title": "Caso Dictadura — Oficina de Rendición de Cuentas",
        "description": "Dictadura militar argentina 1976-1983. Desaparecidos, centros clandestinos, juicios de lesa humanidad."
      },
      "finanzas-politicas": {
        "title": "Finanzas Politicas — Oficina de Rendicion de Cuentas",
        "description": "Financiamiento de campañas, declaraciones juradas, sociedades offshore y conexiones políticos-empresas."
      },
      "monopolios": {
        "title": "Monopolios en Argentina — Oficina de Rendicion de Cuentas",
        "description": "18 sectores monopolizados, 829+ cruces Neo4j. Costo al consumidor: USD 22.500M/año."
      },
      "obras-publicas": {
        "title": "Obras Públicas — Oficina de Rendicion de Cuentas",
        "description": "Contratos de obra pública: CONTRAT.AR, MapaInversiones, Odebrecht, Cuadernos."
      },
      "riesgo-nuclear": {
        "title": "Riesgo Nuclear Global — Oficina de Rendicion de Cuentas",
        "description": "Monitoreo diario de señales de escalada nuclear. 31 fuentes, análisis con IA."
      }
    }
  },
  "investigationCards": {
    "caso-libra": {
      "title": "Caso Libra: La Memecoin del Presidente",
      "subtitle": "Investigacion activa",
      "description": "Milei promovio $LIBRA a 19M de seguidores. El precio colapso 94% en horas. 114,000+ billeteras perdieron $251M+.",
      "stats": { "losses": "Perdidas", "walletsAffected": "Billeteras afectadas", "drop": "Caida" }
    },
    "caso-epstein": {
      "title": "Caso Epstein: Red de trafico y poder",
      "subtitle": "Investigacion activa",
      "description": "7,276 entidades y 11,040 relaciones documentadas. Documentos judiciales, registros de vuelo, 77 verificaciones de hechos.",
      "stats": { "entities": "Entidades", "actors": "Actores", "documents": "Documentos" }
    },
    "caso-dictadura": {
      "title": "Caso Dictadura: 1976-1983",
      "subtitle": "Investigacion activa",
      "description": "Dictadura militar argentina. 9.415 victimas documentadas, 774 centros clandestinos, 987 paginas SIDE desclasificadas.",
      "stats": { "victims": "Victimas", "ccds": "CCDs", "nodes": "Nodos" }
    },
    "finanzas-politicas": {
      "title": "Finanzas Políticas Argentinas",
      "subtitle": "Investigación activa",
      "description": "Financiamiento de campañas, declaraciones juradas patrimoniales, sociedades offshore y conexiones entre políticos y empresas.",
      "stats": { "legislators": "Legisladores", "etlSources": "Fuentes ETL" }
    },
    "monopolios": {
      "title": "Monopolios en Argentina",
      "subtitle": "Investigacion activa — 18 sectores",
      "description": "Mercados monopolizados: telecomunicaciones, energia, alimentos, medios, banca, mineria. 829+ cruces Neo4j, 75 afirmaciones verificadas.",
      "stats": { "sectors": "Sectores", "crossRefs": "Cruces Neo4j", "annualCost": "Costo anual" }
    },
    "obras-publicas": {
      "title": "Obras Públicas Argentinas",
      "subtitle": "Investigación activa — 30 olas de enriquecimiento",
      "description": "Trazabilidad de contratos de obra pública: CONTRAT.AR, MapaInversiones, Odebrecht, Cuadernos.",
      "stats": { "entities": "Entidades", "projects": "Obras", "crossRefs": "Cruces" }
    },
    "riesgo-nuclear": {
      "title": "Riesgo Nuclear Global",
      "subtitle": "Monitoreo diario de senales de escalada nuclear",
      "description": "Seguimiento de senales de escalada nuclear: desarrollos militares, declaraciones oficiales, tratados, pruebas de misiles y datos OSINT de 31 fuentes.",
      "stats": { "sources": "Fuentes", "theaters": "Teatros", "nuclearStates": "Estados nucleares" }
    }
  },
  "chapters": {
    "i": {
      "label": "La primera prueba",
      "title": "Caso Libra: La Memecoin del Presidente",
      "body": "Milei promovió $LIBRA a 19 millones de seguidores. El precio colapsó 94% en horas. El motor procesó transacciones blockchain, documentos parlamentarios y redes sociales. $251M+ en pérdidas, 114K billeteras afectadas.",
      "link": "Ver investigación →"
    },
    "ii": {
      "label": "Prueba de escala",
      "title": "Caso Epstein: Red de tráfico y poder",
      "body": "Un caso con miles de documentos, cientos de actores, décadas de historia. 7,276 entidades, 374 actores, 1,044 documentos judiciales procesados. El motor escaló.",
      "link": "Ver investigación →"
    },
    "iii": {
      "label": "El descubrimiento",
      "title": "Finanzas Políticas Argentinas",
      "body": "Empezamos con los datasets de Como Voto. Expandimos a declaraciones juradas, sociedades offshore, financiamiento de campañas. 329 legisladores, 7 fuentes de datos cruzadas.",
      "link": "Ver investigación →"
    },
    "iv": {
      "label": "Datos abiertos",
      "title": "Obras Públicas y Monopolios",
      "body": "Contratos de obra pública: CONTRAT.AR, MapaInversiones, Odebrecht, Cuadernos. 56,122 entidades, 7,486 obras, 13,277 cruces. En paralelo, 18 sectores monopolizados. USD 22.5B en costo anual estimado.",
      "linkObras": "Obras Públicas →",
      "linkMonopolios": "Monopolios →"
    },
    "v": {
      "label": "24 de Marzo 2026",
      "title": "Caso Dictadura: 1976–1983",
      "body": "Dictadura militar argentina. Múltiples pipelines de ingesta consolidados en un grafo unificado. 9,415 víctimas documentadas, 774 centros clandestinos de detención, 14,512 nodos.",
      "link": "Ver investigación →"
    },
    "vi": {
      "label": "En desarrollo",
      "title": "Riesgo Nuclear Global",
      "body": "Monitoreo diario de señales de escalada nuclear: desarrollos militares, declaraciones oficiales, tratados, pruebas de misiles y datos OSINT. 31 fuentes, 9 estados nucleares monitoreados.",
      "link": "Ver progreso →"
    },
    "transitions": {
      "1": "El motor funcionó. Necesitábamos probarlo con volumen real de datos.",
      "2": "Los resultados mejoraban con cada caso. Menos intervención humana, más profundidad. Pero siempre con validación.",
      "3": "Los resultados fueron sorprendentes. Decidimos probar con otros datos públicos abiertos.",
      "4": "El 24 de marzo trajo nueva información. Creamos pipelines para consolidar datos de la dictadura en un grafo unificado."
    }
  },
  "roadmapPhases": {
    "phase-1": {
      "title": "Fase 1 — Grafo de conocimiento + Investigaciones",
      "goal": "Base de datos en grafo con datos publicos verificados, explorador visual y primeras investigaciones publicadas.",
      "statusLabel": "En progreso",
      "features": [
        "Explorador de grafo interactivo (Neo4j)",
        "Ingestion automatizada de datos legislativos",
        "Perfiles de politicos con historial de votos",
        "Siete investigaciones publicadas"
      ]
    },
    "phase-2": {
      "title": "Fase 2 — Motor de investigacion autonomo",
      "goal": "Pipeline automatizado: el motor busca, valida, consolida y reporta hallazgos con revision humana en cada paso.",
      "statusLabel": "Proximo",
      "features": [
        "Pipeline de ingestion → verificacion → enriquecimiento → reporte",
        "LLM asistido con revision humana en cada etapa (human-at-the-gates)",
        "Templates reutilizables para nuevos dominios",
        "Conectores de datos: APIs, scrapers, documentos judiciales"
      ]
    },
    "phase-3": {
      "title": "Fase 3 — IA avanzada + API publica",
      "goal": "Consultas avanzadas sobre el grafo, sugerencias automaticas y API para periodistas e investigadores.",
      "statusLabel": "Futuro",
      "features": [
        "Consultas multi-hop y extraccion de sub-grafos",
        "IA para sugerir nodos relacionados y resumir documentos",
        "API publica para periodistas e investigadores",
        "Exportacion de investigaciones (PDF, datos abiertos)"
      ]
    },
    "phase-4": {
      "title": "Fase 4 — Comunidad + Gobernanza",
      "goal": "Investigaciones comunitarias, coaliciones, endorsements y mecanismos de consenso.",
      "statusLabel": "Futuro",
      "features": [
        "Editor colaborativo de investigaciones con embeds de grafo",
        "Coaliciones de investigacion con roles y reputacion",
        "Sistema de endorsement para claims y evidencia",
        "Verificacion de identidad (DNI/CUIL)"
      ]
    },
    "phase-5": {
      "title": "Fase 5 — Rendicion de cuentas",
      "goal": "Scoring algoritmico, mandatos ciudadanos y cobertura provincial.",
      "statusLabel": "Futuro",
      "features": [
        "Scoring de rendicion de cuentas (A/B/C/D por politico)",
        "Mandatos ciudadanos vinculados al grafo",
        "Democracia liquida y votacion cuadratica",
        "Cobertura legislativa provincial"
      ]
    }
  },
  "auth": {
    "signIn": "Iniciar sesión",
    "signUp": "Crear cuenta",
    "email": "Email",
    "password": "Contraseña",
    "name": "Nombre",
    "forgotPassword": "¿Olvidaste tu contraseña?",
    "resetPassword": "Restablecer contraseña",
    "verifyEmail": "Verificar email",
    "continueWithGoogle": "Continuar con Google",
    "error": "Email o contraseña incorrectos",
    "alreadyHaveAccount": "¿Ya tenés cuenta?",
    "dontHaveAccount": "¿No tenés cuenta?",
    "sendResetLink": "Enviar enlace",
    "backToSignIn": "Volver a iniciar sesión"
  },
  "case": {
    "status": {
      "confirmed": "Confirmado",
      "alleged": "Presunto",
      "denied": "Desmentido",
      "under_investigation": "En investigación"
    },
    "categories": {
      "political": "Político",
      "financial": "Financiero",
      "legal": "Legal",
      "media": "Medios",
      "coverup": "Encubrimiento"
    }
  }
}
```

(Note: the `nav`, `footer`, `hero`, `investigations`, `features`, `roadmap`, `masthead`, `narrative`, `whatsNext`, `cta` namespaces already exist — keep them)

- [ ] **Step 2: Create matching en.json with English translations**

Mirror the exact same structure with English translations for every key. The existing `en.json` keys stay — add all new namespaces with English text.

- [ ] **Step 3: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('messages/es.json', 'utf8')); console.log('es.json OK')"
node -e "JSON.parse(require('fs').readFileSync('messages/en.json', 'utf8')); console.log('en.json OK')"
```

- [ ] **Step 4: Commit**

```bash
git add messages/es.json messages/en.json
git commit -m "feat: expand message files with all UI strings for bilingual support"
```

---

## Task 5: Migrate SiteNav with global language toggle

**Files:**
- Create: `src/components/layout/LanguageToggle.tsx`
- Modify: `src/components/layout/SiteNav.tsx`

- [ ] **Step 1: Create LanguageToggle component**

```tsx
'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { type Locale } from '@/i18n/config'

export function LanguageToggle() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const other = locale === 'es' ? 'en' : 'es'

  function switchLocale() {
    router.replace(pathname, { locale: other })
  }

  return (
    <button
      onClick={switchLocale}
      className="rounded-md border border-zinc-700 px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
    >
      {other.toUpperCase()}
    </button>
  )
}
```

- [ ] **Step 2: Update SiteNav**

```tsx
import { Link } from '@/i18n/navigation'
import { LanguageToggle } from './LanguageToggle'

export function SiteNav() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-zinc-50">
          ORC
        </Link>
        <LanguageToggle />
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Verify toggle works**

Run dev server, visit `/es`, click toggle — should navigate to `/en` and vice versa.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/LanguageToggle.tsx src/components/layout/SiteNav.tsx
git commit -m "feat: add global language toggle to SiteNav"
```

---

## Task 6: Migrate Footer to next-intl

**Files:**
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Switch Footer from createTranslator to useTranslations**

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="border-t border-zinc-800">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-xs text-zinc-500 sm:flex-row sm:justify-between">
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
        <p className="text-center text-xs text-zinc-600">
          {t('contact')}{' '}
          <a
            href="mailto:contact@officeofaccountability.org"
            className="text-zinc-400 transition-colors hover:text-zinc-200"
          >
            contact@officeofaccountability.org
          </a>
        </p>
      </div>
    </footer>
  )
}
```

Note: Footer becomes a client component since `useTranslations` requires client context when used inside `NextIntlClientProvider`. If the Footer is rendered inside the locale layout (which has the provider), add `'use client'` at the top.

- [ ] **Step 2: Verify footer renders in both locales**

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: migrate Footer to next-intl"
```

---

## Task 7: Migrate landing page and landing components

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/components/landing/Masthead.tsx`
- Modify: `src/components/landing/NarrativeIntro.tsx`
- Modify: `src/components/landing/Chapter.tsx`
- Modify: `src/components/landing/Hero.tsx`
- Modify: `src/components/landing/WhatsNext.tsx`
- Modify: `src/components/landing/CallToAction.tsx`
- Modify: `src/components/landing/FeatureShowcase.tsx`
- Modify: `src/components/landing/Roadmap.tsx`
- Modify: `src/components/landing/InvestigationCard.tsx`
- Modify: `src/components/landing/Transition.tsx` (if exists)

- [ ] **Step 1: Update page.tsx to pass translation keys for chapter content**

The landing page currently has hardcoded Spanish inline content in JSX. Replace with message keys from the `chapters` namespace.

Update `src/app/[locale]/page.tsx` to use `getTranslations` (server component) and pass translated strings to `Chapter` components:

```tsx
import { getTranslations } from 'next-intl/server'
// ... other imports

export default async function Home() {
  const t = await getTranslations('chapters')

  return (
    <div className="mx-auto max-w-3xl">
      <Masthead />
      <NarrativeIntro />

      <Chapter
        number="I"
        label={t('i.label')}
        color="purple"
        title={t('i.title')}
        links={[{ href: '/caso/caso-libra', label: t('i.link'), color: 'purple' }]}
      >
        {t('i.body')}
      </Chapter>

      <Transition text={t('transitions.1')} />

      {/* ... repeat for all chapters ... */}

      <WhatsNext />
      <CallToAction />
    </div>
  )
}
```

- [ ] **Step 2: Migrate each landing component from createTranslator to useTranslations**

For each component that uses `createTranslator`:
1. Add `'use client'` if not already present
2. Replace `import { createTranslator } from '@/i18n/messages'` with `import { useTranslations } from 'next-intl'`
3. Replace `const t = createTranslator('namespace')` with `const t = useTranslations('namespace')`
4. Replace any `next/link` imports with `import { Link } from '@/i18n/navigation'`

- [ ] **Step 3: Verify the full landing page renders correctly in /es and /en**

- [ ] **Step 4: Commit**

```bash
git add src/app/\[locale\]/page.tsx src/components/landing/
git commit -m "feat: migrate landing page and components to next-intl"
```

---

## Task 8: Migrate config files (investigations.ts, roadmap.ts)

**Files:**
- Modify: `src/config/investigations.ts`
- Modify: `src/config/roadmap.ts`

- [ ] **Step 1: Strip display strings from investigations.ts**

Replace the current `InvestigationConfig` interface and data. Keep only structural data — display strings come from message files:

```typescript
export interface InvestigationConfig {
  slug: string
  status: 'active' | 'archived' | 'draft'
  color: string
  stats: { key: string; value: string }[]
  href: string
}

export const investigations: InvestigationConfig[] = [
  {
    slug: 'caso-libra',
    status: 'active',
    color: 'purple',
    stats: [
      { key: 'losses', value: '$251M+' },
      { key: 'walletsAffected', value: '114,000+' },
      { key: 'drop', value: '94%' },
    ],
    href: '/caso/caso-libra',
  },
  // ... repeat for all 7 cases with key-value stats
]
```

Components consuming this config will use `t(`investigationCards.${slug}.title`)` for display text and `t(`investigationCards.${slug}.stats.${stat.key}`)` for stat labels.

Note: **Spec deviation** — the spec uses `investigations` as the namespace for case card data. This plan uses `investigationCards` to avoid collision with the existing `investigations` namespace (landing page section title/explore button). All components must use `investigationCards`, not `investigations`.

- [ ] **Step 2: Strip display strings from roadmap.ts**

```typescript
export interface RoadmapPhase {
  id: string
  status: 'completed' | 'in-progress' | 'next' | 'future'
  featureCount: number
}

export const roadmapPhases: RoadmapPhase[] = [
  { id: 'phase-1', status: 'in-progress', featureCount: 4 },
  { id: 'phase-2', status: 'next', featureCount: 4 },
  { id: 'phase-3', status: 'future', featureCount: 4 },
  { id: 'phase-4', status: 'future', featureCount: 4 },
  { id: 'phase-5', status: 'future', featureCount: 4 },
]
```

Components use `t(`roadmapPhases.${phase.id}.title`)` etc.

- [ ] **Step 3: Update InvestigationCard component**

The component must now receive a `slug` and use `useTranslations('investigationCards')` to get display text, instead of receiving `title`, `subtitle`, `description` as props.

- [ ] **Step 4: Update Roadmap component**

Same pattern: use `useTranslations('roadmapPhases')` and iterate over phase IDs.

- [ ] **Step 5: Verify investigation cards and roadmap render correctly**

- [ ] **Step 6: Commit**

```bash
git add src/config/investigations.ts src/config/roadmap.ts src/components/landing/InvestigationCard.tsx src/components/landing/Roadmap.tsx
git commit -m "feat: strip display strings from config files, use message keys"
```

---

## Task 9: Migrate case layout (remove LanguageProvider, update metadata)

**Files:**
- Modify: `src/app/[locale]/caso/[slug]/layout.tsx`

- [ ] **Step 1: Rewrite case layout**

Remove `LanguageProvider`, remove `CASE_META` (metadata now comes from message files), remove `defaultLang`. The locale comes from the URL:

```tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { InvestigationNav } from '@/components/investigation/InvestigationNav'
import { BilingualLegalDisclaimer } from '@/components/investigation/LegalDisclaimer'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.cases' })

  const title = t.has(slug + '.title')
    ? t(slug + '.title')
    : 'Investigacion — Oficina de Rendicion de Cuentas'
  const description = t.has(slug + '.description')
    ? t(slug + '.description')
    : undefined

  return {
    title,
    description,
    alternates: {
      languages: {
        es: `/es/caso/${slug}`,
        en: `/en/caso/${slug}`,
      },
    },
  }
}

export default async function CasoLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode
  readonly params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await params

  return (
    <>
      <InvestigationNav slug={slug} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <BilingualLegalDisclaimer />
        </div>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\[locale\]/caso/\[slug\]/layout.tsx
git commit -m "feat: migrate case layout to next-intl, remove LanguageProvider"
```

---

## Task 10: Migrate InvestigationNav (remove per-case toggle, use next-intl)

**Files:**
- Modify: `src/components/investigation/InvestigationNav.tsx`

- [ ] **Step 1: Rewrite InvestigationNav**

Replace `useLanguage()` with `useLocale()` from next-intl. Remove the EN/ES toggle buttons (global toggle in SiteNav handles this). Switch to next-intl `Link`. Keep the `CASE_TABS` map but use `useLocale()` for label selection:

```tsx
'use client'

import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/config'

interface NavTab {
  readonly href: string
  readonly label: Record<Locale, string>
}

// ... keep CASE_TABS and DEFAULT_TABS exactly as they are ...

export function InvestigationNav({ slug }: { readonly slug: string }) {
  const pathname = usePathname()
  const locale = useLocale() as Locale
  const base = `/caso/${slug}`
  const tabDefs = CASE_TABS[slug] ?? DEFAULT_TABS
  const tabs = tabDefs.map((t) => ({ href: `${base}${t.href}`, label: t.label[locale] }))

  return (
    <nav className="scrollbar-none flex items-center gap-1 overflow-x-auto border-b border-zinc-800 px-4">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
```

Note: **Spec deviation** — the spec says tab labels should move to message files with a `case.tabs` namespace. This plan keeps `Record<Locale, string>` labels inline in the `CASE_TABS` map instead. Rationale: 7 case configs with unique tab sets makes message file lookups cumbersome, and tab labels are tightly coupled to the nav structure. The `case.tabs` namespace in message files is therefore not needed.

- [ ] **Step 2: Verify case navigation works in both locales**

- [ ] **Step 3: Commit**

```bash
git add src/components/investigation/InvestigationNav.tsx
git commit -m "feat: migrate InvestigationNav to next-intl, remove per-case toggle"
```

---

## Task 11: Migrate case pages (replace useLanguage with useLocale)

**Files:**
- All ~50 case page files that import `useLanguage` from `@/lib/language-context`

This is a bulk migration. For every file that uses `useLanguage()`:
1. Replace `import { useLanguage } from '@/lib/language-context'` with `import { useLocale } from 'next-intl'`
2. Replace `const { lang } = useLanguage()` with `const locale = useLocale()`
3. Replace `lang` variable references with `locale`
4. Replace any `next/link` with `import { Link } from '@/i18n/navigation'`

- [ ] **Step 1: Create a script or do bulk find-replace**

For each file in the list of 50+ files importing `useLanguage`:

Pattern replacement:
- `import { useLanguage } from '@/lib/language-context'` → `import { useLocale } from 'next-intl'`
- `import { useLanguage, type Lang } from '@/lib/language-context'` → `import { useLocale } from 'next-intl'` + `import type { Locale } from '@/i18n/config'`
- `const { lang } = useLanguage()` → `const locale = useLocale()`
- `const { lang, setLang, toggle } = useLanguage()` → `const locale = useLocale()` (setLang/toggle no longer needed)
- `lang` → `locale` in template literals and property accesses
- `type Lang` → `type Locale` where referenced
- `Record<Lang, string>` → `Record<Locale, string>` (in case page types)
- `import Link from 'next/link'` → `import { Link } from '@/i18n/navigation'`

- [ ] **Step 2: Handle investigation data files that use _es/_en pattern**

Files like `src/lib/caso-dictadura/investigation-data.ts` keep their `_es`/`_en` fields. Components rendering this data use `locale` from `useLocale()` to select the right field:

```tsx
const locale = useLocale()
// Instead of: item.claim_es / item.claim_en
// Use: item[`claim_${locale}`]
```

- [ ] **Step 3: Handle case-specific layouts under caso/**

These 6 named case directories have their own `layout.tsx` that imports `LanguageProvider`. Remove the provider wrapping from each — the locale now comes from the URL via `[locale]` segment:

- `src/app/[locale]/caso/caso-dictadura/layout.tsx`
- `src/app/[locale]/caso/caso-epstein/layout.tsx`
- `src/app/[locale]/caso/caso-libra/layout.tsx`
- `src/app/[locale]/caso/finanzas-politicas/layout.tsx`
- `src/app/[locale]/caso/monopolios/layout.tsx`
- `src/app/[locale]/caso/obras-publicas/layout.tsx`

For each: remove `LanguageProvider` import and wrapping, remove `defaultLang` prop.

- [ ] **Step 4: Verify each case renders in both /es/caso/... and /en/caso/...**

Spot-check at least 3 cases in both locales.

- [ ] **Step 5: Commit**

```bash
git add src/app/\[locale\]/caso/ src/components/investigation/
git commit -m "feat: migrate all case pages from useLanguage to useLocale"
```

---

## Task 12: Migrate auth pages

**Files:**
- Modify: `src/app/[locale]/auth/signin/page.tsx`
- Modify: `src/app/[locale]/auth/signup/page.tsx`
- Modify: `src/app/[locale]/auth/forgot-password/page.tsx`
- Modify: `src/app/[locale]/auth/reset-password/page.tsx`
- Modify: `src/app/[locale]/auth/verify-email/page.tsx`
- Modify: `src/app/[locale]/auth/error/page.tsx`

- [ ] **Step 1: For each auth page, replace hardcoded Spanish strings with useTranslations**

Each auth page is a `'use client'` component. Add:

```tsx
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

// Inside component:
const t = useTranslations('auth')
// Replace "Iniciar sesión" → t('signIn')
// Replace "Email o contraseña incorrectos" → t('error')
// etc.
```

- [ ] **Step 2: Replace next/link with next-intl Link in auth pages**

- [ ] **Step 3: Verify auth flows work in both locales**

- [ ] **Step 4: Commit**

```bash
git add src/app/\[locale\]/auth/
git commit -m "feat: migrate auth pages to next-intl"
```

---

## Task 13: Migrate remaining pages and components

**Files:**
- `src/app/[locale]/explorar/page.tsx`
- `src/app/[locale]/investigaciones/page.tsx`
- `src/app/[locale]/investigacion/*/page.tsx`
- `src/app/[locale]/mis-investigaciones/page.tsx`
- `src/app/[locale]/perfil/page.tsx`
- `src/app/[locale]/politico/[slug]/page.tsx`
- `src/app/[locale]/provincias/**`
- `src/components/investigation/LegalDisclaimer.tsx`
- `src/components/investigation/SimulationPanel.tsx`
- `src/components/investigation/TargetCard.tsx`
- `src/components/auth/UserMenu.tsx`
- Any remaining component using `next/link` or `useLanguage`

- [ ] **Step 1: Migrate each remaining page**

Same pattern as case pages:
- `useLanguage` → `useLocale`
- `next/link` → `@/i18n/navigation` Link
- Hardcoded strings → `useTranslations`

- [ ] **Step 2: Update LegalDisclaimer**

Replace `useLanguage()` with `useLocale()`. The component already has bilingual text — just switch the hook.

- [ ] **Step 3: Update SimulationPanel**

Replace hardcoded English preset prompts and labels with message keys.

- [ ] **Step 4: Verify all remaining pages render**

- [ ] **Step 5: Commit**

```bash
git add src/app/\[locale\]/ src/components/
git commit -m "feat: migrate remaining pages and components to next-intl"
```

---

## Task 14: Delete deprecated files

**Files:**
- Delete: `src/lib/language-context.tsx`
- Delete: `src/i18n/messages.ts`

- [ ] **Step 1: Verify no remaining imports of deprecated modules**

```bash
grep -r "language-context" src/ --include="*.tsx" --include="*.ts"
grep -r "@/i18n/messages" src/ --include="*.tsx" --include="*.ts"
grep -r "createTranslator" src/ --include="*.tsx" --include="*.ts"
grep -r "from 'next/link'" src/ --include="*.tsx" --include="*.ts"
grep -r "from 'next/navigation'" src/ --include="*.tsx" --include="*.ts"
```

All should return empty. Any stale `next/link` imports will produce links missing the locale prefix. Replace with `import { Link } from '@/i18n/navigation'`. Any stale `next/navigation` imports (usePathname, useRouter) should use the next-intl equivalents from `@/i18n/navigation`.

- [ ] **Step 2: Delete the files**

```bash
rm src/lib/language-context.tsx
rm src/i18n/messages.ts
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove deprecated language-context and custom translator"
```

---

## Task 15: Full verification pass

- [ ] **Step 1: Run dev server**

```bash
pnpm run dev
```

- [ ] **Step 2: Test locale detection**

Open browser with English Accept-Language. Visit `/`. Should redirect to `/en/`.
Open incognito or change browser language to Spanish. Visit `/`. Should redirect to `/es/`.

- [ ] **Step 3: Test global toggle**

From `/es/`, click the toggle in SiteNav. Should navigate to `/en/`. Refresh — should stay on `/en/` (cookie persistence).

- [ ] **Step 4: Test every major page in both locales**

- `/es/` and `/en/` — landing page
- `/es/caso/caso-libra` and `/en/caso/caso-libra`
- `/es/caso/caso-epstein` and `/en/caso/caso-epstein`
- `/es/caso/caso-dictadura` and `/en/caso/caso-dictadura`
- `/es/auth/signin` and `/en/auth/signin`
- `/es/provincias` and `/en/provincias`

- [ ] **Step 5: Check metadata (view source)**

Verify `<html lang="es">` on Spanish pages, `<html lang="en">` on English pages.
Verify `<title>` is translated.
Verify hreflang alternates are present.

- [ ] **Step 6: Check API routes are unaffected**

```bash
curl http://localhost:3000/api/health  # or any API route
```

Should work without locale prefix.

- [ ] **Step 7: Build check**

```bash
pnpm run build
```

Fix any build errors.

- [ ] **Step 8: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during bilingual verification"
```

---

## Task 16: Commit and wrap up

- [ ] **Step 1: Verify clean git status**

```bash
git status
```

- [ ] **Step 2: Squash or organize commits if desired**

The work produced ~15 commits. They can stay as-is (clear history) or be squashed into a single feature commit for a PR.

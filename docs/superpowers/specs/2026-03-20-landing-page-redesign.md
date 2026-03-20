# Landing Page Redesign — Design Spec

**Date:** 2026-03-20
**Status:** Draft
**Scope:** Homepage, global nav/footer, i18n foundation

---

## 1. Overview

Redesign the ORC landing page from a hardcoded 3-case showcase into a component-driven, i18n-ready page that reflects the platform's full capabilities and supports dynamic investigation discovery.

### Goals

- All active investigations appear automatically (via static config now, Neo4j later)
- Platform capabilities are presented as a feature showcase section
- Navigation restructured to minimal: Logo + Explorar + Investigaciones + auth
- i18n infrastructure in place (Spanish primary, English stub)
- Components are reusable across other pages (`/investigaciones`, caso pages)

### Non-goals

- No dynamic Neo4j queries on the homepage (static config for now)
- No changes to existing caso pages, investigation pages, or auth pages
- No locale-prefix routing yet (`/es/...`, `/en/...`)
- No roadmap section (planned as future addition)

---

## 2. Data Layer

### Static Investigation Config

A typed config file that mirrors what a future Neo4j query would return.

**File:** `webapp/src/config/investigations.ts`

```typescript
export interface InvestigationConfig {
  slug: string
  title: string          // i18n message key
  subtitle: string       // i18n message key
  description: string    // i18n message key
  status: 'active' | 'archived' | 'draft'
  color: 'purple' | 'red' | 'emerald' | 'amber' | 'blue'
  stats: { label: string; value: string }[]  // i18n message keys
  href: string
}

export const investigations: InvestigationConfig[]
```

Three entries: Caso Libra, Caso Epstein, Finanzas Politicas. Adding a new case = adding an object to this array.

**Migration to dynamic:** Replace the static array with a Neo4j query. The `InvestigationConfig` interface stays the same — components don't change.

---

## 3. Component Architecture

### 3.1 `<SiteNav>` — Client Component

**File:** `webapp/src/components/layout/SiteNav.tsx`

- Logo ("ORC") on the left, links to `/`
- Two links: "Explorar" → `/explorar`, "Investigaciones" → `/investigaciones`
- Auth: logged out → "Iniciar sesion" link to `/auth/signin`; logged in → `<UserMenu />` (existing component)
- Mobile: compact layout (hamburger or collapsed)
- All labels are i18n message keys

### 3.2 `<Hero>` — Server Component

**File:** `webapp/src/components/landing/Hero.tsx`

- Platform badge: "Plataforma de conocimiento civico"
- Title: "Oficina de Rendicion de Cuentas"
- Subtitle: "Investigaciones abiertas con datos verificables. Grafos de conocimiento, cronologias, evidencia documental y analisis de red."
- Two CTAs: "Explorar el grafo" → `/explorar`, "Ver investigaciones" → `/investigaciones`
- All text from i18n messages

### 3.3 `<InvestigationCard>` — Server Component

**File:** `webapp/src/components/landing/InvestigationCard.tsx`

- Props: `InvestigationConfig` object
- Renders: colored border/gradient based on `color`, status badge, title, description, stats row, "Explorar →" link
- Reusable on `/investigaciones` page
- Color mapping: purple (Libra), red (Epstein), emerald (Finanzas), etc.

### 3.4 `<FeatureShowcase>` — Server Component

**File:** `webapp/src/components/landing/FeatureShowcase.tsx`

- Section title: "Que podes hacer"
- Grid of 4-6 cards, each with:
  - Text-based icon (no external icon library)
  - Title (i18n key)
  - Short description (i18n key)
- Features:
  1. **Grafo interactivo** — Explora conexiones entre politicos, votaciones, legislacion y donantes
  2. **Cronologias** — Visualiza la secuencia de eventos en cada investigacion
  3. **Evidencia documental** — Documentos judiciales, registros oficiales y fuentes verificadas
  4. **Investigaciones comunitarias** — Crea y publica investigaciones respaldadas por datos del grafo
  5. **Analisis de red** — Descubri patrones: quien conoce a quien, quien financia a quien
  6. **Flujos de dinero** — Seguimiento de fondos: donantes, campanas y conexiones financieras

### 3.5 `<Roadmap>` — Server Component

**File:** `webapp/src/components/landing/Roadmap.tsx`

- Section title: "Hoja de ruta"
- Visual timeline or stepped layout showing three phases from PRD Section 11 + future vision from Section 14
- Each phase shows: phase name, goal summary, key features as a compact list, status badge (Completado / En progreso / Proximo / Futuro)
- Phases:
  1. **Fase 1 — Motor de Grafos + Investigaciones** (status: En progreso) — Explorador interactivo, datos legislativos, perfiles de politicos, editor de investigaciones, coaliciones, sistema de endorsement
  2. **Fase 2 — Grafos Avanzados + IA** (status: Proximo) — Consultas multi-hop, IA para investigaciones, extraccion de promesas, verificacion DNI/CUIL, API publica, mapas por jurisdiccion
  3. **Fase 3 — Vision Futura** (status: Futuro) — Scoring de rendicion de cuentas, democracia liquida, votacion cuadratica, mandatos ciudadanos, resistencia a Sybil, cobertura provincial
- Data source: static config in `webapp/src/config/roadmap.ts` — typed array of phases with features, sourced from PRD
- All labels are i18n message keys

### 3.6 `<Footer>` — Server Component

**File:** `webapp/src/components/layout/Footer.tsx`

- Tagline: "Oficina de Rendicion de Cuentas — Datos abiertos"
- Links: "Explorar", "Investigaciones" (matching nav)
- All text from i18n messages

---

## 4. Page Composition

### `webapp/src/app/page.tsx`

```tsx
<div className="min-h-screen bg-zinc-950">
  <Hero />
  <section> <!-- Investigation cards grid -->
    {investigations.filter(i => i.status === 'active').map(i => (
      <InvestigationCard key={i.slug} config={i} />
    ))}
  </section>
  <FeatureShowcase />
  <Roadmap />
</div>
```

`<SiteNav />` and `<Footer />` come from `layout.tsx` — not in `page.tsx`.

### `webapp/src/app/layout.tsx`

```tsx
<html lang={locale}>
  <body>
    <NextIntlClientProvider>
      <SiteNav />
      {children}
      <Footer />
    </NextIntlClientProvider>
  </body>
</html>
```

---

## 5. Navigation & Layout Changes

### Global nav in layout

- `layout.tsx` gains `<SiteNav />` above `{children}` and `<Footer />` below
- `page.tsx` loses its inline header and footer
- All pages gain consistent nav/footer automatically

### Impact on existing pages

- **Caso pages:** Keep `InvestigationNav` for sub-tabs. `SiteNav` sits above it from the layout. No modifications needed to caso pages themselves.
- **Other pages** (`/investigaciones`, `/explorar`, `/politico/*`, auth): Gain a consistent nav they didn't have or had inconsistently. No modifications needed.

### Auth integration

- `SiteNav` reads session state to conditionally render sign-in link or `<UserMenu />`
- Uses existing `SessionProvider` and auth utilities

---

## 6. i18n Setup

### Library: next-intl

### File structure

```
webapp/
  messages/
    es.json        ← Spanish (primary, complete)
    en.json        ← English (stub, partial)
  src/
    i18n/
      config.ts    ← locale list, default locale
      request.ts   ← next-intl getRequestConfig
```

### What gets internationalized

- `SiteNav` labels
- `Hero` text (title, subtitle, CTAs)
- `FeatureShowcase` card titles and descriptions
- `Roadmap` phase names, goals, feature lists, status badges
- `Footer` text
- `InvestigationConfig` display strings (title, subtitle, description, stat labels)

### What does NOT get internationalized

- Case-specific content (narratives, actor names, documents)
- Existing caso pages, investigation editor, politician profiles
- `InvestigationNav` tabs (per-case content)

### Routing

- No locale prefix routing for now
- Single locale (`es`) as default
- Structure supports adding middleware for locale detection + prefix routing later

---

## 7. File Changes

### New files

| File | Purpose |
|------|---------|
| `webapp/src/config/investigations.ts` | Static investigation config array + types |
| `webapp/src/components/layout/SiteNav.tsx` | Global minimal nav (client component) |
| `webapp/src/components/layout/Footer.tsx` | Global footer (server component) |
| `webapp/src/components/landing/Hero.tsx` | Mission-focused hero section |
| `webapp/src/components/landing/InvestigationCard.tsx` | Reusable investigation card |
| `webapp/src/components/landing/FeatureShowcase.tsx` | Platform capability grid |
| `webapp/src/components/landing/Roadmap.tsx` | Phased roadmap timeline |
| `webapp/src/config/roadmap.ts` | Static roadmap phase config + types |
| `webapp/messages/es.json` | Spanish UI strings |
| `webapp/messages/en.json` | English stub |
| `webapp/src/i18n/config.ts` | Locale config |
| `webapp/src/i18n/request.ts` | next-intl server setup |

### Modified files

| File | Change |
|------|--------|
| `webapp/src/app/layout.tsx` | Add `<SiteNav />`, `<Footer />`, next-intl provider |
| `webapp/src/app/page.tsx` | Full rewrite — compose from new components |
| `webapp/package.json` | Add `next-intl` dependency |

### Untouched

- All caso pages, investigation pages, politician pages, auth pages
- `InvestigationNav` — stays as-is for caso sub-tabs
- All existing components

### New dependency

- `next-intl` — one package

---

## 8. Design Decisions

| Decision | Rationale |
|----------|-----------|
| Static config over Neo4j | Homepage shouldn't depend on database availability; trivial to swap later |
| next-intl over custom solution | Best Next.js App Router support, works with server components, lightweight |
| No locale routing yet | Avoid complexity until English content actually exists |
| SiteNav in layout, not page | Consistent nav across entire app without modifying every page |
| Message keys in config | InvestigationConfig references i18n keys, not raw strings — translations work automatically |
| Text icons over icon library | No new dependency for 6 decorative icons; swap to lucide-react or similar later if needed |
| Feature showcase as static | Platform capabilities don't change often; no need for dynamic content here |

---

## 9. Future Additions (Not in Scope)

- **Dynamic investigation loading** — swap config file for Neo4j query
- **Locale prefix routing** — `/es/...`, `/en/...` with middleware
- **Search on homepage** — global search bar in nav or hero
- **Live stats** — node/edge counts from Neo4j displayed on homepage

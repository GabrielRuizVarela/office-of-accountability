# Bilingual App Design

Make the entire Office of Accountability webapp fully bilingual (Spanish/English) using URL-based routing, browser locale detection, and a global language toggle.

## Decisions

- **Library**: next-intl (already partially set up)
- **Routing**: `[locale]` segment — `/es/...` and `/en/...`
- **Detection**: Middleware reads `Accept-Language` header on first visit, redirects to detected locale
- **Persistence**: `NEXT_LOCALE` cookie, set by the global toggle
- **Default locale**: `es`
- **Per-case defaults**: Removed — global language choice always wins
- **Untranslated content**: None — all UI strings get translated; investigation data keeps its existing bilingual field pattern

## Vite/vinext Compatibility

This project uses Next.js 16 with Vite (vinext), not the standard webpack bundler. Before full implementation:

**Spike required**: Verify that `next-intl` works with vinext by testing:
1. `createNextIntlPlugin()` in `next.config.ts` — does the plugin compose with Vite?
2. `next-intl/middleware` — does the middleware export work in the vinext middleware pipeline?
3. `getTranslations` / `useTranslations` — do server and client hooks resolve messages correctly?

**Fallback plan**: If `next-intl/plugin` is incompatible with vinext, use next-intl in "client-only" mode:
- Skip the plugin wrapper in `next.config.ts`
- Manually parse the locale from the URL in middleware (custom code, not `next-intl/middleware`)
- Load messages via dynamic import in the `[locale]/layout.tsx` and pass through `NextIntlClientProvider`
- Server components use `getTranslations` with explicit locale parameter

## Route Structure

### Before

```
src/app/
  layout.tsx              # root, lang="es" hardcoded
  page.tsx                # landing
  caso/[slug]/...         # case pages
  auth/...
  provincias/...
  api/...
```

### After

```
src/app/
  layout.tsx              # minimal root — no lang attribute
  [locale]/
    layout.tsx            # sets <html lang={locale}>, wraps NextIntlClientProvider
    page.tsx              # landing
    caso/[slug]/...       # case pages
    auth/...
    provincias/...
  api/...                 # excluded from locale routing
```

## Middleware Composition

The existing `src/middleware.ts` handles rate limiting, CSRF protection, and security headers (~200 lines). The locale middleware must compose with it, not replace it.

### Strategy

```tsx
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes: existing rate-limit + CSRF logic only (no locale)
  if (pathname.startsWith('/api/')) {
    return handleApiMiddleware(request); // extracted from current middleware
  }

  // Non-API routes: locale middleware first, then security headers + CSRF cookie
  const response = intlMiddleware(request);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  await ensureCsrfCookie(request, response);
  return response;
}
```

The existing CSRF validation, rate limiting, and security header logic stays unchanged for `/api/*` routes. For page routes, `intlMiddleware` handles locale detection/redirect, and we layer security headers and CSRF cookie on top of its response.

## Message Files

Expand existing `/messages/es.json` and `/messages/en.json` to hold all UI strings.

### What goes in message files (UI strings)

Labels, headings, navigation, buttons, descriptions, metadata, error messages, legal text, roadmap phases, feature descriptions.

### What stays in code (investigation data)

Structured investigation records in `src/lib/caso-*/investigation-data.ts` files keep their existing `_es`/`_en` field suffix pattern (e.g., `claim_es`, `claim_en`, `title_es`, `title_en`). These are typed data arrays with hundreds of entries — not translatable UI strings. Components rendering this data select the right field using the locale:

```tsx
// Helper to select the right language field from investigation data
function pickLang<T>(item: T, field: string, locale: Locale): string {
  return (item as Record<string, string>)[`${field}_${locale}`] ??
         (item as Record<string, string>)[`${field}_es`];
}

// Usage
<p>{pickLang(factcheck, 'claim', locale)}</p>
```

Similarly, long-form narrative content (LibraArticle chapters, NuclearRiskArticle) stays co-located in their component files as bilingual objects. These are multi-paragraph investigative articles — forcing them into flat JSON would be awkward and hard to maintain.

### Namespace Structure

```json
{
  "nav": {
    "explore": "...",
    "investigations": "...",
    "signIn": "...",
    "switchLang": "..."
  },
  "hero": {
    "badge": "...",
    "title": "...",
    "subtitle": "...",
    "ctaExplore": "...",
    "ctaInvestigations": "..."
  },
  "footer": { "...": "..." },
  "features": {
    "title": "...",
    "graph": { "title": "...", "description": "..." },
    "timeline": { "title": "...", "description": "..." },
    "evidence": { "title": "...", "description": "..." },
    "community": { "title": "...", "description": "..." },
    "network": { "title": "...", "description": "..." },
    "money": { "title": "...", "description": "..." }
  },
  "roadmap": {
    "title": "...",
    "phases": {
      "phase1": { "title": "...", "goal": "...", "statusLabel": "...", "features": ["..."] }
    }
  },
  "investigations": {
    "caso-libra": { "title": "...", "subtitle": "...", "description": "...", "stats": { "losses": "...", "walletsAffected": "...", "drop": "..." } },
    "caso-epstein": { "title": "...", "subtitle": "...", "description": "...", "stats": { "entities": "...", "actors": "...", "documents": "..." } },
    "caso-dictadura": { "title": "...", "subtitle": "...", "description": "...", "stats": { "victims": "...", "ccds": "...", "nodes": "..." } },
    "finanzas-politicas": { "title": "...", "subtitle": "...", "description": "...", "stats": { "legislators": "...", "etlSources": "..." } },
    "monopolios": { "title": "...", "subtitle": "...", "description": "...", "stats": { "sectors": "...", "crossRefs": "...", "annualCost": "..." } },
    "obras-publicas": { "title": "...", "subtitle": "...", "description": "...", "stats": { "entities": "...", "projects": "...", "crossRefs": "..." } },
    "riesgo-nuclear": { "title": "...", "subtitle": "...", "description": "...", "stats": { "sources": "...", "theaters": "...", "nuclearStates": "..." } }
  },
  "case": {
    "tabs": {
      "caso-epstein": { "overview": "...", "summary": "...", "investigation": "...", "connections": "...", "timeline": "...", "flights": "...", "proximity": "...", "simulation": "..." },
      "caso-libra": { "overview": "...", "summary": "...", "investigation": "...", "connections": "...", "timeline": "...", "simulation": "..." },
      "default": { "overview": "...", "summary": "...", "investigation": "...", "connections": "...", "timeline": "..." }
    },
    "status": {
      "confirmed": "...",
      "alleged": "...",
      "denied": "...",
      "under_investigation": "..."
    },
    "categories": {
      "political": "...",
      "financial": "...",
      "legal": "...",
      "media": "...",
      "coverup": "..."
    }
  },
  "simulation": {
    "comingSoon": "...",
    "title": "...",
    "description": "...",
    "predictions": { "...": "..." }
  },
  "legal": {
    "disclaimer": "...",
    "sources": "..."
  },
  "auth": {
    "signIn": "...",
    "signUp": "...",
    "email": "...",
    "password": "...",
    "forgotPassword": "...",
    "error": "..."
  },
  "metadata": {
    "siteTitle": "...",
    "siteDescription": "...",
    "cases": {
      "caso-libra": { "title": "...", "description": "..." },
      "caso-epstein": { "title": "...", "description": "..." },
      "caso-dictadura": { "title": "...", "description": "..." },
      "finanzas-politicas": { "title": "...", "description": "..." },
      "monopolios": { "title": "...", "description": "..." },
      "obras-publicas": { "title": "...", "description": "..." },
      "riesgo-nuclear": { "title": "...", "description": "..." }
    }
  }
}
```

## Component Migration

### Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page({ params }: { params: { locale: string } }) {
  const t = await getTranslations('case');
  return <h1>{t('tabs.overview')}</h1>;
}
```

### Client Components

```tsx
'use client';
import { useTranslations } from 'next-intl';

export function SimulationPanel() {
  const t = useTranslations('simulation');
  return <p>{t('comingSoon')}</p>;
}
```

### Language Toggle

A component in `SiteNav` that:
1. Reads current locale from `useLocale()`
2. Computes the target path by swapping the locale prefix
3. Renders a link/button (e.g., "EN" when viewing Spanish, "ES" when viewing English)
4. Uses next-intl's `Link` from `createNavigation()` — handles locale prefixing automatically

### Link Migration

All internal links must switch from `next/link` to next-intl's navigation wrapper so locale prefixes are handled automatically:

```tsx
import { createNavigation } from 'next-intl/navigation';
import { locales } from '@/i18n/config';

export const { Link, redirect, usePathname, useRouter } = createNavigation({ locales });
```

This replaces `next/link` and `next/navigation` imports throughout the app. Links like `/caso/caso-libra` automatically become `/{locale}/caso/caso-libra`. The `InvestigationNav` tab hrefs and `investigations.ts` href values no longer need manual locale prefixing.

### Config Files

`investigations.ts` and `roadmap.ts` lose display strings. They keep structural data only:

```tsx
// investigations.ts — before
{ title: 'Caso Libra', subtitle: '...', description: '...' }

// investigations.ts — after
{ slug: 'caso-libra', color: 'purple', status: 'active', href: '/caso/caso-libra',
  stats: [{ key: 'losses', value: '$251M+' }, { key: 'walletsAffected', value: '114,000+' }] }
// Display strings come from t('investigations.caso-libra.title')
// Stat labels come from t('investigations.caso-libra.stats.losses')
```

### InvestigationNav Tab Migration

The `CASE_TABS` map in `InvestigationNav.tsx` currently has per-case tab arrays with bilingual labels. After migration:

```tsx
// Tab structure keeps hrefs, loses labels
const CASE_TABS: Record<string, readonly { href: string; key: string }[]> = {
  'caso-epstein': [
    { href: '', key: 'overview' },
    { href: '/resumen', key: 'summary' },
    { href: '/investigacion', key: 'investigation' },
    // ...
  ],
};

// Labels come from message files
const label = t(`tabs.${slug}.${tab.key}`) ?? t(`tabs.default.${tab.key}`);
```

Per-case tabs that don't exist in other cases (e.g., "flights" for Epstein) are defined in the per-case namespace, with a fallback to `case.tabs.default` for shared tabs.

## What Gets Removed

| Item | Location | Replacement |
|------|----------|-------------|
| `LanguageProvider` context | `src/lib/language-context.tsx` | next-intl locale from URL |
| Custom `createTranslator` | `src/i18n/messages.ts` | `useTranslations` / `getTranslations` |
| Inline `{ en, es }` objects in UI | Throughout case pages (UI strings only) | Message file keys |
| Per-case `defaultLang` | `src/app/caso/[slug]/layout.tsx` | Global locale from URL |
| Per-case EN/ES toggle | `InvestigationNav.tsx` | Global toggle in SiteNav |
| Hardcoded `lang="es"` | `src/app/layout.tsx` | Dynamic `lang={locale}` |

Note: Inline bilingual objects in investigation data files and long-form narrative components are **not** removed — they keep their `_es`/`_en` pattern and select the right field using the URL locale.

## What Gets Updated

| Item | Change |
|------|--------|
| `next.config.ts` | Wrap with `createNextIntlPlugin()` from `next-intl/plugin` (verify vinext compat first) |
| `src/i18n/config.ts` | Already exports `locales`, `defaultLocale` — add `pathnames` config if needed |
| `src/i18n/request.ts` | Read locale from `requestLocale` param instead of hardcoding `defaultLocale` |
| `src/i18n/navigation.ts` | New file — `createNavigation()` exports `Link`, `redirect`, `usePathname`, `useRouter` |
| `/messages/es.json` | Expand with all UI strings |
| `/messages/en.json` | Expand with all UI strings |
| `SiteNav` | Add global language toggle, use next-intl `Link` |
| All page/layout files | Move under `[locale]/`, use next-intl APIs |
| `generateMetadata` functions | Read locale, return translated metadata + hreflang alternates |
| `src/middleware.ts` | Compose locale middleware with existing CSRF/rate-limit logic |
| All `next/link` imports | Switch to next-intl `Link` from `src/i18n/navigation.ts` |

## Metadata & SEO

Each layout/page with `generateMetadata`:

```tsx
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations('metadata');
  return {
    title: t('siteTitle'),
    description: t('siteDescription'),
    alternates: {
      languages: { es: '/es', en: '/en' }
    }
  };
}
```

- `<html lang={locale}>` set dynamically from `[locale]` param
- Each case page generates its own title/description from `metadata.cases.{slug}`
- `alternates.languages` provides hreflang for search engines
- OG tags translated per locale

## Testing

- Verify middleware redirects: `/` → `/es/` (or `/en/` based on browser)
- Verify cookie persistence: toggle to EN, refresh, stays on EN
- Verify all pages render correctly in both locales (including `provincias/`)
- Verify metadata (view source) shows correct lang, title, description
- Verify no hardcoded Spanish or English UI strings remain outside message files
- Verify API routes are unaffected by locale routing
- Verify investigation data pages render correct `_es`/`_en` fields per locale
- Verify internal links include locale prefix automatically
- Verify CSRF protection and rate limiting still work after middleware composition

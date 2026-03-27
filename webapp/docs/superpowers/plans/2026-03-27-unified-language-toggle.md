# Unified Language Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the language toggle into a single provider with localStorage persistence and one shared toggle component.

**Architecture:** Single `LanguageProvider` at root layout with `localStorage` hydration via `useEffect`. Shared `LanguageToggle` component replaces duplicate inline toggles in SiteNav and InvestigationNav. Case layout's nested provider and per-case `defaultLang` removed.

**Tech Stack:** React 19 context, localStorage, TypeScript, TailwindCSS 4

---

## File Structure

| File | Role |
|------|------|
| `src/lib/language-context.tsx` | Modify: add localStorage persistence + useEffect hydration |
| `src/components/ui/LanguageToggle.tsx` | Create: shared toggle component |
| `src/components/layout/SiteNav.tsx` | Modify: replace inline toggles with shared component |
| `src/components/investigation/InvestigationNav.tsx` | Modify: replace inline toggle with shared component |
| `src/app/caso/[slug]/layout.tsx` | Modify: remove LanguageProvider wrapper + defaultLang |
| `src/lib/__tests__/language-context.test.tsx` | Create: unit tests for persistence behavior |

---

### Task 1: Add localStorage persistence to LanguageProvider

**Files:**
- Modify: `src/lib/language-context.tsx`
- Create: `src/lib/__tests__/language-context.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// src/lib/__tests__/language-context.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '../language-context'

function LangDisplay() {
  const { lang, setLang } = useLanguage()
  return (
    <>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('en')}>set-en</button>
      <button onClick={() => setLang('es')}>set-es</button>
    </>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('LanguageProvider', () => {
  it('defaults to "es" when no stored preference', () => {
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>,
    )
    expect(screen.getByTestId('lang').textContent).toBe('es')
  })

  it('hydrates from localStorage after mount', async () => {
    localStorage.setItem('oa-lang', 'en')
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>,
    )
    // useEffect runs after mount
    await vi.waitFor(() => {
      expect(screen.getByTestId('lang').textContent).toBe('en')
    })
  })

  it('persists language change to localStorage', () => {
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>,
    )
    act(() => {
      screen.getByText('set-en').click()
    })
    expect(localStorage.getItem('oa-lang')).toBe('en')
    expect(screen.getByTestId('lang').textContent).toBe('en')
  })

  it('ignores invalid localStorage values', async () => {
    localStorage.setItem('oa-lang', 'fr')
    render(
      <LanguageProvider>
        <LangDisplay />
      </LanguageProvider>,
    )
    // Should stay at default, not crash
    await vi.waitFor(() => {
      expect(screen.getByTestId('lang').textContent).toBe('es')
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm vitest run src/lib/__tests__/language-context.test.tsx`
Expected: Failures — "hydrates from localStorage" and "persists language change" will fail since current provider ignores localStorage.

- [ ] **Step 3: Implement localStorage persistence**

Replace the full contents of `src/lib/language-context.tsx` with:

```tsx
'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type Lang = 'en' | 'es'

const STORAGE_KEY = 'oa-lang'
const DEFAULT_LANG: Lang = 'es'

function isValidLang(value: unknown): value is Lang {
  return value === 'en' || value === 'es'
}

interface LanguageContextValue {
  readonly lang: Lang
  readonly setLang: (lang: Lang) => void
  readonly toggle: () => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  toggle: () => {},
})

export function LanguageProvider({ children }: { readonly children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG)

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isValidLang(stored)) {
      setLangState(stored)
    }
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const toggle = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'en' ? 'es' : 'en'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm vitest run src/lib/__tests__/language-context.test.tsx`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/vg/dev/office-of-accountability/webapp
git add src/lib/language-context.tsx src/lib/__tests__/language-context.test.tsx
git commit -m "feat: add localStorage persistence to LanguageProvider"
```

---

### Task 2: Create shared LanguageToggle component

**Files:**
- Create: `src/components/ui/LanguageToggle.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/ui/LanguageToggle.tsx
'use client'

import { useLanguage } from '@/lib/language-context'

interface LanguageToggleProps {
  readonly size?: 'default' | 'sm'
}

export function LanguageToggle({ size = 'default' }: LanguageToggleProps) {
  const { lang, setLang } = useLanguage()

  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-800 p-0.5">
      <button
        onClick={() => setLang('en')}
        className={`rounded-md font-medium transition-colors ${padding} ${
          lang === 'en' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('es')}
        className={`rounded-md font-medium transition-colors ${padding} ${
          lang === 'es' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        ES
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run typecheck`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /home/vg/dev/office-of-accountability/webapp
git add src/components/ui/LanguageToggle.tsx
git commit -m "feat: add shared LanguageToggle component"
```

---

### Task 3: Replace inline toggles in SiteNav

**Files:**
- Modify: `src/components/layout/SiteNav.tsx`

- [ ] **Step 1: Update SiteNav**

Add import at top of file:

```tsx
import { LanguageToggle } from '@/components/ui/LanguageToggle'
```

Change the `useLanguage` destructuring from:
```tsx
const { lang, setLang } = useLanguage()
```
to:
```tsx
const { lang } = useLanguage()
```

Replace the desktop language toggle block (lines 44-62, the `{/* Language toggle */}` div inside the desktop nav):
```tsx
          {/* Language toggle */}
          <div className="ml-2">
            <LanguageToggle />
          </div>
```

Replace the mobile lang toggle + hamburger section. The outer div `className="flex items-center gap-2 sm:hidden"` should become:
```tsx
        <div className="flex items-center gap-2 sm:hidden">
          <LanguageToggle size="sm" />
          <button
            type="button"
            className="text-zinc-400"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
```

- [ ] **Step 2: Verify typecheck passes**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run typecheck`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /home/vg/dev/office-of-accountability/webapp
git add src/components/layout/SiteNav.tsx
git commit -m "refactor: use shared LanguageToggle in SiteNav"
```

---

### Task 4: Replace inline toggle in InvestigationNav

**Files:**
- Modify: `src/components/investigation/InvestigationNav.tsx`

- [ ] **Step 1: Update InvestigationNav**

Add import at top of file:

```tsx
import { LanguageToggle } from '@/components/ui/LanguageToggle'
```

Change the `useLanguage` destructuring from:
```tsx
const { lang, setLang } = useLanguage()
```
to:
```tsx
const { lang } = useLanguage()
```

Replace the language toggle block at the end of the nav (lines 138-160, the `{/* Language toggle */}` div) with:

```tsx
      {/* Language toggle */}
      <div className="ml-auto shrink-0">
        <LanguageToggle size="sm" />
      </div>
```

- [ ] **Step 2: Verify typecheck passes**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run typecheck`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /home/vg/dev/office-of-accountability/webapp
git add src/components/investigation/InvestigationNav.tsx
git commit -m "refactor: use shared LanguageToggle in InvestigationNav"
```

---

### Task 5: Remove nested LanguageProvider from case layout

**Files:**
- Modify: `src/app/caso/[slug]/layout.tsx`

- [ ] **Step 1: Update case layout**

Remove the `LanguageProvider` and `Lang` imports. Change the import line from:
```tsx
import { LanguageProvider, type Lang } from '@/lib/language-context'
```
to remove it entirely (no longer needed).

Remove `defaultLang` from every entry in `CASE_META`. The type changes from:
```tsx
const CASE_META: Readonly<Record<string, { title: string; description: string; defaultLang: Lang }>> = {
```
to:
```tsx
const CASE_META: Readonly<Record<string, { title: string; description: string }>> = {
```

Remove `defaultLang: 'es'` and `defaultLang: 'en'` from each entry in the record.

Remove the `defaultLang` variable and `LanguageProvider` wrapper from the component. Change `CasoLayout` from:
```tsx
export default async function CasoLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const defaultLang = CASE_META[slug]?.defaultLang ?? 'es'

  return (
    <LanguageProvider defaultLang={defaultLang}>
      <InvestigationNav slug={slug} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
        <div className="mt-8 border-t border-zinc-800 pt-6">
          <BilingualLegalDisclaimer />
        </div>
      </main>
    </LanguageProvider>
  )
}
```
to:
```tsx
export default async function CasoLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode
  readonly params: Promise<{ slug: string }>
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

- [ ] **Step 2: Update root layout to remove defaultLang prop**

In `src/app/layout.tsx`, the `LanguageProvider` no longer accepts `defaultLang`. Change:
```tsx
<LanguageProvider defaultLang="es">
```
to:
```tsx
<LanguageProvider>
```

- [ ] **Step 3: Verify typecheck passes**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm run typecheck`
Expected: No errors.

- [ ] **Step 4: Run full test suite**

Run: `cd /home/vg/dev/office-of-accountability/webapp && pnpm vitest run`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
cd /home/vg/dev/office-of-accountability/webapp
git add src/app/caso/[slug]/layout.tsx src/app/layout.tsx
git commit -m "refactor: remove nested LanguageProvider from case layout"
```

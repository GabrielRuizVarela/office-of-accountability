# Graph Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface live graph relationship examples in three locations (landing page, feature showcase, Epstein inicio) to make the graph engine prominent and tangible.

**Architecture:** New server-side query function fetches curated compelling relationships and top-connected hub nodes from Neo4j. A shared `GraphShowcase` React component renders them as styled SVG node-edge mini-diagrams. The component is placed in three locations with context-appropriate sizing.

**Tech Stack:** Neo4j (Cypher), Next.js API route, React, TailwindCSS, existing graph color constants

---

### Task 1: Showcase Query Function

**Files:**
- Modify: `webapp/src/lib/graph/queries.ts` (add `getShowcaseData` function)
- Modify: `webapp/src/lib/graph/index.ts` (re-export)

**Context:** Uses `getDriver()` from `webapp/src/lib/neo4j/client.ts`. All queries must be parameterized Cypher with `TX_CONFIG` timeout. Use `neo4j.int()` for LIMIT values. Follow the existing pattern in `queries.ts`.

- [ ] **Step 1: Add `getShowcaseData` to queries.ts**

Add to the end of `webapp/src/lib/graph/queries.ts`:

```typescript
// ---------------------------------------------------------------------------
// Showcase — curated relationships + hub nodes
// ---------------------------------------------------------------------------

/** A single relationship example for showcase display */
export interface ShowcaseEdge {
  readonly sourceName: string
  readonly sourceLabel: string
  readonly targetName: string
  readonly targetLabel: string
  readonly relType: string
}

/** Hub node for showcase display */
export interface ShowcaseHub {
  readonly name: string
  readonly label: string
  readonly degree: number
}

/** Combined showcase data */
export interface ShowcaseData {
  readonly edges: readonly ShowcaseEdge[]
  readonly hubs: readonly ShowcaseHub[]
}

/** Curated relationship types to showcase (most compelling) */
const SHOWCASE_REL_TYPES = ['FLEW_WITH', 'FINANCED', 'ASSOCIATED_WITH', 'OWNED', 'MENTIONED_IN']

/**
 * Fetch showcase data: curated compelling edges + top hub nodes.
 *
 * - Edges: 2 examples per curated relationship type (up to 10 total)
 * - Hubs: top 5 nodes by degree centrality
 *
 * Throws on Neo4j errors (let the route handle them).
 */
export async function getShowcaseData(): Promise<ShowcaseData> {
  const session = getDriver().session()

  try {
    // Query 1: Curated compelling edges — 2 per relationship type
    const edgeResult = await session.run(
      `UNWIND $relTypes AS relType
       CALL {
         WITH relType
         MATCH (a)-[r]->(b)
         WHERE type(r) = relType
           AND a.name IS NOT NULL AND b.name IS NOT NULL
         RETURN a.name AS sourceName, labels(a)[0] AS sourceLabel,
                b.name AS targetName, labels(b)[0] AS targetLabel,
                type(r) AS relType
         LIMIT 2
       }
       RETURN sourceName, sourceLabel, targetName, targetLabel, relType`,
      { relTypes: SHOWCASE_REL_TYPES },
      TX_CONFIG,
    )

    const edges: ShowcaseEdge[] = edgeResult.records.map((r) => ({
      sourceName: r.get('sourceName') as string,
      sourceLabel: r.get('sourceLabel') as string,
      targetName: r.get('targetName') as string,
      targetLabel: r.get('targetLabel') as string,
      relType: r.get('relType') as string,
    }))

    // Query 2: Top 5 hub nodes by degree centrality
    const hubResult = await session.run(
      `MATCH (n)
       WHERE n.name IS NOT NULL
       WITH n, size([(n)-[]-() | 1]) AS degree
       ORDER BY degree DESC
       LIMIT $limit
       RETURN n.name AS name, labels(n)[0] AS label, degree`,
      { limit: neo4j.int(5) },
      TX_CONFIG,
    )

    const hubs: ShowcaseHub[] = hubResult.records.map((r) => ({
      name: r.get('name') as string,
      label: r.get('label') as string,
      degree: typeof r.get('degree') === 'number'
        ? r.get('degree') as number
        : (r.get('degree') as { toNumber(): number }).toNumber(),
    }))

    return { edges, hubs }
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 2: Re-export from index.ts**

Add to `webapp/src/lib/graph/index.ts`:

```typescript
export { getShowcaseData } from './queries'
export type { ShowcaseData, ShowcaseEdge, ShowcaseHub } from './queries'
```

- [ ] **Step 3: Commit**

```bash
git add webapp/src/lib/graph/queries.ts webapp/src/lib/graph/index.ts
git commit -m "feat: add getShowcaseData query for curated edges + hub nodes"
```

---

### Task 2: Showcase API Route

**Files:**
- Create: `webapp/src/app/api/graph/showcase/route.ts`

**Context:** Follow the pattern in `webapp/src/app/api/graph/expand/[id]/route.ts`. Import from `@/lib/graph`. Return `{ success, data, meta }` shape. Handle Neo4j connection errors with 503.

- [ ] **Step 1: Create the route**

Create `webapp/src/app/api/graph/showcase/route.ts`:

```typescript
/**
 * GET /api/graph/showcase
 *
 * Returns curated graph relationship examples and top hub nodes
 * for display in showcase components across the site.
 *
 * No parameters required. Results are lightweight (max ~15 items).
 *
 * Responses:
 *   - 200: { success: true, data: ShowcaseData }
 *   - 503: Neo4j unreachable
 */

import { getShowcaseData } from '@/lib/graph'

export async function GET(): Promise<Response> {
  try {
    const data = await getShowcaseData()

    return Response.json({
      success: true,
      data,
      meta: {
        edgeCount: data.edges.length,
        hubCount: data.hubs.length,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      const msg = error.message

      const isTimeout =
        msg.includes('transaction has been terminated') ||
        msg.includes('Transaction timed out') ||
        msg.includes('LockClient') ||
        msg.includes('TransactionTimedOut')

      if (isTimeout) {
        return Response.json({ success: false, error: 'Query timed out' }, { status: 504 })
      }

      const isConnectionError =
        msg.includes('connect') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('ServiceUnavailable') ||
        msg.includes('SessionExpired')

      if (isConnectionError) {
        return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
      }
    }
    throw error
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add webapp/src/app/api/graph/showcase/route.ts
git commit -m "feat: add GET /api/graph/showcase endpoint"
```

---

### Task 3: GraphShowcase Component

**Files:**
- Create: `webapp/src/components/graph/GraphShowcase.tsx`

**Context:** Client component that fetches `/api/graph/showcase` and renders mini SVG node-edge diagrams. Uses color constants from `@/lib/graph/constants` (`LABEL_COLORS`, `LINK_COLORS`, `LABEL_DISPLAY`). Styled with TailwindCSS matching the dark theme (zinc-900 backgrounds, zinc borders).

The component has two visual sections:
1. **Relationship examples** — horizontal pills: `[Node] ─TYPE→ [Node]` with colored dots matching label colors
2. **Hub nodes** — small cards showing name, label, and connection count

- [ ] **Step 1: Create the component**

Create `webapp/src/components/graph/GraphShowcase.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { LABEL_COLORS, LINK_COLORS, LABEL_DISPLAY, DEFAULT_NODE_COLOR, DEFAULT_LINK_COLOR } from '@/lib/graph/constants'
import type { ShowcaseData, ShowcaseEdge, ShowcaseHub } from '@/lib/graph'

/** Display-friendly relationship type labels */
const REL_TYPE_DISPLAY: Record<string, string> = {
  FLEW_WITH: 'flew with',
  FINANCED: 'financed',
  ASSOCIATED_WITH: 'associated with',
  OWNED: 'owned',
  MENTIONED_IN: 'mentioned in',
  VISITED: 'visited',
  EMPLOYED_BY: 'employed by',
  AFFILIATED_WITH: 'affiliated with',
  PARTICIPATED_IN: 'participated in',
  FILED_IN: 'filed in',
  DOCUMENTED_BY: 'documented by',
}

interface GraphShowcaseProps {
  /** Render variant: 'full' shows edges + hubs, 'compact' shows edges only */
  readonly variant?: 'full' | 'compact'
  /** Optional heading override */
  readonly heading?: string
  /** Link target for CTA */
  readonly ctaHref?: string
  /** CTA label */
  readonly ctaLabel?: string
}

export function GraphShowcase({
  variant = 'full',
  heading,
  ctaHref = '/explorar',
  ctaLabel,
}: GraphShowcaseProps) {
  const [data, setData] = useState<ShowcaseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/graph/showcase')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success) setData(json.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-500" />
      </div>
    )
  }

  if (!data || (data.edges.length === 0 && data.hubs.length === 0)) return null

  return (
    <div className="space-y-6">
      {heading && (
        <h3 className="text-lg font-bold text-zinc-100">{heading}</h3>
      )}

      {/* Relationship examples */}
      {data.edges.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {data.edges.map((edge, i) => (
            <EdgePill key={`${edge.sourceName}-${edge.relType}-${edge.targetName}-${i}`} edge={edge} />
          ))}
        </div>
      )}

      {/* Hub nodes — only in full variant */}
      {variant === 'full' && data.hubs.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {data.hubs.map((hub) => (
            <HubCard key={hub.name} hub={hub} />
          ))}
        </div>
      )}

      {/* CTA */}
      {ctaHref && ctaLabel && (
        <div className="flex justify-center pt-2">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-sm font-medium text-purple-300 transition-colors hover:border-purple-500/50 hover:bg-purple-500/15"
          >
            {ctaLabel}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}

function EdgePill({ edge }: { readonly edge: ShowcaseEdge }) {
  const sourceColor = LABEL_COLORS[edge.sourceLabel] ?? DEFAULT_NODE_COLOR
  const targetColor = LABEL_COLORS[edge.targetLabel] ?? DEFAULT_NODE_COLOR
  const relColor = LINK_COLORS[edge.relType] ?? DEFAULT_LINK_COLOR
  const relDisplay = REL_TYPE_DISPLAY[edge.relType] ?? edge.relType.toLowerCase().replace(/_/g, ' ')

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs">
      {/* Source node */}
      <span
        className="inline-block h-2 w-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: sourceColor }}
      />
      <span className="font-medium text-zinc-200 truncate max-w-[120px]">{edge.sourceName}</span>

      {/* Relationship arrow */}
      <svg className="h-3 w-16 flex-shrink-0" viewBox="0 0 64 12">
        <line x1="0" y1="6" x2="52" y2="6" stroke={relColor} strokeWidth="1.5" />
        <polygon points="52,2 60,6 52,10" fill={relColor} />
      </svg>

      {/* Relationship label */}
      <span className="flex-shrink-0 text-[10px] uppercase tracking-wider" style={{ color: relColor }}>
        {relDisplay}
      </span>

      <svg className="h-3 w-4 flex-shrink-0" viewBox="0 0 16 12">
        <line x1="0" y1="6" x2="16" y2="6" stroke={relColor} strokeWidth="1.5" />
      </svg>

      {/* Target node */}
      <span
        className="inline-block h-2 w-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: targetColor }}
      />
      <span className="font-medium text-zinc-200 truncate max-w-[120px]">{edge.targetName}</span>
    </div>
  )
}

function HubCard({ hub }: { readonly hub: ShowcaseHub }) {
  const color = LABEL_COLORS[hub.label] ?? DEFAULT_NODE_COLOR
  const displayLabel = LABEL_DISPLAY[hub.label] ?? hub.label

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-zinc-200 truncate">{hub.name}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
        <span>{displayLabel}</span>
        <span className="tabular-nums">{hub.degree} connections</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add webapp/src/components/graph/GraphShowcase.tsx
git commit -m "feat: add GraphShowcase component with edge pills + hub cards"
```

---

### Task 4: Place on Landing Page (between Hero and Investigation Cards)

**Files:**
- Modify: `webapp/src/app/page.tsx`

**Context:** The landing page currently renders `<Hero />` then investigation cards. Insert a new `<GraphShowcase>` section between them with `variant="full"`, a heading, and a CTA to the graph explorer.

- [ ] **Step 1: Add GraphShowcase import and section**

In `webapp/src/app/page.tsx`, add import:

```typescript
import { GraphShowcase } from '@/components/graph/GraphShowcase'
```

Insert between `<Hero />` and the investigations `<section>`:

```tsx
<section className="mx-auto max-w-6xl px-4 pb-12">
  <GraphShowcase
    variant="full"
    heading="Relaciones reales del grafo"
    ctaHref="/explorar"
    ctaLabel="Explorar el grafo completo"
  />
</section>
```

- [ ] **Step 2: Commit**

```bash
git add webapp/src/app/page.tsx
git commit -m "feat: add graph showcase section to landing page"
```

---

### Task 5: Enhance FeatureShowcase Graph Card

**Files:**
- Modify: `webapp/src/components/landing/FeatureShowcase.tsx`

**Context:** Currently renders 6 equal-sized icon+text cards in a 3-column grid. The "graph" card should be expanded to span full width at the top with a `<GraphShowcase variant="compact" />` embedded inside it. The remaining 5 cards stay in the grid below.

- [ ] **Step 1: Split graph card out and embed GraphShowcase**

Rewrite `webapp/src/components/landing/FeatureShowcase.tsx`:

```tsx
import { createTranslator } from '@/i18n/messages'

import { GraphShowcase } from '@/components/graph/GraphShowcase'

const OTHER_FEATURE_KEYS = ['timeline', 'evidence', 'community', 'network', 'money'] as const

const FEATURE_ICONS: Record<string, string> = {
  graph: 'M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z',
  timeline: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3',
  evidence:
    'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
  community:
    'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z',
  network:
    'M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z',
  money:
    'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
}

export function FeatureShowcase() {
  const t = createTranslator('features')

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-8 text-xl font-bold text-zinc-50 sm:text-2xl">{t('title')}</h2>

      {/* Graph card — full width with live examples */}
      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="mb-4 flex items-center gap-3">
          <svg
            className="h-6 w-6 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={FEATURE_ICONS.graph} />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">{t('graph.title')}</h3>
            <p className="text-xs leading-relaxed text-zinc-400">{t('graph.description')}</p>
          </div>
        </div>
        <GraphShowcase variant="compact" />
      </div>

      {/* Remaining feature cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OTHER_FEATURE_KEYS.map((key) => (
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

- [ ] **Step 2: Commit**

```bash
git add webapp/src/components/landing/FeatureShowcase.tsx
git commit -m "feat: expand graph feature card with live relationship examples"
```

---

### Task 6: Add to Epstein Inicio Page

**Files:**
- Modify: `webapp/src/app/caso/[slug]/OverviewContent.tsx`

**Context:** The OverviewContent component is a `'use client'` component with bilingual support (`lang` state). Add a `<GraphShowcase>` section between the Key Stats and the Primary CTAs, with the heading and CTA label adapting to the current language.

- [ ] **Step 1: Add GraphShowcase to OverviewContent**

In `webapp/src/app/caso/[slug]/OverviewContent.tsx`:

Add import:
```typescript
import { GraphShowcase } from '@/components/graph/GraphShowcase'
```

Add bilingual strings to the `t` object:
```typescript
  showcaseHeading: {
    en: 'Live graph relationships',
    es: 'Relaciones del grafo en vivo',
  },
  showcaseCta: {
    en: 'Explore the full network',
    es: 'Explorar la red completa',
  },
```

Insert between the `{/* Key Stats */}` div and the `{/* Primary CTAs */}` section:

```tsx
      {/* Graph Showcase */}
      <section className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <GraphShowcase
          variant="full"
          heading={t.showcaseHeading[lang]}
          ctaHref={`${basePath}/grafo`}
          ctaLabel={t.showcaseCta[lang]}
        />
      </section>
```

- [ ] **Step 2: Commit**

```bash
git add webapp/src/app/caso/\\[slug\\]/OverviewContent.tsx
git commit -m "feat: add graph showcase to Epstein inicio page"
```

---

### Task 7: Verify and Final Commit

- [ ] **Step 1: Run dev server and verify**

```bash
cd webapp && pnpm run dev
```

Check three locations:
1. `http://localhost:3000` — graph showcase section between hero and investigation cards
2. `http://localhost:3000` — scroll to feature showcase, graph card should be full-width with live edges
3. `http://localhost:3000/caso/caso-epstein` — graph showcase between stats and CTAs

- [ ] **Step 2: Fix any TypeScript errors**

```bash
cd webapp && npx tsc --noEmit
```

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve any type errors in graph showcase"
```

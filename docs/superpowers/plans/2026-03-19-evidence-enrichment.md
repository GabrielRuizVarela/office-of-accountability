# Evidence Page Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the evidence page from 10 thin document stubs to ~45 rich documents with real URLs, key findings, dates, graph connections, search, and filtering.

**Architecture:** Expand the `EpsteinDocument` schema with new fields (date, key_findings, excerpt, page_count). Seed ~45 documents with verified public URLs. Rebuild the detail page to surface Neo4j graph relationships. Add a client-side search/filter component to the listing page.

**Tech Stack:** Next.js 16, React 19, Neo4j (via neo4j-driver-lite), TypeScript, Tailwind CSS 4, Zod 4

**Spec:** `docs/superpowers/specs/2026-03-19-evidence-enrichment-design.md`

**Important codebase notes:**
- There are TWO `toDocument`/`toDocumentProps` helpers: one in `src/lib/caso-epstein/transform.ts` (exported but currently has zero consumers — dead code, update for consistency) and one in `src/lib/caso-epstein/queries.ts` (actively used). Both must be updated.
- `investigation-data.ts` contains `EVIDENCE_DOCS` with 11 documents that have real URLs, dates, and bilingual data — use these as a reference for seed data.
- No test framework is configured. Validation is via `pnpm typecheck` (tsc --noEmit) and `pnpm lint`.
- The project uses `pnpm` as its package manager.
- `TYPE_LABELS` is duplicated in 3 files — consolidate as part of the cleanup.

---

### Task 1: Expand EpsteinDocument Schema

**Files:**
- Modify: `webapp/src/lib/caso-epstein/types.ts`

- [ ] **Step 1: Add new fields to EpsteinDocument interface**

Add `date`, `key_findings`, `excerpt`, and `page_count` fields:

```typescript
export interface EpsteinDocument {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly doc_type: DocumentType
  readonly source_url: string
  readonly summary: string
  readonly date: string
  readonly key_findings: string[]
  readonly excerpt: string
  readonly page_count: number | null
}
```

- [ ] **Step 2: Add TYPE_LABELS constant to types.ts**

Extract the shared `TYPE_LABELS` map that's currently duplicated in 3 files:

```typescript
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  court_filing: 'Court Filing',
  deposition: 'Deposition',
  fbi: 'FBI Record',
  flight_log: 'Flight Log',
  police_report: 'Police Report',
  financial: 'Financial Record',
  media_investigation: 'Investigative Journalism',
  medical: 'Medical Record',
}
```

Also add plural labels for the listing page:

```typescript
export const DOCUMENT_TYPE_LABELS_PLURAL: Record<DocumentType, string> = {
  court_filing: 'Court Filings',
  deposition: 'Depositions',
  fbi: 'FBI Records',
  flight_log: 'Flight Logs',
  police_report: 'Police Reports',
  financial: 'Financial Records',
  media_investigation: 'Investigative Journalism',
  medical: 'Medical Records',
}
```

- [ ] **Step 3: Update Zod documentSchema**

```typescript
export const documentSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200),
  doc_type: z.enum([
    'court_filing',
    'deposition',
    'fbi',
    'flight_log',
    'police_report',
    'financial',
    'media_investigation',
    'medical',
  ]),
  source_url: z.string().max(2000),
  summary: z.string().max(5000),
  date: z.string().min(1).max(30),
  key_findings: z.array(z.string().max(1000)),
  excerpt: z.string().max(5000),
  page_count: z.number().int().positive().nullable(),
})
```

- [ ] **Step 4: Add EpsteinDocumentWithCount type**

```typescript
export interface EpsteinDocumentWithCount extends EpsteinDocument {
  readonly mentionedPersonCount: number
}
```

- [ ] **Step 5: Export new constants and type from index.ts**

Add `DOCUMENT_TYPE_LABELS`, `DOCUMENT_TYPE_LABELS_PLURAL`, and `EpsteinDocumentWithCount` to `webapp/src/lib/caso-epstein/index.ts`.

- [ ] **Step 6: Run typecheck**

Run: `cd webapp && pnpm typecheck`
Expected: Type errors in `transform.ts` and `queries.ts` (their `toDocument`/`toDocumentProps` return types are missing the new required fields). `DocumentCard.tsx` will NOT error since it uses inline prop types, not `EpsteinDocument`. Note errors for Task 2.

- [ ] **Step 7: Commit**

```bash
git add webapp/src/lib/caso-epstein/types.ts webapp/src/lib/caso-epstein/index.ts
git commit -m "feat: expand EpsteinDocument schema with date, key_findings, excerpt, page_count"
```

---

### Task 2: Update Transform and Query Helpers

**Files:**
- Modify: `webapp/src/lib/caso-epstein/transform.ts`
- Modify: `webapp/src/lib/caso-epstein/queries.ts`

- [ ] **Step 1: Update `toDocument` in transform.ts**

Add extraction of new fields. For `key_findings`, Neo4j returns a native array. Add a helper for array extraction:

```typescript
/** Safely extract a string array property from a Neo4j node */
function strArray(props: Record<string, unknown>, key: string): string[] {
  const v = props[key]
  return Array.isArray(v) ? v.filter((item): item is string => typeof item === 'string') : []
}

/** Safely extract a nullable number property */
function numOrNull(props: Record<string, unknown>, key: string): number | null {
  const v = props[key]
  if (typeof v === 'number') return v
  // Neo4j integers come as { low, high } objects
  if (v && typeof v === 'object' && 'low' in v) return (v as { low: number }).low
  return null
}
```

Then update `toDocument`:

```typescript
export function toDocument(node: Node): EpsteinDocument {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    title: str(p, 'title'),
    slug: str(p, 'slug'),
    doc_type: str(p, 'doc_type') as EpsteinDocument['doc_type'],
    source_url: str(p, 'source_url'),
    summary: str(p, 'summary'),
    date: str(p, 'date'),
    key_findings: strArray(p, 'key_findings'),
    excerpt: str(p, 'excerpt'),
    page_count: numOrNull(p, 'page_count'),
  }
}
```

- [ ] **Step 2: Update `toDocumentProps` in queries.ts**

Same changes as transform.ts — add the new fields. Also add the `strArray` and `numOrNull` helpers to queries.ts (or refactor to import from transform.ts if preferred — follow existing pattern which duplicates them).

```typescript
function toDocumentProps(node: Node): EpsteinDocument {
  const p = node.properties as Record<string, unknown>
  return {
    id: typeof p.id === 'string' ? p.id : '',
    title: typeof p.title === 'string' ? p.title : '',
    slug: typeof p.slug === 'string' ? p.slug : '',
    doc_type: typeof p.doc_type === 'string' ? p.doc_type : 'court_filing',
    source_url: typeof p.source_url === 'string' ? p.source_url : '',
    summary: typeof p.summary === 'string' ? p.summary : '',
    date: typeof p.date === 'string' ? p.date : '',
    key_findings: Array.isArray(p.key_findings)
      ? p.key_findings.filter((item: unknown): item is string => typeof item === 'string')
      : [],
    excerpt: typeof p.excerpt === 'string' ? p.excerpt : '',
    page_count: typeof p.page_count === 'number'
      ? p.page_count
      : p.page_count && typeof p.page_count === 'object' && 'low' in p.page_count
        ? (p.page_count as { low: number }).low
        : null,
  } as EpsteinDocument
}
```

- [ ] **Step 3: Add `getDocumentBySlug` query to queries.ts**

```typescript
export interface DocumentDetail {
  document: EpsteinDocument
  mentionedPersons: EpsteinPerson[]
  legalCases: EpsteinLegalCase[]
  relatedEvents: EpsteinEvent[]
  relatedDocuments: EpsteinDocument[]
}

export async function getDocumentBySlug(
  casoSlug: string,
  slug: string,
): Promise<DocumentDetail | null> {
  const session = getDriver().session()

  try {
    // 1. Get the document
    const docResult = await session.run(
      `MATCH (d:Document {slug: $slug, caso_slug: $casoSlug})
       RETURN d
       LIMIT 1`,
      { slug, casoSlug },
      TX_CONFIG,
    )

    if (docResult.records.length === 0) return null

    const docNode = docResult.records[0].get('d') as Node
    const document = toDocumentProps(docNode)

    // 2. Get mentioned persons
    const personsResult = await session.run(
      `MATCH (p:Person)-[:MENTIONED_IN]->(d:Document {slug: $slug, caso_slug: $casoSlug})
       RETURN p
       ORDER BY p.name ASC`,
      { slug, casoSlug },
      TX_CONFIG,
    )
    const mentionedPersons = personsResult.records.map(
      (r: Neo4jRecord) => toPersonProps(r.get('p') as Node),
    )

    // 3. Get legal cases
    const casesResult = await session.run(
      `MATCH (d:Document {slug: $slug, caso_slug: $casoSlug})-[:FILED_IN]->(lc:LegalCase)
       RETURN lc
       ORDER BY lc.date_filed ASC`,
      { slug, casoSlug },
      TX_CONFIG,
    )
    const legalCases = casesResult.records.map(
      (r: Neo4jRecord) => toLegalCaseProps(r.get('lc') as Node),
    )

    // 4. Get related events
    const eventsResult = await session.run(
      `MATCH (e:Event)-[:DOCUMENTED_BY]->(d:Document {slug: $slug, caso_slug: $casoSlug})
       RETURN e
       ORDER BY e.date ASC`,
      { slug, casoSlug },
      TX_CONFIG,
    )
    const relatedEvents = eventsResult.records.map(
      (r: Neo4jRecord) => toEventProps(r.get('e') as Node),
    )

    // 5. Get cross-referenced documents (share at least one person)
    const crossRefResult = await session.run(
      `MATCH (p:Person)-[:MENTIONED_IN]->(d:Document {slug: $slug, caso_slug: $casoSlug})
       WITH collect(p) AS persons
       UNWIND persons AS person
       MATCH (person)-[:MENTIONED_IN]->(other:Document {caso_slug: $casoSlug})
       WHERE other.slug <> $slug
       RETURN DISTINCT other
       ORDER BY other.title ASC
       LIMIT 10`,
      { slug, casoSlug },
      TX_CONFIG,
    )
    const relatedDocuments = crossRefResult.records.map(
      (r: Neo4jRecord) => toDocumentProps(r.get('other') as Node),
    )

    return { document, mentionedPersons, legalCases, relatedEvents, relatedDocuments }
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 4: Update `getDocuments` to return `EpsteinDocumentWithCount`**

```typescript
import type { EpsteinDocumentWithCount } from './types'

export async function getDocuments(casoSlug: string): Promise<EpsteinDocumentWithCount[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (d:Document)
       WHERE d.caso_slug = $casoSlug
       OPTIONAL MATCH (p:Person)-[:MENTIONED_IN]->(d)
       RETURN d, count(p) AS personCount
       ORDER BY d.title ASC`,
      { casoSlug },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => ({
      ...toDocumentProps(record.get('d') as Node),
      mentionedPersonCount: (record.get('personCount') as { low: number }).low ?? 0,
    }))
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 5: Export `getDocumentBySlug` and `DocumentDetail` from index.ts**

Add to `webapp/src/lib/caso-epstein/index.ts`:

```typescript
export { getDocumentBySlug } from './queries'
export type { DocumentDetail } from './queries'
```

- [ ] **Step 6: Run typecheck**

Run: `cd webapp && pnpm typecheck`
Expected: Remaining errors only in UI files (DocumentCard, evidence pages) — not in queries/transform.

- [ ] **Step 7: Commit**

```bash
git add webapp/src/lib/caso-epstein/transform.ts webapp/src/lib/caso-epstein/queries.ts webapp/src/lib/caso-epstein/index.ts
git commit -m "feat: update document helpers, add getDocumentBySlug query with graph connections"
```

---

### Task 3: Expand Seed Data to ~45 Documents

**Files:**
- Modify: `webapp/scripts/seed-caso-epstein.ts`

**Reference:** Use `webapp/src/lib/caso-epstein/investigation-data.ts` for verified URLs and content — the `EVIDENCE_DOCS` array has 11 documents with real URLs that overlap with and extend the current seed data.

- [ ] **Step 1: Update existing 10 documents with new fields**

Add `date`, `key_findings`, `excerpt`, and `page_count` to each of the 10 existing document entries. Example for the first document:

```typescript
{
  id: 'ep-doc-maxwell-transcripts',
  title: 'Maxwell Trial Transcripts',
  slug: 'maxwell-trial-transcripts',
  doc_type: 'court_filing',
  source_url: 'https://www.courtlistener.com/docket/17318513/united-states-v-maxwell/',
  summary: 'Complete trial transcripts from USA v. Maxwell (20-cr-330) in the Southern District of New York, including witness testimony and evidence presentations.',
  date: '2021-12-29',
  key_findings: [
    'Jury convicted Maxwell on 5 of 6 counts including sex trafficking of a minor',
    'Four accusers testified about recruitment and abuse spanning 1994-2004',
    'Established factual foundation for all subsequent civil litigation',
    'Evidence showed Maxwell was not merely an accomplice but an active recruiter',
  ],
  excerpt: 'The evidence at trial established that the defendant and Epstein were partners in crime.',
  page_count: null,
},
```

Update all 10 documents similarly. Fix empty `source_url` fields with real verified URLs sourced from CourtListener, FBI Vault, DOJ, and news outlets. Cross-reference URLs from `investigation-data.ts` `EVIDENCE_DOCS`.

- [ ] **Step 2: Add ~35 new documents**

Add new document entries across all 8 categories to reach ~45 total. Each entry needs all fields including the new ones. Target distribution per the spec.

Key new documents to add (complete list with full data):

**Court Filings (add ~7):**
- SDNY federal indictment (2019-07-08)
- Maxwell superseding indictment (2020-07-02)
- Giuffre v. Prince Andrew complaint (2021-08-09)
- CVRA challenge to NPA — Doe v. United States (2008)
- Unsealed 2024 Giuffre v. Maxwell documents (2024-01-03)
- Jane Doe 1 v. JPMorgan Chase complaint (2022-11-24)
- Jane Doe v. Deutsche Bank complaint (2022-11-24)

**Depositions (add ~5):**
- Maxwell 2016 deposition (2016-04)
- Giuffre deposition (2016)
- Juan Alessi testimony — Maxwell trial (2021-12)
- Larry Visoski testimony — Maxwell trial (2021-11-30)
- Alfredo Rodriguez address book testimony (2009)

**FBI Records (add ~3):**
- FBI 302 interview reports (2019)
- FBI evidence collection report — NYC townhouse (2019-07)
- FBI Epstein case overview — Vault release (2019)

**Flight Logs (add ~3):**
- Boeing 727 N908JE flight logs 1995-2005
- Gulfstream flight records 2001-2005
- DOJ Phase 1 flight log release (2025-12-19)

**Police Reports (add ~3):**
- Palm Beach PD probable cause affidavit (2006)
- Palm Beach PD supplemental investigation report (2005-2006)
- Palm Beach PD victim interview summaries (2005)

**Financial Records (add ~5):**
- JPMorgan suspicious activity reports (2010-2013)
- Deutsche Bank compliance assessment (2013-2018)
- Wexner power of attorney documents (1991)
- Leon Black payment records — Senate Finance (2025-03-15)
- FCA Jes Staley enforcement notice (2025-06-15)

**Investigative Journalism (add ~6):**
- Vanity Fair "The Talented Mr. Epstein" (2003-03)
- NY Times Epstein investigation (2019-07)
- Netflix "Jeffrey Epstein: Filthy Rich" source docs (2020-05)
- Julie K. Brown "Perversion of Justice" book (2021-07)
- Giuffre memoir "Nobody's Girl" (2025-10-21)
- DOJ Phase 2 investigative reporting compilation (2026-01-30)

**Medical Records (add ~3):**
- Dr. Michael Baden independent autopsy review (2019-10)
- MCC medical intake and suicide watch records (2019-07)
- First suicide attempt incident report (2019-07-23)

For each document, provide verified `source_url` values. Use CourtListener for court filings (e.g., `https://www.courtlistener.com/docket/NNNNN/...`), FBI Vault for FBI records, DOJ for government releases, publisher sites for books, and news outlet URLs for journalism.

- [ ] **Step 3: Update seedDocuments function for new fields**

Update the Cypher MERGE SET clause:

```typescript
async function seedDocuments(): Promise<void> {
  console.log(`\nSeeding ${documents.length} documents...`)
  for (const doc of documents) {
    await executeWrite(
      `MERGE (d:Document {id: $id})
       SET d.title = $title,
           d.slug = $slug,
           d.doc_type = $doc_type,
           d.source_url = $source_url,
           d.summary = $summary,
           d.date = $date,
           d.key_findings = $key_findings,
           d.excerpt = $excerpt,
           d.page_count = $page_count,
           d.caso_slug = $casoSlug`,
      { ...doc, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${doc.title}`)
  }
}
```

- [ ] **Step 4: Add new MENTIONED_IN relationships**

Add entries to the `mentionedIn` array connecting persons to the new documents. Each new document should have at least one person mentioned. Reference the existing pattern.

- [ ] **Step 5: Add new FILED_IN relationships**

Connect new court filings and depositions to the appropriate `legalCases` entries.

- [ ] **Step 6: Add new DOCUMENTED_BY relationships**

Connect events to new documents where applicable (e.g., the 2019 arrest event documented by the SDNY indictment).

- [ ] **Step 7: Run typecheck**

Run: `cd webapp && pnpm typecheck`
Expected: PASS for the seed script. UI files may still have errors.

- [ ] **Step 8: Commit**

```bash
git add webapp/scripts/seed-caso-epstein.ts
git commit -m "feat: expand seed data to ~45 documents with real URLs, dates, key findings"
```

---

### Task 4: Rebuild Document Detail Page

**Files:**
- Modify: `webapp/src/app/caso/[slug]/evidencia/[docSlug]/page.tsx`

- [ ] **Step 1: Rewrite the detail page**

Replace the current stub page with a rich detail page that uses `getDocumentBySlug`:

```typescript
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CASO_EPSTEIN_SLUG, DOCUMENT_TYPE_LABELS } from '../../../../../lib/caso-epstein/types'
import { getDocumentBySlug } from '../../../../../lib/caso-epstein/queries'
import { DocumentCard } from '../../../../../components/investigation/DocumentCard'

interface PageProps {
  readonly params: Promise<{ slug: string; docSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { docSlug } = await params
  const result = await getDocumentBySlug(CASO_EPSTEIN_SLUG, docSlug)
  if (!result) return { title: 'Document Not Found' }

  return {
    title: result.document.title,
    description: result.document.summary,
  }
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { slug, docSlug } = await params
  const result = await getDocumentBySlug(CASO_EPSTEIN_SLUG, docSlug)

  if (!result) return notFound()

  const { document: doc, mentionedPersons, legalCases, relatedEvents, relatedDocuments } = result

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
        <Link href={`/caso/${slug}`} className="hover:text-zinc-300">Investigation</Link>
        <span>/</span>
        <Link href={`/caso/${slug}/evidencia`} className="hover:text-zinc-300">Evidence</Link>
        <span>/</span>
        <span className="text-zinc-300">{doc.title}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
            {DOCUMENT_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
          </span>
          {doc.date && (
            <span className="text-xs text-zinc-500">{doc.date}</span>
          )}
          {doc.page_count && (
            <span className="text-xs text-zinc-500">{doc.page_count} pages</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-zinc-50">{doc.title}</h1>
      </div>

      {/* Summary */}
      <p className="mb-6 text-sm leading-relaxed text-zinc-400">{doc.summary}</p>

      {/* Key Findings */}
      {doc.key_findings.length > 0 && (
        <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">Key Findings</h2>
          <ul className="space-y-2">
            {doc.key_findings.map((finding, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Excerpt */}
      {doc.excerpt && (
        <blockquote className="mb-6 border-l-2 border-zinc-700 pl-4 text-sm italic text-zinc-500">
          "{doc.excerpt}"
        </blockquote>
      )}

      {/* Graph connections */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {/* People Mentioned */}
        {mentionedPersons.length > 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-300">People Mentioned</h2>
            <div className="flex flex-wrap gap-2">
              {mentionedPersons.map((person) => (
                <Link
                  key={person.id}
                  href={`/caso/${slug}/grafo?highlight=${person.slug}`}
                  className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400 hover:bg-blue-500/20"
                >
                  {person.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filed In */}
        {legalCases.length > 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <h2 className="mb-3 text-sm font-semibold text-zinc-300">Filed In</h2>
            <div className="space-y-2">
              {legalCases.map((lc) => (
                <div key={lc.id} className="text-sm">
                  <div className="font-medium text-zinc-300">{lc.title}</div>
                  <div className="text-xs text-zinc-500">{lc.court} — {lc.case_number}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">Related Events</h2>
          <div className="space-y-2">
            {relatedEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 text-xs text-zinc-500">{event.date}</span>
                <span className="text-zinc-400">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Documents */}
      {relatedDocuments.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">Related Documents</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedDocuments.map((relDoc) => (
              <DocumentCard
                key={relDoc.id}
                title={relDoc.title}
                slug={relDoc.slug}
                docType={relDoc.doc_type}
                summary={relDoc.summary}
                date={relDoc.date}
                mentionedPersonCount={0}
                casoSlug={slug}
              />
            ))}
          </div>
        </div>
      )}

      {/* Source link */}
      {doc.source_url && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <a
            href={doc.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"
          >
            View original source →
          </a>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit (typecheck deferred — depends on Task 5 for DocumentCard props)**

```bash
git add webapp/src/app/caso/[slug]/evidencia/[docSlug]/page.tsx
git commit -m "feat: rebuild document detail page with graph connections and key findings"
```

---

### Task 5: Update DocumentCard Component (do this immediately after Task 4)

**Files:**
- Modify: `webapp/src/components/investigation/DocumentCard.tsx`

- [ ] **Step 1: Update DocumentCard props and rendering**

Replace the current component. Remove unused `sourceUrl` prop. Add `date` and `mentionedPersonCount`. Use shared `DOCUMENT_TYPE_LABELS`:

```typescript
import Link from 'next/link'
import { DOCUMENT_TYPE_LABELS } from '../../lib/caso-epstein/types'

interface DocumentCardProps {
  readonly title: string
  readonly slug: string
  readonly docType: string
  readonly summary: string
  readonly date: string
  readonly mentionedPersonCount: number
  readonly casoSlug: string
}

export function DocumentCard({
  title,
  slug,
  docType,
  summary,
  date,
  mentionedPersonCount,
  casoSlug,
}: DocumentCardProps) {
  return (
    <Link
      href={`/caso/${casoSlug}/evidencia/${slug}`}
      className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
          {DOCUMENT_TYPE_LABELS[docType as keyof typeof DOCUMENT_TYPE_LABELS] ?? docType}
        </span>
        {date && (
          <span className="text-[10px] text-zinc-500">{date}</span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400">
        {title}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-500">
        {summary}
      </p>
      {mentionedPersonCount > 0 && (
        <p className="mt-2 text-[10px] text-zinc-600">
          {mentionedPersonCount} {mentionedPersonCount === 1 ? 'person' : 'persons'} mentioned
        </p>
      )}
    </Link>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `cd webapp && pnpm typecheck`
Expected: Errors in the listing page (evidencia/page.tsx) because it still passes old props. Fixed in next task.

- [ ] **Step 3: Commit**

```bash
git add webapp/src/components/investigation/DocumentCard.tsx
git commit -m "feat: update DocumentCard with date, person count, shared type labels"
```

---

### Task 6: Build EvidenceExplorer and Update Listing Page

**Files:**
- Create: `webapp/src/components/investigation/EvidenceExplorer.tsx`
- Modify: `webapp/src/app/caso/[slug]/evidencia/page.tsx`

- [ ] **Step 1: Create EvidenceExplorer client component**

```typescript
'use client'

import { useState, useMemo } from 'react'
import { DocumentCard } from './DocumentCard'
import { DOCUMENT_TYPE_LABELS_PLURAL } from '../../lib/caso-epstein/types'
import type { EpsteinDocumentWithCount, DocumentType } from '../../lib/caso-epstein/types'

interface EvidenceExplorerProps {
  readonly documents: EpsteinDocumentWithCount[]
  readonly casoSlug: string
}

export function EvidenceExplorer({ documents, casoSlug }: EvidenceExplorerProps) {
  const [search, setSearch] = useState('')
  const [activeTypes, setActiveTypes] = useState<Set<DocumentType>>(new Set())

  const isFiltering = search.length > 0 || activeTypes.size > 0

  // Count per type
  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const doc of documents) {
      counts.set(doc.doc_type, (counts.get(doc.doc_type) ?? 0) + 1)
    }
    return counts
  }, [documents])

  // Filtered documents
  const filtered = useMemo(() => {
    let result = documents

    if (activeTypes.size > 0) {
      result = result.filter((d) => activeTypes.has(d.doc_type))
    }

    if (search.length > 0) {
      const q = search.toLowerCase()
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.summary.toLowerCase().includes(q) ||
          d.key_findings.some((f) => f.toLowerCase().includes(q)),
      )
    }

    return result
  }, [documents, search, activeTypes])

  // Grouped for category view
  const grouped = useMemo(() => {
    const groups = new Map<string, EpsteinDocumentWithCount[]>()
    for (const doc of filtered) {
      const group = groups.get(doc.doc_type) ?? []
      group.push(doc)
      groups.set(doc.doc_type, group)
    }
    return groups
  }, [filtered])

  // Flat sorted by date for search view
  const sortedFlat = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered],
  )

  function toggleType(type: DocumentType) {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  return (
    <div>
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
      </div>

      {/* Type filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[...typeCounts.entries()].map(([type, count]) => (
          <button
            key={type}
            onClick={() => toggleType(type as DocumentType)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              activeTypes.has(type as DocumentType)
                ? 'bg-red-500/20 text-red-400'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {DOCUMENT_TYPE_LABELS_PLURAL[type as DocumentType] ?? type} ({count})
          </button>
        ))}
      </div>

      {/* Results count when filtering */}
      {isFiltering && (
        <p className="mb-4 text-xs text-zinc-500">
          {filtered.length} {filtered.length === 1 ? 'document' : 'documents'} found
          {search && (
            <button
              onClick={() => { setSearch(''); setActiveTypes(new Set()) }}
              className="ml-2 text-blue-400 hover:text-blue-300"
            >
              Clear filters
            </button>
          )}
        </p>
      )}

      {/* Category view (default) or flat view (when filtering) */}
      {isFiltering ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedFlat.map((doc) => (
            <DocumentCard
              key={doc.id}
              title={doc.title}
              slug={doc.slug}
              docType={doc.doc_type}
              summary={doc.summary}
              date={doc.date}
              mentionedPersonCount={doc.mentionedPersonCount}
              casoSlug={casoSlug}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {[...grouped.entries()].map(([docType, docs]) => (
            <div key={docType}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                {DOCUMENT_TYPE_LABELS_PLURAL[docType as DocumentType] ?? docType} ({docs.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {docs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    title={doc.title}
                    slug={doc.slug}
                    docType={doc.doc_type}
                    summary={doc.summary}
                    date={doc.date}
                    mentionedPersonCount={doc.mentionedPersonCount}
                    casoSlug={casoSlug}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update the listing page to use EvidenceExplorer**

Replace `webapp/src/app/caso/[slug]/evidencia/page.tsx`:

```typescript
import type { Metadata } from 'next'

import { EvidenceExplorer } from '../../../../components/investigation/EvidenceExplorer'
import { CASO_EPSTEIN_SLUG } from '../../../../lib/caso-epstein/types'
import { getDocuments } from '../../../../lib/caso-epstein/queries'

interface PageProps {
  readonly params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Evidence',
  description:
    'Court filings, depositions, flight logs, and investigative reports from the Epstein investigation.',
}

export default async function EvidenciaPage({ params }: PageProps) {
  const { slug } = await params
  const documents = await getDocuments(CASO_EPSTEIN_SLUG)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-50">Evidence</h1>
      <p className="mb-8 text-sm text-zinc-400">
        {documents.length} documents from court filings, government records, and verified
        investigative reporting.
      </p>

      <EvidenceExplorer documents={documents} casoSlug={slug} />
    </div>
  )
}
```

- [ ] **Step 3: Run typecheck**

Run: `cd webapp && pnpm typecheck`
Expected: PASS — all files should now type-check cleanly.

- [ ] **Step 4: Run lint**

Run: `cd webapp && pnpm lint`
Expected: PASS or only pre-existing warnings.

- [ ] **Step 5: Commit**

```bash
git add webapp/src/components/investigation/EvidenceExplorer.tsx webapp/src/app/caso/[slug]/evidencia/page.tsx
git commit -m "feat: add EvidenceExplorer with search, filtering, and hybrid category/flat view"
```

---

### Task 7: Seed Database and Verify

**Files:** None (runtime verification)

- [ ] **Step 1: Run the seed script**

Run: `cd webapp && pnpm tsx scripts/seed-caso-epstein.ts`
Expected: Successful seeding of all ~45 documents plus new relationships. Output shows checkmarks for each entity.

- [ ] **Step 2: Verify document count**

Run a quick Cypher check (using the Neo4j driver or browser):
```
MATCH (d:Document {caso_slug: 'caso-epstein'}) RETURN count(d)
```
Expected: ~45 documents.

- [ ] **Step 3: Verify relationships**

```
MATCH (p:Person)-[:MENTIONED_IN]->(d:Document {caso_slug: 'caso-epstein'}) RETURN count(*)
```
Expected: Significantly more than the original 16 MENTIONED_IN relationships.

- [ ] **Step 4: Start dev server and test**

Run: `cd webapp && pnpm dev:next`

Manual checks:
1. Navigate to `/caso/caso-epstein/evidencia` — verify ~45 documents visible, grouped by type
2. Type in search bar — verify it filters and switches to flat view
3. Click type filter chips — verify filtering works
4. Click a document card — verify rich detail page with key findings, excerpt, people mentioned, filed-in cases, related events, related documents
5. Click "View original source" — verify real URL opens
6. Click a person chip — verify it links to the graph page

- [ ] **Step 5: Commit any fixes**

If any issues found, fix and commit:
```bash
git add -A
git commit -m "fix: evidence page polish from manual testing"
```

---

### Task 8: Final Cleanup

**Files:**
- Modify: Any files still referencing old `TYPE_LABELS` or old `sourceUrl` prop

- [ ] **Step 1: Remove old TYPE_LABELS from page files**

Remove the inline `typeLabels`/`TYPE_LABELS` maps from:
- `webapp/src/app/caso/[slug]/evidencia/page.tsx` (already replaced in Task 6)
- `webapp/src/app/caso/[slug]/evidencia/[docSlug]/page.tsx` (already replaced in Task 4)
- Verify `DocumentCard.tsx` uses the shared constant (done in Task 5)

- [ ] **Step 2: Run full verification**

```bash
cd webapp && pnpm typecheck && pnpm lint
```
Expected: All pass.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: clean up duplicate TYPE_LABELS, remove dead sourceUrl prop"
```

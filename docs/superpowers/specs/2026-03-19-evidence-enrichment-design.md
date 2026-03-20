# Evidence Page Enrichment

## Problem

The evidence page has 10 thin documents spread across 8 categories. Most documents lack source URLs, dates, key findings, and excerpts. The detail page is a dead end — it shows only a title, summary, and a broken source link. The graph already has `MENTIONED_IN`, `FILED_IN`, and `DOCUMENTED_BY` relationships that the UI ignores.

## Approach

Parallel schema + UI: expand the document data model, seed ~45 real documents with verified URLs, build a rich detail page pulling graph connections, and add search/filtering to the listing page.

## 1. Schema Changes

Expand `EpsteinDocument` in `src/lib/caso-epstein/types.ts`:

```typescript
export interface EpsteinDocument {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly doc_type: DocumentType
  readonly source_url: string
  readonly summary: string
  readonly date: string              // "2019-07-08" or "2006" for approximate
  readonly key_findings: string[]    // 3-5 bullet points per document
  readonly excerpt: string           // representative quote or passage
  readonly page_count: number | null // null if unknown
}
```

Update the Zod `documentSchema` to include the new fields. Update `toDocumentProps` in `queries.ts` to extract them from Neo4j nodes. Neo4j stores `key_findings` as a native string array property.

Note on date sorting: partial dates like `"2006"` sort correctly against full dates like `"2006-01-15"` in lexicographic order, which is the sort strategy used in the flat filtered view.

### Files modified
- `src/lib/caso-epstein/types.ts` — interface + Zod schema
- `src/lib/caso-epstein/queries.ts` — `toDocumentProps` helper

## 2. Seed Data Expansion

Expand from 10 to ~45 documents. Target distribution:

| Category | Current | Target | Examples |
|---|---|---|---|
| Court Filings | 3 | 10 | SDNY indictment, Maxwell superseding indictment, Giuffre v. Andrew complaint, NPA challenge (CVRA), unsealed 2024 documents |
| Depositions | 1 | 6 | Maxwell deposition (2016), Giuffre deposition, Visoski testimony, Juan Alessi testimony, Alfredo Rodriguez testimony |
| FBI Records | 1 | 4 | FBI case file sections, 302 interview reports, evidence collection reports |
| Flight Logs | 1 | 4 | Separate logs by aircraft (727, Gulfstream), by time period |
| Police Reports | 1 | 4 | Palm Beach PD supplemental reports, probable cause affidavit, victim interview summaries |
| Financial Records | 1 | 6 | JPMorgan SARs, Deutsche Bank compliance docs, Wexner POA, Virgin Islands tax filings, Leon Black payments |
| Investigative Journalism | 1 | 7 | Miami Herald series, Vanity Fair (2003), NY Times investigations, Netflix doc sourcing, Julie K. Brown book |
| Medical Records | 1 | 4 | Autopsy report, Baden independent review, MCC medical logs, prior suicide attempt records |

Each document includes:
- A real, verified public URL (PACER/CourtListener, FBI Vault, DOJ, news outlets)
- A date (exact or approximate)
- 3-5 key findings as bullet points
- A representative excerpt where available
- Page count where known

New `MENTIONED_IN` relationships connect persons to new documents. New `FILED_IN` relationships connect docs to legal cases. New `DOCUMENTED_BY` relationships connect events to docs where applicable.

### Files modified
- `scripts/seed-caso-epstein.ts` — expanded documents array, new relationship entries

## 3. Rich Detail Page

Replace the stub detail page with a full evidence page that pulls graph connections.

### New query: `getDocumentBySlug(casoSlug, slug)`

Signature: `getDocumentBySlug(casoSlug: string, slug: string)` — follows the existing convention of scoping all queries by `caso_slug` to ensure data isolation between investigations.

Single Cypher query returning:
- The document node with all properties
- People mentioned (`MENTIONED_IN` relationships)
- Legal cases filed in (`FILED_IN` relationships)
- Events documented by (`DOCUMENTED_BY` relationships)
- Cross-referenced documents (other docs sharing at least one person with this doc, LIMIT 10 to keep response times predictable)

This replaces the current approach of fetching all documents and filtering client-side.

### Layout

```
Breadcrumb: Investigation / Evidence / Document Title

[Type Badge]  [Date]  [Page Count]
# Document Title

Summary paragraph

---

## Key Findings
- Bullet 1
- Bullet 2
- Bullet 3

## Excerpt
> "Blockquote with representative passage..."

---

## People Mentioned          ## Filed In
[Person chip → graph]        [Case link]

## Related Events
[Event card with date]

## Related Documents
[DocumentCard]  ← docs sharing people/cases

---

[View Original Source →]
```

Person chips link to `/caso/{slug}/grafo` filtered to that person. Related documents reuse the existing `DocumentCard` component.

### Files modified
- `src/lib/caso-epstein/queries.ts` — new `getDocumentBySlug` query
- `src/app/caso/[slug]/evidencia/[docSlug]/page.tsx` — rebuilt detail page

## 4. Hybrid Listing Page

The listing page gets a search bar and toggles between category view and filtered view.

### Behavior
- **Default:** Category-grouped view with search bar and type filter chips at top
- **Searching/filtering:** Switches to flat list sorted by date, with type badges and dates on each card
- **Clear:** Returns to category view

### Search
Client-side text search across title, summary, and key_findings. No API needed — the page already fetches all documents server-side. For `key_findings` (a `string[]`), search checks each element's text individually rather than matching on the array as a whole.

### Filter chips
Horizontal row of toggleable type badges with counts. Multiple can be active simultaneously.

### Updated DocumentCard
Add date and mentioned-person count:
```
[Type Badge]  [Date]
Document Title
Summary (3-line clamp)
[3 persons mentioned]
```

### Architecture
- `EvidenciaPage` (server component) fetches documents with a new query that includes date, key_findings, and mentioned-person count (as `EpsteinDocumentWithCount` — extends `EpsteinDocument` with a computed `mentionedPersonCount: number` to keep the core interface aligned with the Neo4j node shape)
- Passes data to new `EvidenceExplorer` client component managing search/filter state
- `EvidenceExplorer` renders either grouped view or flat filtered view

### Cleanup
- Extract the duplicated `TYPE_LABELS` map (currently in `DocumentCard.tsx`, `[docSlug]/page.tsx`, and `evidencia/page.tsx`) into a shared constant in `types.ts`
- Remove the unused `sourceUrl` prop from `DocumentCard` (it is accepted but never rendered)

### Files modified
- `src/lib/caso-epstein/queries.ts` — updated `getDocuments` query to include person counts
- `src/app/caso/[slug]/evidencia/page.tsx` — delegates to EvidenceExplorer
- `src/components/investigation/EvidenceExplorer.tsx` — new client component (search + filter + view toggle)
- `src/components/investigation/DocumentCard.tsx` — add date and person count props

## Files Summary

| File | Action |
|---|---|
| `src/lib/caso-epstein/types.ts` | Modify — expand interface + Zod schema |
| `src/lib/caso-epstein/queries.ts` | Modify — update `toDocumentProps`, new `getDocumentBySlug`, update `getDocuments` |
| `scripts/seed-caso-epstein.ts` | Modify — expand to ~45 documents + new relationships |
| `src/app/caso/[slug]/evidencia/page.tsx` | Modify — delegate to EvidenceExplorer |
| `src/app/caso/[slug]/evidencia/[docSlug]/page.tsx` | Modify — rebuild with graph connections |
| `src/components/investigation/EvidenceExplorer.tsx` | Create — search/filter client component |
| `src/components/investigation/DocumentCard.tsx` | Modify — add date + person count |

# Investigation Standardization — Design Specification

**Date:** 2026-03-20
**Status:** Draft
**Scope:** Standardize three investigations (Caso Libra, Caso Finanzas Politicas, Caso Epstein) under a unified Neo4j-native config and data model, aligned with the Investigation Engine PRD.

---

## 1. Overview

Three investigations exist in the Office of Accountability platform, each built independently with different schemas, storage, and API patterns:

| Investigation | Current State |
|---|---|
| **Caso Libra** | Full Neo4j integration with `CasoLibra*`-prefixed labels, Zod schemas, 8 API routes, typed queries |
| **Caso Finanzas Politicas** | Static TypeScript data file + a 720-line Neo4j API route querying platform labels (`Politician`, `OffshoreOfficer`, etc.) |
| **Caso Epstein** | Raw JSON files in `_ingestion_data/rhowardstone/` — 606 knowledge graph entities, 2,302 relationships, 1,614 persons registry entries |

This spec standardizes all three under the Investigation Engine's database-native architecture: `InvestigationConfig` nodes in Neo4j with dynamic schema definitions, generic node labels with `caso_slug` namespace isolation, and unified API routes.

### Scope Boundaries

**In scope:**
- InvestigationConfig + SchemaDefinition + NodeTypeDefinition + RelTypeDefinition nodes for all three investigations
- Full label migration: `CasoLibra*` → generic labels with `caso_slug`
- Data import: finanzas-politicas narrative data and epstein knowledge graph + persons into Neo4j
- Unified API routes at `/api/casos/[casoSlug]/*`
- Schema-aware generic query builder
- Frontend route migration to `/caso/[casoSlug]/*`

**Out of scope:**
- Pipeline execution (ingest/verify/enrich/analyze/report stages)
- Gate UI, Proposal nodes, AuditEntry nodes
- Template system
- LLM abstraction layer
- Snapshot/forking system

---

## 2. Data Model

### 2.1 Investigation Config Nodes

Each investigation gets an `InvestigationConfig` node plus its schema subgraph:

```
(InvestigationConfig {id: "caso-libra", name: "Caso Libra", caso_slug: "caso-libra", status: "active"})
  -[:HAS_SCHEMA]-> (SchemaDefinition {id: "caso-libra-schema"})
    -[:DEFINES_NODE_TYPE]-> (NodeTypeDefinition {name: "Person", properties_json: '...', color: "#3b82f6", icon: "user"})
    -[:DEFINES_NODE_TYPE]-> (NodeTypeDefinition {name: "Organization", ...})
    ...
    -[:DEFINES_REL_TYPE]-> (RelTypeDefinition {name: "AFFILIATED_WITH", from_types: ["Person"], to_types: ["Organization"], ...})
    ...
```

Config node structure:

```typescript
interface InvestigationConfig {
  id: string           // "caso-libra", "caso-finanzas-politicas", "caso-epstein"
  name: string         // Display name
  description: string
  caso_slug: string    // Namespace key — matches caso_slug on all data nodes
  status: 'active' | 'draft' | 'archived'
  created_at: string   // ISO date
  tags: string[]
}
```

### 2.2 Generic Labels with caso_slug

All investigation data nodes use generic labels with a `caso_slug` property for namespace isolation:

| Before (Caso Libra) | After |
|---|---|
| `CasoLibraPerson {id: "cl-person-milei"}` | `Person {id: "caso-libra:cl-person-milei", caso_slug: "caso-libra"}` |
| `CasoLibraEvent {id: "cl-event-launch"}` | `Event {id: "caso-libra:cl-event-launch", caso_slug: "caso-libra"}` |
| `CasoLibraDocument {id: "cl-doc-filing"}` | `Document {id: "caso-libra:cl-doc-filing", caso_slug: "caso-libra"}` |
| `CasoLibraOrganization {id: "cl-org-kip"}` | `Organization {id: "caso-libra:cl-org-kip", caso_slug: "caso-libra"}` |
| `CasoLibraToken {id: "cl-token-libra"}` | `Token {id: "caso-libra:cl-token-libra", caso_slug: "caso-libra"}` |
| `CasoLibraWallet {address: "abc123"}` | `Wallet {id: "caso-libra:abc123", caso_slug: "caso-libra", address: "abc123"}` |

All queries filter by `WHERE n.caso_slug = $casoSlug`.

### 2.3 ID Strategy

Neo4j Community Edition does not support composite uniqueness constraints. Instead, node IDs are prefixed with the caso_slug:

```
{caso_slug}:{local_id}
```

Single-property uniqueness constraints on `id`:

```cypher
CREATE CONSTRAINT person_id_unique IF NOT EXISTS
FOR (n:Person) REQUIRE n.id IS UNIQUE
```

Helper function:

```typescript
function casoNodeId(casoSlug: string, localId: string): string {
  return `${casoSlug}:${localId}`
}
```

### 2.4 Indexes

Every generic label gets a range index on `caso_slug` for query performance:

```cypher
CREATE INDEX person_caso_slug IF NOT EXISTS FOR (n:Person) ON (n.caso_slug)
CREATE INDEX event_caso_slug IF NOT EXISTS FOR (n:Event) ON (n.caso_slug)
CREATE INDEX document_caso_slug IF NOT EXISTS FOR (n:Document) ON (n.caso_slug)
CREATE INDEX organization_caso_slug IF NOT EXISTS FOR (n:Organization) ON (n.caso_slug)
CREATE INDEX token_caso_slug IF NOT EXISTS FOR (n:Token) ON (n.caso_slug)
CREATE INDEX wallet_caso_slug IF NOT EXISTS FOR (n:Wallet) ON (n.caso_slug)
CREATE INDEX location_caso_slug IF NOT EXISTS FOR (n:Location) ON (n.caso_slug)
CREATE INDEX aircraft_caso_slug IF NOT EXISTS FOR (n:Aircraft) ON (n.caso_slug)
CREATE INDEX shell_company_caso_slug IF NOT EXISTS FOR (n:ShellCompany) ON (n.caso_slug)
CREATE INDEX claim_caso_slug IF NOT EXISTS FOR (n:Claim) ON (n.caso_slug)
CREATE INDEX money_flow_caso_slug IF NOT EXISTS FOR (n:MoneyFlow) ON (n.caso_slug)
```

Fulltext indexes on generic labels will return results from all investigations. Post-filter with `WHERE n.caso_slug = $casoSlug` in the application layer.

### 2.5 Platform Data Untouched

Existing platform labels (`Politician`, `Legislation`, `LegislativeVote`, `Party`, `Province`, `Investigation`, `User`) have no `caso_slug` — they are platform-wide reference data, not investigation-specific. No changes to these.

---

## 3. Schema Definitions per Investigation

### 3.1 Caso Libra (`caso_slug: "caso-libra"`)

**Node types:**

| Type | Properties |
|---|---|
| `Person` | id, name, slug, role, description, photo_url, nationality |
| `Organization` | id, name, slug, org_type, description, country |
| `Token` | id, symbol, name, contract_address, chain, launch_date, peak_market_cap |
| `Event` | id, title, slug, description, date, source_url, event_type |
| `Document` | id, title, slug, doc_type, summary, source_url, date_published |
| `Wallet` | id, address, label, owner_id, chain |
| `GovernmentAction` | id, date, action_es, action_en, effect_es, effect_en, source, source_url |

**Relationship types:**

| Type | From → To | Properties |
|---|---|---|
| `CONTROLS` | Person → Wallet | — |
| `SENT` | Wallet → Wallet | hash, amount_usd, amount_sol, timestamp |
| `COMMUNICATED_WITH` | Person → Person | date, medium |
| `MET_WITH` | Person → Person | date, location |
| `PARTICIPATED_IN` | Person → Event | — |
| `DOCUMENTED_BY` | Event → Document | — |
| `MENTIONS` | Document → Person/Org/Token | — |
| `PROMOTED` | Person → Token | — |
| `CREATED_BY` | Token → Organization | — |
| `AFFILIATED_WITH` | Person → Organization | — |

### 3.2 Caso Finanzas Politicas (`caso_slug: "caso-finanzas-politicas"`)

Only the narrative investigation data (factchecks, timeline, actors, money flows) is migrated into investigation-specific nodes. The platform-graph visualization route (`/api/caso/finanzas-politicas/graph/`) stays as-is — it queries platform labels (`Politician`, `OffshoreOfficer`, `Judge`, etc.) and is not investigation-specific.

**Node types:**

| Type | Properties |
|---|---|
| `Person` | id, name, slug, role_es, role_en, description_es, description_en, party, datasets |
| `Organization` | id, name, slug, type, jurisdiction, incorporation_date |
| `Event` | id, date, title_es, title_en, description_es, description_en, category, sources |
| `MoneyFlow` | id, from_label, to_label, amount_ars, description_es, description_en, date, source, source_url |
| `Claim` | id, claim_es, claim_en, status, tier, source, source_url, detail_es, detail_en |

**Relationship types:**

| Type | From → To | Properties |
|---|---|---|
| `OFFICER_OF` | Person → Organization | role, since |
| `SUBJECT_OF` | Person → Claim | — |
| `INVOLVED_IN` | Person → Event | — |
| `SOURCE_OF` | MoneyFlow → Person/Org | — |
| `DESTINATION_OF` | MoneyFlow → Person/Org | — |

### 3.3 Caso Epstein (`caso_slug: "caso-epstein"`)

Sourced from `_ingestion_data/rhowardstone/knowledge_graph_entities.json` (606 entities), `knowledge_graph_relationships.json` (2,302 relationships), and `persons_registry.json` (1,614 persons).

**Node types (matching actual data):**

| Type | Count | Properties |
|---|---|---|
| `Person` | ~1,614 (merged KG + registry) | id, name, slug, aliases, category, entity_type, occupation, legal_status, mention_count, search_terms, sources |
| `Organization` | 9 | id, name, slug, aliases, entity_type, metadata |
| `ShellCompany` | 12 | id, name, slug, aliases, entity_type, metadata |
| `Location` | 3 | id, name, slug, aliases, entity_type, metadata |
| `Aircraft` | 4 | id, name, slug, aliases, entity_type, metadata |

**Relationship types (matching actual data — 10 types):**

| Type | From → To | Properties |
|---|---|---|
| `ASSOCIATED_WITH` | Person → Person/Org/ShellCompany | weight, date_range |
| `COMMUNICATED_WITH` | Person → Person | weight, date_range |
| `TRAVELED_WITH` | Person → Person | weight, date_range |
| `EMPLOYED_BY` | Person → Person/Org | weight |
| `VICTIM_OF` | Person → Person | weight |
| `PAID_BY` | Person → Person/Org | weight |
| `REPRESENTED_BY` | Person → Person | weight |
| `RECRUITED_BY` | Person → Person | weight |
| `RELATED_TO` | Person → Person | weight, relationship |
| `OWNED_BY` | Org/ShellCompany/Aircraft/Location → Person | weight |

**Victim data safeguard:** The import script must enforce the Epstein CLAUDE.md rule: "Never include real victim names or identifying details." Any `Person` node that is the source of a `VICTIM_OF` relationship is imported with pseudonymized name (`Jane Doe #N` / `John Doe #N`) and stripped identifying details. The original name is NOT stored in Neo4j.

### 3.4 Persons Registry Merge Strategy

The persons registry (1,614 entries) and knowledge graph (~571 person entities) overlap. Import order:

1. Import KG person entities first — they have stable integer IDs and relationship references
2. For each registry entry, attempt name match against KG entities (case-insensitive, alias-aware)
3. If matched: enrich the existing KG-sourced node with registry fields (slug, category, search_terms, sources)
4. If unmatched: create a new Person node from the registry entry

This produces ~1,614 Person nodes (~571 from KG enriched with registry data, ~1,043 registry-only). Exact counts may vary — the import script logs reconciliation results.

---

## 4. Migration Strategy

### 4.1 Phase 1: Schema & Config Nodes

**Script:** `scripts/seed-investigation-configs.ts`

Creates `InvestigationConfig`, `SchemaDefinition`, `NodeTypeDefinition`, `RelTypeDefinition` nodes for all three investigations. Idempotent (MERGE). Safe to run at any time.

### 4.2 Phase 2: Caso Libra Label Migration (Two-Phase)

**Script:** `scripts/migrate-caso-libra-labels.ts`

**Step 1 — Create new nodes (non-destructive):**
- For each `CasoLibra*` node, create a corresponding generic-labeled node with `caso_slug: "caso-libra"` and prefixed ID
- Recreate all relationships between the new generic nodes
- Verify: count new nodes per type matches old nodes per type

**Step 2 — Drop old nodes (destructive, after verification):**
- Delete all `CasoLibra*` nodes and their relationships
- Drop old constraints (`CasoLibraPerson.id IS UNIQUE`, etc.)
- Create new constraints and indexes

**Rollback:** If step 2 fails or results are wrong, old nodes still exist (step 1 is additive). If both steps complete but something is broken downstream, `seed-caso-libra.ts` can re-seed the old format.

### 4.3 Phase 3: Caso Finanzas Politicas Import

**Script:** `scripts/seed-caso-finanzas-politicas.ts`

Reads the exported arrays from `investigation-data.ts`:
- `FACTCHECK_ITEMS` → `Claim` nodes
- `TIMELINE_EVENTS` → `Event` nodes
- `ACTORS` → `Person` nodes
- `MONEY_FLOWS` → `MoneyFlow` nodes
- `IMPACT_STATS` → stored as properties on the `InvestigationConfig` node

Generates slugs using the existing slug utility. Creates relationships based on entity references (e.g., `SUBJECT_OF` between Person and Claim based on name matching in claim text).

### 4.4 Phase 4: Caso Epstein Import

**Script:** `scripts/seed-caso-epstein.ts`

1. Read `knowledge_graph_entities.json` — create nodes by entity type
2. Read `knowledge_graph_relationships.json` — create relationships using source/target entity IDs
3. Read `persons_registry.json` — merge with existing KG person nodes by name, create new nodes for unmatched entries
4. Apply victim pseudonymization: scan for `VICTIM_OF` relationship sources, replace names with `Jane Doe #N` / `John Doe #N`
5. All nodes get `caso_slug: "caso-epstein"` and prefixed IDs

### 4.5 Phase 5: Query & API Migration

Update all Caso Libra queries:

```typescript
// Before
`MATCH (p:CasoLibraPerson) RETURN p`

// After
`MATCH (p:Person {caso_slug: $casoSlug}) RETURN p`
```

Replace 8 caso-libra API routes with 301 redirects to new unified routes.

### 4.6 Phase 6: Frontend Hardcoded API Calls

Frontend pages already live under `/caso/[slug]/*` (no migration needed). However, several pages under this generic route hardcode `/api/caso-libra/*` fetch URLs. These must be updated to use the `slug` parameter to build the correct API path:

Pages requiring updates:
- `webapp/src/app/caso/[slug]/dinero/page.tsx` — hardcoded `fetch('/api/caso-libra/wallets')`
- `webapp/src/app/caso/[slug]/investigacion/page.tsx` — hardcoded `fetch('/api/caso-libra/investigation', ...)`
- `webapp/src/app/caso/[slug]/actor/[actorSlug]/page.tsx` — hardcoded `fetch('/api/caso-libra/person/${actorSlug}')`
- `webapp/src/app/caso/[slug]/evidencia/[docSlug]/page.tsx` — hardcoded `fetch('/api/caso-libra/document/${docSlug}')`

All should change to: `fetch(\`/api/casos/${casoSlug}/...\`)`.

Additionally, hardcoded `/caso/finanzas-politicas/*` static routes exist alongside the dynamic `[slug]` route:
- `webapp/src/app/caso/finanzas-politicas/page.tsx` (landing page)
- `webapp/src/app/caso/finanzas-politicas/layout.tsx`
- `webapp/src/app/caso/finanzas-politicas/conexiones/page.tsx`
- `webapp/src/app/caso/finanzas-politicas/resumen/page.tsx`
- `webapp/src/app/caso/finanzas-politicas/cronologia/page.tsx`
- `webapp/src/app/caso/finanzas-politicas/dinero/page.tsx`
- `webapp/src/app/caso/finanzas-politicas/investigacion/page.tsx`

These override the dynamic route for finanzas-politicas. They should be kept as-is for now — they serve the platform-graph visualization and narrative pages which are a separate concern from the investigation data.

### Execution Order

Phases 1–4 are data scripts. Phase 5–6 are code changes. Scripts run before deploying code changes. Each phase is independently runnable and verifiable.

---

## 5. Unified Query Layer

### 5.1 Schema-Aware Query Builder

```typescript
// lib/investigations/query-builder.ts

interface InvestigationQueryBuilder {
  // Core queries — work for any investigation
  getGraph(casoSlug: string): Promise<GraphData>
  getNodesByType(casoSlug: string, nodeType: string, opts?: PaginationOpts): Promise<InvestigationNode[]>
  getNodeBySlug(casoSlug: string, nodeType: string, slug: string): Promise<InvestigationNode | null>
  getNodeConnections(casoSlug: string, nodeId: string, depth?: number): Promise<GraphData>
  getTimeline(casoSlug: string): Promise<TimelineItem[]>
  getStats(casoSlug: string): Promise<InvestigationStats>

  // Schema introspection
  getConfig(casoSlug: string): Promise<InvestigationConfig>
  getSchema(casoSlug: string): Promise<InvestigationSchema>
  getNodeTypes(casoSlug: string): Promise<NodeTypeDefinition[]>
  getRelTypes(casoSlug: string): Promise<RelTypeDefinition[]>
}
```

`getGraph()` reads the schema's node types and generates Cypher dynamically:

```cypher
// Generated for caso-libra (has Person, Organization, Token, Event, Document, Wallet):
MATCH (n {caso_slug: $casoSlug})
WHERE n:Person OR n:Organization OR n:Token OR n:Event OR n:Document OR n:Wallet
OPTIONAL MATCH (n)-[r]-(m {caso_slug: $casoSlug})
RETURN n, r, m
```

The label list comes from `NodeTypeDefinition` nodes, not hardcoded strings.

### 5.2 Generic Transform

```typescript
function toInvestigationNode(record: Neo4jNode, schema: NodeTypeDefinition): InvestigationNode {
  return {
    id: record.properties.id,
    label: record.labels.find(l => l !== 'Node') || record.labels[0],
    caso_slug: record.properties.caso_slug,
    slug: record.properties.slug,
    properties: pickSchemaProperties(record.properties, schema.properties_json),
    color: schema.color,
    icon: schema.icon,
  }
}
```

### 5.3 Typed Wrappers

Existing typed queries become thin wrappers:

```typescript
// lib/caso-libra/queries.ts
export async function getPersonBySlug(slug: string): Promise<Person | null> {
  const node = await queryBuilder.getNodeBySlug('caso-libra', 'Person', slug)
  return node ? toPerson(node) : null
}
```

This preserves type safety for existing components while the generic layer handles Cypher generation.

### 5.4 Investigation-Specific Extensions

Some queries are unique to an investigation:
- `getWalletFlows()` — only caso-libra (has Wallet + SENT relationships)
- MiroFish simulation — only caso-libra for now

These stay in per-case query files but use `caso_slug` filtering internally. The unified API exposes them as optional endpoints.

---

## 6. Unified API Routes

### 6.1 Generic Routes

```
/api/casos/[casoSlug]/graph          — full investigation graph
/api/casos/[casoSlug]/nodes/[type]   — list nodes by type (paginated)
/api/casos/[casoSlug]/node/[slug]    — single node by slug + connections
/api/casos/[casoSlug]/timeline       — timeline events
/api/casos/[casoSlug]/schema         — schema introspection (node types, rel types, colors)
/api/casos/[casoSlug]/submissions    — submit/read investigation data
/api/casos/[casoSlug]/stats          — aggregate counts
```

The generic route validates `casoSlug` against existing `InvestigationConfig` nodes. Unknown slugs → 404.

### 6.2 Investigation-Specific Extensions

```
/api/casos/caso-libra/wallets        — wallet flows (only caso-libra)
/api/casos/caso-libra/simulate/*     — MiroFish simulation (only caso-libra)
```

### 6.3 Backwards Compatibility

Old routes become 301 redirects:

```typescript
// app/api/caso-libra/graph/route.ts
export function GET() {
  return NextResponse.redirect(new URL('/api/casos/caso-libra/graph'), 301)
}
```

Redirect stubs stay for one release cycle, then get removed.

### 6.4 Existing Routes Preserved

```
/api/caso/finanzas-politicas/graph   — keeps querying platform labels (Politician, OffshoreOfficer, etc.)
/api/investigations/*                — keeps serving user-authored Investigation documents (TipTap CRUD)
```

These are separate concerns and are not touched by this migration.

### 6.5 Frontend Page Routes

Pages already live under `/caso/[slug]/*` — no route structure migration needed. Existing routes:

```
/caso/[slug]                          — investigation landing page
/caso/[slug]/grafo                    — graph explorer
/caso/[slug]/actor/[actorSlug]        — person profile
/caso/[slug]/evidencia/[docSlug]      — document detail
/caso/[slug]/cronologia               — timeline
/caso/[slug]/dinero                   — wallet/money flows
/caso/[slug]/investigacion            — investigation data submissions
/caso/[slug]/simular                  — MiroFish simulation
/caso/[slug]/simulacion               — simulation panel wrapper
/caso/[slug]/vuelos                   — flights visualization
/caso/[slug]/proximidad               — proximity analysis
/caso/[slug]/resumen                  — summary page
```

The work is updating hardcoded `/api/caso-libra/*` fetch URLs inside these pages to use the dynamic `slug` parameter (see Phase 4.6).

Additionally, hardcoded static routes exist for finanzas-politicas (7 files):
```
/caso/finanzas-politicas              — landing page (stays as-is)
/caso/finanzas-politicas/conexiones   — platform-graph visualization (stays as-is)
/caso/finanzas-politicas/resumen      — narrative summary (stays as-is)
/caso/finanzas-politicas/cronologia   — timeline (stays as-is)
/caso/finanzas-politicas/dinero       — money flows (stays as-is)
/caso/finanzas-politicas/investigacion — investigation data (stays as-is)
```

These override the `[slug]` route for finanzas-politicas and are kept because they serve the platform-graph visualization and narrative pages.

### 6.6 Schema-Driven UI

The frontend reads the schema, not hardcoded config:

```typescript
const schema = await queryBuilder.getSchema(casoSlug)
// schema.nodeTypes = [{name: "Person", color: "#3b82f6", icon: "user"}, ...]
// Render graph legend, filter sidebar, node type toggles from this
```

Adding a new investigation or new node type to an existing investigation requires zero frontend structural changes — just Neo4j config node updates. However, investigation-specific pages (e.g., `/dinero` for wallet flows, `/vuelos` for flights) only render when the schema includes the relevant node types.

---

## 7. File Changes

All paths are relative to `webapp/`.

### 7.1 Modified

| File | Change |
|---|---|
| `src/lib/neo4j/schema.ts` | Drop `CasoLibra*` constraints/indexes, add generic label constraints + `caso_slug` range indexes, add `InvestigationConfig` constraint |
| `src/lib/caso-libra/queries.ts` | Rewrite Cypher: `CasoLibra*` → `{Label} {caso_slug: $casoSlug}`, delegate to query builder |
| `src/lib/caso-libra/transform.ts` | Minor — node labels change but property shapes are the same |
| `src/lib/graph/constants.ts` | Add new label entries for `ShellCompany`, `Aircraft`, `Wallet`, `Token`, `Claim`, `MoneyFlow` to `LABEL_COLORS` and `LABEL_DISPLAY` |
| `scripts/seed-caso-libra.ts` | Update to use generic labels + `caso_slug` + prefixed IDs |
| `scripts/init-schema.ts` | Include new constraints and indexes |
| `src/app/api/caso-libra/*/route.ts` (8 routes) | Replace with 301 redirects |
| `src/app/caso/[slug]/evidencia/[docSlug]/page.tsx` | Update hardcoded `fetch('/api/caso-libra/document/...')` to use dynamic `slug` |
| `src/app/caso/[slug]/dinero/page.tsx` | Update hardcoded `fetch('/api/caso-libra/wallets')` to use dynamic `slug` |
| `src/app/caso/[slug]/investigacion/page.tsx` | Update hardcoded `fetch('/api/caso-libra/investigation', ...)` to use dynamic `slug` |
| `src/app/caso/[slug]/actor/[actorSlug]/page.tsx` | Update hardcoded `fetch('/api/caso-libra/person/...')` to use dynamic `slug` |
| `scripts/seed-caso-epstein.ts` | Rewrite — currently seeds hand-authored static data (persons, locations, events, documents, organizations, legal cases covering the pre-2024 investigation scope); replace with full import from rhowardstone JSON data (606 knowledge graph entities + 1,614 persons registry entries) |
| `src/app/caso/[slug]/page.tsx` | Refactor to schema-driven landing using `InvestigationLanding` component + query builder |
| `src/app/caso/[slug]/resumen/page.tsx` | Refactor from hardcoded slug dispatch to config-driven `NarrativeView` |
| `src/app/caso/[slug]/investigacion/page.tsx` | Refactor from hardcoded data imports to query builder + `InvestigacionView` |
| `src/app/caso/[slug]/evidencia/page.tsx` | Remove conditional slug dispatch, use query builder |
| `src/app/caso/[slug]/cronologia/page.tsx` | Remove conditional slug dispatch, use query builder |
| `src/app/caso/[slug]/grafo/page.tsx` | Update API fetch URL to `/api/casos/${slug}/graph` |
| `src/app/caso/[slug]/vuelos/page.tsx` | Update API fetch URL to `/api/casos/${slug}/flights` |
| `src/components/investigation/InvestigationNav.tsx` | Remove hardcoded `CASE_TABS`, read tabs from investigation config |
| `src/lib/caso-libra/investigation-data.ts` | Narrative chapter data moves to `config.ts`; static editorial data for factchecks/timeline stays until Neo4j seed verified |
| `src/lib/caso-epstein/queries.ts` | Rewrite to delegate to generic query builder |
| `src/lib/caso-epstein/transform.ts` | Rewrite transforms for new generic label format |
| `src/lib/caso-epstein/index.ts` | Update re-exports for new module structure |

### 7.2 Created

| File | Purpose |
|---|---|
| `src/lib/investigations/query-builder.ts` | Schema-aware generic query builder |
| `src/lib/investigations/types.ts` | `InvestigationNode`, `InvestigationSchema`, `InvestigationConfig` types |
| `src/lib/investigations/config.ts` | Read/write `InvestigationConfig` nodes from Neo4j |
| `src/lib/investigations/utils.ts` | `casoNodeId()` helper, slug generation |
| `src/lib/caso-finanzas-politicas/types.ts` | Domain types for finanzas-politicas entities |
| `src/lib/caso-finanzas-politicas/queries.ts` | Typed wrappers around query builder |
| `src/lib/caso-finanzas-politicas/transform.ts` | Pure transform functions |
| `src/lib/caso-epstein/types.ts` | Domain types for Epstein entities (existing file may need updates) |
| `scripts/seed-investigation-configs.ts` | Seeds InvestigationConfig + schema subgraphs for all 3 |
| `scripts/migrate-caso-libra-labels.ts` | Two-phase label migration |
| `scripts/seed-caso-finanzas-politicas.ts` | Imports narrative data into Neo4j |
| `src/app/api/casos/[casoSlug]/graph/route.ts` | Unified graph endpoint |
| `src/app/api/casos/[casoSlug]/nodes/[type]/route.ts` | Unified node list endpoint |
| `src/app/api/casos/[casoSlug]/node/[slug]/route.ts` | Unified node detail endpoint |
| `src/app/api/casos/[casoSlug]/timeline/route.ts` | Unified timeline endpoint |
| `src/app/api/casos/[casoSlug]/schema/route.ts` | Schema introspection endpoint |
| `src/app/api/casos/[casoSlug]/submissions/route.ts` | Unified submission endpoint |
| `src/app/api/casos/[casoSlug]/stats/route.ts` | Unified stats endpoint |
| `src/lib/investigations/registry.ts` | Central registry: casoSlug → investigation module |
| `src/lib/caso-libra/config.ts` | Investigation client config (tabs, features, hero, chapters) |
| `src/lib/caso-finanzas-politicas/config.ts` | Investigation client config |
| `src/lib/caso-epstein/config.ts` | Investigation client config |
| `src/components/investigation/InvestigationLanding.tsx` | Generic landing page (hero + stats + featured actors) |
| `src/components/investigation/InvestigacionView.tsx` | Factcheck/timeline/actors/money-flows page |
| `src/components/investigation/NarrativeView.tsx` | Chapter-based narrative with bilingual toggle |
| `src/components/investigation/ClaimCard.tsx` | Factcheck claim display with status badge |
| `src/components/investigation/MoneyFlowCard.tsx` | Financial flow visualization card |

### 7.3 Deleted (after migration confirmed working)

| File | Reason |
|---|---|
| `src/lib/caso-finanzas-politicas/investigation-data.ts` | Data moves to Neo4j |
| `src/app/caso/finanzas-politicas/page.tsx` | Replaced by generic `[slug]` landing page |
| `src/app/caso/finanzas-politicas/layout.tsx` | Replaced by generic `[slug]` layout with InvestigationNav |
| `src/app/caso/finanzas-politicas/resumen/page.tsx` | Replaced by generic `[slug]/resumen` page |
| `src/app/caso/finanzas-politicas/investigacion/page.tsx` | Replaced by generic `[slug]/investigacion` page |
| `src/app/caso/finanzas-politicas/cronologia/page.tsx` | Replaced by generic `[slug]/cronologia` page |
| `src/app/caso/finanzas-politicas/dinero/page.tsx` | Replaced by generic `[slug]/dinero` page |
| `src/app/caso/caso-epstein/page.tsx` | Replaced by generic `[slug]` landing page |
| `src/app/caso/caso-epstein/layout.tsx` | Replaced by generic `[slug]` layout with InvestigationNav |
| `src/app/caso/caso-epstein/resumen/page.tsx` | Replaced by generic `[slug]/resumen` page |
| `src/app/caso/caso-epstein/investigacion/page.tsx` | Replaced by generic `[slug]/investigacion` page |
| `src/app/caso/caso-epstein/cronologia/page.tsx` | Replaced by generic `[slug]/cronologia` page |
| `src/app/caso/caso-epstein/evidencia/page.tsx` | Replaced by generic `[slug]/evidencia` page |

### 7.4 Untouched

| File | Reason |
|---|---|
| `src/lib/neo4j/client.ts` | Infrastructure — no changes needed |
| `src/lib/investigation/*` | TipTap-based Investigation documents — separate concern |
| `src/lib/caso-libra/types.ts` | Domain types don't change |
| `src/lib/caso-libra/investigation-schema.ts` | Zod submission schemas still valid |
| `src/app/api/caso/finanzas-politicas/graph/route.ts` | Queries platform labels, not investigation-specific |
| `src/app/api/investigations/*` | User-authored investigation CRUD — separate concern |
| `src/app/caso/finanzas-politicas/conexiones/page.tsx` | Platform-graph visualization — separate concern (may become feature flag later) |
| All Como Voto ETL scripts | Platform reference data |
| `_ingestion_data/rhowardstone/*` | Source data consumed by seed script |

---

## 8. Backend Module Standardization

### 8.1 Per-Investigation Module Layout

Every investigation gets the same file structure under `webapp/src/lib/caso-{slug}/`:

```
lib/caso-libra/
  types.ts          — Domain types (Person, Event, etc.) specific to this investigation
  queries.ts        — Typed query wrappers that delegate to the generic query builder
  transform.ts      — Pure functions: Neo4j records → domain objects
  config.ts         — Investigation metadata (tabs, hero text, feature flags, chapters)
  index.ts          — Re-exports
  investigation-schema.ts  — Zod submission schemas (caso-libra only, for now)

lib/caso-finanzas-politicas/
  types.ts
  queries.ts
  transform.ts
  config.ts
  index.ts

lib/caso-epstein/
  types.ts
  queries.ts
  transform.ts
  config.ts
  index.ts
```

**Naming convention:** `transform.ts` (singular) — matching the existing files in caso-libra and caso-epstein.

### 8.2 InvestigationClientConfig Contract

Each investigation exports a static config that the frontend uses to decide what to render:

```typescript
// lib/investigations/types.ts

interface BilingualText {
  es: string
  en: string
}

interface InvestigationClientConfig {
  casoSlug: string
  name: BilingualText
  description: BilingualText
  tabs: TabId[]
  features: {
    wallets: boolean        // enables /dinero page
    simulation: boolean     // enables /simular page
    flights: boolean        // enables /vuelos page
    submissions: boolean    // enables evidence submission form
    platformGraph: boolean  // enables /conexiones page (platform-label queries)
  }
  hero: {
    title: BilingualText
    subtitle: BilingualText
  }
  chapters?: NarrativeChapter[]  // for /resumen page (editorial content)
  sources?: Array<{ name: string; url: string }>  // global sources section for /resumen
}

interface NarrativeChapter {
  id: string
  title: BilingualText
  paragraphs: BilingualText[]     // array of paragraphs, not a single string
  pullQuote?: BilingualText       // optional highlighted quote
  citations?: Array<{ id: number; text: string; url?: string }>  // footnotes
}

type TabId = 'resumen' | 'investigacion' | 'cronologia' | 'evidencia' | 'grafo'
           | 'dinero' | 'simular' | 'vuelos' | 'proximidad' | 'conexiones'
```

### 8.3 Investigation Registry

A central registry resolves `casoSlug` → module config:

```typescript
// lib/investigations/registry.ts
import { config as libraConfig } from '../caso-libra/config'
import { config as finanzasConfig } from '../caso-finanzas-politicas/config'
import { config as epsteinConfig } from '../caso-epstein/config'

const REGISTRY: Record<string, InvestigationClientConfig> = {
  'caso-libra': libraConfig,
  'caso-finanzas-politicas': finanzasConfig,
  'caso-epstein': epsteinConfig,
}

export function getInvestigationConfig(slug: string): InvestigationClientConfig | null {
  return REGISTRY[slug] ?? null
}

export function getAllInvestigations(): InvestigationClientConfig[] {
  return Object.values(REGISTRY)
}
```

### 8.4 Query Pattern

All investigation queries follow the same pattern — typed wrappers around the generic query builder:

```typescript
// lib/caso-epstein/queries.ts
import { queryBuilder } from '../investigations/query-builder'
import { toPerson, toEvent } from './transforms'

const SLUG = 'caso-epstein'

export async function getPersonBySlug(slug: string) {
  const node = await queryBuilder.getNodeBySlug(SLUG, 'Person', slug)
  return node ? toPerson(node) : null
}

export async function getTimeline() {
  const events = await queryBuilder.getNodesByType(SLUG, 'Event', { orderBy: 'date' })
  return events.map(toEvent)
}
```

Each investigation's `queries.ts` is thin — just slug binding + type-safe transforms. The generic query builder handles Cypher generation.

---

## 9. Frontend Standardization

### 9.1 Data Fetching Pattern

All pages use a single pattern: **server component fetches via the generic query builder, parameterized by slug.**

```typescript
// app/caso/[slug]/cronologia/page.tsx (example)
import { getInvestigationConfig } from '@/lib/investigations/registry'
import { queryBuilder } from '@/lib/investigations/query-builder'

export default async function CronologiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const config = getInvestigationConfig(slug)
  if (!config) notFound()

  const events = await queryBuilder.getTimeline(slug)
  return <Timeline events={events} config={config} />
}
```

No more conditional slug dispatch (`if (slug === 'caso-epstein') ...`). No more hardcoded data imports. The query builder handles everything via `caso_slug` filtering.

Client components that need data use the unified API:

```typescript
const res = await fetch(`/api/casos/${casoSlug}/graph`)
```

### 9.2 Investigation Landing Page

The landing page becomes schema-driven:

```typescript
// app/caso/[slug]/page.tsx
export default async function CasoLandingPage({ params }) {
  const { slug } = await params
  const config = getInvestigationConfig(slug)
  if (!config) notFound()

  const stats = await queryBuilder.getStats(slug)
  const schema = await queryBuilder.getSchema(slug)
  const actors = await queryBuilder.getNodesByType(slug, 'Person', { limit: 6 })

  return <InvestigationLanding config={config} stats={stats} schema={schema} actors={actors} />
}
```

`<InvestigationLanding>` reads the config for hero text, feature flags, and available tabs. No per-investigation rendering logic in the page file.

### 9.3 Investigacion Page

Currently the largest page (~1000 lines) with hardcoded data imports and slug dispatch. Refactored to:

```typescript
// app/caso/[slug]/investigacion/page.tsx
export default async function InvestigacionPage({ params }) {
  const { slug } = await params
  const config = getInvestigationConfig(slug)
  if (!config) notFound()

  const [claims, events, actors, moneyFlows, documents, govResponses] = await Promise.all([
    queryBuilder.getNodesByType(slug, 'Claim'),
    queryBuilder.getNodesByType(slug, 'Event', { orderBy: 'date' }),
    queryBuilder.getNodesByType(slug, 'Person'),
    queryBuilder.getNodesByType(slug, 'MoneyFlow'),
    queryBuilder.getNodesByType(slug, 'Document'),
    queryBuilder.getNodesByType(slug, 'GovernmentAction'),
  ])

  return (
    <InvestigacionView
      config={config}
      claims={claims}
      events={events}
      actors={actors}
      moneyFlows={moneyFlows}
      documents={documents}
      govResponses={govResponses}
    />
  )
}
```

`<InvestigacionView>` renders sections conditionally — if there are no `Claim` nodes for an investigation, the factcheck section doesn't render. If there are no `MoneyFlow` nodes, the money flow section doesn't render. `GovernmentAction` is a new node type for government responses/obstruction actions — it maps from the existing `GOVERNMENT_RESPONSES` data in caso-libra's `investigation-data.ts`.

**Transitional note:** This page refactor is gated on the Phase 3/4 data seed scripts completing. Until caso-libra's factcheck/timeline/actor/evidence/government-response data is seeded into Neo4j as nodes, the existing `investigation-data.ts` imports remain as the data source. The investigacion page is refactored to query-builder-driven only after the Neo4j seed is verified.

### 9.4 Resumen Page (Narrative Chapters)

The resumen pages have hardcoded chapter arrays that are editorial content, not graph data. These move into each investigation's `config.ts`:

```typescript
// lib/caso-libra/config.ts
export const config: InvestigationClientConfig = {
  // ...
  chapters: [
    {
      id: 'genesis',
      title: { es: 'El Origen', en: 'The Genesis' },
      content: { es: '...', en: '...' },
      sources: [{ name: '...', url: '...' }],
    },
    // ...
  ],
}
```

The resumen page becomes generic:

```typescript
// app/caso/[slug]/resumen/page.tsx
'use client'

export default function ResumenPage({ params }) {
  const { slug } = use(params)
  const config = getInvestigationConfig(slug)
  if (!config) notFound()
  if (!config.chapters?.length) notFound()

  return <NarrativeView chapters={config.chapters} sources={config.sources} />
}
```

`NarrativeView` is a client component (`'use client'`) because it contains the bilingual language toggle via `useState`. The page itself stays as a client component (same as current implementation) since `getInvestigationConfig` is a synchronous registry lookup.

### 9.5 Conditional Feature Pages

Pages that only apply to certain investigations check the feature flag:

```typescript
// app/caso/[slug]/dinero/page.tsx
export default async function DineroPage({ params }) {
  const { slug } = await params
  const config = getInvestigationConfig(slug)
  if (!config?.features.wallets) notFound()

  const flows = await queryBuilder.getGraph(slug)
  return <WalletExplorer flows={flows} config={config} />
}
```

Feature flags from `config.ts`:

| Flag | Page | Investigations |
|---|---|---|
| `wallets` | `/dinero` | caso-libra |
| `simulation` | `/simular` | caso-libra |
| `flights` | `/vuelos` | caso-epstein |
| `submissions` | form on `/investigacion` | caso-libra |
| `platformGraph` | `/conexiones` | caso-finanzas-politicas |

If a user navigates to `/caso/caso-epstein/dinero` and Epstein's config has `wallets: false`, they get a 404.

### 9.6 InvestigationNav

The `InvestigationNav` component currently has hardcoded tab configs per slug. Refactored to read from the investigation config:

```typescript
// components/investigation/InvestigationNav.tsx
export function InvestigationNav({ slug }: { slug: string }) {
  const config = getInvestigationConfig(slug)
  if (!config) return null

  const tabs = config.tabs.map(tab => ({
    id: tab,
    label: TAB_LABELS[tab],
    href: `/caso/${slug}/${tab === 'resumen' ? '' : tab}`,
  }))

  return <nav>...</nav>
}
```

No more per-case `CASE_TABS` config object. The tabs come from the investigation config.

### 9.7 Static Route Deletion

Once the `[slug]` pages are fully data-driven and investigation data is in Neo4j, static override routes are deleted:

**Finanzas Politicas** — 6 static pages deleted (landing, layout, resumen, investigacion, cronologia, dinero). The one exception: `/caso/finanzas-politicas/conexiones` stays as a static route because it queries platform labels (`Politician`, `OffshoreOfficer`, etc.) — this is a platform-graph visualization, not investigation data. It may later become a feature flag (`features.platformGraph: true`) on a generic conexiones page.

**Caso Epstein** — 6 static pages deleted (landing, layout, resumen, investigacion, cronologia, evidencia). These currently shadow the `[slug]` dynamic route for caso-epstein with the same problem as finanzas-politicas.

### 9.8 Shared Component Inventory

**Existing (reusable as-is):**

| Component | Location | Used By |
|---|---|---|
| `InvestigationNav` | `components/investigation/` | All investigations (after config-driven refactor) |
| `DocumentCard` | `components/investigation/` | evidencia page |
| `Timeline` | `components/investigation/` | cronologia page |
| `ActorCard` | `components/investigation/` | landing + investigacion pages |
| `KeyStats` | `components/investigation/` | landing page |
| `ShareButton` | `components/investigation/` | all pages |
| `ForceGraph` | `components/graph/` | grafo + dinero pages |
| `SearchBar` | `components/graph/` | grafo page |
| `NodeDetailPanel` | `components/graph/` | grafo page |

**New shared components:**

| Component | Purpose |
|---|---|
| `InvestigationLanding` | Generic landing page (hero + stats + featured actors) |
| `InvestigacionView` | Factcheck/timeline/actors/money-flows with conditional sections |
| `NarrativeView` | Chapter-based narrative with bilingual toggle |
| `ClaimCard` | Factcheck claim display with status badge |
| `MoneyFlowCard` | Financial flow visualization card |

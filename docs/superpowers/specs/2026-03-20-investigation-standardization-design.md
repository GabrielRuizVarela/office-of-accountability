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

The persons registry (1,614 entries) and knowledge graph (578 person entities) overlap. Import order:

1. Import KG person entities first — they have stable integer IDs and relationship references
2. For each registry entry, attempt name match against KG entities (case-insensitive, alias-aware)
3. If matched: enrich the existing KG-sourced node with registry fields (slug, category, search_terms, sources)
4. If unmatched: create a new Person node from the registry entry

This produces ~1,614 Person nodes (578 from KG enriched with registry data, ~1,036 registry-only).

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

### 4.6 Phase 6: Frontend Route Migration

Page routes move from `/caso-libra/*` to `/caso/[casoSlug]/*`. Generic pages read `InvestigationConfig` and `NodeTypeDefinition` from Neo4j for rendering.

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

```
/caso/[casoSlug]                      — investigation landing page
/caso/[casoSlug]/grafo                — graph explorer
/caso/[casoSlug]/persona/[slug]       — person profile
/caso/[casoSlug]/documento/[slug]     — document detail
/caso/[casoSlug]/linea-de-tiempo      — timeline
/caso/[casoSlug]/simulacion           — MiroFish simulation (if available)
```

The landing page reads the `InvestigationConfig` for name, description, tags, and available sections. The graph explorer reads `NodeTypeDefinition` nodes for colors and icons. Components that don't apply (e.g., wallet explorer for Epstein) don't render.

### 6.6 Schema-Driven UI

The frontend reads the schema, not hardcoded config:

```typescript
const schema = await queryBuilder.getSchema(casoSlug)
// schema.nodeTypes = [{name: "Person", color: "#3b82f6", icon: "user"}, ...]
// Render graph legend, filter sidebar, node type toggles from this
```

Adding a new investigation or node type requires zero frontend code changes — just Neo4j config node updates.

---

## 7. File Changes

### 7.1 Modified

| File | Change |
|---|---|
| `lib/neo4j/schema.ts` | Drop `CasoLibra*` constraints/indexes, add generic label constraints + `caso_slug` range indexes, add `InvestigationConfig` constraint |
| `lib/caso-libra/queries.ts` | Rewrite Cypher: `CasoLibra*` → `{Label} {caso_slug: $casoSlug}`, delegate to query builder |
| `lib/caso-libra/transform.ts` | Minor — node labels change but property shapes are the same |
| `lib/graph/constants.ts` | Remove `CasoLibra*` entries from `LABEL_COLORS` and `LABEL_DISPLAY`, keep generic label entries |
| `scripts/seed-caso-libra.ts` | Update to use generic labels + `caso_slug` + prefixed IDs |
| `scripts/init-schema.ts` | Include new constraints and indexes |
| `app/api/caso-libra/*/route.ts` (8 routes) | Replace with 301 redirects |
| `app/caso/[slug]/evidencia/[docSlug]/page.tsx` | Update `entityTypeLabel` function (remove `CasoLibra` prefix references) |

### 7.2 Created

| File | Purpose |
|---|---|
| `lib/investigations/query-builder.ts` | Schema-aware generic query builder |
| `lib/investigations/types.ts` | `InvestigationNode`, `InvestigationSchema`, `InvestigationConfig` types |
| `lib/investigations/config.ts` | Read/write `InvestigationConfig` nodes from Neo4j |
| `lib/investigations/utils.ts` | `casoNodeId()` helper, slug generation |
| `lib/caso-finanzas-politicas/types.ts` | Domain types for finanzas-politicas entities |
| `lib/caso-finanzas-politicas/queries.ts` | Typed wrappers around query builder |
| `lib/caso-epstein/types.ts` | Domain types for Epstein entities |
| `lib/caso-epstein/queries.ts` | Typed wrappers around query builder |
| `scripts/seed-investigation-configs.ts` | Seeds InvestigationConfig + schema subgraphs for all 3 |
| `scripts/migrate-caso-libra-labels.ts` | Two-phase label migration |
| `scripts/seed-caso-finanzas-politicas.ts` | Imports narrative data into Neo4j |
| `scripts/seed-caso-epstein.ts` | Imports knowledge graph + persons registry |
| `app/api/casos/[casoSlug]/graph/route.ts` | Unified graph endpoint |
| `app/api/casos/[casoSlug]/nodes/[type]/route.ts` | Unified node list endpoint |
| `app/api/casos/[casoSlug]/node/[slug]/route.ts` | Unified node detail endpoint |
| `app/api/casos/[casoSlug]/timeline/route.ts` | Unified timeline endpoint |
| `app/api/casos/[casoSlug]/schema/route.ts` | Schema introspection endpoint |
| `app/api/casos/[casoSlug]/submissions/route.ts` | Unified submission endpoint |
| `app/api/casos/[casoSlug]/stats/route.ts` | Unified stats endpoint |

### 7.3 Deleted (after migration confirmed working)

| File | Reason |
|---|---|
| `lib/caso-finanzas-politicas/investigation-data.ts` | Data moves to Neo4j |

### 7.4 Untouched

| File | Reason |
|---|---|
| `lib/neo4j/client.ts` | Infrastructure — no changes needed |
| `lib/investigation/*` | TipTap-based Investigation documents — separate concern |
| `lib/caso-libra/types.ts` | Domain types don't change |
| `lib/caso-libra/investigation-schema.ts` | Zod submission schemas still valid |
| `lib/caso-libra/investigation-data.ts` | Static editorial data for public page |
| `app/api/caso/finanzas-politicas/graph/route.ts` | Queries platform labels, not investigation-specific |
| `app/api/investigations/*` | User-authored investigation CRUD — separate concern |
| All Como Voto ETL scripts | Platform reference data |
| `_ingestion_data/rhowardstone/*` | Source data consumed by seed script |

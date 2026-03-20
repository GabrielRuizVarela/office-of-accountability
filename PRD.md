# Product Requirements Document: Office of Accountability

**Version:** 0.4
**Date:** 2026-03-20
**Status:** Pre-Development
**Scope:** Argentina (federal + provincial, congress-first)

---

## 1. Problem Statement

Argentine citizens have no connected, queryable knowledge graph that links what politicians *promise*, how they *vote*, who *funds* them, and what legislation they support or block. Existing tools (e.g., Como Voto, HVN) cover individual dimensions in isolation. No platform lets citizens explore connections, add their own research, build investigation threads, and share findings backed by graph data.

The result: political knowledge is fragmented across news articles, social media threads, and PDFs. Patterns that would be obvious in a connected graph — a donor funding a legislator who votes favorably on that donor's industry — remain invisible because no tool connects the dots.

---

## 2. Vision & Core Loop

The **Office of Accountability** is a civic knowledge platform built as an interactive graph for Argentine politics. It links politicians, votes, legislation, donors, promises, organizations, and user-contributed research into a single explorable, queryable system.

The platform enables four activities:

1. **Explore** — Browse the visual graph, discover connections between politicians, votes, money, and legislation. Click a node, see its connections fan out. Drag, zoom, filter, save views
2. **Connect** — Add nodes (people, organizations, events, documents) and draw edges. Extend the graph freely with sourced data
3. **Investigate** — Create investigation threads that cite graph data, connect dots, and build narratives backed by evidence
4. **Share** — Publish investigations. Some gain visibility, most are quiet research. The value is the knowledge existing in the graph

**Design contract with users:** This is an opt-in transparency platform. All contributions, endorsements, and coalition activities are public by default. Transparency is a feature, not a bug — public records enable community auditing of the platform itself and prevent coordinated manipulation.

---

## 3. Core Principles

| Principle | Description |
|-----------|-------------|
| **Graph-First** | Every piece of political knowledge is a node or edge in the graph. If it is not in the graph, it does not exist on the platform. |
| **Transparent Provenance** | Every node and edge in the graph carries: source URL, submission date, submitter, tier, and confidence score. |
| **Open Schema** | Users can create any node type and draw any edge type. The platform seeds the graph with official data; users extend it freely. |
| **Plural Truth** | When users or coalitions disagree, the system shows both interpretations with clear sourcing rather than forcing a single narrative. |
| **Emergent Accountability** | The graph IS the evidence. When enough investigations connect a politician to broken promises, the pattern is visible. No algorithmic score needed at the core level. |
| **Full Public Transparency** | All user contributions, endorsements, and coalition activities are public. Users consent to this on signup. This enables external auditing of the platform's own integrity. |
| **Opinion, Not Verdict** | The platform presents data and community assessments. It never labels a politician as guilty of corruption — it presents correlated facts and community opinion, framed as such. |

---

## 4. Knowledge Graph: Data Model

### 4.1 Node Types

| Node | Key Properties | Description |
|------|---------------|-------------|
| `User` | id, display_name, reputation_score, verification_tier, joined_at | Platform participant |
| `Politician` | name, jurisdiction_id, party, bloc, coalition, chamber, photo_url, terms | Elected official |
| `Jurisdiction` | level (federal/provincial/municipal), name, parent_id | Geographic/electoral unit |
| `Promise` | text, source_url, date, status | Public commitment (speech, manifesto, interview) |
| `LegislativeVote` | acta_id, date, position (afirmativo/negativo/abstencion/ausente), chamber | Official vote record — sourced from HCDN/Senado APIs |
| `Legislation` | title, text_url, status, tags, expediente_id, chamber | Bill or law — sourced from HCDN/Senado |
| `Donor` | name, type (individual/empresa/sindicato/pac) | Campaign finance contributor |
| `Organization` | name, type, description, website | Any organization relevant to the political graph |
| `Event` | title, date, location, description, source_url | A political event, meeting, scandal, protest, or incident |
| `Document` | title, url, type, published_at, summary | Official document, report, budget, or filing |
| `Location` | name, type (city/province/address), coordinates | Geographic reference point |
| `Claim` | text, claim_type, status, source_url | An assertion about a relationship or fact — the generalized form of a Finding |
| `Investigation` | title, body, status, published_at | Long-form document with graph references — the primary user-created content type |
| `Coalition` | name, focus_tags, description, created_at | User-organized collaboration group |
| `Evidence` | type, url, summary, uploaded_by | Data, studies, PDFs, expert analysis |

### 4.2 Edge Types (Relationships)

**Politician activity:**

| Edge | From -> To | Properties |
|------|-----------|-----------|
| `REPRESENTS` | Politician -> Jurisdiction | chamber, period |
| `MADE_PROMISE` | Politician -> Promise | date, source_url |
| `CAST_LEGISLATIVE_VOTE` | Politician -> LegislativeVote | -- |
| `ON` | LegislativeVote -> Legislation | -- |
| `DONATED_TO` | Donor -> Politician | amount, date, cycle |
| `AFFILIATED_WITH` | Politician -> Organization | role, period |

**Graph connections (user-created):**

| Edge | From -> To | Properties |
|------|-----------|-----------|
| `FUNDED` | Organization/Donor -> Organization/Politician | amount, date, source_url |
| `LED_TO` | Event -> Legislation/Event/Claim | description |
| `RELATED_TO` | Any -> Any | relationship_type, description |
| `MEMBER_OF_ORG` | Politician/User -> Organization | role, period |
| `LOCATED_IN` | Event/Organization -> Location | -- |
| `EVIDENCED_BY` | Claim -> Evidence/Document | -- |
| `CONTRADICTED_BY` | Claim -> Evidence/Document | -- |

**Claim pattern (generalized Finding):**

```
(LegislativeVote) -[:SUBJECT_OF]-> (Claim) -[:CLAIM_ABOUT]-> (Promise)
(User)            -[:SUBMITTED]->  (Claim)
(Evidence)        -[:SUPPORTS]->   (Claim)
(Evidence)        -[:CONTRADICTS]-> (Claim)
```

`Claim` node properties: `claim_type` (fulfills/breaks/partially_fulfills/aligns_with/conflicts_with), `text`, `status` (pending/endorsed/disputed), `confidence_score`

**Investigation relationships:**

| Edge | From -> To | Properties |
|------|-----------|-----------|
| `REFERENCES` | Investigation -> Any node | context, section |
| `AUTHORED_BY` | Investigation -> User | role (author/collaborator) |
| `PUBLISHED_BY` | Investigation -> Coalition | date |
| `EMBEDS` | Investigation -> Any node | position_in_document |

**Endorsement:**

| Edge | From -> To | Properties |
|------|-----------|-----------|
| `ENDORSED` | User -> Claim/Edge | date, confidence |
| `COALITION_ENDORSED` | Coalition -> Claim | confidence, threshold_met_at |

**Coalition membership:**

| Edge | From -> To | Properties |
|------|-----------|-----------|
| `MEMBER_OF` | User -> Coalition | role (admin/editor/viewer), joined_at |
| `FOLLOWS` | User -> Coalition | followed_at |

**Trust:**

| Edge | From -> To | Properties |
|------|-----------|-----------|
| `SUBMITTED` | User -> Evidence/Claim/Investigation | date |

---

## 5. Feature Areas

### 5.1 Data Foundation (Gold-Tier: Como Voto Integration)

The [Como Voto](https://github.com/rquiroga7/Como_voto) project already provides:
- Full voting records for Camara de Diputados (HCDN) and Senado from official APIs
- Legislator names, blocs, provinces, coalition classification (~600+ parties -> PJ/PRO/LLA/OTROS)
- Daily automated updates via GitHub Actions
- Legislator photos (official sources + Wikipedia/Wikidata fallbacks)
- Election data 1983-2023

**Integration strategy:** Ingest Como Voto's output JSON as the initial Gold-tier seed. Maintain a live sync pipeline from the same HCDN/Senado sources. This gives the platform a fully populated graph at launch — every Diputado and Senador with their full vote history.

**Data format compatibility:**
```
Como Voto output -> normalize to platform schema:
  legislator.name         -> Politician.name
  legislator.bloc         -> Politician.bloc
  legislator.province     -> Politician.jurisdiction (-> Jurisdiction node)
  legislator.coalition    -> Politician.coalition
  votacion.acta_id        -> LegislativeVote.acta_id
  votacion.title          -> Legislation.title
  votacion.date           -> LegislativeVote.date
  vote_code (1-5)         -> LegislativeVote.position
```

**Data Tiers:**

| Tier | Source | Handling |
|------|--------|---------|
| Gold | Official HCDN/Senado APIs (via Como Voto pipeline) | Auto-accepted, hashed on ingestion |
| Silver | Reputable Argentine sources (Infobae, La Nacion, Clarin, Chequeado) | Auto-accepted with mandatory citation |
| Bronze | User/Coalition submissions | Requires community endorsement before high visibility |

**Provenance requirements:** Every node and edge carries `source_url`, `submitted_by`, `submitted_at`, `tier`, `confidence_score`, `ingestion_hash`. Every state change is append-only in the audit log.

---

### 5.2 Graph Engine (Core)

The graph engine is the central feature of the platform. Everything else — politician profiles, investigations, coalitions — is built on top of the graph.

**Visual Explorer**

Interactive node-and-edge graph visualization. Click a politician node and see connections fan out to votes, donors, promises, user-added entities. Core interactions:

- Drag, zoom, pan across the graph
- Click any node to expand its connections
- Filter by node type, tier, date range, jurisdiction
- Save views as named snapshots (personal or coalition-shared)
- Highlight paths between two selected nodes
- Color-code nodes by type, tier, or custom attribute
- Collapse/expand clusters for readability
- Full-screen mode for deep exploration

**Query Builder**

Structured queries against the graph. Results render as sub-graphs that can be saved, shared, or embedded in investigations.

Example queries:
- "Show all paths between Donor X and Legislation Y within 3 hops"
- "Diputados whose donors have interests in mining and voted X on law Y"
- "All promises made by Legislator Z that have claims of BREAKS against them"
- "Organizations connected to both Politician A and Politician B"

The query builder provides a visual interface for constructing these queries — users do not need to write query syntax. Advanced users can access a text-based query mode.

**Open Schema**

Users can create any node type and draw typed edges between them. The seeded political data (Como Voto) provides the foundation; users extend freely.

Core node types (Person, Organization, Event, Document, Location, Claim) are built-in with structured properties. Users can add custom properties to any node.

Edge types are open — users define the relationship label and add properties. Common edge types (FUNDED, LED_TO, MEMBER_OF_ORG) are provided as templates with suggested properties.

**Provenance on Everything**

Every user-added node and edge carries:
- Who added it
- When
- Source URL (optional but encouraged; absence is a visible signal)
- Tier (Bronze for user submissions; Silver if citing a reputable source)
- Endorsement count from other users

**Politician Profile (Graph-Rendered View)**

Each politician profile is a rendered view of all connections to that politician node in the graph. It shows:

- Chamber, bloc, coalition (PJ/PRO/LLA/OTROS), province/jurisdiction
- Vote history (all `LegislativeVote` records, searchable and filterable)
- Promise list with linked claims showing fulfillment status
- Donor relationships (amount, date, cycle)
- Connected organizations, events, and documents
- Community investigations that reference this politician
- Response field: any politician with a verified account can post rebuttals displayed prominently alongside claims

The profile is not a separate feature — it is a pre-built graph query that renders all edges connected to that `Politician` node.

**Promise Tracker (Graph View)**

Side-by-side view: "What they said" -> "How they voted"

Promise tracking is implemented as edges and claims in the graph:
- `MADE_PROMISE` edge connects Politician to Promise node
- Users create `Claim` nodes asserting that a `LegislativeVote` fulfills, breaks, or partially fulfills a Promise
- Other users endorse or dispute these claims
- The Promise node aggregates all claims about it, showing the weight of evidence

Promise `status` state machine:
```
AI-extracted:   EXTRACTED -> VERIFIED -> TRACKED -> { CUMPLIDA | INCUMPLIDA | PARCIALMENTE | VENCIDA | REEMPLAZADA }
User-submitted: SUBMITTED -> VERIFIED -> TRACKED -> { CUMPLIDA | INCUMPLIDA | PARCIALMENTE | VENCIDA | REEMPLAZADA }
```

- `EXTRACTED`: AI-parsed from speech/manifesto — requires human verification before advancing
- `SUBMITTED`: User-submitted with source URL — enters verification queue directly
- `VERIFIED`: Confirmed by multiple endorsements as accurate and attributable
- `TRACKED`: Actively monitored against legislative votes
- Terminal states: `CUMPLIDA` (fulfilled), `INCUMPLIDA` (broken), `PARCIALMENTE` (partially fulfilled), `VENCIDA` (expired/no longer relevant), `REEMPLAZADA` (superseded by newer commitment)

**User-facing display labels:**
- `TRACKED` -> "En seguimiento"
- `CUMPLIDA` -> "Cumplida"
- `INCUMPLIDA` -> "Incumplida"
- `PARCIALMENTE` -> "Parcialmente cumplida"
- `VENCIDA` -> "Vencida"
- `REEMPLAZADA` -> "Reemplazada"

**Money Flow Visualizer (Graph View)**

Pre-built graph query: Donor -> Politician -> Committee -> LegislativeVote. Renders as an interactive sub-graph highlighting patterns between contributions and voting alignment. Framed as factual data presentation — no automated correlation labels. User-created claims and investigations provide the interpretive layer.

---

### 5.3 Investigations

Investigations are the primary content type that users create. They are long-form documents — similar to Notion pages — that reference and embed graph nodes and sub-graphs as evidence.

**Investigation Features**

- Rich text editor with headings, lists, links, images
- Embed graph nodes inline: reference a Politician, Vote, or Claim and it renders as an interactive card within the document
- Embed sub-graphs: paste a saved graph query and it renders as a mini interactive graph within the investigation
- Solo or collaborative: investigations can be personal or shared within a coalition workspace
- Versioned: every edit is saved with author and timestamp
- Status: `Draft -> Published -> Archived`
- Tags for discoverability

**Investigation Workflow**

1. User creates a new investigation (solo or within a coalition)
2. Explores the graph, finds patterns, saves relevant sub-graphs
3. Writes the investigation document, embedding graph references as evidence
4. Publishes — investigation becomes visible to all users
5. Other users can endorse the investigation, adding credibility
6. Investigation references create `REFERENCES` edges in the graph, making the investigation discoverable from any node it cites

**Endorsement Model**

- Any user can endorse a claim or edge in the graph
- Endorsements are public and carry the endorser's verification tier
- Coalition endorsements carry the coalition's collective reputation
- Endorsement count is visible on every claim — higher endorsement signals higher community confidence
- No formal threshold required — visibility is organic, not gated

---

### 5.4 Coalitions (Collaboration Groups)

Coalitions are simple collaboration groups for users who share a research interest. They are not governance structures.

**Capabilities**

- Create with focus tags (`#inundaciones`, `#cordoba`, `#anticorrupcion`)
- Shared investigation workspaces: coalition members can co-edit investigations
- Shared graph views: saved queries visible to all coalition members
- Coalition-endorsed claims carry the coalition's name and reputation
- Subscribe to graph alerts (e.g., "when Legislator X votes on something tagged #medioambiente")
- Export coalition-endorsed investigations as PDF reports and share cards

**Roles**

| Role | Capabilities |
|------|-------------|
| `Admin` | Manage membership, configure coalition settings, publish official reports |
| `Editor` | Create and edit investigations, endorse claims on behalf of coalition, add nodes/edges |
| `Viewer` | View coalition workspace, saved queries, and investigations |

**Membership**

- Open join or invite-only (Admin configures)
- Members can leave at any time
- Admin can remove members

**Coalition Reputation**

A coalition's reputation is derived from:
- Number of endorsed investigations
- Accuracy track record (do their claims hold up over time?)
- Member verification tiers
- Activity level

Coalition reputation is publicly visible. Endorsements from high-reputation coalitions carry more visible weight.

---

### 5.5 Accountability as Emergent Property

The platform does not compute accountability scores. Instead, accountability emerges from the graph itself.

**How it works:**

- When enough investigations connect a politician to broken promises, the pattern is visible in the graph
- A politician's profile shows all claims, investigations, and connections — users draw their own conclusions
- The graph IS the evidence. No algorithmic intermediary is needed
- Community endorsements surface the most credible claims
- Multiple perspectives are preserved — when users disagree, both interpretations are visible with their respective evidence

**No score is not no accountability.** A politician profile densely connected to claims of broken promises, donor conflicts, and well-endorsed investigations tells a clear story without needing an A/B/C/D label.

**Future possibility:** Automated scoring can be layered on top of the graph data in later phases. Any such scoring would be derived from community-contributed knowledge, not a core feature. See Future Vision appendix.

---

## 6. Identity & Access

### 6.1 Verification Tiers

| Tier | Method | Capability |
|------|--------|-----------|
| 0 — Observador | None | View all public data, no writes |
| 1 — Participante | Email + phone verified | Add nodes/edges, create investigations, join coalitions, endorse claims |
| 2 — Verificado | DNI / CUIL verification (via AFIP or Renaper API, Phase 2) | Higher endorsement weight, create coalitions |
| 3 — Politico verificado | Official verified account | Respond to claims, post rebuttals on profile |

### 6.2 Reputation System

- Non-transferable reputation points earned through: verified contributions, endorsement accuracy, investigation quality
- Cold start: new users receive a base reputation sufficient to participate at Tier 1 level
- Reputation decay: inactive accounts lose weight gradually (prevents hoarding)
- Full formula published and auditable publicly

### 6.3 Audit Log

Every state change (node creation, edge creation, endorsement, investigation publication) is appended to an immutable audit log:
- Storage: versioned S3 with Object Lock (compliance mode) + MFA Delete
- Format: structured JSON events, no PII in the log (user IDs only, resolvable via the main DB)
- Hash chain: each event includes the hash of the previous event for tamper detection
- Publicly browsable via "Ver historial" on any node
- Note: Arweave deferred — incompatible with GDPR right to erasure for any user data

---

## 7. Technical Architecture

### 7.1 Database Strategy

**Primary store: Neo4j 5 Community**

Graph traversals are the core product — politicians, votes, donors, legislation, and investigations form a densely connected knowledge graph. Neo4j is the primary store from day one:

- Native graph storage and index-free adjacency for efficient multi-hop traversals
- Cypher query language maps directly to the domain (paths, patterns, variable-length relationships)
- br-acc (World-Open-Graph/br-acc) validates Neo4j at 220M+ nodes with a similar political accountability domain
- Full-text search indexes built into Neo4j for node search
- APOC library for batch operations, data import, and graph algorithms

**PostgreSQL:** Only if needed later for purely relational data (user sessions, auth tables, audit log metadata). Not required at launch.

### 7.2 Full Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend + API + SSR | Vinext (App Router, Route Handlers, Server Components) | Next.js API surface on Vite, deploys to Cloudflare Workers |
| Graph Database | Neo4j 5 Community | Primary store for all graph data |
| Graph Driver | neo4j-driver-lite (Bolt over WebSocket) | ESM/browser build — Workers-native WebSocket transport. HTTP API fallback if WS fails |
| Graph Visualization | react-force-graph-2d | Interactive graph explorer (validated by br-acc's GraphCanvas pattern) |
| Rich Text Editor | TipTap | Investigation documents with graph node embeds |
| Auth | Auth.js (next-auth v5) + email/password + social login | Milestone 6; MFA required for Tier 2 and above |
| AI/LLM | Claude API | Async batch jobs only — never inline blocking calls |
| Maps | Leaflet (open-source) | Future — jurisdiction polygon visualization |
| Audit Log | S3 (versioned, Object Lock) | Append-only event log |
| Containerization | Docker Compose | Neo4j + Vinext dev environment |
| Hosting | Cloudflare Workers/Pages (frontend/SSR) + Railway or Fly.io (Neo4j) | Zero cold starts via Cloudflare edge |
| ISR Cache | Cloudflare KV | Incremental Static Regeneration for politician pages |
| Scraping | Como Voto pipeline (fork + extend) | Gold-tier data ingestion |

### 7.3 Service Architecture (Modular Monolith)

A single deployable application with three logical modules. Extract to services when scaling evidence justifies it.

```
+---------------------------------------------+
|              Vinext Application                |
|                                               |
|  +-------------+  +----------------------+   |
|  |    CORE      |  |     COMMUNITY        |   |
|  |              |  |                      |   |
|  | Graph CRUD   |  | Coalitions           |   |
|  | Ingestion    |  | Investigations       |   |
|  | Politician   |  | Endorsements         |   |
|  |  profiles    |  | Reputation           |   |
|  | Provenance   |  | Node/edge CRUD       |   |
|  +-------------+  +----------------------+   |
|                                               |
|  +-----------------------------------------+  |
|  |              ANALYSIS                   |  |
|  |                                         |  |
|  |  Graph explorer   Query builder         |  |
|  |  AI batch jobs     Export / reports      |  |
|  +-----------------------------------------+  |
+---------------------------------------------+
              |
         Neo4j 5 Community
         + S3 audit log
```

### 7.4 Key Data Schemas

```typescript
// Every node in the graph
interface ProvenanceRecord {
  source_url: string
  submitted_by: string       // user_id
  submitted_at: Date
  tier: 'gold' | 'silver' | 'bronze'
  confidence_score: number   // 0-1
  ingestion_hash: string     // SHA-256 of canonical input
}

// Versioned node base
interface VersionedNode {
  id: string
  version: number
  previous_version_id: string | null
  updated_at: Date
  provenance: ProvenanceRecord
}

// Claim (generalized Finding)
interface Claim extends VersionedNode {
  subject_id: string          // e.g., LegislativeVote id
  subject_type: NodeType
  claim_about_id: string      // e.g., Promise id
  claim_about_type: NodeType
  claim_type: 'fulfills' | 'breaks' | 'partially_fulfills' | 'aligns_with' | 'conflicts_with'
  text: string
  status: 'pending' | 'endorsed' | 'disputed'
  endorsement_count: number
  evidence_ids: string[]
}

// Investigation
interface Investigation extends VersionedNode {
  title: string
  body: string                // Rich text (TipTap JSON or HTML)
  status: 'draft' | 'published' | 'archived'
  author_ids: string[]
  coalition_id: string | null
  tags: string[]
  referenced_node_ids: string[]  // All nodes referenced/embedded
  endorsement_count: number
}

// Graph Edge (user-created)
interface GraphEdge {
  id: string
  from_id: string
  from_type: NodeType
  to_id: string
  to_type: NodeType
  relationship_type: string   // e.g., FUNDED, LED_TO, RELATED_TO
  properties: Record<string, unknown>
  provenance: ProvenanceRecord
  endorsement_count: number
}
```

### 7.5 AI Integration Rules

LLMs are used for two tasks: promise extraction from speeches and document summarization for investigations. Rules that apply to both:

1. **Never authoritative.** All LLM outputs create a `pending` Claim, never a published fact.
2. **Always labeled.** Every AI-generated content carries a "Analisis preliminar IA — requiere revision humana" badge.
3. **Deterministic.** Temperature = 0, structured JSON output with Zod validation, results cached by input hash.
4. **Auditable.** Every LLM call logs: model version, input text, raw output, extracted result, and the user/event that triggered it.
5. **Degradable.** If Claude API is unavailable, ingestion falls back to manual entry — AI is an accelerator, not a dependency.
6. **Prompt injection defense.** PDFs are rendered to image -> OCR before passing text to the LLM. No raw PDF text extraction.

---

## 8. User Roles & Permissions

### 8.1 Platform Roles

| Role | Who | Capabilities |
|------|-----|-------------|
| `observador` | Unauthenticated / unverified | View all public data, no writes |
| `participante` | Email + phone verified | Add nodes/edges, create investigations, join coalitions, endorse claims |
| `verificado` | DNI/CUIL verified (Phase 2) | Higher endorsement weight, create coalitions, all participante capabilities |
| `politico_verificado` | Identity verified politician | Respond to claims, post rebuttals on profile, add nodes/edges (marked as politician-sourced) |
| `moderador` | Platform staff | Flag/hide content pending review, handle legal takedowns |
| `admin` | Platform operators | Full access, user management, data corrections |

### 8.2 Coalition Roles

| Role | Capabilities |
|------|-------------|
| `viewer` | View coalition workspace, saved queries, and investigations |
| `editor` | Create/edit investigations, endorse claims on behalf of coalition, add nodes/edges to shared workspace |
| `admin` | Manage membership, configure coalition settings, publish official reports |

### 8.3 Permission Rules

- Coalition Admins can only manage their own coalition
- No single user can endorse their own claim submissions (endorsement requires a different user)
- Admin actions (data deletion, user bans) require two-admin approval + audit log entry
- Politicians can only respond to claims about themselves

---

## 9. User Flows

### 9.1 Critical Flows (MVP)

**New user onboarding:**
1. Land on public page -> see politician profiles and graph without registering
2. "Participar" CTA -> email + phone verification
3. Select focus interests (tags) -> shown relevant coalitions and active investigations
4. Transparency consent: explicit acknowledgment that contributions and endorsements are public

**Politician profile creation (seeded data):**
1. Automated ingestion from Como Voto pipeline creates profiles for all 257 Diputados + 72 Senadores
2. Admin reviews and publishes batch
3. Politician can claim account via verified email domain or official credential upload

**Adding nodes and edges:**
1. User clicks "Add to graph" from any context (explorer, profile, investigation)
2. Selects node type (Person, Organization, Event, Document, Location, Claim)
3. Fills in properties + source URL
4. Node appears in graph immediately as Bronze-tier
5. Other users can endorse or dispute the node
6. User draws edges between existing nodes with a relationship type and optional properties

**Creating an investigation:**
1. User creates new investigation (solo or within a coalition)
2. Explores graph, clicks "Add to investigation" on relevant nodes
3. Writes narrative in rich text editor with embedded graph references
4. Previews — embedded nodes render as interactive cards
5. Publishes — investigation appears in public feed and is linked to all referenced nodes
6. Other users discover the investigation from any node it references

**Endorsing a claim or edge:**
1. User views a claim or user-added edge in the graph
2. Reviews the source URL and evidence
3. Clicks "Endorse" — their endorsement is public with their verification tier
4. Endorsement count increases, surfacing the claim to more users

**Coalition creation:**
1. Verified user creates coalition with name, description, focus tags
2. Configures: open join or invite-only
3. Invites initial members
4. Members begin co-editing investigations and endorsing claims as a group

### 9.2 Data Correction Flow

1. Any verified user can flag a node or edge as "Posible error"
2. Flag creates a review task for Moderators
3. Moderator reviews with original source
4. If error confirmed: creates corrected version (versioned — original preserved in audit log)
5. Correcting party and reason are displayed in "Ver historial"

### 9.3 Content Moderation Flow

1. Any user can flag content as: spam / desinformacion / acoso / contenido ilegal
2. Flags queue to Moderators (reviewed within 48h SLA)
3. Moderator can: dismiss / hide pending review / remove + notify user / escalate to Admin
4. Removed content preserved in audit log (not deleted, just not displayed)
5. User can appeal to Admin within 30 days

---

## 10. Legal & Safety Framework (Argentina)

### 10.1 Argentine Legal Context

- **Ley de Acceso a la Informacion Publica (Ley 27.275)**: Government data used is already public record
- **Constitucion Nacional Art. 14 / 32**: Freedom of press and opinion protects community assessments framed as opinion
- **Codigo Civil y Comercial Art. 1770**: Defamation protection — the platform must never assert facts it cannot prove
- **PDPA equivalent**: Argentina has Ley 25.326 (Proteccion de Datos Personales) — all user PII must be treated accordingly

### 10.2 Framing Rules (enforced by design)

The platform **never** automatically labels a politician as corrupt, guilty, or dishonest. It:
- Presents factual data (votes, donor amounts, budget figures) from cited official sources
- Shows community claims framed explicitly as "community assessment" with visible sourcing
- Labels all user-contributed content with provenance tier and endorsement count
- Provides a prominent rebuttal field on every politician profile
- Every claim includes a disclaimer: "Este es un analisis comunitario basado en datos publicos, no una determinacion legal"

### 10.3 Content Policy

- No personal attacks on private individuals (family members, staff)
- Political figures are public figures for purposes of their public duties — their public actions are fair game
- Allegations of criminal conduct are not permitted — only factual patterns ("recibio donacion de X, voto favorable a X")
- Mandatory source citation on all Bronze-tier submissions
- DMCA / Argentine equivalent takedown process defined before launch

### 10.4 Politician Right to Response

Any politician with a verified account has:
- A permanent response field displayed prominently alongside each claim
- The right to submit counter-evidence (Bronze-tier, subject to community endorsement)
- A formal dispute channel to flag alleged factual errors (goes to Moderation queue)

---

## 11. Milestone Roadmap

**Critical path:** M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8

**North star:** A governance system where citizens use the Investigation Engine to produce evidence that feeds democratic accountability mechanisms (liquid democracy, citizen mandates, accountability scoring).

```
M0 Baseline ──→ M1 Data ──→ M2 Graph ──→ M3 Engine Core ──→ M4 Engine Analysis ──→ M5 Engine UI ──→ M6 Community ──→ M7 Advanced ──→ M8 Governance
   (exists)      Foundation    Engine       Foundation         Connectors &           Webapp          Platform         Platform        System
                                                               Analysis
```

### M0: Current State (Baseline)

What exists today. All subsequent milestones build on or migrate from this.

| Component | Location | Description |
|-----------|----------|-------------|
| Neo4j schema | `webapp/src/lib/neo4j/schema.ts` | Constraints/indexes for Epstein investigation node types |
| Caso Epstein data | Neo4j (10,864+ nodes) | Person, Organization, Location, Document, Event, LegalCase, Flight |
| Ingestion scripts | `webapp/scripts/ingest-wave-*.ts` | Multi-source ingestion with wave-based processing |
| Dedup module | `webapp/src/lib/ingestion/dedup.ts` | Levenshtein-based, `caso_slug` namespaced |
| Quality/conflict resolution | `webapp/src/lib/ingestion/quality.ts` | Conflict detection and resolution |
| Graph algorithms | `webapp/src/lib/graph/algorithms.ts` | Basic implementations |
| MiroFish client | `webapp/src/lib/mirofish/client.ts` | LLM swarm simulation via llama.cpp/Qwen |
| MiroFish seed export | `webapp/src/lib/mirofish/export.ts` | Graph-to-simulation seed conversion |
| Webapp | `webapp/src/app/` | Caso pages, graph explorer (react-force-graph-2d), simulation panel |
| Dev environment | `docker-compose.yml` | Neo4j + app containers |

### M1: Data Foundation

**Goal:** Populate the graph with all Argentine congressional data as Gold-tier seed.

**Depends on:** M0 (Neo4j schema, ingestion patterns)
**Extends from baseline:** Neo4j schema (add political node types), ingestion scripts (generalize from Epstein to Como Voto format)

| Deliverable | Difficulty |
|-------------|-----------|
| Como Voto ingestion pipeline (seed 257 Diputados + 72 Senadores + full vote history) | Medium |
| Schema mapping: Como Voto output → platform node types (Politician, LegislativeVote, Legislation, Jurisdiction) | Medium |
| Provenance system on all nodes (source_url, submitted_by, tier, confidence_score, ingestion_hash) | Medium |
| Data tier enforcement (Gold/Silver/Bronze) | Medium |
| Automated sync pipeline from HCDN/Senado APIs | Medium |

### M2: Graph Engine

**Goal:** Interactive graph exploration of the seeded political data.

**Depends on:** M1 (populated graph with political data)
**Extends from baseline:** react-force-graph-2d explorer (generalize from Epstein to political data), caso page layout

| Deliverable | Difficulty |
|-------------|-----------|
| Visual explorer — drag, zoom, filter, expand, save views, path highlighting, color coding | Hard |
| Basic query builder — filter by type/date/jurisdiction, path between two nodes | Medium-Hard |
| Politician profile pages (graph-rendered: votes, promises, donors, connections) | Medium |
| Promise tracker (side-by-side view with claim status state machine) | Medium |
| Money flow visualizer (Donor → Politician → Vote sub-graph) | Medium |
| Node/edge CRUD (add nodes, draw edges, attach sources) | Medium |

### M3: Investigation Engine — Foundation

**Goal:** Core engine skeleton — config in Neo4j, LLM abstraction, pipeline that runs stages and stops at gates.

**Depends on:** M0 (Neo4j, existing schema patterns, dedup module)
**Extends from baseline:** `schema.ts` (add engine constraints/indexes), `dedup.ts` and `quality.ts` (reused directly by engine)

See `docs/superpowers/specs/2026-03-20-investigation-engine-design.md` for full specification.
See `docs/superpowers/plans/2026-03-20-investigation-engine-implementation.md` for implementation task breakdown.

| Deliverable | Difficulty |
|-------------|-----------|
| Neo4j config schema (InvestigationConfig, SchemaDefinition, NodeTypeDefinition, RelTypeDefinition, SourceConnector, PipelineConfig, PipelineStage, Gate, PipelineState, Proposal, AuditEntry, Snapshot) | Medium |
| CRUD operations for all config nodes | Medium |
| Zod schemas + TypeScript interfaces for all config types | Medium |
| LLM provider interface + llama.cpp adapter (Qwen `reasoning_content` → `reasoning` mapping) | Medium |
| Pipeline stage runner — reads config from Neo4j, executes in order | Hard |
| Gate mechanism — writes `gate_pending` state, reads decisions from Neo4j | Medium |
| Proposal system — create/read/update Proposal nodes, batch review | Medium |
| AuditEntry system — append-only, SHA-256 hash chain, chain validation on startup | Medium |
| PipelineState persistence — current stage, progress, resume points | Medium |
| Dynamic UNIQUE constraint creation for new node types via `IF NOT EXISTS` | Easy |

### M4: Investigation Engine — Connectors & Analysis

**Goal:** All pipeline stages functional — ingest through report, with graph algorithms and MiroFish swarm mode.

**Depends on:** M3 (config schema, pipeline runner, LLM abstraction, proposal system)
**Extends from baseline:** `algorithms.ts` (add centrality, community detection, anomaly, temporal), `mirofish/client.ts` (add endpoint param), `mirofish/export.ts` (generalize node type params), `dedup.ts` (reused by connectors)

| Deliverable | Difficulty |
|-------------|-----------|
| Source connector interface + implementations: REST API, file upload, custom script | Hard |
| Two-pass dedup (source-level + pipeline-level cross-source) | Medium |
| Stage implementations: ingest, verify, enrich, analyze, report | Hard |
| Parallel agent dispatch per stage config | Medium-Hard |
| Graph algorithms: degree centrality, betweenness centrality (BFS approx), community detection (label propagation), anomaly detection, temporal patterns | Medium-Hard |
| MiroFish client refactor — `endpoint` parameter on public functions | Easy |
| `graphToMiroFishSeed()` generalization — reads `agent_source`/`context_from` from config | Medium |
| OpenAI + Anthropic LLM provider adapters | Medium |

### M5: Investigation Engine — Webapp UI

**Goal:** Researchers interact with the engine entirely through the browser.

**Depends on:** M4 (all stages functional, connectors working)
**Extends from baseline:** caso page layout (investigation dashboard pattern), graph explorer (add provenance display), simulation panel (read model config from investigation)

| Deliverable | Difficulty |
|-------------|-----------|
| Investigation library (`/investigaciones`) — list, filter, status badges | Medium |
| Create wizard (`/investigaciones/new`) — template picker, schema editor, source config, pipeline config | Hard |
| Investigation dashboard (`/investigaciones/[id]`) — status, progress, stats, audit stream | Hard |
| Gate review UI (`/investigaciones/[id]/gate/[stageId]`) — proposal cards, approve/reject, rationale | Medium-Hard |
| Schema editor, source config, pipeline config pages | Medium |
| Audit log viewer — filterable, searchable | Medium |
| Snapshot management — list, create, restore | Medium |
| Fork/branch UI — fork, branch tree, merge | Medium-Hard |
| Template system — 4 built-in templates (public-accountability, corporate-osint, land-ownership, blank), JSON export/import | Medium |
| Cycle mode — scheduled re-runs with gate blocking | Medium |
| Graph explorer becomes investigation-aware (pipeline stage provenance) | Medium |

### M6: Community Platform

**Goal:** Multi-user platform where citizens participate — add to the graph, write investigations, form coalitions, endorse claims.

**Depends on:** M2 (graph engine, profiles, explorer), M5 (investigation engine UI — so investigations can be manual OR engine-driven)
**Extends from baseline:** graph explorer (add user auth context, permission checks), investigation pages (add TipTap editor, collaboration)

| Deliverable | Difficulty |
|-------------|-----------|
| Auth system (Auth.js + email/password + social login) | Medium |
| Verification tiers: Tier 0 (Observador), Tier 1 (Participante — email+phone) | Medium |
| Reputation system — contribution-based scoring, decay for inactivity | Medium-Hard |
| Manual investigation workflow — rich text editor (TipTap) with graph node embeds, draft/publish/archive | Hard |
| Endorsement system — endorse claims, edges, investigations; public with verification tier | Medium |
| Claim pattern — users create Claims asserting vote-promise relationships, others endorse/dispute | Medium |
| Coalition creation — focus tags, open/invite-only, Admin/Editor/Viewer roles | Medium |
| Coalition workspaces — shared investigations, saved graph queries, coalition endorsements | Medium-Hard |
| Node/edge CRUD for authenticated users — Bronze-tier with source URL | Medium |
| Permission model — all platform and coalition roles enforced | Medium |
| Public audit trail — "Ver historial" on any node | Medium-Hard |
| Content moderation — flag → queue → moderator action | Medium |
| Data correction flow — flag errors, moderator review, versioned corrections | Medium |
| Politician right to response — verified account rebuttals on claims | Medium |
| Transparency consent on signup | Easy |

### M7: Advanced Platform

**Goal:** Deepen graph experience, enrich AI tools, expand data coverage and identity verification.

**Depends on:** M6 (community platform, verification tiers, coalitions)
**Extends from baseline:** Como Voto pipeline (automate), graph algorithms (feed AI suggestions)

| Deliverable | Difficulty |
|-------------|-----------|
| Advanced graph queries — multi-hop, sub-graph extraction, complex filters | Hard |
| Rich investigation editor — inline interactive sub-graphs in documents | Hard |
| AI-assisted investigation tools — auto-suggest related nodes, document summarization | Medium-Hard |
| AI-assisted promise extraction from speeches | Medium |
| DNI/CUIL identity verification (Tier 2 — Verificado) via AFIP/Renaper API | Medium |
| Politician verified accounts (Tier 3 — Politico verificado) | Medium |
| Automated HCDN/Senado scraping pipeline (fork/extend Como Voto) | Medium |
| Map-based jurisdiction visualization (Leaflet) | Medium |
| Coalition analytics — reputation tracking, activity metrics | Medium |
| Coalition-endorsed investigation export — PDF reports, share cards | Medium |
| Public API for journalists, researchers, external tools | Medium |
| ISR cache via Cloudflare KV for politician pages | Medium |

### M8: Governance System

**Goal:** The north star — citizens use investigation evidence to drive structured accountability through democratic mechanisms.

**Depends on:** M7 (advanced platform, verified identities, coalition analytics), M5 (investigation engine — evidence pipeline feeds governance decisions)

| Deliverable | Difficulty |
|-------------|-----------|
| Accountability scoring — A/B/C/D per politician per issue, derived from graph data (promises kept/broken, voting record, donor conflicts) | Hard |
| Liquid democracy — delegate endorsement weight to trusted users, public and revocable | Hard |
| Quadratic voting — coalition resource allocation, prevents wealthy-member dominance | Medium-Hard |
| Holographic consensus — only contested decisions go to full coalition vote | Medium-Hard |
| Citizen mandates — community proposals that clear consensus become formal civic demands linked to politician scorecards | Hard |
| Dual-track consensus — expert-weighted feasibility + community preference tracks | Medium-Hard |
| Proactive problem solving (Civic R&D) — structured problem → proposal → mandate pipeline | Hard |
| Prediction markets — stress-test claims against real-world outcomes | Hard |
| Sybil resistance — graph-based detection, IP/device clustering, vote correlation anomaly detection | Hard |
| Cross-coalition dispute resolution — randomly selected jury from non-involved coalitions | Medium-Hard |
| Expertise verification — peer-vouched badges for domain-specific endorsement weighting | Medium |
| Coalition health score — geographic diversity, endorsement accuracy, activity patterns | Medium |

### Scale (beyond M8)

- Province-level coverage (legislature data beyond Congress)
- Neo4j clustering / sharding if single instance becomes insufficient
- Transparency report + open-source scoring algorithm
- International expansion framework

---

## 12. Key Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Graph data quality (low-quality user contributions)** | Critical | Tiered trust model; provenance on every record; endorsement signals quality; Bronze-tier content requires endorsement for high visibility |
| **Investigation integrity (misleading narratives)** | Critical | All claims must cite graph data; endorsement model surfaces credible investigations; multiple perspectives preserved |
| **Cold start (empty user-contributed graph)** | High | Como Voto integration seeds full Congress at launch; invite initial coalition anchors before public launch; pre-build investigation templates |
| **Legal challenge (defamation)** | Critical | Opinion-framed labels only; mandatory citations; right to rebuttal; Argentine legal counsel retained pre-launch |
| **AI prompt injection via PDFs** | High | PDF -> image -> OCR pipeline; output schema validation; human review required before publication |
| **Graph visualization performance** | High | Lazy loading of graph neighborhoods; limit initial render to 2-3 hops; server-side pre-computation of common views |
| **Schema abuse (nonsense nodes/edges)** | Medium | Moderation queue for flagged content; reputation loss for removed contributions; rate limits on node creation |
| **Public contributions chill participation** | Medium | Users explicitly consent on signup; framing: transparency is a feature and a defense against manipulation |
| **Key person risk** | Medium | Open-source codebase; documented operational procedures; bus-factor-resistant credential management |
| **Graph query complexity** | Medium | Neo4j native graph traversals; Cypher query optimization; monitor with Neo4j Browser and EXPLAIN/PROFILE |

---

## 13. Open Questions

1. **Monetization**: Coalition premium features (advanced analytics, priority support), grants (Wikimedia, Open Society, NED), or fully free/donation-based?
2. **Politician participation**: Active outreach to legislators to claim verified accounts and engage with the platform?
3. **Data partnerships**: Formal agreement with Como Voto author (rquiroga7) and/or Chequeado, Poder Ciudadano, Fundar?
4. **Graph visualization library**: Decided — react-force-graph-2d (validated by br-acc at scale). Evaluate 3D variant later if needed.
5. **Initial coalition seeding**: Which 2-3 well-known Argentine civil society orgs to onboard as anchor coalitions at launch?
6. **Investigation discoverability**: How to surface high-quality investigations without creating popularity bias? Chronological feed, endorsement-weighted, editorial picks, or algorithm?
7. **Open schema limits**: How open should the node/edge schema be? Fully open risks noise; too constrained limits user expression. Start with core types + "Other" with free-form properties?

---

## 14. Future Vision

Governance, accountability scoring, and platform integrity features are now tracked as **M8: Governance System** in Section 11. Scale ambitions (province-level coverage, international expansion) are listed under **Scale (beyond M8)** in the same section.

---

## 15. Glossary

| Term | Definition |
|------|-----------|
| **Claim** | An assertion about a relationship in the graph (e.g., "This vote breaks this promise") — submitted by users, endorsed by other users and coalitions. Generalized form of a Finding |
| **Investigation** | A long-form document that references and embeds graph nodes and sub-graphs as evidence. The primary user-created content type |
| **Coalition** | User-organized collaboration group that shares investigation workspaces, graph views, and collective endorsements |
| **Endorsement** | A public signal of agreement with a claim, edge, or investigation. Carries the endorser's verification tier and reputation |
| **Tiered Trust** | Gold (official APIs) / Silver (reputable press) / Bronze (user submissions) — determines default confidence and visibility |
| **Graph Explorer** | The interactive visual interface for browsing the knowledge graph — click, drag, zoom, filter, expand connections |
| **Query Builder** | Structured interface for running queries against the graph (e.g., "paths between Donor X and Legislation Y within 3 hops") |
| **Open Schema** | The principle that users can create any node type and draw any edge type, extending the graph beyond seeded political data |
| **Provenance** | The metadata attached to every node and edge: who added it, when, source URL, tier, confidence score |
| **Como Voto** | Open-source Argentine voting tracker (rquiroga7/Como_voto) used as the Gold-tier data source for legislative votes |
| **Node** | Any entity in the knowledge graph: a politician, vote, organization, event, document, claim, or investigation |
| **Edge** | A typed relationship between two nodes: FUNDED, CAST_LEGISLATIVE_VOTE, REFERENCES, LED_TO, etc. |

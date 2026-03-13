# Product Requirements Document: Office of Accountability

**Version:** 0.2
**Date:** 2026-03-13
**Status:** Pre-Development
**Scope:** Argentina (federal + provincial, congress-first)

---

## 1. Problem Statement

Argentine citizens have no unified, queryable public record that connects what politicians *promise*, how they *vote*, who *funds* them, and what *community mandates* they are ignoring. Existing tools (e.g., Como Votó, HVN) cover individual dimensions in isolation. No platform closes the loop: community-identified problems → proposed solutions → mandates → politician accountability.

The result: accountability is fragmented, context is absent, and citizens have no coordinated mechanism to move from *observation* to *action*.

---

## 2. Vision & Core Loop

The **Office of Accountability** is a civic action platform built as a knowledge graph for Argentine politics. It links politicians, votes, legislation, donors, community promises, and citizen mandates into a single queryable system.

The platform closes four loops:

1. **Observe** — Track what politicians promise and how they vote
2. **Organize** — Form issue-based coalitions that verify and endorse findings
3. **Act** — Research, propose, and reach consensus on community solutions
4. **Hold Accountable** — Score politicians against community mandates with contextual fairness

**Design contract with users:** This is an opt-in transparency platform. All votes, delegations, and coalition activities are public by default. Transparency is a feature, not a bug — public records enable community auditing of the platform itself and prevent coordinated manipulation.

---

## 3. Core Principles

| Principle | Description |
|-----------|-------------|
| **Contextual Fairness** | Accountability is never binary. Constraints (budget, legal, physical capacity) are auditable data points, not accepted excuses. |
| **Transparent Provenance** | Every node and edge in the graph carries: source URL, submission date, submitter, tier, and confidence score. |
| **Trust via Skin-in-the-Game** | Consensus mechanisms require users to stake reputation, not just cast votes. |
| **Plural Truth** | When coalitions disagree, the system shows both interpretations with clear sourcing rather than forcing a single narrative. |
| **Closed Accountability Loop** | Community-generated solutions become mandates that bind politician scorecards. |
| **Full Public Transparency** | All user votes, delegations, and coalition activities are public. Users consent to this on signup. This enables external auditing of the platform's own integrity. |
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
| `LegislativeVote` | acta_id, date, position (afirmativo/negativo/abstención/ausente), chamber | Official vote record — sourced from HCDN/Senado APIs |
| `Legislation` | title, text_url, status, tags, expediente_id, chamber | Bill or law — sourced from HCDN/Senado |
| `Donor` | name, type (individual/empresa/sindicato/pac) | Campaign finance contributor |
| `Coalition` | name, focus_tags, reputation_score, created_at | User-organized accountability group |
| `Problem` | location, jurisdiction_id, description, severity, status | Community-reported civic issue |
| `Proposal` | title, description, cost_estimate, technical_risk, status | Community-drafted solution to a Problem |
| `Evidence` | type, url, summary, uploaded_by | Data, studies, PDFs, expert analysis |
| `Mandate` | title, threshold_met_at, required_legislation_tags, status | Proposal that reached community consensus |
| `Constraint` | type (presupuestario/legal/físico/jurisdiccional), severity, verified_status | Claimed limitation submitted by politician or community |
| `Finding` | claim_type, description, status | Reified assertion about a relationship (used for coalition endorsements) — see section 4.2 |

### 4.2 Edge Types (Relationships)

**Politician activity:**

| Edge | From → To | Properties |
|------|-----------|-----------|
| `REPRESENTS` | Politician → Jurisdiction | chamber, period |
| `MADE_PROMISE` | Politician → Promise | date, source_url |
| `CAST_LEGISLATIVE_VOTE` | Politician → LegislativeVote | — |
| `ON` | LegislativeVote → Legislation | — |
| `DONATED_TO` | Donor → Politician | amount, date, cycle |
| `CLAIMS_CONSTRAINT` | Politician → Constraint | date, source_url |
| `MADE_ATTEMPT` | Politician → Proposal | outcome (blocked/approved), blocked_by_id |
| `SIGNED_MANDATE` | Politician → Mandate | date |

**Accountability relationships (endorsable via Findings):**

| Edge | From → To | Properties |
|------|-----------|-----------|
| `RELATES_TO` | LegislativeVote → Promise | finding_id (via Finding node) |
| `ALIGNS_WITH` | Mandate → Legislation | match_score, finding_id |

**Finding pattern (replaces edge-on-edge anti-pattern):**

```
(LegislativeVote) -[:SUBJECT_OF]-> (Finding) -[:CLAIM_ABOUT]-> (Promise)
(Coalition)       -[:ENDORSED]->   (Finding)
(User)            -[:SUBMITTED]->  (Finding)
(Evidence)        -[:SUPPORTS]->   (Finding)
(Evidence)        -[:CONTRADICTS]-> (Finding)
```

`Finding` node properties: `claim_type` (fulfills/breaks/partially_fulfills), `description`, `status` (pending/endorsed/disputed/rejected), `confidence_score`

**Community action:**

| Edge | From → To | Properties |
|------|-----------|-----------|
| `MEMBER_OF` | User → Coalition | role (admin/verifier/member), joined_at |
| `FOLLOWS` | User → Coalition | followed_at |
| `DELEGATES_TO` | User → User | scope (coalition_id or global), revoked_at |
| `CAST_PLATFORM_VOTE` | User → Proposal/Finding/Constraint | weight, rationale |
| `PROPOSES` | Coalition → Proposal | date |
| `AUDITS` | Coalition → Constraint | verdict (válido/exagerado/falso), evidence_ids, endorsed_by_count |
| `ADDRESSES` | Proposal → Problem | coverage_score |
| `MEMBER_OF` | Politician → Jurisdiction | — |

**Trust:**

| Edge | From → To | Properties |
|------|-----------|-----------|
| `SUBMITTED` | User → Evidence/Problem/Proposal/Finding | date |
| `ENDORSED` | Coalition → Finding | confidence, threshold_met_at |

---

## 5. Feature Areas

### 5.1 Data Foundation (Gold-Tier: Como Votó Integration)

The [Como Votó](https://github.com/rquiroga7/Como_voto) project already provides:
- Full voting records for Cámara de Diputados (HCDN) and Senado from official APIs
- Legislator names, blocs, provinces, coalition classification (~600+ parties → PJ/PRO/LLA/OTROS)
- Daily automated updates via GitHub Actions
- Legislator photos (official sources + Wikipedia/Wikidata fallbacks)
- Election data 1983–2023

**Integration strategy:** Ingest Como Votó's output JSON as the initial Gold-tier seed. Maintain a live sync pipeline from the same HCDN/Senado sources. This gives the platform a fully populated graph at launch — every Diputado and Senador with their full vote history.

**Data format compatibility:**
```
Como Votó output → normalize to platform schema:
  legislator.name         → Politician.name
  legislator.bloc         → Politician.bloc
  legislator.province     → Politician.jurisdiction (→ Jurisdiction node)
  legislator.coalition    → Politician.coalition
  votacion.acta_id        → LegislativeVote.acta_id
  votacion.title          → Legislation.title
  votacion.date           → LegislativeVote.date
  vote_code (1-5)         → LegislativeVote.position
```

**Data Tiers:**

| Tier | Source | Handling |
|------|--------|---------|
| Gold | Official HCDN/Senado APIs (via Como Votó pipeline) | Auto-accepted, hashed on ingestion |
| Silver | Reputable Argentine sources (Infobae, La Nación, Clarín, Chequeado) | Auto-accepted with mandatory citation |
| Bronze | User/Coalition submissions | Requires community verification before publication |

**Provenance requirements:** Every node and edge carries `source_url`, `submitted_by`, `submitted_at`, `tier`, `confidence_score`, `ingestion_hash`. Every state change is append-only in the audit log.

---

### 5.2 Accountability Graph (Core)

**Politician Profile**

Each profile shows:
- Chamber, bloc, coalition (PJ/PRO/LLA/OTROS), province/jurisdiction
- Vote history (all `LegislativeVote` records, searchable and filterable)
- Promise list with fulfillment status per promise
- Donor relationships (amount, date, cycle)
- Constraint claims with audit verdicts
- Accountability score (see below)
- Community Findings (endorsed by coalitions)
- Response field: any politician with a verified account can post rebuttals displayed prominently alongside findings

**Promise Tracker**

Side-by-side view: "What they said" → "How they voted"

Promise `status` state machine:
```
AI-extracted:   EXTRACTED → VERIFIED → TRACKED → { CUMPLIDA | INCUMPLIDA | PARCIALMENTE | VENCIDA | REEMPLAZADA }
User-submitted: SUBMITTED → VERIFIED → TRACKED → { CUMPLIDA | INCUMPLIDA | PARCIALMENTE | VENCIDA | REEMPLAZADA }
```

- `EXTRACTED`: AI-parsed from speech/manifesto — requires human verification before advancing
- `SUBMITTED`: User-submitted with source URL — enters verification queue directly
- `VERIFIED`: Confirmed by ≥3 coalition Verifiers as accurate and attributable
- `TRACKED`: Actively monitored against legislative votes
- Terminal states: `CUMPLIDA` (fulfilled), `INCUMPLIDA` (broken), `PARCIALMENTE` (partially fulfilled), `VENCIDA` (expired/no longer relevant), `REEMPLAZADA` (superseded by newer commitment)

Each transition requires: actor (user/coalition/system), evidence node, timestamp.

**User-facing display labels:**
- `TRACKED` → "En seguimiento"
- `CUMPLIDA` → "Cumplida"
- `INCUMPLIDA` → "Incumplida"
- `PARCIALMENTE` → "Parcialmente cumplida"
- `VENCIDA` → "Vencida"
- `REEMPLAZADA` → "Reemplazada"

**Money Flow Visualizer**

Interactive graph: Donor → Politician → Committee → LegislativeVote. Highlights patterns between contributions and voting alignment. Framed as factual data presentation — no automated correlation labels. Community Findings (submitted and endorsed by coalitions) provide the interpretive layer.

**Accountability Score**

Each `Politician ↔ Problem` pair generates a contextual score. Score depends on: (1) was there a Mandate? (2) did the politician sign/support it? (3) were their claimed constraints audited?

| Grade | Label | Condition |
|-------|-------|-----------|
| A | Proactivo | Supported Community Mandate AND verified constraints were real OR no real constraints existed |
| B | Condicionado | Tried to support Mandate but verified constraints blocked action |
| C | Negligente | Ignored Mandate AND claimed constraints were audited as weak or false |
| D | Obstructivo | Actively blocked solutions AND claimed constraints were audited as false |
| — | Sin mandato | No community Mandate exists yet for this problem — score is withheld |
| — | Pendiente | Constraint audit in progress — score shown with "under review" badge |

**Important:** A/B/C/D scores are only displayed when the minimum inputs exist (a Mandate + either a constraint audit verdict or no constraint claim). When inputs are missing, the profile shows data and status rather than a premature score. This prevents empty or misleading grades.

**Query Builder**

Advanced search across the graph:
- "Diputados que reclamaron restricción presupuestaria y votaron a favor de baja de impuestos"
- "Senadores cuyos donantes tienen intereses en el sector minero y votaron X en ley Y"
- "Mandatos con más del 70% de endorsement que ningún legislador firmó"

---

### 5.3 Coalitions

Coalitions are dynamic, issue-based collectives — not parties. Membership is earned through verified contribution.

**Capabilities**
- Create with focus tags (`#inundaciones`, `#córdoba`, `#anticorrupción`)
- Roles: `Admin`, `Verifier`, `Member`
- Open join or invite-only (Admin configures)
- Collectively propose and endorse Findings
- Stake reputation on verification verdicts
- Pool resources (crowdfund FOIA requests, legal analysis)
- Subscribe to graph alerts (e.g., "cuando Legislador X vote sobre algo etiquetado #medioambiente")
- Export coalition-endorsed findings as PDF reports and share cards

**Coalition Governance (progressive rollout)**

| Mechanism | When Active | Description |
|-----------|------------|-------------|
| Simple majority | Phase 1 | Basic yes/no vote on Findings and Proposals |
| Liquid Democracy | Phase 2 | Delegate vote to trusted member; public and revocable |
| Quadratic Voting | Phase 2 | For resource allocation; prevents wealthy-member dominance |
| Holographic Consensus | Phase 3 | Only contested votes go to full coalition; routine approvals auto-pass |

**Cross-Coalition Dynamics**
- Inter-coalition dispute resolution for conflicting endorsements
- Formal alliance / co-endorsement between coalitions
- Forkable Findings: when coalitions disagree, both interpretations are displayed with sourcing

**Coalition Health Score**

Publicly visible metric to flag capture risk:
- Geographic diversity of members
- Voting correlation (flags coordinated/homogeneous behavior)
- Audit accuracy track record (did endorsed verdicts hold up?)
- Funding transparency (optional, declared by Admin)

---

### 5.4 Proactive Problem Solving (Civic R&D)

**Problem Submission**
- Form: title, jurisdiction, description, evidence links
- Auto-linked to electoral jurisdiction (Politician scope)
- Deduplication: if similar problem exists, suggest merging
- Problem status: `Abierto → Investigando → Con mandato → Resuelto → Archivado`

**Proposal Workspace**
- Coalition-scoped collaborative drafting space
- Rich text + evidence attachment (PDFs, external links)
- Time-boxed sprints (default 4 weeks) to prevent stagnation
- AI-assisted summaries of uploaded documents (labeled as AI summary)
- Versioned: every edit is saved with author + timestamp
- Proposal lifecycle: `Borrador → Abierto a comentarios → Votación → { Mandato | Rechazado | Archivado }`

**Dual-Track Consensus**

| Track | Mechanism | Goal |
|-------|-----------|------|
| Factibilidad | Expert-weighted vote (Phase 2: expertise tags) | Does the solution technically work? |
| Preferencia | Community vote (simple majority Phase 1, Quadratic Phase 2) | Does the community want this solution? |
| Predicción | Prediction markets (Phase 3) | Stress-test against real-world outcomes |

**Citizen Mandate**

When a proposal clears both tracks:
1. Creates a `Mandate` node — publicly visible
2. AI scans existing legislation for alignment matches (flagged for human review)
3. Politicians can formally "Sign" the mandate (creates a `Promise` node + `SIGNED_MANDATE` edge)
4. All subsequent `LegislativeVote` records on aligned legislation update the politician's accountability score

**Expertise Verification (Phase 2)**

Users can request an expertise badge:
- Peer-vouched within coalition (3 existing experts confirm)
- LinkedIn OAuth (job title/education parsing)
- Credentials document upload (reviewed by coalition admins)

Expertise tags: `ingeniero_civil`, `economista`, `abogado`, `hidrólogo`, `médico`, etc.

---

### 5.5 Constraint-Adjusted Accountability

**The Constraint Audit Workflow**

1. **Claim submitted**: Politician (or coalition on their behalf) submits a `Constraint` node with type, description, and evidence link. Status: `Sin verificar`.
2. **Audit triggered**: Any coalition tagged to the relevant jurisdiction or issue can open an audit. Minimum 5 Verifiers required. If no single coalition has 5, a cross-coalition pool can be formed from coalitions tagged to the same jurisdiction/issue.
3. **Evidence gathering**: Verifiers upload counter-evidence (budget reports, land registry, infrastructure data, official records). All evidence attached to the Constraint node.
4. **Vote**: Verifiers vote: `Válido` / `Exagerado` / `Falso`. Requires simple majority (Phase 1), expertise-weighted (Phase 2).
5. **Verdict published**: Coalition verdict displayed on politician profile under "Claims vs. Realidad". Verdict is itself a `Finding` — subject to dispute.

**What verdicts mean:**
- `Válido`: Constraint was real. Score adjusted in politician's favor.
- `Exagerado`: Constraint existed but was overstated. Partial adjustment.
- `Falso`: Constraint did not exist. Score penalized. If another constraint (Conflict of Interest pattern) is observed in the data, coalition submits a separate Finding — framed as opinion with cited evidence.

**Excuse Tracker (UI)**
- Dedicated section on politician profile: "Argumentos Presentados"
- Visual: Verified vs. Disputed vs. Pending constraints over time
- "Most contested claims" surfaced publicly

**AI Pre-Verification (Phase 2)**
- AI scans official budget PDFs to flag budget claims vs. actual allocations
- Alert to verifiers: "Legislador alega sin presupuesto, pero los datos del Ministerio de Economía muestran superávit en la categoría X"
- **All AI outputs labeled as preliminary** — require human verifier review before display
- Hidden constraint data (if source is unavailable): marked `No verificable` — treated as a negative signal, never neutral

**Example — Flooding Scenario (Río Cuarto, Córdoba)**

| Step | Event |
|------|-------|
| Problem | Inundaciones reportadas en Río Cuarto, zona X |
| Dato | Estación SMN + red de sensores: capacidad de desagüe al 98% (hard constraint — auto-ingested) |
| Coalición | Propone "Bombeo de emergencia" (corto plazo) + "Expansión de desagüe" (largo plazo) |
| Legislador | Vota a favor del bombeo ✅, en contra de la expansión. Alega "No hay terrenos disponibles" |
| Auditoría | Coalición consulta el catastro — hay terrenos, pero son propiedad de un donante |
| Veredicto | Constraint = `Falso` (conflicto de interés observado en los datos) |
| Score | Aprobado en emergencia, `Negligente` en solución estructural |
| Vista pública | "Gestionó la emergencia. Bloqueó la solución permanente. Ver relación con donante [link]" |

---

## 6. Consensus & Governance Architecture

### 6.1 Identity & Sybil Resistance

**Verification tiers (progressive):**

| Tier | Method | Capability |
|------|--------|-----------|
| 0 — Observador | Ninguna | Ver todo, sin votar |
| 1 — Participante | Email + teléfono verificado | Votar (peso limitado), unirse a coaliciones |
| 2 — Verificador | DNI / CUIL verification (via AFIP or Renaper API, Phase 2) | Votar con peso completo, ser Verifier en coalición |
| 3 — Experto | Peer-vouched expertise badge | Voto ponderado por expertise en dual-track |
| 4 — Político verificado | Cuenta oficial verificada | Responder a hallazgos, firmar mandatos |

**Anti-sybil measures:**
- Account age + minimum activity before voting eligibility
- Graph-based sybil detection: analyze creation patterns, IP/device clustering, vote correlation
- Rate limits on account creation per IP/phone range
- Anomaly alerts: sudden coordinated vote shifts trigger community review flag

### 6.2 Reputation System

- Non-transferable reputation points earned through: verified contributions, accurate audit verdicts, proposal approvals
- Audit accuracy track record: if a coalition endorses a Finding that is later overturned, members lose reputation
- Cold start: new users receive a base reputation sufficient to participate at Tier 1 level
- Reputation decay: inactive accounts lose weight gradually (prevents hoarding)
- Full formula published and auditable publicly

### 6.3 Anti-Capture Measures

- Minimum reputation to create a coalition
- Coalition health score (section 5.3) publicly visible
- All vote and delegation records are public — the community audits itself
- Inter-coalition dispute resolution: conflicting verdicts trigger a cross-coalition jury (randomly selected from non-involved coalitions)
- Findings require endorsement from ≥2 independent coalitions for highest visibility tier

### 6.4 Audit Log

Every state change (node creation, edge creation, vote cast, verdict published, score updated) is appended to an immutable audit log:
- Storage: versioned S3 with Object Lock (compliance mode) + MFA Delete
- Format: structured JSON events, no PII in the log (user IDs only, resolvable via the main DB)
- Hash chain: each event includes the hash of the previous event for tamper detection
- Publicly browsable via "Ver historial" on any node
- Note: Arweave deferred — incompatible with GDPR right to erasure for any user data

---

## 7. Technical Architecture

### 7.1 Database Strategy

**Primary recommendation: PostgreSQL-first**

The MVP graph (Politician → Vote → Legislation → Promise) involves 2-3 hop traversals. PostgreSQL handles this efficiently with:
- Recursive CTEs for path traversal
- JSONB for flexible node properties
- Foreign key relationships for most edges

**When to add Neo4j/Neptune:** When traversals regularly exceed 4+ hops across millions of nodes AND query complexity (e.g., "find all legislators connected to a donor network within 3 degrees") justifies the operational overhead of a second database. Re-evaluate at 500k+ nodes.

For now, PostgreSQL + Redis (Upstash for hosted) is the target stack.

### 7.2 Full Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend + API | Next.js (App Router, Route Handlers) | SSR for SEO; tRPC for type-safe client-server |
| Database | PostgreSQL | Primary store for all graph data + transactional data |
| Cache | Redis (Upstash) | Materialized politician scores, session cache, vote tallies |
| Auth | NextAuth.js + email/password + social login | MFA required for Verifier tier and above |
| AI/LLM | Claude API | Async batch jobs only — never inline blocking calls |
| Maps | Leaflet (open-source) | Phase 2 — jurisdiction polygon visualization |
| Audit Log | S3 (versioned, Object Lock) | Append-only event log |
| Hosting | Vercel (frontend) + Railway or Fly.io (backend services) | — |
| Scraping | Como Votó pipeline (fork + extend) | Gold-tier data ingestion |

### 7.3 Service Architecture (Modular Monolith)

A single deployable application with three logical modules. Extract to services when scaling evidence justifies it.

```
┌─────────────────────────────────────────────┐
│              Next.js Application              │
│                                               │
│  ┌─────────────┐  ┌──────────────────────┐   │
│  │    CORE      │  │     COMMUNITY        │   │
│  │              │  │                      │   │
│  │ Graph CRUD   │  │ Coalitions           │   │
│  │ Ingestion    │  │ Voting / Delegation  │   │
│  │ Politician   │  │ Reputation           │   │
│  │  profiles    │  │ Proposals            │   │
│  │ Provenance   │  │ Mandate creation     │   │
│  └─────────────┘  └──────────────────────┘   │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │              ANALYSIS                   │  │
│  │                                         │  │
│  │  Scoring engine   Constraint auditing   │  │
│  │  Query builder    AI batch jobs         │  │
│  │  Export / reports                       │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
         │                    │
    PostgreSQL              Redis
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
  confidence_score: number   // 0–1
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

// Finding (replaces edge-on-edge)
interface Finding extends VersionedNode {
  subject_id: string          // e.g., LegislativeVote id
  subject_type: NodeType
  claim_about_id: string      // e.g., Promise id
  claim_about_type: NodeType
  claim_type: 'fulfills' | 'breaks' | 'partially_fulfills' | 'aligns_with'
  description: string
  status: 'pending' | 'endorsed' | 'disputed' | 'rejected'
  endorsement_count: number
  evidence_ids: string[]
}

// Constraint
interface Constraint extends VersionedNode {
  type: 'presupuestario' | 'legal' | 'físico' | 'jurisdiccional'
  severity: number            // 0–1
  verified_status: 'sin_verificar' | 'válido' | 'exagerado' | 'falso' | 'no_verificable'
  claimed_by: string          // politician_id
  audit_coalition_id: string | null
  verdict_at: Date | null
}
```

### 7.5 AI Integration Rules

LLMs are used for three tasks: promise extraction from speeches, document summarization for proposal workspaces, and budget claim pre-verification. Rules that apply to all three:

1. **Never authoritative.** All LLM outputs create a `pending_review` Finding, never a published fact.
2. **Always labeled.** Every AI-generated content carries a "Análisis preliminar IA — requiere revisión humana" badge.
3. **Deterministic.** Temperature = 0, structured JSON output with Zod validation, results cached by input hash.
4. **Auditable.** Every LLM call logs: model version, input text, raw output, extracted result, and the user/event that triggered it.
5. **Degradable.** If Claude API is unavailable, ingestion falls back to manual entry — AI is an accelerator, not a dependency.
6. **Prompt injection defense.** PDFs are rendered to image → OCR before passing text to the LLM. No raw PDF text extraction.

---

## 8. User Roles & Permissions

### 8.1 Platform Roles

| Role | Who | Capabilities |
|------|-----|-------------|
| `observador` | Unauthenticated / unverified | View all public data, no writes |
| `participante` | Email + phone verified | Submit Problems, join Coalitions, cast platform votes (Tier 1 weight) |
| `verificador` | DNI/CUIL verified (Phase 2) | Full voting weight, serve as Coalition Verifier, audit constraints |
| `experto` | Peer-vouched expertise | Expertise-weighted votes on feasibility track |
| `político_verificado` | Identity verified politician | Respond to Findings, submit Constraint claims, sign Mandates, submit Problems/Promises (marked as politician-sourced) |
| `moderador` | Platform staff | Flag/hide content pending review, handle legal takedowns |
| `admin` | Platform operators | Full access, user management, data corrections |

### 8.2 Coalition Roles

| Role | Capabilities |
|------|-------------|
| `member` | View coalition workspace, cast votes |
| `verifier` | Propose and vote on Findings, audit Constraints |
| `admin` | Manage membership, set coalition governance rules, create official reports |

### 8.3 Permission Rules

- Coalition Admins can only manage their own coalition
- No single user can approve their own Finding submissions
- Finding endorsement requires ≥3 Verifiers; constraint audit verdict requires ≥5 Verifiers
- Admin actions (data deletion, score overrides, user bans) require two-admin approval + audit log entry
- Politicians can only respond to Findings about themselves

---

## 9. User Flows

### 9.1 Critical Flows (MVP)

**New user onboarding:**
1. Land on public page → see politician profiles without registering
2. "Participar" CTA → email + phone verification
3. Select focus interests (tags) → shown relevant coalitions and open Problems
4. Transparency consent: explicit acknowledgment that votes/delegations are public

**Politician profile creation (seeded data):**
1. Automated ingestion from Como Votó pipeline creates profiles for all 257 Diputados + 72 Senadores
2. Admin reviews and publishes batch
3. Politician can claim account via verified email domain or official credential upload

**Promise submission:**
1. User submits: politician, text, source URL, date
2. System checks for duplicates
3. Sent to coalition verification queue (or auto-approved if Silver/Gold source)
4. Coalition vote: 3 Verifiers approve → Promise becomes visible on profile
5. Verifiers can link to existing LegislativeVote via a Finding

**Coalition verification flow:**
1. Verifier proposes a Finding: "LegislativeVote X breaks/fulfills Promise Y"
2. Coalition vote opens (72h default window, configurable by Admin)
3. Quorum: ≥3 Verifiers must vote
4. Simple majority decides: endorsed/rejected
5. Endorsed Finding visible on politician profile with coalition badge and evidence

**Problem → Mandate pipeline:**
1. User submits Problem (jurisdiction, description, evidence)
2. Coalition adopts Problem → opens Proposal workspace
3. Coalition drafts Proposal with evidence, cost estimate, timeline
4. Sprint ends (4 weeks) → voting opens to all Coalition members
5. Simple majority → Mandate created
6. Mandate published publicly; auto-scan for matching legislation
7. Politicians notified (if verified account) or Mandate displayed on their profile regardless

**Accountability score display:**
- Score only shown when: Mandate exists for this Problem + either a constraint audit verdict is available or no constraint was claimed
- Otherwise: shows "Sin mandato aún" or "Auditoría en curso"
- Never shows A/B/C/D with insufficient data

### 9.2 Data Correction Flow

1. Any verified user can flag a node or edge as "Posible error"
2. Flag creates a review task for Moderators
3. Moderator reviews with original source
4. If error confirmed: creates corrected version (versioned — original preserved in audit log)
5. Correcting party and reason are displayed in "Ver historial"

### 9.3 Content Moderation Flow

1. Any user can flag content as: spam / desinformación / acoso / contenido ilegal
2. Flags queue to Moderators (reviewed within 48h SLA)
3. Moderator can: dismiss / hide pending review / remove + notify user / escalate to Admin
4. Removed content preserved in audit log (not deleted, just not displayed)
5. User can appeal to Admin within 30 days

---

## 10. Legal & Safety Framework (Argentina)

### 10.1 Argentine Legal Context

- **Ley de Acceso a la Información Pública (Ley 27.275)**: Government data used is already public record
- **Constitución Nacional Art. 14 / 32**: Freedom of press and opinion protects community assessments framed as opinion
- **Código Civil y Comercial Art. 1770**: Defamation protection — the platform must never assert facts it cannot prove
- **PDPA equivalent**: Argentina has Ley 25.326 (Protección de Datos Personales) — all user PII must be treated accordingly

### 10.2 Framing Rules (enforced by design)

The platform **never** automatically labels a politician as corrupt, guilty, or dishonest. It:
- Presents factual data (votes, donor amounts, budget figures) from cited official sources
- Shows community Findings framed explicitly as "community assessment" with visible sourcing
- Labels constraint verdicts as "community audit verdict — not a legal determination"
- Provides a prominent rebuttal field on every politician profile
- Every Finding includes a disclaimer: "Este es un análisis comunitario basado en datos públicos, no una determinación legal"

### 10.3 Content Policy

- No personal attacks on private individuals (family members, staff)
- Political figures are public figures for purposes of their public duties — their public actions are fair game
- Allegations of criminal conduct are not permitted — only factual patterns ("recibió donación de X, votó favorable a X")
- Mandatory source citation on all Bronze-tier submissions
- DMCA / Argentine equivalent takedown process defined before launch

### 10.4 Politician Right to Response

Any politician with a verified account has:
- A permanent response field displayed prominently alongside each Finding
- The right to submit counter-evidence attached to a Constraint or Finding (Bronze-tier, subject to audit)
- A formal dispute channel to flag alleged factual errors (goes to Moderation queue)

---

## 11. Phased Delivery

### Phase 1 — Core Graph + Coalitions (Foundation)

**Goal:** Validate the core accountability loop with seeded data and early coalition users.

| Feature | Difficulty |
|---------|-----------|
| PostgreSQL schema + Politician/Vote/Legislation/Promise nodes | Medium |
| Como Votó ingestion pipeline (seed 257 Diputados + 72 Senadores) | Medium |
| Politician profile pages (votes, promises, score placeholder) | Medium |
| Promise Tracker (side-by-side view with Finding status) | Medium |
| User auth + verification tiers (Tier 0 + Tier 1) | Medium |
| Coalition creation, membership, basic roles | Hard |
| Collective verification flow (Finding proposal → vote → endorsed badge) | Hard |
| Problem submission form + jurisdiction linking | Easy-Medium |
| Manual data ingestion admin tools | Medium |
| Public audit trail (view history per node) | Medium-Hard |
| Content moderation tooling (flag → queue → moderator action) | Medium |
| Permission model (all roles defined and enforced) | Medium |

### Phase 2 — Proactive Module + Advanced Governance

**Goal:** Enable community R&D loop, improve voting quality.

| Feature | Difficulty |
|---------|-----------|
| Proposal drafting workspace (rich text, versioned, coalition-scoped) | Medium-Hard |
| Dual-track consensus (feasibility + preference voting) | Hard |
| Mandate creation + legislation alignment scan | Hard |
| Liquid democracy delegation | Hard |
| Quadratic voting (resource allocation) | Hard |
| Constraint audit flow (full verdict system) | Hard |
| A/B/C/D accountability score (algorithm defined + displayed) | Very Hard |
| CUIL/DNI identity verification (Tier 2) | Medium |
| Expertise badge system | Medium |
| AI-assisted document summarization (proposals) | Medium |
| AI constraint pre-verification (labeled as preliminary) | Hard |
| Automated HCDN/Senado scraping pipeline (fork Como Votó) | Medium |

### Phase 3 — Advanced Consensus + Scale

**Goal:** Harden consensus mechanisms, expand coverage, reach sustainability.

| Feature | Difficulty |
|---------|-----------|
| Holographic consensus | Hard |
| Prediction markets | Very Hard |
| Map-based jurisdiction visualization (Leaflet) | Medium |
| Inter-coalition dispute resolution (cross-coalition jury) | Hard |
| Public API (journalists, researchers, external tools) | Medium |
| Province-level coverage (legislature data beyond Congress) | Hard |
| Neo4j migration (if traversal complexity justifies it) | Very Hard |
| Transparency report + open-source scoring algorithm | Medium |

---

## 12. Key Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Score computed from insufficient data** | Critical | Score only displayed when minimum inputs exist; "Sin mandato" / "Pendiente" shown otherwise |
| **Coalition capture by political actors** | Critical | Coalition health score; minimum reputation to create; cross-coalition jury for disputed verdicts |
| **Sybil voting attacks** | Critical | Progressive verification tiers; graph-based anomaly detection; voting weight gated on verification |
| **Legal challenge (defamation)** | Critical | Opinion-framed labels only; mandatory citations; right to rebuttal; Argentine legal counsel retained pre-launch |
| **AI prompt injection via PDFs** | High | PDF → image → OCR pipeline; output schema validation; human review required before publication |
| **Cold start (empty platform)** | High | Como Votó integration seeds full Congress at launch; invite initial coalition anchors before public launch |
| **Accountability score gaming** | High | Score algorithm open-source; community auditable; formula changes require community vote |
| **Data quality drift** | High | Tiered trust model; provenance on every record; "Unverifiable" is a negative signal |
| **Public voting chills participation** | Medium | Users explicitly consent on signup; framing: transparency is a feature and a defense against manipulation |
| **Key person risk** | Medium | Open-source codebase; documented operational procedures; bus-factor-resistant credential management |

---

## 13. Open Questions

1. **Monetization**: Coalition premium features (advanced analytics, priority support), grants (Wikimedia, Open Society, NED), or fully free/donation-based?
2. **Politician participation**: Active outreach to legislators to claim verified accounts and engage with Mandates?
3. **Data partnerships**: Formal agreement with Como Votó author (rquiroga7) and/or Chequeado, Poder Ciudadano, Fundar?
4. **Coalition identity**: Allow custom coalition branding (logo, colors) or uniform platform UI to maintain visual neutrality?
5. **Initial coalition seeding**: Which 2-3 well-known Argentine civil society orgs to onboard as anchor coalitions at launch?
6. **Score algorithm definition**: Who defines the initial A/B/C/D formula weights? Community vote, editorial committee, or technical team?

---

## 14. Glossary

| Term | Definition |
|------|-----------|
| **Mandate / Mandato** | A community Proposal that cleared dual-track consensus and became an official civic demand linked to politicians |
| **Finding** | A reified assertion about a relationship (e.g., "This vote breaks this promise") — submitted by users, endorsed by coalitions |
| **Constraint / Restricción** | A claimed limitation (presupuestaria, legal, física) submitted to contextualize a politician's inaction |
| **Constraint Audit** | Coalition-driven process that votes whether a claimed constraint is Válido / Exagerado / Falso |
| **Contextual Score** | A politician's A–D accountability rating for a specific Problem — only displayed when mandate + audit inputs are available |
| **Dual-Track Consensus** | Two parallel processes: expert-weighted feasibility track + community preference track |
| **Coalition** | User-organized, issue-based group that collectively verifies data, proposes solutions, and endorses Findings |
| **Liquid Democracy** | Members vote directly or delegate their vote to a trusted peer (public, revocable) |
| **Tiered Trust** | Gold (official APIs) / Silver (reputable press) / Bronze (user submissions) — determines default confidence and review requirements |
| **Finding Reification** | Graph modeling pattern: instead of an edge-on-edge (impossible), a `Finding` node acts as the subject of endorsement, evidence, and dispute |
| **Como Votó** | Open-source Argentine voting tracker (rquiroga7/Como_voto) used as the Gold-tier data source for legislative votes |

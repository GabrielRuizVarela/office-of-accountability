# Epstein Investigation + MiroFish Simulation — Implementation Plan

## Overview

Build a comprehensive Epstein investigation tool on the Office of Accountability platform, following the same architecture as the Caso Libra investigation. Includes MiroFish swarm intelligence integration for AI-powered network analysis, running locally on a GPU machine with llama.cpp + quantized Qwen to avoid API token costs.

---

## Infrastructure: MiroFish + Local LLM

### GPU Machine Setup (8GB VRAM)

```
# 1. llama.cpp server with quantized Qwen
llama-server -m qwen2.5-7b-q4_k_m.gguf --port 8080 --n-gpu-layers 99

# 2. MiroFish (Docker) pointing to local LLM
OPENAI_API_BASE=http://localhost:8080/v1
docker compose up  # MiroFish's own docker-compose

# 3. Webapp connects to MiroFish API
```

### Architecture

```
GPU Machine:
  ├── llama-server (Qwen 2.5 7B Q4_K_M, port 8080)
  └── MiroFish (Docker, connects to localhost:8080)

Webapp (any machine):
  └── /caso/[slug]/simulacion → talks to MiroFish API
```

### MiroFish Repo
- https://github.com/666ghj/MiroFish
- Python 3.11-3.12 backend, Vue.js frontend
- Uses OASIS framework (CAMEL-AI) for multi-agent simulation
- Zep Cloud for agent memory
- Supports any OpenAI-compatible API endpoint

---

## Data Model

### Nodes

| Node | Key Fields |
|------|-----------|
| Person | name, slug, role, description, nationality |
| Flight | flight_number, date, origin, destination, aircraft |
| Location | name, slug, location_type (property/office/island), address, coordinates |
| Document | title, slug, doc_type (court_filing/deposition/fbi/flight_log), source_url, summary |
| Event | title, date, event_type (legal/social/financial/arrest/death) |
| Organization | name, slug, org_type (company/bank/foundation/government) |
| LegalCase | title, slug, case_number, court, status, date_filed |

### Relationships

- `FLEW_WITH` (Person → Flight)
- `ON_FLIGHT` (Flight → Location, role: origin/destination)
- `VISITED` (Person → Location, date)
- `ASSOCIATED_WITH` (Person → Person, relationship_type, description)
- `EMPLOYED_BY` (Person → Organization)
- `AFFILIATED_WITH` (Person → Organization)
- `MENTIONED_IN` (Person → Document)
- `PARTICIPATED_IN` (Person → Event)
- `FILED_IN` (Document → LegalCase)
- `OWNED` (Person/Org → Location)
- `FINANCED` (Person/Org → Person/Org, amount)
- `DOCUMENTED_BY` (Event → Document)

---

## Seed Data (curated from public record)

### Persons (15-20)
- Jeffrey Epstein — financier, convicted sex offender
- Ghislaine Maxwell — socialite, convicted sex trafficker
- Leslie Wexner — L Brands CEO, Epstein's largest known client
- Alan Dershowitz — attorney, named in depositions
- Prince Andrew — Duke of York, named in Giuffre lawsuit
- Bill Clinton — former US President, on flight logs
- Jean-Luc Brunel — modeling agent, found dead in prison
- Sarah Kellen — Epstein assistant, named in plea deal
- Nadia Marcinko — alleged victim turned associate
- Virginia Giuffre — key accuser, filed multiple lawsuits
- Larry Visoski — chief pilot
- David Copperfield — named in flight logs
- Jes Staley — JPMorgan exec, Epstein relationship
- Leon Black — Apollo Global, paid Epstein $158M
- Donald Trump — named in early social connections

### Locations (6-8)
- Little St. James Island, USVI (private island)
- Zorro Ranch, Stanley NM (ranch)
- 9 E 71st St, NYC (townhouse)
- 358 El Brillo Way, Palm Beach FL (mansion)
- Paris apartment, Avenue Foch
- Columbus OH (Wexner connection)

### Events (15-20)
- 2005: Palm Beach Police investigation begins
- 2006: FBI investigation launched
- 2007: Grand jury indictment (FL)
- 2008: Non-prosecution agreement (Acosta plea deal)
- 2008: Epstein pleads guilty to FL state charges, 13 months
- 2010: Epstein registers as sex offender
- 2015: Giuffre v. Maxwell filed
- 2018: Miami Herald "Perversion of Justice" series
- 2019-07-06: Epstein arrested at Teterboro Airport
- 2019-07-08: SDNY indictment unsealed
- 2019-08-10: Epstein found dead in MCC cell
- 2019-08: Medical examiner rules suicide (disputed)
- 2020-07-02: Ghislaine Maxwell arrested
- 2021-12: Maxwell trial begins
- 2021-12-29: Maxwell found guilty on 5 counts
- 2022-06-28: Maxwell sentenced to 20 years
- 2023: JPMorgan settles for $290M (Giuffre class action)
- 2023: Deutsche Bank settles for $75M
- 2024: Epstein document release (Giuffre v. Maxwell unsealed)

### Documents (10-15)
- Maxwell trial transcripts (SDNY)
- Flight logs (Lolita Express, released via FOIA)
- Black book / address book (leaked)
- Non-prosecution agreement (2008, Acosta)
- Giuffre v. Maxwell depositions (unsealed 2024)
- FBI vault releases
- JPMorgan internal communications (revealed in lawsuit)
- Miami Herald "Perversion of Justice" investigation
- Palm Beach Police report
- Medical examiner report

### Organizations (8-10)
- J. Epstein & Co (financial firm)
- Southern Trust Company
- JPMorgan Chase (banking relationship)
- Deutsche Bank (banking relationship)
- L Brands / The Limited (Wexner)
- Apollo Global Management (Leon Black)
- MC2 Model Management (Brunel)
- Jeffrey Epstein VI Foundation
- Metropolitan Correctional Center (MCC)

### Legal Cases (5-6)
- State of Florida v. Epstein (2008, Palm Beach)
- USA v. Epstein (SDNY, 2019, case 19-cr-490)
- USA v. Maxwell (SDNY, 2020, case 20-cr-330)
- Giuffre v. Maxwell (SDNY, civil, 2015)
- Giuffre v. Prince Andrew (2022, settled)
- Jane Doe 1 v. JPMorgan (2022, settled $290M)

---

## Route Structure

```
/caso/[slug]/                    → landing page (hero + stats + entry points)
/caso/[slug]/grafo               → full knowledge graph
/caso/[slug]/cronologia          → timeline (1990s–2024)
/caso/[slug]/vuelos              → flight log visualization
/caso/[slug]/actor/[actorSlug]   → person profile
/caso/[slug]/evidencia           → documents list
/caso/[slug]/evidencia/[docSlug] → document detail
/caso/[slug]/simulacion          → MiroFish swarm intelligence
```

Shared layout at `/caso/[slug]/layout.tsx` with sub-navigation tabs.

---

## Phase 1: Data Layer

### Files to Create
- `webapp/src/lib/caso-epstein/types.ts` — Zod schemas + TS interfaces for all node types
- `webapp/src/lib/caso-epstein/queries.ts` — Cypher queries (graph, timeline, flights, actors, docs)
- `webapp/src/lib/caso-epstein/transform.ts` — Neo4j records → typed objects
- `webapp/src/lib/caso-epstein/index.ts` — barrel export
- `webapp/scripts/seed-caso-epstein.ts` — idempotent seed (MERGE) with all curated data

### Files to Modify
- `webapp/scripts/init-schema.ts` — add constraints/indexes for new node types
- `webapp/src/lib/neo4j/schema.ts` — add constraint/index definitions

### Queries to Implement
- `getInvestigationGraph(slug)` — full subgraph for react-force-graph
- `getTimeline(slug)` — events ordered by date
- `getPersonBySlug(slug)` — person + all connections
- `getFlightLog()` — flights with passengers and locations
- `getActors()` — all persons in investigation
- `getDocuments()` — all evidence documents
- `getLegalCases()` — all cases with status
- `getLocationNetwork()` — locations + who visited

---

## Phase 2: Landing + Graph

### Files to Create
- `webapp/src/app/caso/[slug]/page.tsx` — landing page (server component)
- `webapp/src/app/caso/[slug]/layout.tsx` — shared layout with tabs
- `webapp/src/app/caso/[slug]/grafo/page.tsx` — graph view
- `webapp/src/components/investigation/InvestigationNav.tsx` — tab navigation
- `webapp/src/components/investigation/KeyStats.tsx` — stat cards
- `webapp/src/components/investigation/LegalDisclaimer.tsx` — legal notice

### Files to Modify
- `webapp/src/components/graph/ForceGraph.tsx` — add LABEL_COLORS for new node types
- `webapp/src/app/page.tsx` — feature Epstein investigation on homepage

### New LABEL_COLORS
```
Person: '#3b82f6'        (blue)
Flight: '#f97316'        (orange)
Location: '#10b981'      (emerald)
Document: '#ef4444'      (red)
Event: '#f59e0b'         (amber)
Organization: '#8b5cf6'  (violet)
LegalCase: '#ec4899'     (pink)
```

---

## Phase 3: Timeline + Flight Visualization

### Files to Create
- `webapp/src/app/caso/[slug]/cronologia/page.tsx` — timeline page
- `webapp/src/app/caso/[slug]/vuelos/page.tsx` — flight log visualization
- `webapp/src/components/investigation/Timeline.tsx` — vertical timeline component
- `webapp/src/components/investigation/FlightCard.tsx` — flight entry component
- `webapp/src/components/investigation/EventCard.tsx` — event card component

### Timeline Features
- Vertical scrollable, mobile-first
- Color-coded by event type (legal=red, social=blue, financial=green, arrest=orange, death=gray)
- Expandable cards: title + date visible, tap for details + linked actors
- Filter by event type and date range

### Flight Visualization
- ForceGraph with Location nodes + Flight edges
- Passenger list per flight
- Filter by date range and person
- Stats: total flights, unique passengers, most frequent routes

---

## Phase 4: Actor Profiles + Documents

### Files to Create
- `webapp/src/app/caso/[slug]/actor/[actorSlug]/page.tsx` — person profile
- `webapp/src/app/caso/[slug]/evidencia/page.tsx` — document list
- `webapp/src/app/caso/[slug]/evidencia/[docSlug]/page.tsx` — document detail
- `webapp/src/components/investigation/ActorCard.tsx` — person card
- `webapp/src/components/investigation/DocumentCard.tsx` — document card

### Actor Profile Content
- Name, role, description
- Mini timeline (events they participated in)
- Connection list (people, orgs, locations)
- Related documents where they're mentioned
- Flight history
- Mini graph of their connections
- Share button + OG card

---

## Phase 5: MiroFish Integration

### Files to Create
- `webapp/src/app/caso/[slug]/simulacion/page.tsx` — simulation page
- `webapp/src/lib/mirofish/client.ts` — MiroFish API client
- `webapp/src/lib/mirofish/types.ts` — MiroFish types
- `webapp/src/lib/mirofish/export.ts` — knowledge graph → MiroFish seed format
- `webapp/src/components/investigation/SimulationPanel.tsx` — simulation UI

### MiroFish Setup (GPU machine)
1. Clone https://github.com/666ghj/MiroFish
2. Configure to use local llama.cpp endpoint
3. `OPENAI_API_BASE=http://localhost:8080/v1`
4. Run via Docker Compose

### llama.cpp Setup (GPU machine, 8GB VRAM)
```bash
# Download quantized model
wget https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/qwen2.5-7b-instruct-q4_k_m.gguf

# Run server
llama-server -m qwen2.5-7b-instruct-q4_k_m.gguf --port 8080 --n-gpu-layers 99 --ctx-size 8192
```

### Simulation Features
- Export button: converts Neo4j graph → MiroFish seed JSON
- Pre-configured prediction prompts:
  - "Map the complete financial network between Epstein and his associates"
  - "Identify potential undisclosed connections based on proximity patterns"
  - "Simulate information flow: who knew what and when"
  - "Predict which unsealed documents would reveal the most new connections"
- Results panel showing simulation output
- Chat interface to query simulated agents

---

## Phase 6: OG Images + Polish

### Files to Create
- `webapp/src/app/api/og/caso/[slug]/route.tsx` — investigation OG card
- `webapp/src/app/api/og/caso/[slug]/actor/[actorSlug]/route.tsx` — actor OG card

### Polish
- Mobile responsive on all pages
- English UI (Epstein is international, not Spanish-specific)
- Legal disclaimer on every page: "Community investigation based on public court records, government filings, and verified reporting"
- Touch-friendly graph interactions
- Progressive disclosure

---

## Existing Code to Reuse

- `lib/neo4j/client.ts` — readQuery, writeQuery, executeWrite
- `lib/neo4j/types.ts` — GraphNode, GraphLink, GraphData, Provenance
- `lib/graph/transform.ts` — Neo4j record → typed object pattern
- `lib/graph/queries.ts` — Cypher query patterns
- `components/graph/ForceGraph.tsx` — react-force-graph-2d wrapper
- `lib/og/render.ts` — Satori OG image generation
- `components/ui/ShareButton` — WhatsApp/native share

---

## Verification Checklist

1. `docker compose up` — Neo4j running
2. `pnpm run db:init-schema` — schema with new constraints
3. `npx tsx scripts/seed-caso-epstein.ts` — data seeded
4. `pnpm dev` — app runs
5. `/caso/caso-epstein` — landing page with stats
6. `/caso/caso-epstein/grafo` — interactive graph
7. `/caso/caso-epstein/cronologia` — timeline renders
8. `/caso/caso-epstein/vuelos` — flight visualization
9. `/caso/caso-epstein/actor/jeffrey-epstein` — profile renders
10. `/caso/caso-epstein/evidencia` — documents list
11. `/caso/caso-epstein/simulacion` — MiroFish connection works
12. Share buttons generate WhatsApp links with OG preview
13. Mobile responsive on all pages

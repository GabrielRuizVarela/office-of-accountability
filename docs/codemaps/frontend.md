<!-- Freshness: 2026-03-27 -->
# Frontend Codemap

## Page Routes

### Top-Level
| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` (238L) | Landing — chapters, narrative intro, investigation cards |
| `/explorar` | `app/explorar/page.tsx` (567L) | Interactive graph explorer |
| `/investigaciones` | `app/investigaciones/page.tsx` (436L) | Investigation listing |
| `/provincias` | `app/provincias/page.tsx` | Province listing |
| `/provincias/[province]` | `app/provincias/[province]/page.tsx` | Province detail |
| `/politico/[slug]` | `app/politico/[slug]/page.tsx` | Politician profile |

### Dynamic Case Routes (`/caso/[slug]/*`)
| Route | Purpose |
|-------|---------|
| `/caso/[slug]` | Case landing/overview |
| `/caso/[slug]/resumen` | Summary |
| `/caso/[slug]/investigacion` | Investigation content |
| `/caso/[slug]/cronologia` | Timeline events |
| `/caso/[slug]/dinero` | Financial flows |
| `/caso/[slug]/grafo` | Graph visualization |
| `/caso/[slug]/evidencia` | Evidence documents |
| `/caso/[slug]/evidencia/[docSlug]` | Document detail |
| `/caso/[slug]/proximidad` | Proximity analysis |
| `/caso/[slug]/actor/[actorSlug]` | Actor profile |
| `/caso/[slug]/simulacion` | Simulation results |
| `/caso/[slug]/simular` | Simulation input |
| `/caso/[slug]/objetivos` | Investigation objectives |
| `/caso/[slug]/vuelos` | Flight records (Epstein) |

### Hardcoded Case Routes
Additional dedicated pages for: `caso-libra`, `caso-epstein`, `caso-dictadura`, `adorni`, `finanzas-politicas`, `monopolios`, `obras-publicas`

## Components

### Graph (`src/components/graph/`)
| Component | Lines | Exports |
|-----------|-------|---------|
| `ForceGraph.tsx` | 520 | Force-directed graph (react-force-graph-2d wrapper) |
| `NodeDetailPanel.tsx` | 354 | Side panel: node properties, relationships, citations |
| `PathFinder.tsx` | 265 | Shortest path modal with BFS |
| `SearchBar.tsx` | 260 | Autocomplete node search |
| `CategoryFilter.tsx` | 218 | Entity category dropdown |
| `GraphToolbar.tsx` | 191 | Zoom, layout, export controls |
| `TypeFilter.tsx` | 101 | Node type filter |
| `ZoomControls.tsx` | ~50 | Zoom in/out/fit |

### Investigation (`src/components/`)
| Component | Lines | Exports |
|-----------|-------|---------|
| `TargetCard.tsx` | 699 | Actor card with financial metrics, risk scoring |
| `EdgeCitationEmbed.tsx` | 549 | Relationship evidence citations |
| `SubGraphEmbed.tsx` | 504 | Mini subgraph in article body |
| `ProximityPanel.tsx` | 434 | Co-location, shared events/docs panel |
| `GraphNodeEmbed.tsx` | 225 | Interactive node embed in text |
| `SimulationPanel.tsx` | 224 | LLM scenario simulation |
| `EvidenceExplorer.tsx` | 187 | Filterable document grid |
| `InvestigationNav.tsx` | 141 | Section navigation |
| `InvestigationBodyView.tsx` | 132 | Rich text investigation content |
| `CitedText.tsx` | 111 | Inline citations |
| `EventCard.tsx` | 100 | Timeline event card |
| `Timeline.tsx` | 85 | Vertical timeline with type filtering |

### Landing (`src/components/landing/`)
| Component | Exports |
|-----------|---------|
| `Masthead.tsx` | Logo, navigation |
| `NarrativeIntro.tsx` | Opening narrative |
| `Chapter.tsx` | Investigation chapter section |
| `Transition.tsx` | Visual transition between sections |
| `WhatsNext.tsx` | Roadmap section |
| `CallToAction.tsx` | CTA section |
| `InvestigationCard.tsx` | Case card with stats |
| `ScrollReveal.tsx` | Scroll-triggered animations |

### Layout
| Component | Exports |
|-----------|---------|
| `SiteNav.tsx` (95L) | Top nav: logo, case links, mobile menu, language toggle |
| `Footer.tsx` | Footer with links |
| `LanguageToggle.tsx` | ES/EN switcher |
| `ShareButton.tsx` (174L) | Copy-to-clipboard with toast |

## API Routes

### Graph APIs (`/api/graph/`)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/graph/search` | GET | Fulltext search with label filter, pagination |
| `/graph/query` | GET | Execute Cypher queries |
| `/graph/path` | POST | BFS shortest path between two nodes |
| `/graph/expand/[id]` | GET | N-hop neighbor expansion |
| `/graph/node/[id]` | GET | Single node detail |
| `/graph/edge-provenance` | GET | Relationship citations |

### Case APIs (`/api/caso/`)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/caso/[slug]/graph` | GET | Case subgraph |
| `/caso/[slug]/flights` | GET | Flight records |
| `/caso/[slug]/proximity` | GET | Co-location analysis |
| `/caso/[slug]/simulation/init` | POST | Start LLM session |
| `/caso/[slug]/simulation/query` | POST | Query LLM session |
| `/caso/adorni/graph` | GET | Adorni subgraph (colored) |
| `/caso/adorni/money-trails` | GET | Adorni financial tracking |
| `/caso/finanzas-politicas/graph` | GET | Political finance graph (881L, 7 sources) |
| `/caso/obras-publicas/graph` | GET | Public works graph |
| `/caso/obras-publicas/map` | GET | Geographic GeoJSON |

### Caso Libra APIs (`/api/caso-libra/`)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/caso-libra/investigation` | GET/POST | Investigation submissions CRUD |
| `/caso-libra/simulate` | POST | Start simulation |
| `/caso-libra/simulate/[id]/chat` | POST | Chat with LLM |
| `/caso-libra/graph` | GET | Memecoin graph |
| `/caso-libra/wallets` | GET | Crypto wallet data |

## i18n

- **Library:** next-intl
- **Locales:** `es` (default), `en`
- **Messages:** `messages/es.json`, `messages/en.json`
- **Pattern:** `createTranslator(namespace, locale)` with dot-notation paths

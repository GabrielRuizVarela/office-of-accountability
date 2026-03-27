<!-- Freshness: 2026-03-27 -->
# Backend Codemap

## Library Layer (`src/lib/`)

### Neo4j (`src/lib/neo4j/`)
| File | Exports |
|------|---------|
| `config.ts` | `envSchema` (Zod), `getNeo4jConfig()` |
| `client.ts` | `getDriver()`, `getSession()`, `closeDriver()` |
| `schema.ts` | `initSchema()` — 25 constraints, 13 fulltext indexes, 29 range indexes |
| `types.ts` | `DataTier`, `Provenance`, `GraphNode`, `GraphRelationship`, `GraphData`, `GraphLink`, `QueryResult<T>` |

### Auth (`src/lib/auth/`)
| File | Exports |
|------|---------|
| `csrf.ts` | `generateCsrfToken()`, `signCsrfToken()`, `verifyCsrfToken()`, `parseCsrfCookie()`, `buildCsrfSetCookie()` |

### Rate Limit (`src/lib/rate-limit/`)
| File | Exports |
|------|---------|
| `index.ts` | `checkRateLimit()`, `rateLimitHeaders()`, `RATE_LIMITS` |

Tiers: API reads (60/min), mutations (30/min), OG images (separate). Sliding window, in-memory.

### Graph (`src/lib/graph/`)
| File | Exports |
|------|---------|
| Query builders for subgraphs, search, path finding (BFS) |
| Two-pass pattern to avoid O(n^2) cartesian products |

### Ingestion (`src/lib/ingestion/`)
| File | Exports |
|------|---------|
| `types.ts` | `ConfidenceTier`, `IngestionSource` (28 sources), `IngestionMeta`, `DedupResult`, `ConflictRecord`, `WaveReport`, `ResumeState` |
| `dedup.ts` | Name normalization, Levenshtein matching, `buildExistingMaps()` |
| `quality.ts` | Conflict persistence, resume state, wave reporting |

### Investigation (`src/lib/investigation/`)
| File | Exports |
|------|---------|
| `types.ts` | `Investigation`, `InvestigationWithAuthor`, `InvestigationListItem`, Zod schemas (create/update/list) |

### MiroFish (`src/lib/mirofish/`)
| File | Exports |
|------|---------|
| `types.ts` | `PredictionPrompt`, `SimulationMessage` |
| Client for llama.cpp server — thinking mode (check `reasoning_content`, not `content`) |

### Case Libraries (`src/lib/caso-*/`)

8 case modules with consistent exports:

| Module | Key Exports |
|--------|-------------|
| `caso-libra` | 8 Zod schemas (person, event, document, org, token, wallet, transaction), investigation-schema (7 input types + union), investigation-data |
| `caso-epstein` | Types (document types, 241L), investigation-data (1,964L) |
| `caso-adorni` | Types, investigation-data |
| `caso-dictadura` | Types (PersonaCategory, DocumentType, EventType, MilitaryBranch, CausaStatus, etc.) |
| `caso-finanzas-politicas` | Investigation-data |
| `caso-monopolios` | Investigation-data (872L) |
| `caso-obras-publicas` | Investigation-data, EvidenceDoc with verification_status |
| `caso-nuclear-risk` | Types (8 enums: escalation, signal, theater, nuclear status, actor, treaty, weapon, facility) |

Each exports: `FACTCHECK_ITEMS`, `TIMELINE`, `ACTORS`, `MONEY_FLOWS`, `IMPACT_STATS` (+ case-specific arrays)

## ETL Layer (`src/etl/`)

### Cross-Reference Engine (`src/etl/cross-reference/`)
| File | Exports |
|------|---------|
| `types.ts` | `CrossRefMatch` (cuit/dni/cuil/normalized_name/fuzzy_name), `CrossRefResult`, `InvestigationFlag` (13 flag types) |
| `matchers.ts` | CUIT/DNI matching, fuzzy name matching (Levenshtein, capped 10K) |
| `loader.ts` | In-memory Map joins (avoids Cypher cartesian timeout) |

### ETL Modules
| Module | Data Source | Key Types |
|--------|-----------|-----------|
| `comprar/` | Federal procurement (Comprar) | `ComprarOcRowSchema` (14 CSV cols) |
| `cne-finance/` | Campaign finance (CNE) | `DonationRowSchema` (15 cols) |
| `boletin-oficial/` | Official gazette | Decree parsing |
| `opencorporates/` | Corporate registry (IGJ) | Company/officer types |
| `como-voto/` | Congressional voting | Vote/legislation types |
| `icij-offshore/` | ICIJ offshore leaks | Officer/entity types |
| `cnv-securities/` | Securities regulator | Financial types |
| `judiciary/` | Judicial records | Case/ruling types |
| `ddjj-patrimoniales/` | Asset declarations | Patrimony types |
| `obras-publicas/contratar/` | ContratAR contracts | Contract/bid types |
| `obras-publicas/sipro/` | SIPRO supplier registry | Supplier types |
| `obras-publicas/mapa-inversiones/` | Public works map | GeoJSON/project types |
| `obras-publicas/ocds-provincial/` | Provincial OCDS | Open contracting types |
| `obras-publicas/multilateral/` | WB/IDB sanctions | Debarment types |
| `nuclear-risk/` | 6 sources (IAEA, NATO, DoD, State Dept, ACA, Bulletin) | RSS parsing, signal types |

## Middleware (`src/middleware.ts`, 198L)

```
1. Extract client IP (cf-connecting-ip → x-forwarded-for → x-real-ip → 127.0.0.1)
2. CSRF validation on POST/PATCH/PUT/DELETE (except exempt routes)
3. Rate limit check (tiered: api/mutation/og)
4. Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
5. CSRF cookie generation (signed, HttpOnly, SameSite=Lax)
```

## Scripts (`scripts/`, 70+ files)

Categories:
- `init-schema.ts` — Neo4j schema initialization
- `seed-*.ts` — Investigation seeding (6 cases)
- `ingest-*.ts` — Data ingestion waves (25+ scripts)
- `run-etl-*.ts` — ETL pipeline runners (15 scripts)
- `run-cross-*.ts` — Cross-reference runners
- `consolidate-dictadura-*.ts` — Dictadura wave consolidation
- `enrichment-dictadura-*.ts` — Dictadura enrichment waves

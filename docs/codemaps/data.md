<!-- Freshness: 2026-03-27 -->
# Data Models Codemap

## Neo4j Schema

### Node Labels (24)

**Political/Legislative:**
- `Politician` — id (unique), name, slug, full_name, photo_url
- `Legislation` — expediente (unique), title, summary, status, date
- `LegislativeVote` — acta (unique), date, result, chamber
- `Party` — id (unique), name, abbreviation
- `Province` — id (unique), name, code

**Caso Libra (6):**
- `CasoLibraPerson` — id (unique), name, slug, role, nationality
- `CasoLibraEvent` — id (unique), title, slug, date, event_type
- `CasoLibraDocument` — id (unique), title, slug, doc_type
- `CasoLibraOrganization` — id (unique), name, slug, org_type
- `CasoLibraToken` — id (unique), symbol, name, contract_address
- `CasoLibraWallet` — address (unique), label, chain

**Cross-Case:**
- `Person` — caso_slug scoped, CUIT-deduplicated
- `Organization` — caso_slug scoped
- `Event` — caso_slug scoped
- `Contractor` — cuit (unique), name, address
- `Company` — cuit (unique), name, legal_type

**Nuclear Risk (7):**
- `NuclearSignal` — id (unique), type, escalation_level, theater
- `NuclearActor` — id (unique), nuclear_status
- `WeaponSystem` — id (unique), category
- `Treaty` — id (unique), status
- `NuclearFacility` — id (unique), type
- `RiskBriefing` — id (unique), date
- `SignalSource` — id (unique)

**System:**
- `Investigation` — id (unique), title, slug, status
- `InvestigationConfig` — id (unique)
- `User` — id (unique), email (unique)

### Relationship Types (40+)

**Political:**
`SERVED_TERM`, `TERM_PARTY`, `TERM_PROVINCE`, `CAST_VOTE`, `VOTE_ON`, `APPOINTED_BY`

**Financial:**
`IS_DONOR`, `DONATED_TO`, `RECEIVED_DONATION`, `HAS_OFFSHORE_LINK`, `FINANCED`

**Corporate:**
`OFFICER_OF`, `OFFICER_OF_COMPANY`, `BOARD_MEMBER_OF`, `AFFILIATED_WITH`, `MEMBER_OF`

**Procurement:**
`AWARDED_TO`, `CONTRACTED_FOR`, `INTERMEDIATED`

**Investigation:**
`MENTIONED_IN`, `REFERENCES`, `AUTHORED`, `DOCUMENTED_BY`, `MENTIONS`, `FILED_IN`, `CASE_INVOLVES`

**Caso Libra:**
`CONTROLS`, `SENT`, `COMMUNICATED_WITH`, `MET_WITH`, `PARTICIPATED_IN`, `PROMOTED`, `CREATED_BY`

**Dedup/Cross-ref:**
`SAME_ENTITY`, `MAYBE_SAME_AS`, `DEBARRED_SAME_AS`

**Nuclear:**
`INVOLVES`, `REFERENCES_SYSTEM`, `REFERENCES_TREATY`, `OPERATES`, `PARTY_TO`

**Hierarchical:**
`LOCATED_IN_PROVINCE`, `REPRESENTS`, `SERVES_IN`, `EMPLOYED_BY`

### Indexes

**Unique Constraints (25):** One per primary node label
**Fulltext Indexes (13):** Name/title search across major labels, bilingual ES/EN for nuclear
**Range/B-tree Indexes (29):** By slug, date, status, caso_slug, CUIT, escalation_level

## Zod Validation Schemas

### Core
| Schema | Location | Fields |
|--------|----------|--------|
| `envSchema` | `lib/neo4j/config.ts` | NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD |
| `createInvestigationSchema` | `lib/investigation/types.ts` | title (1-500), summary (0-2000), body (0-500KB), tags (max 20), status, node_ids |
| `updateInvestigationSchema` | `lib/investigation/types.ts` | Partial of create |
| `listInvestigationsSchema` | `lib/investigation/types.ts` | page (min 1), limit (1-50), tag filter |

### Caso Libra Input Schemas
| Schema | Location | Validation |
|--------|----------|-----------|
| `factcheckInputSchema` | `lib/caso-libra/investigation-schema.ts` | claim_es/en (min 10), status enum, source_url (URL) |
| `eventInputSchema` | same | date (YYYY-MM-DD), title (min 5), description (min 10), sources (min 1) |
| `actorInputSchema` | same | name (2+), role (3+), description (10+), nationality (2+) |
| `moneyFlowInputSchema` | same | from_label, to_label, amount_usd (positive), date |
| `evidenceInputSchema` | same | title (5+), date, summary (10+), source_url (URL), verification_status |
| `statInputSchema` | same | value, label (3+), source |
| `governmentResponseInputSchema` | same | date, action (10+), effect (10+), source_url |
| `investigationSubmissionSchema` | same | Discriminated union on `type` field |
| `bulkImportSchema` | same | items array (1-100) |

### ETL Schemas
| Schema | Location | Columns |
|--------|----------|---------|
| `ComprarOcRowSchema` | `etl/comprar/types.ts` | 14 CSV columns |
| `DonationRowSchema` | `etl/cne-finance/types.ts` | 15 CSV columns |

### Status/Category Enums
| Enum | Values |
|------|--------|
| `FactcheckStatus` | confirmed, alleged, denied, under_investigation |
| `InvestigationCategory` | political, financial, legal, media, coverup |
| `VerificationStatus` | verified, partially_verified, unverified |
| `ConfidenceTier` | gold, silver, bronze |
| `EscalationLevel` | routine, notable, elevated, serious, critical |
| `PersonaCategory` (dictadura) | victima, represor, imputado, complice_civil, testigo, juez, diplomatico, nino_apropiado |
| `CausaStatus` (dictadura) | en_instruccion, elevada_a_juicio, en_juicio, con_sentencia, cerrada |

## Investigation Data Structure

All 8 case modules export consistent arrays:

```typescript
// Every caso-*/investigation-data.ts exports:
FACTCHECK_ITEMS: readonly FactcheckItem[]    // Claims with status + sources
TIMELINE: readonly TimelineEvent[]            // Dated events with categories
ACTORS: readonly Actor[]                      // Key persons with roles
MONEY_FLOWS: readonly MoneyFlow[]             // Sourced financial transfers
IMPACT_STATS: readonly ImpactStat[]           // Headline metrics
EVIDENCE_DOCUMENTS?: readonly EvidenceDoc[]   // Cited documents (some cases)
GOVERNMENT_RESPONSES?: readonly GovResponse[] // Official actions (some cases)
```

## Cross-Reference Engine Types

```typescript
CrossRefMatch {
  source_id, target_id, source_label, target_label,
  match_key,                                    // CUIT, DNI, or normalized name
  match_type: 'cuit' | 'dni' | 'cuil' | 'normalized_name' | 'fuzzy_name',
  confidence: 0.6-1.0,
  evidence: string
}

InvestigationFlag {
  entity_id, entity_name,
  flag_type: FlagType,    // 13 types (contractor_donor, shell_company, debarred_active, etc.)
  evidence, confidence
}
```

## API Response Format

```typescript
// Success
{ success: true, data: T, meta?: { totalCount, nextCursor } }

// Error
{ success: false, error: string }

// Rate limit headers
X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After
```

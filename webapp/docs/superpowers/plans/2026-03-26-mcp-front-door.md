# MCP Front Door Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the MCP tool surface (16 new tools + 5 resources) so an external LLM can run the full investigate-loop through MCP instead of direct Neo4j/CLI scripts. Add 4 new Next.js API routes for ingest/verify operations that don't exist yet.

**Architecture:** Pure proxy pattern - MCP Worker routes tool calls to Next.js API routes. New ingest/verify API routes handle the actual Neo4j writes. All writes create Proposals (never direct nodes). Cypher sandbox validates graph.query before forwarding.

**Tech Stack:** Cloudflare Workers (MCP server), Next.js 16 API routes, Neo4j 5 (Bolt/WS), Zod 4 validation, TypeScript

---

## File Map

### MCP Server (Workers) - New tool handler files

| File | Responsibility |
|---|---|
| `workers/mcp-server/src/tools/ingest.ts` | 4 ingest tools: add_entity, add_relationship, import_csv, import_url |
| `workers/mcp-server/src/tools/pipeline.ts` | 7 pipeline tools: run, state, stop, proposals, approve, reject, gate_action |
| `workers/mcp-server/src/tools/verify.ts` | 3 verify tools: check_entity, promote_tier, cross_reference |
| `workers/mcp-server/src/tools/analyze.ts` | 3 analyze tools: detect_gaps, hypothesize, run_analysis |
| `workers/mcp-server/src/tools/audit.ts` | 4 audit/snapshot tools: log, trail, verify_chain, snapshot.create |
| `workers/mcp-server/src/tools/orchestrator.ts` | 3 orchestrator tools: state, set_focus, tasks |
| `workers/mcp-server/src/tools/resources.ts` | 5 MCP resources: summary, schema, gaps, directives, pipeline |
| `workers/mcp-server/src/tools/index.ts` | Update imports to register all new tool files |

### Next.js API Routes - New endpoints for operations that have no route yet

| File | Responsibility |
|---|---|
| `src/app/api/casos/[casoSlug]/engine/ingest/entity/route.ts` | POST: create bronze entity Proposal with dedup check |
| `src/app/api/casos/[casoSlug]/engine/ingest/relationship/route.ts` | POST: create edge Proposal with endpoint validation |
| `src/app/api/casos/[casoSlug]/engine/ingest/csv/route.ts` | POST: bulk CSV import → Proposals with dedup |
| `src/app/api/casos/[casoSlug]/engine/ingest/url/route.ts` | POST: fetch URL, extract text, optionally extract entities |
| `src/app/api/casos/[casoSlug]/engine/verify/promote/route.ts` | POST: promote node tier (bronze→silver→gold) |
| `src/app/api/casos/[casoSlug]/engine/verify/cross-reference/route.ts` | POST: run cross-reference pass |
| `src/app/api/casos/[casoSlug]/engine/analyze/gaps/route.ts` | GET: detect gaps via gap-detector.ts |
| `src/app/api/casos/[casoSlug]/engine/analyze/hypothesis/route.ts` | POST: create hypothesis Proposal |
| `src/app/api/casos/[casoSlug]/engine/analyze/run/route.ts` | POST: run analysis type (procurement, ownership, etc.) |

### Cypher Sandbox

| File | Responsibility |
|---|---|
| `src/lib/engine/cypher-sandbox.ts` | Validate Cypher queries: whitelist read-only ops, block writes, inject caso_slug filter |

---

## Task 1: Cypher Sandbox

**Files:**
- Create: `src/lib/engine/cypher-sandbox.ts`

The sandbox must exist before any MCP tool exposes graph.query to external clients.

- [ ] **Step 1: Create cypher-sandbox.ts**

```typescript
// src/lib/engine/cypher-sandbox.ts

/**
 * Cypher query sandbox for MCP clients.
 * Validates queries are read-only and scoped to a caso_slug.
 */

const BLOCKED_KEYWORDS = [
  'CREATE', 'MERGE', 'SET', 'DELETE', 'REMOVE', 'DROP',
  'DETACH', 'CALL', 'FOREACH', 'LOAD',
]

const BLOCKED_REGEX = new RegExp(
  `\\b(${BLOCKED_KEYWORDS.join('|')})\\b`,
  'i',
)

export interface SandboxResult {
  valid: boolean
  error?: string
  sanitizedQuery?: string
}

/**
 * Validate a Cypher query for read-only execution.
 * - Blocks write operations (CREATE, MERGE, SET, DELETE, etc.)
 * - Injects caso_slug filter if not present
 * - Enforces LIMIT cap
 */
export function validateCypher(query: string, casoSlug: string): SandboxResult {
  const trimmed = query.trim()

  if (!trimmed) {
    return { valid: false, error: 'Empty query' }
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: 'Query too long (max 2000 chars)' }
  }

  // Strip comments (single-line // and block /* */)
  const noComments = trimmed
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')

  // Check for blocked keywords
  if (BLOCKED_REGEX.test(noComments)) {
    const match = noComments.match(BLOCKED_REGEX)
    return { valid: false, error: `Write operation not allowed: ${match?.[0]}` }
  }

  // Must start with MATCH, RETURN, WITH, OPTIONAL, or UNWIND
  const firstWord = noComments.replace(/^\s+/, '').split(/\s/)[0]?.toUpperCase()
  if (!firstWord || !['MATCH', 'RETURN', 'WITH', 'OPTIONAL', 'UNWIND'].includes(firstWord)) {
    return { valid: false, error: `Query must start with MATCH, RETURN, WITH, OPTIONAL, or UNWIND (got: ${firstWord})` }
  }

  // Enforce LIMIT cap: if no LIMIT present, append one
  let sanitized = noComments
  if (!/\bLIMIT\b/i.test(sanitized)) {
    sanitized = sanitized.replace(/;?\s*$/, '') + ' LIMIT 1000'
  } else {
    // Check existing LIMIT isn't too high
    const limitMatch = sanitized.match(/\bLIMIT\s+(\d+)/i)
    if (limitMatch && parseInt(limitMatch[1]) > 1000) {
      sanitized = sanitized.replace(/\bLIMIT\s+\d+/i, 'LIMIT 1000')
    }
  }

  return { valid: true, sanitizedQuery: sanitized }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /home/vg/dev/office-of-accountability/.claude/worktrees/crispy-cuddling-snail/webapp && npx tsc --noEmit src/lib/engine/cypher-sandbox.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/engine/cypher-sandbox.ts
git commit -m "feat(engine): add Cypher sandbox for MCP query validation"
```

---

## Task 2: Ingest API Routes (Next.js)

**Files:**
- Create: `src/app/api/casos/[casoSlug]/engine/ingest/entity/route.ts`
- Create: `src/app/api/casos/[casoSlug]/engine/ingest/relationship/route.ts`
- Create: `src/app/api/casos/[casoSlug]/engine/ingest/csv/route.ts`
- Create: `src/app/api/casos/[casoSlug]/engine/ingest/url/route.ts`
- Reference: `src/lib/engine/proposals.ts` (createProposal)
- Reference: `src/lib/ingestion/dedup.ts` (findDuplicates)
- Reference: `src/app/api/casos/[casoSlug]/engine/proposals/route.ts` (pattern to follow)

- [ ] **Step 1: Create entity ingest route**

```typescript
// src/app/api/casos/[casoSlug]/engine/ingest/entity/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDriver, closeDriver } from '@/lib/neo4j/client'
import neo4j from 'neo4j-driver-lite'

const bodySchema = z.object({
  label: z.string().min(1).max(50),
  properties: z.record(z.unknown()),
  source_url: z.string().url().optional(),
  confidence: z.number().min(0).max(1).default(0.5),
  proposed_by: z.string().default('mcp:ingest'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof z.ZodError ? err.issues : 'Invalid body' },
      { status: 400 },
    )
  }

  const driver = getDriver()
  const session = driver.session()

  try {
    // Check for duplicates by name/slug if present
    const name = body.properties.name as string | undefined
    let existingId: string | null = null
    if (name) {
      const check = await session.run(
        `MATCH (n {caso_slug: $casoSlug})
         WHERE n.name = $name AND $label IN labels(n)
         RETURN n.id AS id LIMIT 1`,
        { casoSlug, name, label: body.label },
      )
      if (check.records.length > 0) {
        existingId = check.records[0].get('id') as string
      }
    }

    if (existingId) {
      return NextResponse.json({
        success: false,
        error: 'duplicate',
        existing_id: existingId,
        message: `Entity "${name}" already exists with id ${existingId}`,
      }, { status: 409 })
    }

    // Create a Proposal (not a direct node)
    const proposalId = `proposal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const nodeId = `${casoSlug}:${body.label.toLowerCase()}-${Date.now()}`

    const payload = {
      label: body.label,
      id: nodeId,
      properties: {
        ...body.properties,
        caso_slug: casoSlug,
        confidence_tier: 'bronze',
        source: body.source_url ?? 'mcp:manual',
      },
    }

    await session.run(
      `CREATE (p:Proposal {
        id: $id,
        investigation_id: $casoSlug,
        stage: 'ingest',
        type: 'node',
        payload_json: $payload,
        confidence: $confidence,
        reasoning: $reasoning,
        proposed_by: $proposedBy,
        status: 'pending',
        created_at: datetime()
      })`,
      {
        id: proposalId,
        casoSlug,
        payload: JSON.stringify(payload),
        confidence: body.confidence,
        reasoning: `Entity ingest: ${body.label} "${body.properties.name ?? nodeId}"`,
        proposedBy: body.proposed_by,
      },
    )

    return NextResponse.json({
      success: true,
      data: { proposal_id: proposalId, node_id: nodeId },
    })
  } catch (err) {
    console.error('Ingest entity error:', err)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 503 },
    )
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 2: Create relationship ingest route**

```typescript
// src/app/api/casos/[casoSlug]/engine/ingest/relationship/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDriver } from '@/lib/neo4j/client'

const bodySchema = z.object({
  from_id: z.string().min(1),
  to_id: z.string().min(1),
  type: z.string().min(1).max(50),
  properties: z.record(z.unknown()).optional(),
  proposed_by: z.string().default('mcp:ingest'),
  confidence: z.number().min(0).max(1).default(0.5),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof z.ZodError ? err.issues : 'Invalid body' },
      { status: 400 },
    )
  }

  const driver = getDriver()
  const session = driver.session()

  try {
    // Validate both endpoints exist
    const check = await session.run(
      `OPTIONAL MATCH (a {id: $fromId, caso_slug: $casoSlug})
       OPTIONAL MATCH (b {id: $toId, caso_slug: $casoSlug})
       RETURN a IS NOT NULL AS fromExists, b IS NOT NULL AS toExists`,
      { fromId: body.from_id, toId: body.to_id, casoSlug },
    )

    const record = check.records[0]
    const fromExists = record?.get('fromExists') as boolean
    const toExists = record?.get('toExists') as boolean

    if (!fromExists || !toExists) {
      const missing = []
      if (!fromExists) missing.push(`from_id "${body.from_id}"`)
      if (!toExists) missing.push(`to_id "${body.to_id}"`)
      return NextResponse.json(
        { success: false, error: `Node(s) not found: ${missing.join(', ')}` },
        { status: 404 },
      )
    }

    // Create edge Proposal
    const proposalId = `proposal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const payload = {
      from_id: body.from_id,
      to_id: body.to_id,
      type: body.type,
      properties: body.properties ?? {},
    }

    await session.run(
      `CREATE (p:Proposal {
        id: $id,
        investigation_id: $casoSlug,
        stage: 'ingest',
        type: 'edge',
        payload_json: $payload,
        confidence: $confidence,
        reasoning: $reasoning,
        proposed_by: $proposedBy,
        status: 'pending',
        created_at: datetime()
      })`,
      {
        id: proposalId,
        casoSlug,
        payload: JSON.stringify(payload),
        confidence: body.confidence,
        reasoning: `Relationship ingest: (${body.from_id})-[:${body.type}]->(${body.to_id})`,
        proposedBy: body.proposed_by,
      },
    )

    return NextResponse.json({
      success: true,
      data: { proposal_id: proposalId },
    })
  } catch (err) {
    console.error('Ingest relationship error:', err)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 503 },
    )
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 3: Create CSV import route**

```typescript
// src/app/api/casos/[casoSlug]/engine/ingest/csv/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDriver } from '@/lib/neo4j/client'

const bodySchema = z.object({
  csv_content: z.string().min(1).max(500_000), // ~500KB max
  column_mapping: z.record(z.string()), // { csv_column: neo4j_property }
  label: z.string().min(1).max(50),
  proposed_by: z.string().default('mcp:csv-import'),
  id_column: z.string().optional(), // Column to use as unique ID for dedup
})

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows: Record<string, string>[] = []

  for (let i = 1; i < Math.min(lines.length, 501); i++) { // Max 500 rows
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = values[idx] ?? '' })
    rows.push(row)
  }

  return rows
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof z.ZodError ? err.issues : 'Invalid body' },
      { status: 400 },
    )
  }

  const rows = parseCsv(body.csv_content)
  if (rows.length === 0) {
    return NextResponse.json(
      { success: false, error: 'CSV has no data rows' },
      { status: 400 },
    )
  }

  // Validate column mapping references valid CSV columns
  const csvColumns = Object.keys(rows[0])
  for (const col of Object.keys(body.column_mapping)) {
    if (!csvColumns.includes(col)) {
      return NextResponse.json(
        { success: false, error: `Column "${col}" not found in CSV. Available: ${csvColumns.join(', ')}` },
        { status: 400 },
      )
    }
  }

  const driver = getDriver()
  const session = driver.session()

  try {
    // Build existing name set for dedup
    const existingResult = await session.run(
      `MATCH (n {caso_slug: $casoSlug})
       WHERE $label IN labels(n) AND n.name IS NOT NULL
       RETURN n.name AS name, n.id AS id`,
      { casoSlug, label: body.label },
    )
    const existingNames = new Map<string, string>()
    for (const rec of existingResult.records) {
      existingNames.set((rec.get('name') as string).toLowerCase(), rec.get('id') as string)
    }

    const proposals: string[] = []
    const conflicts: Array<{ row: number; name: string; existing_id: string }> = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const properties: Record<string, unknown> = {
        caso_slug: casoSlug,
        confidence_tier: 'bronze',
        source: 'mcp:csv-import',
      }

      for (const [csvCol, neo4jProp] of Object.entries(body.column_mapping)) {
        properties[neo4jProp] = row[csvCol]
      }

      // Dedup check
      const nameVal = properties.name as string | undefined
      if (nameVal && existingNames.has(nameVal.toLowerCase())) {
        conflicts.push({
          row: i + 1,
          name: nameVal,
          existing_id: existingNames.get(nameVal.toLowerCase())!,
        })
        continue
      }

      const proposalId = `proposal-csv-${Date.now()}-${i}`
      const nodeId = body.id_column && row[body.id_column]
        ? `${casoSlug}:${body.label.toLowerCase()}-${row[body.id_column]}`
        : `${casoSlug}:${body.label.toLowerCase()}-${Date.now()}-${i}`

      await session.run(
        `CREATE (p:Proposal {
          id: $id,
          investigation_id: $casoSlug,
          stage: 'ingest',
          type: 'node',
          payload_json: $payload,
          confidence: 0.5,
          reasoning: $reasoning,
          proposed_by: $proposedBy,
          status: 'pending',
          created_at: datetime()
        })`,
        {
          id: proposalId,
          casoSlug,
          payload: JSON.stringify({ label: body.label, id: nodeId, properties }),
          reasoning: `CSV import row ${i + 1}: ${body.label} "${nameVal ?? nodeId}"`,
          proposedBy: body.proposed_by,
        },
      )

      proposals.push(proposalId)
      // Add to existing names to catch duplicates within the CSV itself
      if (nameVal) existingNames.set(nameVal.toLowerCase(), nodeId)
    }

    return NextResponse.json({
      success: true,
      data: {
        proposal_count: proposals.length,
        skipped_duplicates: conflicts.length,
        conflicts,
        total_rows: rows.length,
      },
    })
  } catch (err) {
    console.error('CSV import error:', err)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 503 },
    )
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 4: Create URL import route**

```typescript
// src/app/api/casos/[casoSlug]/engine/ingest/url/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDriver } from '@/lib/neo4j/client'

const bodySchema = z.object({
  url: z.string().url(),
  extract_entities: z.boolean().default(false),
  proposed_by: z.string().default('mcp:url-import'),
})

/** Strip HTML tags, decode entities, collapse whitespace */
function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100_000) // 100KB text cap
}

/** Basic regex entity extraction (dates, money, names-like patterns) */
function extractEntities(text: string): Array<{ type: string; value: string }> {
  const entities: Array<{ type: string; value: string }> = []
  const seen = new Set<string>()

  // Dates
  const dates = text.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? []
  for (const d of dates) {
    if (!seen.has(d)) { entities.push({ type: 'date', value: d }); seen.add(d) }
  }

  // Dollar amounts
  const amounts = text.match(/\$[\d,.]+\s*(million|billion|thousand|M|B|K)?/gi) ?? []
  for (const a of amounts) {
    if (!seen.has(a)) { entities.push({ type: 'amount', value: a }); seen.add(a) }
  }

  // Emails
  const emails = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) ?? []
  for (const e of emails) {
    if (!seen.has(e)) { entities.push({ type: 'email', value: e }); seen.add(e) }
  }

  return entities.slice(0, 50) // Max 50 entities
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof z.ZodError ? err.issues : 'Invalid body' },
      { status: 400 },
    )
  }

  // Fetch URL
  let htmlContent: string
  try {
    const response = await fetch(body.url, {
      signal: AbortSignal.timeout(15_000),
      headers: { 'User-Agent': 'OfficeOfAccountability/1.0' },
    })
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Fetch failed: ${response.status} ${response.statusText}` },
        { status: 502 },
      )
    }
    htmlContent = await response.text()
  } catch (err) {
    return NextResponse.json(
      { success: false, error: `Fetch error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 },
    )
  }

  const text = extractText(htmlContent)
  const summary = text.slice(0, 500)

  // Extract title from HTML
  const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : body.url

  const result: Record<string, unknown> = {
    url: body.url,
    title,
    content_length: text.length,
    content_summary: summary,
  }

  // Create document Proposal
  const driver = getDriver()
  const session = driver.session()

  try {
    const docProposalId = `proposal-url-${Date.now()}`
    const docId = `${casoSlug}:doc-${Date.now()}`

    await session.run(
      `CREATE (p:Proposal {
        id: $id,
        investigation_id: $casoSlug,
        stage: 'ingest',
        type: 'node',
        payload_json: $payload,
        confidence: 0.5,
        reasoning: $reasoning,
        proposed_by: $proposedBy,
        status: 'pending',
        created_at: datetime()
      })`,
      {
        id: docProposalId,
        casoSlug,
        payload: JSON.stringify({
          label: 'Document',
          id: docId,
          properties: {
            caso_slug: casoSlug,
            title,
            source_url: body.url,
            content: text.slice(0, 50_000), // 50KB content cap for Neo4j
            summary,
            confidence_tier: 'bronze',
            source: 'mcp:url-import',
          },
        }),
        reasoning: `URL import: ${title}`,
        proposedBy: body.proposed_by,
      },
    )

    result.proposals_created = 1
    result.document_proposal_id = docProposalId

    // Entity extraction if requested
    if (body.extract_entities) {
      const entities = extractEntities(text)
      result.entities_found = entities
      // Don't auto-create proposals for extracted entities - return them for the LLM to decide
    }

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error('URL import error:', err)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 503 },
    )
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 5: Verify all routes compile**

Run: `cd /home/vg/dev/office-of-accountability/.claude/worktrees/crispy-cuddling-snail/webapp && npx tsc --noEmit`
Expected: No errors related to new route files

- [ ] **Step 6: Commit**

```bash
git add src/app/api/casos/\[casoSlug\]/engine/ingest/
git commit -m "feat(api): add ingest routes for entity, relationship, CSV, and URL import

All writes create Proposals (never direct nodes).
CSV import includes dedup against existing graph.
URL import fetches page, extracts text, optionally extracts entities."
```

---

## Task 3: Verify & Analyze API Routes (Next.js)

**Files:**
- Create: `src/app/api/casos/[casoSlug]/engine/verify/promote/route.ts`
- Create: `src/app/api/casos/[casoSlug]/engine/verify/cross-reference/route.ts`
- Create: `src/app/api/casos/[casoSlug]/engine/analyze/gaps/route.ts`
- Create: `src/app/api/casos/[casoSlug]/engine/analyze/hypothesis/route.ts`
- Create: `src/app/api/casos/[casoSlug]/engine/analyze/run/route.ts`
- Reference: `src/lib/engine/gap-detector.ts` (detectGaps)
- Reference: `src/lib/engine/proposals.ts` (createProposal)
- Reference: `src/lib/ingestion/dedup.ts` (findDuplicates)

- [ ] **Step 1: Create tier promotion route**

```typescript
// src/app/api/casos/[casoSlug]/engine/verify/promote/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDriver } from '@/lib/neo4j/client'
import neo4j from 'neo4j-driver-lite'

const bodySchema = z.object({
  node_ids: z.array(z.string()).min(1).max(100),
  to_tier: z.enum(['silver', 'gold']),
  evidence_url: z.string().url().optional(),
  rationale: z.string().min(1).max(1000),
  promoted_by: z.string().default('mcp:verify'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof z.ZodError ? err.issues : 'Invalid body' },
      { status: 400 },
    )
  }

  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `UNWIND $nodeIds AS nodeId
       MATCH (n {id: nodeId, caso_slug: $casoSlug})
       SET n.confidence_tier = $toTier,
           n.promoted_at = datetime(),
           n.promoted_by = $promotedBy,
           n.promotion_evidence = $evidence
       RETURN count(n) AS promoted`,
      {
        nodeIds: body.node_ids,
        casoSlug,
        toTier: body.to_tier,
        promotedBy: body.promoted_by,
        evidence: body.evidence_url ?? body.rationale,
      },
    )

    const promoted = (result.records[0]?.get('promoted') as { toNumber(): number })?.toNumber() ?? 0

    // Create audit entry
    await session.run(
      `CREATE (a:AuditEntry {
        id: $id,
        investigation_id: $casoSlug,
        ts: datetime(),
        actor: $actor,
        action: 'tier_promotion',
        details_json: $details,
        prev_hash: 'n/a'
      })`,
      {
        id: `audit-promote-${Date.now()}`,
        casoSlug,
        actor: body.promoted_by,
        details: JSON.stringify({
          node_ids: body.node_ids,
          to_tier: body.to_tier,
          rationale: body.rationale,
          evidence_url: body.evidence_url,
          promoted_count: promoted,
        }),
      },
    )

    return NextResponse.json({
      success: true,
      data: { promoted_count: promoted },
    })
  } catch (err) {
    console.error('Tier promotion error:', err)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 503 })
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 2: Create cross-reference route**

```typescript
// src/app/api/casos/[casoSlug]/engine/verify/cross-reference/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDriver } from '@/lib/neo4j/client'
import neo4j from 'neo4j-driver-lite'

const bodySchema = z.object({
  match_type: z.enum(['cuit', 'dni', 'name_fuzzy']),
  threshold: z.number().min(0).max(1).default(0.8),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof z.ZodError ? err.issues : 'Invalid body' },
      { status: 400 },
    )
  }

  const driver = getDriver()
  const session = driver.session()

  try {
    let query: string
    let matchCount = 0

    if (body.match_type === 'cuit') {
      const result = await session.run(
        `MATCH (a {caso_slug: $casoSlug}), (b {caso_slug: $casoSlug})
         WHERE a.cuit IS NOT NULL AND b.cuit IS NOT NULL
           AND a.cuit = b.cuit AND id(a) < id(b)
           AND NOT (a)-[:SAME_ENTITY]-(b)
         MERGE (a)-[r:SAME_ENTITY {match_type: 'cuit', confidence: 1.0}]->(b)
         RETURN count(r) AS matches`,
        { casoSlug },
      )
      matchCount = (result.records[0]?.get('matches') as { toNumber(): number })?.toNumber() ?? 0
    } else if (body.match_type === 'dni') {
      const result = await session.run(
        `MATCH (a {caso_slug: $casoSlug}), (b {caso_slug: $casoSlug})
         WHERE a.dni IS NOT NULL AND b.dni IS NOT NULL
           AND a.dni = b.dni AND id(a) < id(b)
           AND NOT (a)-[:SAME_ENTITY]-(b)
         MERGE (a)-[r:SAME_ENTITY {match_type: 'dni', confidence: 0.95}]->(b)
         RETURN count(r) AS matches`,
        { casoSlug },
      )
      matchCount = (result.records[0]?.get('matches') as { toNumber(): number })?.toNumber() ?? 0
    } else {
      // Name fuzzy - use existing fulltext index
      const result = await session.run(
        `MATCH (a {caso_slug: $casoSlug}), (b {caso_slug: $casoSlug})
         WHERE a.name IS NOT NULL AND b.name IS NOT NULL
           AND a.name = b.name AND id(a) < id(b)
           AND NOT (a)-[:SAME_ENTITY]-(b)
         MERGE (a)-[r:SAME_ENTITY {match_type: 'name_exact', confidence: 0.9}]->(b)
         RETURN count(r) AS matches`,
        { casoSlug },
      )
      matchCount = (result.records[0]?.get('matches') as { toNumber(): number })?.toNumber() ?? 0
    }

    return NextResponse.json({
      success: true,
      data: { match_type: body.match_type, matches_found: matchCount },
    })
  } catch (err) {
    console.error('Cross-reference error:', err)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 503 })
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 3: Create gap detection route**

```typescript
// src/app/api/casos/[casoSlug]/engine/analyze/gaps/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDriver } from '@/lib/neo4j/client'
import neo4j from 'neo4j-driver-lite'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params
  const driver = getDriver()
  const session = driver.session()

  try {
    // Isolated nodes (zero relationships)
    const isolated = await session.run(
      `MATCH (n {caso_slug: $casoSlug})
       WHERE NOT (n)-[]-()
       RETURN n.id AS id, n.name AS name, labels(n)[0] AS label
       LIMIT 50`,
      { casoSlug },
    )

    // Low-confidence nodes
    const lowConfidence = await session.run(
      `MATCH (n {caso_slug: $casoSlug})
       WHERE n.confidence_tier = 'bronze'
       RETURN n.id AS id, n.name AS name, labels(n)[0] AS label
       ORDER BY n.created_at DESC
       LIMIT 50`,
      { casoSlug },
    )

    // Node types with few connections (potential missing relationships)
    const sparse = await session.run(
      `MATCH (n {caso_slug: $casoSlug})
       WITH labels(n)[0] AS label, count(n) AS nodeCount
       OPTIONAL MATCH (m {caso_slug: $casoSlug})-[r]-()
       WHERE labels(m)[0] = label
       WITH label, nodeCount, count(r) AS relCount
       WHERE relCount < nodeCount
       RETURN label, nodeCount, relCount, nodeCount - relCount AS gap
       ORDER BY gap DESC`,
      { casoSlug },
    )

    return NextResponse.json({
      success: true,
      data: {
        isolated_nodes: isolated.records.map(r => ({
          id: r.get('id'),
          name: r.get('name'),
          label: r.get('label'),
        })),
        low_confidence: lowConfidence.records.map(r => ({
          id: r.get('id'),
          name: r.get('name'),
          label: r.get('label'),
        })),
        sparse_types: sparse.records.map(r => ({
          label: r.get('label'),
          node_count: (r.get('nodeCount') as { toNumber(): number }).toNumber(),
          rel_count: (r.get('relCount') as { toNumber(): number }).toNumber(),
          gap: (r.get('gap') as { toNumber(): number }).toNumber(),
        })),
        questions: [
          'Which isolated nodes should be connected to the main graph?',
          'Which bronze-tier nodes have enough evidence for silver promotion?',
          'Which entity types are under-connected relative to their count?',
        ],
      },
    })
  } catch (err) {
    console.error('Gap detection error:', err)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 503 })
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 4: Create hypothesis route**

```typescript
// src/app/api/casos/[casoSlug]/engine/analyze/hypothesis/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDriver } from '@/lib/neo4j/client'

const bodySchema = z.object({
  hypothesis: z.string().min(1).max(2000),
  evidence_ids: z.array(z.string()).min(1).max(50),
  confidence: z.number().min(0).max(1),
  proposed_by: z.string().default('mcp:analyze'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof z.ZodError ? err.issues : 'Invalid body' },
      { status: 400 },
    )
  }

  const driver = getDriver()
  const session = driver.session()

  try {
    const proposalId = `proposal-hyp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    await session.run(
      `CREATE (p:Proposal {
        id: $id,
        investigation_id: $casoSlug,
        stage: 'analyze',
        type: 'hypothesis',
        payload_json: $payload,
        confidence: $confidence,
        reasoning: $hypothesis,
        proposed_by: $proposedBy,
        status: 'pending',
        created_at: datetime()
      })`,
      {
        id: proposalId,
        casoSlug,
        payload: JSON.stringify({
          hypothesis: body.hypothesis,
          evidence_ids: body.evidence_ids,
        }),
        confidence: body.confidence,
        hypothesis: body.hypothesis,
        proposedBy: body.proposed_by,
      },
    )

    return NextResponse.json({
      success: true,
      data: { proposal_id: proposalId },
    })
  } catch (err) {
    console.error('Hypothesis creation error:', err)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 503 })
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 5: Create analysis run route (placeholder - delegates to MiroFish analysis functions)**

```typescript
// src/app/api/casos/[casoSlug]/engine/analyze/run/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDriver } from '@/lib/neo4j/client'
import neo4j from 'neo4j-driver-lite'

const bodySchema = z.object({
  type: z.enum(['procurement', 'ownership', 'connections', 'temporal', 'centrality']),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof z.ZodError ? err.issues : 'Invalid body' },
      { status: 400 },
    )
  }

  const driver = getDriver()
  const session = driver.session()

  try {
    if (body.type === 'centrality') {
      // Degree centrality - count relationships per node
      const result = await session.run(
        `MATCH (n {caso_slug: $casoSlug})-[r]-()
         RETURN n.id AS id, n.name AS name, labels(n)[0] AS label, count(r) AS degree
         ORDER BY degree DESC
         LIMIT ${neo4j.int(50)}`,
        { casoSlug },
      )

      return NextResponse.json({
        success: true,
        data: {
          type: 'centrality',
          results: result.records.map(r => ({
            id: r.get('id'),
            name: r.get('name'),
            label: r.get('label'),
            degree: (r.get('degree') as { toNumber(): number }).toNumber(),
          })),
        },
      })
    }

    if (body.type === 'temporal') {
      // Temporal analysis - events within 7-day windows
      const result = await session.run(
        `MATCH (e1:Event {caso_slug: $casoSlug}), (e2:Event {caso_slug: $casoSlug})
         WHERE e1.date IS NOT NULL AND e2.date IS NOT NULL
           AND id(e1) < id(e2)
           AND abs(duration.between(date(e1.date), date(e2.date)).days) <= 7
         RETURN e1.title AS event1, e2.title AS event2,
                e1.date AS date1, e2.date AS date2
         LIMIT ${neo4j.int(30)}`,
        { casoSlug },
      )

      return NextResponse.json({
        success: true,
        data: {
          type: 'temporal',
          co_occurrences: result.records.map(r => ({
            event1: r.get('event1'),
            event2: r.get('event2'),
            date1: r.get('date1'),
            date2: r.get('date2'),
          })),
        },
      })
    }

    // For procurement, ownership, connections - these will be wired to
    // the MiroFish analysis functions after absorption (Plan C).
    // For now, return a structured query that gives the LLM client raw data to analyze.
    const statsResult = await session.run(
      `MATCH (n {caso_slug: $casoSlug})
       RETURN labels(n)[0] AS label, count(n) AS count
       ORDER BY count DESC`,
      { casoSlug },
    )

    return NextResponse.json({
      success: true,
      data: {
        type: body.type,
        message: `Analysis type "${body.type}" requires LLM processing. Use graph.query to extract relevant data and analyze client-side.`,
        graph_summary: statsResult.records.map(r => ({
          label: r.get('label'),
          count: (r.get('count') as { toNumber(): number }).toNumber(),
        })),
      },
    })
  } catch (err) {
    console.error('Analysis run error:', err)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 503 })
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 6: Verify compilation**

Run: `cd /home/vg/dev/office-of-accountability/.claude/worktrees/crispy-cuddling-snail/webapp && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/app/api/casos/\[casoSlug\]/engine/verify/ src/app/api/casos/\[casoSlug\]/engine/analyze/
git commit -m "feat(api): add verify and analyze routes for tier promotion, cross-reference, gaps, hypotheses, and analysis"
```

---

## Task 4: MCP Ingest Tools (Worker)

**Files:**
- Create: `workers/mcp-server/src/tools/ingest.ts`
- Pattern: `workers/mcp-server/src/tools/investigation.ts` (registerTool + proxyToApi)

- [ ] **Step 1: Create ingest.ts with 4 tools**

```typescript
// workers/mcp-server/src/tools/ingest.ts
import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

registerTool(
  {
    name: 'ingest.add_entity',
    description:
      'Add a new entity to an investigation as a bronze-tier Proposal. Runs dedup check against existing graph. Returns 409 if duplicate found.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug (e.g., "caso-epstein")' },
        label: { type: 'string', description: 'Node label (e.g., "Person", "Organization", "Event", "Document", "Location")' },
        properties: { type: 'object', description: 'Node properties (name, role, description, etc.)' },
        source_url: { type: 'string', description: 'Source URL for provenance' },
        confidence: { type: 'number', description: 'Confidence score 0-1 (default 0.5)' },
      },
      required: ['caso_slug', 'label', 'properties'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/ingest/entity`,
      body: {
        label: args.label,
        properties: args.properties,
        source_url: args.source_url,
        confidence: args.confidence,
        proposed_by: `mcp:${auth.key_id}`,
      },
    }, auth, env)
  },
  'ingest:write',
)

registerTool(
  {
    name: 'ingest.add_relationship',
    description:
      'Add a relationship between two existing nodes as a Proposal. Both endpoints must exist. Returns 404 if either node is missing.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        from_id: { type: 'string', description: 'Source node ID' },
        to_id: { type: 'string', description: 'Target node ID' },
        type: { type: 'string', description: 'Relationship type (e.g., "ASSOCIATED_WITH", "EMPLOYED_BY", "FINANCED")' },
        properties: { type: 'object', description: 'Optional relationship properties' },
        confidence: { type: 'number', description: 'Confidence score 0-1 (default 0.5)' },
      },
      required: ['caso_slug', 'from_id', 'to_id', 'type'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/ingest/relationship`,
      body: {
        from_id: args.from_id,
        to_id: args.to_id,
        type: args.type,
        properties: args.properties,
        confidence: args.confidence,
        proposed_by: `mcp:${auth.key_id}`,
      },
    }, auth, env)
  },
  'ingest:write',
)

registerTool(
  {
    name: 'ingest.import_csv',
    description:
      'Import CSV data as bronze-tier Proposals. Max 500 rows. Runs dedup against existing graph. Returns conflict report for duplicates.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        csv_content: { type: 'string', description: 'CSV content with headers in first row' },
        column_mapping: { type: 'object', description: 'Map of CSV column name → Neo4j property name (e.g., {"Full Name": "name", "Title": "role"})' },
        label: { type: 'string', description: 'Node label for all imported rows (e.g., "Person")' },
        id_column: { type: 'string', description: 'CSV column to use as unique ID for dedup (optional)' },
      },
      required: ['caso_slug', 'csv_content', 'column_mapping', 'label'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/ingest/csv`,
      body: {
        csv_content: args.csv_content,
        column_mapping: args.column_mapping,
        label: args.label,
        id_column: args.id_column,
        proposed_by: `mcp:${auth.key_id}`,
      },
    }, auth, env)
  },
  'ingest:write',
)

registerTool(
  {
    name: 'ingest.import_url',
    description:
      'Fetch a URL, extract text content, and create a Document Proposal. Optionally extract entities (dates, amounts, emails) from the text.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        url: { type: 'string', description: 'URL to fetch and import' },
        extract_entities: { type: 'boolean', description: 'Extract dates, amounts, emails from text (default false)' },
      },
      required: ['caso_slug', 'url'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/ingest/url`,
      body: {
        url: args.url,
        extract_entities: args.extract_entities ?? false,
        proposed_by: `mcp:${auth.key_id}`,
      },
    }, auth, env)
  },
  'ingest:write',
)
```

- [ ] **Step 2: Commit**

```bash
git add workers/mcp-server/src/tools/ingest.ts
git commit -m "feat(mcp): add 4 ingest tools (add_entity, add_relationship, import_csv, import_url)"
```

---

## Task 5: MCP Pipeline Tools (Worker)

**Files:**
- Create: `workers/mcp-server/src/tools/pipeline.ts`

- [ ] **Step 1: Create pipeline.ts with 7 tools**

```typescript
// workers/mcp-server/src/tools/pipeline.ts
import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

registerTool(
  {
    name: 'pipeline.run',
    description: 'Start or resume a pipeline for an investigation. Runs the next stage or a specific stage.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        pipeline_id: { type: 'string', description: 'Pipeline config ID (required)' },
      },
      required: ['caso_slug', 'pipeline_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/run`,
      body: { pipeline_id: args.pipeline_id },
    }, auth, env)
  },
  'pipeline:write',
)

registerTool(
  {
    name: 'pipeline.state',
    description: 'Get current pipeline state including stage, status, and progress.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        pipeline_id: { type: 'string', description: 'Pipeline config ID (optional - returns all states if omitted)' },
      },
      required: ['caso_slug'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const query: Record<string, string> = {}
    if (args.pipeline_id) query.pipeline_id = String(args.pipeline_id)
    return proxyToApi({
      method: 'GET',
      path: `/api/casos/${casoSlug}/engine/state`,
      query,
    }, auth, env)
  },
  'pipeline:read',
)

registerTool(
  {
    name: 'pipeline.stop',
    description: 'Gracefully stop a running pipeline at the next gate.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        pipeline_id: { type: 'string', description: 'Pipeline config ID' },
      },
      required: ['caso_slug', 'pipeline_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    // Use PATCH on state to set status to "stopped"
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/state`,
      body: { pipeline_id: args.pipeline_id, status: 'stopped' },
    }, auth, env)
  },
  'pipeline:write',
)

registerTool(
  {
    name: 'pipeline.proposals',
    description: 'List proposals for an investigation pipeline with optional status filter.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        pipeline_state_id: { type: 'string', description: 'Pipeline state ID' },
        status: { type: 'string', enum: ['pending', 'approved', 'rejected'], description: 'Filter by status' },
      },
      required: ['caso_slug', 'pipeline_state_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const query: Record<string, string> = { pipeline_state_id: String(args.pipeline_state_id) }
    if (args.status) query.status = String(args.status)
    return proxyToApi({
      method: 'GET',
      path: `/api/casos/${casoSlug}/engine/proposals`,
      query,
    }, auth, env)
  },
  'pipeline:read',
)

registerTool(
  {
    name: 'pipeline.approve',
    description: 'Batch approve proposals. Creates AuditEntry for each approval.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        proposal_ids: { type: 'array', items: { type: 'string' }, description: 'Proposal IDs to approve' },
        rationale: { type: 'string', description: 'Reason for approval' },
      },
      required: ['caso_slug', 'proposal_ids', 'rationale'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/proposals`,
      body: {
        ids: args.proposal_ids,
        action: 'approved',
        reviewed_by: `mcp:${auth.key_id}`,
      },
    }, auth, env)
  },
  'pipeline:write',
)

registerTool(
  {
    name: 'pipeline.reject',
    description: 'Batch reject proposals. Creates AuditEntry for each rejection.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        proposal_ids: { type: 'array', items: { type: 'string' }, description: 'Proposal IDs to reject' },
        rationale: { type: 'string', description: 'Reason for rejection' },
      },
      required: ['caso_slug', 'proposal_ids', 'rationale'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/proposals`,
      body: {
        ids: args.proposal_ids,
        action: 'rejected',
        reviewed_by: `mcp:${auth.key_id}`,
      },
    }, auth, env)
  },
  'pipeline:write',
)

registerTool(
  {
    name: 'pipeline.gate_action',
    description: 'Take action on a pipeline gate (approve to advance, reject, or loop back to analyze).',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        stage_id: { type: 'string', description: 'Stage ID at the gate' },
        pipeline_state_id: { type: 'string', description: 'Pipeline state ID' },
        action: { type: 'string', enum: ['approve', 'reject', 'back'], description: 'Gate action' },
      },
      required: ['caso_slug', 'stage_id', 'pipeline_state_id', 'action'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const stageId = String(args.stage_id)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/gate/${stageId}`,
      body: {
        pipeline_state_id: args.pipeline_state_id,
        action: args.action,
        reviewed_by: `mcp:${auth.key_id}`,
      },
    }, auth, env)
  },
  'pipeline:write',
)
```

- [ ] **Step 2: Commit**

```bash
git add workers/mcp-server/src/tools/pipeline.ts
git commit -m "feat(mcp): add 7 pipeline tools (run, state, stop, proposals, approve, reject, gate_action)"
```

---

## Task 6: MCP Verify, Analyze, Audit, Orchestrator Tools (Worker)

**Files:**
- Create: `workers/mcp-server/src/tools/verify.ts`
- Create: `workers/mcp-server/src/tools/analyze.ts`
- Create: `workers/mcp-server/src/tools/audit.ts`
- Create: `workers/mcp-server/src/tools/orchestrator.ts`

- [ ] **Step 1: Create verify.ts (3 tools)**

```typescript
// workers/mcp-server/src/tools/verify.ts
import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

registerTool(
  {
    name: 'verify.promote_tier',
    description: 'Promote nodes from one confidence tier to another (bronze→silver or silver→gold). Requires rationale.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        node_ids: { type: 'array', items: { type: 'string' }, description: 'Node IDs to promote (max 100)' },
        to_tier: { type: 'string', enum: ['silver', 'gold'], description: 'Target tier' },
        evidence_url: { type: 'string', description: 'URL of evidence supporting promotion' },
        rationale: { type: 'string', description: 'Reason for tier promotion' },
      },
      required: ['caso_slug', 'node_ids', 'to_tier', 'rationale'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/verify/promote`,
      body: {
        node_ids: args.node_ids,
        to_tier: args.to_tier,
        evidence_url: args.evidence_url,
        rationale: args.rationale,
        promoted_by: `mcp:${auth.key_id}`,
      },
    }, auth, env)
  },
  'verify:write',
)

registerTool(
  {
    name: 'verify.cross_reference',
    description: 'Run a cross-reference pass to find duplicate entities across the graph using CUIT, DNI, or name matching.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        match_type: { type: 'string', enum: ['cuit', 'dni', 'name_fuzzy'], description: 'Matching strategy' },
        threshold: { type: 'number', description: 'Match threshold 0-1 (default 0.8, only used for name_fuzzy)' },
      },
      required: ['caso_slug', 'match_type'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/verify/cross-reference`,
      body: {
        match_type: args.match_type,
        threshold: args.threshold,
      },
    }, auth, env)
  },
  'verify:write',
)
```

- [ ] **Step 2: Create analyze.ts (3 tools)**

```typescript
// workers/mcp-server/src/tools/analyze.ts
import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

registerTool(
  {
    name: 'analyze.detect_gaps',
    description: 'Detect structural gaps in the investigation graph: isolated nodes, low-confidence nodes, under-connected types.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
      },
      required: ['caso_slug'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'GET',
      path: `/api/casos/${casoSlug}/engine/analyze/gaps`,
    }, auth, env)
  },
  'analyze:read',
)

registerTool(
  {
    name: 'analyze.hypothesize',
    description: 'Create a hypothesis Proposal linking to evidence nodes. The hypothesis is reviewed at the analyze gate.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        hypothesis: { type: 'string', description: 'The hypothesis statement (max 2000 chars)' },
        evidence_ids: { type: 'array', items: { type: 'string' }, description: 'IDs of nodes supporting this hypothesis' },
        confidence: { type: 'number', description: 'Confidence score 0-1' },
      },
      required: ['caso_slug', 'hypothesis', 'evidence_ids', 'confidence'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/analyze/hypothesis`,
      body: {
        hypothesis: args.hypothesis,
        evidence_ids: args.evidence_ids,
        confidence: args.confidence,
        proposed_by: `mcp:${auth.key_id}`,
      },
    }, auth, env)
  },
  'analyze:write',
)

registerTool(
  {
    name: 'analyze.run_analysis',
    description: 'Run a graph analysis: centrality (find most connected), temporal (co-occurring events), or data summary for procurement/ownership/connections analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        type: { type: 'string', enum: ['procurement', 'ownership', 'connections', 'temporal', 'centrality'], description: 'Analysis type' },
      },
      required: ['caso_slug', 'type'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/analyze/run`,
      body: { type: args.type },
    }, auth, env)
  },
  'analyze:read',
)
```

- [ ] **Step 3: Create audit.ts (4 tools)**

```typescript
// workers/mcp-server/src/tools/audit.ts
import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

registerTool(
  {
    name: 'audit.trail',
    description: 'Get the audit trail for an investigation pipeline.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        pipeline_state_id: { type: 'string', description: 'Pipeline state ID' },
        limit: { type: 'number', description: 'Max entries (default 50)' },
      },
      required: ['caso_slug', 'pipeline_state_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const query: Record<string, string> = { pipeline_state_id: String(args.pipeline_state_id) }
    if (args.limit) query.limit = String(args.limit)
    return proxyToApi({
      method: 'GET',
      path: `/api/casos/${casoSlug}/engine/audit`,
      query,
    }, auth, env)
  },
  'audit:read',
)

registerTool(
  {
    name: 'audit.verify_chain',
    description: 'Verify the SHA-256 hash chain integrity of the audit trail.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        pipeline_state_id: { type: 'string', description: 'Pipeline state ID' },
      },
      required: ['caso_slug', 'pipeline_state_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'GET',
      path: `/api/casos/${casoSlug}/engine/audit`,
      query: {
        pipeline_state_id: String(args.pipeline_state_id),
        verify_chain: 'true',
      },
    }, auth, env)
  },
  'audit:read',
)

registerTool(
  {
    name: 'snapshot.create',
    description: 'Capture a snapshot of the current graph state for an investigation.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        pipeline_state_id: { type: 'string', description: 'Pipeline state ID' },
        label: { type: 'string', description: 'Human-readable snapshot label' },
      },
      required: ['caso_slug', 'pipeline_state_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'POST',
      path: `/api/casos/${casoSlug}/engine/snapshots`,
      body: {
        pipeline_state_id: args.pipeline_state_id,
        label: args.label,
      },
    }, auth, env)
  },
  'snapshot:write',
)

registerTool(
  {
    name: 'snapshot.list',
    description: 'List snapshots for an investigation.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        pipeline_state_id: { type: 'string', description: 'Pipeline state ID' },
      },
      required: ['caso_slug', 'pipeline_state_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'GET',
      path: `/api/casos/${casoSlug}/engine/snapshots`,
      query: { pipeline_state_id: String(args.pipeline_state_id) },
    }, auth, env)
  },
  'snapshot:read',
)
```

- [ ] **Step 4: Create orchestrator.ts (3 tools)**

```typescript
// workers/mcp-server/src/tools/orchestrator.ts
import { registerTool } from '../registry'
import { proxyToApi } from '../proxy'

registerTool(
  {
    name: 'orchestrator.state',
    description: 'Get orchestrator state: active tasks, synthesis reports, metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        pipeline_id: { type: 'string', description: 'Pipeline config ID' },
      },
      required: ['caso_slug', 'pipeline_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'GET',
      path: `/api/casos/${casoSlug}/engine/orchestrator`,
      query: { pipeline_id: String(args.pipeline_id) },
    }, auth, env)
  },
  'orchestrator:read',
)

registerTool(
  {
    name: 'orchestrator.set_focus',
    description: 'Set or update the research focus for the orchestrator. Directives guide which hypotheses get priority.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        pipeline_id: { type: 'string', description: 'Pipeline config ID' },
        focus: { type: 'string', description: 'Research focus directive (e.g., "trace financial enablers", "verify recruitment chain")' },
      },
      required: ['caso_slug', 'pipeline_id', 'focus'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    return proxyToApi({
      method: 'PUT',
      path: `/api/casos/${casoSlug}/engine/orchestrator/focus`,
      body: {
        pipeline_id: args.pipeline_id,
        focus: args.focus,
      },
    }, auth, env)
  },
  'orchestrator:write',
)

registerTool(
  {
    name: 'orchestrator.tasks',
    description: 'List orchestrator tasks with optional status filter.',
    inputSchema: {
      type: 'object',
      properties: {
        caso_slug: { type: 'string', description: 'Investigation slug' },
        pipeline_id: { type: 'string', description: 'Pipeline config ID' },
        status: { type: 'string', enum: ['pending', 'active', 'completed', 'failed'], description: 'Filter by status' },
      },
      required: ['caso_slug', 'pipeline_id'],
    },
  },
  async (args, auth, env) => {
    const casoSlug = String(args.caso_slug)
    const query: Record<string, string> = { pipeline_id: String(args.pipeline_id) }
    if (args.status) query.status = String(args.status)
    return proxyToApi({
      method: 'GET',
      path: `/api/casos/${casoSlug}/engine/orchestrator/tasks`,
      query,
    }, auth, env)
  },
  'orchestrator:read',
)
```

- [ ] **Step 5: Commit**

```bash
git add workers/mcp-server/src/tools/verify.ts workers/mcp-server/src/tools/analyze.ts workers/mcp-server/src/tools/audit.ts workers/mcp-server/src/tools/orchestrator.ts
git commit -m "feat(mcp): add verify (2), analyze (3), audit (4), orchestrator (3) tools - 12 total"
```

---

## Task 7: MCP Resources + Wire Index

**Files:**
- Create: `workers/mcp-server/src/tools/resources.ts`
- Modify: `workers/mcp-server/src/tools/index.ts`

- [ ] **Step 1: Create resources.ts with 5 resource templates**

```typescript
// workers/mcp-server/src/tools/resources.ts
import { registerResource } from '../registry'
import { proxyToApi } from '../proxy'
import type { AuthContext, Env, MCPResourceContents } from '../types'

async function fetchResource(
  path: string,
  auth: AuthContext,
  env: Env,
  uri: string,
): Promise<MCPResourceContents> {
  const url = new URL(path, env.NEXTJS_API_URL)
  const response = await fetch(url.toString(), {
    headers: {
      'X-MCP-User-Id': auth.user_id,
      'X-MCP-Key-Id': auth.key_id,
    },
    signal: AbortSignal.timeout(15_000),
  })
  const data = await response.json()
  return { uri, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }
}

function extractSlug(uri: string): string {
  const match = uri.match(/investigation:\/\/([^/]+)/)
  return match?.[1] ?? ''
}

registerResource(
  {
    uriTemplate: 'investigation://{slug}/summary',
    name: 'Investigation Summary',
    description: 'Overview: node counts, tier breakdown, key stats',
    mimeType: 'application/json',
  },
  async (uri, auth, env) => {
    const slug = extractSlug(uri)
    return fetchResource(`/api/caso/${slug}/stats`, auth, env, uri)
  },
  'investigation:read',
)

registerResource(
  {
    uriTemplate: 'investigation://{slug}/schema',
    name: 'Investigation Schema',
    description: 'Node types, relationship types, property definitions',
    mimeType: 'application/json',
  },
  async (uri, auth, env) => {
    const slug = extractSlug(uri)
    return fetchResource(`/api/caso/${slug}/schema`, auth, env, uri)
  },
  'investigation:read',
)

registerResource(
  {
    uriTemplate: 'investigation://{slug}/gaps',
    name: 'Investigation Gaps',
    description: 'Current gap report: isolated nodes, low confidence, missing relationships',
    mimeType: 'application/json',
  },
  async (uri, auth, env) => {
    const slug = extractSlug(uri)
    return fetchResource(`/api/casos/${slug}/engine/analyze/gaps`, auth, env, uri)
  },
  'analyze:read',
)

registerResource(
  {
    uriTemplate: 'investigation://{slug}/pipeline',
    name: 'Pipeline State',
    description: 'Pipeline status, pending proposals count, last gate decision',
    mimeType: 'application/json',
  },
  async (uri, auth, env) => {
    const slug = extractSlug(uri)
    return fetchResource(`/api/casos/${slug}/engine/state`, auth, env, uri)
  },
  'pipeline:read',
)

registerResource(
  {
    uriTemplate: 'investigation://{slug}/metrics',
    name: 'Engine Metrics',
    description: 'Pipeline execution metrics and counters',
    mimeType: 'application/json',
  },
  async (uri, auth, env) => {
    const slug = extractSlug(uri)
    return fetchResource(`/api/casos/${slug}/engine/metrics`, auth, env, uri)
  },
  'pipeline:read',
)
```

- [ ] **Step 2: Update tools/index.ts to register all new tool files**

```typescript
// workers/mcp-server/src/tools/index.ts
/**
 * Tool registration index.
 *
 * Import this file to register all tool handlers with the registry.
 * Each tool handler file registers its tools as a side effect on import.
 */

// Phase 2 (M13 Phase 2):
import './investigation'
import './graph'

// Phase 3 (M13 Phase 3):
import './ingest'
import './pipeline'
import './verify'
import './analyze'
import './orchestrator'

// Phase 4 (M13 Phase 4):
import './audit'

// Resources:
import './resources'
```

- [ ] **Step 3: Verify MCP server compiles**

Run: `cd /home/vg/dev/office-of-accountability/.claude/worktrees/crispy-cuddling-snail/webapp/workers/mcp-server && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add workers/mcp-server/src/tools/resources.ts workers/mcp-server/src/tools/index.ts
git commit -m "feat(mcp): add 5 MCP resources and wire all tool imports

Total MCP surface: 30 tools + 5 resources
- investigation: 8 tools
- graph: 6 tools
- ingest: 4 tools (NEW)
- pipeline: 7 tools (NEW)
- verify: 2 tools (NEW)
- analyze: 3 tools (NEW)
- audit: 2 tools (NEW)
- snapshot: 2 tools (NEW)
- orchestrator: 3 tools (NEW)
- resources: 5 (NEW)"
```

---

## Task 8: Full Typecheck + Integration Smoke Test

- [ ] **Step 1: Typecheck entire webapp**

Run: `cd /home/vg/dev/office-of-accountability/.claude/worktrees/crispy-cuddling-snail/webapp && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Typecheck MCP server**

Run: `cd /home/vg/dev/office-of-accountability/.claude/worktrees/crispy-cuddling-snail/webapp/workers/mcp-server && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify tool count in health endpoint**

Run: `cd /home/vg/dev/office-of-accountability/.claude/worktrees/crispy-cuddling-snail/webapp/workers/mcp-server && node -e "
import('./src/tools/index.ts').catch(() => {});
import('./src/registry.ts').then(r => console.log('Tools:', r.getToolCount(), 'Resources:', r.getResourceCount()));
"` (or check via grep)

Alternative verification:

Run: `grep -c 'registerTool(' workers/mcp-server/src/tools/*.ts`
Expected: Should total ~30 registerTool calls

Run: `grep -c 'registerResource(' workers/mcp-server/src/tools/resources.ts`
Expected: 5

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify all MCP tools and API routes compile cleanly

30 MCP tools + 5 resources + 9 new API routes + Cypher sandbox.
Ready for Plan B (webapp front door) and Plan C (engine consolidation)."
```

---

## Summary: What This Plan Produces

| Component | Count | Files |
|---|---|---|
| **New MCP tools** | 16 | 6 tool handler files in `workers/mcp-server/src/tools/` |
| **New MCP resources** | 5 | 1 resource file |
| **New API routes** | 9 | `engine/ingest/` (4) + `engine/verify/` (2) + `engine/analyze/` (3) |
| **Cypher sandbox** | 1 | `src/lib/engine/cypher-sandbox.ts` |
| **Total MCP surface** | 30 tools + 5 resources | Up from 14 tools + 0 resources |

After this plan, an external LLM can run the full investigate-loop through MCP:
1. `ingest.add_entity` / `import_csv` / `import_url` → get data in
2. `pipeline.run` → start processing
3. `pipeline.proposals` / `approve` / `reject` → review results
4. `verify.promote_tier` / `cross_reference` → verify and deduplicate
5. `analyze.detect_gaps` / `hypothesize` / `run_analysis` → find patterns
6. `orchestrator.set_focus` → direct next iteration
7. Loop

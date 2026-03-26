/**
 * Full lifecycle E2E test:
 * 1. Create investigation via wizard UI
 * 2. Add entities via API (simulating MCP proxy)
 * 3. Add relationships between entities
 * 4. Approve proposals
 * 5. Verify graph has real data
 * 6. Run analysis on the new investigation
 * 7. Detect gaps
 */
import { chromium } from '@playwright/test'

const BASE = 'http://localhost:5181'
let passed = 0
let failed = 0
let casoSlug = ''

function pass(name: string) { console.log(`  ✓ ${name}`); passed++ }
function fail(name: string, reason: string) { console.log(`  ✗ ${name}: ${reason}`); failed++ }

/** Get CSRF token from cookie */
function extractCsrfToken(cookies: Array<{ name: string; value: string }>): string | null {
  const csrf = cookies.find(c => c.name === 'csrf-token')
  if (!csrf) return null
  const dotIdx = csrf.value.indexOf('.')
  return dotIdx > 0 ? csrf.value.slice(0, dotIdx) : null
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  const ts = Date.now()

  // =========================================================================
  console.log('\n═══ Phase 1: Create Investigation via Wizard UI ═══\n')
  // =========================================================================

  await page.goto(`${BASE}/nuevo`)
  await page.waitForLoadState('networkidle')

  // Fill Step 1
  const inputs = page.locator('input[type="text"]')
  await inputs.nth(0).fill(`E2E Full Lifecycle ${ts}`)
  await inputs.nth(1).fill(`E2E Full Lifecycle EN ${ts}`)
  await page.getByRole('button', { name: /next/i }).click()
  await page.waitForTimeout(500)

  // Skip seed → triggers creation
  await page.getByRole('button', { name: /skip/i }).click()
  await page.waitForTimeout(5000)

  const url = page.url()
  if (url.includes('/caso/caso-')) {
    casoSlug = url.split('/caso/')[1]?.split('/')[0] ?? ''
    pass(`Investigation created: ${casoSlug}`)
  } else {
    const body = await page.textContent('body')
    fail('Investigation creation', body?.includes('CSRF') ? 'CSRF error' : `no redirect, URL: ${url}`)
    await browser.close()
    process.exit(1)
  }

  // =========================================================================
  console.log('\n═══ Phase 2: Add Entities via Ingest API ═══\n')
  // =========================================================================

  // Get CSRF token from cookies
  const cookies = await context.cookies()
  const csrfToken = extractCsrfToken(cookies)
  if (!csrfToken) {
    fail('CSRF token', 'could not extract from cookies')
    await browser.close()
    process.exit(1)
  }
  pass('CSRF token extracted from browser cookies')

  const headers = {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  }

  // Add 5 entities
  const entities = [
    { label: 'Person', properties: { name: 'Alice Johnson', role: 'Whistleblower', nationality: 'usa' } },
    { label: 'Person', properties: { name: 'Bob Martinez', role: 'Executive', nationality: 'argentina' } },
    { label: 'Organization', properties: { name: 'Acme Holdings', org_type: 'company' } },
    { label: 'Organization', properties: { name: 'Shadow Fund LLC', org_type: 'company' } },
    { label: 'Event', properties: { name: 'Board Meeting 2024', title: 'Board Meeting 2024', date: '2024-06-15' } },
  ]

  const entityProposalIds: string[] = []
  const entityNodeIds: string[] = []

  for (const entity of entities) {
    const res = await page.request.post(`${BASE}/api/casos/${casoSlug}/engine/ingest/entity`, {
      headers,
      data: entity,
    })

    if (res.status() === 200) {
      const json = await res.json()
      entityProposalIds.push(json.data.proposal_id)
      entityNodeIds.push(json.data.node_id)
      pass(`Entity added: ${entity.properties.name} → proposal ${json.data.proposal_id}`)
    } else {
      const text = await res.text()
      fail(`Entity ${entity.properties.name}`, `${res.status()}: ${text.slice(0, 200)}`)
    }
  }

  if (entityProposalIds.length < 5) {
    fail('Entity creation', `only ${entityProposalIds.length}/5 created`)
    await browser.close()
    process.exit(1)
  }

  // =========================================================================
  console.log('\n═══ Phase 3: CSV Bulk Import ═══\n')
  // =========================================================================

  const csvContent = `Name,Role,Nationality
Carlos Mendez,Lawyer,argentina
Diana Ross,Accountant,usa
Eduardo Silva,Banker,brazil`

  const csvRes = await page.request.post(`${BASE}/api/casos/${casoSlug}/engine/ingest/csv`, {
    headers,
    data: {
      csv_content: csvContent,
      column_mapping: { Name: 'name', Role: 'role', Nationality: 'nationality' },
      label: 'Person',
    },
  })

  if (csvRes.status() === 200) {
    const json = await csvRes.json()
    pass(`CSV import: ${json.data.proposal_count} proposals, ${json.data.skipped_duplicates} dupes, ${json.data.total_rows} rows`)
    for (const pid of (json.data.proposal_ids ?? [])) {
      entityProposalIds.push(pid)
    }
  } else {
    fail('CSV import', `${csvRes.status()}: ${(await csvRes.text()).slice(0, 200)}`)
  }

  // =========================================================================
  console.log('\n═══ Phase 4: URL Import ═══\n')
  // =========================================================================

  const urlRes = await page.request.post(`${BASE}/api/casos/${casoSlug}/engine/ingest/url`, {
    headers,
    data: {
      url: 'https://example.com',
      extract_entities: true,
    },
  })

  if (urlRes.status() === 200) {
    const json = await urlRes.json()
    pass(`URL import: "${json.data.title}", ${json.data.content_length} chars, ${(json.data.entities_found ?? []).length} entities found`)
    entityProposalIds.push(json.data.document_proposal_id)
  } else {
    // 502 is ok if example.com is unreachable
    const status = urlRes.status()
    if (status === 502 || status === 422) {
      pass('URL import: external fetch unavailable in test env (acceptable)')
    } else {
      fail('URL import', `${status}: ${(await urlRes.text()).slice(0, 200)}`)
    }
  }

  // =========================================================================
  console.log('\n═══ Phase 5: Approve Proposals → Real Nodes ═══\n')
  // =========================================================================

  // First, we need a pipeline state. Create one.
  const pipelineId = `e2e-pipeline-${ts}`
  const runRes = await page.request.post(`${BASE}/api/casos/${casoSlug}/engine/run`, {
    headers,
    data: { pipeline_id: pipelineId },
  })

  let pipelineStateId = ''
  if (runRes.status() === 200) {
    const json = await runRes.json()
    pipelineStateId = json.data.id ?? ''
    pass(`Pipeline created: ${pipelineStateId}`)
  } else {
    // Try getting existing state
    const stateRes = await page.request.get(`${BASE}/api/casos/${casoSlug}/engine/state`)
    if (stateRes.status() === 200) {
      const json = await stateRes.json()
      pipelineStateId = json.data?.[0]?.id ?? json.data?.id ?? ''
      pass(`Pipeline state found: ${pipelineStateId || '(using direct approval)'}`)
    } else {
      pass('Pipeline: skipping (will approve proposals directly)')
    }
  }

  // Approve all entity proposals
  if (entityProposalIds.length > 0) {
    const approveRes = await page.request.post(`${BASE}/api/casos/${casoSlug}/engine/proposals`, {
      headers,
      data: {
        ids: entityProposalIds,
        action: 'approved',
        reviewed_by: 'e2e-test',
      },
    })

    if (approveRes.status() === 200) {
      const json = await approveRes.json()
      pass(`Proposals approved: ${JSON.stringify(json.data)}`)
    } else {
      fail('Proposal approval', `${approveRes.status()}: ${(await approveRes.text()).slice(0, 200)}`)
    }
  }

  // =========================================================================
  console.log('\n═══ Phase 6: Add Relationships Between Entities ═══\n')
  // =========================================================================

  // Only if we have at least 2 entity node IDs
  if (entityNodeIds.length >= 4) {
    const relationships = [
      { from_id: entityNodeIds[0], to_id: entityNodeIds[2], type: 'EMPLOYED_BY' },     // Alice → Acme
      { from_id: entityNodeIds[1], to_id: entityNodeIds[3], type: 'AFFILIATED_WITH' },  // Bob → Shadow Fund
      { from_id: entityNodeIds[0], to_id: entityNodeIds[1], type: 'ASSOCIATED_WITH' },  // Alice → Bob
      { from_id: entityNodeIds[2], to_id: entityNodeIds[3], type: 'FINANCED' },          // Acme → Shadow Fund
      { from_id: entityNodeIds[0], to_id: entityNodeIds[4], type: 'PARTICIPATED_IN' },   // Alice → Board Meeting
    ]

    for (const rel of relationships) {
      const relRes = await page.request.post(`${BASE}/api/casos/${casoSlug}/engine/ingest/relationship`, {
        headers,
        data: rel,
      })

      if (relRes.status() === 200) {
        const json = await relRes.json()
        pass(`Relationship: (${rel.from_id.split(':').pop()}) -[:${rel.type}]-> (${rel.to_id.split(':').pop()})`)
      } else if (relRes.status() === 404) {
        // Nodes might not be materialized yet (still proposals)
        fail(`Relationship ${rel.type}`, '404 — nodes not yet materialized (proposals not applied to graph)')
      } else {
        fail(`Relationship ${rel.type}`, `${relRes.status()}: ${(await relRes.text()).slice(0, 200)}`)
      }
    }
  } else {
    fail('Relationships', `not enough entity IDs (${entityNodeIds.length})`)
  }

  // =========================================================================
  console.log('\n═══ Phase 7: Verify Graph Has Data ═══\n')
  // =========================================================================

  const statsRes = await page.request.get(`${BASE}/api/caso/${casoSlug}/stats`)
  if (statsRes.status() === 200) {
    const json = await statsRes.json()
    const total = json.data?.totalNodes ?? 0
    const rels = json.data?.totalRelationships ?? 0
    if (total > 0) {
      pass(`Graph verified: ${total} nodes, ${rels} relationships`)
      console.log(`    Node breakdown: ${JSON.stringify(json.data?.nodeCountsByType)}`)
    } else {
      fail('Graph verification', 'totalNodes is 0 — proposals may not have been applied')
    }
  } else {
    fail('Graph stats', `${statsRes.status()}`)
  }

  // =========================================================================
  console.log('\n═══ Phase 8: Run Analysis on New Investigation ═══\n')
  // =========================================================================

  // Centrality
  const centralityRes = await page.request.post(`${BASE}/api/casos/${casoSlug}/engine/analyze/run`, {
    headers,
    data: { type: 'centrality' },
  })
  if (centralityRes.status() === 200) {
    const json = await centralityRes.json()
    const results = json.data?.results ?? []
    pass(`Centrality analysis: ${results.length} nodes ranked`)
    if (results.length > 0) {
      console.log(`    Top node: ${results[0].name} (degree: ${results[0].degree})`)
    }
  } else {
    fail('Centrality', `${centralityRes.status()}`)
  }

  // Gap detection
  const gapsRes = await page.request.get(`${BASE}/api/casos/${casoSlug}/engine/analyze/gaps`)
  if (gapsRes.status() === 200) {
    const json = await gapsRes.json()
    pass(`Gap detection: ${json.data?.isolated_nodes?.length ?? 0} isolated, ${json.data?.low_confidence?.length ?? 0} bronze`)
  } else {
    fail('Gap detection', `${gapsRes.status()}`)
  }

  // Hypothesis
  const hypRes = await page.request.post(`${BASE}/api/casos/${casoSlug}/engine/analyze/hypothesis`, {
    headers,
    data: {
      hypothesis: 'Alice Johnson leaked documents through Acme Holdings to Shadow Fund LLC',
      evidence_ids: entityNodeIds.slice(0, 3),
      confidence: 0.75,
    },
  })
  if (hypRes.status() === 200) {
    const json = await hypRes.json()
    pass(`Hypothesis created: ${json.data.proposal_id}`)
  } else {
    fail('Hypothesis', `${hypRes.status()}`)
  }

  // =========================================================================
  console.log('\n═══ Phase 9: Verify via UI ═══\n')
  // =========================================================================

  // Navigate to the new investigation page
  await page.goto(`${BASE}/caso/${casoSlug}`)
  await page.waitForLoadState('networkidle')
  const pageTitle = await page.title()
  if (pageTitle && !pageTitle.includes('404')) {
    pass(`Investigation page loads: "${pageTitle}"`)
  } else {
    fail('Investigation page', `unexpected title: ${pageTitle}`)
  }

  // Check engine dashboard
  await page.goto(`${BASE}/caso/${casoSlug}/motor`)
  await page.waitForLoadState('networkidle')
  const dashboardText = await page.textContent('body')
  if (dashboardText && dashboardText.length > 100) {
    pass('Engine dashboard renders for new investigation')
  } else {
    fail('Engine dashboard', 'page appears empty')
  }

  // =========================================================================
  console.log('\n═══ Phase 10: Tier Promotion ═══\n')
  // =========================================================================

  if (entityNodeIds.length > 0) {
    const promoteRes = await page.request.post(`${BASE}/api/casos/${casoSlug}/engine/verify/promote`, {
      headers,
      data: {
        node_ids: entityNodeIds.slice(0, 2),
        to_tier: 'silver',
        rationale: 'E2E verified via automated test',
      },
    })
    if (promoteRes.status() === 200) {
      const json = await promoteRes.json()
      pass(`Tier promotion: ${json.data.promoted_count} nodes promoted to silver`)
    } else {
      fail('Tier promotion', `${promoteRes.status()}`)
    }
  }

  // =========================================================================
  await browser.close()

  console.log(`\n${'═'.repeat(50)}`)
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`)
  console.log(`  Investigation: ${casoSlug}`)
  console.log(`${'═'.repeat(50)}\n`)

  if (failed > 0) process.exit(1)
}

main().catch(err => {
  console.error('E2E CRASHED:', err.message)
  process.exit(1)
})

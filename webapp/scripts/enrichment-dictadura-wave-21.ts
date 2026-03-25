/**
 * Wave 21: Qwen Verification
 *
 * Send batches of 50 bronze persona names to Qwen for verification:
 *   - Ask Qwen if each name is a known victim of the Argentine dictatorship
 *   - Check BOTH reasoning_content AND content fields
 *   - Promote confirmed names to silver
 *   - Run 5 batches (250 total)
 *
 * Requires: llama.cpp server running at http://localhost:8080
 * Model: Qwen3.5-9B-Q5_K_M.gguf
 *
 * Run with: npx tsx scripts/enrichment-dictadura-wave-21.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 21
const QWEN_URL = 'http://localhost:8080/v1/chat/completions'
const QWEN_MODEL = 'Qwen3.5-9B-Q5_K_M.gguf'
const BATCH_SIZE = 50
const NUM_BATCHES = 5
const REQUEST_TIMEOUT_MS = 120_000

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Phase 1: Query bronze personas
// ---------------------------------------------------------------------------

interface BronzePersona {
  elementId: string
  name: string
  category: string
}

async function queryBronzePersonas(limit: number): Promise<BronzePersona[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND p.confidence_tier = 'bronze'
         AND (p.category = 'victima' OR p.category IS NULL)
         AND p.qwen_verified IS NULL
       RETURN elementId(p) AS eid, p.name AS name,
              coalesce(p.category, 'victima') AS category
       ORDER BY p.name
       LIMIT $limit`,
      { casoSlug: CASO_SLUG, limit: neo4j.int(limit) },
    )

    return result.records.map((r) => ({
      elementId: r.get('eid') as string,
      name: r.get('name') as string,
      category: r.get('category') as string,
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Send batch to Qwen
// ---------------------------------------------------------------------------

interface QwenResponse {
  choices: Array<{
    message: {
      content: string | null
      reasoning_content?: string | null
    }
  }>
}

interface VerificationResult {
  name: string
  verified: boolean
  raw: string
}

async function verifyBatchWithQwen(names: string[]): Promise<VerificationResult[]> {
  const nameList = names.map((n, i) => `${i + 1}. ${n}`).join('\n')

  const prompt = `You are verifying names of victims of the Argentine military dictatorship (1976-1983).

For each name below, determine if this is a known victim (desaparecido/a, detained-disappeared, executed, or politically persecuted) of the Argentine dictatorship.

Reply with ONLY a numbered list matching the input. For each name, write ONLY "YES" or "NO". Do not add explanations.

Names:
${nameList}

Reply format:
1. YES
2. NO
...`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(QWEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Qwen API returned ${response.status}: ${text}`)
    }

    const data = (await response.json()) as QwenResponse
    const choice = data.choices?.[0]

    if (!choice) {
      throw new Error('No choices in Qwen response')
    }

    // Check both reasoning_content and content
    const reasoning = choice.message.reasoning_content || ''
    const content = choice.message.content || ''

    // Use content for the actual answers, reasoning for debugging
    const responseText = content || reasoning

    if (reasoning) {
      console.log(`    [Qwen reasoning]: ${reasoning.slice(0, 200)}...`)
    }

    // Parse the response
    const results: VerificationResult[] = []
    const lines = responseText.split('\n').filter((l) => l.trim())

    for (let i = 0; i < names.length; i++) {
      const line = lines[i] || ''
      const isYes = /\bYES\b/i.test(line)
      results.push({
        name: names[i],
        verified: isYes,
        raw: line.trim(),
      })
    }

    return results
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('    Qwen request timed out')
    } else {
      console.error('    Qwen request failed:', err)
    }
    // Return all as unverified on failure
    return names.map((name) => ({ name, verified: false, raw: 'ERROR' }))
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Promote verified names to silver
// ---------------------------------------------------------------------------

async function promoteToSilver(elementIds: string[]): Promise<number> {
  if (elementIds.length === 0) return 0

  const driver = getDriver()
  const session = driver.session()

  try {
    let promoted = 0
    for (const eid of elementIds) {
      await session.run(
        `MATCH (p) WHERE elementId(p) = $eid
         SET p.confidence_tier = 'silver',
             p.promoted_reason = 'qwen-verification',
             p.promoted_at = datetime(),
             p.qwen_verified = true,
             p.enriched_wave = $wave,
             p.updated_at = datetime()`,
        { eid, wave: WAVE },
      )
      promoted++
    }
    return promoted
  } finally {
    await session.close()
  }
}

async function markAsChecked(elementIds: string[]): Promise<void> {
  if (elementIds.length === 0) return

  const driver = getDriver()
  const session = driver.session()

  try {
    for (const eid of elementIds) {
      await session.run(
        `MATCH (p) WHERE elementId(p) = $eid
         SET p.qwen_verified = false,
             p.qwen_checked_at = datetime()`,
        { eid },
      )
    }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  process.env.NEO4J_QUERY_TIMEOUT_MS = '120000'

  const ok = await verifyConnectivity()
  if (!ok) {
    console.error('Cannot connect to Neo4j')
    process.exit(1)
  }
  console.log('Connected to Neo4j\n')
  console.log('=== Wave 21: Qwen Verification ===\n')

  // Check Qwen availability
  console.log('--- Checking Qwen availability ---')
  try {
    const healthCheck = await fetch(QWEN_URL.replace('/v1/chat/completions', '/health'), {
      signal: AbortSignal.timeout(5000),
    })
    if (!healthCheck.ok) {
      console.log('  WARNING: Qwen health check returned non-200. Proceeding anyway...')
    } else {
      console.log('  Qwen server is available')
    }
  } catch {
    console.error('  ERROR: Cannot reach Qwen server at ' + QWEN_URL)
    console.error('  Make sure llama.cpp is running: llama-server -m Qwen3.5-9B-Q5_K_M.gguf --port 8080')
    console.log('\n  Continuing without Qwen verification (dry run mode)...')
  }

  let totalProcessed = 0
  let totalVerified = 0
  let totalPromoted = 0

  for (let batch = 1; batch <= NUM_BATCHES; batch++) {
    console.log(`\n--- Batch ${batch}/${NUM_BATCHES} ---`)

    // Query bronze personas
    const personas = await queryBronzePersonas(BATCH_SIZE)
    if (personas.length === 0) {
      console.log('  No more bronze personas to verify')
      break
    }

    console.log(`  Processing ${personas.length} bronze personas`)
    const names = personas.map((p) => p.name)

    // Send to Qwen
    console.log('  Sending to Qwen for verification...')
    const results = await verifyBatchWithQwen(names)

    const verified = results.filter((r) => r.verified)
    const notVerified = results.filter((r) => !r.verified && r.raw !== 'ERROR')
    const errors = results.filter((r) => r.raw === 'ERROR')

    console.log(`  Results: ${verified.length} YES, ${notVerified.length} NO, ${errors.length} errors`)

    // Promote verified
    const verifiedEids = personas
      .filter((_, i) => results[i]?.verified)
      .map((p) => p.elementId)

    const promoted = await promoteToSilver(verifiedEids)
    console.log(`  Promoted ${promoted} to silver`)

    // Mark non-verified as checked
    const checkedEids = personas
      .filter((_, i) => results[i] && !results[i].verified && results[i].raw !== 'ERROR')
      .map((p) => p.elementId)

    await markAsChecked(checkedEids)

    totalProcessed += personas.length
    totalVerified += verified.length
    totalPromoted += promoted

    // Show some results
    if (verified.length > 0) {
      console.log('  Verified names (sample):')
      for (const v of verified.slice(0, 5)) {
        console.log(`    [YES] ${v.name}`)
      }
    }
    if (notVerified.length > 0) {
      console.log('  Unverified names (sample):')
      for (const v of notVerified.slice(0, 3)) {
        console.log(`    [NO]  ${v.name}`)
      }
    }
  }

  // Final stats
  console.log('\n=== Wave 21 Summary ===')
  console.log(`  Batches processed:    ${NUM_BATCHES}`)
  console.log(`  Total names checked:  ${totalProcessed}`)
  console.log(`  Qwen verified (YES):  ${totalVerified}`)
  console.log(`  Promoted to silver:   ${totalPromoted}`)
  console.log(`  Verification rate:    ${totalProcessed > 0 ? ((totalVerified / totalProcessed) * 100).toFixed(1) : 0}%`)

  await closeDriver()
  console.log('\nWave 21 complete!')
}

main().catch((err) => {
  console.error('Wave 21 failed:', err)
  closeDriver().finally(() => process.exit(1))
})

import { test, expect } from './fixtures'

const VERIFY_BASE = '/api/casos/caso-epstein/engine/verify'
const ANALYZE_BASE = '/api/casos/caso-epstein/engine/analyze'

test.describe('Verify API Routes', () => {
  test('POST /promote validates required fields', async ({ csrfPost }) => {
    const res = await csrfPost(`${VERIFY_BASE}/promote`, {
      data: {},
    })
    expect([400, 503]).toContain(res.status())
  })

  test('POST /promote accepts valid tier promotion', async ({ csrfPost }) => {
    const res = await csrfPost(`${VERIFY_BASE}/promote`, {
      data: {
        node_ids: ['nonexistent-e2e-node'],
        to_tier: 'silver',
        rationale: 'E2E test promotion',
      },
    })
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      // promoted_count may be 0 if node doesn't exist — that's fine
      expect(json.data.promoted_count).toBeDefined()
    }
  })

  test('POST /promote rejects invalid tier', async ({ csrfPost }) => {
    const res = await csrfPost(`${VERIFY_BASE}/promote`, {
      data: {
        node_ids: ['some-id'],
        to_tier: 'platinum',
        rationale: 'Invalid tier',
      },
    })
    expect([400, 503]).toContain(res.status())
  })

  test('POST /cross-reference runs dedup pass', async ({ csrfPost }) => {
    const res = await csrfPost(`${VERIFY_BASE}/cross-reference`, {
      data: { match_type: 'name_fuzzy' },
    })
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.match_type).toBe('name_fuzzy')
      expect(json.data.matches_found).toBeDefined()
    }
  })

  test('POST /cross-reference rejects invalid match_type', async ({ csrfPost }) => {
    const res = await csrfPost(`${VERIFY_BASE}/cross-reference`, {
      data: { match_type: 'invalid' },
    })
    expect([400, 503]).toContain(res.status())
  })
})

test.describe('Analyze API Routes', () => {
  test('GET /gaps returns structural gaps', async ({ request }) => {
    const res = await request.get(`${ANALYZE_BASE}/gaps`)
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.isolated_nodes).toBeInstanceOf(Array)
      expect(json.data.low_confidence).toBeInstanceOf(Array)
      expect(json.data.sparse_types).toBeInstanceOf(Array)
      expect(json.data.questions).toBeInstanceOf(Array)
      expect(json.data.questions.length).toBeGreaterThan(0)
    }
  })

  test('POST /hypothesis creates hypothesis proposal', async ({ csrfPost }) => {
    const res = await csrfPost(`${ANALYZE_BASE}/hypothesis`, {
      data: {
        hypothesis: 'E2E test hypothesis: entity A is connected to entity B through shell company C',
        evidence_ids: ['ep-jeffrey-epstein', 'ep-ghislaine-maxwell'],
        confidence: 0.7,
      },
    })
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.proposal_id).toBeTruthy()
    }
  })

  test('POST /hypothesis validates confidence range', async ({ csrfPost }) => {
    const res = await csrfPost(`${ANALYZE_BASE}/hypothesis`, {
      data: {
        hypothesis: 'Test',
        evidence_ids: ['a'],
        confidence: 1.5, // over max
      },
    })
    expect([400, 503]).toContain(res.status())
  })

  test('POST /run centrality returns ranked nodes', async ({ csrfPost }) => {
    const res = await csrfPost(`${ANALYZE_BASE}/run`, {
      data: { type: 'centrality' },
    })
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.type).toBe('centrality')
      expect(json.data.results).toBeInstanceOf(Array)
      if (json.data.results.length > 0) {
        expect(json.data.results[0].degree).toBeGreaterThan(0)
        expect(json.data.results[0].name).toBeTruthy()
        // Should be sorted by degree desc
        for (let i = 1; i < json.data.results.length; i++) {
          expect(json.data.results[i - 1].degree).toBeGreaterThanOrEqual(json.data.results[i].degree)
        }
      }
    }
  })

  test('POST /run temporal finds event clusters', async ({ csrfPost }) => {
    const res = await csrfPost(`${ANALYZE_BASE}/run`, {
      data: { type: 'temporal' },
    })
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.type).toBe('temporal')
    }
  })

  test('POST /run rejects invalid type', async ({ csrfPost }) => {
    const res = await csrfPost(`${ANALYZE_BASE}/run`, {
      data: { type: 'nonexistent' },
    })
    expect([400, 503]).toContain(res.status())
  })
})

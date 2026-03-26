import { test, expect } from './fixtures'

const BASE = '/api/casos/caso-epstein/engine/ingest'

test.describe('Ingest API Routes', () => {
  test('POST /entity creates a bronze Proposal', async ({ csrfPost }) => {
    const res = await csrfPost(`${BASE}/entity`, {
      data: {
        label: 'Person',
        properties: { name: `E2E Test Person ${Date.now()}`, role: 'test subject' },
        source_url: 'https://example.com/test',
        confidence: 0.6,
      },
    })
    expect([200, 409, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.proposal_id).toBeTruthy()
      expect(json.data.node_id).toContain('caso-epstein:')
    }
  })

  test('POST /entity returns 400 for missing label', async ({ csrfPost }) => {
    const res = await csrfPost(`${BASE}/entity`, {
      data: { properties: { name: 'No Label' } },
    })
    expect([400, 503]).toContain(res.status())
  })

  test('POST /entity rejects unsafe label characters', async ({ csrfPost }) => {
    const res = await csrfPost(`${BASE}/entity`, {
      data: {
        label: 'Person` DELETE n //',
        properties: { name: 'Injection attempt' },
      },
    })
    expect(res.status()).toBe(400)
  })

  test('POST /relationship validates endpoints exist', async ({ csrfPost }) => {
    const res = await csrfPost(`${BASE}/relationship`, {
      data: {
        from_id: 'nonexistent-node-1',
        to_id: 'nonexistent-node-2',
        type: 'ASSOCIATED_WITH',
      },
    })
    expect([404, 503]).toContain(res.status())
    if (res.status() === 404) {
      const json = await res.json()
      expect(json.error).toContain('not found')
    }
  })

  test('POST /relationship returns 400 for missing type', async ({ csrfPost }) => {
    const res = await csrfPost(`${BASE}/relationship`, {
      data: { from_id: 'a', to_id: 'b' },
    })
    expect([400, 503]).toContain(res.status())
  })

  test('POST /csv imports rows as proposals with dedup', async ({ csrfPost }) => {
    const csv = `Name,Role,Nationality
E2E CSV Person ${Date.now()},Tester,argentina
E2E CSV Person2 ${Date.now()},Developer,usa`

    const res = await csrfPost(`${BASE}/csv`, {
      data: {
        csv_content: csv,
        column_mapping: { Name: 'name', Role: 'role', Nationality: 'nationality' },
        label: 'Person',
      },
    })
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.proposal_count).toBeGreaterThanOrEqual(1)
      expect(json.data.total_rows).toBe(2)
    }
  })

  test('POST /csv returns 400 for empty CSV', async ({ csrfPost }) => {
    const res = await csrfPost(`${BASE}/csv`, {
      data: {
        csv_content: 'Name\n',
        column_mapping: { Name: 'name' },
        label: 'Person',
      },
    })
    expect([400, 503]).toContain(res.status())
  })

  test('POST /csv returns 400 for invalid column mapping', async ({ csrfPost }) => {
    const res = await csrfPost(`${BASE}/csv`, {
      data: {
        csv_content: 'Name,Role\nTest,Dev',
        column_mapping: { NonExistentColumn: 'name' },
        label: 'Person',
      },
    })
    expect([400, 503]).toContain(res.status())
  })

  test('POST /url fetches and creates Document proposal', async ({ csrfPost }) => {
    const res = await csrfPost(`${BASE}/url`, {
      data: {
        url: 'https://example.com',
        extract_entities: true,
      },
    })
    expect([200, 422, 502, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.url).toBe('https://example.com')
      expect(json.data.title).toBeTruthy()
      expect(json.data.proposals_created).toBeGreaterThanOrEqual(1)
    }
  })

  test('POST /url returns 400 for invalid URL', async ({ csrfPost }) => {
    const res = await csrfPost(`${BASE}/url`, {
      data: { url: 'not-a-url' },
    })
    expect([400, 503]).toContain(res.status())
  })
})

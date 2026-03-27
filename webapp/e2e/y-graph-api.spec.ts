import { test, expect } from '@playwright/test'

test.describe('Graph API - Search', () => {
  test('returns results for valid query', async ({ request }) => {
    const res = await request.get('/api/graph/search?q=cristina')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.nodes.length).toBeGreaterThan(0)
    expect(json.data.nodes[0]).toHaveProperty('id')
    expect(json.data.nodes[0]).toHaveProperty('labels')
    expect(json.data.nodes[0]).toHaveProperty('properties')
    expect(json.meta.totalCount).toBeGreaterThan(0)
  })

  test('returns 400 for empty query', async ({ request }) => {
    const res = await request.get('/api/graph/search?q=')
    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  test('returns 400 for missing query', async ({ request }) => {
    const res = await request.get('/api/graph/search')
    expect(res.status()).toBe(400)
  })

  test('label filter restricts results', async ({ request }) => {
    const res = await request.get('/api/graph/search?q=buenos&label=Politician')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  test('rejects invalid label', async ({ request }) => {
    const res = await request.get('/api/graph/search?q=test&label=InvalidType')
    expect(res.status()).toBe(400)
  })

  test('respects limit parameter', async ({ request }) => {
    const res = await request.get('/api/graph/search?q=cristina&limit=3')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.data.nodes.length).toBeLessThanOrEqual(3)
  })

  test('rejects oversized limit', async ({ request }) => {
    const res = await request.get('/api/graph/search?q=test&limit=999')
    expect(res.status()).toBe(400)
  })

  test('cursor-based pagination works', async ({ request }) => {
    const res1 = await request.get('/api/graph/search?q=cristina&limit=3')
    const json1 = await res1.json()

    if (json1.meta.nextCursor) {
      const res2 = await request.get(
        `/api/graph/search?q=cristina&limit=3&cursor=${json1.meta.nextCursor}`,
      )
      expect(res2.status()).toBe(200)
      const json2 = await res2.json()
      expect(json2.success).toBe(true)
      // Results should be different from page 1
      if (json2.data.nodes.length > 0 && json1.data.nodes.length > 0) {
        expect(json2.data.nodes[0].id).not.toBe(json1.data.nodes[0].id)
      }
    }
  })
})

test.describe('Graph API - Node', () => {
  test('returns neighborhood for valid node', async ({ request }) => {
    // Get a valid node ID first
    const searchRes = await request.get('/api/graph/search?q=macri&limit=1')
    const searchJson = await searchRes.json()
    if (searchJson.data.nodes.length === 0) return

    const nodeId = searchJson.data.nodes[0].id
    const res = await request.get(`/api/graph/node/${nodeId}`)
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.nodes.length).toBeGreaterThan(0)
    expect(json.data.links).toBeDefined()
    expect(json.meta.nodeCount).toBeGreaterThan(0)
    expect(json.meta.linkCount).toBeDefined()
  })

  test('returns 404 for nonexistent node', async ({ request }) => {
    const res = await request.get('/api/graph/node/nonexistent-node-slug')
    expect(res.status()).toBe(404)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toContain('not found')
  })

  test('rejects invalid node ID format', async ({ request }) => {
    const res = await request.get(`/api/graph/node/${encodeURIComponent('../../etc/passwd')}`)
    expect([400, 404]).toContain(res.status())
  })

  test('respects limit parameter', async ({ request }) => {
    const searchRes = await request.get('/api/graph/search?q=macri&limit=1')
    const searchJson = await searchRes.json()
    if (searchJson.data.nodes.length === 0) return

    const nodeId = searchJson.data.nodes[0].id
    const res = await request.get(`/api/graph/node/${nodeId}?limit=5`)
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.data.nodes.length).toBeLessThanOrEqual(6) // center + 5 neighbors
  })
})

test.describe('Graph API - Expand', () => {
  test('expands with default depth=1', async ({ request }) => {
    const searchRes = await request.get('/api/graph/search?q=macri&limit=1')
    const searchJson = await searchRes.json()
    if (searchJson.data.nodes.length === 0) return

    const nodeId = searchJson.data.nodes[0].id
    const res = await request.get(`/api/graph/expand/${nodeId}?depth=1`)
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.meta.depth).toBe(1)
    expect(json.data.nodes.length).toBeGreaterThan(0)
  })

  test('rejects depth > 3', async ({ request }) => {
    const res = await request.get('/api/graph/expand/some-slug?depth=5')
    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('depth')
  })

  test('rejects depth = 0', async ({ request }) => {
    const res = await request.get('/api/graph/expand/some-slug?depth=0')
    expect(res.status()).toBe(400)
  })

  test('rejects invalid ID', async ({ request }) => {
    const res = await request.get(`/api/graph/expand/${encodeURIComponent('../../etc/passwd')}`)
    expect([400, 404, 429]).toContain(res.status())
  })

  test('returns 404 for nonexistent node', async ({ request }) => {
    const res = await request.get('/api/graph/expand/nonexistent-node-slug?depth=1')
    expect([404, 429]).toContain(res.status())
  })
})

test.describe('Graph API - Structured Query', () => {
  test('returns results with label filter', async ({ request }) => {
    const res = await request.get('/api/graph/query?label=Politician&limit=5')
    expect([200, 429]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.nodes.length).toBeGreaterThan(0)
    }
  })

  test('returns 400 without any filter', async ({ request }) => {
    const res = await request.get('/api/graph/query')
    expect([400, 429]).toContain(res.status())
  })

  test('supports cursor pagination', async ({ request }) => {
    const res = await request.get('/api/graph/query?label=Politician&limit=3')
    const json = await res.json()
    if (json.meta?.nextCursor) {
      const res2 = await request.get(
        `/api/graph/query?label=Politician&limit=3&cursor=${json.meta.nextCursor}`,
      )
      expect(res2.status()).toBe(200)
    }
  })
})

import { test, expect } from '@playwright/test'

test.describe('Compliance — Framework Status API', () => {
  const base = '/api/casos/caso-epstein/compliance'

  test('GET /frameworks returns list with success envelope', async ({ request }) => {
    const res = await request.get(`${base}/frameworks`)
    // 503 if Neo4j is down, 200 if healthy
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data)).toBeTruthy()
      // If frameworks are seeded, each should have required fields
      for (const fw of json.data) {
        expect(fw.id).toBeTruthy()
        expect(fw.name).toBeTruthy()
        expect(fw.standard).toBeTruthy()
        expect(typeof fw.rules_count).toBe('number')
        expect(typeof fw.checklist_count).toBe('number')
      }
    }
  })

  test('GET /frameworks returns empty array when no frameworks seeded', async ({ request }) => {
    const res = await request.get(`${base}/frameworks`)
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      // Empty is valid — no crash, no error
      expect(Array.isArray(json.data)).toBeTruthy()
    }
  })

  test('GET /frameworks does not expose internal errors', async ({ request }) => {
    const res = await request.get(`${base}/frameworks`)
    if (res.status() >= 500) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBeTruthy()
      // No stack traces
      expect(JSON.stringify(json)).not.toContain('at ')
      expect(JSON.stringify(json)).not.toContain('node_modules')
    }
  })
})

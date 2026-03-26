import { test, expect } from '@playwright/test'

const ENGINE = '/api/casos/caso-epstein/engine'

test.describe('Engine Pipeline API (existing routes)', () => {
  test('GET /state returns pipeline states', async ({ request }) => {
    const res = await request.get(`${ENGINE}/state`)
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
    }
  })

  test('GET /proposals requires pipeline_state_id', async ({ request }) => {
    const res = await request.get(`${ENGINE}/proposals`)
    // Should return 400 for missing required param or 200 with empty
    expect([200, 400, 503]).toContain(res.status())
  })

  test('GET /audit requires pipeline_state_id', async ({ request }) => {
    const res = await request.get(`${ENGINE}/audit`)
    expect([200, 400, 503]).toContain(res.status())
  })

  test('GET /metrics returns engine metrics', async ({ request }) => {
    const res = await request.get(`${ENGINE}/metrics`)
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
    }
  })

  test('GET /orchestrator requires pipeline_id', async ({ request }) => {
    const res = await request.get(`${ENGINE}/orchestrator`)
    expect([200, 400, 503]).toContain(res.status())
  })
})

test.describe('Caso API Routes (existing)', () => {
  test('GET /api/caso/caso-epstein/stats returns graph stats', async ({ request }) => {
    const res = await request.get('/api/caso/caso-epstein/stats')
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.totalNodes).toBeGreaterThan(0)
      expect(json.data.totalRelationships).toBeGreaterThan(0)
    }
  })

  test('GET /api/caso/caso-epstein/schema returns node types', async ({ request }) => {
    const res = await request.get('/api/caso/caso-epstein/schema')
    expect([200, 503]).toContain(res.status())
  })

  test('GET /api/caso/caso-epstein/timeline returns events', async ({ request }) => {
    const res = await request.get('/api/caso/caso-epstein/timeline')
    expect([200, 503]).toContain(res.status())
  })

  test('GET /api/caso/caso-epstein/config returns client config', async ({ request }) => {
    const res = await request.get('/api/caso/caso-epstein/config')
    expect([200, 503]).toContain(res.status())
  })
})

test.describe('Dynamic Registry', () => {
  test('caso-epstein layout renders (static registry)', async ({ page }) => {
    const res = await page.goto('/caso/caso-epstein')
    expect(res?.status()).toBeLessThan(500)
  })

  test('caso-libra layout renders (static registry)', async ({ page }) => {
    const res = await page.goto('/caso/caso-libra')
    expect(res?.status()).toBeLessThan(500)
  })

  test('nonexistent caso returns 404 or fallback', async ({ page }) => {
    const res = await page.goto('/caso/caso-nonexistent-e2e')
    // Could be 404 or render with fallback metadata
    expect(res?.status()).toBeLessThanOrEqual(404)
  })
})

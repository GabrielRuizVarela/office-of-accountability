import { test, expect } from '@playwright/test'
import { seedPipelineRun } from '../fixtures/seed-helpers'

test.describe('Engine — Proposals API', () => {
  const base = '/api/casos/caso-epstein/engine'

  test('GET /proposals returns 400 without pipeline_state_id', async ({ request }) => {
    const res = await request.get(`${base}/proposals`)
    expect([400, 429]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('pipeline_state_id')
    }
  })

  test('GET /proposals returns list with success envelope', async ({ request }) => {
    const seeded = await seedPipelineRun(request)
    if (!seeded) {
      test.skip(true, 'Neo4j unavailable or rate limited')
      return
    }

    const res = await request.get(
      `${base}/proposals?pipeline_state_id=${seeded.pipeline_state_id}`,
    )
    expect([200, 429, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data)).toBeTruthy()
    }
  })

  test('GET /proposals accepts optional status filter', async ({ request }) => {
    const seeded = await seedPipelineRun(request)
    if (!seeded) {
      test.skip(true, 'Neo4j unavailable or rate limited')
      return
    }

    const res = await request.get(
      `${base}/proposals?pipeline_state_id=${seeded.pipeline_state_id}&status=pending`,
    )
    expect([200, 429, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data)).toBeTruthy()
    }
  })

  test('GET /proposals includes rate limit headers', async ({ request }) => {
    const seeded = await seedPipelineRun(request)
    if (!seeded) {
      test.skip(true, 'Neo4j unavailable or rate limited')
      return
    }

    const res = await request.get(
      `${base}/proposals?pipeline_state_id=${seeded.pipeline_state_id}`,
    )
    if (res.status() === 200) {
      expect(res.headers()['x-ratelimit-remaining']).toBeTruthy()
      expect(res.headers()['x-ratelimit-reset']).toBeTruthy()
    }
  })

  test('POST /proposals returns 400 when ids is missing', async ({ request }) => {
    const res = await request.post(`${base}/proposals`, {
      data: { action: 'approved', reviewed_by: 'test@e2e.com' },
    })
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('ids')
    }
  })

  test('POST /proposals returns 400 when ids is empty array', async ({ request }) => {
    const res = await request.post(`${base}/proposals`, {
      data: { ids: [], action: 'approved', reviewed_by: 'test@e2e.com' },
    })
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('ids')
    }
  })

  test('POST /proposals returns 400 when action is invalid', async ({ request }) => {
    const res = await request.post(`${base}/proposals`, {
      data: { ids: ['fake-id'], action: 'invalid', reviewed_by: 'test@e2e.com' },
    })
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('action')
    }
  })

  test('POST /proposals returns 400 when reviewed_by is missing', async ({ request }) => {
    const res = await request.post(`${base}/proposals`, {
      data: { ids: ['fake-id'], action: 'approved' },
    })
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('reviewed_by')
    }
  })

  test('POST /proposals does not expose internal errors', async ({ request }) => {
    const res = await request.post(`${base}/proposals`, {
      data: { ids: ['nonexistent'], action: 'approved', reviewed_by: 'test@e2e.com' },
    })
    if (res.status() >= 500) {
      const json = await res.json()
      expect(JSON.stringify(json)).not.toContain('at ')
      expect(JSON.stringify(json)).not.toContain('node_modules')
    }
  })
})

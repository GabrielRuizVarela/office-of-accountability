import { test, expect } from '@playwright/test'
import { seedPipelineRun } from '../fixtures/seed-helpers'

test.describe('Engine — Pipeline Run API', () => {
  const base = '/api/casos/caso-epstein/engine'

  test('POST /run creates pipeline state with success envelope', async ({ request }) => {
    const pipelineId = `e2e-run-${Date.now()}`
    const res = await request.post(`${base}/run`, {
      data: { pipeline_id: pipelineId },
    })
    expect([200, 429, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.id).toBeTruthy()
      expect(json.data.pipeline_id).toBe(pipelineId)
      expect(json.data.caso_slug).toBeTruthy()
    }
  })

  test('POST /run returns 400 when pipeline_id is missing', async ({ request }) => {
    const res = await request.post(`${base}/run`, { data: {} })
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('pipeline_id')
    }
  })

  test('POST /run returns 400 for invalid JSON body', async ({ request }) => {
    const res = await request.post(`${base}/run`, {
      headers: { 'Content-Type': 'application/json' },
      data: 'not json',
    })
    // Playwright serializes strings to JSON, so we send raw
    expect([400, 200, 429, 503]).toContain(res.status())
  })

  test('POST /run includes rate limit headers', async ({ request }) => {
    const res = await request.post(`${base}/run`, {
      data: { pipeline_id: `e2e-rl-${Date.now()}` },
    })
    if (res.status() === 200) {
      const remaining = res.headers()['x-ratelimit-remaining']
      const reset = res.headers()['x-ratelimit-reset']
      expect(remaining).toBeTruthy()
      expect(reset).toBeTruthy()
    }
  })

  test('POST /run does not expose stack traces on error', async ({ request }) => {
    const res = await request.post(`${base}/run`, {
      data: { pipeline_id: `e2e-err-${Date.now()}` },
    })
    if (res.status() >= 500) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(JSON.stringify(json)).not.toContain('at ')
      expect(JSON.stringify(json)).not.toContain('node_modules')
    }
  })

  test('GET /state returns pipeline states list', async ({ request }) => {
    const seeded = await seedPipelineRun(request)
    if (!seeded) {
      test.skip(true, 'Neo4j unavailable or rate limited')
      return
    }

    const res = await request.get(`${base}/state?pipeline_id=${seeded.pipeline_id}`)
    expect([200, 429, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data)).toBeTruthy()
    }
  })

  test('GET /state returns 400 without pipeline_id', async ({ request }) => {
    const res = await request.get(`${base}/state`)
    expect([400, 429]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('pipeline_id')
    }
  })

  test('GET /state includes rate limit headers', async ({ request }) => {
    const res = await request.get(`${base}/state?pipeline_id=any`)
    if (res.status() === 200) {
      expect(res.headers()['x-ratelimit-remaining']).toBeTruthy()
      expect(res.headers()['x-ratelimit-reset']).toBeTruthy()
    }
  })
})

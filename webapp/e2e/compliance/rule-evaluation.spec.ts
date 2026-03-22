import { test, expect } from '@playwright/test'

test.describe('Compliance — Rule Evaluation API', () => {
  const base = '/api/casos/caso-epstein/compliance'

  test('GET /evaluate/:frameworkId with non-existent framework returns 404', async ({ request }) => {
    const res = await request.get(`${base}/evaluate/non-existent-framework`)
    // 404 if Neo4j is up, 503 if down
    expect([404, 503]).toContain(res.status())
    if (res.status() === 404) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('not found')
    }
  })

  test('GET /evaluate/:frameworkId with invalid phase returns 400', async ({ request }) => {
    const res = await request.get(`${base}/evaluate/any-id?phase=invalid-phase`)
    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toContain('Invalid phase')
  })

  test('GET /evaluate/:frameworkId accepts valid phase values', async ({ request }) => {
    const validPhases = ['any', 'sourcing', 'extraction', 'dedup', 'enrichment', 'scoring', 'review']
    for (const phase of validPhases) {
      const res = await request.get(`${base}/evaluate/test-fw?phase=${phase}`)
      // Should not be 400 — phase is valid even if framework doesn't exist
      expect(res.status()).not.toBe(400)
    }
  })

  test('GET /evaluate/:frameworkId returns report structure when framework exists', async ({ request }) => {
    // First discover a real framework ID
    const fwRes = await request.get(`${base}/frameworks`)
    if (fwRes.status() !== 200) {
      test.skip(true, 'Neo4j unavailable — skipping')
      return
    }
    const fwJson = await fwRes.json()
    if (fwJson.data.length === 0) {
      test.skip(true, 'No frameworks seeded — skipping')
      return
    }

    const frameworkId = fwJson.data[0].id
    const res = await request.get(`${base}/evaluate/${frameworkId}`)
    expect([200, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      const report = json.data
      expect(report.framework_id).toBe(frameworkId)
      expect(typeof report.overall_score).toBe('number')
      expect(report.overall_score).toBeGreaterThanOrEqual(0)
      expect(report.overall_score).toBeLessThanOrEqual(1)
      expect(typeof report.gate_passed).toBe('boolean')
      expect(report.evaluation_id).toBeTruthy()
    }
  })

  test('GET /evaluate/:frameworkId includes rate limit headers', async ({ request }) => {
    const fwRes = await request.get(`${base}/frameworks`)
    if (fwRes.status() !== 200) {
      test.skip(true, 'Neo4j unavailable')
      return
    }
    const fwJson = await fwRes.json()
    if (fwJson.data.length === 0) {
      test.skip(true, 'No frameworks seeded')
      return
    }

    const frameworkId = fwJson.data[0].id
    const res = await request.get(`${base}/evaluate/${frameworkId}`)
    if (res.status() === 200) {
      const remaining = res.headers()['x-ratelimit-remaining']
      const reset = res.headers()['x-ratelimit-reset']
      expect(remaining).toBeTruthy()
      expect(reset).toBeTruthy()
    }
  })
})

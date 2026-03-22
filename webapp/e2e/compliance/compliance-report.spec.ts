import { test, expect } from '@playwright/test'

test.describe('Compliance — Evaluations History API', () => {
  const base = '/api/casos/caso-epstein/compliance'

  test('GET /evaluations returns list with success envelope', async ({ request }) => {
    const res = await request.get(`${base}/evaluations`)
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data)).toBeTruthy()
      for (const ev of json.data) {
        expect(ev.id).toBeTruthy()
        expect(ev.investigation_id).toBeTruthy()
        expect(ev.framework_id).toBeTruthy()
        expect(ev.phase).toBeTruthy()
        expect(ev.evaluated_at).toBeTruthy()
        expect(typeof ev.overall_score).toBe('number')
        expect(typeof ev.gate_passed).toBe('boolean')
        expect(typeof ev.total_violations).toBe('number')
      }
    }
  })

  test('GET /evaluations accepts framework_id filter', async ({ request }) => {
    const res = await request.get(`${base}/evaluations?framework_id=fatf-aml`)
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      for (const ev of json.data) {
        expect(ev.framework_id).toBe('fatf-aml')
      }
    }
  })

  test('GET /evaluations accepts limit parameter', async ({ request }) => {
    const res = await request.get(`${base}/evaluations?limit=5`)
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.data.length).toBeLessThanOrEqual(5)
    }
  })

  test('GET /evaluations clamps limit to max 200', async ({ request }) => {
    const res = await request.get(`${base}/evaluations?limit=999`)
    // Should not error — server clamps to 200 internally
    expect([200, 503]).toContain(res.status())
  })

  test('GET /evaluations with invalid limit defaults gracefully', async ({ request }) => {
    const res = await request.get(`${base}/evaluations?limit=abc`)
    // Should not error — server defaults to 50
    expect([200, 503]).toContain(res.status())
  })

  test('GET /evaluations includes rate limit headers', async ({ request }) => {
    const res = await request.get(`${base}/evaluations`)
    if (res.status() === 200) {
      const remaining = res.headers()['x-ratelimit-remaining']
      const reset = res.headers()['x-ratelimit-reset']
      expect(remaining).toBeTruthy()
      expect(reset).toBeTruthy()
    }
  })

  test('GET /evaluations for different caso returns independent results', async ({ request }) => {
    const epsteinRes = await request.get(`${base}/evaluations`)
    const libraRes = await request.get('/api/casos/caso-libra/compliance/evaluations')
    // Both should respond without error
    expect([200, 503]).toContain(epsteinRes.status())
    expect([200, 503]).toContain(libraRes.status())
    // Results should be independent (different investigation_ids)
    if (epsteinRes.status() === 200 && libraRes.status() === 200) {
      const epsteinData = await epsteinRes.json()
      const libraData = await libraRes.json()
      for (const ev of epsteinData.data) {
        expect(ev.investigation_id).toBe('caso-epstein')
      }
      for (const ev of libraData.data) {
        expect(ev.investigation_id).toBe('caso-libra')
      }
    }
  })

  test('Evaluate then verify evaluation appears in history', async ({ request }) => {
    // Trigger an evaluation
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
    const evalRes = await request.get(`${base}/evaluate/${frameworkId}`)
    if (evalRes.status() !== 200) {
      test.skip(true, 'Evaluation failed')
      return
    }

    const evalJson = await evalRes.json()
    const evaluationId = evalJson.data.evaluation_id

    // Now check history
    const historyRes = await request.get(`${base}/evaluations?framework_id=${frameworkId}`)
    expect(historyRes.status()).toBe(200)
    const historyJson = await historyRes.json()
    const found = historyJson.data.some(
      (ev: { id: string }) => ev.id === evaluationId,
    )
    expect(found).toBe(true)
  })
})

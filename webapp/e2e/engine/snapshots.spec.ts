import { test, expect } from '@playwright/test'
import { seedPipelineRun, seedSnapshot } from '../fixtures/seed-helpers'

test.describe('Engine — Snapshots API', () => {
  const base = '/api/casos/caso-epstein/engine'

  // -------------------------------------------------------------------------
  // GET /snapshots
  // -------------------------------------------------------------------------

  test('GET /snapshots returns 400 without pipeline_state_id or stage_id', async ({ request }) => {
    const res = await request.get(`${base}/snapshots`)
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('pipeline_state_id')
    }
  })

  test('GET /snapshots returns list by pipeline_state_id', async ({ request }) => {
    const seeded = await seedPipelineRun(request)
    if (!seeded) {
      test.skip(true, 'Neo4j unavailable or rate limited')
      return
    }

    const res = await request.get(
      `${base}/snapshots?pipeline_state_id=${seeded.pipeline_state_id}`,
    )
    expect([200, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data.snapshots)).toBeTruthy()
    }
  })

  test('GET /snapshots accepts stage_id query param', async ({ request }) => {
    const res = await request.get(`${base}/snapshots?stage_id=some-stage`)
    expect([200, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data.snapshots)).toBeTruthy()
    }
  })

  // -------------------------------------------------------------------------
  // POST /snapshots
  // -------------------------------------------------------------------------

  test('POST /snapshots returns 400 without pipeline_state_id', async ({ request }) => {
    const res = await request.post(`${base}/snapshots`, { data: {} })
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('pipeline_state_id')
    }
  })

  test('POST /snapshots returns 404 for non-existent pipeline state', async ({ request }) => {
    const res = await request.post(`${base}/snapshots`, {
      data: { pipeline_state_id: 'non-existent-state' },
    })
    expect([404, 503]).toContain(res.status())

    if (res.status() === 404) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('not found')
    }
  })

  test('POST /snapshots creates snapshot with 201', async ({ request }) => {
    const seeded = await seedPipelineRun(request)
    if (!seeded) {
      test.skip(true, 'Neo4j unavailable or rate limited')
      return
    }

    const res = await request.post(`${base}/snapshots`, {
      data: { pipeline_state_id: seeded.pipeline_state_id, label: 'e2e-test' },
    })
    expect([201, 503]).toContain(res.status())

    if (res.status() === 201) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.snapshot.id).toBeTruthy()
      expect(json.data.snapshot.pipeline_state_id).toBe(seeded.pipeline_state_id)
      expect(json.data.snapshot.label).toBe('e2e-test')
    }
  })

  test('POST /snapshots defaults label to manual', async ({ request }) => {
    const seeded = await seedPipelineRun(request)
    if (!seeded) {
      test.skip(true, 'Neo4j unavailable or rate limited')
      return
    }

    const res = await request.post(`${base}/snapshots`, {
      data: { pipeline_state_id: seeded.pipeline_state_id },
    })
    expect([201, 503]).toContain(res.status())

    if (res.status() === 201) {
      const json = await res.json()
      expect(json.data.snapshot.label).toBe('manual')
    }
  })

  // -------------------------------------------------------------------------
  // DELETE /snapshots
  // -------------------------------------------------------------------------

  test('DELETE /snapshots returns 400 without id param', async ({ request }) => {
    const res = await request.delete(`${base}/snapshots`)
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('id')
    }
  })

  test('DELETE /snapshots removes snapshot', async ({ request }) => {
    const seeded = await seedPipelineRun(request)
    if (!seeded) {
      test.skip(true, 'Neo4j unavailable or rate limited')
      return
    }

    const snap = await seedSnapshot(request, seeded.pipeline_state_id, 'e2e-delete')
    if (!snap) {
      test.skip(true, 'Could not create snapshot')
      return
    }

    const res = await request.delete(`${base}/snapshots?id=${snap.id}`)
    expect([200, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
    }
  })

  // -------------------------------------------------------------------------
  // Audit trail
  // -------------------------------------------------------------------------

  test('GET /audit returns 400 without pipeline_state_id', async ({ request }) => {
    const res = await request.get(`${base}/audit`)
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('pipeline_state_id')
    }
  })

  test('GET /audit returns entries list', async ({ request }) => {
    const seeded = await seedPipelineRun(request)
    if (!seeded) {
      test.skip(true, 'Neo4j unavailable or rate limited')
      return
    }

    const res = await request.get(
      `${base}/audit?pipeline_state_id=${seeded.pipeline_state_id}`,
    )
    expect([200, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data.entries)).toBeTruthy()
    }
  })

  test('GET /audit returns 400 for invalid limit', async ({ request }) => {
    const res = await request.get(`${base}/audit?pipeline_state_id=any&limit=abc`)
    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toContain('limit')
  })

  test('GET /audit accepts valid limit parameter', async ({ request }) => {
    const res = await request.get(`${base}/audit?pipeline_state_id=any&limit=10`)
    expect([200, 503]).toContain(res.status())
  })

  test('GET /audit does not expose stack traces', async ({ request }) => {
    const res = await request.get(`${base}/audit?pipeline_state_id=any`)
    if (res.status() >= 500) {
      const json = await res.json()
      expect(JSON.stringify(json)).not.toContain('at ')
      expect(JSON.stringify(json)).not.toContain('node_modules')
    }
  })
})

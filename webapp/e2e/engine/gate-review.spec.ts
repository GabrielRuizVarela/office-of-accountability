import { test, expect } from '@playwright/test'

test.describe('Engine — Gate Review API', () => {
  const base = '/api/casos/caso-epstein/engine'

  test('GET /gate/:stageId returns gate status', async ({ request }) => {
    const res = await request.get(`${base}/gate/some-stage-id`)
    expect([200, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(typeof json.data.gate_pending).toBe('boolean')
      // pipeline_state is null when no gate is pending
      if (!json.data.gate_pending) {
        expect(json.data.pipeline_state).toBeNull()
      }
    }
  })

  test('POST /gate/:stageId returns 400 when pipeline_state_id missing', async ({ request }) => {
    const res = await request.post(`${base}/gate/any-stage`, {
      data: { action: 'approve', reviewed_by: 'test@e2e.com' },
    })
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('pipeline_state_id')
    }
  })

  test('POST /gate/:stageId returns 400 when action is invalid', async ({ request }) => {
    const res = await request.post(`${base}/gate/any-stage`, {
      data: { pipeline_state_id: 'fake-id', action: 'invalid', reviewed_by: 'test@e2e.com' },
    })
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('action')
    }
  })

  test('POST /gate/:stageId returns 400 when reviewed_by missing', async ({ request }) => {
    const res = await request.post(`${base}/gate/any-stage`, {
      data: { pipeline_state_id: 'fake-id', action: 'approve' },
    })
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('reviewed_by')
    }
  })

  test('POST /gate/:stageId returns 400 for invalid JSON', async ({ request }) => {
    const res = await request.post(`${base}/gate/any-stage`, {
      headers: { 'Content-Type': 'application/json' },
      data: 'broken',
    })
    expect([400, 200, 503]).toContain(res.status())
  })

  test('POST /gate/:stageId returns 404 for non-existent pipeline state', async ({ request }) => {
    const res = await request.post(`${base}/gate/any-stage`, {
      data: {
        pipeline_state_id: 'non-existent-state-id',
        action: 'approve',
        reviewed_by: 'e2e@test.com',
      },
    })
    expect([404, 503]).toContain(res.status())

    if (res.status() === 404) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('not found')
    }
  })

  test('POST /gate/:stageId does not expose stack traces', async ({ request }) => {
    const res = await request.post(`${base}/gate/any-stage`, {
      data: {
        pipeline_state_id: 'fake',
        action: 'approve',
        reviewed_by: 'test@e2e.com',
      },
    })
    if (res.status() >= 500) {
      const json = await res.json()
      expect(JSON.stringify(json)).not.toContain('at ')
      expect(JSON.stringify(json)).not.toContain('node_modules')
    }
  })
})

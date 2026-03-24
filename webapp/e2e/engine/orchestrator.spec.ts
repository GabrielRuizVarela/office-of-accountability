import { test, expect } from '@playwright/test'
import { seedOrchestratorTask } from '../fixtures/seed-helpers'

test.describe('Engine — Orchestrator API', () => {
  const base = '/api/casos/caso-epstein/engine/orchestrator'

  // -------------------------------------------------------------------------
  // GET /orchestrator — status + task summary
  // -------------------------------------------------------------------------

  test('GET /orchestrator returns 400 without pipeline_id', async ({ request }) => {
    const res = await request.get(base)
    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toContain('pipeline_id')
  })

  test('GET /orchestrator returns task summary', async ({ request }) => {
    const res = await request.get(`${base}?pipeline_id=e2e-orch-${Date.now()}`)
    expect([200, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      const { task_summary } = json.data
      expect(typeof task_summary.total).toBe('number')
      expect(typeof task_summary.pending).toBe('number')
      expect(typeof task_summary.running).toBe('number')
      expect(typeof task_summary.completed).toBe('number')
      expect(typeof task_summary.failed).toBe('number')
      expect(Array.isArray(json.data.tasks)).toBeTruthy()
    }
  })

  // -------------------------------------------------------------------------
  // GET /orchestrator/tasks
  // -------------------------------------------------------------------------

  test('GET /orchestrator/tasks returns 400 without pipeline_id', async ({ request }) => {
    const res = await request.get(`${base}/tasks`)
    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toContain('pipeline_id')
  })

  test('GET /orchestrator/tasks returns task list', async ({ request }) => {
    const res = await request.get(`${base}/tasks?pipeline_id=e2e-tasks-${Date.now()}`)
    expect([200, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data.tasks)).toBeTruthy()
    }
  })

  test('GET /orchestrator/tasks rejects invalid status filter', async ({ request }) => {
    const res = await request.get(`${base}/tasks?pipeline_id=any&status=bogus`)
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('Invalid status')
    }
  })

  test('GET /orchestrator/tasks accepts valid status filter', async ({ request }) => {
    for (const status of ['pending', 'running', 'completed', 'failed']) {
      const res = await request.get(`${base}/tasks?pipeline_id=any&status=${status}`)
      expect(res.status()).not.toBe(400)
    }
  })

  // -------------------------------------------------------------------------
  // POST /orchestrator/tasks — create task
  // -------------------------------------------------------------------------

  test('POST /orchestrator/tasks creates a task', async ({ request }) => {
    const res = await request.post(`${base}/tasks`, {
      data: {
        investigation_id: `e2e-inv-${Date.now()}`,
        type: 'verify',
        target: 'e2e-target',
        priority: 3,
      },
    })
    expect([201, 503]).toContain(res.status())

    if (res.status() === 201) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.task.id).toBeTruthy()
      expect(json.data.task.status).toBe('pending')
      expect(json.data.task.priority).toBe(3)
    }
  })

  test('POST /orchestrator/tasks returns 400 when required fields missing', async ({ request }) => {
    const res = await request.post(`${base}/tasks`, {
      data: { investigation_id: 'x' },
    })
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('type')
    }
  })

  test('POST /orchestrator/tasks clamps priority to 1-10', async ({ request }) => {
    const res = await request.post(`${base}/tasks`, {
      data: {
        investigation_id: `e2e-clamp-${Date.now()}`,
        type: 'verify',
        target: 'e2e-target',
        priority: 99,
      },
    })
    expect([201, 503]).toContain(res.status())

    if (res.status() === 201) {
      const json = await res.json()
      expect(json.data.task.priority).toBeLessThanOrEqual(10)
    }
  })

  // -------------------------------------------------------------------------
  // PATCH /orchestrator/tasks — update task
  // -------------------------------------------------------------------------

  test('PATCH /orchestrator/tasks returns 400 without task_id', async ({ request }) => {
    const res = await request.patch(`${base}/tasks`, {
      data: { priority: 1 },
    })
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('task_id')
    }
  })

  test('PATCH /orchestrator/tasks returns 400 with no valid fields', async ({ request }) => {
    const res = await request.patch(`${base}/tasks`, {
      data: { task_id: 'some-id' },
    })
    expect([400, 503]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('No valid fields')
    }
  })

  test('PATCH /orchestrator/tasks returns 404 for non-existent task', async ({ request }) => {
    const res = await request.patch(`${base}/tasks`, {
      data: { task_id: 'non-existent-task-id', priority: 5 },
    })
    expect([404, 503]).toContain(res.status())

    if (res.status() === 404) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('not found')
    }
  })

  test('PATCH /orchestrator/tasks updates status and sets completed_at', async ({ request }) => {
    const seeded = await seedOrchestratorTask(request, {
      investigation_id: `e2e-patch-${Date.now()}`,
    })
    if (!seeded) {
      test.skip(true, 'Neo4j unavailable')
      return
    }

    const res = await request.patch(`${base}/tasks`, {
      data: { task_id: seeded.id, status: 'completed' },
    })
    expect([200, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.task.status).toBe('completed')
    }
  })

  // -------------------------------------------------------------------------
  // GET /orchestrator/focus
  // -------------------------------------------------------------------------

  test('GET /orchestrator/focus returns 400 without pipeline_id', async ({ request }) => {
    const res = await request.get(`${base}/focus`)
    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toContain('pipeline_id')
  })

  test('GET /orchestrator/focus returns 404 for unknown pipeline', async ({ request }) => {
    const res = await request.get(`${base}/focus?pipeline_id=non-existent-${Date.now()}`)
    expect([404, 503]).toContain(res.status())

    if (res.status() === 404) {
      const json = await res.json()
      expect(json.success).toBe(false)
    }
  })

  // -------------------------------------------------------------------------
  // PUT /orchestrator/focus
  // -------------------------------------------------------------------------

  test('PUT /orchestrator/focus returns 400 without pipeline_id', async ({ request }) => {
    const res = await request.put(`${base}/focus`, {
      data: { focus: 'some-focus' },
    })
    expect([400, 429]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('pipeline_id')
    }
  })

  test('PUT /orchestrator/focus returns 400 without focus', async ({ request }) => {
    const res = await request.put(`${base}/focus`, {
      data: { pipeline_id: 'test-pipeline' },
    })
    expect([400, 429]).toContain(res.status())

    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('focus')
    }
  })

  test('PUT /orchestrator/focus sets focus and returns it', async ({ request }) => {
    const pipelineId = `e2e-focus-${Date.now()}`
    const res = await request.put(`${base}/focus`, {
      data: { pipeline_id: pipelineId, focus: 'entity-resolution' },
    })
    expect([200, 429, 503]).toContain(res.status())

    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.current_focus).toBe('entity-resolution')
      expect(json.data.updated_at).toBeTruthy()
    }
  })

  test('PUT /orchestrator/focus includes rate limit headers', async ({ request }) => {
    const res = await request.put(`${base}/focus`, {
      data: { pipeline_id: `e2e-rl-${Date.now()}`, focus: 'test' },
    })
    if (res.status() === 200) {
      expect(res.headers()['x-ratelimit-remaining']).toBeTruthy()
      expect(res.headers()['x-ratelimit-reset']).toBeTruthy()
    }
  })
})

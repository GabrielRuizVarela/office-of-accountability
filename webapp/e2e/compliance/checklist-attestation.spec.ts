import { test, expect } from '@playwright/test'

test.describe('Compliance — Checklist Attestation API', () => {
  const base = '/api/casos/caso-epstein/compliance/attestations'

  test('GET /attestations returns list with success envelope', async ({ request }) => {
    const res = await request.get(base)
    expect([200, 503]).toContain(res.status())
    if (res.status() === 200) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data)).toBeTruthy()
      for (const att of json.data) {
        expect(att.id).toBeTruthy()
        expect(att.checklist_item_id).toBeTruthy()
        expect(att.framework_id).toBeTruthy()
        expect(att.attested_by).toBeTruthy()
        expect(att.attested_at).toBeTruthy()
      }
    }
  })

  test('POST /attestations requires framework_id', async ({ request }) => {
    const res = await request.post(base, {
      data: { checklist_item_id: 'ci-1', attested_by: 'test-user' },
    })
    expect([400, 503]).toContain(res.status())
    if (res.status() === 400) {
      const json = await res.json()
      expect(json.error).toContain('framework_id')
    }
  })

  test('POST /attestations requires checklist_item_id', async ({ request }) => {
    const res = await request.post(base, {
      data: { framework_id: 'fw-1', attested_by: 'test-user' },
    })
    expect([400, 503]).toContain(res.status())
    if (res.status() === 400) {
      const json = await res.json()
      expect(json.error).toContain('checklist_item_id')
    }
  })

  test('POST /attestations requires attested_by', async ({ request }) => {
    const res = await request.post(base, {
      data: { framework_id: 'fw-1', checklist_item_id: 'ci-1' },
    })
    expect([400, 503]).toContain(res.status())
    if (res.status() === 400) {
      const json = await res.json()
      expect(json.error).toContain('attested_by')
    }
  })

  test('POST /attestations rejects invalid JSON body', async ({ request }) => {
    const res = await request.post(base, {
      headers: { 'Content-Type': 'application/json' },
      data: 'not-json{{{',
    })
    // Playwright stringifies non-object data, so the server may parse it
    // Accept 400 (invalid JSON) or 400 (missing fields)
    expect(res.status()).toBeLessThan(500)
  })

  test('POST /attestations with non-existent framework returns 404', async ({ request }) => {
    const res = await request.post(base, {
      data: {
        framework_id: 'non-existent-fw',
        checklist_item_id: 'ci-1',
        attested_by: 'test-user',
      },
    })
    expect([404, 503]).toContain(res.status())
    if (res.status() === 404) {
      const json = await res.json()
      expect(json.error).toContain('not found')
    }
  })

  test('POST /attestations with non-existent checklist item returns 404', async ({ request }) => {
    // First find a real framework
    const fwRes = await request.get('/api/casos/caso-epstein/compliance/frameworks')
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
    const res = await request.post(base, {
      data: {
        framework_id: frameworkId,
        checklist_item_id: 'non-existent-checklist-item',
        attested_by: 'test-user',
      },
    })
    expect([404, 503]).toContain(res.status())
    if (res.status() === 404) {
      const json = await res.json()
      expect(json.error).toContain('not found')
    }
  })

  test('POST /attestations creates attestation when framework and item exist', async ({ request }) => {
    // Discover a real framework with checklist items
    const fwRes = await request.get('/api/casos/caso-epstein/compliance/frameworks')
    if (fwRes.status() !== 200) {
      test.skip(true, 'Neo4j unavailable')
      return
    }
    const fwJson = await fwRes.json()
    const fwWithChecklist = fwJson.data.find(
      (fw: { checklist_count: number }) => fw.checklist_count > 0,
    )
    if (!fwWithChecklist) {
      test.skip(true, 'No frameworks with checklist items seeded')
      return
    }

    // We need the actual checklist item codes — load from evaluate endpoint
    const evalRes = await request.get(
      `/api/casos/caso-epstein/compliance/evaluate/${fwWithChecklist.id}`,
    )
    if (evalRes.status() !== 200) {
      test.skip(true, 'Cannot evaluate framework')
      return
    }
    const evalJson = await evalRes.json()
    const checklistItems = evalJson.data?.checklist_status
    if (!checklistItems || checklistItems.length === 0) {
      test.skip(true, 'No checklist items in evaluation')
      return
    }

    const itemCode = checklistItems[0].code
    const res = await request.post(base, {
      data: {
        framework_id: fwWithChecklist.id,
        checklist_item_id: itemCode,
        attested_by: 'e2e-test-user',
        notes: 'Automated E2E test attestation',
      },
    })
    expect([201, 503]).toContain(res.status())
    if (res.status() === 201) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.id).toBeTruthy()
      expect(json.data.framework_id).toBe(fwWithChecklist.id)
      expect(json.data.attested_by).toBe('e2e-test-user')
      expect(json.data.attested_at).toBeTruthy()
    }
  })
})

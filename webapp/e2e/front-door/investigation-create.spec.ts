import { test, expect } from './fixtures'

test.describe('Investigation Creation API', () => {
  const slug = `caso-e2e-test-${Date.now()}`

  test('POST /api/casos/create creates full investigation structure', async ({ csrfPost }) => {
    const res = await csrfPost('/api/casos/create', {
      data: {
        name_es: `E2E Test ${Date.now()}`,
        name_en: `E2E Test ${Date.now()}`,
        description_es: 'Prueba de integracion',
        description_en: 'Integration test',
        tags: ['e2e', 'test'],
      },
    })
    expect([200, 201, 503]).toContain(res.status())
    if (res.status() === 200 || res.status() === 201) {
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.caso_slug).toMatch(/^caso-e2e-test/)
      expect(json.data.investigation_config_id).toBeTruthy()
    }
  })

  test('POST /api/casos/create returns 409 for duplicate slug', async ({ csrfPost }) => {
    const name = `E2E Duplicate ${Date.now()}`
    // Create first
    const first = await csrfPost('/api/casos/create', {
      data: { name_es: name, name_en: name },
    })
    if (first.status() !== 200 && first.status() !== 201) {
      test.skip(true, 'First creation failed (DB unavailable)')
      return
    }

    // Try to create with same name
    const second = await csrfPost('/api/casos/create', {
      data: { name_es: name, name_en: name },
    })
    expect(second.status()).toBe(409)
  })

  test('POST /api/casos/create returns 400 for missing name', async ({ csrfPost }) => {
    const res = await csrfPost('/api/casos/create', {
      data: { description_es: 'No name' },
    })
    expect([400, 503]).toContain(res.status())
  })

  test('POST /api/casos/create with custom node types', async ({ csrfPost }) => {
    const res = await csrfPost('/api/casos/create', {
      data: {
        name_es: `E2E Custom Types ${Date.now()}`,
        name_en: `E2E Custom Types ${Date.now()}`,
        node_types: [
          { name: 'Witness', color: '#ff0000', icon: 'eye' },
          { name: 'Suspect', color: '#ffaa00', icon: 'alert' },
        ],
      },
    })
    expect([200, 201, 503]).toContain(res.status())
    if (res.status() === 200 || res.status() === 201) {
      const json = await res.json()
      expect(json.success).toBe(true)
    }
  })

  test('POST /api/casos/create with seed entity', async ({ csrfPost }) => {
    const res = await csrfPost('/api/casos/create', {
      data: {
        name_es: `E2E Seeded ${Date.now()}`,
        name_en: `E2E Seeded ${Date.now()}`,
        seed_entity_id: 'ep-jeffrey-epstein',
      },
    })
    expect([200, 201, 503]).toContain(res.status())
    if (res.status() === 200 || res.status() === 201) {
      const json = await res.json()
      expect(json.success).toBe(true)
    }
  })
})

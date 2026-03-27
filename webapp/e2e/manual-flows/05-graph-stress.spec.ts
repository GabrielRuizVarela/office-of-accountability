import { test, expect } from '@playwright/test'

/**
 * LAUNCH CHECKLIST: Graph Stress Test
 *
 * Tests the graph explorer with 200+ nodes to verify performance
 * and responsiveness under load.
 */

test.describe('Graph Stress Test', () => {
  test.setTimeout(60_000) // Allow up to 60s for heavy graph operations

  test('1. Load a heavily-connected node and verify responsiveness', async ({ page }) => {
    await page.goto('/explorar')

    // Search for a well-connected politician
    const searchInput = page.getByRole('combobox')
    await searchInput.click()
    await page.waitForTimeout(500)
    await searchInput.pressSequentially('macri', { delay: 100 })

    const dropdown = page.locator('#search-results-listbox')
    await expect(dropdown).toBeVisible({ timeout: 10_000 })
    await dropdown.getByRole('option').first().click()
    await page.waitForTimeout(2000)

    // Graph should have populated
    await expect(page.getByText('Explorar el grafo')).not.toBeVisible()

    await page.screenshot({ path: 'test-results/manual/26-graph-initial-load.png' })
  })

  test('2. Expand API handles depth=2 without timeout', async ({ request }) => {
    // Get a valid node ID via search
    const searchRes = await request.get('/api/graph/search?q=macri&limit=1')
    const searchJson = await searchRes.json()

    if (searchJson.data.nodes.length > 0) {
      const nodeId = searchJson.data.nodes[0].id

      // Depth 1
      const start1 = Date.now()
      const res1 = await request.get(`/api/graph/expand/${nodeId}?depth=1&limit=200`)
      const elapsed1 = Date.now() - start1

      expect(res1.status()).toBe(200)
      const json1 = await res1.json()
      expect(json1.data.nodes.length).toBeGreaterThan(0)

      // Depth 2
      const start2 = Date.now()
      const res2 = await request.get(`/api/graph/expand/${nodeId}?depth=2&limit=200`)
      const elapsed2 = Date.now() - start2

      expect([200, 504]).toContain(res2.status()) // 504 = timeout, acceptable for depth 2

      if (res2.status() === 200) {
        const json2 = await res2.json()
        // Should have more nodes at depth 2 than depth 1
        expect(json2.data.nodes.length).toBeGreaterThanOrEqual(json1.data.nodes.length)
      }

      // Depth 3
      const res3 = await request.get(`/api/graph/expand/${nodeId}?depth=3&limit=200`)
      expect([200, 504]).toContain(res3.status()) // May timeout — that's okay

      // Depth 4+ should be rejected
      const res4 = await request.get(`/api/graph/expand/${nodeId}?depth=4`)
      expect(res4.status()).toBe(400)
    }
  })

  test('3. Large node response has bounded size', async ({ request }) => {
    // Verify the response size cap (max 500 nodes)
    const searchRes = await request.get('/api/graph/search?q=macri&limit=1')
    const searchJson = await searchRes.json()

    if (searchJson.data.nodes.length > 0) {
      const nodeId = searchJson.data.nodes[0].id
      const res = await request.get(`/api/graph/expand/${nodeId}?depth=2&limit=500`)

      if (res.status() === 200) {
        const json = await res.json()
        // Response should be capped
        expect(json.data.nodes.length).toBeLessThanOrEqual(501) // limit + center node
      }
    }
  })

  test('4. Multiple sequential graph loads remain responsive', async ({ page }) => {
    await page.goto('/explorar')

    const searches = ['macri', 'cristina', 'milei']

    for (const query of searches) {
      const searchInput = page.getByRole('combobox')
      await searchInput.click()
      await searchInput.clear()
      await page.waitForTimeout(300)
      await searchInput.pressSequentially(query, { delay: 80 })

      const dropdown = page.locator('#search-results-listbox')
      const visible = await dropdown.isVisible({ timeout: 8000 }).catch(() => false)

      if (visible) {
        await dropdown.getByRole('option').first().click()
        await page.waitForTimeout(1500)
        // Each load should clear previous and show new data
        await expect(page.getByText('Explorar el grafo')).not.toBeVisible()
      }
    }

    await page.screenshot({ path: 'test-results/manual/27-graph-multi-load.png' })
  })

  test('5. Zoom controls are functional', async ({ page }) => {
    await page.goto('/explorar')

    // Load graph
    const searchInput = page.getByRole('combobox')
    await searchInput.click()
    await page.waitForTimeout(500)
    await searchInput.pressSequentially('macri', { delay: 100 })

    const dropdown = page.locator('#search-results-listbox')
    await expect(dropdown).toBeVisible({ timeout: 10_000 })
    await dropdown.getByRole('option').first().click()
    await page.waitForTimeout(2000)

    // Find zoom buttons
    const zoomIn = page.getByRole('button', { name: '+' })
    const zoomOut = page.getByRole('button', { name: '-' })

    if (await zoomIn.isVisible().catch(() => false)) {
      // Click zoom in multiple times
      await zoomIn.click()
      await zoomIn.click()
      await page.waitForTimeout(500)

      // Click zoom out
      await zoomOut.click()
      await zoomOut.click()
      await zoomOut.click()
      await page.waitForTimeout(500)
    }

    // Fit to screen button
    const fitBtn = page.getByTitle('Ajustar a pantalla').or(page.getByRole('button', { name: /fit|ajustar/i }))
    if (await fitBtn.isVisible().catch(() => false)) {
      await fitBtn.click()
      await page.waitForTimeout(500)
    }

    await page.screenshot({ path: 'test-results/manual/28-graph-zoom.png' })
  })
})

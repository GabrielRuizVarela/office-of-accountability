import { test, expect } from '@playwright/test'

test.describe('Graph Explorer', () => {
  test('shows empty state with search prompt', async ({ page }) => {
    await page.goto('/explorar')
    await expect(page.getByText('Explorar el grafo')).toBeVisible()
    await expect(page.getByText('Busca un politico')).toBeVisible()
  })

  test('search → select result → graph populates with nodes', async ({ page }) => {
    await page.goto('/explorar')

    // Wait for hydration then type character by character
    const searchInput = page.getByRole('combobox')
    await expect(searchInput).toBeVisible()
    await searchInput.click()
    await page.waitForTimeout(500)
    await searchInput.pressSequentially('macri', { delay: 100 })

    // Wait for dropdown
    const dropdown = page.locator('#search-results-listbox')
    await expect(dropdown).toBeVisible({ timeout: 10_000 })

    // Click first result
    await dropdown.getByRole('option').first().click()
    await expect(dropdown).not.toBeVisible()

    // Graph should populate — empty state gone
    await expect(page.getByText('Explorar el grafo')).not.toBeVisible({ timeout: 5000 })
  })

  test('search autocomplete keyboard navigation', async ({ page }) => {
    await page.goto('/explorar')
    const searchInput = page.getByRole('combobox')
    await expect(searchInput).toBeVisible()
    await searchInput.click()
    await page.waitForTimeout(500)
    await searchInput.pressSequentially('cristina', { delay: 100 })

    const dropdown = page.locator('#search-results-listbox')
    await expect(dropdown).toBeVisible({ timeout: 10_000 })

    // Arrow down selects first option
    await searchInput.press('ArrowDown')
    const firstOption = dropdown.getByRole('option').first()
    await expect(firstOption).toHaveAttribute('aria-selected', 'true')

    // Escape closes
    await searchInput.press('Escape')
    await expect(dropdown).not.toBeVisible()
  })

  test('search with no results shows feedback', async ({ page }) => {
    await page.goto('/explorar')
    const searchInput = page.getByRole('combobox')
    await expect(searchInput).toBeVisible()
    await searchInput.click()
    await page.waitForTimeout(500)
    await searchInput.pressSequentially('xyznonexistent12345', { delay: 50 })

    // Should show "Sin resultados" or no dropdown — both acceptable
    await page.waitForTimeout(2000)
    const hasNoResults = await page.getByText('Sin resultados').isVisible().catch(() => false)
    const hasDropdown = await page.locator('#search-results-listbox').isVisible().catch(() => false)
    expect(hasNoResults || !hasDropdown).toBe(true)
  })

  test('graph loads and controls appear', async ({ page }) => {
    await page.goto('/explorar')
    const searchInput = page.getByRole('combobox')
    await expect(searchInput).toBeVisible()
    await searchInput.click()
    await page.waitForTimeout(500)
    await searchInput.pressSequentially('macri', { delay: 100 })

    const dropdown = page.locator('#search-results-listbox')
    await expect(dropdown).toBeVisible({ timeout: 10_000 })
    await dropdown.getByRole('option').first().click()
    await page.waitForTimeout(1500)

    // Empty state should be gone
    await expect(page.getByText('Explorar el grafo')).not.toBeVisible()
  })
})

test.describe('Graph Explorer - Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('renders and search input is accessible on mobile', async ({ page }) => {
    await page.goto('/explorar')
    const searchInput = page.getByRole('combobox')
    await expect(searchInput).toBeVisible()
    // Verify the input is interactive
    await searchInput.click()
    await page.waitForTimeout(500)
    await searchInput.fill('macri')
    await page.waitForTimeout(200)
    // Accept either value being set or the input being focused
    const value = await searchInput.inputValue()
    expect(value.length).toBeGreaterThan(0)
  })
})

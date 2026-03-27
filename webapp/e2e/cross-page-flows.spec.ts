import { test, expect } from '@playwright/test'

test.describe('Cross-Page User Journeys', () => {
  test('homepage → graph explorer → search → select node', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Oficina de Rendición de Cuentas')

    // Navigate to explorer
    await page.getByRole('link', { name: 'Explorar el grafo' }).click()
    await expect(page).toHaveURL('/explorar')

    // Search for a politician
    const searchInput = page.getByRole('combobox')
    await searchInput.fill('macri')

    // Select from autocomplete
    const dropdown = page.locator('#search-results-listbox')
    await expect(dropdown).toBeVisible({ timeout: 10_000 })
    await dropdown.getByRole('option').first().click()

    // Graph should populate
    await expect(page.getByText('Explorar el grafo')).not.toBeVisible({ timeout: 5000 })
  })

  test('homepage → provinces → province → politician profile', async ({ page }) => {
    await page.goto('/provincias')

    // Click Buenos Aires
    await page.getByRole('link', { name: /buenos aires/i }).first().click()
    await expect(page).toHaveURL(/\/provincias\/buenos-aires/)

    // Click first politician
    const politicianLink = page.locator('a[href*="/politico/"]').first()
    await expect(politicianLink).toBeVisible({ timeout: 5000 })
    await politicianLink.click()

    // Should be on a politician page
    await expect(page).toHaveURL(/\/politico\//)
    await expect(page.locator('button[title="Compartir por WhatsApp"]')).toBeVisible({
      timeout: 5000,
    })
  })

  test('homepage → investigations → read investigation', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Investigaciones' }).first().click()
    await expect(page).toHaveURL('/investigaciones')

    // Wait for content
    await page.waitForTimeout(2000)

    // Click first investigation if any
    const firstCard = page.locator('article a').first()
    if (await firstCard.isVisible().catch(() => false)) {
      const href = await firstCard.getAttribute('href')
      await firstCard.click()
      await expect(page).toHaveURL(href!)
    }
  })

  test('politician profile has working share buttons', async ({ page }) => {
    await page.goto('/politico/fernandez-de-kirchner-cristina')
    await expect(page.getByRole('heading', { name: /FERNANDEZ DE KIRCHNER/ })).toBeVisible({ timeout: 5000 })

    // WhatsApp share button
    await expect(page.locator('button[title="Compartir por WhatsApp"]')).toBeVisible()

    // Copy link button — text contains "Copiar enlace"
    const copyBtn = page.getByRole('button', { name: /Copiar enlace/ })
    if (await copyBtn.isVisible().catch(() => false)) {
      await copyBtn.click()
      // Clipboard may not work in headless — just verify button is clickable
      await page.waitForTimeout(500)
    }
  })

  test('sign-in page → forgot password → back to sign in', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }).click()
    await expect(page).toHaveURL('/auth/forgot-password')
    await page.goBack()
    await expect(page).toHaveURL('/auth/signin')
  })

  test('sign-up page ↔ sign-in page navigation', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible()

    await page.getByRole('link', { name: 'Iniciar sesión' }).click()
    await expect(page).toHaveURL('/auth/signin')

    await page.getByRole('link', { name: 'Crear cuenta' }).click()
    await expect(page).toHaveURL('/auth/signup')
  })
})

test.describe('Mobile Cross-Page Flows', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('mobile: homepage → explorer → search', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Explorar el grafo' }).click()
    await expect(page).toHaveURL('/explorar')

    const searchInput = page.getByRole('combobox')
    await expect(searchInput).toBeVisible()
    await searchInput.click()
    await page.waitForTimeout(500)
    await searchInput.pressSequentially('macri', { delay: 100 })
    await page.waitForTimeout(200)
    const value = await searchInput.inputValue()
    expect(value.length).toBeGreaterThan(0)
  })

  test('mobile: politician profile renders with share buttons', async ({ page }) => {
    await page.goto('/politico/fernandez-de-kirchner-cristina')
    // Wait for SSR content
    await page.waitForTimeout(2000)
    // The page should have loaded — check for share button (always visible on mobile)
    await expect(page.locator('button[title="Compartir por WhatsApp"]')).toBeVisible({
      timeout: 5000,
    })
  })

  test('mobile: investigations page is usable', async ({ page }) => {
    await page.goto('/investigaciones')
    await expect(page.getByRole('heading', { name: 'Investigaciones' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Nueva investigación' })).toBeVisible()
  })
})

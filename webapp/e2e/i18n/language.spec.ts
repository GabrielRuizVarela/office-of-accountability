import { test, expect } from '@playwright/test'

test.describe('i18n — Spanish content', () => {
  test('page with Accept-Language: es has Spanish content', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'es-AR,es;q=0.9' })
    const res = await page.goto('/')
    expect(res?.status()).not.toBe(500)

    const html = await page.content()
    // Should contain Spanish text — check for common Spanish words or lang attribute
    const hasSpanish =
      html.includes('lang="es"') ||
      html.includes('Investigaci') ||
      html.includes('caso') ||
      html.includes('Oficina') ||
      html.includes('investigaci')
    expect(hasSpanish).toBeTruthy()
  })
})

test.describe('i18n — English content', () => {
  test('page with Accept-Language: en has English content', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' })
    const res = await page.goto('/')
    expect(res?.status()).not.toBe(500)

    const html = await page.content()
    // Should contain English text or lang="en"
    const hasEnglish =
      html.includes('lang="en"') ||
      html.includes('Office') ||
      html.includes('Investigation') ||
      html.includes('Accountability') ||
      html.includes('investigation')
    expect(hasEnglish).toBeTruthy()
  })
})

test.describe('i18n — metadata reflects language', () => {
  test('root page has html lang attribute', async ({ page }) => {
    await page.goto('/')
    const lang = await page.locator('html').getAttribute('lang')
    // Should have a lang attribute set (es or en)
    expect(lang).toBeTruthy()
    expect(['es', 'en', 'es-AR', 'en-US']).toContain(lang)
  })
})

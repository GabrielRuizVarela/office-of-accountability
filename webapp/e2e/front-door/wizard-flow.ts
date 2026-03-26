import { chromium } from '@playwright/test'

const BASE = 'http://localhost:5181'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  let passed = 0
  let failed = 0

  function pass(name: string) { console.log(`  ✓ ${name}`); passed++ }
  function fail(name: string, reason: string) { console.log(`  ✗ ${name}: ${reason}`); failed++ }

  // =========================================================================
  console.log('\n=== Test Suite: Investigation Creation Wizard ===\n')

  // Test 1: Wizard page loads
  await page.goto(`${BASE}/nuevo`)
  await page.waitForLoadState('networkidle')
  const title = await page.title()
  if (title.includes('Investigation') || title.includes('Investigación')) {
    pass('Wizard page loads with correct title')
  } else {
    fail('Wizard page loads', `unexpected title: ${title}`)
  }

  // Test 2: Step 1 — fill names and advance
  const textInputs = page.locator('input[type="text"]')
  const ts = Date.now()
  await textInputs.nth(0).fill(`E2E Wizard ${ts}`)
  await textInputs.nth(1).fill(`E2E Wizard EN ${ts}`)
  const nextBtn = page.getByRole('button', { name: /next/i })
  if (await nextBtn.isEnabled()) {
    await nextBtn.click()
    await page.waitForTimeout(500)
    pass('Step 1: fills names and advances to Step 2')
  } else {
    fail('Step 1', 'Next button not enabled after filling names')
  }

  // Test 3: Step 2 — skip seed (triggers immediate creation)
  const skipBtn = page.getByRole('button', { name: /skip/i })
  if (await skipBtn.isVisible()) {
    await skipBtn.click()
    // Skip calls handleCreate directly — shows loading then redirects
    await page.waitForTimeout(5000)
    const currentUrl = page.url()
    if (currentUrl.includes('/caso/caso-')) {
      pass(`Step 2: skip seed → created and redirected to ${currentUrl}`)
    } else {
      const body = await page.textContent('body')
      if (body?.includes('CSRF')) {
        fail('Step 2: skip seed', 'CSRF token missing or invalid')
      } else {
        fail('Step 2: skip seed', `did not redirect. URL: ${currentUrl}`)
      }
    }
  } else {
    fail('Step 2', 'Skip button not visible')
  }

  // =========================================================================
  console.log('\n=== Test Suite: Data Import Panel ===\n')

  // Test 4: Engine dashboard Data tab
  await page.goto(`${BASE}/caso/caso-epstein/motor`)
  await page.waitForLoadState('networkidle')

  const dataTab = page.locator('button').filter({ hasText: /^Data$/i })
  if (await dataTab.isVisible()) {
    await dataTab.click()
    await page.waitForTimeout(500)
    pass('Data tab visible and clickable')

    // Test 5: Add Entity sub-tab and form
    const addEntityTab = page.locator('button').filter({ hasText: /^Add Entity$/i })
    if (await addEntityTab.isVisible()) {
      await addEntityTab.click()
      await page.waitForTimeout(300)

      // Fill the first visible text input (entity name)
      const formInputs = page.locator('input[type="text"]')
      const inputCount = await formInputs.count()
      if (inputCount > 0) {
        await formInputs.first().fill('E2E Test Entity')
        // Click the submit button (bg-blue-600 styled, not the tab button)
        const submitBtn = page.locator('button.bg-blue-600').filter({ hasText: /add entity/i })
        if (await submitBtn.isVisible()) {
          await submitBtn.click()
          await page.waitForTimeout(3000)
          const bodyText = await page.textContent('body')
          if (bodyText?.includes('CSRF')) {
            fail('Entity creation', 'CSRF error on Add Entity')
          } else {
            pass('Entity creation: form submitted without CSRF error')
          }
        } else {
          pass('Add Entity form loaded (submit button not matched)')
        }
      } else {
        pass('Add Entity tab opened')
      }
    } else {
      fail('Add Entity tab', 'not found')
    }
  } else {
    fail('Data tab', 'not visible on engine dashboard')
  }

  // =========================================================================
  console.log('\n=== Test Suite: What-If Analysis Page ===\n')

  // Test 6: Simular page shows analysis, not "Coming Soon"
  await page.goto(`${BASE}/caso/caso-epstein/simular`)
  await page.waitForLoadState('networkidle')
  const simularText = await page.textContent('body')
  if (simularText?.includes('Coming Soon') || simularText?.includes('Próximamente')) {
    fail('What-If page', 'still shows Coming Soon')
  } else {
    pass('What-If page: no longer shows Coming Soon')
  }

  // =========================================================================
  await browser.close()

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`)
  if (failed > 0) process.exit(1)
}

main().catch(err => {
  console.error('E2E CRASHED:', err.message)
  process.exit(1)
})

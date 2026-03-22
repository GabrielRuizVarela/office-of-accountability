/**
 * Extended Playwright test base with custom fixtures for E2E tests.
 *
 * Provides:
 *   - neo4jAvailable: boolean — whether Neo4j is reachable
 *   - mockLlm: MockLlmServer — auto-started/stopped mock llama.cpp server
 *
 * Usage:
 *   import { test, expect } from '../fixtures/test-base'
 *
 *   test('my test', async ({ request, neo4jAvailable }) => {
 *     test.skip(!neo4jAvailable, 'Neo4j unavailable')
 *     // ...
 *   })
 */

import { test as base } from '@playwright/test'
import { isNeo4jAvailable } from './seed-helpers'
import { startMockLlmServer, type MockLlmServer } from './mock-llm-server'

type CustomFixtures = {
  /** Whether Neo4j is reachable from the app server. */
  neo4jAvailable: boolean
  /** Auto-managed mock LLM server (started before test, stopped after). */
  mockLlm: MockLlmServer
}

export const test = base.extend<CustomFixtures>({
  neo4jAvailable: async ({ request }, use) => {
    const available = await isNeo4jAvailable(request)
    await use(available)
  },

  mockLlm: async ({}, use) => {
    const server = await startMockLlmServer()
    await use(server)
    await server.close()
  },
})

export { expect } from '@playwright/test'

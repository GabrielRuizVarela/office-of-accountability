import neo4j, {
  type Driver,
  type Session,
  type Record as Neo4jRecord,
  type ResultSummary,
} from 'neo4j-driver-lite'

import { loadNeo4jConfig } from './config'
import type { QueryResult } from './types'

let driver: Driver | null = null

/**
 * Returns a singleton Neo4j driver instance.
 * Uses neo4j-driver-lite for ESM/Workers compatibility.
 * Connection uses Bolt over WebSocket when URI starts with wss://.
 */
export function getDriver(): Driver {
  if (driver) return driver

  const config = loadNeo4jConfig()

  const auth = config.NEO4J_PASSWORD
    ? neo4j.auth.basic(config.NEO4J_USER, config.NEO4J_PASSWORD)
    : neo4j.auth.basic(config.NEO4J_USER, '')

  driver = neo4j.driver(config.NEO4J_URI, auth, {
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 10_000,
    maxTransactionRetryTime: 15_000,
  })

  return driver
}

/**
 * Execute a read query with parameterized Cypher.
 * Returns typed records mapped via the provided transform function.
 *
 * IMPORTANT: Never interpolate user input into the cypher string.
 * Always use the params object for dynamic values.
 */
export async function readQuery<T>(
  cypher: string,
  params: Record<string, unknown> = {},
  transform: (record: Neo4jRecord) => T
): Promise<QueryResult<T>> {
  const session = getDriver().session({ defaultAccessMode: neo4j.session.READ })

  try {
    const result = await session.run(cypher, params)
    return toQueryResult(result.records, result.summary, transform)
  } finally {
    await session.close()
  }
}

/**
 * Execute a write query with parameterized Cypher.
 * Returns typed records mapped via the provided transform function.
 *
 * IMPORTANT: Never interpolate user input into the cypher string.
 * Always use the params object for dynamic values.
 */
export async function writeQuery<T>(
  cypher: string,
  params: Record<string, unknown> = {},
  transform: (record: Neo4jRecord) => T
): Promise<QueryResult<T>> {
  const session = getDriver().session({ defaultAccessMode: neo4j.session.WRITE })

  try {
    const result = await session.run(cypher, params)
    return toQueryResult(result.records, result.summary, transform)
  } finally {
    await session.close()
  }
}

/**
 * Execute a write query that doesn't return records (e.g., CREATE, DELETE).
 * Returns only the summary with counters.
 */
export async function executeWrite(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<QueryResult<never>> {
  const session = getDriver().session({ defaultAccessMode: neo4j.session.WRITE })

  try {
    const result = await session.run(cypher, params)
    return toQueryResult(result.records, result.summary, () => undefined as never)
  } finally {
    await session.close()
  }
}

/**
 * Run a callback within a managed read transaction with automatic retries.
 */
export async function withReadTransaction<T>(
  work: (tx: { run: Session['run'] }) => Promise<T>
): Promise<T> {
  const session = getDriver().session({ defaultAccessMode: neo4j.session.READ })

  try {
    return await session.executeRead((tx) => work(tx))
  } finally {
    await session.close()
  }
}

/**
 * Run a callback within a managed write transaction with automatic retries.
 */
export async function withWriteTransaction<T>(
  work: (tx: { run: Session['run'] }) => Promise<T>
): Promise<T> {
  const session = getDriver().session({ defaultAccessMode: neo4j.session.WRITE })

  try {
    return await session.executeWrite((tx) => work(tx))
  } finally {
    await session.close()
  }
}

/**
 * Verify connectivity to Neo4j. Returns true if healthy, false otherwise.
 */
export async function verifyConnectivity(): Promise<boolean> {
  try {
    await getDriver().verifyConnectivity()
    return true
  } catch {
    return false
  }
}

/**
 * Close the driver and release all connections.
 * Call this during graceful shutdown.
 */
export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close()
    driver = null
  }
}

// --- Internal helpers ---

function toQueryResult<T>(
  records: Neo4jRecord[],
  summary: ResultSummary,
  transform: (record: Neo4jRecord) => T
): QueryResult<T> {
  return {
    records: records.map(transform),
    summary: {
      counters: extractCounters(summary),
      resultAvailableAfter: summary.resultAvailableAfter.toNumber(),
    },
  }
}

function extractCounters(summary: ResultSummary): Record<string, number> {
  const stats = summary.counters.updates()
  return Object.fromEntries(
    Object.entries(stats).filter(([, v]) => v > 0)
  )
}

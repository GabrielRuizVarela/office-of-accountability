/**
 * Engine health checks - M10.
 *
 * Checks: neo4j_connectivity, stuck_pipelines, audit_chain.
 */

import neo4j from 'neo4j-driver-lite'

import { readQuery } from '../neo4j/client'
import { validateChain } from './audit'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HealthCheck {
  name: string
  status: 'pass' | 'fail'
  message?: string
  duration_ms: number
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: HealthCheck[]
}

// ---------------------------------------------------------------------------
// Individual checks
// ---------------------------------------------------------------------------

async function checkNeo4jConnectivity(): Promise<HealthCheck> {
  const start = performance.now()
  try {
    await readQuery('RETURN 1 AS ok', {}, (r) => r.get('ok'))
    return {
      name: 'neo4j_connectivity',
      status: 'pass',
      duration_ms: Math.round(performance.now() - start),
    }
  } catch (err) {
    return {
      name: 'neo4j_connectivity',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Math.round(performance.now() - start),
    }
  }
}

async function checkStuckPipelines(casoSlug: string): Promise<HealthCheck> {
  const start = performance.now()
  try {
    const cutoff = new Date(Date.now() - 3_600_000).toISOString()
    const result = await readQuery<number>(
      `MATCH (n:PipelineState)
       WHERE n.caso_slug = $casoSlug
         AND n.status = 'running'
         AND n.updated_at < $cutoff
       RETURN count(n) AS stuck`,
      { casoSlug, cutoff },
      (r) => {
        const v = r.get('stuck')
        return neo4j.isInt(v) ? (v as { toNumber(): number }).toNumber() : (v as number)
      },
    )
    const stuck = result.records[0] ?? 0
    if (stuck > 0) {
      return {
        name: 'stuck_pipelines',
        status: 'fail',
        message: `${stuck} pipeline(s) running for over 1 hour`,
        duration_ms: Math.round(performance.now() - start),
      }
    }
    return {
      name: 'stuck_pipelines',
      status: 'pass',
      duration_ms: Math.round(performance.now() - start),
    }
  } catch (err) {
    return {
      name: 'stuck_pipelines',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Math.round(performance.now() - start),
    }
  }
}

async function checkAuditChain(casoSlug: string): Promise<HealthCheck> {
  const start = performance.now()
  try {
    // Find the most recent pipeline state for this caso
    const states = await readQuery<string>(
      `MATCH (n:PipelineState)
       WHERE n.caso_slug = $casoSlug
       RETURN n.id AS id
       ORDER BY n.updated_at DESC
       LIMIT $limit`,
      { casoSlug, limit: neo4j.int(1) },
      (r) => r.get('id') as string,
    )

    if (states.records.length === 0) {
      return {
        name: 'audit_chain',
        status: 'pass',
        message: 'No pipeline states found',
        duration_ms: Math.round(performance.now() - start),
      }
    }

    const validation = await validateChain(states.records[0])
    if (!validation.valid) {
      return {
        name: 'audit_chain',
        status: 'fail',
        message: validation.error ?? 'Chain validation failed',
        duration_ms: Math.round(performance.now() - start),
      }
    }

    return {
      name: 'audit_chain',
      status: 'pass',
      duration_ms: Math.round(performance.now() - start),
    }
  } catch (err) {
    return {
      name: 'audit_chain',
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
      duration_ms: Math.round(performance.now() - start),
    }
  }
}

// ---------------------------------------------------------------------------
// Main health check
// ---------------------------------------------------------------------------

export async function checkEngineHealth(
  casoSlug: string,
): Promise<HealthStatus> {
  const checks = await Promise.all([
    checkNeo4jConnectivity(),
    checkStuckPipelines(casoSlug),
    checkAuditChain(casoSlug),
  ])

  const anyFailed = checks.some((c) => c.status === 'fail')
  return {
    status: anyFailed ? 'unhealthy' : 'healthy',
    checks,
  }
}

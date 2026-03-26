/**
 * GET /api/caso/adorni/statements
 *
 * Returns Adorni public statements with their verification status from Neo4j.
 * Supports filtering by verified/unverified.
 */

import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery } from '@/lib/neo4j/client'

export const dynamic = 'force-dynamic'

const ALL_STATEMENTS = `
  MATCH (s:Statement {caso_slug: 'caso-adorni'})
  RETURN s
  ORDER BY s.date DESC
  LIMIT 200
`

const STATEMENT_STATS = `
  MATCH (s:Statement {caso_slug: 'caso-adorni'})
  RETURN s.verified AS verified, count(s) AS cnt
`

interface StatementRow {
  properties: Record<string, unknown>
}

interface StatRow {
  verified: boolean
  cnt: number
}

function transformStatement(record: Neo4jRecord): StatementRow {
  return { properties: record.get('s').properties }
}

function transformStat(record: Neo4jRecord): StatRow {
  return {
    verified: record.get('verified') === true,
    cnt: typeof record.get('cnt') === 'object'
      ? (record.get('cnt') as { toNumber(): number }).toNumber()
      : record.get('cnt') as number,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter') // 'verified' | 'unverified' | null

  try {
    const [stmtResult, statResult] = await Promise.all([
      readQuery(ALL_STATEMENTS, {}, transformStatement),
      readQuery(STATEMENT_STATS, {}, transformStat),
    ])

    let statements = stmtResult.records.map((r) => r.properties)

    if (filter === 'verified') {
      statements = statements.filter((s) => s.verified === true)
    } else if (filter === 'unverified') {
      statements = statements.filter((s) => s.verified !== true)
    }

    const stats = { total: 0, verified: 0, unverified: 0 }
    for (const r of statResult.records) {
      if (r.verified) {
        stats.verified += r.cnt
      } else {
        stats.unverified += r.cnt
      }
    }
    stats.total = stats.verified + stats.unverified

    return Response.json({
      success: true,
      statements,
      stats,
    })
  } catch (error) {
    console.error('[adorni/statements] Error:', error)
    return Response.json(
      {
        success: false,
        statements: [],
        stats: { total: 0, verified: 0, unverified: 0 },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * Obras-publicas map API — returns geographic data for public works.
 * Province-level aggregation + individual lat/lon points.
 */

import { getDriver } from '@/lib/neo4j/client'

export async function GET() {
  const session = getDriver().session()

  try {
    // Province aggregation
    const provResult = await session.run(
      `MATCH (pw:PublicWork)
       WHERE pw.caso_slug = 'obras-publicas' AND pw.province IS NOT NULL AND pw.province <> ''
       WITH pw.province AS province, count(pw) AS works,
            sum(pw.monto_total) AS total_budget,
            avg(pw.avance_financiero) AS avg_execution,
            count(CASE WHEN pw.status = 'completed' AND pw.avance_financiero < 30 AND pw.avance_financiero > 0 THEN 1 END) AS ghost_projects
       RETURN province, works, total_budget, avg_execution, ghost_projects
       ORDER BY works DESC`,
      {},
      { timeout: 15_000 },
    )

    const provinces = provResult.records.map((r) => ({
      name: r.get('province') as string,
      works: typeof r.get('works') === 'object' ? (r.get('works') as any).toNumber() : r.get('works'),
      totalBudget: r.get('total_budget'),
      avgExecution: r.get('avg_execution'),
      ghostProjects: typeof r.get('ghost_projects') === 'object' ? (r.get('ghost_projects') as any).toNumber() : r.get('ghost_projects'),
    }))

    // Individual points with coordinates
    const pointResult = await session.run(
      `MATCH (pw:PublicWork)
       WHERE pw.caso_slug = 'obras-publicas'
         AND pw.latitude IS NOT NULL AND pw.latitude <> '' AND pw.latitude <> '0'
         AND toFloat(pw.latitude) <> 0
       OPTIONAL MATCH (pw)-[:CONTRACTED_FOR]-(c:Contractor)
       RETURN pw.name AS name, toFloat(pw.latitude) AS lat, toFloat(pw.longitude) AS lon,
              pw.province AS province, pw.status AS status, pw.sector AS sector,
              pw.monto_total AS budget, pw.avance_financiero AS execution,
              c.name AS contractor
       LIMIT 200`,
      {},
      { timeout: 15_000 },
    )

    const points = pointResult.records.map((r) => ({
      name: r.get('name') as string,
      lat: r.get('lat') as number,
      lon: r.get('lon') as number,
      province: r.get('province') as string,
      status: r.get('status') as string,
      sector: r.get('sector') as string,
      budget: r.get('budget'),
      execution: r.get('execution'),
      contractor: r.get('contractor') as string | null,
    }))

    return Response.json({
      success: true,
      data: { provinces, points },
      meta: { provinceCount: provinces.length, pointCount: points.length },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('connect') || message.includes('ECONNREFUSED')) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    return Response.json({ success: false, error: 'Failed to load map data' }, { status: 500 })
  } finally {
    await session.close()
  }
}

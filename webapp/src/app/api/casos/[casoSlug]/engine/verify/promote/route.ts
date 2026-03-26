import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import neo4j from 'neo4j-driver-lite'

import { writeQuery, withWriteTransaction } from '@/lib/neo4j/client'

const bodySchema = z.object({
  node_ids: z.array(z.string().min(1)).min(1).max(100),
  to_tier: z.enum(['silver', 'gold']),
  evidence_url: z.string().optional(),
  rationale: z.string().min(1).max(1000),
  promoted_by: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: z.infer<typeof bodySchema>
  try {
    const raw = await request.json()
    body = bodySchema.parse(raw)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json(
      { success: false, error: `Invalid request body: ${message}` },
      { status: 400 },
    )
  }

  const promotedBy = body.promoted_by ?? 'mcp:verify'

  try {
    // Promote all nodes using UNWIND
    const promoteResult = await writeQuery<{ count: number }>(
      `UNWIND $nodeIds AS nodeId
       MATCH (n {id: nodeId, caso_slug: $casoSlug})
       SET n.confidence_tier = $toTier,
           n.promoted_at = datetime(),
           n.promoted_by = $promotedBy,
           n.promotion_evidence = $evidenceUrl
       RETURN count(n) AS count`,
      {
        nodeIds: body.node_ids,
        casoSlug,
        toTier: body.to_tier,
        promotedBy,
        evidenceUrl: body.evidence_url ?? null,
      },
      (r) => ({
        count: neo4j.isInt(r.get('count'))
          ? (r.get('count') as { toNumber(): number }).toNumber()
          : (r.get('count') as number),
      }),
    )

    const promotedCount = promoteResult.records[0]?.count ?? 0

    // Create AuditEntry recording the promotion
    const auditId = crypto.randomUUID()
    await writeQuery(
      `CREATE (a:AuditEntry {
        id: $auditId,
        pipeline_state_id: $casoSlug,
        action: 'promote',
        detail: $detail,
        prev_hash: '',
        hash: $auditId,
        created_at: datetime()
      }) RETURN a.id AS id`,
      {
        auditId,
        casoSlug,
        detail: JSON.stringify({
          node_ids: body.node_ids,
          to_tier: body.to_tier,
          rationale: body.rationale,
          evidence_url: body.evidence_url ?? null,
          promoted_by: promotedBy,
          promoted_count: promotedCount,
        }),
      },
      (r) => ({ id: r.get('id') as string }),
    )

    return Response.json({
      success: true,
      data: { promoted_count: promotedCount },
    })
  } catch (error) {
    console.error('[engine/verify/promote]', error)
    const message = error instanceof Error ? error.message : String(error)

    if (
      message.includes('connect') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ServiceUnavailable')
    ) {
      return Response.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 },
      )
    }

    return Response.json(
      { success: false, error: 'Failed to promote nodes' },
      { status: 500 },
    )
  }
}

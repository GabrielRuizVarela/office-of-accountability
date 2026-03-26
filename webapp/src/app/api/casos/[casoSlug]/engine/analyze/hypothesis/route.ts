import { NextRequest } from 'next/server'
import { z } from 'zod/v4'

import { writeQuery } from '@/lib/neo4j/client'

const bodySchema = z.object({
  hypothesis: z.string().min(1).max(2000),
  evidence_ids: z.array(z.string().min(1)).min(1).max(50),
  confidence: z.number().min(0).max(1),
  proposed_by: z.string().optional(),
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

  try {
    const proposalId = crypto.randomUUID()
    const payloadJson = JSON.stringify({
      hypothesis: body.hypothesis,
      evidence_ids: body.evidence_ids,
    })

    await writeQuery(
      `CREATE (p:Proposal {
        id: $proposalId,
        investigation_id: $casoSlug,
        stage: 'analyze',
        type: 'hypothesis',
        payload_json: $payloadJson,
        confidence: $confidence,
        reasoning: $reasoning,
        proposed_by: $proposedBy,
        status: 'pending',
        created_at: datetime()
      }) RETURN p.id AS id`,
      {
        proposalId,
        casoSlug,
        payloadJson,
        confidence: body.confidence,
        reasoning: `Hypothesis proposal with ${body.evidence_ids.length} evidence node(s)`,
        proposedBy: body.proposed_by ?? 'analyze-api',
      },
      (r) => ({ id: r.get('id') as string }),
    )

    return Response.json({
      success: true,
      data: { proposal_id: proposalId },
    })
  } catch (error) {
    console.error('[engine/analyze/hypothesis]', error)
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
      { success: false, error: 'Failed to create hypothesis proposal' },
      { status: 500 },
    )
  }
}

/**
 * Ingest stage runner — M10 Stage Implementations (Phase 5).
 *
 * Runs source connectors, computes SHA-256 ingestion hashes for dedup,
 * and creates bronze-tier Proposals for human review.
 */

import crypto from 'node:crypto'

import type { StageKind } from '../types'
import { getSourceConnectorById } from '../config'
import { createConnector } from '../connectors'
import { createProposal } from '../proposals'
import { normalizeName } from '../../ingestion/dedup'
import type { StageRunner, StageContext, StageResult } from './types'

export class IngestStageRunner implements StageRunner {
  kind: StageKind = 'ingest'

  async run(context: StageContext): Promise<StageResult> {
    const connectorIds = context.stage.connector_ids ?? []
    const errors: string[] = []
    let proposalsCreated = 0
    let recordsProcessed = 0

    for (const connectorId of connectorIds) {
      let records: Record<string, unknown>[]
      try {
        const sourceConnector = await getSourceConnectorById(connectorId)
        if (!sourceConnector || !sourceConnector.enabled) continue

        const connector = createConnector(sourceConnector.kind)
        const result = await connector.fetch(sourceConnector.config)
        records = result.records
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        errors.push(`Connector ${connectorId}: ${message}`)
        continue
      }

      for (const record of records) {
        recordsProcessed++
        const ingestionHash = crypto
          .createHash('sha256')
          .update(JSON.stringify(record))
          .digest('hex')

        const properties: Record<string, unknown> = {
          ...record,
          caso_slug: context.casoSlug,
          tier: 'bronze',
          ingestion_hash: ingestionHash,
          source_connector_id: connectorId,
        }

        if (typeof record.name === 'string') {
          properties.normalized_name = normalizeName(record.name)
        }

        try {
          await createProposal({
            pipeline_state_id: context.pipelineState.id,
            stage_id: context.stage.id,
            type: 'create_node',
            payload: {
              label: 'Entity',
              properties,
            },
            confidence: 0.5,
            reasoning: `Ingested from connector ${connectorId}`,
          })
          proposalsCreated++
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          errors.push(`Proposal for record (hash ${ingestionHash}): ${message}`)
        }
      }
    }

    return {
      proposals_created: proposalsCreated,
      records_processed: recordsProcessed,
      errors,
    }
  }
}

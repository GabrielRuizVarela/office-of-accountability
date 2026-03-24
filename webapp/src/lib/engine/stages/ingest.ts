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
import { normalizeName, toSlug, dedup, buildExistingMaps } from '../../ingestion/dedup'
import type { StageRunner, StageContext, StageResult } from './types'

export class IngestStageRunner implements StageRunner {
  kind: StageKind = 'ingest'

  async run(context: StageContext): Promise<StageResult> {
    const connectorIds = context.stage.connector_ids ?? []
    const errors: string[] = []
    let proposalsCreated = 0
    let recordsProcessed = 0
    let duplicatesSkipped = 0

    // Build dedup maps from existing graph nodes for this case
    const { nameMap, slugMap } = await buildExistingMaps(context.casoSlug)

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

        // Dedup: check incoming name against existing graph nodes
        const recordName = typeof record.name === 'string' ? record.name : null
        const dedupMatch = recordName ? dedup(recordName, nameMap, slugMap) : null

        if (dedupMatch?.result === 'exact_match') {
          duplicatesSkipped++
          continue
        }

        const properties: Record<string, unknown> = {
          ...record,
          caso_slug: context.casoSlug,
          tier: 'bronze',
          ingestion_hash: ingestionHash,
          source_connector_id: connectorId,
        }

        let confidence = 0.5
        let reasoning = `Ingested from connector ${connectorId}`

        if (recordName) {
          properties.normalized_name = normalizeName(recordName)
          properties.slug = toSlug(recordName)

          if (dedupMatch?.result === 'fuzzy_match') {
            confidence = 0.3
            reasoning += ` (fuzzy match: "${dedupMatch.existingName}", distance=${dedupMatch.distance})`
            properties.fuzzy_match_id = dedupMatch.existingId
            properties.fuzzy_match_name = dedupMatch.existingName
          }
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
            confidence,
            reasoning,
          })
          proposalsCreated++

          // Update dedup maps so subsequent records in this batch can dedup
          if (recordName) {
            const normalized = normalizeName(recordName)
            const slug = toSlug(recordName)
            const entry = { id: ingestionHash, name: recordName }
            nameMap.set(normalized, entry)
            slugMap.set(slug, entry)
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          errors.push(`Proposal for record (hash ${ingestionHash}): ${message}`)
        }
      }
    }

    return {
      proposals_created: proposalsCreated,
      records_processed: recordsProcessed,
      duplicates_skipped: duplicatesSkipped,
      errors,
    }
  }
}

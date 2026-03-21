/**
 * Seed engine pipeline configurations for all 3 investigations.
 *
 * Creates: ModelConfig, MiroFishConfig, SourceConnector, PipelineConfig,
 * PipelineStage, and Gate nodes for each investigation.
 *
 * Run with: NEO4J_URI=bolt://localhost:7687 NEO4J_USER=neo4j NEO4J_PASSWORD="" npx tsx scripts/seed-engine-configs.ts
 *
 * Idempotent — uses MERGE on all operations.
 */

import { getDriver, closeDriver } from '../src/lib/neo4j/client'

const CASOS = ['caso-epstein', 'caso-libra', 'caso-finanzas-politicas'] as const
const NOW = new Date().toISOString()

const STAGES = ['ingest', 'verify', 'enrich', 'analyze', 'iterate', 'report'] as const

async function seed() {
  const driver = getDriver()
  const session = driver.session()

  try {
    console.log('Seeding engine configurations...\n')

    for (const caso of CASOS) {
      console.log(`--- ${caso} ---`)

      // 1. ModelConfig — MiroFish/Qwen local LLM
      const modelId = `${caso}:model-qwen`
      await session.run(
        `MERGE (m:ModelConfig {id: $id})
         ON CREATE SET
           m.caso_slug = $caso_slug,
           m.provider = 'llamacpp',
           m.model = 'Qwen3.5-9B-Q5_K_M.gguf',
           m.endpoint = $endpoint,
           m.temperature = 0.7,
           m.max_tokens = 4096,
           m.system_prompt = $system_prompt,
           m.created_at = $now,
           m.updated_at = $now
         ON MATCH SET
           m.updated_at = $now`,
        {
          id: modelId,
          caso_slug: caso,
          endpoint: process.env.MIROFISH_API_URL || 'http://localhost:8080',
          system_prompt: `You are an investigation research assistant for the ${caso} investigation. Analyze data, identify patterns, cross-reference sources, and generate hypotheses. Always cite evidence and express confidence levels.`,
          now: NOW,
        },
      )
      console.log(`  ModelConfig: ${modelId}`)

      // 2. MiroFishConfig — llama.cpp specific settings
      const mfId = `${caso}:mirofish`
      await session.run(
        `MERGE (mf:MiroFishConfig {id: $id})
         ON CREATE SET
           mf.caso_slug = $caso_slug,
           mf.model_config_id = $model_config_id,
           mf.api_url = $api_url,
           mf.n_predict = 4096,
           mf.top_k = 40,
           mf.top_p = 0.95,
           mf.repeat_penalty = 1.1,
           mf.created_at = $now,
           mf.updated_at = $now
         ON MATCH SET
           mf.updated_at = $now`,
        {
          id: mfId,
          caso_slug: caso,
          model_config_id: modelId,
          api_url: process.env.MIROFISH_API_URL || 'http://localhost:8080',
          now: NOW,
        },
      )
      console.log(`  MiroFishConfig: ${mfId}`)

      // 3. SourceConnector — graph data connector (reads existing Neo4j data)
      const connectorId = `${caso}:connector-graph`
      await session.run(
        `MERGE (sc:SourceConnector {id: $id})
         ON CREATE SET
           sc.caso_slug = $caso_slug,
           sc.name = $name,
           sc.kind = 'custom_script',
           sc.config = $config,
           sc.enabled = true,
           sc.created_at = $now,
           sc.updated_at = $now
         ON MATCH SET
           sc.updated_at = $now`,
        {
          id: connectorId,
          caso_slug: caso,
          name: `${caso} graph data`,
          config: JSON.stringify({ source: 'neo4j', caso_slug: caso }),
          now: NOW,
        },
      )
      console.log(`  SourceConnector: ${connectorId}`)

      // 4. PipelineConfig — full 6-stage pipeline
      const pipelineId = `${caso}:pipeline-main`
      const stageIds = STAGES.map((s) => `${caso}:stage-${s}`)

      await session.run(
        `MERGE (pc:PipelineConfig {id: $id})
         ON CREATE SET
           pc.caso_slug = $caso_slug,
           pc.name = $name,
           pc.description = $description,
           pc.stage_ids = $stage_ids,
           pc.created_at = $now,
           pc.updated_at = $now
         ON MATCH SET
           pc.updated_at = $now`,
        {
          id: pipelineId,
          caso_slug: caso,
          name: `${caso} investigation pipeline`,
          description: `Automated research pipeline for ${caso}: ingest → verify → enrich → analyze → iterate → report`,
          stage_ids: stageIds,
          now: NOW,
        },
      )
      console.log(`  PipelineConfig: ${pipelineId}`)

      // 5. PipelineStages + Gates
      for (let i = 0; i < STAGES.length; i++) {
        const stageKind = STAGES[i]
        const stageId = `${caso}:stage-${stageKind}`
        const gateId = `${caso}:gate-${stageKind}`

        // Gate for this stage
        await session.run(
          `MERGE (g:Gate {id: $id})
           ON CREATE SET
             g.stage_id = $stage_id,
             g.required = true,
             g.auto_approve_threshold = $threshold,
             g.created_at = $now,
             g.updated_at = $now
           ON MATCH SET
             g.updated_at = $now`,
          {
            id: gateId,
            stage_id: stageId,
            threshold: stageKind === 'ingest' ? 0.9 : 0.8,
            now: NOW,
          },
        )

        // Stage
        await session.run(
          `MERGE (ps:PipelineStage {id: $id})
           ON CREATE SET
             ps.pipeline_id = $pipeline_id,
             ps.kind = $kind,
             ps.order = $order,
             ps.model_config_id = $model_config_id,
             ps.connector_ids = $connector_ids,
             ps.gate_id = $gate_id,
             ps.created_at = $now,
             ps.updated_at = $now
           ON MATCH SET
             ps.updated_at = $now`,
          {
            id: stageId,
            pipeline_id: pipelineId,
            kind: stageKind,
            order: i,
            model_config_id: modelId,
            connector_ids: stageKind === 'ingest' ? [connectorId] : [],
            gate_id: gateId,
            now: NOW,
          },
        )
      }
      console.log(`  6 PipelineStages + 6 Gates created`)

      // 6. Create relationships
      await session.run(
        `MATCH (pc:PipelineConfig {id: $pipeline_id})
         MATCH (mc:ModelConfig {id: $model_id})
         MERGE (pc)-[:USES_MODEL]->(mc)`,
        { pipeline_id: pipelineId, model_id: modelId },
      )
      await session.run(
        `MATCH (pc:PipelineConfig {id: $pipeline_id})
         MATCH (sc:SourceConnector {id: $connector_id})
         MERGE (pc)-[:HAS_CONNECTOR]->(sc)`,
        { pipeline_id: pipelineId, connector_id: connectorId },
      )
      await session.run(
        `MATCH (mc:ModelConfig {id: $model_id})
         MATCH (mf:MiroFishConfig {id: $mf_id})
         MERGE (mc)-[:HAS_MIROFISH_CONFIG]->(mf)`,
        { model_id: modelId, mf_id: mfId },
      )
      // Link stages to pipeline
      for (const stageKind of STAGES) {
        const stageId = `${caso}:stage-${stageKind}`
        const gateId = `${caso}:gate-${stageKind}`
        await session.run(
          `MATCH (pc:PipelineConfig {id: $pipeline_id})
           MATCH (ps:PipelineStage {id: $stage_id})
           MERGE (pc)-[:HAS_STAGE]->(ps)`,
          { pipeline_id: pipelineId, stage_id: stageId },
        )
        await session.run(
          `MATCH (ps:PipelineStage {id: $stage_id})
           MATCH (g:Gate {id: $gate_id})
           MERGE (ps)-[:HAS_GATE]->(g)`,
          { stage_id: stageId, gate_id: gateId },
        )
      }
      console.log(`  Relationships wired\n`)
    }

    console.log('Engine configuration seed complete.')
  } finally {
    await session.close()
    await closeDriver()
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})

/**
 * Engine config node CRUD — M10.
 *
 * Covers 5 config node types: SourceConnector, PipelineConfig, PipelineStage,
 * Gate, ModelConfig.
 *
 * Each type exposes: create, getById, update, delete, listByCaso.
 */

import neo4j from 'neo4j-driver-lite'
import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery, writeQuery, executeWrite } from '../neo4j/client'
import {
  sourceConnectorSchema,
  pipelineConfigSchema,
  pipelineStageSchema,
  gateSchema,
  modelConfigSchema,
  type SourceConnector,
  type PipelineConfig,
  type PipelineStage,
  type Gate,
  type ModelConfig,
} from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract plain-object properties from a Neo4j node record aliased as `n`. */
function nodeProps(record: Neo4jRecord): Record<string, unknown> {
  const node = record.get('n')
  const raw = node.properties as Record<string, unknown>
  // Convert any Neo4j Integer values to JS numbers
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(raw)) {
    out[k] = neo4j.isInt(v) ? (v as { toNumber(): number }).toNumber() : v
  }
  return out
}

function nowISO(): string {
  return new Date().toISOString()
}

// ---------------------------------------------------------------------------
// Generic CRUD factory
// ---------------------------------------------------------------------------

interface CrudOps<T> {
  create(data: T): Promise<T>
  getById(id: string): Promise<T | null>
  update(id: string, fields: Partial<T>): Promise<T | null>
  delete(id: string): Promise<void>
  listByCaso(casoSlug: string, limit?: number): Promise<T[]>
}

function makeCrud<T>(
  label: string,
  parse: (raw: unknown) => T,
): CrudOps<T> {
  return {
    async create(data) {
      const now = nowISO()
      const props = { ...parse(data), created_at: now, updated_at: now }
      const result = await writeQuery<T>(
        `CREATE (n:${label} $props) RETURN n`,
        { props },
        (r) => parse(nodeProps(r)),
      )
      return result.records[0]
    },

    async getById(id) {
      const result = await readQuery<T>(
        `MATCH (n:${label} {id: $id}) RETURN n`,
        { id },
        (r) => parse(nodeProps(r)),
      )
      return result.records[0] ?? null
    },

    async update(id, fields) {
      // Remove undefined values, add updated_at
      const clean: Record<string, unknown> = { updated_at: nowISO() }
      for (const [k, v] of Object.entries(fields as Record<string, unknown>)) {
        if (v !== undefined) clean[k] = v
      }
      const result = await writeQuery<T>(
        `MATCH (n:${label} {id: $id}) SET n += $fields RETURN n`,
        { id, fields: clean },
        (r) => parse(nodeProps(r)),
      )
      return result.records[0] ?? null
    },

    async delete(id) {
      await executeWrite(
        `MATCH (n:${label} {id: $id}) DETACH DELETE n`,
        { id },
      )
    },

    async listByCaso(casoSlug, limit = 100) {
      const result = await readQuery<T>(
        `MATCH (n:${label} {caso_slug: $casoSlug})
         RETURN n ORDER BY n.created_at DESC LIMIT $limit`,
        { casoSlug, limit: neo4j.int(limit) },
        (r) => parse(nodeProps(r)),
      )
      return result.records as unknown as T[]
    },
  }
}

// ---------------------------------------------------------------------------
// 1. SourceConnector
// ---------------------------------------------------------------------------

const sourceConnectorCrud = makeCrud<SourceConnector>(
  'SourceConnector',
  (raw) => sourceConnectorSchema.parse(raw),
)

export const createSourceConnector = sourceConnectorCrud.create
export const getSourceConnectorById = sourceConnectorCrud.getById
export const updateSourceConnector = sourceConnectorCrud.update
export const deleteSourceConnector = sourceConnectorCrud.delete
export const listSourceConnectorsByCaso = sourceConnectorCrud.listByCaso

// ---------------------------------------------------------------------------
// 2. PipelineConfig
// ---------------------------------------------------------------------------

const pipelineConfigCrud = makeCrud<PipelineConfig>(
  'PipelineConfig',
  (raw) => pipelineConfigSchema.parse(raw),
)

export const createPipelineConfig = pipelineConfigCrud.create
export const getPipelineConfigById = pipelineConfigCrud.getById
export const updatePipelineConfig = pipelineConfigCrud.update
export const deletePipelineConfig = pipelineConfigCrud.delete
export const listPipelineConfigsByCaso = pipelineConfigCrud.listByCaso

// ---------------------------------------------------------------------------
// 3. PipelineStage
// ---------------------------------------------------------------------------

// PipelineStage has pipeline_id instead of caso_slug — provide a custom list.
const pipelineStageCrud = makeCrud<PipelineStage>(
  'PipelineStage',
  (raw) => pipelineStageSchema.parse(raw),
)

export const createPipelineStage = pipelineStageCrud.create
export const getPipelineStageById = pipelineStageCrud.getById
export const updatePipelineStage = pipelineStageCrud.update
export const deletePipelineStage = pipelineStageCrud.delete

/** List stages by pipeline, ordered by `order` ascending. */
export async function listPipelineStagesByPipeline(
  pipelineId: string,
  limit = 100,
): Promise<PipelineStage[]> {
  const result = await readQuery<PipelineStage>(
    `MATCH (n:PipelineStage {pipeline_id: $pipelineId})
     RETURN n ORDER BY n.order ASC LIMIT $limit`,
    { pipelineId, limit: neo4j.int(limit) },
    (r) => pipelineStageSchema.parse(nodeProps(r)),
  )
  return result.records as unknown as PipelineStage[]
}

// ---------------------------------------------------------------------------
// 4. Gate
// ---------------------------------------------------------------------------

// Gate has stage_id instead of caso_slug — provide a custom list.
const gateCrud = makeCrud<Gate>(
  'Gate',
  (raw) => gateSchema.parse(raw),
)

export const createGate = gateCrud.create
export const getGateById = gateCrud.getById
export const updateGate = gateCrud.update
export const deleteGate = gateCrud.delete

/** List gates by stage. */
export async function listGatesByStage(
  stageId: string,
  limit = 100,
): Promise<Gate[]> {
  const result = await readQuery<Gate>(
    `MATCH (n:Gate {stage_id: $stageId})
     RETURN n ORDER BY n.created_at DESC LIMIT $limit`,
    { stageId, limit: neo4j.int(limit) },
    (r) => gateSchema.parse(nodeProps(r)),
  )
  return result.records as unknown as Gate[]
}

// ---------------------------------------------------------------------------
// 5. ModelConfig
// ---------------------------------------------------------------------------

const modelConfigCrud = makeCrud<ModelConfig>(
  'ModelConfig',
  (raw) => modelConfigSchema.parse(raw),
)

export const createModelConfig = modelConfigCrud.create
export const getModelConfigById = modelConfigCrud.getById
export const updateModelConfig = modelConfigCrud.update
export const deleteModelConfig = modelConfigCrud.delete
export const listModelConfigsByCaso = modelConfigCrud.listByCaso


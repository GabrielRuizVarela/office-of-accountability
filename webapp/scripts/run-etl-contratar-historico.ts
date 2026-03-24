/**
 * ETL: CONTRATAR Historico — Decreto 1169/18 Public Works Contracts
 *
 * Loads ~868 rows of public works contracts (2009–2020) from the ONC
 * (Oficina Nacional de Contrataciones) Obras Publicas dataset.
 *
 * Key field: funcionario_contratante_nombre — the signing official,
 * enabling revolving door analysis against GovernmentAppointment nodes.
 *
 * Data source:
 *   https://datos.gob.ar/dataset/jgm-procesos-contratacion-obra-publica-gestionados-plataforma-contratar
 *
 * Run with:
 *   NEO4J_URI=bolt://localhost:7687 NEO4J_USER=neo4j npx tsx scripts/run-etl-contratar-historico.ts
 */

import 'dotenv/config'

// ETL batches need more time than the default 5s query timeout
process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { createReadStream } from 'node:fs'
import { parse } from 'csv-parse'
import { createHash } from 'node:crypto'
import { closeDriver, verifyConnectivity, executeWrite, readQuery } from '../src/lib/neo4j/client'
import neo4j from 'neo4j-driver-lite'

const CSV_PATH = new URL(
  '../_ingestion_data/contratar/onc_obras_decreto_1169_18.csv',
  import.meta.url,
).pathname

interface RawRow {
  organismo_nombre: string
  obra_nombre: string
  proceso_de_seleccion_numero: string
  unidad_operativa_contrataciones: string
  funcionario_contratante_nombre: string
  funcionario_contratante_cargo: string
  financiamiento_fuente: string
  objeto: string
  procedimiento_seleccion_tipo: string
  sistema_contratacion: string
  presupuesto_oficial_monto: string
  apertura_fecha: string
  plazo_ejecucion: string
  contratista_razon_social: string
  contratista_cuit_1: string
  contratista_cuit_2: string
  acta_de_inicio_fecha: string
  avance_fisico: string
  monto_certificado: string
  provincia_nombre: string
  departamento_nombre: string
  localidad_nombre: string
  estado: string
  es_convenio: string
  monto_2019: string
  monto_2020: string
  monto_2021: string
}

interface ContractParams {
  contract_id: string
  organismo: string
  obra_nombre: string
  proceso_numero: string
  unidad_operativa: string
  funcionario_nombre: string
  funcionario_cargo: string
  objeto: string
  tipo_seleccion: string
  sistema_contratacion: string
  presupuesto_monto: number | null
  apertura_fecha: string
  plazo_ejecucion: string
  avance_fisico: number | null
  monto_certificado: number | null
  provincia: string
  departamento: string
  localidad: string
  estado: string
  es_convenio: boolean
  ingestion_hash: string
}

interface ContractorParams {
  contractor_id: string
  name: string
  cuit: string
}

interface AwardedToRel {
  contract_id: string
  contractor_cuit: string
}

function parseNumber(val: string): number | null {
  if (!val || val.trim() === '') return null
  const n = Number(val.replace(',', '.'))
  return isNaN(n) ? null : n
}

function makeContractId(row: RawRow): string {
  // Use proceso number + organismo + obra as natural key
  const key = `${row.proceso_de_seleccion_numero}|${row.organismo_nombre}|${row.obra_nombre}`
  return createHash('sha256').update(key).digest('hex').slice(0, 16)
}

function makeContractorId(cuit: string): string {
  return `cuit:${cuit.replace(/[^0-9]/g, '')}`
}

function makeIngestionHash(row: RawRow): string {
  const payload = JSON.stringify(row)
  return createHash('sha256').update(payload).digest('hex').slice(0, 12)
}

async function parseCSV(): Promise<RawRow[]> {
  return new Promise((resolve, reject) => {
    const rows: RawRow[] = []
    createReadStream(CSV_PATH, { encoding: 'utf-8' })
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true,
          relax_column_count: true,
        }),
      )
      .on('data', (row: RawRow) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject)
  })
}

function transform(rows: RawRow[]): {
  contracts: ContractParams[]
  contractors: ContractorParams[]
  awardedToRels: AwardedToRel[]
} {
  const contracts: ContractParams[] = []
  const contractorMap = new Map<string, ContractorParams>()
  const awardedToRels: AwardedToRel[] = []

  for (const row of rows) {
    const contract_id = makeContractId(row)
    contracts.push({
      contract_id,
      organismo: row.organismo_nombre || '',
      obra_nombre: row.obra_nombre || '',
      proceso_numero: row.proceso_de_seleccion_numero || '',
      unidad_operativa: row.unidad_operativa_contrataciones || '',
      funcionario_nombre: row.funcionario_contratante_nombre || '',
      funcionario_cargo: row.funcionario_contratante_cargo || '',
      objeto: row.objeto || '',
      tipo_seleccion: row.procedimiento_seleccion_tipo || '',
      sistema_contratacion: row.sistema_contratacion || '',
      presupuesto_monto: parseNumber(row.presupuesto_oficial_monto),
      apertura_fecha: row.apertura_fecha || '',
      plazo_ejecucion: row.plazo_ejecucion || '',
      avance_fisico: parseNumber(row.avance_fisico),
      monto_certificado: parseNumber(row.monto_certificado),
      provincia: row.provincia_nombre || '',
      departamento: row.departamento_nombre || '',
      localidad: row.localidad_nombre || '',
      estado: row.estado || '',
      es_convenio: row.es_convenio === 'SI',
      ingestion_hash: makeIngestionHash(row),
    })

    // Build contractor + relationship (skip empty CUITs)
    const cuit = (row.contratista_cuit_1 || '').replace(/[^0-9]/g, '')
    if (cuit.length >= 10) {
      const contractor_id = makeContractorId(cuit)
      if (!contractorMap.has(contractor_id)) {
        contractorMap.set(contractor_id, {
          contractor_id,
          name: row.contratista_razon_social || '',
          cuit,
        })
      }
      awardedToRels.push({ contract_id, contractor_cuit: cuit })
    }

    // Handle secondary CUIT if present
    const cuit2 = (row.contratista_cuit_2 || '').replace(/[^0-9]/g, '')
    if (cuit2.length >= 10) {
      const contractor_id2 = makeContractorId(cuit2)
      if (!contractorMap.has(contractor_id2)) {
        contractorMap.set(contractor_id2, {
          contractor_id: contractor_id2,
          name: row.contratista_razon_social || '',
          cuit: cuit2,
        })
      }
      awardedToRels.push({ contract_id, contractor_cuit: cuit2 })
    }
  }

  return {
    contracts,
    contractors: [...contractorMap.values()],
    awardedToRels,
  }
}

const BATCH_SIZE = 100

async function loadContracts(contracts: ContractParams[]): Promise<number> {
  let loaded = 0
  for (let i = 0; i < contracts.length; i += BATCH_SIZE) {
    const batch = contracts.slice(i, i + BATCH_SIZE)
    await executeWrite(
      `UNWIND $batch AS c
       MERGE (pc:PublicContract {contract_id: c.contract_id})
       ON CREATE SET pc.created_at = datetime()
       SET pc.organismo          = c.organismo,
           pc.obra_nombre        = c.obra_nombre,
           pc.proceso_numero     = c.proceso_numero,
           pc.unidad_operativa   = c.unidad_operativa,
           pc.funcionario_nombre = c.funcionario_nombre,
           pc.funcionario_cargo  = c.funcionario_cargo,
           pc.objeto             = c.objeto,
           pc.tipo_seleccion     = c.tipo_seleccion,
           pc.sistema_contratacion = c.sistema_contratacion,
           pc.presupuesto_monto  = c.presupuesto_monto,
           pc.apertura_fecha     = c.apertura_fecha,
           pc.plazo_ejecucion    = c.plazo_ejecucion,
           pc.avance_fisico      = c.avance_fisico,
           pc.monto_certificado  = c.monto_certificado,
           pc.provincia          = c.provincia,
           pc.departamento       = c.departamento,
           pc.localidad          = c.localidad,
           pc.estado             = c.estado,
           pc.es_convenio        = c.es_convenio,
           pc.caso_slug          = "obras-publicas",
           pc.tier               = "silver",
           pc.submitted_by       = "etl:contratar-historico",
           pc.source_dataset     = "decreto-1169-18",
           pc.ingestion_hash     = c.ingestion_hash,
           pc.updated_at         = datetime()`,
      { batch },
    )
    loaded += batch.length
  }
  return loaded
}

async function loadContractors(contractors: ContractorParams[]): Promise<number> {
  let loaded = 0
  for (let i = 0; i < contractors.length; i += BATCH_SIZE) {
    const batch = contractors.slice(i, i + BATCH_SIZE)
    await executeWrite(
      `UNWIND $batch AS c
       MERGE (cr:Contractor {cuit: c.cuit})
       ON CREATE SET cr.created_at = datetime(),
                     cr.contractor_id = c.contractor_id
       SET cr.name       = CASE WHEN cr.name IS NULL OR cr.name = "" THEN c.name ELSE cr.name END,
           cr.tier       = CASE WHEN cr.tier = "gold" THEN "gold" ELSE "silver" END,
           cr.submitted_by = coalesce(cr.submitted_by, "etl:contratar-historico"),
           cr.updated_at = datetime()`,
      { batch },
    )
    loaded += batch.length
  }
  return loaded
}

async function loadAwardedToRels(rels: AwardedToRel[]): Promise<number> {
  let loaded = 0
  for (let i = 0; i < rels.length; i += BATCH_SIZE) {
    const batch = rels.slice(i, i + BATCH_SIZE)
    await executeWrite(
      `UNWIND $batch AS r
       MATCH (pc:PublicContract {contract_id: r.contract_id})
       MATCH (cr:Contractor {cuit: r.contractor_cuit})
       MERGE (pc)-[:AWARDED_TO]->(cr)`,
      { batch },
    )
    loaded += batch.length
  }
  return loaded
}

async function queryRevolvingDoor(): Promise<void> {
  console.log('\n--- Revolving Door Analysis: Signing Officials ---')

  const result = await readQuery(
    `MATCH (pc:PublicContract)
     WHERE pc.funcionario_nombre IS NOT NULL AND pc.funcionario_nombre <> ""
       AND pc.caso_slug = "obras-publicas"
     MATCH (ga:GovernmentAppointment)
     WHERE ga.full_name = pc.funcionario_nombre
        OR toLower(ga.full_name) = toLower(pc.funcionario_nombre)
     RETURN pc.funcionario_nombre AS official,
            ga.cargo AS position,
            ga.jurisdiccion AS ministry,
            count(DISTINCT pc) AS contracts_signed
     ORDER BY contracts_signed DESC
     LIMIT $limit`,
    { limit: neo4j.int(20) },
    (r) => ({
      official: r.get('official'),
      position: r.get('position'),
      ministry: r.get('ministry'),
      contracts_signed:
        typeof r.get('contracts_signed') === 'object'
          ? r.get('contracts_signed').toNumber()
          : r.get('contracts_signed'),
    }),
  )

  if (result.records.length === 0) {
    console.log('  No revolving door matches found between signing officials and GovernmentAppointment nodes.')
    console.log('  (This is expected if GovernmentAppointment data is not yet loaded.)')

    // Fallback: show top signing officials by contract count
    console.log('\n--- Top Signing Officials by Contract Count ---')
    const topOfficials = await readQuery(
      `MATCH (pc:PublicContract)
       WHERE pc.funcionario_nombre IS NOT NULL AND pc.funcionario_nombre <> ""
         AND pc.caso_slug = "obras-publicas"
       RETURN pc.funcionario_nombre AS official,
              pc.funcionario_cargo AS cargo,
              pc.organismo AS organismo,
              count(pc) AS contracts_signed
       ORDER BY contracts_signed DESC
       LIMIT $limit`,
      { limit: neo4j.int(20) },
      (r) => ({
        official: r.get('official'),
        cargo: r.get('cargo'),
        organismo: r.get('organismo'),
        contracts_signed:
          typeof r.get('contracts_signed') === 'object'
            ? r.get('contracts_signed').toNumber()
            : r.get('contracts_signed'),
      }),
    )
    for (const row of topOfficials.records) {
      console.log(`  ${row.official} (${row.cargo}) @ ${row.organismo}: ${row.contracts_signed} contracts`)
    }
  } else {
    for (const row of result.records) {
      console.log(`  ${row.official} | ${row.position} @ ${row.ministry} | ${row.contracts_signed} contracts`)
    }
  }
}

async function main(): Promise<void> {
  const t0 = Date.now()

  // 1. Connect
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // 2. Parse CSV
  console.log(`Parsing CSV: ${CSV_PATH}`)
  const rows = await parseCSV()
  console.log(`  Rows parsed: ${rows.length}\n`)

  // 3. Transform
  console.log('Transforming...')
  const { contracts, contractors, awardedToRels } = transform(rows)
  console.log(`  Contracts:     ${contracts.length}`)
  console.log(`  Contractors:   ${contractors.length}`)
  console.log(`  AWARDED_TO:    ${awardedToRels.length}`)

  // Show unique signing officials
  const uniqueOfficials = new Set(contracts.map((c) => c.funcionario_nombre).filter(Boolean))
  console.log(`  Signing officials (unique): ${uniqueOfficials.size}\n`)

  // 4. Load
  console.log('Loading contracts...')
  const contractsLoaded = await loadContracts(contracts)
  console.log(`  Contracts loaded: ${contractsLoaded}`)

  console.log('Loading contractors...')
  const contractorsLoaded = await loadContractors(contractors)
  console.log(`  Contractors loaded: ${contractorsLoaded}`)

  console.log('Loading AWARDED_TO relationships...')
  const relsLoaded = await loadAwardedToRels(awardedToRels)
  console.log(`  AWARDED_TO rels loaded: ${relsLoaded}`)

  // 5. Revolving door analysis
  await queryRevolvingDoor()

  // 6. Summary
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log('\n' + '='.repeat(50))
  console.log('CONTRATAR Historico ETL Complete')
  console.log(`  Duration:          ${elapsed}s`)
  console.log(`  CSV rows:          ${rows.length}`)
  console.log(`  Contracts loaded:  ${contractsLoaded}`)
  console.log(`  Contractors loaded: ${contractorsLoaded}`)
  console.log(`  AWARDED_TO rels:   ${relsLoaded}`)
  console.log(`  Signing officials: ${uniqueOfficials.size}`)
  console.log('='.repeat(50))

  await closeDriver()
}

main().catch((err) => {
  console.error('CONTRATAR Historico ETL failed:', err)
  closeDriver().finally(() => process.exit(1))
})

/**
 * Wave 3: Juicios y Sentencias
 *
 * Creates DictaduraTribunal nodes for the federal oral courts that tried
 * crimes against humanity, DictaduraSentencia nodes for major verdicts,
 * and links them to existing DictaduraCausa and DictaduraPersona nodes
 * via JUZGADO_POR, CONDENADO_A, and ABSUELTO_EN relationships.
 *
 * Confidence tier: silver (compiled from verified judicial records)
 * Ingestion wave: 3
 * Source: judicial-records
 *
 * Run with: npx tsx scripts/ingest-dictadura-wave-3.ts
 */

import { executeWrite, verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 3
const SOURCE = 'judicial-records'

// ---------------------------------------------------------------------------
// Tribunales Orales Federales
// ---------------------------------------------------------------------------

const tribunales = [
  {
    id: 'dict-tof-1-bsas',
    name: 'Tribunal Oral Federal N.° 1 de Buenos Aires',
    slug: 'tof-1-buenos-aires',
    jurisdiction: 'Ciudad Autónoma de Buenos Aires',
    description: 'Tribunal que intervino en causas ESMA y otras causas de lesa humanidad en CABA.',
  },
  {
    id: 'dict-tof-2-bsas',
    name: 'Tribunal Oral Federal N.° 2 de Buenos Aires',
    slug: 'tof-2-buenos-aires',
    jurisdiction: 'Ciudad Autónoma de Buenos Aires',
    description: 'Tribunal interviniente en la Causa Plan Cóndor y otras causas conexas.',
  },
  {
    id: 'dict-tof-4-bsas',
    name: 'Tribunal Oral Federal N.° 4 de Buenos Aires',
    slug: 'tof-4-buenos-aires',
    jurisdiction: 'Ciudad Autónoma de Buenos Aires',
    description: 'Tribunal que juzgó el circuito Atlético-Banco-Olimpo (ABO).',
  },
  {
    id: 'dict-tof-5-bsas',
    name: 'Tribunal Oral Federal N.° 5 de Buenos Aires',
    slug: 'tof-5-buenos-aires',
    jurisdiction: 'Ciudad Autónoma de Buenos Aires',
    description: 'Tribunal interviniente en causas de ESMA (megajuicio ESMA III).',
  },
  {
    id: 'dict-tof-6-bsas',
    name: 'Tribunal Oral Federal N.° 6 de Buenos Aires',
    slug: 'tof-6-buenos-aires',
    jurisdiction: 'Ciudad Autónoma de Buenos Aires',
    description: 'Tribunal interviniente en causas de lesa humanidad del circuito represivo bonaerense.',
  },
  {
    id: 'dict-camara-federal-bsas',
    name: 'Cámara Nacional de Apelaciones en lo Criminal y Correccional Federal',
    slug: 'camara-federal-buenos-aires',
    jurisdiction: 'Ciudad Autónoma de Buenos Aires',
    description: 'Cámara Federal que juzgó a los comandantes en la Causa 13 (Juicio a las Juntas, 1985).',
  },
  {
    id: 'dict-tof-1-cordoba',
    name: 'Tribunal Oral Federal N.° 1 de Córdoba',
    slug: 'tof-1-cordoba',
    jurisdiction: 'Córdoba',
    description: 'Tribunal que juzgó la causa La Perla y otras causas del III Cuerpo de Ejército.',
  },
  {
    id: 'dict-tof-2-cordoba',
    name: 'Tribunal Oral Federal N.° 2 de Córdoba',
    slug: 'tof-2-cordoba',
    jurisdiction: 'Córdoba',
    description: 'Tribunal interviniente en causas conexas al circuito represivo cordobés.',
  },
  {
    id: 'dict-tof-tucuman',
    name: 'Tribunal Oral Federal de Tucumán',
    slug: 'tof-tucuman',
    jurisdiction: 'Tucumán',
    description: 'Tribunal que juzga la Causa Operativo Independencia y crímenes del terrorismo de Estado en Tucumán.',
  },
  {
    id: 'dict-tof-1-la-plata',
    name: 'Tribunal Oral Federal N.° 1 de La Plata',
    slug: 'tof-1-la-plata',
    jurisdiction: 'Buenos Aires (provincia)',
    description: 'Tribunal que juzgó la Causa Camps, Unidad 9 y otros juicios del circuito represivo bonaerense.',
  },
  {
    id: 'dict-tof-rosario',
    name: 'Tribunal Oral Federal de Rosario',
    slug: 'tof-rosario',
    jurisdiction: 'Santa Fe',
    description: 'Tribunal interviniente en causas de lesa humanidad de la zona del II Cuerpo de Ejército.',
  },
  {
    id: 'dict-tof-mendoza',
    name: 'Tribunal Oral Federal N.° 1 de Mendoza',
    slug: 'tof-1-mendoza',
    jurisdiction: 'Mendoza',
    description: 'Tribunal que juzgó las causas de lesa humanidad cometidas en la jurisdicción de Mendoza.',
  },
  {
    id: 'dict-tof-san-martin',
    name: 'Tribunal Oral Federal N.° 1 de San Martín',
    slug: 'tof-1-san-martin',
    jurisdiction: 'Buenos Aires (provincia)',
    description: 'Tribunal que juzgó la Causa Campo de Mayo y crímenes en la zona norte del Gran Buenos Aires.',
  },
  {
    id: 'dict-tof-bahia-blanca',
    name: 'Tribunal Oral Federal de Bahía Blanca',
    slug: 'tof-bahia-blanca',
    jurisdiction: 'Buenos Aires (provincia)',
    description: 'Tribunal interviniente en causas del V Cuerpo de Ejército en el sur bonaerense y norte patagónico.',
  },
  {
    id: 'dict-tof-resistencia',
    name: 'Tribunal Oral Federal de Resistencia',
    slug: 'tof-resistencia',
    jurisdiction: 'Chaco',
    description: 'Tribunal que juzgó crímenes de lesa humanidad cometidos en la región del Nordeste Argentino.',
  },
  {
    id: 'dict-tof-parana',
    name: 'Tribunal Oral Federal de Paraná',
    slug: 'tof-parana',
    jurisdiction: 'Entre Ríos',
    description: 'Tribunal interviniente en causas de lesa humanidad de la provincia de Entre Ríos.',
  },
]

// ---------------------------------------------------------------------------
// Sentencias
// ---------------------------------------------------------------------------

interface SentenciaData {
  id: string
  name: string
  slug: string
  date: string
  outcome: string
  causa_id: string
  tribunal_id: string
  description: string
  condenas: Array<{
    persona_id: string
    resultado: 'prision_perpetua' | 'prision' | 'absuelto' | 'muerto_antes_sentencia' | 'in_absentia'
    years: number | null
    detail: string
  }>
}

const sentencias: SentenciaData[] = [
  // ─── Causa 13 — Juicio a las Juntas (1985) ─────────────────────────
  {
    id: 'dict-sentencia-causa-13',
    name: 'Sentencia Causa 13/84 — Juicio a las Juntas',
    slug: 'sentencia-causa-13',
    date: '1985-12-09',
    outcome: 'condena_parcial',
    causa_id: 'dict-causa-13',
    tribunal_id: 'dict-camara-federal-bsas',
    description: 'Sentencia histórica del Juicio a las Juntas. Condenas a los comandantes de las tres primeras juntas militares. Primer juicio civil a una dictadura militar en América Latina.',
    condenas: [
      { persona_id: 'dict-jorge-rafael-videla', resultado: 'prision_perpetua', years: null, detail: 'Reclusión perpetua e inhabilitación absoluta perpetua. 66 cargos de homicidio, privación ilegítima de libertad y tormentos.' },
      { persona_id: 'dict-emilio-eduardo-massera', resultado: 'prision_perpetua', years: null, detail: 'Prisión perpetua e inhabilitación absoluta perpetua. Responsable de la ESMA. 3 cargos de homicidio, 69 de tormentos.' },
      { persona_id: 'dict-orlando-ramon-agosti', resultado: 'prision', years: 4, detail: 'Condenado a 4 años y 6 meses de prisión. 6 cargos de tormentos.' },
      { persona_id: 'dict-roberto-eduardo-viola', resultado: 'prision', years: 17, detail: 'Condenado a 17 años de prisión. 86 cargos de privación ilegítima de la libertad y tormentos.' },
      { persona_id: 'dict-armando-lambruschini', resultado: 'prision', years: 8, detail: 'Condenado a 8 años de prisión. 35 cargos de tormentos.' },
      { persona_id: 'dict-omar-domingo-rubens-graffigna', resultado: 'absuelto', years: null, detail: 'Absuelto por falta de pruebas suficientes en el Juicio a las Juntas.' },
      { persona_id: 'dict-leopoldo-fortunato-galtieri', resultado: 'absuelto', years: null, detail: 'Absuelto en el Juicio a las Juntas. Posteriormente condenado por otros crímenes.' },
      { persona_id: 'dict-jorge-isaac-anaya', resultado: 'absuelto', years: null, detail: 'Absuelto en el Juicio a las Juntas.' },
      { persona_id: 'dict-basilio-arturo-ignacio-lami-dozo', resultado: 'absuelto', years: null, detail: 'Absuelto en el Juicio a las Juntas.' },
    ],
  },

  // ─── ESMA I (2011) ──────────────────────────────────────────────────
  {
    id: 'dict-sentencia-esma-2011',
    name: 'Sentencia ESMA I — Megajuicio',
    slug: 'sentencia-esma-2011',
    date: '2011-10-26',
    outcome: 'condena',
    causa_id: 'dict-causa-esma',
    tribunal_id: 'dict-tof-5-bsas',
    description: 'Primera sentencia del megajuicio ESMA. 16 condenas a prisión perpetua y 2 absoluciones. Juzgó crímenes cometidos en la Escuela de Mecánica de la Armada entre 1976 y 1983.',
    condenas: [
      { persona_id: 'dict-alfredo-astiz', resultado: 'prision_perpetua', years: null, detail: 'Prisión perpetua. Condenado por secuestros, torturas y homicidios en la ESMA, incluyendo el caso de las monjas francesas y miembros de Madres de Plaza de Mayo.' },
      { persona_id: 'dict-jorge-eduardo-acosta', resultado: 'prision_perpetua', years: null, detail: 'Prisión perpetua. Jefe operativo del Grupo de Tareas 3.3.2. Responsable directo de las operaciones represivas de la ESMA.' },
    ],
  },

  // ─── ESMA III (2017) ────────────────────────────────────────────────
  {
    id: 'dict-sentencia-esma-2017',
    name: 'Sentencia ESMA III — Megajuicio ampliado',
    slug: 'sentencia-esma-2017',
    date: '2017-11-29',
    outcome: 'condena',
    causa_id: 'dict-causa-esma',
    tribunal_id: 'dict-tof-5-bsas',
    description: 'Tercer tramo del megajuicio ESMA. 29 condenas a prisión perpetua por 789 víctimas. Incluyó cargos por vuelos de la muerte. El juicio más grande por crímenes de lesa humanidad en Argentina.',
    condenas: [
      { persona_id: 'dict-alfredo-astiz', resultado: 'prision_perpetua', years: null, detail: 'Prisión perpetua ratificada. Condenado por 86 casos de privación ilegítima de la libertad, tormentos y homicidio.' },
      { persona_id: 'dict-jorge-eduardo-acosta', resultado: 'prision_perpetua', years: null, detail: 'Prisión perpetua ratificada. Condenado como jefe operativo del GT 3.3.2 por cientos de casos.' },
    ],
  },

  // ─── La Perla I (2008) ──────────────────────────────────────────────
  {
    id: 'dict-sentencia-la-perla-2008',
    name: 'Sentencia La Perla I',
    slug: 'sentencia-la-perla-2008',
    date: '2008-07-24',
    outcome: 'condena',
    causa_id: 'dict-causa-la-perla',
    tribunal_id: 'dict-tof-1-cordoba',
    description: 'Primera sentencia por los crímenes en el CCD La Perla, Córdoba. Condena a Luciano Benjamín Menéndez y otros represores del III Cuerpo de Ejército.',
    condenas: [
      { persona_id: 'dict-luciano-benjamin-menendez', resultado: 'prision_perpetua', years: null, detail: 'Prisión perpetua. Primera condena de múltiples recibidas. Comandante del III Cuerpo de Ejército, responsable máximo de la represión en la zona 3.' },
    ],
  },

  // ─── La Perla II (2012) ─────────────────────────────────────────────
  {
    id: 'dict-sentencia-la-perla-2012',
    name: 'Sentencia La Perla II — Megacausa',
    slug: 'sentencia-la-perla-2012',
    date: '2012-12-11',
    outcome: 'condena',
    causa_id: 'dict-causa-la-perla',
    tribunal_id: 'dict-tof-1-cordoba',
    description: 'Megacausa La Perla. 28 condenas a prisión perpetua por crímenes contra 716 víctimas. El juicio más grande del interior del país en materia de lesa humanidad.',
    condenas: [
      { persona_id: 'dict-luciano-benjamin-menendez', resultado: 'prision_perpetua', years: null, detail: 'Prisión perpetua. Condenado como responsable máximo del circuito represivo del III Cuerpo de Ejército.' },
    ],
  },

  // ─── Plan Cóndor (2016) ─────────────────────────────────────────────
  {
    id: 'dict-sentencia-plan-condor',
    name: 'Sentencia Causa Plan Cóndor',
    slug: 'sentencia-plan-condor',
    date: '2016-05-27',
    outcome: 'condena_parcial',
    causa_id: 'dict-causa-plan-condor',
    tribunal_id: 'dict-tof-1-bsas',
    description: 'Sentencia por la coordinación represiva transnacional entre dictaduras del Cono Sur. Primer juicio en el mundo en juzgar la Operación Cóndor como plan criminal conjunto.',
    condenas: [
      { persona_id: 'dict-jorge-rafael-videla', resultado: 'muerto_antes_sentencia', years: null, detail: 'Falleció el 17 de mayo de 2013 antes de la sentencia. Estaba procesado como co-autor del plan represivo transnacional.' },
      { persona_id: 'dict-emilio-eduardo-massera', resultado: 'muerto_antes_sentencia', years: null, detail: 'Falleció el 8 de noviembre de 2010 antes del juicio oral. Procesado por su participación en el Plan Cóndor.' },
    ],
  },

  // ─── Camps (2006) ───────────────────────────────────────────────────
  {
    id: 'dict-sentencia-camps',
    name: 'Sentencia Causa Camps — Circuito Bonaerense',
    slug: 'sentencia-camps',
    date: '2006-09-19',
    outcome: 'condena',
    causa_id: 'dict-causa-camps',
    tribunal_id: 'dict-tof-1-la-plata',
    description: 'Sentencia contra Etchecolatz y otros integrantes del circuito represivo de la Policía Bonaerense. Primer juicio tras la reapertura de las causas. Julio López, testigo clave, desapareció días después.',
    condenas: [
      { persona_id: 'dict-miguel-osvaldo-etchecolatz', resultado: 'prision_perpetua', years: null, detail: 'Prisión perpetua. Condenado como autor de homicidio, privación ilegítima de la libertad y tormentos en el marco del genocidio.' },
    ],
  },

  // ─── ABO (2010) ─────────────────────────────────────────────────────
  {
    id: 'dict-sentencia-abo',
    name: 'Sentencia Causa ABO — Atlético-Banco-Olimpo',
    slug: 'sentencia-abo',
    date: '2010-12-21',
    outcome: 'condena',
    causa_id: 'dict-causa-abo',
    tribunal_id: 'dict-tof-4-bsas',
    description: 'Sentencia del circuito represivo Atlético-Banco-Olimpo operado por el Ejército y la PFA. 17 condenas, incluyendo 10 a prisión perpetua.',
    condenas: [
      { persona_id: 'dict-guillermo-suarez-mason', resultado: 'muerto_antes_sentencia', years: null, detail: 'Falleció el 21 de junio de 2005 antes de este juicio. Había sido condenado previamente en la Causa Suárez Mason.' },
    ],
  },

  // ─── Automotores Orletti (2011) ─────────────────────────────────────
  {
    id: 'dict-sentencia-automotores-orletti',
    name: 'Sentencia Causa Automotores Orletti',
    slug: 'sentencia-automotores-orletti',
    date: '2011-03-31',
    outcome: 'condena',
    causa_id: 'dict-causa-automotores-orletti',
    tribunal_id: 'dict-tof-6-bsas',
    description: 'Sentencia por los crímenes cometidos en Automotores Orletti, centro operativo del Plan Cóndor en Argentina. Coordinación represiva con Uruguay, Chile y Bolivia.',
    condenas: [
      { persona_id: 'dict-guillermo-suarez-mason', resultado: 'muerto_antes_sentencia', years: null, detail: 'Falleció antes del juicio. Había sido comandante del I Cuerpo de Ejército, bajo cuya jurisdicción operaba Orletti.' },
    ],
  },

  // ─── Suárez Mason (1988) ────────────────────────────────────────────
  {
    id: 'dict-sentencia-suarez-mason',
    name: 'Sentencia Causa Suárez Mason — I Cuerpo de Ejército',
    slug: 'sentencia-suarez-mason',
    date: '1988-10-14',
    outcome: 'condena',
    causa_id: 'dict-causa-suarez-mason',
    tribunal_id: 'dict-camara-federal-bsas',
    description: 'Condena en ausencia a Carlos Guillermo Suárez Mason, comandante del I Cuerpo de Ejército. Fue extraditado desde EE.UU. en 1988. Posteriormente condenado a prisión perpetua tras la reapertura de las causas.',
    condenas: [
      { persona_id: 'dict-guillermo-suarez-mason', resultado: 'prision_perpetua', years: null, detail: 'Prisión perpetua (tras reapertura de causas en 2003). Originalmente condenado in absentia en 1988. Extraditado desde EE.UU. Murió preso en 2005.' },
    ],
  },

  // ─── Campo de Mayo (2009) ───────────────────────────────────────────
  {
    id: 'dict-sentencia-campo-de-mayo',
    name: 'Sentencia Causa Campo de Mayo',
    slug: 'sentencia-campo-de-mayo',
    date: '2009-08-12',
    outcome: 'condena',
    causa_id: 'dict-causa-campo-de-mayo',
    tribunal_id: 'dict-tof-san-martin',
    description: 'Sentencia contra represores de la guarnición militar de Campo de Mayo, incluyendo la sustracción de menores nacidos en cautiverio en la maternidad clandestina.',
    condenas: [
      { persona_id: 'dict-alberto-pedro-bignone', resultado: 'prision_perpetua', years: null, detail: 'Condenado a 25 años de prisión por sustracción de menores. Posteriormente condenado a prisión perpetua en causas ampliadas (2010, 2017).' },
    ],
  },

  // ─── Operativo Independencia (en curso, sentencia parcial 2017) ────
  {
    id: 'dict-sentencia-operativo-independencia',
    name: 'Sentencia Causa Operativo Independencia',
    slug: 'sentencia-operativo-independencia',
    date: '2017-09-15',
    outcome: 'condena',
    causa_id: 'dict-causa-operativo-independencia',
    tribunal_id: 'dict-tof-tucuman',
    description: 'Sentencia del primer tramo del juicio por el Operativo Independencia en Tucumán (1975-1977). Juzgó crímenes previos al golpe, estableciendo precedente sobre la represión estatal antes del 24 de marzo de 1976.',
    condenas: [
      { persona_id: 'dict-antonio-domingo-bussi', resultado: 'muerto_antes_sentencia', years: null, detail: 'Falleció el 24 de noviembre de 2011 antes de la sentencia. Había sido procesado como responsable máximo del Operativo Independencia.' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countInt(value: unknown): number {
  if (typeof value === 'object' && value !== null && 'low' in value) {
    return (value as { low: number }).low
  }
  return value as number
}

// ---------------------------------------------------------------------------
// Ingestion functions
// ---------------------------------------------------------------------------

async function ingestTribunales(): Promise<number> {
  console.log(`\nIngesting ${tribunales.length} tribunales...`)
  let created = 0

  for (const t of tribunales) {
    const result = await executeWrite(
      `MERGE (t:DictaduraTribunal {id: $id})
       ON CREATE SET
         t.name = $name,
         t.slug = $slug,
         t.jurisdiction = $jurisdiction,
         t.description = $description,
         t.caso_slug = $casoSlug,
         t.confidence_tier = 'silver',
         t.ingestion_wave = $wave,
         t.source = $source,
         t.created_at = datetime(),
         t.updated_at = datetime()
       ON MATCH SET
         t.name = $name,
         t.jurisdiction = $jurisdiction,
         t.description = $description,
         t.updated_at = datetime()`,
      {
        id: t.id,
        name: t.name,
        slug: t.slug,
        jurisdiction: t.jurisdiction,
        description: t.description,
        casoSlug: CASO_SLUG,
        wave: WAVE,
        source: SOURCE,
      },
    )
    const counters = result.summary.counters
    if (counters['nodesCreated']) created += counters['nodesCreated']
    console.log(`  + ${t.name}`)
  }

  return created
}

async function ingestSentencias(): Promise<number> {
  console.log(`\nIngesting ${sentencias.length} sentencias...`)
  let created = 0

  for (const s of sentencias) {
    const result = await executeWrite(
      `MERGE (s:DictaduraSentencia {id: $id})
       ON CREATE SET
         s.name = $name,
         s.slug = $slug,
         s.date = $date,
         s.outcome = $outcome,
         s.description = $description,
         s.caso_slug = $casoSlug,
         s.confidence_tier = 'silver',
         s.ingestion_wave = $wave,
         s.source = $source,
         s.created_at = datetime(),
         s.updated_at = datetime()
       ON MATCH SET
         s.name = $name,
         s.date = $date,
         s.outcome = $outcome,
         s.description = $description,
         s.updated_at = datetime()`,
      {
        id: s.id,
        name: s.name,
        slug: s.slug,
        date: s.date,
        outcome: s.outcome,
        description: s.description,
        casoSlug: CASO_SLUG,
        wave: WAVE,
        source: SOURCE,
      },
    )
    const counters = result.summary.counters
    if (counters['nodesCreated']) created += counters['nodesCreated']
    console.log(`  + ${s.name} (${s.date})`)
  }

  return created
}

/** JUZGADO_POR: DictaduraCausa → DictaduraTribunal */
async function linkCausasTribunales(): Promise<number> {
  console.log('\nLinking Causas → JUZGADO_POR → Tribunales...')
  let created = 0

  for (const s of sentencias) {
    const result = await executeWrite(
      `MATCH (c:DictaduraCausa {id: $causaId})
       MATCH (t:DictaduraTribunal {id: $tribunalId})
       MERGE (c)-[r:JUZGADO_POR]->(t)
       ON CREATE SET
         r.source = $source,
         r.ingestion_wave = $wave,
         r.sentencia_id = $sentenciaId,
         r.created_at = datetime()`,
      {
        causaId: s.causa_id,
        tribunalId: s.tribunal_id,
        sentenciaId: s.id,
        source: SOURCE,
        wave: WAVE,
      },
    )
    const counters = result.summary.counters
    if (counters['relationshipsCreated']) {
      created += counters['relationshipsCreated']
      console.log(`  + ${s.causa_id} → ${s.tribunal_id}`)
    }
  }

  return created
}

/** Link DictaduraSentencia → DictaduraCausa (SENTENCIA_DE) */
async function linkSentenciasCausas(): Promise<number> {
  console.log('\nLinking Sentencias → SENTENCIA_DE → Causas...')
  let created = 0

  for (const s of sentencias) {
    const result = await executeWrite(
      `MATCH (sent:DictaduraSentencia {id: $sentenciaId})
       MATCH (c:DictaduraCausa {id: $causaId})
       MERGE (sent)-[r:SENTENCIA_DE]->(c)
       ON CREATE SET
         r.source = $source,
         r.ingestion_wave = $wave,
         r.created_at = datetime()`,
      {
        sentenciaId: s.id,
        causaId: s.causa_id,
        source: SOURCE,
        wave: WAVE,
      },
    )
    const counters = result.summary.counters
    if (counters['relationshipsCreated']) {
      created += counters['relationshipsCreated']
      console.log(`  + ${s.name} → ${s.causa_id}`)
    }
  }

  return created
}

/** CONDENADO_A / ABSUELTO_EN: DictaduraPersona → DictaduraSentencia */
async function linkPersonasSentencias(): Promise<number> {
  console.log('\nLinking Personas → CONDENADO_A / ABSUELTO_EN → Sentencias...')
  let condenados = 0
  let absueltos = 0
  let skipped = 0

  for (const s of sentencias) {
    for (const c of s.condenas) {
      if (c.resultado === 'absuelto') {
        // ABSUELTO_EN relationship
        const result = await executeWrite(
          `MATCH (p:DictaduraPersona {id: $personaId})
           MATCH (s:DictaduraSentencia {id: $sentenciaId})
           MERGE (p)-[r:ABSUELTO_EN]->(s)
           ON CREATE SET
             r.detail = $detail,
             r.source = $source,
             r.ingestion_wave = $wave,
             r.created_at = datetime()`,
          {
            personaId: c.persona_id,
            sentenciaId: s.id,
            detail: c.detail,
            source: SOURCE,
            wave: WAVE,
          },
        )
        const counters = result.summary.counters
        if (counters['relationshipsCreated']) {
          absueltos += counters['relationshipsCreated']
          console.log(`  ~ ABSUELTO: ${c.persona_id} en ${s.slug}`)
        }
      } else if (c.resultado === 'muerto_antes_sentencia') {
        // Record but no conviction — create a PROCESADO_EN relationship
        const result = await executeWrite(
          `MATCH (p:DictaduraPersona {id: $personaId})
           MATCH (s:DictaduraSentencia {id: $sentenciaId})
           MERGE (p)-[r:PROCESADO_EN]->(s)
           ON CREATE SET
             r.resultado = 'muerto_antes_sentencia',
             r.detail = $detail,
             r.source = $source,
             r.ingestion_wave = $wave,
             r.created_at = datetime()`,
          {
            personaId: c.persona_id,
            sentenciaId: s.id,
            detail: c.detail,
            source: SOURCE,
            wave: WAVE,
          },
        )
        const counters = result.summary.counters
        if (counters['relationshipsCreated']) {
          skipped += counters['relationshipsCreated']
          console.log(`  ! MUERTO_ANTES: ${c.persona_id} en ${s.slug}`)
        }
      } else {
        // CONDENADO_A relationship (prision_perpetua, prision, in_absentia)
        const result = await executeWrite(
          `MATCH (p:DictaduraPersona {id: $personaId})
           MATCH (s:DictaduraSentencia {id: $sentenciaId})
           MERGE (p)-[r:CONDENADO_A]->(s)
           ON CREATE SET
             r.resultado = $resultado,
             r.years = $years,
             r.detail = $detail,
             r.source = $source,
             r.ingestion_wave = $wave,
             r.created_at = datetime()`,
          {
            personaId: c.persona_id,
            sentenciaId: s.id,
            resultado: c.resultado,
            years: c.years,
            detail: c.detail,
            source: SOURCE,
            wave: WAVE,
          },
        )
        const counters = result.summary.counters
        if (counters['relationshipsCreated']) {
          condenados += counters['relationshipsCreated']
          console.log(`  + CONDENADO: ${c.persona_id} → ${s.slug} (${c.resultado}${c.years ? ', ' + c.years + ' años' : ''})`)
        }
      }
    }
  }

  console.log(`\n  Condenas: ${condenados}, Absoluciones: ${absueltos}, Procesados (fallecidos): ${skipped}`)
  return condenados + absueltos + skipped
}

/** Link DictaduraSentencia → DictaduraTribunal (DICTADA_POR) */
async function linkSentenciasTribunales(): Promise<number> {
  console.log('\nLinking Sentencias → DICTADA_POR → Tribunales...')
  let created = 0

  for (const s of sentencias) {
    const result = await executeWrite(
      `MATCH (sent:DictaduraSentencia {id: $sentenciaId})
       MATCH (t:DictaduraTribunal {id: $tribunalId})
       MERGE (sent)-[r:DICTADA_POR]->(t)
       ON CREATE SET
         r.date = $date,
         r.source = $source,
         r.ingestion_wave = $wave,
         r.created_at = datetime()`,
      {
        sentenciaId: s.id,
        tribunalId: s.tribunal_id,
        date: s.date,
        source: SOURCE,
        wave: WAVE,
      },
    )
    const counters = result.summary.counters
    if (counters['relationshipsCreated']) {
      created += counters['relationshipsCreated']
      console.log(`  + ${s.slug} → ${s.tribunal_id}`)
    }
  }

  return created
}

/** Update DictaduraCausa status based on sentencias */
async function updateCausaStatuses(): Promise<number> {
  console.log('\nUpdating Causa statuses from sentencia outcomes...')
  let updated = 0

  // Unique causa IDs from our sentencias
  const causaIds = [...new Set(sentencias.map((s) => s.causa_id))]

  for (const causaId of causaIds) {
    const result = await executeWrite(
      `MATCH (c:DictaduraCausa {id: $causaId})
       SET c.status = 'con_sentencia',
           c.updated_at = datetime()`,
      { causaId },
    )
    const counters = result.summary.counters
    if (counters['propertiesSet']) {
      updated++
      console.log(`  ~ ${causaId} → con_sentencia`)
    }
  }

  return updated
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Wave 3: Juicios y Sentencias ===\n')

  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('ERROR: Cannot connect to Neo4j. Is the database running?')
    process.exit(1)
  }
  console.log('Neo4j connected\n')

  // Verify seed data exists
  const driver = getDriver()
  const session = driver.session()
  try {
    const seedCheck = await session.run(
      `MATCH (p:DictaduraPersona {caso_slug: $casoSlug})
       RETURN count(p) AS personas`,
      { casoSlug: CASO_SLUG },
    )
    const personaCount = countInt(seedCheck.records[0].get('personas'))
    console.log(`Existing DictaduraPersona nodes: ${personaCount}`)

    const causaCheck = await session.run(
      `MATCH (c:DictaduraCausa {caso_slug: $casoSlug})
       RETURN count(c) AS causas`,
      { casoSlug: CASO_SLUG },
    )
    const causaCount = countInt(causaCheck.records[0].get('causas'))
    console.log(`Existing DictaduraCausa nodes: ${causaCount}`)

    if (causaCount === 0) {
      console.error('\nERROR: No DictaduraCausa nodes found. Run seed-caso-dictadura.ts first.')
      process.exit(1)
    }
  } finally {
    await session.close()
  }

  // Step 1: Create Tribunal nodes
  const tribunalesCreated = await ingestTribunales()
  console.log(`\nTribunales created: ${tribunalesCreated}`)

  // Step 2: Create Sentencia nodes
  const sentenciasCreated = await ingestSentencias()
  console.log(`\nSentencias created: ${sentenciasCreated}`)

  // Step 3: Link Causas → JUZGADO_POR → Tribunales
  const juzgadoPorCreated = await linkCausasTribunales()
  console.log(`JUZGADO_POR relationships: ${juzgadoPorCreated}`)

  // Step 4: Link Sentencias → SENTENCIA_DE → Causas
  const sentenciaDeCreated = await linkSentenciasCausas()
  console.log(`SENTENCIA_DE relationships: ${sentenciaDeCreated}`)

  // Step 5: Link Sentencias → DICTADA_POR → Tribunales
  const dictadaPorCreated = await linkSentenciasTribunales()
  console.log(`DICTADA_POR relationships: ${dictadaPorCreated}`)

  // Step 6: Link Personas → CONDENADO_A / ABSUELTO_EN → Sentencias
  const personaRels = await linkPersonasSentencias()
  console.log(`Persona-Sentencia relationships: ${personaRels}`)

  // Step 7: Update Causa statuses
  const statusesUpdated = await updateCausaStatuses()
  console.log(`Causa statuses updated: ${statusesUpdated}`)

  // Final stats
  const statsSession = driver.session()
  try {
    console.log('\n=== Final Graph State (caso-dictadura) ===')

    const nodeCount = await statsSession.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       RETURN labels(n)[0] AS label, n.confidence_tier AS tier, count(n) AS count
       ORDER BY label, tier`,
      { casoSlug: CASO_SLUG },
    )

    let totalNodes = 0
    for (const r of nodeCount.records) {
      const c = countInt(r.get('count'))
      totalNodes += c
      console.log(`  ${r.get('label')} [${r.get('tier')}]: ${c}`)
    }
    console.log(`\n  Total nodes: ${totalNodes}`)

    const edgeCount = await statsSession.run(
      `MATCH (a)-[r]->(b)
       WHERE a.caso_slug = $casoSlug OR b.caso_slug = $casoSlug
       RETURN type(r) AS relType, count(r) AS count
       ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )

    let totalEdges = 0
    for (const r of edgeCount.records) {
      const c = countInt(r.get('count'))
      totalEdges += c
      console.log(`  ${r.get('relType')}: ${c}`)
    }
    console.log(`\n  Total edges: ${totalEdges}`)

    // Wave 3 specific stats
    const wave3Nodes = await statsSession.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug AND n.ingestion_wave = $wave
       RETURN labels(n)[0] AS label, count(n) AS count
       ORDER BY label`,
      { casoSlug: CASO_SLUG, wave: WAVE },
    )

    console.log('\n  --- Wave 3 nodes ---')
    for (const r of wave3Nodes.records) {
      console.log(`  ${r.get('label')}: ${countInt(r.get('count'))}`)
    }

    const wave3Edges = await statsSession.run(
      `MATCH ()-[r]->()
       WHERE r.ingestion_wave = $wave
       RETURN type(r) AS relType, count(r) AS count
       ORDER BY relType`,
      { wave: WAVE },
    )

    console.log('  --- Wave 3 relationships ---')
    for (const r of wave3Edges.records) {
      console.log(`  ${r.get('relType')}: ${countInt(r.get('count'))}`)
    }
  } finally {
    await statsSession.close()
  }

  await closeDriver()
  console.log('\nWave 3 complete!')
}

main().catch((err) => {
  console.error('Wave 3 failed:', err)
  closeDriver().finally(() => process.exit(1))
})

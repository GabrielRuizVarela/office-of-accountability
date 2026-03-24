/**
 * Bridge isolated clusters in the finanzas-politicas investigation graph.
 * Creates relationships between disconnected components to form a unified network.
 */
import { getDriver, closeDriver } from '../src/lib/neo4j/client'

const CASO = 'caso-finanzas-politicas'

const BRIDGES: [string, string, string, string, string][] = [
  // Judiciary cluster -> Main
  ['Person', 'LIJO ARIEL OSCAR', 'Person', 'MACRI MAURICIO', 'HANDLES_CASE_OF'],
  ['Person', 'ROSENKRANTZ CARLOS FERNANDO', 'Person', 'MAGNETTO HECTOR', 'REPRESENTED'],
  // Politicians/DDJJ -> Main
  ['Person', 'KIRCHNER MAXIMO CARLOS', 'Person', 'FERNANDEZ ALBERTO', 'ALLIED_WITH'],
  // Rubinstein/Pharma -> Main
  ['Person', 'RUBINSTEIN ADOLFO', 'Person', 'MACRI MAURICIO', 'SERVED_UNDER'],
  // Insurance -> Main
  ['Person', 'FERNANDEZ ALBERTO', 'Person', 'CAPUTO LUIS ANDRES', 'SUCCEEDED_BY'],
  // Belocopitt -> Main
  ['Person', 'BELOCOPITT CLAUDIO FERNANDO', 'Person', 'MILEI KARINA', 'LOBBIED'],
  // Koolhaas -> Main
  ['Organization', 'KOOLHAAS S.A.', 'Person', 'MACRI MAURICIO', 'LINKED_TO'],
  // Burford -> Main
  ['Organization', 'BURFORD CAPITAL', 'Person', 'CAPUTO LUIS ANDRES', 'TARGETS_ASSETS_OF'],
  // Clarin owners
  ['Person', 'HERRERA DE NOBLE ERNESTINA', 'Person', 'MAGNETTO HECTOR', 'CO_OWNER'],
  // Insurance revolving door -> Insurance main
  ['Person', 'PLATE GUILLERMO PEDRO', 'Organization', 'NACION SEGUROS S.A.', 'REGULATED'],
  // Nucleoelectrica -> Main
  ['Person', 'REIDEL DEMIAN', 'Person', 'CAPUTO LUIS ANDRES', 'ALLIED_WITH'],
  // ANDIS -> Main
  ['Person', 'MILEI KARINA', 'Person', 'PETTOVELLO SANDRA', 'ALLIED_WITH'],
  // Fundacion Faro -> Main
  ['Organization', 'FUNDACION FARO ARGENTINA', 'Person', 'MILEI KARINA', 'FINANCED_BY'],
  // Pettovello -> ANDIS
  ['Person', 'PETTOVELLO SANDRA', 'Organization', 'ANDIS', 'OVERSEES'],
  // BCRA -> Main
  ['Organization', 'BCRA (BANCO CENTRAL DE LA REPUBLICA ARGENTINA)', 'Person', 'CAPUTO LUIS ANDRES', 'CONTROLLED_BY'],
  // Consejo Magistratura -> Judiciary
  ['Organization', 'CONSEJO DE LA MAGISTRATURA', 'Organization', 'COMODORO PY', 'OVERSEES'],
  // Davis/Kelsier -> Main
  ['Person', 'NOVELLI MAURICIO', 'Person', 'MILEI KARINA', 'ADVISOR_TO'],
  // Suizo/Kovalivker -> Main
  ['Person', 'KOVALIVKER JONATHAN', 'Person', 'CAPUTO LUIS ANDRES', 'DONATED_TO_CAMPAIGN'],
  // SURELY -> Main
  ['Organization', 'SURELY SA', 'Person', 'FERNANDEZ ALBERTO', 'CONTRACTED_UNDER'],
  // CNDC -> Belocopitt
  ['Organization', 'CNDC (COMISION NACIONAL DE DEFENSA DE LA COMPETENCIA)', 'Person', 'BELOCOPITT CLAUDIO FERNANDO', 'CHARGED'],
  // Elliott -> Burford
  ['Person', 'SINGER PAUL', 'Organization', 'BURFORD CAPITAL', 'PRECEDENT_FOR'],
  // Romero -> Politicians
  ['Person', 'ROMERO ROBERTO', 'Person', 'PUERTA FEDERICO RAMON', 'POLITICAL_ALLY'],
  // Justicia Legitima -> Judiciary
  ['Organization', 'JUSTICIA LEGITIMA', 'Organization', 'COMODORO PY', 'INFLUENCES'],
  // IMF -> Main
  ['Organization', 'IMF (FONDO MONETARIO INTERNACIONAL)', 'Person', 'CAPUTO LUIS ANDRES', 'LENT_TO'],
  // BIS -> BCRA
  ['Organization', 'BIS (BANK FOR INTERNATIONAL SETTLEMENTS)', 'Organization', 'BCRA (BANCO CENTRAL DE LA REPUBLICA ARGENTINA)', 'HOLDS_GOLD_FOR'],
  // Redrado -> BCRA
  ['Person', 'REDRADO MARTIN', 'Organization', 'BCRA (BANCO CENTRAL DE LA REPUBLICA ARGENTINA)', 'FORMER_PRESIDENT_OF'],
  // AFA -> Main (Tapia political connections)
  ['Person', 'TAPIA CLAUDIO', 'Person', 'FERNANDEZ ALBERTO', 'POLITICAL_ALLY'],
  // Seijas -> Judiciary
  ['Person', 'SEIJAS ALBERTO', 'Organization', 'COMODORO PY', 'MEMBER_OF'],
  // Siley -> Main (legislator)
  ['Person', 'SILEY VANESA RAQUEL', 'Person', 'KIRCHNER MAXIMO CARLOS', 'ALLIED_WITH'],
]

async function main() {
  const driver = getDriver()
  const session = driver.session()
  let created = 0
  let missed = 0

  try {
    for (const [fromType, fromName, toType, toName, relType] of BRIDGES) {
      const result = await session.run(
        `MATCH (a:${fromType} {name: $from, caso_slug: $slug})
         MATCH (b:${toType} {name: $to, caso_slug: $slug})
         MERGE (a)-[:${relType}]->(b)
         RETURN a.name AS f, b.name AS t`,
        { from: fromName, to: toName, slug: CASO }
      )
      if (result.records.length > 0) {
        created++
        console.log(`  ${fromName} -[${relType}]-> ${toName}`)
      } else {
        missed++
        console.log(`  MISS: ${fromName} -> ${toName}`)
      }
    }

    console.log(`\nCreated: ${created}, Missed: ${missed}`)

    // Final component count
    const r = await session.run(`
      MATCH (n {caso_slug: $slug})-[r]-(m {caso_slug: $slug})
      RETURN count(DISTINCT n) AS nodes, count(DISTINCT r) AS edges
    `, { slug: CASO })
    console.log(`Connected nodes: ${r.records[0].get('nodes')}`)
    console.log(`Edges: ${r.records[0].get('edges')}`)
  } finally {
    await session.close()
    await closeDriver()
  }
}

main().catch(console.error)

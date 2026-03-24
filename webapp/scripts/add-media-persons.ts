import { getDriver, closeDriver } from '../src/lib/neo4j/client'
const S = 'caso-finanzas-politicas'
async function main() {
  const driver = getDriver()
  const session = driver.session()
  try {
    const persons = [
      ['MANZANO JOSE LUIS', 'Ex-Menem Interior Minister. Controls Grupo America 40% + EDENOR + Metrogas + 243K ha lithium. Geneva. Partner of Vila and Belocopitt.'],
      ['VIALE JONATAN', 'Journalist TN. Ghost company Polonia Producciones received govt contracts. YPF paid USD 350K for Milei interview.'],
      ['SANTORO DANIEL', 'Clarin judicial reporter. 61 emails with D Alessio convicted 13.5yr. Processed for role in espionage network.'],
      ['DALESSIO MARCELO', 'Convicted 13.5yr. False DEA agent. Operated intelligence-media-judiciary pipeline. The proven link.'],
    ]
    for (const [name, desc] of persons) {
      await session.run('MERGE (n:Person {name: $n, caso_slug: $s}) SET n.description_en = $d, n.confidence_tier = "silver", n.submitted_by = "investigation:media-power"', {n: name, s: S, d: desc})
    }
    const rels: [string, string, string, string, string][] = [
      ['Person','MANZANO JOSE LUIS','Organization','GRUPO AMERICA S.A.','CONTROLS'],
      ['Person','MANZANO JOSE LUIS','Person','BELOCOPITT CLAUDIO FERNANDO','BUSINESS_PARTNER'],
      ['Person','MANZANO JOSE LUIS','Person','MENEM CARLOS SAUL','SERVED_UNDER'],
      ['Person','VIALE JONATAN','Organization','GRUPO CLARIN S.A.','WORKS_FOR'],
      ['Person','VIALE JONATAN','Person','CAPUTO SANTIAGO','CONTROLLED_BY'],
      ['Person','SANTORO DANIEL','Organization','GRUPO CLARIN S.A.','WORKS_FOR'],
      ['Person','DALESSIO MARCELO','Person','SANTORO DANIEL','FED_INTELLIGENCE_TO'],
      ['Person','DALESSIO MARCELO','Person','BULLRICH PATRICIA','LINKED_TO'],
      ['Person','DALESSIO MARCELO','Person','ERCOLINI JULIAN DANIEL','ACQUITTED_BY'],
    ]
    for (const [ft,fn,tt,tn,rt] of rels) {
      await session.run(`MATCH (a:${ft} {name: $f, caso_slug: $s}) MATCH (b:${tt} {name: $t, caso_slug: $s}) MERGE (a)-[:${rt}]->(b)`, {f:fn,t:tn,s:S})
    }
    const r1 = await session.run('MATCH (n) WHERE n.caso_slug = $s RETURN count(n) AS nodes', {s:S})
    const r2 = await session.run('MATCH (n {caso_slug: $s})-[r]-() RETURN count(DISTINCT r) AS edges', {s:S})
    console.log('Final: ' + r1.records[0].get('nodes').toString() + ' nodes, ' + r2.records[0].get('edges').toString() + ' edges')
  } finally { await session.close(); await closeDriver() }
}
main().catch(console.error)

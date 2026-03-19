// Run with:
//   npx tsx scripts/promote-nodes.ts --wave 1 --to silver
//   npx tsx scripts/promote-nodes.ts --ids ep-w1-foo,ep-w1-bar --to gold

import { executeWrite, verifyConnectivity, closeDriver } from '../src/lib/neo4j/client'

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`)
  return idx >= 0 ? process.argv[idx + 1] : process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]
}

async function main(): Promise<void> {
  const to = getArg('to')
  const wave = getArg('wave')
  const ids = getArg('ids')

  if (!to || !['silver', 'gold'].includes(to)) {
    console.error('Usage: --to silver|gold and either --wave N or --ids id1,id2,...')
    process.exit(1)
  }

  const connected = await verifyConnectivity()
  if (!connected) { console.error('Failed to connect to Neo4j.'); process.exit(1) }

  if (wave) {
    const waveNum = parseInt(wave)
    await executeWrite(
      `MATCH (n) WHERE n.ingestion_wave = $wave AND n.caso_slug = 'caso-epstein'
       SET n.confidence_tier = $tier`,
      { wave: waveNum, tier: to },
    )
    await executeWrite(
      `MATCH ()-[r]->() WHERE r.ingestion_wave = $wave SET r.confidence_tier = $tier`,
      { wave: waveNum, tier: to },
    )
    console.log(`Promoted all wave ${wave} nodes and edges to ${to}.`)
  } else if (ids) {
    const idList = ids.split(',').map((s) => s.trim())
    await executeWrite(
      `MATCH (n) WHERE n.id IN $ids SET n.confidence_tier = $tier`,
      { ids: idList, tier: to },
    )
    console.log(`Promoted ${idList.length} nodes to ${to}.`)
  }

  await closeDriver()
}

main().catch((error) => {
  console.error('Promote failed:', error)
  closeDriver().finally(() => process.exit(1))
})

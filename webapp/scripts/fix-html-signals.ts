#!/usr/bin/env npx tsx
import 'dotenv/config'
import { getDriver } from '../src/lib/neo4j/client'

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&#0?39;/g, "'")
    .replace(/&#0?34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function main() {
  const driver = getDriver()
  const session = driver.session()

  const result = await session.run(
    `MATCH (s:NuclearSignal)
     WHERE s.title_en CONTAINS '<' OR s.title_en CONTAINS '&#'
       OR s.summary_en CONTAINS '<' OR s.summary_en CONTAINS '&#'
     RETURN s.id AS id, s.title_en AS title, s.summary_en AS summary`,
  )

  console.log(`Found ${result.records.length} signals with HTML to clean`)

  for (const rec of result.records) {
    const id = rec.get('id') as string
    const title = stripHtml(rec.get('title') as string)
    const summary = stripHtml(rec.get('summary') as string)

    await session.executeWrite((tx) =>
      tx.run(
        'MATCH (s:NuclearSignal {id: $id}) SET s.title_en = $title, s.summary_en = $summary',
        { id, title, summary },
      ),
    )
    console.log(`  Fixed: ${id.slice(0, 70)}`)
  }

  await session.close()
  await driver.close()
  console.log('Done')
}

main()

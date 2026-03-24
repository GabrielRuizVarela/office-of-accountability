/**
 * Fetches Arms Control Association feed and filters for nuclear-relevant items.
 */
import { fetchRssFeed, filterRecentItems, type RssItem } from '../shared/rss-parser'
import { filterNuclearRelevant } from '../shared/keyword-filter'

const ACA_FEED_URL = 'https://www.armscontrol.org/rss.xml'

export interface FetchAcaResult {
  readonly items: readonly RssItem[]
  readonly stats: {
    readonly totalFetched: number
    readonly afterDateFilter: number
    readonly afterKeywordFilter: number
  }
}

export async function fetchAcaData(hoursBack: number = 24): Promise<FetchAcaResult> {
  console.log('  Fetching Arms Control Association feed...')
  const feed = await fetchRssFeed(ACA_FEED_URL)
  console.log(`  Raw items: ${feed.items.length}`)

  const recent = filterRecentItems(feed.items, hoursBack)
  console.log(`  After date filter (${hoursBack}h): ${recent.length}`)

  const relevant = filterNuclearRelevant(recent, ['title', 'description'])
  console.log(`  After keyword filter: ${relevant.length}`)

  return {
    items: relevant,
    stats: {
      totalFetched: feed.items.length,
      afterDateFilter: recent.length,
      afterKeywordFilter: relevant.length,
    },
  }
}

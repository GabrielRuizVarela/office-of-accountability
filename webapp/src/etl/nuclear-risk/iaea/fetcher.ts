/**
 * Fetches IAEA news feed and filters for nuclear-relevant items.
 */
import { fetchRssFeed, filterRecentItems, type RssItem } from '../shared/rss-parser'
import { filterNuclearRelevant } from '../shared/keyword-filter'

const IAEA_FEED_URL = 'https://www.iaea.org/feeds/topnews'

export interface FetchIaeaResult {
  readonly items: readonly RssItem[]
  readonly stats: {
    readonly totalFetched: number
    readonly afterDateFilter: number
    readonly afterKeywordFilter: number
  }
}

export async function fetchIaeaData(hoursBack: number = 24): Promise<FetchIaeaResult> {
  console.log('  Fetching IAEA news feed...')
  const feed = await fetchRssFeed(IAEA_FEED_URL)
  console.log(`  Raw items: ${feed.items.length}`)

  const recent = filterRecentItems(feed.items, hoursBack)
  console.log(`  After date filter (${hoursBack}h): ${recent.length}`)

  // IAEA feed is mostly nuclear-relevant, but filter anyway
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

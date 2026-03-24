/**
 * Fetches NATO news feed and filters for nuclear-relevant items.
 */
import { fetchRssFeed, filterRecentItems, type RssItem } from '../shared/rss-parser'
import { filterNuclearRelevant } from '../shared/keyword-filter'

// NATO removed RSS feeds — use Google News RSS as proxy
const NATO_FEED_URL = 'https://news.google.com/rss/search?q=site:nato.int+nuclear+OR+deterrence+OR+defense&hl=en-US&gl=US&ceid=US:en'

export interface FetchNatoResult {
  readonly items: readonly RssItem[]
  readonly stats: {
    readonly totalFetched: number
    readonly afterDateFilter: number
    readonly afterKeywordFilter: number
  }
}

export async function fetchNatoData(hoursBack: number = 24): Promise<FetchNatoResult> {
  console.log('  Fetching NATO news feed...')
  const feed = await fetchRssFeed(NATO_FEED_URL)
  console.log(`  Raw items: ${feed.items.length}`)

  const recent = filterRecentItems(feed.items, hoursBack)
  console.log(`  After date filter (${hoursBack}h): ${recent.length}`)

  // NATO feed covers many topics — filter for nuclear relevance
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

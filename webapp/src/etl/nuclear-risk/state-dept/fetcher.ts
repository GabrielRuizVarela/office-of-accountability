/**
 * Fetches US State Department press releases feed and filters for nuclear-relevant items.
 */
import { fetchRssFeed, filterRecentItems, type RssItem } from '../shared/rss-parser'
import { filterNuclearRelevant } from '../shared/keyword-filter'

const STATE_DEPT_FEED_URL = 'https://www.state.gov/rss-feed/press-releases/feed/'

export interface FetchStateDeptResult {
  readonly items: readonly RssItem[]
  readonly stats: {
    readonly totalFetched: number
    readonly afterDateFilter: number
    readonly afterKeywordFilter: number
  }
}

export async function fetchStateDeptData(hoursBack: number = 24): Promise<FetchStateDeptResult> {
  console.log('  Fetching State Department press releases feed...')
  const feed = await fetchRssFeed(STATE_DEPT_FEED_URL)
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

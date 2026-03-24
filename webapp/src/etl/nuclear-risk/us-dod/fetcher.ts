/**
 * Fetches US Department of Defense news feed and filters for nuclear-relevant items.
 */
import { fetchRssFeed, filterRecentItems, type RssItem } from '../shared/rss-parser'
import { filterNuclearRelevant } from '../shared/keyword-filter'

// defense.gov 301-redirects to war.gov — use final URL directly
const US_DOD_FEED_URL = 'https://www.war.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945'

export interface FetchUsDodResult {
  readonly items: readonly RssItem[]
  readonly stats: {
    readonly totalFetched: number
    readonly afterDateFilter: number
    readonly afterKeywordFilter: number
  }
}

export async function fetchUsDodData(hoursBack: number = 24): Promise<FetchUsDodResult> {
  console.log('  Fetching US DoD news feed...')
  const feed = await fetchRssFeed(US_DOD_FEED_URL)
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

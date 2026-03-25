/**
 * Fetches Bulletin of the Atomic Scientists articles via WordPress REST API.
 * RSS feed is blocked by Cloudflare — using WP REST API as alternative.
 */
import type { RssItem } from '../shared/rss-parser'
import { filterNuclearRelevant } from '../shared/keyword-filter'

// RSS is blocked (403) — use WordPress REST API
const BULLETIN_API_URL = 'https://thebulletin.org/wp-json/wp/v2/posts?per_page=20&_fields=id,title,link,date,excerpt'

interface WpPost {
  id: number
  title: { rendered: string }
  link: string
  date: string
  excerpt: { rendered: string }
}

export interface FetchBulletinResult {
  readonly items: readonly RssItem[]
  readonly stats: {
    readonly totalFetched: number
    readonly afterDateFilter: number
    readonly afterKeywordFilter: number
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
}

export async function fetchBulletinData(hoursBack: number = 24): Promise<FetchBulletinResult> {
  console.log('  Fetching Bulletin of the Atomic Scientists (WP API)...')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  try {
    const response = await fetch(BULLETIN_API_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'OfficeOfAccountability/1.0 (nuclear-risk-monitor)',
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Bulletin API failed: ${response.status} ${response.statusText}`)
    }

    const posts: WpPost[] = await response.json()
    console.log(`  Raw items: ${posts.length}`)

    // Convert WP posts to RssItem format for compatibility
    const allItems: RssItem[] = posts.map((post) => ({
      title: stripHtml(post.title.rendered),
      link: post.link,
      description: stripHtml(post.excerpt.rendered),
      pubDate: new Date(post.date).toUTCString(),
      guid: `bulletin-${post.id}`,
    }))

    // Filter by date
    const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000)
    const recent = allItems.filter((item) => {
      const date = new Date(item.pubDate)
      return !isNaN(date.getTime()) && date >= cutoff
    })
    console.log(`  After date filter (${hoursBack}h): ${recent.length}`)

    // Bulletin is mostly nuclear-relevant, but filter anyway
    const relevant = filterNuclearRelevant(recent, ['title', 'description'])
    console.log(`  After keyword filter: ${relevant.length}`)

    return {
      items: relevant,
      stats: {
        totalFetched: posts.length,
        afterDateFilter: recent.length,
        afterKeywordFilter: relevant.length,
      },
    }
  } finally {
    clearTimeout(timeout)
  }
}

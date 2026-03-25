/**
 * Shared RSS feed parser for nuclear risk ETL modules.
 *
 * Fetches and parses RSS/Atom feeds into a normalized item format.
 * Used by most gold/silver tier sources (IAEA, NATO, State Dept, etc.).
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const rssItemSchema = z.object({
  title: z.string().default(''),
  link: z.string().default(''),
  description: z.string().default(''),
  pubDate: z.string().default(''),
  guid: z.string().default(''),
})
export type RssItem = z.infer<typeof rssItemSchema>

export interface FeedResult {
  readonly items: RssItem[]
  readonly feedTitle: string
  readonly fetchedAt: string
}

// ---------------------------------------------------------------------------
// XML parsing (minimal, no external deps)
// ---------------------------------------------------------------------------

/** Extract text content between XML tags */
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(regex)
  if (!match) return ''
  return (match[1] ?? match[2] ?? '').trim()
}

/** Extract href from Atom link tag */
function extractAtomLink(xml: string): string {
  const match = xml.match(/<link[^>]*href="([^"]*)"[^>]*\/?>/i)
  return match?.[1] ?? ''
}

/** Parse RSS 2.0 or Atom feed XML into normalized items */
function parseFeedXml(xml: string): { title: string; items: RssItem[] } {
  const isAtom = xml.includes('<feed') && xml.includes('xmlns="http://www.w3.org/2005/Atom"')

  if (isAtom) {
    return parseAtomFeed(xml)
  }
  return parseRssFeed(xml)
}

function parseRssFeed(xml: string): { title: string; items: RssItem[] } {
  const feedTitle = extractTag(xml, 'title')
  const items: RssItem[] = []

  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match: RegExpExecArray | null
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    items.push({
      title: extractTag(itemXml, 'title'),
      link: extractTag(itemXml, 'link'),
      description: extractTag(itemXml, 'description'),
      pubDate: extractTag(itemXml, 'pubDate'),
      guid: extractTag(itemXml, 'guid') || extractTag(itemXml, 'link'),
    })
  }

  return { title: feedTitle, items }
}

function parseAtomFeed(xml: string): { title: string; items: RssItem[] } {
  const feedTitle = extractTag(xml, 'title')
  const items: RssItem[] = []

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi
  let match: RegExpExecArray | null
  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1]
    items.push({
      title: extractTag(entryXml, 'title'),
      link: extractAtomLink(entryXml) || extractTag(entryXml, 'link'),
      description: extractTag(entryXml, 'summary') || extractTag(entryXml, 'content'),
      pubDate: extractTag(entryXml, 'published') || extractTag(entryXml, 'updated'),
      guid: extractTag(entryXml, 'id') || extractAtomLink(entryXml),
    })
  }

  return { title: feedTitle, items }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch and parse an RSS or Atom feed.
 *
 * @param url - Feed URL
 * @param options - Optional fetch timeout (default 30s)
 */
export async function fetchRssFeed(
  url: string,
  options: { timeoutMs?: number } = {},
): Promise<FeedResult> {
  const { timeoutMs = 30_000 } = options

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        // Some government sites (state.gov) require a browser-like User-Agent
        'User-Agent': 'Mozilla/5.0 (compatible; OfficeOfAccountability/1.0; nuclear-risk-monitor)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    })

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status} ${response.statusText} for ${url}`)
    }

    const xml = await response.text()
    const { title, items } = parseFeedXml(xml)

    return {
      items,
      feedTitle: title,
      fetchedAt: new Date().toISOString(),
    }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Filter RSS items to only those published within the last N hours.
 */
export function filterRecentItems(items: RssItem[], hoursBack: number = 24): RssItem[] {
  const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000)

  return items.filter((item) => {
    if (!item.pubDate) return true // keep items without dates (conservative)
    const date = new Date(item.pubDate)
    return !isNaN(date.getTime()) && date >= cutoff
  })
}

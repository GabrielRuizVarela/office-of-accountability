/**
 * GET /sitemap.xml
 *
 * Generates a dynamic sitemap including:
 * - Static pages (home, explorar, provincias)
 * - All politician profile pages (/politico/[slug])
 * - All province pages (/provincias/[province])
 *
 * Queries Neo4j for politician slugs and province IDs.
 * Returns XML with application/xml content type.
 * Cached for 1 hour via Cache-Control.
 */

import { getAllPoliticianSlugs, getAllProvinces } from '../../../lib/graph/politician-queries'

const BASE_URL = 'https://oficina.ar'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(loc: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export async function GET(): Promise<Response> {
  try {
    const [slugs, provinces] = await Promise.all([
      getAllPoliticianSlugs(),
      getAllProvinces(),
    ])

    const staticPages = [
      urlEntry(`${BASE_URL}/`, 'daily', '1.0'),
      urlEntry(`${BASE_URL}/explorar`, 'weekly', '0.8'),
      urlEntry(`${BASE_URL}/provincias`, 'weekly', '0.8'),
      urlEntry(`${BASE_URL}/investigaciones`, 'daily', '0.9'),
    ]

    const politicianPages = slugs
      .filter((slug) => slug.length > 0)
      .map((slug) =>
        urlEntry(`${BASE_URL}/politico/${slug}`, 'weekly', '0.7'),
      )

    const provincePages = provinces.map((prov) =>
      urlEntry(`${BASE_URL}/provincias/${prov.id}`, 'weekly', '0.6'),
    )

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...politicianPages, ...provincePages].join('\n')}
</urlset>`

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Sitemap generation failed:', error)

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(BASE_URL)}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      },
    )
  }
}

/**
 * Caso Epstein - InvestigationClientConfig.
 *
 * Static frontend configuration for the Epstein investigation.
 * Tabs, feature flags, hero text, and sources.
 */

import type { InvestigationClientConfig } from '@/lib/investigations/types'

export const casoEpsteinConfig: InvestigationClientConfig = {
  casoSlug: 'caso-epstein',
  name: {
    es: 'La Red Epstein',
    en: 'The Epstein Network',
  },
  description: {
    es: 'Como una sola relacion financiera construyo un imperio de trafico protegido por riqueza, poder y fracaso institucional. 7,287 nodos conectados, 21,944 aristas, 0 huerfanos.',
    en: 'How a single financial relationship built a trafficking empire shielded by wealth, power, and institutional failure. 7,287 connected nodes, 21,944 edges, 0 orphans.',
  },
  tabs: [
    'resumen',
    'investigacion',
    'grafo',
    'cronologia',
    'vuelos',
    'evidencia',
    'proximidad',
    'simular',
  ],
  features: {
    wallets: false,
    simulation: true,
    flights: true,
    submissions: false,
    platformGraph: true,
  },
  hero: {
    title: {
      es: 'La Red Epstein',
      en: 'The Epstein Network',
    },
    subtitle: {
      es: '7,287 nodos conectados, 21,944 aristas. Basado en registros judiciales, archivos del DOJ, bitacoras de vuelo y periodismo de investigacion.',
      en: '7,287 connected nodes, 21,944 edges. Built from court records, DOJ file releases, flight logs, and investigative reporting.',
    },
  },
  sources: [
    { name: 'US DOJ', url: 'https://www.justice.gov' },
    { name: 'SDNY Court Records', url: 'https://www.courtlistener.com' },
    { name: 'Flight Logs (FOIA)', url: 'https://archive.org' },
    { name: 'rhowardstone KG', url: 'https://github.com/rhowardstone' },
  ],
}

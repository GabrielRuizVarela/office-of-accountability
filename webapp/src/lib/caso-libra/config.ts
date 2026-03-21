/**
 * Caso Libra — InvestigationClientConfig.
 *
 * Static frontend configuration for the Libra investigation.
 * Tabs, feature flags, hero text, and sources.
 */

import type { InvestigationClientConfig } from '@/lib/investigations/types'

export const casoLibraConfig: InvestigationClientConfig = {
  casoSlug: 'caso-libra',
  name: {
    es: 'Caso Libra: La Memecoin del Presidente',
    en: 'The Libra Case: The President\'s Memecoin',
  },
  description: {
    es: 'El 14 de febrero de 2025, el presidente Milei promovio el token $LIBRA a sus 19 millones de seguidores. En horas, el precio colapso un 94%. Aproximadamente 114,000 billeteras perdieron $251 millones. Un año despues, cero imputados.',
    en: 'On February 14, 2025, President Milei promoted the $LIBRA token to his 19 million followers. Within hours, the price collapsed 94%. Approximately 114,000 wallets lost $251 million. One year later, zero indictments.',
  },
  defaultLang: 'es',
  tabs: [
    'resumen',
    'investigacion',
    'cronologia',
    'dinero',
    'evidencia',
    'grafo',
    'simular',
  ],
  features: {
    wallets: true,
    simulation: true,
    flights: false,
    submissions: true,
    platformGraph: true,
  },
  hero: {
    title: {
      es: 'Caso Libra: La Memecoin del Presidente',
      en: 'The Libra Case: The President\'s Memecoin',
    },
    subtitle: {
      es: '$251 millones perdidos. 114,000 billeteras afectadas. Cero imputados.',
      en: '$251 million lost. 114,000 wallets affected. Zero indictments.',
    },
  },
  sources: [
    { name: 'Bubblemaps', url: 'https://bubblemaps.io' },
    { name: 'Chainalysis', url: 'https://chainalysis.com' },
    { name: 'Poder Judicial de la Nacion', url: 'https://www.pjn.gov.ar' },
    { name: 'Congreso de la Nacion', url: 'https://www.congreso.gob.ar' },
  ],
}

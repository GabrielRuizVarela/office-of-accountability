/**
 * Caso Finanzas Politicas — InvestigationClientConfig.
 *
 * Static frontend configuration for the Argentine Political Finance investigation.
 * Tabs, feature flags, hero text, and sources.
 */

import type { InvestigationClientConfig } from '@/lib/investigations/types'

export const casoFinanzasPoliticasConfig: InvestigationClientConfig = {
  casoSlug: 'caso-finanzas-politicas',
  name: {
    es: 'Finanzas Politicas Argentinas',
    en: 'Argentine Political Finance',
  },
  description: {
    es: 'Investigacion sobre conexiones entre poder politico y dinero. Cruce de ocho fuentes de datos publicos para identificar politicos con entidades offshore no declaradas, contratistas que donaron ilegalmente a campanas, y flujos de dinero entre fondos publicos y estructuras opacas.',
    en: 'Investigation into the connections between political power and money. Cross-referencing eight public data sources to identify politicians with undeclared offshore entities, contractors who illegally donated to campaigns, and money flows between public funds and opaque structures.',
  },
  defaultLang: 'es',
  tabs: [
    'resumen',
    'investigacion',
    'cronologia',
    'dinero',
    'conexiones',
  ],
  features: {
    wallets: false,
    simulation: false,
    flights: false,
    submissions: false,
    platformGraph: true,
  },
  hero: {
    title: {
      es: 'Finanzas Politicas Argentinas',
      en: 'Argentine Political Finance',
    },
    subtitle: {
      es: 'Cruce de ocho fuentes de datos publicos: Como Voto, ICIJ, CNE, Boletin Oficial, IGJ, CNV, DDJJ, y enriquecimiento cruzado.',
      en: 'Cross-referencing eight public data sources: Como Voto, ICIJ, CNE, Boletin Oficial, IGJ, CNV, DDJJ, and cross-enrichment.',
    },
  },
  sources: [
    { name: 'Como Voto', url: 'https://github.com/rquiroga7/Como_voto' },
    { name: 'ICIJ Offshore Leaks', url: 'https://offshoreleaks.icij.org' },
    { name: 'CNE Aportes', url: 'https://www.electoral.gob.ar' },
    { name: 'Boletin Oficial', url: 'https://www.boletinoficial.gob.ar' },
    { name: 'IGJ', url: 'https://www.argentina.gob.ar/justicia/igj' },
    { name: 'CNV', url: 'https://www.argentina.gob.ar/cnv' },
  ],
}

export interface InvestigationConfig {
  slug: string
  title: string
  subtitle: string
  description: string
  status: 'active' | 'archived' | 'draft'
  color: string
  stats: { label: string; value: string }[]
  href: string
}

export const investigations: InvestigationConfig[] = [
  {
    slug: 'caso-libra',
    title: 'Caso Libra: La Memecoin del Presidente',
    subtitle: 'Investigacion activa',
    description:
      'Milei promovio $LIBRA a 19M de seguidores. El precio colapso 94% en horas. 114,000+ billeteras perdieron $251M+.',
    status: 'active',
    color: 'purple',
    stats: [
      { label: 'Perdidas', value: '$251M+' },
      { label: 'Billeteras afectadas', value: '114,000+' },
      { label: 'Caida', value: '94%' },
    ],
    href: '/caso/caso-libra',
  },
  {
    slug: 'caso-epstein',
    title: 'Caso Epstein: Red de trafico y poder',
    subtitle: 'Investigacion activa',
    description:
      '7,287 entidades y 21,944 relaciones documentadas. Documentos judiciales, registros de vuelo, 72 verificaciones de hechos.',
    status: 'active',
    color: 'red',
    stats: [
      { label: 'Entidades', value: '7,287' },
      { label: 'Actores', value: '355' },
      { label: 'Documentos', value: '1,044' },
    ],
    href: '/caso/caso-epstein',
  },
  {
    slug: 'finanzas-politicas',
    title: 'Finanzas Politicas Argentinas',
    subtitle: 'Investigacion activa',
    description:
      'Financiamiento de campanas, declaraciones juradas patrimoniales, sociedades offshore y conexiones entre politicos y empresas.',
    status: 'active',
    color: 'emerald',
    stats: [
      { label: 'Legisladores', value: '329' },
      { label: 'Fuentes ETL', value: '7' },
    ],
    href: '/caso/finanzas-politicas',
  },
]

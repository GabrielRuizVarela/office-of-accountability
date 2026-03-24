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
    slug: 'finanzas-politicas',
    title: 'Finanzas Politicas Argentinas',
    subtitle: 'Investigacion activa — 2.4M nodos',
    description:
      'Monopolios, financiamiento de campanas, declaraciones juradas patrimoniales, sociedades offshore, obra publica y conexiones entre politicos y empresas. 9 fuentes de datos cruzadas.',
    status: 'active',
    color: 'emerald',
    stats: [
      { label: 'Nodos', value: '2.4M+' },
      { label: 'Cruces CUIT', value: '48,212' },
      { label: 'Fuentes ETL', value: '9' },
    ],
    href: '/caso/finanzas-politicas',
  },
  {
    slug: 'caso-epstein',
    title: 'Caso Epstein: Red de trafico y poder',
    subtitle: 'Investigacion activa',
    description:
      '7,276 entidades y 11,040 relaciones documentadas. Documentos judiciales, registros de vuelo, 77 verificaciones de hechos.',
    status: 'active',
    color: 'red',
    stats: [
      { label: 'Entidades', value: '7,276' },
      { label: 'Actores', value: '374' },
      { label: 'Documentos', value: '1,044' },
    ],
    href: '/caso/caso-epstein',
  },
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
]

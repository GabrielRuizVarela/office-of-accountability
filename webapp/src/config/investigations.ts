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
    slug: 'finanzas-politicas',
    title: 'Finanzas Politicas Argentinas',
    subtitle: 'Investigacion activa',
    description:
      'Financiamiento de campañas, declaraciones juradas patrimoniales, sociedades offshore y conexiones entre politicos y empresas.',
    status: 'active',
    color: 'emerald',
    stats: [
      { label: 'Legisladores', value: '329' },
      { label: 'Fuentes ETL', value: '7' },
    ],
    href: '/caso/finanzas-politicas',
  },
  {
    slug: 'monopolios',
    title: 'Monopolios en Argentina',
    subtitle: 'Investigacion activa — 18 sectores',
    description:
      'Mercados monopolizados: telecomunicaciones, energia, alimentos, medios, banca, mineria, agroexportacion, construccion, farmaceutica. 829+ cruces Neo4j, 75 afirmaciones verificadas.',
    status: 'active',
    color: 'amber',
    stats: [
      { label: 'Sectores', value: '18' },
      { label: 'Cruces Neo4j', value: '829+' },
      { label: 'Costo anual', value: 'USD 22.5B' },
    ],
    href: '/caso/monopolios',
  },
]

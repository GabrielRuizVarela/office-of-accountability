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
    slug: 'caso-dictadura',
    title: 'Caso Dictadura: 1976-1983',
    subtitle: 'Investigacion activa',
    description:
      'Dictadura militar argentina. 9.415 victimas documentadas, 774 centros clandestinos, 987 paginas SIDE desclasificadas, 54 brechas de rendicion de cuentas senaladas.',
    status: 'active',
    color: 'amber',
    stats: [
      { label: 'Victimas', value: '9.415' },
      { label: 'CCDs', value: '774' },
      { label: 'Nodos', value: '14.512' },
    ],
    href: '/caso/caso-dictadura',
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
  {
    slug: 'riesgo-nuclear',
    title: 'Riesgo Nuclear Global',
    subtitle: 'Monitoreo diario de senales de escalada nuclear',
    description:
      'Seguimiento de senales que podrian indicar escalada del riesgo nuclear: desarrollos militares, declaraciones oficiales, tratados, pruebas de misiles y datos OSINT de 31 fuentes.',
    status: 'active',
    color: 'yellow',
    stats: [
      { label: 'Fuentes', value: '31' },
      { label: 'Teatros', value: '7' },
      { label: 'Estados nucleares', value: '9' },
    ],
    href: '/caso/riesgo-nuclear',
  },
]

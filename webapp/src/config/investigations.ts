export interface InvestigationConfig {
  slug: string
  status: 'active' | 'archived' | 'draft'
  color: string
  stats: { key: string; value: string }[]
  href: string
}

export const investigations: InvestigationConfig[] = [
  {
    slug: 'caso-libra',
    status: 'active',
    color: 'purple',
    stats: [
      { key: 'losses', value: '$251M+' },
      { key: 'walletsAffected', value: '114,000+' },
      { key: 'drop', value: '94%' },
    ],
    href: '/caso/caso-libra',
  },
  {
    slug: 'caso-epstein',
    status: 'active',
    color: 'red',
    stats: [
      { key: 'entities', value: '7,276' },
      { key: 'actors', value: '374' },
      { key: 'documents', value: '1,044' },
    ],
    href: '/caso/caso-epstein',
  },
  {
    slug: 'caso-dictadura',
    status: 'active',
    color: 'amber',
    stats: [
      { key: 'victims', value: '9.415' },
      { key: 'ccds', value: '774' },
      { key: 'nodes', value: '14.512' },
    ],
    href: '/caso/caso-dictadura',
  },
  {
    slug: 'finanzas-politicas',
    status: 'active',
    color: 'emerald',
    stats: [
      { key: 'legislators', value: '329' },
      { key: 'etlSources', value: '7' },
    ],
    href: '/caso/finanzas-politicas',
  },
  {
    slug: 'monopolios',
    status: 'active',
    color: 'amber',
    stats: [
      { key: 'sectors', value: '18' },
      { key: 'crossRefs', value: '829+' },
      { key: 'annualCost', value: 'USD 22.5B' },
    ],
    href: '/caso/monopolios',
  },
  {
    slug: 'obras-publicas',
    status: 'active',
    color: 'sky',
    stats: [
      { key: 'entities', value: '56,122' },
      { key: 'projects', value: '7,486' },
      { key: 'crossRefs', value: '13,277' },
    ],
    href: '/caso/obras-publicas',
  },
  {
    slug: 'riesgo-nuclear',
    status: 'active',
    color: 'yellow',
    stats: [
      { key: 'sources', value: '31' },
      { key: 'theaters', value: '7' },
      { key: 'nuclearStates', value: '9' },
    ],
    href: '/caso/riesgo-nuclear',
  },
]

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

export const investigations: InvestigationConfig[] = []

/**
 * Caso Epstein — Inicio (landing page).
 * Uses the OverviewContent component from PR #3 with bilingual support.
 */

import { OverviewContent } from '@/app/caso/[slug]/OverviewContent'

const EPSTEIN_STATS = [
  { label: 'Persons', value: '355', color: '#ef4444' },
  { label: 'Events', value: '27', color: '#f59e0b' },
  { label: 'Documents', value: '1,044', color: '#3b82f6' },
  { label: 'Legal Cases', value: '12', color: '#10b981' },
] as const

export default function CasoEpsteinPage() {
  return <OverviewContent slug="caso-epstein" stats={EPSTEIN_STATS} />
}

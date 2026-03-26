import type { Metadata } from 'next'

import { EngineDashboard } from '@/components/engine/EngineDashboard'

export const metadata: Metadata = {
  title: 'Investigation Engine - Epstein Case',
  description:
    'Autonomous investigation engine dashboard - pipeline, proposals, audit trail and snapshots.',
}

export default function MotorPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <EngineDashboard casoSlug="caso-epstein" />
    </div>
  )
}

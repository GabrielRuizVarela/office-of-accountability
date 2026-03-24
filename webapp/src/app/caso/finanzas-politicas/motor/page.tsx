import type { Metadata } from 'next'

import { EngineDashboard } from '@/components/engine/EngineDashboard'

export const metadata: Metadata = {
  title: 'Motor de Investigación — Finanzas Políticas',
  description:
    'Panel de control del motor de investigación autónomo — pipeline, propuestas, auditoría y snapshots.',
}

export default function MotorPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <EngineDashboard casoSlug="finanzas-politicas" />
    </div>
  )
}

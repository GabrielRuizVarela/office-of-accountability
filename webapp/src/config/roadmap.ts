export interface RoadmapPhase {
  id: string
  status: 'completed' | 'in-progress' | 'next' | 'future'
  featureCount: number
}

export const roadmapPhases: RoadmapPhase[] = [
  { id: 'phase-1', status: 'in-progress', featureCount: 4 },
  { id: 'phase-2', status: 'next', featureCount: 4 },
  { id: 'phase-3', status: 'future', featureCount: 4 },
  { id: 'phase-4', status: 'future', featureCount: 4 },
  { id: 'phase-5', status: 'future', featureCount: 4 },
]

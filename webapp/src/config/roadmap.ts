export interface RoadmapPhase {
  id: string
  title: string
  goal: string
  status: 'completed' | 'in-progress' | 'next' | 'future'
  statusLabel: string
  features: string[]
}

export const roadmapPhases: RoadmapPhase[] = []

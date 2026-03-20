export interface RoadmapPhase {
  id: string
  title: string
  goal: string
  status: 'completed' | 'in-progress' | 'next' | 'future'
  statusLabel: string
  features: string[]
}

export const roadmapPhases: RoadmapPhase[] = [
  {
    id: 'phase-1',
    title: 'Fase 1 — Motor de Grafos + Investigaciones',
    goal: 'Explorador interactivo con datos legislativos, perfiles de politicos y editor de investigaciones.',
    status: 'in-progress',
    statusLabel: 'En progreso',
    features: [
      'Explorador de grafo interactivo',
      'Ingestion de datos legislativos (Como Voto)',
      'Perfiles de politicos con historial de votos',
      'Editor de investigaciones con embeds de grafo',
      'Sistema de endorsement',
      'Cuentas de usuario y autenticacion',
    ],
  },
  {
    id: 'phase-2',
    title: 'Fase 2 — Grafos Avanzados + IA',
    goal: 'Consultas avanzadas, asistencia de IA para investigaciones y API publica.',
    status: 'next',
    statusLabel: 'Proximo',
    features: [
      'Consultas multi-hop y extraccion de sub-grafos',
      'IA para sugerir nodos relacionados y resumir documentos',
      'Extraccion automatica de promesas de discursos',
      'Verificacion de identidad (DNI/CUIL)',
      'API publica para periodistas e investigadores',
      'Mapas por jurisdiccion',
    ],
  },
  {
    id: 'phase-3',
    title: 'Fase 3 — Vision Futura',
    goal: 'Scoring de rendicion de cuentas, mecanismos de gobernanza y cobertura provincial.',
    status: 'future',
    statusLabel: 'Futuro',
    features: [
      'Scoring de rendicion de cuentas (A/B/C/D por politico)',
      'Democracia liquida y votacion cuadratica',
      'Mandatos ciudadanos',
      'Resistencia a Sybil y deteccion de anomalias',
      'Cobertura legislativa provincial',
    ],
  },
]

/**
 * Research directive management for autonomous investigation iterations.
 * Pure TS - no DB dependency. State serialized to PipelineState.progress_json.
 */

export type DirectiveStatus = 'pending' | 'active' | 'completed' | 'abandoned'

export interface Finding {
  summary: string
  confidence: number
  source_node_ids: string[]
  discovered_at: string
}

export interface ResearchDirective {
  id: string
  question: string
  priority: number
  status: DirectiveStatus
  findings: Finding[]
  created_at: string
  completed_at?: string
}

export interface ResearchProgramState {
  directives: ResearchDirective[]
  version: number
}

export class ResearchProgram {
  private directives: Map<string, ResearchDirective> = new Map()
  private version = 0

  constructor(state?: ResearchProgramState) {
    if (state) {
      for (const d of state.directives) {
        this.directives.set(d.id, { ...d })
      }
      this.version = state.version
    }
  }

  addDirective(question: string, priority = 3): ResearchDirective {
    const id = `rd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const directive: ResearchDirective = {
      id,
      question,
      priority,
      status: 'pending',
      findings: [],
      created_at: new Date().toISOString(),
    }
    this.directives.set(id, directive)
    this.version++
    return directive
  }

  removeDirective(id: string): boolean {
    const removed = this.directives.delete(id)
    if (removed) this.version++
    return removed
  }

  prioritize(id: string, priority: number): void {
    const d = this.directives.get(id)
    if (!d) return
    d.priority = priority
    this.version++
  }

  getActive(): ResearchDirective[] {
    return [...this.directives.values()]
      .filter((d) => d.status === 'active')
      .sort((a, b) => a.priority - b.priority)
  }

  getPending(): ResearchDirective[] {
    return [...this.directives.values()]
      .filter((d) => d.status === 'pending')
      .sort((a, b) => a.priority - b.priority)
  }

  getAll(): ResearchDirective[] {
    return [...this.directives.values()].sort((a, b) => a.priority - b.priority)
  }

  get(id: string): ResearchDirective | undefined {
    return this.directives.get(id)
  }

  activate(id: string): void {
    const d = this.directives.get(id)
    if (!d || d.status !== 'pending') return
    d.status = 'active'
    this.version++
  }

  addFinding(id: string, finding: Finding): void {
    const d = this.directives.get(id)
    if (!d) return
    d.findings.push(finding)
    this.version++
  }

  markCompleted(id: string): void {
    const d = this.directives.get(id)
    if (!d) return
    d.status = 'completed'
    d.completed_at = new Date().toISOString()
    this.version++
  }

  markAbandoned(id: string): void {
    const d = this.directives.get(id)
    if (!d) return
    d.status = 'abandoned'
    d.completed_at = new Date().toISOString()
    this.version++
  }

  toJSON(): ResearchProgramState {
    return {
      directives: [...this.directives.values()],
      version: this.version,
    }
  }
}

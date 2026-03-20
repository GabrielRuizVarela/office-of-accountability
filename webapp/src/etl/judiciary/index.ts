export type {
  DesignationRow,
  JudgeParams,
  CourtParams,
  AppointedByRelParams,
  ServesInRelParams,
  JudgePoliticianMaybeSameAsParams,
  JudgeDdjjMaybeSameAsParams,
  JudgeCompanyOfficerMaybeSameAsParams,
  JudgeBoardMemberMaybeSameAsParams,
} from './types'

export { fetchJudiciaryData } from './fetcher'
export type { FetchJudiciaryResult } from './fetcher'

export { transformJudiciaryAll } from './transformer'
export type { JudiciaryTransformResult, JudiciaryTransformInput } from './transformer'

export { loadJudiciaryAll } from './loader'
export type { JudiciaryLoadResult } from './loader'

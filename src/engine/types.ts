export const JURISDICTIONS = [
  'UK',
  'DE',
  'ES',
  'NL',
  'NJ',
  'PA',
  'MT',
  'SE',
  'IT',
] as const

export type Jurisdiction = (typeof JURISDICTIONS)[number]

export type Decision = 'allow' | 'deny' | 'cooler'

export type EvaluationKind =
  | 'spin'
  | 'autoplay_start'
  | 'turbo'
  | 'stop'
  | 'licence'

export interface OperatorFlags {
  deLicenceExpired: boolean
  dgeAutoplayAuth: boolean
  boardApproved: boolean
  /** Empty or null means the DE licence token is missing. */
  deLicenceToken?: string | null
}

export interface AutoplayIntent {
  spinCount: number | null
  maxLoss: number | null
}

export interface EvaluationInput {
  kind: EvaluationKind
  jurisdiction: Jurisdiction
  flags: OperatorFlags
  autoplay: AutoplayIntent
  lastSpinAt: number | null
  now: number
  sessionPlayMs: number
  dePhase: 'play' | 'confirm' | 'cooler'
  realityCheckPending: boolean
  sessionId: string
  actor: string
}

export interface AuditRecord {
  evaluated_at: string
  timestamp: string
  session_id: string
  actor: string
  jurisdiction: Jurisdiction
  kind: EvaluationKind
  rule_ids: string[]
  decision: Decision
  reason: string
  inputs: Record<string, unknown>
}

export interface RuleDecision {
  rule_ids: string[]
  jurisdiction: Jurisdiction
  decision: Decision
  reason: string
  timestamp: string
  audit: AuditRecord
}

export interface MarketProfile {
  code: Jurisdiction
  name: string
  regulator: string
  currency: string
  autoplayDefault: 'off' | 'on' | 'gated'
  turboAllowed: boolean
  minSpinGapMs: number
  notes: string
  ruleIds: string[]
}

export const SYMBOL_IDS = [
  'crown',
  'vault',
  'emerald',
  'coin',
  'horseshoe',
  'ace',
  'king',
  'queen',
] as const

export type SymbolId = (typeof SYMBOL_IDS)[number]

export interface SpinResult {
  grid: SymbolId[][]
  winAmount: number
  winningCells: Array<{ reel: number; row: number }>
  paylines: number
}

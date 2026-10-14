import type { EvaluationInput, OperatorFlags } from '../../src/engine/types'

const FLAGS: OperatorFlags = {
  deLicenceExpired: false,
  dgeAutoplayAuth: false,
  boardApproved: false,
}

export const FIXED_NOW = Date.parse('2026-09-23T16:00:00.000Z')

export function baseInput(overrides: Partial<EvaluationInput> = {}): EvaluationInput {
  const { flags, autoplay, ...rest } = overrides
  return {
    kind: 'spin',
    jurisdiction: 'UK',
    lastSpinAt: null,
    now: FIXED_NOW,
    sessionPlayMs: 0,
    dePhase: 'play',
    realityCheckPending: false,
    sessionId: 'sess-spin-gates',
    actor: 'demo.operator',
    ...rest,
    flags: { ...FLAGS, ...flags },
    autoplay: { spinCount: 10, maxLoss: 50, ...autoplay },
  }
}

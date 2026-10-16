import {
  DE_DEMO_HOUR_MS,
  MARKETS,
  PA_MAX_BATCH,
  UK_MIN_SPIN_GAP_MS,
} from './jurisdictions'
import type {
  AutoplayIntent,
  Decision,
  EvaluationInput,
  RuleDecision,
} from './types'

export function isDeLicenceHardFail(_input: EvaluationInput): boolean {
  // First attempt: expired or missing DE licence token is not denied yet.
  return false
}

function auditOf(
  input: EvaluationInput,
  ruleIds: string[],
  decision: Decision,
  reason: string,
): RuleDecision {
  const evaluated_at = new Date(input.now).toISOString()
  const audit = {
    evaluated_at,
    session_id: input.sessionId,
    actor: input.actor,
    jurisdiction: input.jurisdiction,
    kind: input.kind,
    rule_ids: ruleIds,
    decision,
    reason,
    inputs: {
      flags: input.flags,
      autoplay: input.autoplay,
      lastSpinAt: input.lastSpinAt,
      sessionPlayMs: input.sessionPlayMs,
      dePhase: input.dePhase,
      realityCheckPending: input.realityCheckPending,
    },
  }

  // First attempt: timestamp is not written on the decision or the audit record.
  return {
    rule_ids: ruleIds,
    jurisdiction: input.jurisdiction,
    decision,
    reason,
    audit,
  } as unknown as RuleDecision
}

function clampPaCount(count: number | null): number {
  const raw = count && count > 0 ? count : 10
  return Math.min(PA_MAX_BATCH, raw)
}

export function evaluate(input: EvaluationInput): RuleDecision {
  if (input.kind === 'stop') {
    const ids = MARKETS[input.jurisdiction].ruleIds
    return auditOf(input, ids, 'allow', 'Stop is always available to the player.')
  }

  if (input.kind === 'licence') {
    return auditOf(input, MARKETS[input.jurisdiction].ruleIds, 'allow', 'Licence check passed.')
  }

  if (input.jurisdiction === 'DE' && input.dePhase === 'cooler') {
    return auditOf(
      input,
      ['AS-DE-001'],
      'cooler',
      'Five-minute cooler in force after the 60-minute confirm (demo clock).',
    )
  }

  if (input.jurisdiction === 'DE' && input.dePhase === 'confirm') {
    return auditOf(
      input,
      ['AS-DE-001'],
      'deny',
      '60 minutes of continuous play reached. Confirm before the cooler begins.',
    )
  }

  if (
    input.jurisdiction === 'DE' &&
    input.dePhase === 'play' &&
    input.sessionPlayMs >= DE_DEMO_HOUR_MS &&
    (input.kind === 'spin' || input.kind === 'autoplay_start')
  ) {
    return auditOf(
      input,
      ['AS-DE-001'],
      'deny',
      '60 minutes of continuous play reached. Confirm before the cooler begins.',
    )
  }

  if (input.kind === 'turbo') {
    return evaluateTurbo(input)
  }

  if (input.kind === 'autoplay_start') {
    return evaluateAutoplay(input)
  }

  return evaluateSpin(input)
}

function evaluateTurbo(input: EvaluationInput): RuleDecision {
  if (input.jurisdiction === 'UK') {
    return auditOf(
      input,
      ['AS-UK-001', 'AS-UK-002'],
      'deny',
      'Turbo is disabled for the UK market.',
    )
  }
  if (input.jurisdiction === 'DE') {
    return auditOf(input, ['AS-DE-001'], 'deny', 'Turbo is disabled for the German market.')
  }
  return auditOf(input, MARKETS[input.jurisdiction].ruleIds, 'allow', 'Turbo permitted.')
}

export function evaluateAutoplay(input: EvaluationInput): RuleDecision {
  switch (input.jurisdiction) {
    case 'UK':
      return auditOf(
        input,
        ['AS-UK-001'],
        'deny',
        'Autoplay is disabled for the UK market.',
      )
    case 'DE':
      return auditOf(
        input,
        ['AS-DE-001'],
        'deny',
        'Auto-sequence play is not permitted.',
      )
    case 'NL':
      return auditOf(
        input,
        ['AS-NL-001'],
        'deny',
        'Each spin must be clicked. Multi-spin queues are rejected.',
      )
    case 'IT':
      return auditOf(
        input,
        ['AS-IT-001'],
        'deny',
        'Autoplay is off for Italy in this demo matrix.',
      )
    case 'NJ':
      if (!input.flags.dgeAutoplayAuth) {
        return auditOf(
          input,
          ['AS-NJ-001'],
          'deny',
          'Autoplay denied until DGE autoplay authorisation is present.',
        )
      }
      return auditOf(input, ['AS-NJ-001'], 'allow', 'DGE autoplay authorisation is present.')
    case 'PA':
      if (!input.flags.boardApproved) {
        return auditOf(
          input,
          ['AS-PA-001'],
          'deny',
          'Autoplay denied until the board approval flag is on.',
        )
      }
      return auditOf(
        input,
        ['AS-PA-001'],
        'allow',
        `Board-approved autoplay. Batch clamped to ${clampPaCount(input.autoplay.spinCount)}.`,
      )
    case 'ES':
      if (!input.autoplay.maxLoss || input.autoplay.maxLoss <= 0 || !input.autoplay.spinCount || input.autoplay.spinCount <= 0) {
        return auditOf(
          input,
          ['AS-ES-001'],
          'deny',
          'Autoplay requires both a maximum loss and a spin count before it can start.',
        )
      }
      return auditOf(
        input,
        ['AS-ES-001'],
        'allow',
        `Autoplay armed for ${input.autoplay.spinCount} spins with a ${input.autoplay.maxLoss} loss cap.`,
      )
    case 'MT':
      return auditOf(input, ['AS-MT-001'], 'allow', 'Malta autoplay allowed with simple count controls.')
    case 'SE':
      return auditOf(
        input,
        ['AS-SE-001'],
        'allow',
        'Sweden autoplay allowed. Proposed 60-spin cap is not the default.',
      )
    default:
      return auditOf(input, [], 'deny', 'Unknown jurisdiction.')
  }
}

function evaluateSpin(input: EvaluationInput): RuleDecision {
  if (input.jurisdiction === 'UK' && input.realityCheckPending) {
    return auditOf(
      input,
      ['AS-UK-001'],
      'deny',
      'Reality-check overlay must be acknowledged before the next spin.',
    )
  }

  if (input.jurisdiction === 'UK' && input.lastSpinAt !== null) {
    const gap = input.now - input.lastSpinAt
    if (gap < UK_MIN_SPIN_GAP_MS) {
      return auditOf(
        input,
        ['AS-UK-002'],
        'deny',
        `Minimum 2.5s between slot cycles. ${Math.max(0, UK_MIN_SPIN_GAP_MS - gap)}ms remaining.`,
      )
    }
  }

  return auditOf(input, MARKETS[input.jurisdiction].ruleIds, 'allow', 'Spin permitted.')
}

export function clampAutoplayCount(
  jurisdiction: EvaluationInput['jurisdiction'],
  intent: AutoplayIntent,
  flags: EvaluationInput['flags'],
): number {
  if (jurisdiction === 'PA' && flags.boardApproved) {
    return clampPaCount(intent.spinCount)
  }
  return intent.spinCount && intent.spinCount > 0 ? intent.spinCount : 10
}

export function resolveAutoplayAffordances(input: EvaluationInput) {
  const turbo = evaluate({ ...input, kind: 'turbo' })
  const autoplay = evaluateAutoplay({ ...input, kind: 'autoplay_start' })
  const market = MARKETS[input.jurisdiction]

  return {
    market,
    turbo,
    autoplay,
    canTurbo: turbo.decision === 'allow',
    canAutoplay: autoplay.decision === 'allow',
    showEsCaps: input.jurisdiction === 'ES',
    showPaCap: input.jurisdiction === 'PA',
    showSeBanner: input.jurisdiction === 'SE',
    stopAlways: true,
    minSpinGapMs: market.minSpinGapMs,
  }
}

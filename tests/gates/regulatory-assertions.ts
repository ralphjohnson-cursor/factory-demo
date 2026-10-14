import type { Decision, EvaluationInput, Jurisdiction } from '../../src/engine/types'
import { baseInput } from '../helpers/input'

export interface RegulatoryAssertion {
  input: EvaluationInput
  decision: Decision
  jurisdiction: Jurisdiction
  via?: 'evaluate' | 'autoplay'
}

/** Catalogue of engine assertions. G2 runs every entry. G3 requires cited rule IDs to appear here. */
export const G2_ASSERTIONS: Record<string, RegulatoryAssertion> = {
  'AS-UK-001': {
    input: baseInput({ jurisdiction: 'UK', kind: 'autoplay_start' }),
    decision: 'deny',
    jurisdiction: 'UK',
    via: 'autoplay',
  },
  'AS-UK-002': {
    input: baseInput({ jurisdiction: 'UK', lastSpinAt: Date.parse('2026-09-23T15:59:58.000Z') }),
    decision: 'deny',
    jurisdiction: 'UK',
  },
  'AS-DE-001': {
    input: baseInput({ jurisdiction: 'DE', kind: 'autoplay_start' }),
    decision: 'deny',
    jurisdiction: 'DE',
    via: 'autoplay',
  },
  'AS-DE-002': {
    input: baseInput({
      jurisdiction: 'DE',
      kind: 'licence',
      flags: { deLicenceExpired: true, dgeAutoplayAuth: false, boardApproved: false },
    }),
    decision: 'deny',
    jurisdiction: 'DE',
  },
  'AS-ES-001': {
    input: baseInput({
      jurisdiction: 'ES',
      kind: 'autoplay_start',
      autoplay: { spinCount: 12, maxLoss: 25 },
    }),
    decision: 'allow',
    jurisdiction: 'ES',
    via: 'autoplay',
  },
  'AS-NL-001': {
    input: baseInput({ jurisdiction: 'NL', kind: 'autoplay_start' }),
    decision: 'deny',
    jurisdiction: 'NL',
    via: 'autoplay',
  },
  'AS-NJ-001': {
    input: baseInput({ jurisdiction: 'NJ', kind: 'autoplay_start' }),
    decision: 'deny',
    jurisdiction: 'NJ',
    via: 'autoplay',
  },
  'AS-PA-001': {
    input: baseInput({
      jurisdiction: 'PA',
      kind: 'autoplay_start',
      flags: { deLicenceExpired: false, dgeAutoplayAuth: false, boardApproved: true },
    }),
    decision: 'allow',
    jurisdiction: 'PA',
    via: 'autoplay',
  },
  'AS-MT-001': {
    input: baseInput({ jurisdiction: 'MT', kind: 'autoplay_start' }),
    decision: 'allow',
    jurisdiction: 'MT',
    via: 'autoplay',
  },
  'AS-SE-001': {
    input: baseInput({ jurisdiction: 'SE', kind: 'autoplay_start' }),
    decision: 'allow',
    jurisdiction: 'SE',
    via: 'autoplay',
  },
  'AS-IT-001': {
    input: baseInput({ jurisdiction: 'IT', kind: 'autoplay_start' }),
    decision: 'deny',
    jurisdiction: 'IT',
    via: 'autoplay',
  },
}

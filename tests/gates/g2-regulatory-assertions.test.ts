import { describe, expect, it } from 'vitest'
import { evaluate, evaluateAutoplay } from '../../src/engine/rules'
import { loadRulesApplied } from '../helpers/rules-applied'
import { G2_ASSERTIONS, type RegulatoryAssertion } from './regulatory-assertions'
import { baseInput } from '../helpers/input'

const applied = loadRulesApplied()

function decide(spec: RegulatoryAssertion) {
  return spec.via === 'autoplay' ? evaluateAutoplay(spec.input) : evaluate(spec.input)
}

describe('G2 regulatory-assertions — rule IDs cited for the ticket', () => {
  it('has an assertion case for every rule ID in the rules-applied file', () => {
    const missing = applied.rules.map((rule) => rule.rule_id).filter((id) => !G2_ASSERTIONS[id])
    expect(missing, `rules-applied ids missing G2 cases: ${missing.join(', ')}`).toEqual([])
  })

  it.each(applied.rules)(
    '$rule_id matches the rule cited for the ticket',
    (rule) => {
      const spec = G2_ASSERTIONS[rule.rule_id]
      expect(spec, `G2 missing assertion for ${rule.rule_id}`).toBeTruthy()
      const decision = decide(spec)
      expect(decision.decision, `${rule.rule_id} decision`).toBe(spec.decision)
      expect(decision.rule_ids, `${rule.rule_id} rule_ids`).toContain(rule.rule_id)
      expect(decision.jurisdiction).toBe(rule.jurisdiction)
    },
  )

  it.each(Object.entries(G2_ASSERTIONS))('%s holds for the engine', (ruleId, spec) => {
    const decision = decide(spec)
    expect(decision.decision, `${ruleId} decision`).toBe(spec.decision)
    expect(decision.rule_ids, `${ruleId} rule_ids`).toContain(ruleId)
    expect(decision.jurisdiction).toBe(spec.jurisdiction)
  })

  it('AS-DE-002 expired DE licence hard-fails closed', () => {
    const expired = evaluate(
      baseInput({
        jurisdiction: 'DE',
        kind: 'spin',
        flags: { deLicenceExpired: true, dgeAutoplayAuth: false, boardApproved: false },
      }),
    )
    expect(expired.decision, 'AS-DE-002 expired licence must deny').toBe('deny')
    expect(expired.rule_ids, 'AS-DE-002').toContain('AS-DE-002')
    expect(expired.jurisdiction).toBe('DE')
  })

  it('AS-DE-002 missing DE licence token hard-fails closed via evaluateAutoplay', () => {
    const missing = evaluateAutoplay(
      baseInput({
        jurisdiction: 'DE',
        flags: {
          deLicenceExpired: false,
          dgeAutoplayAuth: false,
          boardApproved: false,
          deLicenceToken: null,
        },
      }),
    )
    expect(missing.decision, 'AS-DE-002 missing licence must deny').toBe('deny')
    expect(missing.rule_ids, 'AS-DE-002').toContain('AS-DE-002')
  })
})

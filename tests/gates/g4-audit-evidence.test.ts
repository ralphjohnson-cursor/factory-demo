import { describe, expect, it } from 'vitest'
import { REQUIRED_AUDIT_FIELDS } from '../../src/engine/audit'
import { evaluate, evaluateAutoplay } from '../../src/engine/rules'
import { baseInput, FIXED_NOW } from '../helpers/input'

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

describe('G4 audit-evidence — rule_ids, jurisdiction, timestamp', () => {
  it('requires the AS-DE-002 deny record to carry audit fields', () => {
    const decision = evaluate(
      baseInput({
        jurisdiction: 'DE',
        kind: 'licence',
        flags: { deLicenceExpired: true, dgeAutoplayAuth: false, boardApproved: false },
      }),
    )

    expect(decision.decision).toBe('deny')
    expect(decision.rule_ids, 'AS-DE-002').toContain('AS-DE-002')
    expect(decision.jurisdiction).toBe('DE')
    expect(decision.timestamp, 'AS-DE-002 timestamp').toMatch(ISO)
    expect(decision.timestamp).toBe(new Date(FIXED_NOW).toISOString())

    for (const field of REQUIRED_AUDIT_FIELDS) {
      expect(decision[field], `decision.${field} for AS-DE-002`).toBeTruthy()
      expect(decision.audit[field], `audit.${field} for AS-DE-002`).toBeTruthy()
    }

    expect(decision.audit.rule_ids).toContain('AS-DE-002')
    expect(decision.audit.jurisdiction).toBe('DE')
    expect(decision.audit.timestamp).toBe(decision.timestamp)
  })

  it('evaluateAutoplay expired DE licence also writes the same audit fields', () => {
    const decision = evaluateAutoplay(
      baseInput({
        jurisdiction: 'DE',
        flags: { deLicenceExpired: true, dgeAutoplayAuth: false, boardApproved: false },
      }),
    )
    expect(decision.rule_ids, 'AS-DE-002').toContain('AS-DE-002')
    expect(decision.jurisdiction).toBe('DE')
    expect(decision.timestamp).toMatch(ISO)
    expect(decision.audit.timestamp).toBe(decision.timestamp)
  })

  it('every baseline decision exposes rule_ids, jurisdiction, and timestamp', () => {
    const samples = [
      evaluate(baseInput({ jurisdiction: 'UK' })),
      evaluateAutoplay(baseInput({ jurisdiction: 'MT' })),
      evaluate(baseInput({ jurisdiction: 'UK', kind: 'stop' })),
    ]
    for (const decision of samples) {
      expect(Array.isArray(decision.rule_ids)).toBe(true)
      expect(decision.jurisdiction).toBeTruthy()
      expect(decision.timestamp).toMatch(ISO)
      expect(decision.audit.timestamp).toBe(decision.timestamp)
    }
  })
})

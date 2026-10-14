import { describe, expect, it } from 'vitest'
import { clampAutoplayCount, evaluate, evaluateAutoplay } from '../../src/engine/rules'
import { resolveSpin } from '../../src/engine/spin'
import { PA_MAX_BATCH, UK_MIN_SPIN_GAP_MS } from '../../src/engine/jurisdictions'
import { baseInput, FIXED_NOW } from '../helpers/input'

describe('G1 contract — baseline Reel Factory behaviour', () => {
  it('keeps UK autoplay and turbo denied', () => {
    const autoplay = evaluateAutoplay(baseInput({ jurisdiction: 'UK' }))
    const turbo = evaluate(baseInput({ jurisdiction: 'UK', kind: 'turbo' }))
    expect(autoplay.decision).toBe('deny')
    expect(autoplay.rule_ids).toContain('AS-UK-001')
    expect(turbo.decision).toBe('deny')
  })

  it('blocks a UK spin until the 2.5s gap has elapsed', () => {
    const blocked = evaluate(
      baseInput({
        jurisdiction: 'UK',
        lastSpinAt: FIXED_NOW - (UK_MIN_SPIN_GAP_MS - 200),
      }),
    )
    const allowed = evaluate(
      baseInput({
        jurisdiction: 'UK',
        lastSpinAt: FIXED_NOW - UK_MIN_SPIN_GAP_MS,
      }),
    )
    expect(blocked.decision).toBe('deny')
    expect(blocked.rule_ids).toContain('AS-UK-002')
    expect(allowed.decision).toBe('allow')
  })

  it('blocks the next UK spin while a reality check is pending', () => {
    const decision = evaluate(baseInput({ jurisdiction: 'UK', realityCheckPending: true }))
    expect(decision.decision).toBe('deny')
    expect(decision.rule_ids).toContain('AS-UK-001')
  })

  it('denies DE auto-sequence while a valid licence is present', () => {
    const decision = evaluateAutoplay(baseInput({ jurisdiction: 'DE' }))
    expect(decision.decision).toBe('deny')
    expect(decision.rule_ids).toContain('AS-DE-001')
  })

  it('forces a DE cooler decision after the confirm phase', () => {
    const decision = evaluate(baseInput({ jurisdiction: 'DE', kind: 'spin', dePhase: 'cooler' }))
    expect(decision.decision).toBe('cooler')
    expect(decision.rule_ids).toContain('AS-DE-001')
  })

  it('requires ES max loss and spin count before autoplay', () => {
    const missing = evaluateAutoplay(
      baseInput({ jurisdiction: 'ES', autoplay: { spinCount: null, maxLoss: null } }),
    )
    const armed = evaluateAutoplay(
      baseInput({ jurisdiction: 'ES', autoplay: { spinCount: 20, maxLoss: 40 } }),
    )
    expect(missing.decision).toBe('deny')
    expect(armed.decision).toBe('allow')
    expect(armed.rule_ids).toContain('AS-ES-001')
  })

  it('rejects NL multi-spin queues', () => {
    const decision = evaluateAutoplay(baseInput({ jurisdiction: 'NL' }))
    expect(decision.decision).toBe('deny')
    expect(decision.rule_ids).toContain('AS-NL-001')
  })

  it('gates NJ autoplay on DGE authorisation', () => {
    const denied = evaluateAutoplay(baseInput({ jurisdiction: 'NJ' }))
    const allowed = evaluateAutoplay(
      baseInput({ jurisdiction: 'NJ', flags: { deLicenceExpired: false, dgeAutoplayAuth: true, boardApproved: false } }),
    )
    expect(denied.decision).toBe('deny')
    expect(allowed.decision).toBe('allow')
  })

  it('clamps PA autoplay to 50 when board approved', () => {
    const flags = { deLicenceExpired: false, dgeAutoplayAuth: false, boardApproved: true }
    const decision = evaluateAutoplay(
      baseInput({ jurisdiction: 'PA', flags, autoplay: { spinCount: 200, maxLoss: 10 } }),
    )
    expect(decision.decision).toBe('allow')
    expect(clampAutoplayCount('PA', { spinCount: 200, maxLoss: 10 }, flags)).toBe(PA_MAX_BATCH)
  })

  it('allows MT and SE autoplay and keeps IT off', () => {
    expect(evaluateAutoplay(baseInput({ jurisdiction: 'MT' })).decision).toBe('allow')
    expect(evaluateAutoplay(baseInput({ jurisdiction: 'SE' })).decision).toBe('allow')
    expect(evaluateAutoplay(baseInput({ jurisdiction: 'IT' })).decision).toBe('deny')
  })

  it('keeps Stop available when the table is not licence-closed', () => {
    const decision = evaluate(baseInput({ jurisdiction: 'UK', kind: 'stop' }))
    expect(decision.decision).toBe('allow')
  })

  it('still resolves a 5x3 spin grid for the playable surface', () => {
    const result = resolveSpin(1, () => 0.1)
    expect(result.grid).toHaveLength(5)
    expect(result.grid.every((col) => col.length === 3)).toBe(true)
  })
})

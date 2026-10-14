import { readFileSync } from 'node:fs'
import { describe, expect, it, type TestContext } from 'vitest'
import { MARKETS } from '../../src/engine/jurisdictions'
import { G2_ASSERTIONS } from './regulatory-assertions'
import { loadRulesApplied, parseRulesApplied, type AppliedRule } from '../helpers/rules-applied'

const applied = loadRulesApplied()

const validRule: AppliedRule = {
  rule_id: 'AS-DE-002',
  jurisdiction: 'DE',
  source_url: 'https://github.com/ralphjohnson-cursor/factory-demo-docs/tree/main/rules',
}

function pullRequestBody(context: TestContext): string | undefined {
  const eventName = process.env.GITHUB_EVENT_NAME
  if (eventName !== 'pull_request') {
    const where = eventName
      ? `GitHub Actions ${eventName} event`
      : 'local run (GITHUB_EVENT_NAME is unset)'
    const message = `G3 skipped the pull-request body check on ${where}. That check runs only for pull_request and reads the body from GITHUB_EVENT_PATH.`
    process.stdout.write(`${message}\n`)
    context.skip(message)
  }

  const eventPath = process.env.GITHUB_EVENT_PATH
  if (!eventPath) {
    throw new Error('G3: pull_request is missing GITHUB_EVENT_PATH, so the pull request body cannot be read.')
  }

  let payload: unknown
  try {
    payload = JSON.parse(readFileSync(eventPath, 'utf8'))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`G3: could not read the pull_request payload at ${eventPath}: ${message}`)
  }

  const body = (payload as { pull_request?: { body?: unknown } }).pull_request?.body
  if (typeof body !== 'string' || body.trim() === '') {
    throw new Error(
      'G3: the pull_request payload has no body. Cite every rule ID from .spin/rules-applied.json in the pull request description.',
    )
  }
  return body
}

describe('G3 policy-code-consistency — rule IDs cited for the ticket', () => {
  it('finds every cited rule ID on MARKETS for that jurisdiction', () => {
    for (const rule of applied.rules) {
      const market = MARKETS[rule.jurisdiction]
      expect(market, rule.rule_id).toBeTruthy()
      expect(market.ruleIds, rule.rule_id).toContain(rule.rule_id)
    }
  })

  it('finds a G2 assertion for every cited rule ID', () => {
    for (const rule of applied.rules) {
      expect(G2_ASSERTIONS[rule.rule_id], `${rule.rule_id} needs a G2 assertion`).toBeTruthy()
    }
  })

  it('cites every rules-applied rule ID in the pull request body on pull_request', (context) => {
    const body = pullRequestBody(context)
    if (body === undefined) return

    for (const rule of applied.rules) {
      expect(body.includes(rule.rule_id), `pull request body must cite ${rule.rule_id}`).toBe(true)
    }
  })
})

describe('rules-applied file', () => {
  it('rejects a malformed document and names the field', () => {
    expect(() => parseRulesApplied({ ticket: 'FAC-1' })).toThrow(/rules/)
    expect(() => parseRulesApplied({ ticket: 'not-a-key', rules: [validRule] })).toThrow(/ticket/)
    expect(() =>
      parseRulesApplied({
        ticket: 'FAC-1',
        rules: [{ ...validRule, rule_id: 'DE-2' }],
      }),
    ).toThrow(/rule_id/)
    expect(() =>
      parseRulesApplied({
        ticket: 'FAC-1',
        rules: [{ ...validRule, jurisdiction: 'XX' }],
      }),
    ).toThrow(/jurisdiction/)
    expect(() =>
      parseRulesApplied({
        ticket: 'FAC-1',
        rules: [{ ...validRule, source_url: 'http://example.com/wiki' }],
      }),
    ).toThrow(/source_url/)
    expect(() =>
      parseRulesApplied({
        ticket: 'FAC-1',
        rules: [validRule, validRule],
      }),
    ).toThrow(/duplicates AS-DE-002/)
    expect(() =>
      parseRulesApplied({
        ticket: 'FAC-1',
        rules: [validRule],
        extra: true,
      }),
    ).toThrow(/extra/)
  })
})

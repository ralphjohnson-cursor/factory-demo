import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JURISDICTIONS, type Jurisdiction } from '../../src/engine/types'

const RULE_ID = /^AS-[A-Z]{2}-\d{3}$/
const TICKET_KEY = /^[A-Z][A-Z0-9]+-\d+$/
const FACCTX_HOST = 'github.com'
const FACCTX_PREFIX = '/ralphjohnson-cursor/factory-demo-docs/'

export interface AppliedRule {
  rule_id: string
  jurisdiction: Jurisdiction
  source_url: string
}

export interface RulesApplied {
  ticket: string
  rules: AppliedRule[]
}

function fail(source: string, path: string, message: string): never {
  throw new Error(`${source}: ${path} ${message}`)
}

function isJurisdiction(value: string): value is Jurisdiction {
  return (JURISDICTIONS as readonly string[]).includes(value)
}

function isFacctxPageUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      url.hostname === FACCTX_HOST &&
      url.pathname.startsWith(FACCTX_PREFIX)
    )
  } catch {
    return false
  }
}

/** Validate the ticket-to-CI bridge. Same shape as `.spin/rules-applied.schema.json`. */
export function parseRulesApplied(value: unknown, source = '.spin/rules-applied.json'): RulesApplied {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(source, '$', 'must be a JSON object with ticket and rules')
  }

  const record = value as Record<string, unknown>
  for (const key of Object.keys(record)) {
    if (key !== 'ticket' && key !== 'rules') {
      fail(source, key, 'is not allowed')
    }
  }

  if (typeof record.ticket !== 'string' || !TICKET_KEY.test(record.ticket)) {
    fail(source, 'ticket', 'must be a ticket key like FAC-1')
  }

  if (!Array.isArray(record.rules) || record.rules.length === 0) {
    fail(source, 'rules', 'must be a non-empty array of rule entries')
  }

  const seen = new Set<string>()
  const rules = record.rules.map((entry, index) => {
    const path = `rules[${index}]`
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      fail(source, path, 'must be an object with rule_id, jurisdiction, and source_url')
    }

    const rule = entry as Record<string, unknown>
    for (const key of Object.keys(rule)) {
      if (key !== 'rule_id' && key !== 'jurisdiction' && key !== 'source_url') {
        fail(source, `${path}.${key}`, 'is not allowed')
      }
    }

    if (typeof rule.rule_id !== 'string' || !RULE_ID.test(rule.rule_id)) {
      fail(source, `${path}.rule_id`, 'must match AS-XX-NNN')
    }

    if (seen.has(rule.rule_id)) {
      fail(source, `${path}.rule_id`, `duplicates ${rule.rule_id}`)
    }
    seen.add(rule.rule_id)

    if (typeof rule.jurisdiction !== 'string' || !isJurisdiction(rule.jurisdiction)) {
      fail(source, `${path}.jurisdiction`, `must be one of ${JURISDICTIONS.join(', ')}`)
    }

    const expectedPrefix = `AS-${rule.jurisdiction}-`
    if (!rule.rule_id.startsWith(expectedPrefix)) {
      fail(source, `${path}.rule_id`, `must start with ${expectedPrefix} for jurisdiction ${rule.jurisdiction}`)
    }

    if (typeof rule.source_url !== 'string' || !isFacctxPageUrl(rule.source_url)) {
      fail(
        source,
        `${path}.source_url`,
        `must be an https URL on ${FACCTX_HOST} under ${FACCTX_PREFIX}`,
      )
    }

    return {
      rule_id: rule.rule_id,
      jurisdiction: rule.jurisdiction,
      source_url: rule.source_url,
    }
  })

  return { ticket: record.ticket, rules }
}

export function rulesAppliedPath(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), '../../.spin/rules-applied.json')
}

export function loadRulesApplied(path = rulesAppliedPath()): RulesApplied {
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Cannot read rules-applied file at ${path}: ${message}`)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${path} is not valid JSON: ${message}`)
  }

  return parseRulesApplied(parsed, path)
}

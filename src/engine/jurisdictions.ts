import type { Jurisdiction, MarketProfile } from './types'

export const MARKETS: Record<Jurisdiction, MarketProfile> = {
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    regulator: 'UKGC',
    currency: 'GBP',
    autoplayDefault: 'off',
    turboAllowed: false,
    minSpinGapMs: 2500,
    notes: 'Autoplay and turbo off. Minimum 2.5s between cycles. Reality check blocks the next spin until acknowledged.',
    ruleIds: ['AS-UK-001', 'AS-UK-002'],
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    regulator: 'GlüStV',
    currency: 'EUR',
    autoplayDefault: 'off',
    turboAllowed: false,
    minSpinGapMs: 0,
    notes: 'No auto-sequence. After 60 minutes of continuous play, confirm then a 5-minute cooler. Missing licence token hard-fails closed.',
    ruleIds: ['AS-DE-001', 'AS-DE-002'],
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    regulator: 'DGOJ',
    currency: 'EUR',
    autoplayDefault: 'gated',
    turboAllowed: true,
    minSpinGapMs: 0,
    notes: 'Autoplay only after max loss and spin count are both set. Remaining counts stay visible. Stop is always available.',
    ruleIds: ['AS-ES-001'],
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    regulator: 'KSA',
    currency: 'EUR',
    autoplayDefault: 'off',
    turboAllowed: true,
    minSpinGapMs: 0,
    notes: 'Every spin needs a click. Multi-spin queues are rejected.',
    ruleIds: ['AS-NL-001'],
  },
  NJ: {
    code: 'NJ',
    name: 'New Jersey',
    regulator: 'DGE',
    currency: 'USD',
    autoplayDefault: 'gated',
    turboAllowed: true,
    minSpinGapMs: 0,
    notes: 'Autoplay denied unless DGE autoplay authorisation is on.',
    ruleIds: ['AS-NJ-001'],
  },
  PA: {
    code: 'PA',
    name: 'Pennsylvania',
    regulator: 'PGCB',
    currency: 'USD',
    autoplayDefault: 'gated',
    turboAllowed: true,
    minSpinGapMs: 0,
    notes: 'If the board has approved autoplay, batches clamp at 50. Stop is always available.',
    ruleIds: ['AS-PA-001'],
  },
  MT: {
    code: 'MT',
    name: 'Malta',
    regulator: 'MGA',
    currency: 'EUR',
    autoplayDefault: 'on',
    turboAllowed: true,
    minSpinGapMs: 0,
    notes: 'Autoplay allowed with simpler count controls and a persistent Stop.',
    ruleIds: ['AS-MT-001'],
  },
  SE: {
    code: 'SE',
    name: 'Sweden',
    regulator: 'Spelinspektionen',
    currency: 'SEK',
    autoplayDefault: 'on',
    turboAllowed: true,
    minSpinGapMs: 0,
    notes: 'Autoplay allowed. A proposed 60-spin cap is not in force and is shown as a non-default notice only.',
    ruleIds: ['AS-SE-001'],
  },
  IT: {
    code: 'IT',
    name: 'Italy',
    regulator: 'ADM',
    currency: 'EUR',
    autoplayDefault: 'off',
    turboAllowed: true,
    minSpinGapMs: 0,
    notes: 'Autoplay remains off for this market in the demo matrix.',
    ruleIds: ['AS-IT-001'],
  },
}

export const PA_MAX_BATCH = 50

export const UK_MIN_SPIN_GAP_MS = 2500

export const DE_DEMO_HOUR_MS = 30_000
export const DE_DEMO_COOLER_MS = 8_000
export const DE_REAL_HOUR_MINUTES = 60
export const DE_REAL_COOLER_MINUTES = 5

export const UK_REALITY_CHECK_EVERY = 6

export const DEMO_STARTING_BALANCE = 2500

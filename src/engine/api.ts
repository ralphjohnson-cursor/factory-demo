import {
  clampAutoplayCount,
  evaluate,
  evaluateAutoplay,
  resolveAutoplayAffordances,
} from './rules'
import type { EvaluationInput, RuleDecision } from './types'

/** In-app evaluation surface. Later this pairs with factory-demo-docs as a local API. */
export const spinApi = {
  evaluate(input: EvaluationInput): RuleDecision {
    return evaluate(input)
  },
  evaluateAutoplay(input: EvaluationInput): RuleDecision {
    return evaluateAutoplay({ ...input, kind: 'autoplay_start' })
  },
  affordances(input: EvaluationInput) {
    return resolveAutoplayAffordances(input)
  },
  clampCount: clampAutoplayCount,
}

export { evaluate, evaluateAutoplay }
export type { EvaluationInput, RuleDecision }

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { spinApi } from '@/engine/api'
import {
  DE_DEMO_COOLER_MS,
  DE_DEMO_HOUR_MS,
  DEMO_STARTING_BALANCE,
  MARKETS,
  UK_MIN_SPIN_GAP_MS,
  UK_REALITY_CHECK_EVERY,
} from '@/engine/jurisdictions'
import { randomStrip, resolveSpin } from '@/engine/spin'
import type {
  AutoplayIntent,
  EvaluationInput,
  EvaluationKind,
  Jurisdiction,
  OperatorFlags,
  RuleDecision,
  SpinResult,
  SymbolId,
} from '@/engine/types'
import { createSessionId, prefersReducedMotion } from '@/lib/utils'

const ACTOR = 'demo.operator'
const STAKE_OPTIONS = [0.2, 0.5, 1, 2, 5]

export type DePhase = 'play' | 'confirm' | 'cooler'
export type OverlayKind = 'none' | 'reality' | 'confirm' | 'cooler' | 'closed'

export interface ReelView {
  strip: SymbolId[]
  offset: number
  blurred: boolean
  winningIndexes: number[]
}

function idleReels(grid: SymbolId[][]): ReelView[] {
  return grid.map((column) => ({
    strip: column,
    offset: 0,
    blurred: false,
    winningIndexes: [],
  }))
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function easeSpin(t: number) {
  if (t < 0.1) {
    return -0.045 * Math.sin((t / 0.1) * Math.PI)
  }
  const u = (t - 0.1) / 0.9
  return 1 - (1 - u) ** 3.15
}

async function animateReel(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number, blurred: boolean) => void,
  signal: { cancelled: boolean },
) {
  if (prefersReducedMotion() || duration < 40) {
    onUpdate(to, false)
    return
  }
  const start = performance.now()
  await new Promise<void>((resolve) => {
    const frame = (now: number) => {
      if (signal.cancelled) {
        onUpdate(to, false)
        resolve()
        return
      }
      const t = Math.min(1, (now - start) / duration)
      const p = easeSpin(t)
      onUpdate(from + (to - from) * p, t > 0.12 && t < 0.72)
      if (t < 1) requestAnimationFrame(frame)
      else resolve()
    }
    requestAnimationFrame(frame)
  })
}

export function useGame() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('UK')
  const [flags, setFlags] = useState<OperatorFlags>({
    deLicenceExpired: false,
    dgeAutoplayAuth: false,
    boardApproved: false,
  })
  const [balance, setBalance] = useState(DEMO_STARTING_BALANCE)
  const [net, setNet] = useState(0)
  const [stake, setStake] = useState(1)
  const [turbo, setTurbo] = useState(false)
  const [sessionId] = useState(() => createSessionId())
  const [startedAt] = useState(() => Date.now())
  const [nowTick, setNowTick] = useState(() => Date.now())
  const [lastSpinAt, setLastSpinAt] = useState<number | null>(null)
  const [spinCount, setSpinCount] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [autoplayOn, setAutoplayOn] = useState(false)
  const [remainingSpins, setRemainingSpins] = useState(0)
  const [remainingLoss, setRemainingLoss] = useState<number | null>(null)
  const [intent, setIntent] = useState<AutoplayIntent>({ spinCount: 10, maxLoss: 50 })
  const [dePhase, setDePhase] = useState<DePhase>('play')
  const [dePlayMs, setDePlayMs] = useState(0)
  const [coolerEndsAt, setCoolerEndsAt] = useState<number | null>(null)
  const [realityCheckPending, setRealityCheckPending] = useState(false)
  const [overlay, setOverlay] = useState<OverlayKind>('none')
  const [decisions, setDecisions] = useState<RuleDecision[]>([])
  const [lastWin, setLastWin] = useState<SpinResult | null>(null)
  const [reels, setReels] = useState<ReelView[]>(() =>
    idleReels([
      ['crown', 'emerald', 'ace'],
      ['vault', 'coin', 'king'],
      ['horseshoe', 'crown', 'queen'],
      ['emerald', 'ace', 'coin'],
      ['king', 'vault', 'horseshoe'],
    ]),
  )
  const [ukGapLeft, setUkGapLeft] = useState(0)

  const stopRef = useRef(false)
  const autoplayRef = useRef(false)
  const spinningRef = useRef(false)
  const animSignal = useRef({ cancelled: false })
  const dePhaseRef = useRef<DePhase>('play')
  const playClockRef = useRef(0)
  const playAnchorRef = useRef<number | null>(null)

  useEffect(() => {
    dePhaseRef.current = dePhase
  }, [dePhase])

  const buildInput = useCallback(
    (kind: EvaluationKind): EvaluationInput => ({
      kind,
      jurisdiction,
      flags,
      autoplay: intent,
      lastSpinAt,
      now: Date.now(),
      sessionPlayMs: dePlayMs,
      dePhase,
      realityCheckPending,
      sessionId,
      actor: ACTOR,
    }),
    [dePhase, dePlayMs, flags, intent, jurisdiction, lastSpinAt, realityCheckPending, sessionId],
  )

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now()
      setNowTick(t)
      if (jurisdiction === 'UK' && lastSpinAt) {
        setUkGapLeft(Math.max(0, UK_MIN_SPIN_GAP_MS - (t - lastSpinAt)))
      } else {
        setUkGapLeft(0)
      }
      if (jurisdiction === 'DE' && dePhase === 'play' && playAnchorRef.current) {
        const elapsed = playClockRef.current + (t - playAnchorRef.current)
        setDePlayMs(elapsed)
        if (elapsed >= DE_DEMO_HOUR_MS && overlay === 'none' && !spinningRef.current) {
          setDePhase('confirm')
          setOverlay('confirm')
        }
      }
      if (jurisdiction === 'DE' && dePhase === 'cooler' && coolerEndsAt && t >= coolerEndsAt) {
        playClockRef.current = 0
        playAnchorRef.current = t
        setDePlayMs(0)
        setDePhase('play')
        setCoolerEndsAt(null)
        setOverlay('none')
      }
    }, 120)
    return () => window.clearInterval(id)
  }, [coolerEndsAt, dePhase, jurisdiction, lastSpinAt, overlay])

  const pushDecision = useCallback((decision: RuleDecision) => {
    setDecisions((prev) => [decision, ...prev].slice(0, 14))
    return decision
  }, [])

  const affordances = useMemo(
    () => spinApi.affordances(buildInput('autoplay_start')),
    [buildInput],
  )

  useEffect(() => {
    if (!affordances.canTurbo && turbo) setTurbo(false)
  }, [affordances.canTurbo, turbo])

  const applyJurisdiction = useCallback(
    (next: Jurisdiction) => {
      stopRef.current = true
      autoplayRef.current = false
      animSignal.current.cancelled = true
      setAutoplayOn(false)
      setRemainingSpins(0)
      setRemainingLoss(null)
      setJurisdiction(next)
      setDePhase('play')
      setDePlayMs(0)
      playClockRef.current = 0
      playAnchorRef.current = null
      setCoolerEndsAt(null)
      setRealityCheckPending(false)
      setLastWin(null)
      setOverlay(next === 'DE' && flags.deLicenceExpired ? 'closed' : 'none')
    },
    [flags.deLicenceExpired],
  )

  useEffect(() => {
    if (jurisdiction === 'DE' && flags.deLicenceExpired) {
      stopRef.current = true
      autoplayRef.current = false
      setAutoplayOn(false)
      setOverlay('closed')
      return
    }
    if (jurisdiction !== 'DE' && overlay === 'closed') {
      setOverlay('none')
    }
  }, [flags.deLicenceExpired, jurisdiction, overlay])

  const runSpinAnimation = useCallback(
    async (result: SpinResult) => {
      const reduced = prefersReducedMotion()
      const turboOn = turbo && affordances.canTurbo
      const durationBase = reduced ? 0 : turboOn ? 520 : 1480
      animSignal.current = { cancelled: false }

      const views: ReelView[] = result.grid.map((column) => {
        const head = randomStrip(14 + Math.floor(Math.random() * 6))
        return {
          strip: [...head, ...column],
          offset: 0,
          blurred: !reduced,
          winningIndexes: [],
        }
      })
      setReels(views)

      await Promise.all(
        views.map((view, reelIndex) => {
          const to = -((view.strip.length - 3) * 92)
          const delay = reduced ? 0 : reelIndex * (turboOn ? 50 : 140)
          return sleep(delay).then(() =>
            animateReel(
              0,
              to,
              durationBase + reelIndex * (turboOn ? 40 : 90),
              (value, blurred) => {
                setReels((current) =>
                  current.map((reel, i) => (i === reelIndex ? { ...reel, offset: value, blurred } : reel)),
                )
              },
              animSignal.current,
            ),
          )
        }),
      )

      setReels(
        result.grid.map((column, reel) => ({
          strip: column,
          offset: 0,
          blurred: false,
          winningIndexes: result.winningCells.filter((cell) => cell.reel === reel).map((cell) => cell.row),
        })),
      )
    },
    [affordances.canTurbo, turbo],
  )

  const executeSpin = useCallback(async (): Promise<SpinResult | null> => {
    if (spinningRef.current) return null

    if (jurisdiction === 'DE' && flags.deLicenceExpired) {
      pushDecision(spinApi.evaluate(buildInput('spin')))
      setOverlay('closed')
      return null
    }

    if (
      jurisdiction === 'DE' &&
      (dePhaseRef.current === 'confirm' ||
        (dePlayMs >= DE_DEMO_HOUR_MS && dePhaseRef.current === 'play'))
    ) {
      pushDecision(spinApi.evaluate({ ...buildInput('spin'), dePhase: 'confirm' }))
      setDePhase('confirm')
      setOverlay('confirm')
      return null
    }

    if (jurisdiction === 'DE' && dePhaseRef.current === 'cooler') {
      pushDecision(spinApi.evaluate(buildInput('spin')))
      setOverlay('cooler')
      return null
    }

    const decision = spinApi.evaluate(buildInput('spin'))
    pushDecision(decision)
    if (decision.decision !== 'allow') {
      if (jurisdiction === 'UK' && realityCheckPending) setOverlay('reality')
      return null
    }

    spinningRef.current = true
    setSpinning(true)
    if (jurisdiction === 'DE' && !playAnchorRef.current) {
      playAnchorRef.current = Date.now()
    }

    const result = resolveSpin(stake)
    setBalance((current) => current - stake)
    setNet((current) => current - stake)
    await runSpinAnimation(result)
    setBalance((current) => current + result.winAmount)
    setNet((current) => current + result.winAmount)
    setLastWin(result)
    setLastSpinAt(Date.now())
    setSpinCount((count) => {
      const next = count + 1
      if (jurisdiction === 'UK' && next % UK_REALITY_CHECK_EVERY === 0) {
        setRealityCheckPending(true)
        setOverlay('reality')
      }
      return next
    })
    spinningRef.current = false
    setSpinning(false)
    return result
  }, [
    buildInput,
    dePlayMs,
    flags.deLicenceExpired,
    jurisdiction,
    pushDecision,
    realityCheckPending,
    runSpinAnimation,
    stake,
  ])

  const requestSpin = useCallback(async () => {
    if (autoplayRef.current) return
    await executeSpin()
  }, [executeSpin])

  const stopAutoplay = useCallback(() => {
    stopRef.current = true
    autoplayRef.current = false
    setAutoplayOn(false)
    pushDecision(spinApi.evaluate(buildInput('stop')))
  }, [buildInput, pushDecision])

  const startAutoplay = useCallback(async () => {
    const decision = spinApi.evaluate(buildInput('autoplay_start'))
    pushDecision(decision)
    if (decision.decision !== 'allow') return

    const count = spinApi.clampCount(jurisdiction, intent, flags)
    stopRef.current = false
    autoplayRef.current = true
    setAutoplayOn(true)
    setRemainingSpins(count)
    let lossBudget = jurisdiction === 'ES' ? intent.maxLoss ?? 0 : Number.POSITIVE_INFINITY
    setRemainingLoss(jurisdiction === 'ES' ? lossBudget : null)

    let left = count
    while (left > 0 && !stopRef.current && autoplayRef.current) {
      const result = await executeSpin()
      if (!result) break
      left -= 1
      setRemainingSpins(left)
      if (jurisdiction === 'ES') {
        lossBudget -= Math.max(0, stake - result.winAmount)
        setRemainingLoss(Math.max(0, lossBudget))
        if (lossBudget <= 0) break
      }
      if (realityCheckPending) break
      await sleep(turbo && affordances.canTurbo ? 180 : 420)
    }

    autoplayRef.current = false
    setAutoplayOn(false)
    setRemainingSpins(0)
  }, [
    affordances.canTurbo,
    buildInput,
    executeSpin,
    flags,
    intent,
    jurisdiction,
    pushDecision,
    realityCheckPending,
    stake,
    turbo,
  ])

  const acknowledgeReality = useCallback(() => {
    setRealityCheckPending(false)
    setOverlay('none')
  }, [])

  const confirmDeHour = useCallback(() => {
    setDePhase('cooler')
    dePhaseRef.current = 'cooler'
    playAnchorRef.current = null
    setCoolerEndsAt(Date.now() + DE_DEMO_COOLER_MS)
    setOverlay('cooler')
    pushDecision(spinApi.evaluate({ ...buildInput('spin'), dePhase: 'cooler' }))
  }, [buildInput, pushDecision])

  const updateFlag = useCallback((key: keyof OperatorFlags, value: boolean) => {
    setFlags((prev) => ({ ...prev, [key]: value }))
  }, [])

  const elapsedSeconds = Math.floor((nowTick - startedAt) / 1000)
  const deDemoMinutes = Math.min(60, (dePlayMs / DE_DEMO_HOUR_MS) * 60)
  const coolerLeftMs = coolerEndsAt ? Math.max(0, coolerEndsAt - nowTick) : 0

  return {
    actor: ACTOR,
    sessionId,
    jurisdiction,
    setJurisdiction: applyJurisdiction,
    market: MARKETS[jurisdiction],
    flags,
    updateFlag,
    balance,
    net,
    stake,
    setStake,
    stakeOptions: STAKE_OPTIONS,
    turbo,
    setTurbo,
    spinning,
    autoplayOn,
    remainingSpins,
    remainingLoss,
    intent,
    setIntent,
    affordances,
    lastWin,
    reels,
    decisions,
    overlay,
    dePhase,
    deDemoMinutes,
    coolerLeftMs,
    ukGapLeft,
    spinCount,
    elapsedSeconds,
    requestSpin,
    startAutoplay,
    stopAutoplay,
    acknowledgeReality,
    confirmDeHour,
  }
}

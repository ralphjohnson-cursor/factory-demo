import { motion } from 'framer-motion'
import { DE_DEMO_COOLER_MS, DE_REAL_COOLER_MINUTES, DE_REAL_HOUR_MINUTES } from '@/engine/jurisdictions'
import { formatClock, formatMoney } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { OverlayKind } from '@/hooks/useGame'

export function GameOverlays({
  kind,
  currency,
  net,
  elapsedSeconds,
  coolerLeftMs,
  onAckReality,
  onConfirmHour,
}: {
  kind: OverlayKind
  currency: string
  net: number
  elapsedSeconds: number
  coolerLeftMs: number
  onAckReality: () => void
  onConfirmHour: () => void
}) {
  if (kind === 'none') return null

  const coolerDemo = formatClock((coolerLeftMs / DE_DEMO_COOLER_MS) * DE_REAL_COOLER_MINUTES * 60)

  return (
    <div className="overlay-veil" role="dialog" aria-modal="true" aria-labelledby="overlay-title">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass w-full max-w-lg rounded-3xl px-8 py-8"
      >
        {kind === 'reality' && (
          <>
            <p className="chip chip-idle mb-4">AS-UK-001 · Reality check</p>
            <h2 id="overlay-title" className="font-display text-4xl text-[#f0ddaa]">
              Take a moment
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#cfc6b0]">
              UKGC RTS 8A requires a reality check before the next spin. You have been playing for{' '}
              {formatClock(elapsedSeconds)}. Net position {formatMoney(net, currency)}.
            </p>
            <div className="mt-6">
              <Button onClick={onAckReality}>Continue playing</Button>
            </div>
          </>
        )}

        {kind === 'confirm' && (
          <>
            <p className="chip chip-cooler mb-4">AS-DE-001 · 60 minute confirm</p>
            <h2 id="overlay-title" className="font-display text-4xl text-[#f0ddaa]">
              Continuous play limit
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#cfc6b0]">
              Demo clock: 30 seconds equals {DE_REAL_HOUR_MINUTES} minutes. Confirm to begin the{' '}
              {DE_REAL_COOLER_MINUTES}-minute cooler required after an hour of continuous play.
            </p>
            <div className="mt-6">
              <Button onClick={onConfirmHour}>Confirm and start cooler</Button>
            </div>
          </>
        )}

        {kind === 'cooler' && (
          <>
            <p className="chip chip-cooler mb-4">AS-DE-001 · Cooler</p>
            <h2 id="overlay-title" className="font-display text-4xl text-[#f0ddaa]">
              Table cooling
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#cfc6b0]">
              Spins are locked for a {DE_REAL_COOLER_MINUTES}-minute cooler. Demo time remaining {coolerDemo}.
            </p>
            <p className="mt-4 font-display text-5xl text-[#efe6d2]">{coolerDemo}</p>
          </>
        )}

        {kind === 'closed' && (
          <>
            <p className="chip chip-deny mb-4">AS-DE-002 · Intentional fail</p>
            <h2 id="overlay-title" className="font-display text-4xl text-[#ffd0d0]">
              Licence closed
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#cfc6b0]">
              The German licence token is expired or missing. Reel Factory is hard-closed for this
              market until the Field Engineer restores the token.
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}

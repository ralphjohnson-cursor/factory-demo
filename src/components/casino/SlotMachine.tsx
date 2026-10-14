import { AnimatePresence, motion } from 'framer-motion'
import { ReelColumn } from './Reel'
import { WinBurst } from './WinBurst'
import type { ReelView } from '@/hooks/useGame'
import type { SpinResult } from '@/engine/types'
import { formatMoney } from '@/lib/utils'

export function SlotMachine({
  reels,
  lastWin,
  currency,
}: {
  reels: ReelView[]
  lastWin: SpinResult | null
  currency: string
}) {
  const celebrating = Boolean(lastWin && lastWin.winAmount > 0)

  return (
    <div className="reel-frame">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="font-display text-2xl tracking-[0.18em] text-[#f0ddaa]">REEL FACTORY</p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#8a7038]">Five lines · demo chips</p>
      </div>
      <div className="relative">
        <div className="reel-well" role="img" aria-label="Reel Factory reels">
          {reels.map((reel, index) => (
            <ReelColumn
              key={index}
              strip={reel.strip}
              offset={reel.offset}
              blurred={reel.blurred}
              winningIndexes={reel.winningIndexes}
            />
          ))}
        </div>
        <WinBurst active={celebrating} />
        <AnimatePresence>
          {celebrating && (
            <motion.div
              key={lastWin?.winAmount}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 -bottom-2 flex justify-center"
            >
              <p className="win-pop font-display text-4xl text-[#f0ddaa]">
                {formatMoney(lastWin?.winAmount ?? 0, currency)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

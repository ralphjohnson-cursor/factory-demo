import { SymbolArt } from './Symbols'
import type { SymbolId } from '@/engine/types'

export const SYMBOL_HEIGHT = 92

export function ReelColumn({
  strip,
  offset,
  blurred,
  winningIndexes,
}: {
  strip: SymbolId[]
  offset: number
  blurred: boolean
  winningIndexes: number[]
}) {
  return (
    <div className="reel-window" aria-hidden="true">
      <div className="reel-payline" />
      <div
        className="relative will-change-transform"
        style={{
          transform: `translate3d(0, ${offset}px, 0)`,
          filter: blurred ? 'blur(3px) saturate(0.85)' : 'none',
        }}
      >
        {strip.map((id, index) => (
          <div key={`${id}-${index}`} className={`symbol-tile${winningIndexes.includes(index) ? ' win' : ''}`}>
            <SymbolArt id={id} />
          </div>
        ))}
      </div>
    </div>
  )
}

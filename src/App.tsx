import { SymbolDefs } from '@/components/casino/Symbols'
import { Background } from '@/components/casino/Background'
import { JurisdictionBar } from '@/components/casino/JurisdictionBar'
import { SlotMachine } from '@/components/casino/SlotMachine'
import { Controls } from '@/components/casino/Controls'
import { SessionPanel } from '@/components/casino/SessionPanel'
import { AuditFeed } from '@/components/casino/AuditFeed'
import { GameOverlays } from '@/components/casino/Overlays'
import { useGame } from '@/hooks/useGame'

export default function App() {
  const game = useGame()

  return (
    <div className="app-shell">
      <Background />
      <SymbolDefs />
      <div className="app-content mx-auto max-w-[1280px] px-4 pb-16 pt-6 md:px-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8a7038]">
              iGaming · SPIN-101
            </p>
            <h1 className="font-display mt-1 text-5xl text-[#f0ddaa] md:text-6xl">Reel Factory</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#9aa0ab]">
              Jurisdiction autoplay demo for the demo operator. Switching market
              rewrites the control cluster from the AS-* rule engine.
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a7038]">Prepared for</p>
            <p className="font-display text-2xl text-[#efe6d2]">Demo Operator</p>
            <p className="text-xs text-[#6f7380]">Field Engineer · session {game.sessionId.slice(0, 8)}</p>
          </div>
        </header>

        <div className="gold-hairline mb-5" />

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <JurisdictionBar current={game.jurisdiction} onChange={game.setJurisdiction} />
          <div className="flex flex-wrap gap-2">
            <span className="chip chip-idle">{game.market.regulator}</span>
            <span
              className={`chip ${
                game.market.autoplayDefault === 'on'
                  ? 'chip-allow'
                  : game.market.autoplayDefault === 'gated'
                    ? 'chip-cooler'
                    : 'chip-deny'
              }`}
            >
              Autoplay {game.market.autoplayDefault}
            </span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <SlotMachine reels={game.reels} lastWin={game.lastWin} currency={game.market.currency} />
            <Controls game={game} />
            <AuditFeed decisions={game.decisions} />
          </div>
          <SessionPanel game={game} />
        </div>
      </div>

      <GameOverlays
        kind={game.overlay}
        currency={game.market.currency}
        net={game.net}
        elapsedSeconds={game.elapsedSeconds}
        coolerLeftMs={game.coolerLeftMs}
        onAckReality={game.acknowledgeReality}
        onConfirmHour={game.confirmDeHour}
      />
    </div>
  )
}

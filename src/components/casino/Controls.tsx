import { Gauge, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { PA_MAX_BATCH } from '@/engine/jurisdictions'
import type { useGame } from '@/hooks/useGame'
import { formatMoney } from '@/lib/utils'

type Game = ReturnType<typeof useGame>

export function Controls({ game }: { game: Game }) {
  const { affordances, market } = game
  const autoplayDenied = !affordances.canAutoplay
  const esReady = Boolean(game.intent.maxLoss && game.intent.maxLoss > 0 && game.intent.spinCount && game.intent.spinCount > 0)
  const paNote = game.jurisdiction === 'PA' && game.flags.boardApproved

  return (
    <section className="glass mt-5 rounded-3xl p-5" aria-label="Spin controls">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <button
            type="button"
            className="spin-disc"
            onClick={() => void game.requestSpin()}
            disabled={game.spinning || game.overlay !== 'none' || game.ukGapLeft > 0}
            aria-label="Spin"
          >
            <span className="font-display text-3xl tracking-[0.18em]">SPIN</span>
          </button>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#8a7038]">Stake</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {game.stakeOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => game.setStake(value)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    game.stake === value
                      ? 'border-[#f0ddaa] bg-[rgba(212,180,106,0.16)] text-[#f0ddaa]'
                      : 'border-[rgba(212,180,106,0.16)] text-[#cfc6b0]'
                  }`}
                >
                  {formatMoney(value, market.currency)}
                </button>
              ))}
            </div>
            {game.jurisdiction === 'UK' && game.ukGapLeft > 0 && (
              <p className="mt-2 text-xs text-[#d39a4a]">
                AS-UK-002 · {(game.ukGapLeft / 1000).toFixed(1)}s until next cycle
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 lg:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`chip ${
                affordances.autoplay.decision === 'allow'
                  ? 'chip-allow'
                  : affordances.autoplay.decision === 'cooler'
                    ? 'chip-cooler'
                    : 'chip-deny'
              }`}
            >
              Autoplay {affordances.autoplay.decision}
            </span>
            <span className={`chip ${affordances.canTurbo ? 'chip-allow' : 'chip-deny'}`}>
              Turbo {affordances.canTurbo ? 'allowed' : 'banned'}
            </span>
            {game.autoplayOn && (
              <span className="chip chip-allow">{game.remainingSpins} remaining</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {affordances.showEsCaps && (
              <>
                <label className="text-[11px] uppercase tracking-[0.14em] text-[#8a7038]">
                  Max loss
                  <Input
                    className="mt-1 w-28"
                    type="number"
                    min={1}
                    value={game.intent.maxLoss ?? ''}
                    onChange={(event) =>
                      game.setIntent({
                        ...game.intent,
                        maxLoss: event.target.value === '' ? null : Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="text-[11px] uppercase tracking-[0.14em] text-[#8a7038]">
                  Spins
                  <Input
                    className="mt-1 w-24"
                    type="number"
                    min={1}
                    value={game.intent.spinCount ?? ''}
                    onChange={(event) =>
                      game.setIntent({
                        ...game.intent,
                        spinCount: event.target.value === '' ? null : Number(event.target.value),
                      })
                    }
                  />
                </label>
              </>
            )}

            {(game.jurisdiction === 'MT' ||
              game.jurisdiction === 'SE' ||
              game.jurisdiction === 'NJ' ||
              game.jurisdiction === 'PA') && (
              <label className="text-[11px] uppercase tracking-[0.14em] text-[#8a7038]">
                Batch
                <Input
                  className="mt-1 w-24"
                  type="number"
                  min={1}
                  max={paNote ? PA_MAX_BATCH : undefined}
                  value={game.intent.spinCount ?? ''}
                  onChange={(event) =>
                    game.setIntent({
                      ...game.intent,
                      spinCount: event.target.value === '' ? null : Number(event.target.value),
                    })
                  }
                />
              </label>
            )}

            <Button
              variant="emerald"
              disabled={
                autoplayDenied ||
                game.autoplayOn ||
                game.spinning ||
                game.overlay !== 'none' ||
                (game.jurisdiction === 'ES' && !esReady)
              }
              onClick={() => void game.startAutoplay()}
              aria-label="Start auto-spin"
            >
              Auto-spin
            </Button>
            <Button
              variant="danger"
              disabled={!game.autoplayOn}
              onClick={game.stopAutoplay}
              aria-label="Stop auto-spin"
            >
              <Square className="size-3.5" />
              Stop
            </Button>
            <div className="flex items-center gap-2 rounded-full border border-[rgba(212,180,106,0.16)] px-3 py-2">
              <Gauge className="size-4 text-[#d4b46a]" />
              <span className="text-xs uppercase tracking-[0.14em] text-[#cfc6b0]">Turbo</span>
              <Switch
                checked={game.turbo && affordances.canTurbo}
                disabled={!affordances.canTurbo}
                onCheckedChange={game.setTurbo}
                label="Turbo"
              />
            </div>
          </div>

          {game.jurisdiction === 'ES' && !esReady && (
            <p className="text-xs text-[#d39a4a]">AS-ES-001 · Set both max loss and spin count to enable autoplay.</p>
          )}
          {paNote && (
            <p className="text-xs text-[#b8ffe0]">AS-PA-001 · Board approved. Batch clamps at {PA_MAX_BATCH}.</p>
          )}
          {game.jurisdiction === 'ES' && game.autoplayOn && game.remainingLoss !== null && (
            <p className="text-xs text-[#b8ffe0]">
              Remaining loss budget {formatMoney(game.remainingLoss, market.currency)} · {game.remainingSpins} spins left
            </p>
          )}
          {autoplayDenied && (
            <p className="max-w-md text-right text-xs text-[#9aa0ab]">{affordances.autoplay.reason}</p>
          )}
        </div>
      </div>
    </section>
  )
}

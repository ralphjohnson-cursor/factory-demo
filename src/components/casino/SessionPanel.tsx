import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { DE_REAL_HOUR_MINUTES } from '@/engine/jurisdictions'
import type { useGame } from '@/hooks/useGame'
import { formatClock, formatMoney } from '@/lib/utils'

type Game = ReturnType<typeof useGame>

function DecisionTone(decision: 'allow' | 'deny' | 'cooler') {
  if (decision === 'allow') return 'chip-allow'
  if (decision === 'cooler') return 'chip-cooler'
  return 'chip-deny'
}

export function SessionPanel({ game }: { game: Game }) {
  const latest = game.decisions[0]

  return (
    <aside className="glass rounded-3xl p-5" aria-label="Session">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a7038]">Session</p>
      <h2 className="font-display mt-1 text-3xl text-[#f0ddaa]">{game.market.name}</h2>
      <p className="mt-1 text-sm text-[#9aa0ab]">
        {game.market.regulator} · {game.market.code}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Balance" value={formatMoney(game.balance, game.market.currency)} />
        <Stat label="Net position" value={formatMoney(game.net, game.market.currency)} tone={game.net >= 0 ? 'up' : 'down'} />
        <Stat label="Elapsed" value={formatClock(game.elapsedSeconds)} />
        <Stat label="Spins" value={String(game.spinCount)} />
      </div>

      {game.jurisdiction === 'DE' && (
        <div className="mt-4 rounded-2xl border border-[rgba(211,154,74,0.28)] bg-[rgba(211,154,74,0.08)] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#d39a4a]">Demo time</p>
          <p className="mt-1 text-sm text-[#efe6d2]">
            {game.deDemoMinutes.toFixed(1)} / {DE_REAL_HOUR_MINUTES} min continuous play
          </p>
          <p className="mt-1 text-xs text-[#9aa0ab]">30 seconds of real time equals 60 minutes on the German clock.</p>
        </div>
      )}

      {game.jurisdiction === 'SE' && (
        <div className="mt-4 rounded-2xl border border-[rgba(212,180,106,0.22)] bg-[rgba(212,180,106,0.07)] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#d4b46a]">Proposed, not default</p>
          <p className="mt-1 text-sm text-[#cfc6b0]">
            A proposed 60-spin cap is not in force. This demo keeps simpler autoplay with Stop.
          </p>
        </div>
      )}

      <Separator className="my-5" />

      <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a7038]">Active AS-* rules</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {game.market.ruleIds.map((id) => (
          <span key={id} className="chip chip-idle">
            {id}
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm leading-6 text-[#9aa0ab]">{game.market.notes}</p>

      {latest && (
        <div className="mt-5 rounded-2xl border border-[rgba(212,180,106,0.14)] bg-[rgba(0,0,0,0.22)] px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8a7038]">Last decision</p>
            <span className={`chip ${DecisionTone(latest.decision)}`}>{latest.decision}</span>
          </div>
          <p className="mt-2 text-sm text-[#efe6d2]">{latest.rule_ids.join(', ') || '—'}</p>
          <p className="mt-1 text-xs leading-5 text-[#9aa0ab]">{latest.reason}</p>
        </div>
      )}

      <Separator className="my-5" />

      <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a7038]">Field kit</p>
      <p className="mt-1 text-xs text-[#6f7380]">Operator toggles for Demo Operator</p>
      <div className="mt-4 space-y-3">
        <FlagRow
          id="de-token"
          label="DE licence token expired"
          hint="AS-DE-002 intentional fail"
          checked={game.flags.deLicenceExpired}
          onChange={(value) => game.updateFlag('deLicenceExpired', value)}
        />
        <FlagRow
          id="nj-auth"
          label="DGE autoplay authorisation"
          hint="AS-NJ-001"
          checked={game.flags.dgeAutoplayAuth}
          onChange={(value) => game.updateFlag('dgeAutoplayAuth', value)}
        />
        <FlagRow
          id="pa-board"
          label="PA board approved"
          hint="AS-PA-001 · max 50"
          checked={game.flags.boardApproved}
          onChange={(value) => game.updateFlag('boardApproved', value)}
        />
      </div>
    </aside>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'up' | 'down'
}) {
  return (
    <div className="rounded-2xl bg-[rgba(0,0,0,0.22)] px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#8a7038]">{label}</p>
      <p
        className={`mt-1 text-lg ${
          tone === 'down' ? 'text-[#ffd0d0]' : tone === 'up' ? 'text-[#b8ffe0]' : 'text-[#efe6d2]'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function FlagRow({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string
  label: string
  hint: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm text-[#efe6d2]">
        {label}
        <span className="block text-xs text-[#6f7380]">{hint}</span>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} label={label} />
    </div>
  )
}

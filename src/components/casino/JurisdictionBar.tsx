import { JURISDICTIONS, type Jurisdiction } from '@/engine/types'
import { MARKETS } from '@/engine/jurisdictions'

export function JurisdictionBar({
  current,
  onChange,
}: {
  current: Jurisdiction
  onChange: (code: Jurisdiction) => void
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Jurisdiction">
      {JURISDICTIONS.map((code) => {
        const market = MARKETS[code]
        return (
          <button
            key={code}
            type="button"
            role="tab"
            aria-selected={current === code}
            data-active={current === code}
            className="jurisdiction-pill"
            onClick={() => onChange(code)}
            title={`${market.name} · ${market.regulator}`}
          >
            <span className="block text-[11px] font-semibold tracking-[0.16em]">{code}</span>
          </button>
        )
      })}
    </div>
  )
}

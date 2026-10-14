import type { RuleDecision } from '@/engine/types'

export function AuditFeed({ decisions }: { decisions: RuleDecision[] }) {
  return (
    <section className="glass mt-5 rounded-3xl p-5" aria-label="Audit trail">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a7038]">Audit</p>
          <h3 className="font-display text-2xl text-[#f0ddaa]">Rule decisions</h3>
        </div>
        <p className="text-xs text-[#6f7380]">rule_ids · jurisdiction · timestamp</p>
      </div>
      {decisions.length === 0 ? (
        <p className="mt-4 text-sm text-[#9aa0ab]">No evaluations yet. Spin or change a Field kit toggle.</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {decisions.map((item) => (
            <li
              key={`${item.audit.evaluated_at}-${item.audit.kind}-${item.rule_ids.join()}`}
              className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-2xl bg-[rgba(0,0,0,0.2)] px-3 py-2 text-sm"
            >
              <span
                className={`chip ${
                  item.decision === 'allow' ? 'chip-allow' : item.decision === 'cooler' ? 'chip-cooler' : 'chip-deny'
                }`}
              >
                {item.decision}
              </span>
              <div>
                <p className="text-[#efe6d2]">
                  {item.rule_ids.join(', ') || '—'} · {item.jurisdiction} · {item.audit.kind}
                </p>
                <p className="text-xs text-[#9aa0ab]">{item.reason}</p>
              </div>
              <time className="text-[11px] text-[#6f7380]" dateTime={item.timestamp}>
                {item.timestamp.slice(11, 19)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

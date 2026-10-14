# SPIN factory talk track

**Label:** Reel Factory · **FAC-1** (Factory demo) · **FACCTX**  
**Substrate:** `ralphjohnson-cursor/factory-demo` (this repo)  
**Rules of record:** **FACCTX** = `rules/` in factory-demo-docs. Rule pages are labelled by jurisdiction and feature area, for example `jurisdiction-de` and `area-autoplay`.  
**Trigger:** a GitHub Issue titled `FAC-N: ...` (Story or Task; never a Bug for this flow)

Prefer naming: **Reel Factory**, **FAC-1**, **FACCTX**, **regulated workflow**, **gates G1–G4**. Avoid “bug factory” language.

Never modify `(other demo repos)`. Optional narrative export is `ralphjohnson-cursor/factory-demo-docs`.

---

## Workflow

1. A GitHub Issue in factory-demo (key FAC-N) triggers the work. Read the key, summary, description, the jurisdiction or jurisdictions, and the feature area.
2. The agent finds the documentation that applies: the rule pages in factory-demo-docs/rules that match those jurisdictions and that feature area. Pages are labelled, for example `jurisdiction-de` and `area-autoplay`.
3. The agent adds the exact rule text to the ticket (GitHub Issue) in one comment, **Rules that apply**. Each entry carries the rule ID (`AS-XX-NNN`), the one-line summary, the full rule text, and a link to the rule page it was copied from. If a jurisdiction has no matching page, the comment says so and the work stops. Rule text is copied from FACCTX only.
4. The fix is then done from the ticket. The pull request cites each rule ID from that comment, and each rule ID has at least one test whose name or comment includes the rule ID.

Comment shape:

```
Rules that apply (auto-filled from FACCTX)
- AS-DE-002: <summary>
  <full rule text>
  Source: <rule page link>
(one entry per rule)
```

Use the GitHub CLI or API (`gh issue view`, `gh issue comment`) for the issue and read rule pages from factory-demo-docs.

---

## Spine

```
FAC ticket (GitHub Issue) (Story or Task)
    │
    ▼
Find rule pages        →  labels match jurisdiction + feature area
                             (jurisdiction-de, area-autoplay, …)
    │
    ▼
Rules that apply          →  exact rule text, rule ID (AS-XX-NNN),
comment on the ticket        and a link to the page
    │
    ▼
Fix from the ticket       →  PR in Reel Factory cites each rule ID
                          →  each rule ID covered by at least one test
                          →  optional narrative in factory-demo-docs
    │
    ▼
eval G1–G4                →  G2/G4 RED citing AS-DE-002
                             on the deliberate first pass
    │
    ▼
Close the red gates       →  expired or missing DE licence
                             + audit fields → G2/G4 GREEN
    │
    ▼
Senior review             →  validated / flagged / needs-human-approval
    │
    ▼
HUMAN GATE                →  merge → ticket closes with an audit trail
```

Demo branches (do not merge from the factory walkthrough):

| Branch | Intent |
| --- | --- |
| `main` | Complete green Reel Factory spine |
| `demo/as-de-002-intentional-fail` | Incomplete DE licence → G2/G4 red citing **AS-DE-002** |
| `demo/as-de-002-remediate` | Licence hard-fail + `timestamp` restored → green |

---

## Gates G1–G4

| Gate | Name | Role |
| --- | --- | --- |
| **G1** | `contract` | Playable engine + demo matrix stay intact. A new rule must not break the UK, ES, NL, NJ, PA, MT, SE, or IT baselines. |
| **G2** | `regulatory-assertions` | Each rule ID cited on the ticket has at least one test. **Deliberate first-pass fail:** AS-DE-002 (expired or missing DE licence). |
| **G3** | `policy-code-consistency` | The implementation stays consistent with the rule IDs recorded on the ticket and cited in the pull request. |
| **G4** | `audit-evidence` | Every decision, especially AS-DE-002, includes `rule_ids`, `jurisdiction`, and `timestamp`. The first pass omits them, so the gate stays red. |

G1 stays green on the intentional-fail pass. G2 and G4 go green once an expired or missing DE licence is denied and the audit fields are present.

```bash
npm run test:gates
```

---

## Evaluation surface

- `evaluate(input)` — spin, turbo, stop, licence, autoplay start
- `evaluateAutoplay(input)` — exported autoplay decision (AS-DE-002 still hard-fails here)
- Decision + `audit` always carry `rule_ids`, `jurisdiction`, `timestamp`

Expired (`deLicenceExpired`) or missing (`deLicenceToken` empty or null) DE licence → **deny**, table closed, rule **AS-DE-002**.

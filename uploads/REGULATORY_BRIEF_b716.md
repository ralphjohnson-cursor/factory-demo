# factory-demo regulatory brief (23 Sep 2026)

## Demo matrix
UK/DE/NL/IT = autoplay OFF; ES/MT/SE = ON with controls; US = default OFF; PA caps at 50 when approved.

## AS-* rules to implement in game/API
- AS-UK-001: Disable autoplay + turbo for market=UK; reality-check overlay blocks next spin until ack (UKGC RTS 8A in force 17 Jan 2025).
- AS-UK-002: Min 2.5s between slot cycles; reject turbo (RTS 14D/14E). Optional HISTORICAL capped autoplay 100 — not current law.
- AS-DE-001: No auto-sequence; after 60min continuous play force confirm then 5min cooler (GlüStV §22a).
- AS-DE-002: INTENTIONAL FAIL — if DE licence token expired/missing, hard-fail closed.
- AS-ES-001: Autoplay only after player sets max loss/stake AND spin count; stop anytime; show remaining (DGOJ §3.13).
- AS-NL-001: Require click every spin; reject multi-spin queue (Regeling 3.7–3.8).
- AS-NJ-001: Deny autoplay unless dgeAutoplayAuth=true (N.J.A.C. 13:69O-1.5(k)).
- AS-PA-001: If boardApproved, clamp autoplay batch ≤50; always allow Stop (58 Pa. Code §810a.10(d)).

## How a change uses these rules
Work starts from a GitHub Issue in factory-demo (key FAC-N). The agent looks up the rule pages in factory-demo-docs/rules that match the ticket's jurisdictions and feature area. Those pages are labelled, for example `jurisdiction-de` and `area-autoplay`. The agent posts one "Rules that apply" comment on the ticket with the exact rule text, the rule ID (`AS-XX-NNN`), and a link to the page. The fix is done from that ticket. The pull request cites each rule ID, and each rule ID has at least one test.

The bullets above are the Reel Factory demo matrix. The wording that governs a change is the exact text copied from the matching rule page onto the ticket.

# Reel Factory

Premium iGaming spin demo for **a demo operator**. It plays like a dark-luxury online slot while the AS-* rule engine rewrites autoplay, turbo, coolers, and reality checks by jurisdiction.

This repo is the playable app plus the **FAC-1 / FACCTX** factory spine. Companion narrative can live in `factory-demo-docs`. A change starts from a GitHub Issue in factory-demo (key FAC-N). The agent copies the matching FACCTX rules onto that ticket, then implements the fix from the ticket.

## Run locally

```bash
npm install
npm run dev
```

Vite serves the app at `http://127.0.0.1:43147`.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | Oxlint |
| `npm run test:gates` | G1–G4 Vitest gates |

## Factory spine

Talk track: [SPIN-FACTORY.md](SPIN-FACTORY.md) (Reel Factory / FAC-1 / FACCTX).

1. A GitHub Issue in factory-demo (key FAC-N) triggers the work.
2. The agent finds the rule pages in factory-demo-docs/rules for the ticket's jurisdictions and feature area. Pages are labelled, for example `jurisdiction-de` and `area-autoplay`.
3. The agent adds the exact rule text to the ticket in a **Rules that apply** comment, with the rule ID (`AS-XX-NNN`) and a link to the page.
4. The fix is done from the ticket. The pull request cites each rule ID, and each rule ID has at least one test.

| Gate | Name | Role |
| --- | --- | --- |
| G1 | contract | Baseline market behaviour stays intact |
| G2 | regulatory-assertions | Each rule ID cited on the ticket has at least one test. The demo's deliberate first-pass fail is AS-DE-002 |
| G3 | policy-code-consistency | The implementation stays consistent with the rule IDs recorded on the ticket |
| G4 | audit-evidence | `rule_ids`, `jurisdiction`, and `timestamp` on every decision |

`evaluate` and `evaluateAutoplay` are the evaluation surface. An expired or missing DE licence hard-fails **deny** as **AS-DE-002**.

## What to show in a customer meeting

1. Open the table on **UK**. Autoplay and turbo stay locked. Manual spins wait 2.5 seconds. Every sixth spin raises a reality-check overlay (AS-UK-001 / AS-UK-002).
2. Switch to **ES**. Auto-spin stays disabled until both max loss and spin count are set. Remaining budget stays visible. Stop always works (AS-ES-001).
3. Switch to **DE**. Autoplay is off. Leave the table running; the demo clock treats 30 seconds as 60 minutes, then asks for confirm and a 5-minute cooler (AS-DE-001). Flip **DE licence token expired** in the Field kit to hard-close the table (AS-DE-002).
4. **NL** rejects queued autoplay. **NJ** needs the DGE authorisation toggle. **PA** with board approval clamps batches at 50. **MT** and **SE** allow simpler autoplay; Sweden shows a non-default proposed-60 banner.

Each evaluation returns `rule_ids`, jurisdiction, allow/deny/cooler, and audit fields (`timestamp`, session, actor, inputs).

## Rules that apply

Applicable rules are the rule pages in factory-demo-docs/rules for the ticket, copied onto the ticket with their rule IDs and page links before any code change. The demo matrix is written up in [`docs/REGULATORY_BRIEF.md`](docs/REGULATORY_BRIEF.md).

## Stack

Vite, React, TypeScript, Tailwind CSS, shadcn-style primitives, Framer Motion, Vitest gates. Motion respects `prefers-reduced-motion`.

No live wallet, no real-money play, no invented regulator citations. Do not modify `expense-approval`.

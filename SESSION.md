# Reel Factory: session follow-up

Thank you for joining the session. This page recaps what you saw and how to explore it yourself.

## What the demo shows

Reel Factory is a playable online slot whose behaviour is governed by a jurisdiction-aware rule engine. The same game changes by market:

- **UK:** autoplay and turbo are locked, manual spins have a minimum pace, and regular reality checks appear (AS-UK-001, AS-UK-002).
- **DE:** autoplay is off, long sessions trigger a confirmation and cooling-off period (AS-DE-001), and an expired licence token hard-closes the table (AS-DE-002).

Every spin writes an audit entry recording the decision (allow, deny or cooler), the rule IDs that applied, the jurisdiction and a timestamp.

## How Cursor built it: a rules-gated software factory

1. A change starts as a ticket (for example FAC-1).
2. The Cursor agent finds the regulatory rule pages that apply to the ticket's jurisdictions and feature area, and copies the exact rule text and IDs onto the ticket.
3. The agent implements the change from the ticket, citing each rule ID in the pull request.
4. Automated gates check the work before it can merge:

| Gate | Checks |
| --- | --- |
| G1 contract | Baseline market behaviour stays intact |
| G2 regulatory assertions | Every cited rule ID has at least one test |
| G3 policy-code consistency | The code matches the rules recorded on the ticket |
| G4 audit evidence | Every decision carries rule IDs, jurisdiction and timestamp |

### First attempt and remediation

- [PR #2: first attempt](https://github.com/ralphjohnson-cursor/factory-demo/pull/2) implements AS-DE-002 (licence token expiry) but misses requirements, so gates **G2 and G4 fail** and the change is blocked.
- [PR #3: remediation](https://github.com/ralphjohnson-cursor/factory-demo/pull/3) is the agent's fix, driven by the gate failures. **All gates pass.**

The point: the agent works fast, but the rules and gates decide what ships, and every decision leaves audit evidence.

## Run it yourself

```bash
npm ci
npm run dev          # http://localhost:43147
npm run test:gates   # G1–G4 gates
```

Pick a jurisdiction, click **Spin**, and watch the audit feed. On DE, switch on **DE licence token expired** in the Field kit to see the table close.

## Want a follow-up?

Email [ralph.johnson@anysphere.co](mailto:ralph.johnson@anysphere.co) to arrange a deeper dive or a session tailored to your own workflows.

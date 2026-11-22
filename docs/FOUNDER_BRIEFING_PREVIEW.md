# Founder Briefing — Super-LocalAdmin (preview only)

**Date:** 2026-11-22 · **Owner request:** “I'd like to learn [your recommendations]. Then give me info in the localadmin app.” 
**Release:** Draft branch only. No production/admin deployment, API, database, Firebase, Cloudflare or Oracle changes.

## User experience

A new **Founder Briefing** item appears in desktop and mobile Control Center navigation **only inside the existing server-authorized Super Admin shell**. It opens an educational read-only panel with three concise lessons:

1. Why Cloudflare is the current storefront hosting choice while Oracle remains a separate backend/AI experiment.
2. Why a deterministic, verified FAQ can be cheaper and safer than adopting a self-hosted open-weight LLM before genuine demand is established.
3. Why AI may explain approved information but must never accept orders, set live prices, mark payments, change merchant availability or send Firebase notifications.

An additional section explains what CF2-C actually proved and what CF2-D needs to prepare before any hosted SQL permissions can be approved. It clearly labels the contents as a **22 November 2026 documentation snapshot, not live analytics or a release dashboard**, and links to the canonical GitHub handoff, founder charter, Oracle research and LE-09 idea register.

## Security and non-regression

The new UI contains **no fetch, new backend endpoint, mutation, telemetry, dynamic AI inference, localStorage, credentials, personal data or administrator command**. Authorization continues to be gated by Firebase authentication followed by LocalEats API `/api/v1/admin/me` role verification in the existing `App.tsx`. Shop Review remains the default screen and existing Rider controls remain disabled.

The Founder Briefing is not public, not a marketing dashboard, and not evidence of a live AI model or running Oracle server. All published financial figures and launch claims continue to require server and founder confirmation.

## Verification

```sh
node --test tests/founder-briefing.test.mjs
npm run lint
npm run build
```

CI file: `.github/workflows/founder-briefing-review.yml`. It runs code checks, builds a **local static preview only**, and performs no deployment. Its status must be verified on the exact PR head before marking complete.

**Next release gate:** founder inspects preview, then separately approves a merge/deployment. If GitHub Actions cannot validate a code or styling requirement, leave the draft unmerged and record the blocker.

[Canonical LocalEats project memory](https://github.com/mehey9184-maker/LocalEats-Dashboard.2/blob/cloudflare/cf1-merchant-api-staging-20261122/docs/LOCALEATS_PROJECT_MEMORY.md) · [Founder charter](https://github.com/mehey9184-maker/LocalEats-Dashboard.2/blob/cloudflare/cf1-merchant-api-staging-20261122/docs/LOCALEATS_FOUNDER_CHARTER.md).

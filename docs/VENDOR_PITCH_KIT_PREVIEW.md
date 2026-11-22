# Super Admin — Vendor Pitch Kit (Founder-only preview)

**Prepared:** 2026-11-23 · **Owner request:** Push vendor pitch readiness to **90%** and public pickup-order readiness to **85%**, so vendors can be signed up.
**Implementation:** Stacked draft PR, based on the separate [Founder Briefing draft PR #5](https://github.com/mehey9184-maker/Super-LocalAdmin/pull/5). **NOT merged, not deployed.**

## The honest readiness distinction

- **90% pitch-readiness** is a founder goal, **not the current verified score**. Before this work the subjective planning estimate was 75%. No reliable live-phone demo or approved signed commercial offer was verified in this phase. This owner-only draft improves interview/demo preparation, but does not imply vendor onboarding is publicly available.
- **85% real-orders readiness** is likewise a founder goal, **not current verified performance**; existing planning estimate 50%. Deployed Cloudflare CF1 is still a no-data bootstrap that denies orders, and CF2-E hosted staging SQL remains blocked on current backup evidence.
- Neither target number should be presented as test coverage or promised reliability to vendors.

## What's inside the app draft

A **Vendor Pitch** navigation item under the existing Firebase + server-verified Super Admin shell. Shop Review remains the first/default module, and the disabled Merchants/Riders controls are not activated.

1. A **30-second founder pitch** describing the proposed pickup-first pilot, customer pays at the shop, with public ordering plainly described as NOT live.
2. A **four-step interactive illustration** (browse → food selection → merchant Accept/Ready → pay at shop). It uses clearly labelled **TEST** shop/menu content, no fake reviews, no external API, no actual order and no login.
3. **Five concise questions** to validate vendors' current operations and pilot interest.
4. A **blank printable voluntary vendor-interest sheet** with an optional contact consent checkbox. It is a paper field worksheet, **not** an in-app merchant account, registration backend, payment contract or binding subscription agreement. No vendor names/phones are typed into, persisted in or transmitted by the app.

**Privacy:** The founder must show a suitable privacy notice and handle signed paper forms securely before collecting real details. Do not photograph, transmit or upload completed forms to test databases, public chat, GitHub or unapproved services. If consent is refused, do not retain contact details. Do not invent launch schedules, fees, sales, rewards or vendor revenue.

## Real vendor sign-up path — only when authorized

The existing Merchant Dashboard already contains `CreateShopOnboarding` → authenticated `POST /api/v1/merchant/shop` → **pending** shop → Super Admin review/approval. It is intentionally not replaced by the printable form.

**Important compatibility finding:** Source inspection of `localeats-api/src/routes/merchant.ts` shows that the route INSERT payload includes **both** `latitude/longitude` and `lat/lng`. Read-only column inspection on 2026-11-23 found that the *main LocalEats PostgreSQL schema* contains all four and the *separate LocalEats-Profile-Staging PostgreSQL schema* contains only `latitude/longitude`. Thus the current INSERT payload is **not directly schema-compatible with staging**. No hosted records or columns were changed. Before staging sign-up can be tested, prepare a source-only compatibility fix and prove it preserves the main schema and legacy client behavior. Do **not** simply remove legacy columns or make staging grants to work around the incompatibility.

Other conditions for any real merchant sign-up: authenticated owner binding, a verified API deployment, consent/privacy/legal commercial terms, vendor review authority, back-end snapshot/rollback, verified real mobile path, and explicit founder release approval. Interest collection must not create a live shop prematurely.

## Tests / review

- `node --test tests/vendor-pitch-kit.test.mjs` asserts owner authorization, truthful sample labels, no PII capture, no API calls and unaffected Shop Review/Rider restrictions.
- `node --test tests/founder-briefing.test.mjs`, `npm run lint`, `npm run build` in [preview-only GitHub workflow](../.github/workflows/vendor-pitch-kit-review.yml). No deployment step.
- Manually inspect the Vendor Pitch screen at 320px/390px and desktop, tabbing through buttons, printing the interest sheet and confirming no live API calls.
- No claim of 90/85 achieved before merchant pitch/device/checkout acceptance.

## Next gates

**Vendor pitch target (90%)**: approve a one-page vendor offer and verify a demo/script on a real phone, then conduct two or three practice owner interviews (with consent). No real account creation required for first meeting.

**Public-orders target (85%)**: get the staging encrypted backup gate green, approve the narrow CF2-E SQL change, independently approve a restricted Cloudflare connection/deploy, resolve Merchant POST schema mismatch, and perform a real consenting customer/merchant pickup acceptance including GPS, correct prices and notifications. 85% is not evidence that public orders may be activated; only a full release gate and owner sign-off can do that.

**Status:** All source-only changes remain in this isolated draft. Nothing merged or publicly deployed; no merchant data or charges created. [Canonical LocalEats project memory](https://github.com/mehey9184-maker/LocalEats-Dashboard.2/blob/cloudflare/cf1-merchant-api-staging-20261122/docs/LOCALEATS_PROJECT_MEMORY.md).

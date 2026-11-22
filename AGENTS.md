# Super-LocalAdmin — owner and AI working instructions

The founder is the CEO and final business/release authority. Use the approved operating rules in the canonical [LocalEats Founder–AI Charter](https://github.com/mehey9184-maker/LocalEats-Dashboard.2/blob/cloudflare/cf1-merchant-api-staging-20261122/docs/LOCALEATS_FOUNDER_CHARTER.md) and the [cross-chat Project Memory](https://github.com/mehey9184-maker/LocalEats-Dashboard.2/blob/cloudflare/cf1-merchant-api-staging-20261122/docs/LOCALEATS_PROJECT_MEMORY.md).

**SAFE autonomy:** analyse, write isolated changes/tests/docs, and open draft PRs. **Explicit founder approval required** for merges, live or staging deployments, database/auth/permissions changes, new keys, real orders/payments, customer contact and any paid resource. An older broad launch instruction does not override this agreement.

## 2026-11-23 Vendor Pitch Kit — stacked preview only

Founder targets **90% vendor-pitch** and **85% public-order readiness**, but evidence-based planning estimates remain 75%/50% until accepted phone demos and real live-order verification. [Vendor Pitch Kit stacked draft PR](https://github.com/mehey9184-maker/Super-LocalAdmin/pull/6) adds an owner-only **Vendor Pitch** navigation item, four-step fictional pickup illustration, founder script, merchant interview questions and a **blank paper interest/consent worksheet**. It must never create an account, collect/store/submit contact data or present test prices as actual offers. The founder may invite interest now but must not claim the local or Cloudflare service accepts live orders. [Vendor Pitch Kit implementation gates](docs/VENDOR_PITCH_KIT_PREVIEW.md).

Shop Review remains the default; `Merchants` and `Riders` remain disabled. Do not merge/deploy this stacked PR without separate approval or detach it from Founder Briefing draft #5. Run `node --test tests/vendor-pitch-kit.test.mjs` plus TypeScript/Vite CI. Owner's prep/printable vendor forms are not a legal subscription agreement, and the app has no merchant account signup endpoint.

## Protect Super Admin

- Keep access behind the existing Firebase sign-in **and** independent LocalEats API `GET /api/v1/admin/me` super_admin authorization; do not rely on browser flags to decide role.
- Never replace Shop Review backend states with mock approvals, guesses or local-only success claims. Preserve owner/shop authorization, server-verified transitions and signed-out/401/403 fail-closed paths.
- Riders and other unsupported modules stay disabled for the pickup pilot.
- Founder Briefing is a **dated, static read-only educational snapshot**, not live analytics. It has no API calls, financial claims, privileged actions or AI runtime. Follow links to current GitHub evidence and clearly label what is unreleased.
- Do not add an Oracle AI model to the production app from a research idea. Canonical proposals live in [Customer idea register LE-09](https://github.com/mehey9184-maker/LocalEats-app/blob/cloudflare/cf1-customer-staging-20261122/docs/LOCALEATS_SCALABLE_IDEA_REGISTER.md).
- After edits, preserve UI navigation and authorization; run `node --test tests/founder-briefing.test.mjs`, `npm run lint`, `npm run build` in safe CI and update docs.

**Current work:** `review/founder-briefing-cf2d-20261122` is a **preview-only** addition. Not deployed or merged.

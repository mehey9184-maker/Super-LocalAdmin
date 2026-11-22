# Super-LocalAdmin — owner and AI working instructions

The founder is the CEO and final business/release authority. Use the approved operating rules in the canonical [LocalEats Founder–AI Charter](https://github.com/mehey9184-maker/LocalEats-Dashboard.2/blob/cloudflare/cf1-merchant-api-staging-20261122/docs/LOCALEATS_FOUNDER_CHARTER.md) and the [cross-chat Project Memory](https://github.com/mehey9184-maker/LocalEats-Dashboard.2/blob/cloudflare/cf1-merchant-api-staging-20261122/docs/LOCALEATS_PROJECT_MEMORY.md).

**SAFE autonomy:** analyse, write isolated changes/tests/docs, and open draft PRs. **Explicit founder approval required** for merges, live or staging deployments, database/auth/permissions changes, new keys, real orders/payments, customer contact and any paid resource. An older broad launch instruction does not override this agreement.

## Protect Super Admin

- Keep access behind the existing Firebase sign-in **and** independent LocalEats API `GET /api/v1/admin/me` super_admin authorization; do not rely on browser flags to decide role.
- Never replace Shop Review backend states with mock approvals, guesses or local-only success claims. Preserve owner/shop authorization, server-verified transitions and signed-out/401/403 fail-closed paths.
- Riders and other unsupported modules stay disabled for the pickup pilot.
- Founder Briefing is a **dated, static read-only educational snapshot**, not live analytics. It has no API calls, financial claims, privileged actions or AI runtime. Follow links to current GitHub evidence and clearly label what is unreleased.
- Do not add an Oracle AI model to the production app from a research idea. Canonical proposals live in [Customer idea register LE-09](https://github.com/mehey9184-maker/LocalEats-app/blob/cloudflare/cf1-customer-staging-20261122/docs/LOCALEATS_SCALABLE_IDEA_REGISTER.md).
- After edits, preserve UI navigation and authorization; run `node --test tests/founder-briefing.test.mjs`, `npm run lint`, `npm run build` in safe CI and update docs.

**Current work:** `review/founder-briefing-cf2d-20261122` is a **preview-only** addition. Not deployed or merged.

# Super Admin — merchant free-trial +1 month button

**8 November 2026 | DESIGN SPEC ONLY | No active billing, database migration, Production writes or deployed feature.**
Canonical founder decisions: https://github.com/mehey9184-maker/LocalEats-Dashboard.2/blob/main/LOCAL_EATS_MASTER_PLAN.md; draft Master Plan PR #124.

## Owner-approved intent

- **LATEST FOUNDER BUSINESS DIRECTION (8 Nov 2026): TWO FREE CALENDAR MONTHS by default for NEW merchants** before subscription becomes payable from month three, replacing the prior one-calendar-month decision. Still begin only once the shop has been approved and genuinely begins trading (exact verifiable event pending decision), not at shop creation or test order. Prior genuine three-month entitlement promises remain honoured.
- Only an authorised LocalEats **Super Admin** may award **+1 FREE MONTH** of merchant subscription trial to a selected shop. With the new two-month baseline, this becomes an OPTIONAL **THIRD FREE CALENDAR MONTH**, not another automatic month or an immediately live action. Merchants see a verified updated end date and cannot grant their own extensions.
- Existing merchants to whom a three-month entitlement was actually promised must not silently lose it.
- Merchant subscription tiers remain Plus R199 / Pro R399 / Premium R499 as earlier plans; **no subscription bills or payments are activated** by this spec. Pickup and pay at the physical shop remain unaffected.

## Visual design (future Super Admin Shop Detail or Subscriptions section)

The proposed action is placed in an existing verified shop detail to preserve the current Super Admin Shop Review layout.

| Field | Future truthful display |
| --- | --- |
| Shop name | From authenticated server-approved shop record |
| Plan | Server-confirmed Plus/Pro/Premium, or Pending if no plan |
| Trial start and end | Real server-confirmed dates, otherwise "Not verified" |
| Extension history | List of admin, reason, previous end, new end, timestamp |
| Action | **+ Add 1 Free Month** (only when API capability enabled and server permits) |

On selecting the button, present a confirmation dialog with old end and proposed new end, a required reason, and an explicit **Confirm 1-month extension**. During request, disable repeat submissions; on success fetch the updated server record and show its confirmed end date. On conflict/unavailable, show the true state and Retry, NOT an optimistic invented extension.

**Never place a fake working action on a connected Production app.** While extension capability remains disabled, there should be no active button claiming it can save a free month; a preview-only prototype may show the disabled concept as "Coming soon" after owner review.

**Commercial separation:** Merchant subscription payment owed to LocalEats starting after an approved two-month trial is NOT the same financial flow as LocalEats reimbursement OWED TO MERCHANTS for fulfilled free-kota awards. Do not secretly net, deduct, or offset these different debts. Rewards are not funded by hypothetical unpaid subscriptions. No billing or bank transfers are activated by this spec.

## Future server-authoritative command (not created)

Suggested future route, subject to actual API review:

- POST /api/v1/admin/shops/:shopId/subscription-trial/extend
- Verified Firebase identity + explicit server-side active Super Admin role, exact selected shop ID from URL verified against database, per-shop approval/trial eligibility.
- Request fields strictly allowlisted: reason, idempotency_key, expected_revision. The **server**, not the caller, decides extension length (one calendar month) and computes dates. Reject user-chosen end date, plan cost, owner ID, role or arbitrary duration.
- Transaction locks shop trial record; unique idempotency key ensures replays cannot extend twice. Require revision precondition to prevent stale admin decisions. Record an immutable event with actor UID, shop, old and new date, rule version, reason and timestamp; return only authoritative dates/status.
- Do not store this as localStorage, generic client shop metadata or a user-mutable trial_start_date.
- Merchant Dashboard and Super Admin should read the SAME canonical trial status and extension history from the server. Admin action must not trigger billing, card collection, plan conversion or shop suspension.

## OPEN policy before implementation

1. Is the button **once per shop**, or can the owner grant another one-month extension later with a fresh reason and explicit manual approval? Default safety recommendation: one extension per shop, with a separate exceptional override procedure.
2. When the original trial already ended, does the new month start from its old end or from the date of approval? Recommendation: don't waste the free month by backdating; choose and document this before coding.
3. Define "begins genuine trading": recommended candidate is first **real external paid-and-collected pickup after approved shop status**, but owner approval and contract wording remain OPEN; alternative is verified genuine public trading after approval. Do not use shop created_at, preview/testing, or device clocks. Apply consistent South African local-time and **two calendar months, not 60 or 30 fixed days**, plus any exceptional third month.
4. Establish treatment of shops with previously agreed three months, plan upgrades/downgrades, paused shops and trial starts before the feature launches. Do not retroactively withdraw a contractual benefit.
5. Decide what occurs when a trial expires while **subscription billing remains disabled**. Default: no automatic charge or fake "Payment due" claim; explicit communication and separate business policy needed.

## Acceptance tests before preview/live implementation

- Non-admin, unverified, revoked, anonymous, and wrong-shop clients all denied; admin list and Shop Review unchanged.
- Atomic +one-calendar-month calculation including month-end cases; no 30-day approximation, no browser clock authority.
- Double-tap, retry/lost response, race between two admins, stale revision and repeated idempotency key each grant at most once.
- Previous three-month legacy entitlements remain valid; start date never inferred from creation date or absent metadata.
- Admin reason and immutable before/after audit are stored without passwords, bank details or unnecessary personal data.
- Merchant sees identical verified trial end; unavailable server produces clear pending/unavailable state, not a false extra month.
- No service-role keys in browsers; no Production writes, billing activation or subscriptions charge in synthetic tests.

**Verified current Merchant UI discrepancy:** Merchant src/App.tsx around lines 460–480 currently defaults to a fixed 30-day countdown from trial_start_date, created_at or the local browser date. That cannot prove an approved-and-trading trial or reflect the future admin extension. Fix server truth and frontend presentation together before enabling the button.

This file is an implementation-ready review checklist, **not a functioning UI**. Any real API endpoint, Supabase migration or UI action needs a separate safe PR and the founder's release approval.

# Remediation Plan — SPR Techforge Management Platform

**Phase 1 deliverable.** Produced after re-reading the SRS/BRS (§3, §5, §6, §12, §11), the testing workbook scaffolding (`testing/SPR-Testing.xlsx` + `testing/generator/data/*.js`), and the canonical source files referenced by the traceability matrix.

This plan is the single source of truth for the audit & remediation work.

**Status (2026-05-17):** Plan approved by PO with Option A (Sprint A starts now; §0 questions deferred to before Sprint B). PO answers + additional Sprint-A requirements are captured in §0a immediately below. Sprint A execution order is now G-06 → C-04 → C-05 → C-06 → C-01 → G-01 → G-07 → G-02 (C-01 pulled forward per PO direction). G-06 is the first commit landing alongside this plan revision, [CODE_REVIEW_FINDINGS.md](CODE_REVIEW_FINDINGS.md), and [RUNBOOK.md](RUNBOOK.md).

---

## 0a. PO Approvals — Locked-in Decisions (Sprint A)

These answers from the PO supersede any "to be confirmed" placeholders later in this document. They are recorded here verbatim-equivalent so the plan can be read top-to-bottom without losing context.

| Topic | Decision |
| --- | --- |
| **Sprint A green-light** | Option A — start Sprint A now; §0 questions deferred to before Sprint B. |
| **G-07 collection design** | **Single `events` collection** with `category: 'security' \| 'business'` discriminator. Rationale recorded in [CODE_REVIEW_FINDINGS.md](CODE_REVIEW_FINDINGS.md) "G-07 Collection Design — Single Collection". |
| **Migration script auth** | **Browser-based migration as primary path** (master logs in to in-app Migration page; uses Anonymous Auth + isMaster rule). **Admin SDK with `GOOGLE_APPLICATION_CREDENTIALS` is break-glass only**, documented in [RUNBOOK.md](RUNBOOK.md) §1.2 including key-rotation steps. |
| **Anonymous Auth read budget** | Acceptable: ~500 reads/day at current usage, ~20K reads/day at NFR-SCA-01 target. Fallback rule **CM-01** triggers at >30K/day over a 7-day rolling window — recorded in [CODE_REVIEW_FINDINGS.md](CODE_REVIEW_FINDINGS.md) "Conditional Mitigations". |
| **G-13 Timezone** | **Path A — single-timezone IST.** `formatDate(iso)` helper will carry an inline comment naming Path B as the upgrade path; assumption is not buried in prose. |
| **G-18 Email** | **GAS stays in production**, no paid provider. Two adds: (a) retry-with-backoff in `services/emailService.ts`; (b) deploy-time health check that pings the GAS endpoint and fails the build on 5xx. |
| **G-09 Web-lead throttling** | Honeypot + localStorage + **Firestore rules check that rejects writes with the same fingerprint within 60s.** |
| **G-11 Resume storage** | Lazy migration on view + **one-time backfill script** following the same pattern as the password migration. |
| **Backups before every migration** | Required. Procedure in [RUNBOOK.md](RUNBOOK.md) §1.1. No migration runs without a fresh backup. Because `firestore:export` is Blaze-only, we use a client-side JSON dump and accept the (documented) lack of point-in-time consistency. |
| **Post-deploy password rotation** | Mandatory step at the end of Sprint A. Procedure in [RUNBOOK.md](RUNBOOK.md) §2.2. Sprint A is not marked complete until done. |
| **G-02 emulator fixtures** | In scope for the G-02 1-day estimate. Will live in `tests/fixtures/firestore-seed.ts`. |
| **Backup helper** | Spark-tier compatible client-side JSON dump. `firestore:export` is NOT promised anywhere. Trade-off (no PITR consistency) documented in [RUNBOOK.md](RUNBOOK.md) §1.1. |
| **Verification loop** | Hard rule: every commit runs `npm run build` + (`npm test` once C-06 lands) + manual smoke before push. Documented in [RUNBOOK.md](RUNBOOK.md) §1.3. |
| **One gap per commit** | Confirmed. Commit message format `fix(G-NN): ...` or `chore(C-NN): ...`. Push after every commit; PO pulls into QA between commits. |
| **No new deps beyond plan** | bcryptjs, zod, vitest, @firebase/rules-unit-testing, @testing-library/react are approved. Anything else requires an explicit ask. |

### Residual Risks Accepted (Sprint A)

Recorded in [CODE_REVIEW_FINDINGS.md](CODE_REVIEW_FINDINGS.md) "Residual Risks Accepted by PO":

- RR-01: hardcoded `ThiruPriya@13` in git history forever (mitigated by post-deploy rotation).
- RR-02: client-side rate limits bypassable (audit trail catches abuse).
- RR-03: +30 KB bundle (bcryptjs + zod).
- RR-04: G-20 (app-level encryption at rest) deferred indefinitely.

---

## 0. STOP — PO Clarifications Required Before We Code

The following gaps are blockers because the chosen answer changes the implementation materially. Please answer these before we proceed to Phase 2.

| Gap | Question | Why we can't guess |
| --- | --- | --- |
| **G-03** | User deletion: soft-delete (preserve FK + label as "Deleted user" in chat/logs) **or** hard-delete (rewrite history)? | NFR-COMP-01 mentions renaming chat senders to "Deleted user" — implies soft-delete by intent, but FR-02.6 says "hard delete". These contradict. |
| **G-04** | Candidate deletion when interviews/training logs/transactions exist: **cascade** (delete children), **block** (refuse with error), or **soft-delete** (`isArchived: true` flag)? Same question for Accounts with transactions. | Affects FR-05.10 / FR-15.4 / FR-12.x. Touches finance integrity. |
| **G-05** | Payroll re-run for the same month: **block** (one run per month), **flag** (`isReRun: true`), or **allow** (bonus/correction run)? | FR-17.x. Affects accounting reports & transaction generation. |
| **G-10** | Activity-log retention: keep **N months** (suggest 12), or never delete? Soft-archive to cold collection or hard delete? | NFR-MAINT-03. Need a number or a "no auto-delete" decision. |
| **G-12** | `modules: string[]` on User vs `role`: deprecate `modules`, or have `modules` grant access when the master-only gate is not required? | FR-02.x / FR-15 / FR-22. Affects every permission check. |
| **G-13** | Timezone strategy: single-timezone (IST forever, ignore others) **or** multi-tz (store UTC, user-preference TZ at render)? | Affects every screen showing a date. Multi-tz is ~3 days of work; single-tz is ~2 hours of documentation. |
| **G-16** | Bulk-question upload was added on `/training/interview-questions` (Question Bank). PO originally said "curriculum manager page". **Confirm correct interpretation.** Also: is bulk upload wanted on the Curriculum page (training topics)? | FR-09 / FR-13. Affects whether to add a second upload UI. |
| **G-18** | Production email: the SRS appendix already documents the **Google Apps Script bridge** as the chosen mechanism, and you previously said "no billing". The original instructions for this audit mention "SendGrid / SES / Postmark" which all require billing. **Confirm: keep GAS in prod, just wire up the env vars?** Or are you now open to a paid provider? | FR-21.x. Affects deploy steps and recurring costs. |

There are also lower-priority PO questions (G-08 quota warnings, G-09 captcha-or-not, G-11 resume storage cost, G-14 direct merge, G-15 master badge, G-17 call history, G-19 first-call hint, G-20 app-level encryption) — these are listed in §3 with proposed defaults, and we will implement the defaults unless you object.

---

## 1. Discovery Summary

| Area | Finding | Source |
| --- | --- | --- |
| Auth | Plain-text passwords compared with `===`. Hardcoded `ThiruPriya@13` in `DEFAULT_ADMIN`. | [context/AppContext.tsx:153-157](context/AppContext.tsx#L153-L157), [context/AppContext.tsx:344-354](context/AppContext.tsx#L344-L354) |
| Master gate | `username === 'thirumalreddy@sprtechforge.com'` is repeated **6+ times** across files. | [App.tsx:65](App.tsx#L65), [components/Layout.tsx:139](components/Layout.tsx#L139), [pages/Dashboard.tsx:18](pages/Dashboard.tsx#L18), [pages/admin/ActivityLogs.tsx:12](pages/admin/ActivityLogs.tsx#L12), [pages/admin/AddUser.tsx:25-26](pages/admin/AddUser.tsx#L25-L26), [pages/candidates/AddCandidate.tsx:10](pages/candidates/AddCandidate.tsx#L10), [pages/chat/Chat.tsx:230](pages/chat/Chat.tsx#L230) |
| Firestore rules | **No `firestore.rules` file in the repo.** `firebase.json` only has hosting. Production/QA rules are configured by hand in the Firebase Console — and per §12 are currently `allow read, write: if true`. | [firebase.json](firebase.json) |
| Audit logging | `logActivity` is called on **success** (login, create, update, delete) but never on **failure** (failed login, denied permission). | [context/AppContext.tsx:215-228](context/AppContext.tsx#L215), [context/AppContext.tsx:344-354](context/AppContext.tsx#L344-L354) |
| Test framework | **None installed.** Root `package.json` has no test runner, no Vitest, no Jest, no Playwright. `testing/03-automation-plan.md` describes Playwright but the deps are not added. | [package.json](package.json) |
| Validation | Ad-hoc per form. No shared schema layer (no Zod / Yup / Joi). | spread across `pages/**/*.tsx` |
| Env vars | `VITE_FIREBASE_*` injected at build time, but **fallback hardcodes production config** so a local dev or misconfigured CI build will point at prod by accident. | [services/cloud.ts:54-64](services/cloud.ts#L54-L64) |
| No `.env.example` | Setup is documented in `SETUP-ENVIRONMENTS.md`/`SETUP-EMAIL.md` prose, but there is no template file for devs to copy. | (file does not exist) |

Total source files in scope: **49** (excluding `node_modules`, `testing/generator/data/*`). Estimated full audit time: 1 working day for the read-only pass.

---

## 2. Severity Classification

| Severity | Definition | Gaps |
| --- | --- | --- |
| **P0** | Production blocker / security weakness exposed in prod today | G-01, G-02, G-06, G-07 |
| **P1** | Compliance / data-integrity / high-visibility | G-03, G-04, G-05, G-13, G-18 |
| **P2** | Quality-of-life / scale risks | G-08, G-09, G-10, G-11, G-12, G-15, G-17 |
| **P3** | Nice-to-have polish | G-14, G-16, G-19, G-20 |

Order of execution: **P0 → P1 → P2 → P3**, but P1 items that need PO clarification (§0) are deferred until you've answered. We will start on P0 immediately after plan approval.

---

## 3. Gap-by-Gap Remediation

### G-01 — Plain-text passwords (P0)

**Approach.** Migrate to **bcrypt** (cost factor 10) via [`bcryptjs`](https://github.com/dcodeIO/bcrypt.js) — a pure-JS bcrypt implementation that runs in the browser with no native binary, no Cloud Function, no billing. Argon2id would be stronger but requires WASM and a measurable bundle hit; bcrypt at cost 10 + 6-char min password is OWASP-acceptable for the threat model here (client-side hashing before Firestore write, against the risk of Firestore exfiltration).

**Pattern borrowed from:** Firebase Auth's own client-side flows store hashed credentials; Auth0's "Password Migration" feature uses bcrypt under the hood with the same lazy-on-next-login strategy proposed below.

**Implementation:**

1. Add `bcryptjs` to `package.json`.
2. New helper module [`services/passwordHash.ts`](services/passwordHash.ts) exporting `hash(plain): Promise<string>` and `verify(plain, stored): Promise<boolean>`. `verify` recognises both bcrypt hashes (start with `$2a$` / `$2b$`) and **plain-text legacy values** (fallback compare).
3. `login()` in [context/AppContext.tsx](context/AppContext.tsx): use `verify`. If the stored value was plain-text and matched, **rehash and persist** before returning — this is the lazy migration window.
4. `addUser` / `updateUser` / "first-login password change" flow: hash before write. Never log the plaintext.
5. Remove the hardcoded `'ThiruPriya@13'` plain-text from `DEFAULT_ADMIN` — replace with the pre-computed bcrypt hash, embedded as a constant. The plaintext is still `ThiruPriya@13` for bootstrap-login, but the source no longer contains it in cleartext. (Note: anyone with repo access can still find the password in commit history — this is acknowledged as a residual risk and tracked under G-06.)
6. One-time migration script: `scripts/migrate-passwords.mjs` reads `users` from Firestore, hashes any plain-text passwords, writes back. Idempotent (skips already-hashed entries). Run manually once per environment after deploy.

**Affected files:** `package.json`, `services/passwordHash.ts` (new), `context/AppContext.tsx`, `pages/Login.tsx` (no behaviour change, but verify password-change flow hashes), `types.ts` (`password` comment update), `scripts/migrate-passwords.mjs` (new).

**FR impact:** FR-01.1, FR-01.2, FR-01.4, FR-01.9, NFR-SEC-01, NFR-SEC-05.

**Test scenarios:** TS-01.1 (login success), TS-01.2 (login wrong password), TS-01.4 (first-time password change), new TS-01.12 (legacy plain-text user can still log in once, password gets rehashed).

**Risks:** Legacy users with plain-text passwords; mitigation = lazy migration on login + one-time migration script. Bcrypt at cost 10 = ~80ms on a modern laptop — imperceptible.

**Rollback:** Revert the commits; the `verify` helper accepts plain-text too, so a downgrade is non-destructive (already-hashed users would fail to log in until the helper is reintroduced — so rollback requires keeping the helper installed even if the call site reverts). Document this in the commit message.

---

### G-02 — Wide-open Firestore rules (P0)

**Approach.** Create [`firestore.rules`](firestore.rules) at repo root, write least-privilege per-collection rules, register it in [`firebase.json`](firebase.json), and add a Firestore-emulator test using `@firebase/rules-unit-testing`. Deployed via `firebase deploy --only firestore:rules` in the existing CI workflow.

**Pattern borrowed from:** Firebase's [official sample rules](https://firebase.google.com/docs/firestore/security/rules-conditions), plus Notion's role-table pattern (centralised role check function `isAdmin(uid)`).

**Rules outline (per collection):**

| Collection | Read | Write | Notes |
| --- | --- | --- | --- |
| `users` | self (own doc) + admins | admins only | NFR-COMP-01 |
| `candidates` | authenticated | staff + admin | FR-05 |
| `transactions`, `accounts`, `payroll*` | master only | master only | FR-15/16/17 |
| `chats`, `chatMessages` | participants only | participants only (own messages) | FR-18.4 |
| `meetings` | invitees + organiser | organiser; invitees can update only own RSVP | FR-19.x |
| `callInvitations` | caller + callee | participants only | FR-20.x |
| `activityLogs` | master only | server-only (allowed from any signed-in client `create`, but `update`/`delete` denied — append-only) | FR-22.x |
| `passwordResetRequests` | admins | unauthenticated `create` (so logged-out users can submit); admin `update` to mark resolved | FR-01.10 |
| `webLeads` | admins | unauthenticated `create` with rate-limit metadata; admin `update`/`delete` | FR-08.9, G-09 |
| `system_check`, etc. | block by default | block by default | safety |

`isAdmin` / `isMaster` will be implemented via a Firestore document lookup against the user's own `users/{uid}` doc, **not** a custom claim** — because we are NOT migrating to Firebase Auth (out of scope per G-01 plan). The "uid" used in rules will be the user's email-derived ID once we sign the user into anonymous auth at app start (free tier). If you prefer not to use anonymous-auth, see PO question note below.

> **PO sub-question (G-02a):** Are you OK with us flipping on Firebase Anonymous Auth so we can scope rules per-user? It is free, requires no UI change beyond a `signInAnonymously()` call at app start, and gives us `request.auth.uid`. The alternative is to keep rules at the level of "any signed-in user with a known role document" which is weaker.

**Affected files:** `firestore.rules` (new), `firebase.json` (add `firestore` block), `.github/workflows/deploy.yml` + `deploy-qa.yml` (add `firestore:rules` to deploy targets), `services/cloud.ts` (optional anonymous-auth init), `tests/firestore-rules.test.ts` (new).

**FR impact:** NFR-SEC-02, NFR-SEC-03, FR-15.x (master gate), FR-22.x.

**Test scenarios:** TS-02.x — new emulator-based tests covering each collection's allow/deny matrix. Targets: `npm run test:rules`.

**Risks:** Wrong rule = legitimate user can't read their data. Mitigated by emulator tests in CI before deploy.

**Rollback:** Re-deploy a previous rules version (`firebase deploy --only firestore:rules` against the prior file). Keep the prior file in git history.

---

### G-06 — Hardcoded master identity (P0)

**Approach.** Replace **every** `user.username === 'thirumalreddy@sprtechforge.com'` check with `isMaster(user)` which reads a boolean `isMaster?: boolean` flag on the User record. Migrate the existing master account to set `isMaster: true` on first load (one-time, idempotent).

**Pattern borrowed from:** GitHub's `is_admin` flag on organisation membership records.

**Implementation:**

1. Add `isMaster?: boolean` to [types.ts](types.ts).
2. New helper [`utils.ts`](utils.ts) → `export function isMaster(u?: User | null): boolean { return !!u?.isMaster; }`.
3. **Replace 6+ call sites** identified above (`App.tsx`, `Layout.tsx`, `Dashboard.tsx`, `ActivityLogs.tsx`, `AddCandidate.tsx`, `AddUser.tsx`, `Chat.tsx`).
4. In `DEFAULT_ADMIN`: set `isMaster: true`.
5. On app start, if the `users` collection contains a user with username `thirumalreddy@sprtechforge.com` and `isMaster !== true`, patch it. One-time, logged to activity.

**Affected files:** `types.ts`, `utils.ts`, `context/AppContext.tsx`, `App.tsx`, `components/Layout.tsx`, `pages/Dashboard.tsx`, `pages/admin/ActivityLogs.tsx`, `pages/admin/AddUser.tsx`, `pages/candidates/AddCandidate.tsx`, `pages/chat/Chat.tsx`.

**FR impact:** FR-01.3, BR-01.1, FR-15.x (master-only routes), FR-22.x.

**Test scenarios:** TS-01.10 (new) — change the master to a different user record via Firestore, log in, confirm Finance group appears.

**Risks:** A user with `isMaster: true` set by accident gets full access. Mitigation: only the current master can edit other users (existing rule); we also gate "edit isMaster flag" UI behind master-only.

**Rollback:** Revert commit. The `isMaster` field on Firestore docs is benign if unused.

---

### G-07 — Failed-login logging + rate limit (P0)

**Approach.** When `login()` returns `{ success: false }`, write a structured record to a new `auditLogs` collection (separate from `activityLogs` which is user-facing). Add a simple in-browser rate limit (5 failed attempts per username per 15 minutes via `localStorage`), with a "try again in N minutes" toast. Cannot do server-side rate limiting without Cloud Functions = no billing constraint.

**Pattern borrowed from:** Stripe's event log structure (`{type, created, request_id, payload}`); rate limit pattern is from GitHub's "wait X minutes" lockout but client-side.

**Implementation:**

1. New `auditLog` type in [types.ts](types.ts):
   ```ts
   interface AuditLog { id, timestamp, eventType: 'LOGIN_FAILED' | 'PERMISSION_DENIED' | ..., username?, userAgent, payload?, reason? }
   ```
2. New helper `auditLog(event)` in [context/AppContext.tsx](context/AppContext.tsx) that writes to Firestore `auditLogs` collection. No IP capture (impossible client-side without an external service).
3. `login()` calls `auditLog({ eventType: 'LOGIN_FAILED', username: u, reason: 'invalid_credentials' })` on failure.
4. Rate-limit helper `checkLoginRateLimit(username)` reads/writes `localStorage["spr_login_attempts_<username>"]` with `{ count, firstAttemptAt }`. After 5 failures in 15 min, return `{ blocked: true, retryAfterSec: N }`.

**Affected files:** `types.ts`, `context/AppContext.tsx`, `pages/Login.tsx`, `firestore.rules` (allow `auditLogs` create by anyone; read by master only).

**FR impact:** FR-01.2 (login fail), NFR-SEC (new), FR-22.x (activity log adjacent — these are kept separate to preserve NFR-MAINT-03's "single source of truth for actor attribution" semantics; auditLogs are for security events, activityLogs are for business events).

**Test scenarios:** TS-01.2 (existing) + new TS-01.11 (lockout after 5 attempts).

**Risks:** Client-side rate-limit is bypassable by clearing localStorage — acknowledged. The Firestore `auditLogs` entries remain regardless and a master can spot the abuse.

**Rollback:** Revert commit. `auditLogs` Firestore collection can be left in place.

---

### G-13 — Timezone handling (P1)

**Two paths — see PO question §0.**

**Path A (single-tz, recommended for current scope):** Document that all dates are stored & displayed as IST. Add a `formatDate(iso)` helper that always renders `Asia/Kolkata`. Replace ad-hoc `new Date(x).toLocaleString()` calls with this helper to ensure consistency. ~2 hours.

**Path B (multi-tz):** Store all timestamps as UTC ISO strings (already true). Add `tz?: string` (IANA name) preference on `User`. Settings page lets user pick. Add `formatDate(iso, userTz)` helper. Replace all date-display sites. Audit ~40 call sites. ~3 days.

**Recommendation:** Path A. The app is single-org, single-country today. If we go multi-org later, Path B is additive.

---

### G-18 — Production email (P1)

**Two paths — see PO question §0.**

**Path A (GAS, free, recommended):** Wire `VITE_EMAIL_GAS_URL` + `VITE_EMAIL_SHARED_SECRET` into production GitHub Secrets. Follow the existing [SETUP-EMAIL.md](SETUP-EMAIL.md) for setup. Add a deploy-time check that the env vars are non-empty in prod builds (build fails if missing). ~1 hour + GAS deployment.

**Path B (paid provider — SendGrid/SES/Postmark):** Requires billing. Per your prior "no billing" instruction, **we will not implement this unless you reverse the constraint.**

**Recommendation:** Path A. Add retry-with-backoff in `services/emailService.ts` (currently single-shot, no retry) — that part is independent of provider choice.

---

### G-03 — User soft/hard delete (P1, **needs PO answer**)

If PO says **soft**: add `deletedAt: string | null` to User; deletion sets the field, doesn't remove the doc. UI list filters out `deletedAt != null`. Master can see "Deleted users" via filter. Chat sender lookups render "(deleted)" badge if `deletedAt`. ~1 day. **Recommended.**

If PO says **hard**: keep current behaviour; add a chat-message-history rewrite step that replaces `senderName` with "Deleted user" and removes any user-doc references. ~½ day.

---

### G-04 — Cascade vs block (P1, **needs PO answer**)

Likely decision matrix once you answer:

| Parent | Child collections | Recommended |
| --- | --- | --- |
| Candidate | interviews, training logs, candidate-profile, transactions | **Soft-delete (`isArchived`)** to preserve financial trail |
| Account | transactions | **Block** if transactions exist (finance integrity) |
| TrainingModule | trainingTopics | **Cascade** (topics meaningless without parent module) |
| Meeting | participants | **Cascade** |
| Chat | chatMessages | **Cascade** |

---

### G-05 — Payroll re-run (P1, **needs PO answer**)

Likely: **flag as `isReRun: true`** with prompt "A payroll for May 2026 already exists. Re-run as a correction?". Generates new transactions; original kept for audit. ~½ day.

---

### G-08 — Quota warnings (P2)

Add visual warning banners:
- Email page: warn at ≥80 sent today, block at 100.
- Chat: warn if upload would exceed 5GB Storage quota (estimated client-side via running total).

~½ day. **Will implement default unless PO objects.**

---

### G-09 — Web Lead throttling (P2)

Add honeypot field + client-side rate limit (1 submission per fingerprint per 60s). No CAPTCHA — Google reCAPTCHA v3 free tier has changed; v2 requires Google sign-in for admin. Use **localStorage + honeypot** which is enough to block 95% of bots.

Affected: [pages/LandingPage.tsx](pages/LandingPage.tsx), `firestore.rules` (reject `webLeads` writes more than 1/min/IP via document-content rate-limit; emulator-tested).

~½ day. **Will implement default unless PO objects.**

---

### G-10 — Activity-log retention (P2, **needs PO answer**)

If "12 months": add `cleanupOldActivityLogs()` helper invoked once per day on master login (no scheduled function available). Deletes logs older than 12 months in 500-doc batches.

---

### G-11 — Resume storage (P2)

Migration: when candidate doc is loaded, if `resume` is a base64 string longer than 200KB, upload to Firebase Storage at `candidates/{id}/resume.{ext}`, update doc to `resumeUrl: <storageUrl>`, drop `resume` field. Lazy migration on next view. ~1 day. **Will implement default unless PO objects.**

---

### G-12 — modules vs role (P2, **needs PO answer**)

Recommend: keep `role` as the primary gate, `modules` becomes "extra capabilities a staff user can be granted" (e.g., a staff user with `modules: ['finance:read']` can VIEW finance but not write). Master overrides everything. Will write the matrix as a table in `utils/permissions.ts`.

---

### G-14 — Web Lead → Candidate direct merge (P3)

Add "Convert to Candidate" button on Web Lead row. Pre-fills [AddCandidate.tsx](pages/candidates/AddCandidate.tsx). ~2 hours. **Will implement default unless PO objects.**

---

### G-15 — Master visual indicator (P3)

Add a small badge ("Director" / shield icon) in the sidebar header when `isMaster(user)`. ~30 min. **Will implement default unless PO objects.**

---

### G-17 — Call history page (P3)

Add `/spconnect/calls` route showing the user's `callInvitations` history with status badges. ~3 hours. **Will implement default unless PO objects.**

---

### G-19 — Jitsi first-call hint (P3)

One-time dismissible modal on first call invitation that explains "Jitsi will ask you to sign in with Google the first time per browser session — this is normal." Persists dismissal in `localStorage["spr_jitsi_hint_seen"]`. ~1 hour. **Will implement default unless PO objects.**

---

### G-20 — App-level encryption at rest (P3)

Recommend **accept current state** — Firestore is encrypted at rest by Google. Application-level encryption requires a key-management story (KMS = billing) and complicates search/index. Document in SRS as accepted residual risk.

---

## 4. Cross-Cutting Phase-4 Enhancements

These are independent of any specific gap but improve the overall code health. Implemented after P0/P1 unless they directly support a gap fix.

| # | Item | Approach | Files |
| --- | --- | --- | --- |
| C-01 | **Centralised validation** | Add `zod` as a dep. New `schemas/` folder with one schema per entity (`userSchema`, `candidateSchema`, ...). Replace inline form validation with `schema.safeParse(formData)`. | new `schemas/*.ts`, all `pages/**` form components |
| C-02 | **Consistent error format** | New `utils/result.ts` with `Result<T, E>` type + helpers. Replace ad-hoc `{ success, message }` shapes. Keep public API of `login()` to avoid breaking — internal helpers adopt `Result`. | `utils/result.ts` (new), `context/AppContext.tsx`, `services/*` |
| C-03 | **Structured logging w/ correlation IDs** | New `services/logger.ts`. Every user action gets a UUID; all `console.*` calls switch to `logger.info(actionId, ...)`. In prod, logger is a no-op for `info`; in dev/QA it writes to console. | `services/logger.ts` (new), all `services/*`, `context/AppContext.tsx` |
| C-04 | **`.env.example`** | One template documenting every `VITE_*` var the app reads, with comments and sample values. Update `README.md` to reference it. | `.env.example` (new), `README.md` |
| C-05 | **Remove hardcoded prod fallback in `cloud.ts`** | If `VITE_FIREBASE_*` is missing, **fail loud** in dev (banner) and abort the build in CI. Removes the silent "oops, pointing local dev at prod" trap. | `services/cloud.ts`, both CI workflows |
| C-06 | **Test framework** | Install `vitest` + `@firebase/rules-unit-testing` + `@testing-library/react`. Add `npm test` script. Wire to CI. No Playwright yet (out of scope; the existing automation plan covers it later). | `package.json`, `vite.config.ts`, `tsconfig.json`, `tests/setup.ts` |
| C-07 | **Update README** | Setup, env vars, deploy steps, migration steps, SRS link, gap-status link. | `README.md` |
| C-08 | **Lint config (optional)** | Add ESLint with `eslint-plugin-react`, `eslint-plugin-react-hooks`. Currently `npm run build` only runs `tsc`. ESLint catches a different class of bugs. | `package.json`, `.eslintrc.cjs` (new) |

---

## 5. Order of Execution

```
SPRINT A — P0 fixes (no PO blockers) — APPROVED ORDER
  G-06 (hardcoded master)            [½ day] ← in progress
  C-04 .env.example                   [½ hour]
  C-05 remove prod fallback           [1 hour]
  C-06 install Vitest + test setup    [2 hours]
  C-01 zod schemas (PULLED FORWARD)   [½ day]   — tested from day one
  G-01 password hashing               [1 day]
  G-07 events collection + rate limit [½ day]
  G-02 Firestore rules                [1 day]
  POST-DEPLOY: master password rotation per RUNBOOK §2.2 (mandatory)
                                      total ~4 days

PO REVIEW POINT — answer §0 questions

SPRINT B — P1 fixes
  G-13 timezone (path TBD)
  G-18 email production wiring
  G-03 user delete (TBD)
  G-04 cascade strategy (TBD)
  G-05 payroll re-run (TBD)

SPRINT C — P2 polish
  G-08, G-09, G-10, G-11, G-12, plus C-01/C-02/C-03 cross-cutting

SPRINT D — P3 polish
  G-14, G-15, G-17, G-19, G-20 (documentation)
  C-07, C-08
```

Each gap = one logical commit, message format `fix(G-NN): <one-line summary>`. No mega-commits. Push after every commit; you can pull and verify in QA before we move on.

---

## 6. Risk Assessment & Rollback Strategy

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Password migration locks out users | Low | High | Dual-format `verify()` accepts plain-text legacy + bcrypt; lazy migration on login |
| Firestore rules block legitimate reads | Med | High | Emulator-test every rule before deploy; soak in QA for 24h before prod merge |
| `isMaster` field missing on existing master record | Low | High | App-startup auto-patch (one-time, idempotent) |
| Bundle size grows | Med | Low | bcryptjs ~13KB gzipped; zod ~12KB gzipped; combined < 30KB |
| Build fails in CI after `cloud.ts` change | Med | Med | Test in QA workflow first; both prod & QA pipelines already require explicit env vars |

**Global rollback:** every commit is independent and revertable. The Firestore rules and `auditLogs` collection are additive — leaving them in place after a code rollback is harmless.

---

## 7. Final Deliverables (end-of-Phase-5)

- [ ] `REMEDIATION_PLAN.md` (this file)
- [ ] `CODE_REVIEW_FINDINGS.md` (Phase 2)
- [ ] Source-code changes (Phases 3 & 4)
- [ ] `SRS_BRS_Document.md` revisions (revision-history entry per behaviour change)
- [ ] `Traceability_Matrix.md` (extracted from SRS §11 + augmented with new files & test IDs)
- [ ] `REMEDIATION_REPORT.md` (Phase 5)
- [ ] Passing `npm test` + `npm run build` in CI

---

## 8. Confirmation Required

Please confirm one of:

**A.** "Proceed with Sprint A — defer §0 questions to before Sprint B." (Recommended — gets P0 fixes shipping fastest.)
**B.** "Answer §0 first, then proceed."
**C.** "I want to discuss the plan before approving."

And please also answer:

- **PO Q1 (G-02a):** OK to enable Firebase Anonymous Auth so we can scope Firestore rules per-user?
- **PO Q2 (G-13):** Path A (single-tz IST) or Path B (multi-tz)?
- **PO Q3 (G-18):** Confirm GAS stays in prod (no paid provider)?
- **PO Q4 (Sprint C/D defaults):** OK with proposed defaults for G-08, G-09, G-11, G-14, G-15, G-17, G-19, G-20, or do you want to discuss any of them?

— End of Plan —

# Code Review Findings

Running log of issues identified during the Sprint-A audit & remediation work. Severity matches the labels in [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md) §2. Entries are appended as we go and reference the commit that addresses them.

---

## Residual Risks Accepted by PO (Sprint A)

The following items have been considered and **deliberately deferred or accepted** by the product owner. Recorded here so they are not relitigated in later phases.

| # | Risk | Mitigation in place | Why accepted |
| --- | --- | --- | --- |
| RR-01 | The bootstrap admin plaintext password `ThiruPriya@13` exists in git history forever. | Post-deploy password rotation step in [RUNBOOK.md](RUNBOOK.md) — the master logs in once after G-01 ships, changes the password via the in-app flow, and the source-tree value becomes stale & inert. | Cannot rewrite history without invalidating contributor SHAs and breaking trust in older review links. |
| RR-02 | Client-side rate limits (login attempts via `localStorage`, web-lead throttling via fingerprint) are bypassable by determined attackers. | Firestore audit trail (`events` collection) captures every failed attempt regardless of client-side enforcement. Master can detect and block via rules update. | Threat model is "casual abuse + script kiddies", not a targeted actor. Bypassing the client doesn't unlock new attack surface — the server-side rules (G-02) still gate every write. |
| RR-03 | Bundle size grows by ~30 KB gzip (`bcryptjs` + `zod`). | None — accepted as cost of correctness. | A 30 KB add on a 272 KB main bundle is < 12% and well under typical first-paint budgets. |
| RR-04 | G-20 (application-level encryption at rest) is deferred indefinitely. | Firestore's built-in encryption-at-rest by Google KMS remains in effect. | App-level encryption requires a key-management story (KMS = billing) and complicates search/index. No regulatory driver for the current data class. |

---

## G-07 Collection Design — Single Collection

**Decision: one `events` collection with a `category: 'security' | 'business'` discriminator field.** Approved 2026-05-17.

Rationale (verbatim from the approved confirmation):

1. Firestore rules can branch on `resource.data.category`, so the access-control split (security = master-only read; business = own-user or master read) is one rule block, not two.
2. One retention policy file, one cleanup cron path, one index list. Two of everything is real cost.
3. Cross-correlation queries ("show me everything user X did over period Y, security and business interleaved") become a single query with a `where category in [...]` predicate — extremely useful for incident response, awkward across two collections.
4. The split cost (every query must filter by category) is trivial and indexable.

---

## Conditional Mitigations

Pre-decided fallbacks that activate when a measurable threshold is crossed. Documented up front so we don't relitigate them in the moment.

### CM-01 — Anonymous-Auth rule-evaluation read pressure

**Trigger:** QA telemetry or production observation shows Firestore rule-evaluation reads sustained at > **30,000/day** over a **7-day rolling window**.

**Action:** Immediately strip the `isMaster` document-lookup (`get(/databases/.../users/{request.auth.uid}).data.isMaster`) from non-security rules. Concretely, retain the strict server-side role check only on:

- `transactions/*`, `accounts/*`, `payroll*` (finance)
- `users/*` (write paths — admin/master user-management)
- `events/*` (read path for security events; create remains open per append-only design)

For everything else (chats, candidates, meetings, etc.), rely on `request.auth != null` (any signed-in user) at the Firestore layer and on React route guards (`MasterRoute` / `AdminRoute`) at the UI layer. This is a documented step-down in defence-in-depth; we accept it conditionally because exceeding the free-tier read quota is a worse outage than a marginally weaker rule.

**Affected rule files (once G-02 ships):** `firestore.rules` — rule blocks for `chats`, `chatMessages`, `meetings`, `callInvitations`, `candidates`, `candidateProfiles`, `interviews`, `trainingModules`, `trainingTopics`, `trainingLogs`, `interviewModules`, `interviewQuestions`, `enquiries`, `webLeads`, `interviewPrepSessions`, `passwordResetRequests`. Finance + users + events rule blocks are NOT touched.

**Long-term proper fix:** custom-claims-on-token via Cloud Functions, out of scope for Sprint A under the no-billing constraint. Will be revisited if/when billing is approved.

**Owner of monitoring:** Master, manually for now via the QA Firestore usage dashboard. A future enhancement could surface this as an in-app health metric.

---

## Findings by Severity

### P0 — In progress / closed this sprint

#### F-001 — G-06 — Hardcoded master username spread across 10 source files

- **Severity:** P0
- **Files (closed by this finding):**
  - [App.tsx](App.tsx) — `MasterRoute` predicate
  - [components/Layout.tsx](components/Layout.tsx) — sidebar branching
  - [pages/Dashboard.tsx](pages/Dashboard.tsx) — `isSuperAdmin`
  - [pages/admin/ActivityLogs.tsx](pages/admin/ActivityLogs.tsx) — `isSuperUser`
  - [pages/admin/AddUser.tsx](pages/admin/AddUser.tsx) — `isEditingMasterAdmin` + `isCurrentUserMasterAdmin`; also fixed unrelated bug where `isMaster` was being dropped on user edit
  - [pages/admin/UserList.tsx](pages/admin/UserList.tsx) — `isSuperUser` + 2 row-level checks (also closes a subtle bug: previous OR-fallback to `id === 'admin-01'` would have treated a maliciously created homonym record as super-user; new check requires the explicit flag)
  - [pages/candidates/AddCandidate.tsx](pages/candidates/AddCandidate.tsx) — `isMaster`
  - [pages/candidates/CandidateList.tsx](pages/candidates/CandidateList.tsx) — `isMaster`
  - [pages/candidates/Enquiry.tsx](pages/candidates/Enquiry.tsx) — `isMaster`
  - [pages/chat/Chat.tsx](pages/chat/Chat.tsx) — `canPostInActive` announcement gate
  - [pages/meetings/Meetings.tsx](pages/meetings/Meetings.tsx) — `isMaster`
  - [pages/training/Interviews.tsx](pages/training/Interviews.tsx) — `isMaster`
  - [pages/training/InterviewPrepModule.tsx](pages/training/InterviewPrepModule.tsx) — `isAdmin` (master fallback inside the OR)
- **Resolution:** Single helper `isMasterUser(user)` in [utils.ts](utils.ts) reading `user.isMaster === true`. The bootstrap admin record now carries `isMaster: true`; a startup auto-patch reconciles existing Firestore records (logging to the `events` collection as `BOOTSTRAP_ISMASTER_PATCH`). The string constant `MASTER_BOOTSTRAP_USERNAME` is retained in one location ([context/AppContext.tsx](context/AppContext.tsx)) solely for the auto-patch matcher and is no longer used for any authorization decision.
- **FR impact:** FR-01.3, BR-01.1, all `MasterRoute`-gated routes (FR-15.x, FR-22.x, FR-24.x, FR-23.x).
- **Test scenarios:** TS-01.10 — change the master flag to a different user record via Firestore, log in as them, confirm Finance group + Activity Logs become available. Existing TS-01.1 (login success) must still pass for the bootstrap admin.
- **Status:** Code complete; manual smoke pending before commit.

#### F-002 — `AddUser.handleSubmit` dropped `isMaster` flag on save (discovered during G-06)

- **Severity:** P0
- **Where:** [pages/admin/AddUser.tsx](pages/admin/AddUser.tsx) `handleSubmit`
- **Symptom:** Pre-G-06 there was no `isMaster` field, so this was latent. Once G-06 introduced the field, editing the master user via the Admin → Users → Edit screen would have rebuilt the `User` object without the flag, persisted it, and silently demoted the master at the next snapshot.
- **Resolution:** Added `isMaster: form.isMaster` to the constructed `userData`. The UI never grants or revokes the flag; future "transfer master role" UI will land separately.
- **Status:** Closed in the same G-06 commit.

---

### P1 / P2 / P3 — Open

To be populated as we work through Sprints B / C / D. Format will mirror the P0 entries above.

---

## Untracked Observations

Items noticed during the code walk that are NOT current-sprint scope but should not be lost.

- **O-01 — Deprecated `String.prototype.substr` in `utils.generateId`.** Trivial — replace with `slice(2, 11)` when next touching the file. TypeScript hint only.
- **O-02 — Bundle warning at 1,091 KB main chunk.** Vite suggests `manualChunks` or dynamic imports. Out of scope for Sprint A but worth a P3 ticket later; the `xlsx` chunk is already lazy-loaded.
- **O-03 — Unused import hints in `Layout.tsx`** (`Button`, unused param `e`, unused `candidates`). Pre-existing; not Sprint A scope.
- **O-04 — Unused type imports in `AppContext.tsx`** (`WebLeadStatus`, `MeetingType`). Will clean up incidentally as later gaps touch the file.

# 04 — Agile Process

Conventions everyone on the team uses, so a "P1" or "Done" means the same thing no matter who said it.

---

## Sprint cadence

Two-week sprints, Monday → Friday of week 2.

```
Mon W1   Tue W1   Wed W1   Thu W1   Fri W1   Mon W2   Tue W2   Wed W2   Thu W2   Fri W2
─────────────────────────────────────────────────────────────────────────────────────────
Planning Design   Design   Execute  Execute  Execute  Execute  Execute  Execute  Demo+Retro
                                                                                  Plan next
```

Daily standup is 15 minutes max, async on Slack/Teams is fine. Format:

```
Yesterday: SPR-024 done, started SPR-025
Today: finish SPR-025, file bugs found
Blockers: none / waiting on BUG-018 fix
```

---

## Definition of Ready (a story is ready for a sprint when…)

- [ ] Story has a clear title (`As a <role>, I want <action> so that <outcome>`).
- [ ] Acceptance criteria are written and unambiguous.
- [ ] Effort is estimated (1, 2, 3, 5, 8 — Fibonacci).
- [ ] Priority is set (P0, P1, P2, P3).
- [ ] Dependencies (if any) are linked or resolved.
- [ ] The owning tester knows what test data they need.

If any item is missing, the story stays in **Backlog** until grooming addresses it.

## Definition of Done (a story is done when…)

- [ ] All test cases under the story have been executed.
- [ ] Test cases that failed have a corresponding bug filed in `04-bug-tracker.csv`.
- [ ] All P0/P1 bugs against the story are fixed and verified (re-tested by the same tester).
- [ ] Test execution rows in `05-test-execution.csv` are filled in (Pass/Fail/Blocked, never "Not Run" on a done story).
- [ ] Story status in `01-user-stories.csv` is updated to **Done**.
- [ ] If automation is in scope for the story, the automated test exists, is green in CI, and is recorded in `07-automation-coverage.csv`.

A story with open P2/P3 bugs can still be marked Done; the bugs stay in the tracker for the next sprint to handle.

---

## Story-status workflow

```
Backlog → Sprint → In Design → In Test → Blocked → Done
                                      ↓
                                   Failed (sent back to dev)
                                      ↓
                                  In Test (rerun)
```

| Status         | Meaning                                                      |
| -------------- | ------------------------------------------------------------ |
| **Backlog**    | Identified but not in a sprint yet                           |
| **Sprint**     | Committed to the current sprint, not started                 |
| **In Design**  | Tester is writing test cases for it                          |
| **In Test**    | Test cases are being executed                                |
| **Blocked**    | Cannot proceed (waiting on dev, env, or data)                |
| **Failed**     | Test cases failed; bug filed; awaiting dev fix               |
| **Done**       | All DoD checks met                                           |

---

## Bug severity vs priority

These are independent dimensions. Don't mix them up.

### Severity — how bad is it technically?

| Sev          | Definition                                                          |
| ------------ | ------------------------------------------------------------------- |
| **Critical** | Crash, data loss, security hole, blocks all testing or all users    |
| **High**     | Major feature broken, no workaround                                 |
| **Medium**   | Feature broken but workaround exists, or minor feature totally broken |
| **Low**      | Cosmetic, typo, slight UX nit                                       |

### Priority — when do we fix it?

| Pri    | SLA (when must dev fix)                                          |
| ------ | ---------------------------------------------------------------- |
| **P0** | This sprint, before anything else. Stops the train.              |
| **P1** | This sprint. Must be fixed before sprint end.                    |
| **P2** | Next sprint at the latest.                                       |
| **P3** | Backlog. Will be fixed when there's slack.                       |

A typical mapping (use judgment, don't follow blindly):

| Severity   | Default Priority |
| ---------- | ---------------- |
| Critical   | P0               |
| High       | P1               |
| Medium     | P2               |
| Low        | P3               |

Examples where they diverge:
- A typo in the company logo (Low severity, but P1 because it's customer-facing on day of launch).
- A backend retry log entry duplicated (Medium severity, but P3 because no one reads logs).

---

## Bug lifecycle

```
New → Open → In Progress → Fixed → Verified → Closed
                              ↓                  ↑
                           Reopened ←── (still broken)
                              ↓
                          Deferred (won't fix this sprint)
                              ↓
                           Won't Fix (intentional behaviour)
```

| Status         | Who sets it          | Meaning                                                |
| -------------- | -------------------- | ------------------------------------------------------ |
| **New**        | Tester (when filing) | Just raised, not yet triaged                           |
| **Open**       | Lead (after triage)  | Confirmed, accepted, awaiting dev                      |
| **In Progress**| Dev                  | Dev is actively working on it                          |
| **Fixed**      | Dev                  | Dev claims fix is deployed to QA. Tester to verify.    |
| **Verified**   | Tester               | Tester confirms the fix works in QA                    |
| **Closed**     | Lead                 | Verified + closed at sprint end                        |
| **Reopened**   | Tester               | Marked Fixed but it's actually still broken            |
| **Deferred**   | Lead                 | Won't fix this sprint; moved to next sprint's backlog  |
| **Won't Fix**  | Lead                 | Not a bug, or accepted behaviour                       |

A bug must move from **New → Open** within 24 hours (in daily triage). A bug that stays in **Fixed** for more than 48 hours without being verified is a tester miss; lead pings.

---

## Ceremonies

| Ceremony           | Duration | Cadence            | Attendees      | Purpose                                                 |
| ------------------ | -------- | ------------------ | -------------- | ------------------------------------------------------- |
| **Sprint planning**| 60 min   | Mon of week 1      | All team + dev | Pick stories, estimate, commit                          |
| **Daily standup**  | 15 min   | Daily, async       | All testers    | Yesterday / today / blockers                            |
| **Bug triage**     | 15 min   | Daily, after standup | Lead + dev   | New bugs → assigned priority and owner                  |
| **Test design review** | 30 min | Wed of week 1      | Lead + each tester rotates | Lead reviews tester's new test cases, catches gaps |
| **Sprint demo**    | 30 min   | Fri of week 2      | All team + dev + owner | Walk through what was tested; surface findings   |
| **Sprint retro**   | 15 min   | Fri of week 2 (after demo) | All testers | What worked / what didn't / one improvement      |

Total ceremony overhead: ~3 hrs / tester / 2-week sprint = 7.5% overhead. Comfortable.

---

## Estimation

Effort uses Fibonacci numbers as a rough size:

| Points | Meaning                                                       |
| ------ | ------------------------------------------------------------- |
| **1**  | Trivial. Single test case, no setup, <30 min.                 |
| **2**  | Small. 2–4 test cases. Half-day.                              |
| **3**  | Medium. 5–10 test cases, simple flows. One day.               |
| **5**  | Large. 10–20 test cases, real-time / multi-user. 2–3 days.    |
| **8**  | Very large. Probably needs to be split. >3 days.              |
| **13** | **Split it.** Anything 13+ becomes two stories.               |

We measure **velocity** (points completed per tester per sprint) starting Sprint 2 (S0 and S1 are warm-up). After two sprints we'll know each tester's sustainable velocity and plan from there.

---

## Communication norms

- **Bug repro steps** must be specific enough that a fresh person could reproduce in 30 seconds. If you can't write them, attach a Loom recording.
- **Don't comment on bugs in chat.** Comments go in the bug's Comments column so the history lives in one place.
- **Don't move a bug to Verified** without actually re-running the failing scenario. "Looks fixed in passing" doesn't count.
- **Filing dupes is OK.** The lead will mark dupes; never delete a duplicate (history of who hit it is valuable).
- **One bug per row.** If a flow has three issues, file three bugs. They might get assigned to different sprints.

---

## Sprint 0 checklist (week 1, before any real testing)

- [ ] All 4 testers have QA accounts created via Admin → Users
- [ ] Excel workbook is set up in shared drive following README option A
- [ ] Bootstrap admin password rotated and shared securely (don't reuse the public one in source)
- [ ] Shared drive folder exists for screenshots and Looms
- [ ] Standup channel set up (Slack / Teams)
- [ ] Daily bug triage time on every tester's calendar
- [ ] Playwright scaffold + smoke suite committed to repo (see `03-automation-plan.md` S0)
- [ ] CI workflow `e2e.yml` green on `DevelopmentBranch`
- [ ] Lead has read everything in this folder; testers have read this file + README

After this checklist is fully ticked, S1 starts.

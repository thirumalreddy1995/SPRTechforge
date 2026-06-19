# 02 — Test Plan

## Approach

Two-week sprints, working through the application in dependency order: foundation modules first (auth, candidates), then domain features (training, interviews, finance), then SPRConnect (chat → meetings → video → email), then a regression + UAT cycle.

Each sprint follows the same loop:

1. **Plan** (Mon, week 1) — Lead pulls stories from `01-user-stories.csv` into the sprint board. Estimate, assign, commit.
2. **Test design** (Tue–Wed, week 1) — Testers write test cases in `02-test-cases.csv` for their assigned stories.
3. **Execute** (Thu, week 1 → Wed, week 2) — Run test cases manually. Log results in `05-test-execution.csv`. File bugs as you find them in `04-bug-tracker.csv`.
4. **Bug triage** (daily, 15 min standup) — Lead + dev decide what's in-sprint vs deferred.
5. **Demo + retro** (Fri, week 2) — Show what was tested, surface blockers, agree improvements for next sprint.

---

## Test types we'll run

| Type            | When                              | Owner            | How                                              |
| --------------- | --------------------------------- | ---------------- | ------------------------------------------------ |
| **Smoke**       | Every QA deploy (~daily)          | Lead             | 10 critical paths — login, view candidate, schedule meeting, send chat, etc. Will be automated in Sprint 0/1. |
| **Functional**  | Sprint scope tests                | Each tester      | Manual, against stories assigned to them          |
| **Integration** | After each module is done         | Lead + module owner | Cross-module flows (e.g., enquiry → candidate → interview → email) |
| **Regression**  | End of every sprint               | Lead             | Full regression suite — past P0/P1 cases re-run   |
| **UAT**         | After sprint 5                    | Project owner (master) | Owner exercises real workflows; sign-off          |
| **Cross-browser** | Once per sprint                 | Rotates among testers | Same case run on Tier 1 then Tier 2              |
| **Real-time sync** | Once per sprint where applicable | Lead             | Two browsers open as different users; verify Firestore listeners propagate |

We do **not** test: load, perf, security beyond auth checks, accessibility beyond keyboard nav.

---

## Roles and responsibilities

| Person     | Role                                  | Primary epics      | Sprint workload (target stories) |
| ---------- | ------------------------------------- | ------------------ | -------------------------------- |
| Tester 1   | **QA Lead** (also tests)              | E1 (Auth), regression, smoke automation | 6–8 stories      |
| Tester 2   | Functional — Core                     | E2, E3, E4, E5     | 10–12 stories                    |
| Tester 3   | Functional — Finance + Email + Admin  | E6, E10, Admin     | 8–10 stories                     |
| Tester 4   | Functional — SPRConnect (real-time)   | E7, E8, E9         | 10–12 stories                    |

The Lead is responsible for **sign-off** at sprint end. Anyone can file bugs against anyone else's area. Cross-coverage means each tester smoke-checks two epics they don't own per sprint (round-robin assignment) to keep fresh eyes on the app.

---

## Schedule (10 weeks, 6 sprints)

| Sprint | Weeks   | Focus                                                | Major deliverables                                    |
| ------ | ------- | ---------------------------------------------------- | ----------------------------------------------------- |
| **S0** | Week 1  | Setup + smoke + plumbing                             | All testers have QA accounts; smoke suite drafted; Excel workbook live |
| **S1** | Wk 2–3  | E1 Auth & Users · E11 Admin                          | All P0/P1 auth cases passing; smoke suite **automated** |
| **S2** | Wk 4–5  | E2 Candidates · E3 Enquiries · E4 Training · E5 Interviews | Major workflow chain validated end-to-end (enquiry → placement) |
| **S3** | Wk 6–7  | E6 Finance · E10 Email                               | Master-only flows checked; email send/receive verified |
| **S4** | Wk 8–9  | E7 Chat · E8 Meetings · E9 Video Calls               | Real-time cases passing on two-browser setup           |
| **S5** | Week 10 | Regression + UAT prep + automation expansion         | Release test report; production promotion go/no-go    |

`06-sprint-board.csv` has the full sprint-by-sprint breakdown pre-populated.

---

## Entry criteria (per sprint)

A sprint may start only when:

- The previous sprint's retro is complete.
- All P0 bugs from the previous sprint are fixed and verified, or explicitly deferred with sign-off.
- Sprint backlog is groomed: every selected story has acceptance criteria and an effort estimate.
- All testers have access to QA and updated test data.
- (S1 onward) Smoke suite passes on the latest QA build.

## Exit criteria (per sprint)

A sprint is closed when:

- ≥90% of committed stories have all their test cases run (Pass + Fail + Blocked, not "Not Run").
- All bugs raised have been triaged at least once.
- No new P0 bugs introduced in this sprint remain unfixed.
- Test execution sheet is filled in for the cycle.
- Sprint review demo done; retro notes captured.

---

## Risk register

| Risk                                                  | Likelihood | Impact | Mitigation                                                              |
| ----------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------- |
| Single dev for fixes — bug backlog grows              | M          | H      | Daily 15-min triage; defer P3s; lead arbitrates                         |
| Free Firestore quota exhausted by test data           | L          | M      | Weekly cleanup; avoid mass-create loops                                 |
| Jitsi/Element instances changing auth requirements    | M          | M      | If meet.jit.si gating tightens, fall back to embedded link in new tab   |
| Gmail quota (100/day) hit during email tests          | M          | L      | One send per case; co-ordinate within team for high-volume scenarios    |
| QA environment intermittent flakes affecting tests    | L          | M      | Log env-related failures separately from app bugs (Status = Blocked)    |
| Tester unavailability                                 | M          | M      | Cross-coverage policy; lead can rebalance epics mid-sprint              |

---

## Communication

- **Daily standup** — 15 min, async OK on Slack/Teams. Yesterday / today / blockers.
- **Bug triage** — 15 min daily, lead + dev. Walk through new bugs in `04-bug-tracker.csv`.
- **Sprint planning** — 60 min Monday of week 1.
- **Sprint demo + retro** — 45 min Friday of week 2.
- **Reporting cadence** — Lead sends a one-page status email every Friday: stories Done / In Progress / Blocked, top 5 bugs, sprint burndown.

---

## Tools

| Purpose                  | Tool                                       | Why                                |
| ------------------------ | ------------------------------------------ | ---------------------------------- |
| Test management          | This Excel workbook (CSV-backed)           | Free, simple, fits 4-person team   |
| Bug tracking             | `04-bug-tracker.csv` + screenshots in shared drive | Same workbook; one source of truth |
| Automated tests          | **Playwright** + GitHub Actions            | See `03-automation-plan.md`        |
| Communication            | Slack / Teams / WhatsApp (whatever team uses) | Daily standups async                |
| Screen recording for bugs | Loom (free tier) or built-in OS recorder  | Faster than written repro steps    |

We **don't** use TestRail/Zephyr/QTest/etc. — too heavy for this team size and budget.

---

## Reporting

Each Friday the Lead publishes a one-page status (paste into the Sprint Board's Notes column):

```
Sprint S2 — Week 4 status
-------------------------
Stories: 12 committed → 9 done · 2 in progress · 1 blocked (SPR-027 awaits dev fix on BUG-018)
Bugs: 14 raised this week · 8 fixed · 6 open (1 P0, 2 P1, 3 P2)
Coverage: 64 of 78 test cases executed (82%); pass rate 91%
Risks: Email tests blocked until SETUP-EMAIL.md is completed
Next week: Finish E5 Interviews, start E6 Finance
```

At sprint 5 end, the Lead publishes the **Release Test Report** with the same shape but covering all 6 sprints + the final UAT cycle.

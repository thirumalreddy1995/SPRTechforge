# 01 — Scope

## Project

**Name:** SPR Techforge Management
**URL (QA):** https://sprtechforge-qa.web.app
**Stack:** React + Vite SPA, Firebase (Firestore + Storage), Google Apps Script (email), Jitsi (video)
**Test team size:** 4 testers (1 acting as Lead)
**Estimated effort:** 10 weeks across 6 sprints (Sprint 0 setup + Sprints 1–5)

---

## What's in scope

All functionality currently shipped to the QA environment, grouped into 10 epics:

| Epic | Module / Feature                       | Notes                                      |
| ---- | -------------------------------------- | ------------------------------------------ |
| E1   | Authentication & Users                 | Login, session, master role, user CRUD     |
| E2   | Candidates                             | CRUD, profiles, agreements, status changes |
| E3   | Enquiries & Web Leads                  | Lead capture, merge to candidate           |
| E4   | Training                               | Modules, topics, attendance, progress      |
| E5   | Interviews                             | Scheduling, outcomes, prep, question bank  |
| E6   | Finance (master-only)                  | Accounts, transactions, payroll, reports   |
| E7   | SPRConnect → Chat                      | DMs, announcements, file attachments       |
| E8   | SPRConnect → Meetings                  | Scheduling, RSVP, calendar                 |
| E9   | SPRConnect → Video Calls (Jitsi)       | Instant DM calls, scheduled-meeting calls, ring overlay |
| E10  | SPRConnect → Email (Apps Script)       | Send/receive Gmail, attachments            |

Plus cross-cutting concerns:

- **Real-time sync** across multiple browser sessions (Firestore listeners)
- **Cross-browser** on Chrome, Edge, Firefox (Safari best-effort if Mac available)
- **Responsive layout** on tablet + phone widths
- **Activity logging** integrity (every action master-visible)
- **Permissions matrix** (admin vs staff vs candidate vs master)

---

## What's out of scope (for this round)

| Out of scope                                  | Why                                                                |
| --------------------------------------------- | ------------------------------------------------------------------ |
| Production environment (https://sprtechforge.com) | Live business data. We test only on QA. UAT later, separately.    |
| Load / performance / stress testing           | Not warranted at current user count. Revisit when scaling.         |
| Penetration / OWASP-grade security testing    | Separate engagement when warranted. Light auth-bypass checks only. |
| Email deliverability / spam-score testing     | Gmail handles deliverability. Out of our control.                  |
| Jitsi internals / WebRTC stress testing       | We test our integration, not Jitsi itself.                         |
| Localisation / i18n                           | App is English-only by design.                                     |
| Accessibility (WCAG AA) full audit            | We do light a11y smoke (keyboard nav, alt text), not full audit.   |
| Mobile native apps                            | Web only.                                                          |
| Data migration / backup-restore drills        | Cloud Setup page exists; we smoke-test it but don't certify DR.    |

---

## Test environments

| Env             | URL                                       | Database (Firestore project) | Owned by         |
| --------------- | ----------------------------------------- | ---------------------------- | ---------------- |
| **QA**          | https://sprtechforge-qa.web.app           | `sprtechforge-qa`            | Test team        |
| **Local dev**   | `npm run dev` → http://localhost:5173     | (whichever env vars are set) | Each tester individually |
| **Production**  | https://sprtechforge.com                  | `sprtechforge`               | Owner only — DO NOT TEST |

QA is fully isolated from production — wiping data, creating noise, breaking things on QA never affects the live site.

### Browsers / devices

| Tier  | Browser                | Required? |
| ----- | ---------------------- | --------- |
| Tier 1 | Chrome (latest)        | Yes       |
| Tier 1 | Edge (latest)          | Yes       |
| Tier 2 | Firefox (latest)       | Yes       |
| Tier 2 | Safari (latest, macOS) | Best-effort if Mac available |
| Tier 3 | Mobile Chrome (Android) | Smoke only |
| Tier 3 | Mobile Safari (iOS)     | Smoke only |

Every release-candidate build must pass all P0/P1 test cases on **Tier 1**. Tier 2 runs once per sprint. Tier 3 runs only for the final UAT cycle.

---

## Test data

| Data type             | Source                                                         |
| --------------------- | -------------------------------------------------------------- |
| Test users            | Created via Admin → Users on QA. One user per tester + master. |
| Test candidates       | Manually created. Aim for ~10 in different statuses.           |
| Test interviews       | Manually scheduled at various dates.                           |
| Test chats / meetings | Created during chat / meeting test cycles.                     |
| Test email account    | The Gmail account configured for QA's email bridge (per SETUP-EMAIL.md). Use a separate Gmail you control for the external sender during inbound testing. |

If the QA Firestore gets messy, the lead can wipe collections from Firebase Console → Firestore → delete docs. Don't delete the bootstrap admin doc (`users/admin-01`); that's the recovery hatch.

---

## Risks & dependencies

| Risk / dependency                              | Mitigation                                         |
| ---------------------------------------------- | -------------------------------------------------- |
| Jitsi (meet.jit.si) requires moderator Google sign-in once | Document for testers; tester 4 signs in once and re-uses session |
| Email bridge needs one-time GAS setup          | QA Lead completes SETUP-EMAIL.md before sprint 4   |
| Free Gmail quota: 100 sends/day                | Don't run send-blast tests; one or two per case    |
| Firestore free tier quotas (1 GiB stored, 50k reads/day) | Avoid mass-import tests; clear test data weekly |
| Single dev (the project owner) for bug fixes   | Triage daily so bug backlog doesn't grow           |
| Firebase Storage rules currently wide-open on QA | Tighten for prod separately; out of scope here     |

---

## Definition of "done" for this engagement

The application is considered tested-and-ready-for-prod-promotion when:

- All P0 and P1 user stories have at least one passing manual test case run on Tier 1 browsers in the most recent build.
- All P0 bugs are fixed and verified; no more than 5 open P2 bugs and 10 open P3 bugs.
- The smoke suite (defined in `02-test-plan.md`) is fully automated and green in CI.
- A signed-off **release-test report** exists for the build, summarising pass rates, open bugs, and any risks flagged.
- The QA Lead has run the full regression suite on the build and signed off.

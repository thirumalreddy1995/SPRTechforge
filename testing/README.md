# SPRTechforge — Test Management Pack

Everything your 4-person testing team needs to test the application end-to-end using Agile methodology. This pack is meant to live in the repo so it's versioned alongside the code, but the working files (user stories, test cases, bugs, etc.) are CSVs designed to be opened directly in Excel and saved as `.xlsx` for day-to-day use.

---

## Folder layout

```
testing/
├── README.md                       ← you are here
├── 01-scope.md                     ← What we test, what we don't, environments
├── 02-test-plan.md                 ← Strategy, roles for 4 testers, schedule
├── 03-automation-plan.md           ← Tooling + phased rollout (Playwright)
├── 04-agile-process.md             ← Sprint cadence, ceremonies, DoD/DoR
└── templates/
    ├── 01-user-stories.csv         ← All ~50 stories across 10 epics
    ├── 02-test-cases.csv           ← Manual test cases (~80 to start)
    ├── 03-bug-report.csv           ← Single-bug template for filing
    ├── 04-bug-tracker.csv          ← Consolidated bug status tracker
    ├── 05-test-execution.csv       ← Run results per test case per cycle
    ├── 06-sprint-board.csv         ← 5-sprint plan with assignments
    └── 07-automation-coverage.csv  ← Manual-vs-automated tracking
```

---

## How to use this in Excel

Each CSV is one sheet. You have two options to get one consolidated workbook:

**Option A — One workbook, multiple sheets (recommended)**

1. Open a blank workbook in Excel.
2. For each CSV file: `Data → Get Data → From Text/CSV` → pick the file → `Load`. This adds it as a new sheet.
3. Rename each sheet to something readable (e.g., "User Stories", "Test Cases", etc.).
4. Save the workbook as **`SPR-Testing.xlsx`** somewhere shared (OneDrive / Google Drive / SharePoint).
5. Add filters to each sheet (`Data → Filter`) and turn the data into formatted Tables (`Insert → Table`) so dropdowns and conditional formatting work.

**Option B — One CSV per file (keep them separate)**

If you'd rather treat each as its own file: just double-click any CSV to open in Excel and `Save As → Excel Workbook (.xlsx)`. Repeat for each.

The CSV files in the repo are the canonical templates. Once your team starts filling them in, those filled-in files live in your shared drive, not in git — keep test results out of the codebase.

---

## Where to start (day one for the team)

1. **Lead reads** `01-scope.md`, `02-test-plan.md`, `04-agile-process.md`. About 30 minutes.
2. **All 4 testers read** `04-agile-process.md` so everyone speaks the same language. About 10 minutes.
3. **Convert the CSVs to one Excel workbook** following Option A above. Put it in a shared drive.
4. **Sprint planning meeting** — pull stories from `01-user-stories.csv` into Sprint 0 using `06-sprint-board.csv`. The board is pre-populated with a recommended 5-sprint plan and tester assignments. Adjust as you see fit.
5. **Testers write their own test cases** under their assigned stories, using `02-test-cases.csv` as the template. Each row is one test case.
6. **Daily** — testers update `05-test-execution.csv` (Pass / Fail / Blocked) and file bugs in `04-bug-tracker.csv` if anything fails.
7. **Sprint review** at end of each sprint, retro, plan next.

---

## Roles for your 4-person team

The plan in `02-test-plan.md` and `06-sprint-board.csv` assumes this division:

| Role                                 | Person          | Owns                                                         |
| ------------------------------------ | --------------- | ------------------------------------------------------------ |
| **QA Lead** (also tester)            | Tester 1        | Test plan, sprint planning, story grooming, regression suite |
| **Functional Tester — Core**         | Tester 2        | Auth, Users, Candidates, Enquiries, Training, Interviews     |
| **Functional Tester — Finance + Email** | Tester 3     | Finance (master), SPRConnect → Email, Admin                  |
| **Functional Tester — SPRConnect**   | Tester 4        | Chat, Meetings, Video Calls                                  |

Cross-coverage: everyone runs the smoke suite at sprint start; everyone files bugs against anyone's area; the lead arbitrates priorities and triages.

---

## Test environments

| Environment | URL                                         | Use for                              |
| ----------- | ------------------------------------------- | ------------------------------------ |
| **QA**      | https://sprtechforge-qa.web.app             | All testing (this is your main env)  |
| **Local**   | `npm run dev` (http://localhost:5173)       | Reproducing bugs, dev-side investigation |
| **Production** | https://sprtechforge.com                  | **Do not test against prod.** UAT only |

Bootstrap login on QA (for first session):

```
Username: thirumalreddy@sprtechforge.com
Password: ThiruPriya@13
```

After your first session, the QA Lead should create one Firestore user per tester (Admin → Users → Add User) so each person has their own credentials and activity logs are clean.

---

## Conventions

- **Story IDs**: `SPR-###` (sequential, no gaps). Same prefix as the project, kept consistent across all sheets.
- **Test Case IDs**: `TC-###`.
- **Bug IDs**: `BUG-###`.
- **Sprint IDs**: `S0`, `S1`, `S2`, `S3`, `S4`, `S5`.
- **Priorities**: P0 (showstopper) → P3 (cosmetic). See `04-agile-process.md` for severity ↔ priority mapping.
- **Statuses** — see each template's header rows for the allowed values. Use Excel data validation dropdowns to enforce them.

---

## What's NOT in this pack (and why)

- **Performance/load testing tooling** (k6, JMeter) — not relevant at this team size. We add it if/when usage grows.
- **Security testing artifacts** (OWASP checklist, pentest plan) — out of scope for this round. Add separately when the app handles real PII at scale.
- **Test data generation scripts** — your dataset is small enough to seed manually via Admin → Users. We can automate later if needed.
- **CI dashboards / test reporting tools** (TestRail, Zephyr, etc.) — Excel covers it for 4 testers. Graduate to a tool when you outgrow this.

---

## Maintenance

When the dev team adds a new feature:

1. Add a new user story row to `01-user-stories.csv` (or the live workbook).
2. Tester assigned to that area writes new test cases in `02-test-cases.csv`.
3. Schedule the story into the next sprint via `06-sprint-board.csv`.

When automation is added for a manual test case, mark it `Automated` in `07-automation-coverage.csv` so we know what's still being run by hand.

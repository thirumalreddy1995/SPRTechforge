# SPRTechforge — Test Management Pack

Everything your 4-person test team needs to run Agile testing on the SPRTechforge application. The working file is **[SPR-Testing.xlsx](SPR-Testing.xlsx)** — a single Excel workbook with 7 sheets, proper dropdowns on every status field, frozen headers, autofilters, and ~140 pre-populated user stories with detailed acceptance criteria.

---

## Folder layout

```
testing/
├── README.md                       ← you are here
├── 01-scope.md                     ← What we test, environments, browsers
├── 02-test-plan.md                 ← Strategy, roles for 4 testers, schedule
├── 03-automation-plan.md           ← Playwright pyramid + phased rollout
├── 04-agile-process.md             ← Sprints, ceremonies, DoR/DoD, lifecycles
├── SPR-Testing.xlsx                ← THE working file — open this in Excel
└── generator/
    ├── package.json                ← One devDep: exceljs
    ├── build.js                    ← Re-generates SPR-Testing.xlsx
    └── data/
        ├── stories.js              ← Source data for the User Stories sheet
        └── test-cases.js           ← Source data for the Test Cases sheet
```

---

## What's inside SPR-Testing.xlsx

| Sheet | Content | Dropdowns on |
| --- | --- | --- |
| **README** | On-sheet intro, status legend, conventions | — |
| **User Stories** | 142 stories across 10 epics, 3–5 acceptance criteria each | Epic, Priority, Effort, Status, Owner, Sprint |
| **Test Cases** | 91 manual test cases linked back to stories | Type, Priority, Status, Owner |
| **Bugs** | Merged report + tracker. 2 example rows + 200 blank rows ready to fill | Module, Severity, Priority, Status, Environment, Frequency, Sprint, Reporter, Assignee, Verified By |
| **Test Execution** | 2 example rows + 500 blank rows for per-cycle Pass/Fail/Blocked tracking | Sprint, Executed By, Status |
| **Sprint Board** | 6-sprint plan with tester assignments pre-loaded | Sprint, Epic, Owner, Priority, Effort, Status, Committed, Done |
| **Automation Coverage** | One row per test case showing Manual vs Automated | Priority, Automation Status, Last Run Result, Automation Owner |

Each sheet has:

- Frozen header row (you can scroll without losing column titles)
- Coloured priority cells (P0 = red, P1 = orange, P2 = yellow, P3 = grey)
- Alternating row stripes for readability
- AutoFilter enabled on the header row

---

## How to use

### Day one

1. **Lead** opens `SPR-Testing.xlsx`, saves a copy to your shared drive (OneDrive / SharePoint / Google Drive), and shares the link with the team. **From now on, that shared-drive copy is the working file** — not the one in the repo.
2. **All 4 testers** open the workbook, read the **README** sheet, then `02-test-plan.md` + `04-agile-process.md` for context (~20 min).
3. **Sprint 0 begins** using the Sprint Board sheet. Sprint 0 row already lists the setup tasks (accounts, smoke suite, etc.).

### Each sprint

1. **Plan** (Mon W1) — In the Sprint Board, set `Committed = Yes` and `Status = Sprint` for the stories you're picking up this sprint.
2. **Design** (Tue–Wed W1) — Add or extend rows in the Test Cases sheet for stories that need new cases.
3. **Execute** (Thu W1 → Wed W2) — Run cases manually. Add a row in the Test Execution sheet for each (test case × cycle). Status is Pass / Fail / Blocked / Not Run / Skipped / Deferred.
4. **File bugs** — Anything that fails gets a row in the Bugs sheet. Bug ID format is `BUG-###`.
5. **Daily triage** (15 min, after standup) — Lead + dev walk through `Status = New` rows in the Bugs sheet and promote to Open with priority/severity.
6. **Demo + retro** (Fri W2) — Mark completed stories `Status = Done` in both the User Stories sheet AND the Sprint Board sheet.

### Filing a bug (the merged way)

- Open the **Bugs** sheet → scroll to the first empty row.
- Pick the next free `BUG-###` ID.
- Fill in Title, Module/Epic, Story ID, Test Case ID (if any), Severity, Priority, Steps to Reproduce, Expected, Actual.
- Status starts at `New`; lead changes to `Open` at triage.
- Screenshots / Looms go into your shared drive; paste the link into the Screenshot or Loom column.
- One bug per row — never compound multiple issues into one row.

### Updating a status

Click any status cell — the dropdown arrow appears in the cell. Pick from the list. The cell types in this workbook do **not** accept free-text values for status fields, so typos that would fragment your filters are impossible.

---

## Conventions

- **Story IDs**: `SPR-###` (e.g., `SPR-001`, `SPR-142`).
- **Test Case IDs**: `TC-###`.
- **Bug IDs**: `BUG-###`.
- **Sprint IDs**: `S0`–`S5`.
- **Severity (technical)**: Critical / High / Medium / Low.
- **Priority (when to fix)**: P0 (showstopper) → P3 (cosmetic). See `04-agile-process.md` for the severity↔priority mapping.

---

## Need to reset the workbook?

If the workbook gets in a bad state and you want to regenerate from the source data:

```bash
cd testing/generator
npm install        # one-time
npm run build      # rewrites ../SPR-Testing.xlsx
```

You'll lose anything you typed into the workbook copy in the repo. **Your shared-drive copy is untouched** — that's the actual working file.

To customise the seeded story/test data going forward, edit:

- `testing/generator/data/stories.js`
- `testing/generator/data/test-cases.js`

Then re-run `npm run build` and your changes show up the next time someone resets.

---

## Roles for the 4-person team

| Role | Person | Epics |
| --- | --- | --- |
| **QA Lead** (also tests) | Tester 1 | E1 Auth, regression, cross-browser, smoke automation |
| **Functional — Core domain** | Tester 2 | E2 Candidates · E3 Enquiries · E4 Training · E5 Interviews |
| **Functional — Finance + Email** | Tester 3 | E6 Finance · E10 Email |
| **Functional — SPRConnect realtime** | Tester 4 | E7 Chat · E8 Meetings · E9 Video calls |

Cross-coverage: every tester runs the smoke suite at sprint start; everyone can file bugs against anyone's area; the lead arbitrates.

---

## Test environments

| Env | URL | Use for |
| --- | --- | --- |
| **QA** | https://sprtechforge-qa.web.app | All testing (main env) |
| **Local** | `npm run dev` (http://localhost:5173) | Reproducing bugs locally |
| **Production** | https://sprtechforge.com | **Do not test against prod.** UAT only |

Bootstrap login on QA:

```
Username: thirumalreddy@sprtechforge.com
Password: ThiruPriya@13
```

Replace this with rotated tester accounts during Sprint 0.

---

## What's NOT in this pack (and why)

- Performance / load tooling (k6, JMeter) — out of scope at this team size
- Security audit artifacts (pentest plan, OWASP checklist) — separate engagement when warranted
- Test data factories or seed scripts — your dataset is small; manual seeding via Admin → Users is fine
- CI dashboards (TestRail / Zephyr / qTest) — Excel is the right size for 4 testers

Add any of these only when the team outgrows the current setup.

# 03 — Automation Plan

## Goal

Automate the boring, repeatable tests so manual effort goes to the high-value cases (exploratory testing, real-time multi-user flows, edge cases). Done well, automation also acts as a **deploy gate** — if smoke tests fail in CI, the QA deploy gets blocked before bad code reaches the test team.

Not goal: automate everything. Automation has a maintenance cost. Cases that change often, are hard to script (file uploads with previews, video call quality), or are run once-per-release stay manual.

---

## Tool: Playwright

Why Playwright over Cypress/Selenium:

- Modern, well-maintained, TypeScript-native — same language as your app.
- Multi-browser out of the box (Chromium, Firefox, WebKit) — no extra setup.
- Built-in waiting (no `cy.wait(5000)` flakiness).
- Trace viewer makes debugging failures painless.
- Free, MIT-licensed, no SaaS dependency.
- Works perfectly with Vite + React.

The Cypress tradeoff: it's also good, but only runs Chromium-family by default and is slower on parallelism. Playwright wins for a small team.

---

## Test pyramid

```
            /\
           /  \    e2e (Playwright)              ~30 tests
          /----\
         /      \  component / integration       ~30 tests
        /--------\ (React Testing Library)
       /          \
      /  unit       unit (Vitest)                ~50 tests
     /--------------\
```

Most automation effort goes into **e2e smoke + critical flows**. Unit and component tests are nice-to-have at this stage; we don't block on them.

### What to automate (in priority order)

| Priority | Examples                                                                       | Why                                        |
| -------- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| **P0**   | Login, view dashboard, log out — the "site is up" check                        | Smoke. Runs on every PR. ~2 minutes.       |
| **P1**   | Create candidate, edit candidate, send chat message, schedule meeting          | Most-used flows. Daily regression.         |
| **P2**   | Filter / search, sort, pagination, bulk actions, RSVP, file attachment         | Common but lower blast-radius.             |
| **P3**   | Master-only features (Finance), Admin → Users, Cloud Setup, Activity Logs     | Lower-traffic, run weekly.                 |
| **MANUAL** | Video calls (Jitsi UI behind iframe), file uploads with real OS dialog, email send (would hit Gmail quota) | Hard to script, low ROI |

`07-automation-coverage.csv` tracks each test case as `Manual`, `Automated`, or `Both`.

---

## Phased rollout

### Sprint 0 (Week 1) — Scaffold

- Install Playwright in the repo: `npm init playwright@latest`
- Create `tests/e2e/` directory with `playwright.config.ts` configured for QA URL
- Write the **smoke suite**: 5 tests
  - Site loads
  - Login with bootstrap admin works
  - Sidebar renders
  - Can navigate to each top-level page without errors
  - Logout returns to home
- Hook into GitHub Actions: run on every push to `DevelopmentBranch`, `QA`, `master`

**Deliverable end of S0:** green smoke run in CI.

### Sprint 1 (Wk 2–3) — Auth + Users

- Automate: user CRUD, password validation, session timeout, login failure cases
- ~10 tests added. Total: ~15.

### Sprint 2 (Wk 4–5) — Core domain

- Automate: candidate CRUD, enquiry create + merge to candidate, training module CRUD, interview scheduling
- ~15 tests added. Total: ~30.

### Sprint 3 (Wk 6–7) — Finance + Email

- Automate (cautiously): finance transaction CRUD, account creation. **Manual:** payroll report, financial statements (table-heavy, brittle to automate).
- Email tests stay **manual** — automating real Gmail sends burns the 100/day quota fast and the inbound side depends on external email arrival.
- ~5 tests added. Total: ~35.

### Sprint 4 (Wk 8–9) — SPRConnect

- Automate: chat DM, send message, file attachment, announcement post-and-read
- Automate: meeting schedule, RSVP, edit, cancel
- **Manual:** video calls (Jitsi iframe is opaque to Playwright; we test that the call route loads and the iframe mounts, but not the in-call UI)
- ~10 tests added. Total: ~45.

### Sprint 5 (Week 10) — Hardening

- Stabilize flaky tests
- Add parallel sharding to GitHub Actions for faster CI
- Document maintenance pattern

**End-of-engagement target:** ~45 automated tests in CI, covering 60–70% of P0/P1 manual test cases.

---

## Project structure

```
SPRTechforge/
├── tests/
│   └── e2e/
│       ├── fixtures/
│       │   └── auth.ts            ← login helper, returns authenticated page
│       ├── auth.spec.ts
│       ├── candidates.spec.ts
│       ├── chat.spec.ts
│       ├── meetings.spec.ts
│       └── smoke.spec.ts
├── playwright.config.ts            ← config: BASE_URL, browsers, retries
├── .github/workflows/
│   └── e2e.yml                     ← runs on every push
└── package.json                    ← + "@playwright/test" devDep
```

### Example test (auth.spec.ts)

```ts
import { test, expect } from '@playwright/test';

test('admin can log in', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /sign in/i }).click();
  await page.getByLabel(/username/i).fill('thirumalreddy@sprtechforge.com');
  await page.getByLabel(/password/i).fill(process.env.QA_BOOTSTRAP_PASSWORD!);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText(/Thirumal Reddy/)).toBeVisible();
});
```

### CI workflow (.github/workflows/e2e.yml)

```yaml
name: e2e
on: [push, pull_request]
jobs:
  playwright:
    runs-on: ubuntu-latest
    env:
      BASE_URL: https://sprtechforge-qa.web.app
      QA_BOOTSTRAP_PASSWORD: ${{ secrets.QA_BOOTSTRAP_PASSWORD }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps chromium firefox
      - run: npx playwright test
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

Add `QA_BOOTSTRAP_PASSWORD` to GitHub Secrets so the password isn't in source.

---

## Maintenance rules

1. **Locators**: prefer `getByRole`, `getByLabel`, `getByText`. Avoid CSS selectors tied to class names — Tailwind class names change.
2. **One test, one assertion focus**. A single test that does "login + 10 things" tells you nothing when it fails. Split.
3. **No `page.waitForTimeout(5000)`**. Use `expect(...).toBeVisible()` which auto-waits.
4. **Test data**: create within the test (`addUser({ name: 'Test Tester' })`), delete on teardown. Never depend on pre-seeded data — flaky.
5. **Quarantine, don't delete**, flaky tests. Move to `tests/e2e/quarantine/` and create a story to fix.
6. **When a manual case fails repeatedly** the same way, add an automated version. When a bug is found, write a regression test before closing.

---

## What we explicitly will NOT automate (and why)

| Case                                       | Why not                                                    |
| ------------------------------------------ | ---------------------------------------------------------- |
| Real video call between two users          | Jitsi iframe, two browser contexts, real camera/mic — too brittle. We assert the call page loads and the iframe is present, no more. |
| Real email send (Gmail bridge)             | Each automated run would consume Gmail's 100/day quota. We stub or mock it. |
| Visual regression / pixel comparison       | Too brittle for a fast-evolving UI. We do manual visual review during sprint demos. |
| Accessibility audit                        | Use Axe DevTools manually once per sprint instead.        |
| Performance (page load < X seconds)        | Out of scope.                                              |
| Master-user finance reports                | Excel-export logic; better to spot-check manually each sprint. |

---

## Success metric

By end of sprint 5:

- ≥45 automated e2e tests in CI
- Smoke suite (8 tests) runs in <3 minutes on every PR
- Full suite runs in <12 minutes (parallel)
- Flaky test rate <5% (failures that pass on rerun)
- 60% of P0+P1 manual test cases also covered by automation

If we miss those numbers, the retro at S5 identifies why and rebalances scope.

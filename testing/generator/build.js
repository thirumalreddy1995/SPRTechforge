/**
 * SPR-Testing.xlsx generator.
 *
 * Run once with `npm install && npm run build` (from testing/generator/) to
 * produce the workbook at testing/SPR-Testing.xlsx. Day-to-day edits should
 * happen in Excel, not by rerunning this script.
 *
 * Sheets produced:
 *   1. README              - on-sheet intro, conventions, status legend
 *   2. User Stories        - ~140 stories with Status / Priority / Owner dropdowns
 *   3. Test Cases          - ~90 cases with Status / Type / Priority dropdowns
 *   4. Bugs                - merged report+tracker; dropdowns on status/severity/etc.
 *   5. Test Execution      - per-cycle Pass/Fail/Blocked results
 *   6. Sprint Board        - 6-sprint plan with tester assignments
 *   7. Automation Coverage - manual vs automated per test case
 */

const path = require('path');
const ExcelJS = require('exceljs');

const stories = require('./data/stories');
const tests = require('./data/test-cases');

// ── Lookup options for dropdowns ────────────────────────────────────────────
const OPTS = {
  storyStatus: ['Backlog', 'Sprint', 'In Design', 'In Test', 'Blocked', 'Failed', 'Done'],
  priority: ['P0', 'P1', 'P2', 'P3'],
  effort: ['1', '2', '3', '5', '8', '13'],
  owner: ['Tester 1', 'Tester 2', 'Tester 3', 'Tester 4', 'Lead', 'Dev', 'Owner'],
  sprint: ['S0', 'S1', 'S2', 'S3', 'S4', 'S5'],
  epic: [
    'E1 Auth & Users',
    'E2 Candidates',
    'E3 Enquiries & Leads',
    'E4 Training',
    'E5 Interviews',
    'E6 Finance',
    'E7 Chat',
    'E8 Meetings',
    'E9 Video Calls',
    'E10 Email',
    'Cross-cutting',
  ],
  testStatus: ['Active', 'Draft', 'Archived'],
  testType: ['Functional', 'Negative', 'Regression', 'Smoke', 'Real-time', 'Responsive', 'Authorization', 'Integration'],
  executionStatus: ['Pass', 'Fail', 'Blocked', 'Not Run', 'Skipped', 'Deferred'],
  bugStatus: ['New', 'Open', 'In Progress', 'Fixed', 'Verified', 'Closed', 'Reopened', 'Deferred', "Won't Fix"],
  severity: ['Critical', 'High', 'Medium', 'Low'],
  environment: ['QA', 'Local', 'Production'],
  frequency: ['Always', 'Sometimes', 'Once', 'Cannot Reproduce'],
  yesNo: ['Yes', 'No'],
  sprintStatus: ['Backlog', 'Sprint', 'In Design', 'In Test', 'Blocked', 'Done'],
  automationStatus: ['Automated', 'Planned', 'Manual'],
  runResult: ['Pass', 'Fail', 'N/A'],
};

// Helper: convert a list of options into the Excel data-validation formula
function listFormula(values) {
  return ['"' + values.join(',') + '"'];
}

// ── Styling helpers ─────────────────────────────────────────────────────────
const HEADER_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1E40AF' }, // blue-800
};
const HEADER_FONT = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
const SUBHEADER_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE0E7FF' }, // indigo-100
};

const PRI_FILL = {
  P0: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } },
  P1: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } },
  P2: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF9C3' } },
  P3: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } },
};

function styleHeader(row) {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1E40AF' } },
      bottom: { style: 'thin', color: { argb: 'FF1E40AF' } },
      left: { style: 'thin', color: { argb: 'FF1E40AF' } },
      right: { style: 'thin', color: { argb: 'FF1E40AF' } },
    };
  });
  row.height = 28;
}

function applyAlternateRowStriping(ws, firstDataRow, lastDataRow) {
  for (let r = firstDataRow; r <= lastDataRow; r++) {
    const row = ws.getRow(r);
    if (r % 2 === 0) {
      row.eachCell({ includeEmpty: true }, (cell) => {
        if (!cell.fill || cell.fill.type !== 'pattern') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
      });
    }
    row.alignment = { vertical: 'top', wrapText: true };
  }
}

// Apply a list dropdown to every row of a specified column.
function applyListValidation(ws, columnKey, values, dataRowCount) {
  const col = ws.getColumn(columnKey);
  for (let r = 2; r <= dataRowCount + 1; r++) {
    const cell = ws.getCell(r, col.number);
    cell.dataValidation = {
      type: 'list',
      allowBlank: true,
      showErrorMessage: true,
      errorStyle: 'warning',
      formulae: listFormula(values),
    };
  }
}

// Color cells in a column based on the value.
function applyPriorityColor(ws, columnKey, dataRowCount) {
  const col = ws.getColumn(columnKey);
  for (let r = 2; r <= dataRowCount + 1; r++) {
    const cell = ws.getCell(r, col.number);
    const val = cell.value;
    if (val && PRI_FILL[val]) {
      cell.fill = PRI_FILL[val];
      cell.alignment = { vertical: 'top', horizontal: 'center', wrapText: true };
      cell.font = { bold: true };
    }
  }
}

// ── Build the workbook ──────────────────────────────────────────────────────
const wb = new ExcelJS.Workbook();
wb.creator = 'SPRTechforge QA Pack';
wb.created = new Date();

// 1. README sheet ─────────────────────────────────────────────────────────────
function buildReadme() {
  const ws = wb.addWorksheet('README', { properties: { tabColor: { argb: 'FF1E40AF' } } });
  ws.getColumn(1).width = 110;

  const lines = [
    ['SPR Techforge — Testing Workbook'],
    [''],
    ['How to use this workbook'],
    [''],
    ['• User Stories — 140+ pre-loaded stories with detailed acceptance criteria. Update Status, Owner, Sprint as you go.'],
    ['• Test Cases — Manual test cases linked back to stories. Add more rows as you write new ones.'],
    ['• Bugs — Single sheet for ALL bug data (was bug-report + bug-tracker). Status, Severity, Priority columns have dropdowns.'],
    ['• Test Execution — Pass/Fail/Blocked log per cycle. Create one row per (test case × cycle) — never overwrite.'],
    ['• Sprint Board — 6-sprint plan with tester assignments. Adjust dates and owners as needed.'],
    ['• Automation Coverage — Track which manual cases also have automated Playwright tests.'],
    [''],
    ['Status values (use the dropdowns; don\'t type freely)'],
    [''],
    ['Stories : Backlog · Sprint · In Design · In Test · Blocked · Failed · Done'],
    ['Tests   : Active · Draft · Archived'],
    ['Bugs    : New · Open · In Progress · Fixed · Verified · Closed · Reopened · Deferred · Won\'t Fix'],
    ['Exec    : Pass · Fail · Blocked · Not Run · Skipped · Deferred'],
    ['Priority: P0 (showstopper) · P1 · P2 · P3 (cosmetic)'],
    ['Severity: Critical · High · Medium · Low'],
    [''],
    ['Conventions'],
    [''],
    ['• Story IDs are SPR-### · Test case IDs are TC-### · Bug IDs are BUG-###.'],
    ['• One bug per row. If a flow has three issues, file three bugs.'],
    ['• Don\'t move a bug to Verified without actually rerunning the failing scenario.'],
    ['• Once you save this workbook with your own edits, save it to your shared drive — the copy in the repo is a fresh template.'],
    [''],
    ['Need to reset the workbook to its scaffolded state?'],
    [''],
    ['  cd testing/generator && npm install && npm run build'],
    [''],
    ['Reference docs (read these alongside the workbook):'],
    ['  testing/01-scope.md            — what we test, environments, browsers'],
    ['  testing/02-test-plan.md        — strategy, roles, schedule, criteria'],
    ['  testing/03-automation-plan.md  — Playwright pyramid, phased rollout'],
    ['  testing/04-agile-process.md    — sprints, ceremonies, DoR/DoD, lifecycles'],
  ];

  lines.forEach((line, idx) => {
    const row = ws.addRow(line);
    if (idx === 0) {
      row.font = { bold: true, size: 18, color: { argb: 'FF1E40AF' } };
      row.height = 28;
    } else if (line[0] && /^(How to use|Status values|Conventions|Need to reset|Reference docs)/.test(line[0])) {
      row.font = { bold: true, size: 13, color: { argb: 'FF1E40AF' } };
      row.height = 22;
    } else {
      row.font = { size: 11, color: { argb: 'FF1F2937' } };
    }
    row.alignment = { vertical: 'top', wrapText: true };
  });
}

// 2. User Stories sheet ───────────────────────────────────────────────────────
function buildStories() {
  const ws = wb.addWorksheet('User Stories', { properties: { tabColor: { argb: 'FF059669' } }, views: [{ state: 'frozen', ySplit: 1 }] });

  ws.columns = [
    { header: 'Story ID', key: 'id', width: 11 },
    { header: 'Epic', key: 'epic', width: 22 },
    { header: 'Title', key: 'title', width: 50 },
    { header: 'Description', key: 'description', width: 48 },
    { header: 'Acceptance Criteria', key: 'acceptance', width: 75 },
    { header: 'Priority', key: 'priority', width: 9 },
    { header: 'Effort', key: 'effort', width: 7 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Owner', key: 'owner', width: 12 },
    { header: 'Sprint', key: 'sprint', width: 8 },
    { header: 'Dependencies', key: 'deps', width: 14 },
    { header: 'Notes', key: 'notes', width: 35 },
  ];

  styleHeader(ws.getRow(1));

  stories.forEach((s) => {
    ws.addRow({
      id: s.id,
      epic: s.epic,
      title: s.title,
      description: s.description,
      acceptance: s.acceptance,
      priority: s.priority,
      effort: String(s.effort),
      status: s.status,
      owner: s.owner,
      sprint: s.sprint,
      deps: s.deps,
      notes: s.notes,
    });
  });

  applyAlternateRowStriping(ws, 2, stories.length + 1);
  applyListValidation(ws, 'epic', OPTS.epic, stories.length);
  applyListValidation(ws, 'priority', OPTS.priority, stories.length);
  applyListValidation(ws, 'effort', OPTS.effort, stories.length);
  applyListValidation(ws, 'status', OPTS.storyStatus, stories.length);
  applyListValidation(ws, 'owner', OPTS.owner, stories.length);
  applyListValidation(ws, 'sprint', OPTS.sprint, stories.length);
  applyPriorityColor(ws, 'priority', stories.length);

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: stories.length + 1, column: ws.columnCount },
  };
}

// 3. Test Cases sheet ─────────────────────────────────────────────────────────
function buildTestCases() {
  const ws = wb.addWorksheet('Test Cases', { properties: { tabColor: { argb: 'FF7C3AED' } }, views: [{ state: 'frozen', ySplit: 1 }] });

  ws.columns = [
    { header: 'TC ID', key: 'id', width: 10 },
    { header: 'Story ID', key: 'storyId', width: 11 },
    { header: 'Title', key: 'title', width: 50 },
    { header: 'Type', key: 'type', width: 14 },
    { header: 'Pre-conditions', key: 'pre', width: 45 },
    { header: 'Test Steps', key: 'steps', width: 70 },
    { header: 'Test Data', key: 'data', width: 30 },
    { header: 'Expected Result', key: 'expected', width: 55 },
    { header: 'Priority', key: 'priority', width: 9 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Owner', key: 'owner', width: 12 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];

  styleHeader(ws.getRow(1));

  tests.forEach((t) => ws.addRow(t));

  applyAlternateRowStriping(ws, 2, tests.length + 1);
  applyListValidation(ws, 'type', OPTS.testType, tests.length);
  applyListValidation(ws, 'priority', OPTS.priority, tests.length);
  applyListValidation(ws, 'status', OPTS.testStatus, tests.length);
  applyListValidation(ws, 'owner', OPTS.owner, tests.length);
  applyPriorityColor(ws, 'priority', tests.length);

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: tests.length + 1, column: ws.columnCount },
  };
}

// 4. Bugs sheet (merged report + tracker) ─────────────────────────────────────
function buildBugs() {
  const ws = wb.addWorksheet('Bugs', { properties: { tabColor: { argb: 'FFDC2626' } }, views: [{ state: 'frozen', ySplit: 1 }] });

  ws.columns = [
    { header: 'Bug ID', key: 'id', width: 10 },
    { header: 'Title', key: 'title', width: 55 },
    { header: 'Module / Epic', key: 'module', width: 20 },
    { header: 'Story ID', key: 'storyId', width: 11 },
    { header: 'Test Case ID', key: 'tcId', width: 11 },
    { header: 'Severity', key: 'severity', width: 11 },
    { header: 'Priority', key: 'priority', width: 9 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Reporter', key: 'reporter', width: 12 },
    { header: 'Date Reported', key: 'dateReported', width: 14 },
    { header: 'Assignee', key: 'assignee', width: 12 },
    { header: 'Environment', key: 'environment', width: 12 },
    { header: 'Browser & OS', key: 'browser', width: 18 },
    { header: 'Build / Commit', key: 'build', width: 14 },
    { header: 'Pre-conditions', key: 'pre', width: 35 },
    { header: 'Steps to Reproduce', key: 'steps', width: 60 },
    { header: 'Expected Result', key: 'expected', width: 45 },
    { header: 'Actual Result', key: 'actual', width: 45 },
    { header: 'Frequency', key: 'frequency', width: 14 },
    { header: 'Workaround', key: 'workaround', width: 30 },
    { header: 'Screenshot Link', key: 'screenshot', width: 25 },
    { header: 'Loom / Video Link', key: 'loom', width: 25 },
    { header: 'Date Resolved', key: 'dateResolved', width: 14 },
    { header: 'Fixed In Build', key: 'fixedIn', width: 14 },
    { header: 'Verified By', key: 'verifiedBy', width: 12 },
    { header: 'Sprint', key: 'sprint', width: 8 },
    { header: 'Comments', key: 'comments', width: 45 },
  ];

  styleHeader(ws.getRow(1));

  // Two seeded example rows
  const sampleBugs = [
    {
      id: 'BUG-001',
      title: 'Cancelling an interview does not clear the today badge',
      module: 'E5 Interviews',
      storyId: 'SPR-061',
      tcId: 'TC-041',
      severity: 'High',
      priority: 'P1',
      status: 'New',
      reporter: 'Tester 2',
      dateReported: '2026-05-18',
      assignee: '',
      environment: 'QA',
      browser: 'Chrome 127 / Win 11',
      build: '<commit>',
      pre: 'Logged in as admin; at least one scheduled interview today',
      steps: '1. Schedule interview for today\n2. Open Interviews list\n3. Cancel it\n4. Look at sidebar badge',
      expected: 'Sidebar "Today: N" badge decrements by 1',
      actual: 'Badge shows the old count; only updates after a full page refresh',
      frequency: 'Always',
      workaround: 'Refresh the page',
      screenshot: '/shared/bugs/BUG-001.png',
      loom: '',
      dateResolved: '',
      fixedIn: '',
      verifiedBy: '',
      sprint: 'S2',
      comments: 'Example row — replace with real bugs as you find them.',
    },
    {
      id: 'BUG-002',
      title: 'Bootstrap admin write triggered on every login',
      module: 'E1 Auth & Users',
      storyId: 'SPR-011',
      tcId: 'TC-010',
      severity: 'Low',
      priority: 'P3',
      status: 'New',
      reporter: 'Tester 1',
      dateReported: '2026-05-18',
      assignee: '',
      environment: 'QA',
      browser: 'Edge 127 / Win 11',
      build: '<commit>',
      pre: 'Logged in as bootstrap admin',
      steps: '1. Login as admin-01\n2. Inspect Firebase Console > Firestore > users history',
      expected: 'A single write only when admin-01 is missing',
      actual: 'Write happens on every login even when admin-01 already exists',
      frequency: 'Always',
      workaround: 'None needed',
      screenshot: '',
      loom: '',
      dateResolved: '',
      fixedIn: '',
      verifiedBy: '',
      sprint: 'S2',
      comments: 'Example row — probably a harmless no-op write but inflates Firestore writes.',
    },
  ];

  sampleBugs.forEach((b) => ws.addRow(b));

  // Add 200 empty rows so the file is immediately usable for filing bugs
  for (let i = 0; i < 200; i++) ws.addRow({});

  const totalRows = sampleBugs.length + 200;
  applyAlternateRowStriping(ws, 2, totalRows + 1);

  applyListValidation(ws, 'module', OPTS.epic, totalRows);
  applyListValidation(ws, 'severity', OPTS.severity, totalRows);
  applyListValidation(ws, 'priority', OPTS.priority, totalRows);
  applyListValidation(ws, 'status', OPTS.bugStatus, totalRows);
  applyListValidation(ws, 'environment', OPTS.environment, totalRows);
  applyListValidation(ws, 'frequency', OPTS.frequency, totalRows);
  applyListValidation(ws, 'sprint', OPTS.sprint, totalRows);
  applyListValidation(ws, 'reporter', OPTS.owner, totalRows);
  applyListValidation(ws, 'assignee', OPTS.owner, totalRows);
  applyListValidation(ws, 'verifiedBy', OPTS.owner, totalRows);
  applyPriorityColor(ws, 'priority', totalRows);

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: totalRows + 1, column: ws.columnCount },
  };
}

// 5. Test Execution sheet ─────────────────────────────────────────────────────
function buildExecution() {
  const ws = wb.addWorksheet('Test Execution', { properties: { tabColor: { argb: 'FFEA580C' } }, views: [{ state: 'frozen', ySplit: 1 }] });

  ws.columns = [
    { header: 'Cycle', key: 'cycle', width: 14 },
    { header: 'Sprint', key: 'sprint', width: 8 },
    { header: 'TC ID', key: 'tcId', width: 10 },
    { header: 'Story ID', key: 'storyId', width: 10 },
    { header: 'Title', key: 'title', width: 45 },
    { header: 'Executed By', key: 'executedBy', width: 12 },
    { header: 'Execution Date', key: 'date', width: 14 },
    { header: 'Browser & OS', key: 'browser', width: 18 },
    { header: 'Build / Commit', key: 'build', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Actual Result', key: 'actual', width: 45 },
    { header: 'Bugs Raised', key: 'bugs', width: 18 },
    { header: 'Time Taken (min)', key: 'time', width: 12 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];

  styleHeader(ws.getRow(1));

  // Pre-populate two example rows then 500 blanks
  const examples = [
    { cycle: 'S1-Cycle1', sprint: 'S1', tcId: 'TC-001', storyId: 'SPR-001', title: 'Login with valid bootstrap admin', executedBy: 'Tester 1', date: '2026-05-18', browser: 'Chrome 127 / Win 11', build: '<commit>', status: 'Pass', actual: 'Login worked; dashboard loaded; SESSION_KEY present', bugs: '', time: 2, notes: '' },
    { cycle: 'S1-Cycle1', sprint: 'S1', tcId: 'TC-002', storyId: 'SPR-002', title: 'Login with wrong password', executedBy: 'Tester 1', date: '2026-05-18', browser: 'Chrome 127 / Win 11', build: '<commit>', status: 'Pass', actual: 'Inline error shown as expected', bugs: '', time: 1, notes: '' },
  ];
  examples.forEach((r) => ws.addRow(r));
  for (let i = 0; i < 500; i++) ws.addRow({});

  const totalRows = examples.length + 500;
  applyAlternateRowStriping(ws, 2, totalRows + 1);
  applyListValidation(ws, 'sprint', OPTS.sprint, totalRows);
  applyListValidation(ws, 'executedBy', OPTS.owner, totalRows);
  applyListValidation(ws, 'status', OPTS.executionStatus, totalRows);

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: totalRows + 1, column: ws.columnCount },
  };
}

// 6. Sprint Board sheet ───────────────────────────────────────────────────────
function buildSprintBoard() {
  const ws = wb.addWorksheet('Sprint Board', { properties: { tabColor: { argb: 'FF0891B2' } }, views: [{ state: 'frozen', ySplit: 1 }] });

  ws.columns = [
    { header: 'Sprint', key: 'sprint', width: 8 },
    { header: 'Weeks', key: 'weeks', width: 12 },
    { header: 'Story ID', key: 'storyId', width: 11 },
    { header: 'Title', key: 'title', width: 50 },
    { header: 'Epic', key: 'epic', width: 22 },
    { header: 'Owner', key: 'owner', width: 12 },
    { header: 'Priority', key: 'priority', width: 9 },
    { header: 'Effort', key: 'effort', width: 7 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Committed', key: 'committed', width: 11 },
    { header: 'Done', key: 'done', width: 11 },
    { header: 'Notes', key: 'notes', width: 35 },
  ];

  styleHeader(ws.getRow(1));

  // Pull rows from stories.js + add sprint-level setup rows.
  const sprintWeeks = { S0: 'Week 1', S1: 'Weeks 2–3', S2: 'Weeks 4–5', S3: 'Weeks 6–7', S4: 'Weeks 8–9', S5: 'Week 10' };

  // S0 setup tasks
  const s0Tasks = [
    'Create QA accounts for all 4 testers',
    'Set up SPR-Testing.xlsx in shared drive (OneDrive / SharePoint / Google Drive)',
    'Bootstrap admin password rotated and shared securely',
    'Playwright scaffold + initial smoke suite committed',
    'GitHub Actions e2e workflow green on DevelopmentBranch',
    'Daily bug-triage time on every tester\'s calendar',
  ];
  s0Tasks.forEach((task, idx) => {
    ws.addRow({
      sprint: 'S0',
      weeks: sprintWeeks.S0,
      storyId: `S0-${(idx + 1).toString().padStart(2, '0')}`,
      title: task,
      epic: 'Cross-cutting',
      owner: 'Lead',
      priority: 'P0',
      effort: '2',
      status: 'Sprint',
      committed: 'Yes',
      done: '',
      notes: 'Setup; not a user story',
    });
  });

  // Pull S1–S5 stories
  stories
    .slice()
    .sort((a, b) => a.sprint.localeCompare(b.sprint) || a.id.localeCompare(b.id))
    .forEach((s) => {
      ws.addRow({
        sprint: s.sprint,
        weeks: sprintWeeks[s.sprint] || '',
        storyId: s.id,
        title: s.title,
        epic: s.epic,
        owner: s.owner,
        priority: s.priority,
        effort: String(s.effort),
        status: s.sprint === 'S1' ? 'Sprint' : 'Backlog',
        committed: s.sprint === 'S1' ? 'Yes' : 'No',
        done: '',
        notes: s.notes,
      });
    });

  // S5 special rows
  const s5Extra = [
    { title: 'Full regression run across all P0/P1 stories', owner: 'Lead', priority: 'P0', effort: '5' },
    { title: 'Release Test Report (sign-off doc)', owner: 'Lead', priority: 'P0', effort: '2' },
    { title: 'UAT with project owner (master role)', owner: 'Owner', priority: 'P0', effort: '3' },
  ];
  s5Extra.forEach((row, idx) => {
    ws.addRow({
      sprint: 'S5',
      weeks: sprintWeeks.S5,
      storyId: `S5-X${idx + 1}`,
      title: row.title,
      epic: 'Cross-cutting',
      owner: row.owner,
      priority: row.priority,
      effort: row.effort,
      status: 'Backlog',
      committed: 'No',
      done: '',
      notes: '',
    });
  });

  const totalRows = ws.rowCount - 1;
  applyAlternateRowStriping(ws, 2, totalRows + 1);
  applyListValidation(ws, 'sprint', OPTS.sprint, totalRows);
  applyListValidation(ws, 'epic', OPTS.epic, totalRows);
  applyListValidation(ws, 'owner', OPTS.owner, totalRows);
  applyListValidation(ws, 'priority', OPTS.priority, totalRows);
  applyListValidation(ws, 'effort', OPTS.effort, totalRows);
  applyListValidation(ws, 'status', OPTS.sprintStatus, totalRows);
  applyListValidation(ws, 'committed', OPTS.yesNo, totalRows);
  applyListValidation(ws, 'done', OPTS.yesNo, totalRows);
  applyPriorityColor(ws, 'priority', totalRows);

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: totalRows + 1, column: ws.columnCount },
  };
}

// 7. Automation Coverage sheet ────────────────────────────────────────────────
function buildAutomation() {
  const ws = wb.addWorksheet('Automation Coverage', { properties: { tabColor: { argb: 'FF65A30D' } }, views: [{ state: 'frozen', ySplit: 1 }] });

  ws.columns = [
    { header: 'TC ID', key: 'tcId', width: 10 },
    { header: 'Story ID', key: 'storyId', width: 11 },
    { header: 'Title', key: 'title', width: 50 },
    { header: 'Priority', key: 'priority', width: 9 },
    { header: 'Automation Status', key: 'automation', width: 18 },
    { header: 'Spec File', key: 'spec', width: 35 },
    { header: 'Last Run', key: 'lastRun', width: 14 },
    { header: 'Last Run Result', key: 'lastResult', width: 14 },
    { header: 'Flakiness (%)', key: 'flakiness', width: 12 },
    { header: 'Automation Owner', key: 'autoOwner', width: 16 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];

  styleHeader(ws.getRow(1));

  tests.forEach((t) => {
    // Default automation status by priority and test type:
    let automation = 'Planned';
    if (t.type === 'Smoke') automation = 'Automated';
    else if (t.type === 'Responsive' || t.type === 'Real-time') automation = 'Manual';
    else if (t.priority === 'P3') automation = 'Manual';

    ws.addRow({
      tcId: t.id,
      storyId: t.storyId,
      title: t.title,
      priority: t.priority,
      automation,
      spec: automation === 'Automated' ? 'tests/e2e/' + (t.id.toLowerCase()) + '.spec.ts' : '',
      lastRun: '',
      lastResult: '',
      flakiness: '',
      autoOwner: 'Tester 1',
      notes: '',
    });
  });

  applyAlternateRowStriping(ws, 2, tests.length + 1);
  applyListValidation(ws, 'priority', OPTS.priority, tests.length);
  applyListValidation(ws, 'automation', OPTS.automationStatus, tests.length);
  applyListValidation(ws, 'lastResult', OPTS.runResult, tests.length);
  applyListValidation(ws, 'autoOwner', OPTS.owner, tests.length);
  applyPriorityColor(ws, 'priority', tests.length);

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: tests.length + 1, column: ws.columnCount },
  };
}

// ── Run ─────────────────────────────────────────────────────────────────────
buildReadme();
buildStories();
buildTestCases();
buildBugs();
buildExecution();
buildSprintBoard();
buildAutomation();

const outPath = path.resolve(__dirname, '..', 'SPR-Testing.xlsx');
wb.xlsx
  .writeFile(outPath)
  .then(() => {
    console.log('✓ Wrote ' + outPath);
    console.log('  Stories: ' + stories.length);
    console.log('  Test cases: ' + tests.length);
  })
  .catch((err) => {
    console.error('✗ Failed:', err);
    process.exit(1);
  });

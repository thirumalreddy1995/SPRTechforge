// Epics and user stories for full-application sprint testing (v2.0, 2026-09-23).
// Story format matches testing/generator/data/stories.js (Given/When/Then acceptance criteria).
const EPICS = [
  ['E01', 'Authentication & Users', 'Login, session, first-login password change, forgot password, user CRUD, roles and master flag', 'MOD-01, MOD-02'],
  ['E02', 'Community & Notifications', 'Staff home feed, posts, birthdays, quote/learning of the day, bell notifications, dashboard routing', 'MOD-03, MOD-26'],
  ['E03', 'Candidates & Agreements', 'Candidate CRUD, profiles, login accounts, agreement page and public portal', 'MOD-05, MOD-06, MOD-07'],
  ['E04', 'Enquiries & Web Leads', 'Enquiry CRUD, notes, merge to candidate, website leads handling', 'MOD-08'],
  ['E05', 'Training Delivery', 'Curriculum, attendance, progress monitor, candidate training dashboard', 'MOD-09, MOD-10, MOD-11'],
  ['E06', 'Interviews & Preparation', 'Scheduling, conflicts, results, question bank & bulk upload, prompt practice', 'MOD-12, MOD-13, MOD-14'],
  ['E07', 'Finance (master)', 'Accounts, journal entries, statements, balance sheet, P&L, trial balance, payroll, reports & backup', 'MOD-15, MOD-16, MOD-17'],
  ['E08', 'Events — Administration', 'Event editor wizard, publish rules, event dashboard, registrants, check-in, recap, convert to candidate', 'MOD-27'],
  ['E09', 'Events — Public Registration & Emails', 'Event pages on phone/desktop, registration rules, success card, confirmation & reminder emails', 'MOD-28'],
  ['E10', 'Marketing Links & Attribution', 'Share pages with poster previews, short link, ref codes, source table, sitemap', 'MOD-28'],
  ['E11', 'Public Website & Content Management', 'Website sections and contact actions, enquiry form, admin banners/photos/testimonials/numbers', 'MOD-25, MOD-29'],
  ['E12', 'Communications & Email Outbox', 'Bridge configuration, providers, queue behaviour, outbox admin card', 'MOD-30'],
  ['E13', 'Seminar Campaigns', 'Import, WhatsApp/email campaign, questions, settings, public token page', 'MOD-31'],
  ['E14', 'Admin Tools & Audit', 'Activity logs, cloud setup, test runner safety, address book', 'MOD-04, MOD-22, MOD-23, MOD-24'],
  ['E15', 'Cross-cutting Quality', 'Mobile layout, performance, deploy resilience, permissions matrix, browsers, data integrity', 'NFR §6'],
];

const s = (id, epic, title, description, acceptance, priority, effort, sprint, deps = '', notes = '') => ({ id, epic, title, description, acceptance, priority, effort, status: 'Backlog', sprint, deps, notes });
const G = (g, w, t) => `Given ${g}, when ${w}, then ${t}`;

const STORIES = [
  // ── E01 ──
  s('SPR-101', 'E01', 'Login with valid credentials', 'As a staff member I want to sign in so that I reach my home page.', [
    G('a valid username and password', 'I click Sign In', 'I see "Login successful" and land on /community (master lands on /dashboard)'),
    G('the users stream has not loaded yet', 'I open /login', 'the button reads "Connecting…" and is disabled until ready'),
    G('a successful login', 'I refresh within 60 minutes', 'I stay signed in'),
  ], 'P0', 2, 'S1'),
  s('SPR-102', 'E01', 'Login rejects bad input and wrong credentials', 'Clear, non-enumerating errors for invalid attempts.', [
    G('a username without "@"', 'I submit', 'I see "Enter a valid email address"'),
    G('a password shorter than 4 characters', 'I submit', 'the form blocks submission'),
    G('a wrong password or unknown username', 'I submit', 'I see the same "Invalid credentials" message and stay on /login'),
  ], 'P0', 1, 'S1', 'SPR-101'),
  s('SPR-103', 'E01', 'First-login password change', 'New users and candidate accounts must set their own password.', [
    G('a user with isPasswordChanged = false', 'I log in', 'I see "Set New Password" before anything else'),
    G('a new password shorter than 6 characters or equal to my name', 'I submit', 'I am blocked with a clear message'),
    G('matching valid passwords', 'I click "Update Password & Continue"', 'I land on my home page and the next login works only with the new password'),
  ], 'P0', 2, 'S1', 'SPR-101'),
  s('SPR-104', 'E01', 'Session expiry and logout', 'Sessions last 60 minutes; Sign Out clears them.', [
    G('a session older than 60 minutes', 'I open any protected route', 'I am redirected to /login'),
    G('I click Sign Out', 'the page changes', 'I am on the website home and protected routes redirect to /login'),
  ], 'P1', 1, 'S1'),
  s('SPR-105', 'E01', 'Forgot password request', 'Document the current behaviour so the gap is tracked.', [
    G('the Forgot Password modal', 'I submit a username with "@"', 'I see the message to contact Thirumal Reddy'),
    G('the request was sent', 'an admin opens Users in another browser', 'no request is listed (known gap G-08) — record as expected-fail'),
  ], 'P3', 1, 'S2', '', 'Known gap G-08'),
  s('SPR-106', 'E01', 'Admin creates and edits users', 'Add/Edit User with role and defaults.', [
    G('I am admin', 'I add a user with name and Login ID only', 'the user is created with password = name and must change it at first login'),
    G('I pick role Admin', 'I save', 'modules are [candidates, users, training]'),
    G('I am a non-master admin editing the master', 'I open the form', 'name/login are locked and I cannot change the password'),
  ], 'P1', 2, 'S1'),
  s('SPR-107', 'E01', 'Role and master guards', 'Route wrappers enforce access.', [
    G('a staff user', 'I open /admin/users, /events/manage, /admin/website', 'I am redirected to /dashboard → /community'),
    G('a non-master admin', 'I open /finance/dashboard, /admin/logs, /admin/communication', 'I am redirected'),
    G('a candidate user', 'I open /candidates', 'record whether the page opens (known gap G-03)'),
  ], 'P0', 2, 'S1'),
  s('SPR-108', 'E01', 'Delete user rules', 'Only the master deletes users and never themselves.', [
    G('I am master', 'I open Users', 'Delete is offered on every row except mine'),
    G('I am a non-master admin', 'I open Users', 'no Delete action is shown'),
    G('I delete a user', 'I check System Logs', 'a "User deleted" entry exists'),
  ], 'P1', 1, 'S2', 'SPR-106'),

  // ── E02 ──
  s('SPR-121', 'E02', 'Home routing by role', 'Master sees the Director Dashboard; everyone else lands on Community.', [
    G('I am master', 'I open /dashboard', 'I see the Director Dashboard with the financial toggle off'),
    G('I am staff or candidate', 'I open /dashboard', 'I am redirected to /community'),
    G('I open /chat, /meetings or /email', 'the page loads', 'I am redirected to /community'),
  ], 'P0', 1, 'S1'),
  s('SPR-122', 'E02', 'Director dashboard KPIs', 'Financial KPIs reconcile with Finance.', [
    G('financials toggled on', 'I compare Net Liquidity, Income, Payments', 'they match /finance/dashboard'),
    G('active candidates with dues', 'I read Fees Pending', 'it equals Σ max(0, agreed − paid)'),
    G('scheduled interviews from today', 'I read Active Interview Schedule', 'up to 8 rows appear, today tagged'),
  ], 'P1', 2, 'S2'),
  s('SPR-123', 'E02', 'Create an announcement', 'Admins post announcements visible to the chosen audience.', [
    G('I am admin', 'I click "New announcement", fill Title (≤120) and Message, choose "Everyone"', 'the post appears at the top of the feed within 5 s in another browser'),
    G('I leave the title blank', 'I click Post', 'I see "Give the post a title"'),
    G('I paste a link without http', 'I click Post', 'the link is rejected'),
  ], 'P0', 2, 'S1'),
  s('SPR-124', 'E02', 'Audience and moderation', 'Staff-only posts are hidden from candidates; moderators pin.', [
    G('a post with audience "Staff only"', 'a candidate opens Community', 'the post is not visible'),
    G('I am admin', 'I tick "Pin to top"', 'the post shows 📌 Pinned and sorts first'),
    G('I am the author (staff)', 'I open the post menu', 'I can Edit and Delete my own post only'),
  ], 'P1', 2, 'S2', 'SPR-123'),
  s('SPR-125', 'E02', 'Reactions and expiry', 'Reactions toggle per user; posts hide after their date.', [
    G('a post', 'I click 🎉 twice', 'the count increments then decrements'),
    G('a post with "Hide after" yesterday', 'I open the feed today', 'the post is no longer listed'),
  ], 'P2', 1, 'S2'),
  s('SPR-126', 'E02', 'Birthdays', 'Birthdays come from candidate profile DOB.', [
    G('an active candidate whose profile DOB is today', 'I open Community', 'a birthday card with "turns N" appears and "Post wishes" is offered once'),
    G('a DOB within the next 8 days', 'I read Upcoming birthdays', 'it is listed with Tomorrow or the date'),
    G('DOB 29 Feb in a non-leap year', 'I check', 'it falls on 1 Mar'),
  ], 'P2', 2, 'S2'),
  s('SPR-127', 'E02', 'Quote and Learning of the day', 'Daily content with offline fallback.', [
    G('a normal connection', 'I open Community', 'a quote and a learning tip are shown and stay the same all day'),
    G('dummyjson.com blocked', 'I reload', 'a fallback quote is shown and no error appears'),
    G('I click "Share your own tip"', 'the composer opens', 'the type is preset to Learning'),
  ], 'P2', 1, 'S2'),
  s('SPR-128', 'E02', 'Notification bell', 'New posts notify everyone except the author.', [
    G('another user posts', 'I look at the bell', 'the badge count increments and the panel lists the post'),
    G('I click the item', 'it opens', 'it is marked read and I am taken to /community'),
    G('I click "Mark all read"', 'the panel closes', 'the badge disappears'),
  ], 'P1', 1, 'S2', 'SPR-123'),
  s('SPR-129', 'E02', 'Photo carousel on Community', 'Moments carousel with manage mode for staff.', [
    G('I am staff', 'I add 3 photos with captions', 'they appear in the carousel, autoplaying every 5 s, pausing on hover'),
    G('I reorder and remove one', 'I click Done', 'the order persists after reload'),
  ], 'P3', 2, 'S3'),

  // ── E03 ──
  s('SPR-141', 'E03', 'Add a candidate with validation', 'All required fields and duplicate protection.', [
    G('the Add Candidate form', 'I submit without name/batch/email/phone', 'the first missing field is reported in order'),
    G('a 9-digit phone', 'I submit', 'I am blocked and the hint shows digits needed'),
    G('an email or phone already used by another candidate', 'I submit', 'I see "A candidate with this Email or Phone Number already exists."'),
    G('valid data', 'I save', 'the candidate appears in Active with status Training and a CREATE log exists'),
  ], 'P0', 2, 'S1'),
  s('SPR-142', 'E03', 'Candidate list tabs, filters and amounts', 'Tabs by status; amounts masked.', [
    G('candidates in each status', 'I switch tabs', 'Active shows Training + Ready; Placed and Discontinued show theirs; counts in the header match'),
    G('amounts masked', 'I click Show Amounts', 'Agreed/Paid/Due reveal; Due shows "✓ Cleared" when ≤ 0'),
    G('a search for a phone number', 'I type it', 'only that candidate remains'),
  ], 'P1', 2, 'S1', 'SPR-141'),
  s('SPR-143', 'E03', 'Delete candidate rules', 'Master-only and blocked when transactions exist.', [
    G('I am staff', 'I click Delete', 'I see "Only the Director can delete candidates"'),
    G('I am master and the candidate has transactions', 'I click Delete', 'I see "Cannot delete: candidate has financial entries…"'),
    G('I am master and no transactions exist', 'I confirm', 'the candidate is removed and logged'),
  ], 'P1', 1, 'S2', 'SPR-141'),
  s('SPR-144', 'E03', 'Create login account for a candidate', 'Candidate portal access from the list.', [
    G('a candidate with an email and no user', 'I click Create Login Account', 'a candidate user is created (username = email, password = phone) and first login forces a change'),
    G('the same candidate', 'I click again', 'I see "Account already exists"'),
    G('a candidate without email', 'I click', 'I am told an email is required'),
  ], 'P1', 2, 'S2', 'SPR-141,SPR-103'),
  s('SPR-145', 'E03', 'Candidate profile self-service and admin view', 'Profile tabs and read-only rules.', [
    G('I am a linked candidate', 'I fill Personal/Education/Experience and click Update My Profile', 'the profile is saved and shows on staff view'),
    G('I am staff', 'I open a profile', 'all fields are disabled and Training Progress / Interview History tabs are read-only'),
    G('I am admin', 'I click Export CSV', 'the filtered profiles download'),
  ], 'P1', 2, 'S2'),
  s('SPR-146', 'E03', 'Agreement lifecycle (staff side)', 'Sent → Accepted / Rejected with dates.', [
    G('a candidate with email', 'I click "Email Agreement & Link"', 'a mail draft opens with the portal link and agreementSentDate is set'),
    G('I click "Mark as Accepted" and confirm', 'the page reloads', 'the Accepted badge shows the date and rejection fields are cleared'),
    G('I click "Print / Save PDF"', 'the print dialog opens', 'the printable body shows logo, details, text, stamp and address'),
  ], 'P1', 2, 'S2'),
  s('SPR-147', 'E03', 'Public agreement portal', 'Candidate accepts or rejects via the link without login.', [
    G('a fresh incognito window', 'I open the portal link from the email', 'the agreement loads (if it stays on "Loading Agreement…", record gap G-21 as a P0 bug)'),
    G('the consent box unticked', 'I click Accept & Sign', 'I am told to tick the box'),
    G('I choose Reject with a reason', 'I confirm', 'the staff page shows Rejected with the reason'),
  ], 'P0', 2, 'S2', 'SPR-146', 'Suspected defect G-21'),
  s('SPR-148', 'E03', 'Candidate exports', 'CSV completeness.', [
    G('filters applied', 'I click Export CSV on the list', 'the file contains all candidates (documented behaviour) with paid and due columns'),
  ], 'P3', 1, 'S3'),

  // ── E04 ──
  s('SPR-161', 'E04', 'Enquiry CRUD and notes', 'Capture and follow up prospects.', [
    G('the New Enquiry form', 'I save with name and 10-digit phone', 'the row appears with status Enquiry and the KPI counts update'),
    G('an enquiry', 'I add a discussion note', 'the note shows my name and date and cannot be edited or deleted'),
    G('a phone of 9 digits', 'I save', 'I am blocked'),
  ], 'P0', 2, 'S1'),
  s('SPR-162', 'E04', 'Merge enquiry to candidate', 'Master-only conversion.', [
    G('I am master', 'I click Merge to Candidate and confirm', 'a candidate is created with batch (or TBD), agreed = committed amount, notes copied; enquiry becomes Joined, Merged and read-only; two log entries exist'),
    G('I am staff', 'I open the enquiry', 'Merge is not offered'),
    G('a merged enquiry', 'I try Edit or Add Note', 'both are unavailable'),
  ], 'P1', 2, 'S2', 'SPR-161'),
  s('SPR-163', 'E04', 'Web leads handling', 'Leads from the website form.', [
    G('a submitted website enquiry', 'I open Web Enquiries', 'the lead is bold/unread with the red badge count, service = "interest · mode"'),
    G('I open it', 'the modal shows', 'it is marked read; status dropdown saves immediately; internal note saves as I type'),
    G('I click Delete Lead', 'I confirm', 'it disappears and the counts update'),
  ], 'P1', 2, 'S1'),
  s('SPR-164', 'E04', 'Enquiry and lead exports', 'CSV downloads.', [
    G('a filtered enquiry list', 'I export', 'only filtered rows are included with notes joined by " | "'),
    G('web leads', 'I export', 'the CSV opens in Excel with all columns'),
  ], 'P3', 1, 'S3'),

  // ── E05 ──
  s('SPR-181', 'E05', 'Curriculum modules and topics', 'Admin builds the syllabus.', [
    G('I am admin', 'I create a module and two topics with hours', 'they appear in order and the topic hours show "(Nh)" in Attendance'),
    G('I am staff', 'I open Curriculum', 'no create/edit/delete controls are shown'),
    G('I delete a module', 'I confirm', 'topics remain orphaned (record as gap G-16)'),
  ], 'P1', 2, 'S2'),
  s('SPR-182', 'E05', 'Mark daily attendance', 'One log per candidate per day.', [
    G('a date and no topic', 'I click Save Attendance', 'I see "Please select the Topic covered today before saving."'),
    G('a topic and statuses Present/Absent/Excused', 'I save', 'logs are created; Present gets topic hours × 60 minutes; Excused stored as No Class'),
    G('I reopen the same date', 'the sheet loads', 'existing statuses and topic are pre-filled and saving updates rather than duplicates'),
  ], 'P0', 2, 'S2', 'SPR-181'),
  s('SPR-183', 'E05', 'Attendance exports', 'Summary and full history CSVs.', [
    G('saved attendance', 'I click Export Today\'s Summary', 'per-candidate totals and today\'s status download'),
    G('I click Export Full History', 'the file downloads', 'each row has date, candidate, topic, attendance and minutes'),
  ], 'P2', 1, 'S3', 'SPR-182'),
  s('SPR-184', 'E05', 'Progress monitor and candidate dashboard', 'Progress % and hours agree everywhere.', [
    G('logs for a candidate', 'I open Progress Tracker', 'Topics % = unique topics with a log ÷ total topics; attendance = Present/total'),
    G('the same candidate logs in', 'they open Training Stats', 'Total Hours and Progress % match the monitor and covered topics are struck through'),
  ], 'P1', 2, 'S2', 'SPR-182'),

  // ── E06 ──
  s('SPR-201', 'E06', 'Schedule an interview', 'Required fields and conflict rule.', [
    G('an active candidate', 'I schedule with date, start time, company', 'it appears under Active Schedule grouped by date and the sidebar badge increments'),
    G('another interview overlapping the same time', 'I save', 'I see "This slot conflicts…" (global rule)'),
    G('missing company', 'I save', 'I am blocked'),
  ], 'P0', 2, 'S2'),
  s('SPR-202', 'E06', 'Candidate requests a slot; staff confirms or rejects', 'Pending approval flow.', [
    G('I am a candidate', 'I request a slot', 'status is pending_confirmation and I see "awaiting admin confirmation"'),
    G('I am staff', 'I click Confirm', 'status becomes Scheduled (note the confirm button label — gap G-25)'),
    G('I click Reject', 'I confirm', 'status becomes Cancelled; no notification is sent (gap G-25)'),
  ], 'P1', 2, 'S2', 'SPR-201'),
  s('SPR-203', 'E06', 'Update interview result', 'Status history and feedback.', [
    G('a scheduled interview', 'I set Attended then Cleared with feedback', 'statusHistory has both entries with my name; feedback shows author and time'),
    G('Cleared', 'I open the candidate', 'status is unchanged (gap G-25: not auto-Placed)'),
  ], 'P1', 2, 'S2', 'SPR-201'),
  s('SPR-204', 'E06', 'Resume upload and Ready Candidates', 'Resume rules.', [
    G('a Ready for Interview candidate', 'I upload a 6 MB PDF', 'I am blocked at 5 MB'),
    G('a valid PDF', 'I upload and click View', 'a preview opens; DOCX offers download'),
  ], 'P2', 1, 'S3'),
  s('SPR-205', 'E06', 'Interview exports and candidate stats', 'CSV columns and per-candidate counts.', [
    G('interviews with several statuses', 'I export all', 'columns include feedback, scheduled by and status'),
    G('a candidate in Candidate Stats', 'I select them', 'Total/Attended/Cleared/Rejected/No-show/Pending are correct'),
  ], 'P3', 1, 'S3'),
  s('SPR-206', 'E06', 'Question bank management', 'Modules and questions.', [
    G('I am admin', 'I add a module with a colour and a question', 'the card renders with the colour and the question'),
    G('anyone', 'I click a question', 'the prompt is copied and chatgpt.com opens in a new tab'),
    G('I delete selected questions', 'I confirm', 'they disappear; deleting a module leaves its questions (gap G-16)'),
  ], 'P1', 2, 'S2'),
  s('SPR-207', 'E06', 'Bulk upload questions', 'Paste or file import.', [
    G('a .xlsx with a "Question" header and 20 rows', 'I upload and import', '20 questions are added after the module\'s last order and a log entry exists'),
    G('pasted text with blank lines', 'I preview', 'blank lines are skipped and up to 50 rows preview'),
    G('no module exists', 'I open Bulk Upload', 'I am told to create a module first'),
  ], 'P1', 2, 'S2', 'SPR-206'),
  s('SPR-208', 'E06', 'Prompt practice session', 'Speech-based practice with scoring.', [
    G('at least one category and 5 questions', 'I start a session and answer', 'each question shows a score, missed keywords and feedback band'),
    G('the last question', 'I finish', 'the session auto-saves with score and grade and appears in History'),
    G('microphone unavailable', 'I start', 'I can type my answer instead'),
  ], 'P2', 3, 'S3'),
  s('SPR-209', 'E06', 'Prompt practice admin view', 'Sessions overview and custom questions.', [
    G('saved sessions', 'I open Admin View → Sessions', 'ranking, averages and Not Yet Attempted are correct; PDF export opens print'),
    G('I add a custom question', 'I open the same page on another browser', 'the question is missing (gap G-27) — record'),
  ], 'P3', 2, 'S4'),

  // ── E07 ──
  s('SPR-221', 'E07', 'Chart of accounts', 'Create, edit, group and delete accounts.', [
    G('I am master', 'I create a Bank account with opening balance', 'it appears under Assets with the balance and in KPIs'),
    G('a Salary account', 'I fill Fixed Monthly Obligations', 'the fields save and the account appears in Payroll'),
    G('the system Office Cash account', 'I try to delete', 'the UI refuses'),
  ], 'P0', 2, 'S3'),
  s('SPR-222', 'E07', 'Journal entries of each type', 'Double-entry recording.', [
    G('type Income from a candidate into Bank', 'I save', 'the candidate\'s Paid increases and Bank balance increases'),
    G('type Payment to an Expense from Cash', 'I save', 'Cash decreases and the expense shows in Top Expenses'),
    G('type Transfer and Refund', 'I save each', 'balances move as per Dr/Cr labels'),
    G('missing account or zero amount', 'I save', 'I see the corresponding alert'),
  ], 'P0', 3, 'S3', 'SPR-221'),
  s('SPR-223', 'E07', 'Transaction register filters and export', 'Find and export entries.', [
    G('entries of all types', 'I click a summary tile', 'the list filters to that type and Net = Income − Payment'),
    G('date range and account filters', 'I apply them', 'only matching rows remain; Export contains the filtered set'),
    G('I edit an entry', 'I save', 'isLocked resets to false (gap G-26)'),
  ], 'P1', 2, 'S3', 'SPR-222'),
  s('SPR-224', 'E07', 'Account and candidate statements', 'Running balances.', [
    G('an account with transactions', 'I open its statement with a date range', 'Opening b/f, Dr/Cr columns and running balance suffixes are correct; CSV and Print work'),
    G('a candidate statement', 'I open it', 'Paid and Refunds reconcile with the candidate list'),
  ], 'P1', 2, 'S3', 'SPR-222'),
  s('SPR-225', 'E07', 'Balance sheet, P&L and trial balance', 'Reports reconcile.', [
    G('the sample data set', 'I open Balance Sheet', 'Assets = Liabilities + implied Equity'),
    G('a P&L period', 'I set dates', 'income and expense groups sum to the entries in that period; compare with dashboard and note differences (documented)'),
    G('Trial Balance', 'I open it', '"balanced" banner or a difference is shown; Print/PDF works'),
  ], 'P1', 3, 'S4', 'SPR-222'),
  s('SPR-226', 'E07', 'Payroll schedule', 'Months due, paid and pending.', [
    G('a Salary account since 3 months with monthly 20,000', 'I open Payroll', 'Months Due = 3, Payable = 60,000, Paid = Σ Payment entries, Pending = difference'),
    G('a salary paid by Transfer', 'I check Paid', 'it is not counted (gap G-05) — record'),
  ], 'P2', 2, 'S4', 'SPR-221'),
  s('SPR-227', 'E07', 'Reports, backup and restore (QA only)', 'Full Excel report and JSON backup.', [
    G('/finance/reports', 'I download the full report', 'the .xls opens with Candidates, Transactions, Debtors, Creditors, Balance Sheet, P&L sheets'),
    G('I export the database', 'I import the same JSON on QA', 'data is restored and a restore log exists'),
  ], 'P3', 2, 'S5', '', 'QA only — never restore on production'),

  // ── E08 ──
  s('SPR-241', 'E08', 'Create an event through the wizard', 'Five steps with draft saving.', [
    G('a new event', 'I complete Basics with a 201-character short description', 'the field caps at 200'),
    G('I move between steps', 'I refresh', 'the draft is preserved and the header shows "All changes saved ✓"'),
    G('Online mode without a Join URL', 'I open Review & Publish', 'the issue is listed with "Fix in step 2" and Publish is disabled'),
  ], 'P0', 3, 'S1'),
  s('SPR-242', 'E08', 'Banner and content rules', 'Banner required and size-limited.', [
    G('a 6 MB banner', 'I upload', 'I see "Banner exceeds the 5 MB limit"'),
    G('a valid banner, speaker, agenda and lists', 'I save', 'the public page shows them in order'),
    G('a YouTube link', 'I paste it', 'a preview embeds; a non-YouTube link is flagged'),
  ], 'P1', 2, 'S1', 'SPR-241'),
  s('SPR-243', 'E08', 'Registration settings and custom questions', 'Capacity, waitlist, fields.', [
    G('capacity 2 with waitlist on', 'three people register', 'the third is waitlisted and the counters show 2 / 1'),
    G('a dropdown custom question with 5 options marked required', 'a registrant leaves it blank', 'submission is blocked'),
    G('City unticked', 'I open the public form', 'no City field is shown'),
  ], 'P0', 3, 'S2', 'SPR-241'),
  s('SPR-244', 'E08', 'Publish and slug', 'Publishing makes the event public with a stable link.', [
    G('all issues fixed', 'I click Publish Event', 'the live modal shows /e/<slug>/ and the event appears on /events'),
    G('I edit the title later', 'I save', 'the slug is unchanged'),
    G('a very long title', 'I publish', 'the slug is ≤60 characters and unique'),
  ], 'P0', 2, 'S1', 'SPR-241'),
  s('SPR-245', 'E08', 'Edit a published event with notification', 'Registrant-facing changes prompt.', [
    G('a published event with registrants', 'I change the start time and click Save Changes', 'I am asked to confirm and offered "Save & email the update" or "Save without notifying"'),
    G('I choose to notify', 'I check a registrant inbox', 'a change-notice email arrives with the new time'),
  ], 'P1', 2, 'S2', 'SPR-244'),
  s('SPR-246', 'E08', 'Event dashboard overview and share card', 'Counters, private join button, share tools.', [
    G('a published event', 'I open its dashboard', 'counters match registrations; Join Meeting button and Copy link are shown, never the raw URL'),
    G('the share card', 'I click Copy / WhatsApp / LinkedIn / Open public page', 'each works with the /e/<slug>/ link'),
  ], 'P1', 2, 'S2', 'SPR-244'),
  s('SPR-247', 'E08', 'Registrations tab: search, details, follow-up, export', 'Manage registrants.', [
    G('several registrations', 'I search by name and filter by status', 'the list narrows correctly'),
    G('a registrant', 'I open details and change follow-up status', 'it persists; source and consents are shown'),
    G('I click Export CSV', 'the file downloads', 'it includes a Source column and custom answers'),
  ], 'P1', 2, 'S2', 'SPR-243'),
  s('SPR-248', 'E08', 'Email selected registrants', 'Custom message via the outbox.', [
    G('two selected registrants', 'I send a message', 'each receives it within 2 minutes with event details, Join button, community box and footer; nobody else does'),
    G('no mailer configured', 'I open the action', 'it is disabled with an explanation'),
  ], 'P1', 2, 'S2', 'SPR-247,SPR-321'),
  s('SPR-249', 'E08', 'Check-in and recap', 'Attendance on the day and post-event data.', [
    G('event day', 'I mark two registrants Attended and one No-show', 'counters update and statuses show in the list'),
    G('after the event', 'I save recording URL, attendee count, photo URLs and notes', 'they persist on reload'),
  ], 'P2', 2, 'S3', 'SPR-247'),
  s('SPR-250', 'E08', 'Convert registrant to candidate', 'Bridge to the recruitment funnel.', [
    G('an attended registrant', 'I convert with a ₹5,000 sign-up payment', 'a candidate is created and an Income transaction appears in Finance'),
    G('I convert without a payment', 'I confirm', 'only the candidate is created and the registration links to it'),
  ], 'P1', 2, 'S3', 'SPR-249,SPR-222'),
  s('SPR-251', 'E08', 'Unpublish, cancel, delete rules', 'Lifecycle protections.', [
    G('a published event with zero registrations', 'I open the dashboard', 'Unpublish is offered'),
    G('a published event with registrations', 'I open the dashboard', 'only Cancel and (master) Delete are offered'),
    G('I cancel with a reason and notify', 'I confirm', 'registrants receive the cancellation email; the public page shows cancelled'),
    G('I am a non-master admin', 'I look for Delete permanently', 'it is not offered'),
  ], 'P0', 2, 'S2', 'SPR-244'),

  // ── E09 ──
  s('SPR-261', 'E09', 'Event page renders on phone and desktop', 'Content and layout.', [
    G('a published event', 'I open it on a 390 px phone', 'banner, badges, title, details, sections, form and footer render without horizontal scroll; sticky Register bar appears only when the form is off screen'),
    G('a laptop', 'I open it', 'the form is in the right column and the hero button scrolls to it'),
    G('the banner', 'I tap it', 'the page scrolls to the form'),
  ], 'P0', 2, 'S1', 'SPR-244'),
  s('SPR-262', 'E09', 'Registration validation', 'Field rules and bot guard.', [
    G('a 9-digit Indian mobile', 'I submit', 'I see "Enter valid Mobile number"'),
    G('country changed to another code', 'I enter that country\'s number', 'validation follows the selected country'),
    G('consent unticked', 'I submit', 'I am blocked'),
    G('I submit within 2 seconds of the page opening', 'the form responds', 'I see "That was fast! Please review your details and try again."'),
  ], 'P0', 2, 'S1', 'SPR-261'),
  s('SPR-263', 'E09', 'Successful registration and success card', 'Everything a registrant needs.', [
    G('valid details', 'I submit', 'a code SPR-WEB-XXXXXXX, Join Meeting on <platform> button (real link), WhatsApp community button, Google Calendar, .ics, Invite a friend, email status and website link are shown'),
    G('an offline event', 'I register', 'venue details replace the Join button'),
    G('the confirmation counter', 'I check the admin', 'Confirmed increments by exactly one'),
  ], 'P0', 2, 'S1', 'SPR-262'),
  s('SPR-264', 'E09', 'Duplicate registration and contact correction', 'Same email or mobile.', [
    G('an existing registration', 'I register again with the same email or mobile', 'the already-registered card shows my code'),
    G('the card', 'I correct my email and resend', 'the record updates and a new confirmation is queued'),
  ], 'P1', 2, 'S2', 'SPR-263'),
  s('SPR-265', 'E09', 'Waitlist path', 'Limited capacity behaviour.', [
    G('a full event with waitlist', 'I register', 'I am waitlisted; the card and email say so and no Join button is shown'),
    G('a full event without waitlist', 'I open the page', 'registration is closed with a message'),
  ], 'P1', 2, 'S2', 'SPR-243'),
  s('SPR-266', 'E09', 'Confirmation email content', 'Rendering across clients.', [
    G('a registration', 'I open the email in Gmail app, Outlook and Apple Mail', 'from admin@sprtechforge.com; banner as image not attachment; Join button; code; community box; contact footer; logo; map-linked address'),
    G('the email', 'I tap each link', 'event page, Teams/Meet, WhatsApp invite, dialer, mail, Maps, website all open correctly'),
  ], 'P0', 2, 'S1', 'SPR-263,SPR-321'),
  s('SPR-267', 'E09', 'Reminder and cancellation emails', 'Templates share the footer.', [
    G('the admin sends a reminder message', 'I receive it', 'my message text appears above the event block with Join button and community box'),
    G('the event is cancelled with notify', 'I receive it', 'the cancellation email states the reason and no Join button is present'),
  ], 'P1', 1, 'S2', 'SPR-248,SPR-251'),
  s('SPR-268', 'E09', 'Public events list', 'Listing rules.', [
    G('published upcoming and a cancelled event', 'I open /events', 'upcoming ones show with banners and Register free; cancelled is flagged; drafts are absent'),
    G('I click Register free', 'the event opens', 'scrolled to the top'),
  ], 'P1', 1, 'S1'),
  s('SPR-269', 'E09', 'Invite a friend and calendar files', 'Sharing from the success card.', [
    G('the success card', 'I tap Invite a friend on WhatsApp', 'WhatsApp opens with plain text (no broken characters) containing the /e/<slug>/ link'),
    G('I tap Download .ics', 'the file opens', 'title, IST time and event link are correct; Google Calendar link pre-fills the same'),
  ], 'P2', 1, 'S2', 'SPR-263'),
  s('SPR-270', 'E09', 'Burst registration (QA load)', 'Reliability under load.', [
    G('a QA event with unlimited capacity', 'we fire 300 registrations at 100 concurrency', '100% succeed, codes are unique, counters are exact, and the outbox drains at 24/min with 0 failures'),
  ], 'P1', 3, 'S3', 'SPR-321', 'Use the load script on QA only'),

  // ── E10 ──
  s('SPR-281', 'E10', 'Share link preview shows the event poster', 'WhatsApp / LinkedIn previews.', [
    G('a published event (rebuilt)', 'I paste /e/<slug>/ in WhatsApp', 'the card shows the event banner, title and IST date'),
    G('I paste the site root', 'the preview renders', 'it shows the company poster instead'),
    G('a cancelled event', 'I paste its link', 'the title starts with [Cancelled]'),
  ], 'P0', 2, 'S1', 'SPR-244'),
  s('SPR-282', 'E10', 'Share page forwards humans into the app', 'Redirect behaviour.', [
    G('/e/<slug>/?ref=abc', 'I open it', 'I land on /#/events/<slug>?ref=abc'),
    G('/e/not-a-real-event/', 'I open it', 'the app shows its event-not-found page, not a blank 404'),
  ], 'P0', 1, 'S1'),
  s('SPR-283', 'E10', 'Short link /webinar', 'Always the next upcoming event.', [
    G('one upcoming published event', 'I open /webinar?ref=x', 'I land on that event with ?ref=x kept and the preview shows its poster'),
    G('no upcoming event', 'I open /webinar', 'I land on /#/events'),
  ], 'P1', 1, 'S1'),
  s('SPR-284', 'E10', 'Ref code attribution end to end', 'Influencer tracking.', [
    G('a link with ?ref=inf1', 'I register after visiting the home page and coming back', 'the admin source table shows inf1 with 1 and the CSV Source column says inf1'),
    G('a plain link', 'I register', 'the registration counts under Direct / untagged'),
    G('?ref=Priya Test!', 'I open it', 'the stored source is priyatest'),
  ], 'P0', 2, 'S1', 'SPR-263'),
  s('SPR-285', 'E10', 'Influencer link builder', 'Admin tooling.', [
    G('the share card', 'I type a code', 'the link ends with ?ref=<clean code>; Copy and Send via WhatsApp work; the /webinar hint is shown'),
  ], 'P2', 1, 'S2', 'SPR-246'),
  s('SPR-286', 'E10', 'SEO files and structured data', 'Crawler basics.', [
    G('production', 'I fetch /robots.txt and /sitemap.xml', 'both return 200; sitemap lists home and every published share page'),
    G('the home page source', 'I inspect', 'the title is the company title and JSON-LD Organization/WebSite/SiteNavigation is present'),
  ], 'P3', 1, 'S3'),

  // ── E11 ──
  s('SPR-301', 'E11', 'Website renders correctly on a phone', 'Layout at 390 px.', [
    G('the home page on a phone', 'I scroll top to bottom', 'the header stays opaque, nothing shows through it, no horizontal scroll, dots sit below hero buttons on every slide, WhatsApp bubble does not cover footer text'),
    G('the hamburger menu', 'I tap a section', 'the page scrolls to it and the menu closes'),
  ], 'P0', 2, 'S1'),
  s('SPR-302', 'E11', 'Hero carousel behaviour', 'Slides and side panels.', [
    G('default slides on desktop', 'I click a track tile / service tile', 'the page scrolls to Training / Services'),
    G('autoplay', 'I wait 6 s', 'the slide advances; hovering pauses; swipe and arrow keys work'),
    G('admin banners active', 'I reload', 'they replace the default slides in order'),
  ], 'P1', 2, 'S1', 'SPR-311'),
  s('SPR-303', 'E11', 'Contact actions', 'Every contact element works.', [
    G('the Contact section on Android, iPhone and laptop', 'I tap phone icon, number, WhatsApp chip, email icon, address, map pin, socials', 'dialer, WhatsApp, mail app, Google Maps and social pages open'),
  ], 'P0', 1, 'S1'),
  s('SPR-304', 'E11', 'Enquiry form validation and submission', 'Lead capture.', [
    G('empty form', 'I submit', 'name message; then mobile message for 9 digits; then the email-required message'),
    G('valid data', 'I submit', 'I see "Thanks! We have your enquiry." and the lead appears in Web Enquiries with interest · mode'),
  ], 'P0', 1, 'S1', 'SPR-163'),
  s('SPR-305', 'E11', 'Testimonials and gallery carousels', 'Single-row carousels.', [
    G('≥2 testimonial images', 'I view the section', 'same-size cards in one row, arrows and dots work, auto-advance, tap enlarges'),
    G('gallery photos', 'I view', 'uniform tiles scroll horizontally with a lightbox'),
    G('no images', 'I view', 'the sections are hidden entirely'),
  ], 'P1', 2, 'S2', 'SPR-312'),
  s('SPR-306', 'E11', 'Upcoming events on the website', 'Cross-module listing.', [
    G('a published upcoming event', 'I open the home page', 'it appears with banner and Register free; past or draft events do not'),
  ], 'P1', 1, 'S1', 'SPR-244'),
  s('SPR-307', 'E11', 'Numbers strip and FAQ', 'Admin numbers and static content.', [
    G('stats entered', 'I view', 'count-up numbers show; a 0 hides its tile; all 0 shows the promise line'),
    G('the FAQ', 'I tap questions', 'one opens at a time'),
    G('Privacy / Terms', 'I click', 'modals open'),
  ], 'P2', 1, 'S2', 'SPR-313'),
  s('SPR-311', 'E11', 'Admin manages hero banners', 'Website Content → Hero banners.', [
    G('I add a banner with image, headline (≤90), sub-text, button and target', 'I save', 'it shows on the website first slide; Hide removes it; reorder changes order'),
  ], 'P1', 2, 'S1'),
  s('SPR-312', 'E11', 'Admin manages photos and testimonials', 'Image-only content.', [
    G('I upload 3 photos and caption one', 'I reload the website', 'they appear in the gallery with the caption'),
    G('I upload 2 testimonial images', 'I reload', 'both appear as equal cards; Hide removes one; Replace swaps the image'),
    G('the Testimonials tab', 'I look for text fields', 'none exist — upload only'),
  ], 'P1', 2, 'S1'),
  s('SPR-313', 'E11', 'Admin manages numbers and links', 'Settings validation.', [
    G('a URL without http', 'I save', 'I see "Links must start with http:// or https://"'),
    G('valid social links and the community link', 'I save', 'icons appear on the site and the community button uses the new link'),
    G('the map link', 'I change it', 'the contact map pin opens the new location'),
  ], 'P1', 1, 'S1'),
  s('SPR-314', 'E11', 'Brand assets', 'Real logo everywhere.', [
    G('website, login, event pages, sidebar, printed agreement, emails, browser tab, WhatsApp preview', 'I check', 'the official SPR logo is used, not a drawn substitute'),
  ], 'P2', 1, 'S2'),

  // ── E12 ──
  s('SPR-321', 'E12', 'Email bridge configuration', 'Runtime settings for the master.', [
    G('Communication Settings', 'I click Test Email Connection', 'it reports Outlook / Microsoft 365 and the sender'),
    G('a wrong secret', 'I test', 'a friendly "shared secret does not match" message appears'),
    G('I click Save for All Users', 'another admin reloads', 'the same configuration is active (source: Cloud settings)'),
  ], 'P0', 1, 'S1'),
  s('SPR-322', 'E12', 'Outbox queues and drains', 'Rate-limited delivery.', [
    G('a registration', 'I refresh the outbox card', 'Pending 1 → 0 within about a minute and Sent (24 h) increments; "Worker trigger: installed"'),
    G('30 registrations in one minute (QA)', 'I watch the card', 'they drain at ≤24/min with 0 failures'),
    G('an unreachable domain', 'I wait', 'the row ends Failed after 4 attempts and Retry failed re-queues it'),
  ], 'P0', 2, 'S1', 'SPR-321'),
  s('SPR-323', 'E12', 'Send queued now and outbox sheet', 'Manual controls.', [
    G('pending rows', 'I click Send queued now', 'they are sent immediately'),
    G('I click Open outbox sheet', 'the sheet opens', 'rows match the card counters'),
  ], 'P2', 1, 'S2', 'SPR-322'),
  s('SPR-324', 'E12', 'Idempotent confirmation', 'No duplicate mails on retries.', [
    G('a registrant clicks resend twice within seconds', 'I inspect the outbox', 'only one pending row exists for that event/email/subject'),
  ], 'P2', 1, 'S2', 'SPR-264'),
  s('SPR-325', 'E12', 'Storage test and fallback', 'Uploads without a bucket.', [
    G('production without Storage', 'I click Test Firebase Storage', 'the result explains the inline fallback and uploads still succeed as inline images'),
  ], 'P3', 1, 'S3'),

  // ── E13 ──
  s('SPR-341', 'E13', 'Import invitees from Excel', 'Mapping and dedupe.', [
    G('the template with 5 rows including 1 duplicate and 1 invalid email', 'I import', 'report shows 4 imported, 1 duplicate, 1 invalid email; tokens are unique'),
    G('a sheet without a name column', 'I preview', 'the sheet is skipped with the reason'),
    G('re-importing the same file', 'I confirm', 'rows are updated (merged), not duplicated'),
  ], 'P1', 2, 'S3'),
  s('SPR-342', 'E13', 'Email campaign with dry run and limits', 'Resumable sending.', [
    G('dry run ticked', 'I send invites', 'nothing is sent and the log shows simulated lines'),
    G('daily limit 3 and 5 pending', 'I send', '3 are sent, status Sent Today = 3, and the button reads Resume Sending (2 pending)'),
    G('Send Test to Myself', 'I click', 'I receive "[TEST] …" and a test log entry exists'),
  ], 'P1', 2, 'S3', 'SPR-341,SPR-321'),
  s('SPR-343', 'E13', 'Public seminar page and Q&A', 'Token-based registration.', [
    G('a valid token link', 'I reserve an in-person seat and ask a question', 'the dashboard shows the registration and the question within 5 s'),
    G('a bad token', 'I open the link', 'I see "This link doesn\'t look right"'),
    G('6 questions within a minute', 'I submit', 'the 6th is blocked with the rate message'),
  ], 'P1', 2, 'S3', 'SPR-341'),
  s('SPR-344', 'E13', 'Reply to a question', 'Reply emailed and saved.', [
    G('an unanswered question', 'I reply', 'the reply is saved, marked emailed, and the invitee receives "Re: your question…"'),
  ], 'P2', 1, 'S3', 'SPR-343'),
  s('SPR-345', 'E13', 'WhatsApp blast and exports', 'Manual WhatsApp flow.', [
    G('filtered candidates with phones', 'I start the blast', 'each chat opens in one window with the rendered message; the candidate is marked WA✓ when opened'),
    G('I export WhatsApp CSV', 'the file downloads', 'Name, Phone, Message columns'),
  ], 'P3', 1, 'S4', 'SPR-341'),
  s('SPR-346', 'E13', 'Seminar settings and banner', 'Configuration rules.', [
    G('a 3 MB banner', 'I upload', 'I am blocked at 2 MB'),
    G('a 500 px wide image', 'I upload', 'I am blocked (min 600 px)'),
    G('seat limit reached', 'a new invitee registers', 'registration is not blocked (gap G-31) — record'),
  ], 'P3', 1, 'S4'),

  // ── E14 ──
  s('SPR-361', 'E14', 'Activity logs', 'Audit coverage and export.', [
    G('a login, user add, candidate add, transaction create', 'I open System Logs', 'each has an entry with my name and time; search and paging work; Export CSV downloads'),
    G('a candidate update or interview change', 'I check', 'no entry exists (gap G-23) — record'),
  ], 'P2', 1, 'S3'),
  s('SPR-362', 'E14', 'Address book', 'Directory correctness.', [
    G('staff and active candidates', 'I open Address Book', 'staff show email; candidates show phone(s) and batch; Call / Mail links work; filter and export work'),
  ], 'P3', 1, 'S3'),
  s('SPR-363', 'E14', 'Cloud setup (QA only)', 'Connection management.', [
    G('an invalid config JSON', 'I click Connect & Save', 'I am told which field is missing'),
    G('a valid QA config', 'I connect', 'the app reloads connected; Disconnect reverts'),
  ], 'P3', 1, 'S5', '', 'QA only'),
  s('SPR-364', 'E14', 'Test runner safety (QA only)', 'Known destructive test.', [
    G('QA with a backup', 'I run the full suite', 'results show; verify whether Office Cash (cash-01) still exists (gap G-22) and file a P0 if deleted'),
  ], 'P2', 1, 'S5', 'SPR-227', 'Never run on production'),

  // ── E15 ──
  s('SPR-381', 'E15', 'Stale build self-recovery', 'Deploy resilience.', [
    G('a tab left open across a production deploy', 'I navigate to another screen', 'the page reloads itself at most once and works; no blank screen'),
    G('the chunk is still missing', 'the reload completes', 'I see "This page could not be loaded" with a Reload button'),
  ], 'P1', 2, 'S2'),
  s('SPR-382', 'E15', 'Phone performance', 'Public pages on 4G.', [
    G('Chrome DevTools Fast 3G/4G throttling and 4× CPU', 'I open the home and an event page', 'content appears within 3 s and 4 s respectively'),
  ], 'P2', 1, 'S3'),
  s('SPR-383', 'E15', 'Permissions matrix', 'Every route × role.', [
    G('the screens table in SRS §8.1', 'I try each route as master, admin, staff, candidate, anonymous', 'behaviour matches the table; deviations are filed'),
  ], 'P0', 3, 'S2', 'SPR-107'),
  s('SPR-384', 'E15', 'Cross-browser smoke', 'Tier 1 browsers.', [
    G('Chrome, Edge, Firefox, Android Chrome, iOS Safari', 'I run the smoke set (login, community, event register, website contact)', 'no functional differences or console errors'),
  ], 'P1', 2, 'S3'),
  s('SPR-385', 'E15', 'Real-time sync', 'Two-browser checks.', [
    G('two staff browsers', 'one adds a candidate, posts an announcement, registers on an event', 'the other sees each change within 5 s without reload'),
  ], 'P1', 1, 'S2'),
  s('SPR-386', 'E15', 'In-app self-tests', 'Built-in suites stay green.', [
    G('master', 'I run Community module tests and Events tests (Admin → Test Runner is excluded)', 'all pass'),
  ], 'P3', 1, 'S2'),
];

module.exports = { EPICS, STORIES };

// Detailed user stories — source of truth for the initial SPR-Testing.xlsx build.
// After the workbook is generated, this file is only used if someone wants to
// rebuild from scratch. Day-to-day edits should happen in Excel.

const s = (id, epic, title, description, acceptance, priority, effort, owner, sprint, deps = '', notes = '') => ({
  id, epic, title, description,
  acceptance: acceptance.map(a => '• ' + a).join('\n'),
  priority, effort, status: 'Backlog', owner, sprint, deps, notes,
});

module.exports = [
  // ── E1 Authentication & Users ─────────────────────────────────────────────
  s('SPR-001', 'E1 Auth & Users', 'Login with valid credentials',
    'A registered user can authenticate and reach the protected dashboard.',
    [
      'Given a valid username and password, when I submit the login form, then I am redirected to /dashboard',
      'Given a successful login, when the dashboard renders, then my name appears in the sidebar footer',
      'Given a successful login, when I open DevTools → Application → localStorage, then SPR_TECHFORGE_SESSION_V4 contains a userId and recent timestamp',
      'Given a successful login, when I refresh the browser, then I remain logged in and the dashboard re-renders',
    ],
    'P0', 2, 'Tester 1', 'S1'),

  s('SPR-002', 'E1 Auth & Users', 'Login with wrong password shows error',
    'Entering a known username with the wrong password must fail clearly and stay on /login.',
    [
      'Given a valid username and an incorrect password, when I submit, then an inline error "Invalid credentials" appears',
      'Given the failed attempt, when the error is shown, then the URL is still /login',
      'Given the failed attempt, when I inspect localStorage, then SPR_TECHFORGE_SESSION_V4 is NOT created',
      'Given the failed attempt, when I retry with the correct password, then I am logged in normally',
    ],
    'P0', 1, 'Tester 1', 'S1', 'SPR-001'),

  s('SPR-003', 'E1 Auth & Users', 'Login with unknown username shows error',
    'A username that does not exist in Firestore must fail with the same generic error (no user enumeration).',
    [
      'Given a username that does not exist, when I submit, then "Invalid credentials" appears',
      'Given a username that does not exist, when I submit, then the error wording is identical to the wrong-password case (no enumeration)',
      'Given the failed attempt, when I check the network tab, then no /users/<id> read leaks the existence of the username',
    ],
    'P0', 1, 'Tester 1', 'S1', 'SPR-001'),

  s('SPR-004', 'E1 Auth & Users', 'Login form rejects empty fields',
    'Submitting an empty username or password should be blocked client-side.',
    [
      'Given both fields are empty, when I click Login, then a "Missing credentials" message appears OR the submit is blocked',
      'Given only the username is filled, when I click Login, then the missing-password state is communicated',
      'Given only the password is filled, when I click Login, then the missing-username state is communicated',
    ],
    'P1', 1, 'Tester 1', 'S1'),

  s('SPR-005', 'E1 Auth & Users', 'Username is case-insensitive',
    'The username comparison must lower-case both sides so users do not get locked out by capitalisation.',
    [
      'Given a user created with username "Thirumal@sprtechforge.com", when I log in with "thirumal@sprtechforge.com", then I authenticate successfully',
      'Given a user created with username "Tester1@test.com", when I log in with "TESTER1@TEST.COM", then I authenticate successfully',
    ],
    'P1', 1, 'Tester 1', 'S1', 'SPR-001'),

  s('SPR-006', 'E1 Auth & Users', 'Login attempt is recorded in activity log',
    'Every successful login must produce an ActivityLog entry visible to the master user.',
    [
      'Given a successful login, when the master opens /admin/logs, then an entry with action=LOGIN exists for this user with the current timestamp',
      'Given a failed login, when the master opens /admin/logs, then no LOGIN entry is created (failures are not logged in the current build — confirm this is intentional)',
    ],
    'P2', 2, 'Tester 1', 'S1', 'SPR-001'),

  s('SPR-007', 'E1 Auth & Users', 'Logout returns to landing page',
    'Sign out must clear the session and prevent access to protected routes.',
    [
      'Given I am logged in, when I click Sign Out in the sidebar, then I land on / (landing page)',
      'Given I have just logged out, when I try to navigate to /dashboard via URL, then I am redirected to /login',
      'Given I have logged out, when I open DevTools → Application → localStorage, then SPR_TECHFORGE_SESSION_V4 is removed',
    ],
    'P1', 1, 'Tester 1', 'S1', 'SPR-001'),

  s('SPR-008', 'E1 Auth & Users', 'Session persists across browser refresh',
    'Refreshing the page while logged in should keep me logged in.',
    [
      'Given I am on /dashboard, when I press F5, then I remain on /dashboard',
      'Given I am on /candidates, when I press F5, then I remain on /candidates with the list intact',
      'Given I am logged in and close + reopen the tab within session timeout, then I am still authenticated',
    ],
    'P1', 1, 'Tester 1', 'S1', 'SPR-001'),

  s('SPR-009', 'E1 Auth & Users', 'Session expires after 60 minutes idle',
    'Stale sessions must be invalidated so an unattended browser does not expose data.',
    [
      'Given my session is older than 60 minutes (manipulate localStorage timestamp), when I refresh, then I am redirected to /login',
      'Given an expired session, when I try to navigate to any protected route, then I am redirected to /login',
    ],
    'P1', 2, 'Tester 1', 'S1', 'SPR-001', 'Clock manipulation via localStorage'),

  s('SPR-010', 'E1 Auth & Users', 'Bootstrap admin can log in on empty users collection',
    'When Firestore has no users, the in-memory DEFAULT_ADMIN must accept login.',
    [
      'Given the Firestore /users collection is empty, when I log in as thirumalreddy@sprtechforge.com / ThiruPriya@13, then I land on /dashboard',
      'Given I am logged in as DEFAULT_ADMIN, when I view the sidebar, then the Finance group is visible (master privileges)',
    ],
    'P0', 1, 'Tester 1', 'S1'),

  s('SPR-011', 'E1 Auth & Users', 'Bootstrap admin auto-persists when users collection is first populated',
    'Regression of past production bug — adding a user must NOT wipe the bootstrap admin from in-memory state.',
    [
      'Given Firestore /users is empty, when I log in as bootstrap admin and add another user via Admin → Users, then both users are present in Firestore /users',
      'Given the bootstrap admin row now exists in Firestore, when I log out and back in as bootstrap admin, then login still succeeds',
      'Given the bootstrap admin already exists in Firestore, when I open Admin → Users, then admin-01 is listed only once (no duplicates)',
    ],
    'P0', 1, 'Tester 1', 'S1', 'SPR-010', 'Past prod incident — must remain green forever'),

  s('SPR-012', 'E1 Auth & Users', 'User can submit a password reset request',
    'The "Forgot password" flow creates a PasswordResetRequest visible to the master for resolution.',
    [
      'Given the login screen, when I click Forgot Password and submit my username, then a confirmation toast appears',
      'Given a submitted reset request, when the master views the request list, then my username and request date appear with status=pending',
    ],
    'P2', 2, 'Tester 1', 'S1'),

  s('SPR-013', 'E1 Auth & Users', 'Master can resolve a password reset request',
    'The master can update a user\'s password from the reset request UI and mark the request resolved.',
    [
      'Given a pending reset request, when the master enters a new password and clicks Resolve, then the user\'s password updates in Firestore',
      'Given the request was resolved, when the user tries the new password on login, then they authenticate successfully',
      'Given a resolved request, when re-listing requests, then the row shows status=resolved',
    ],
    'P2', 2, 'Tester 1', 'S1', 'SPR-012'),

  s('SPR-014', 'E1 Auth & Users', 'Admin adds a new user',
    'Admin → Users → Add User must create a new Firestore /users document the new person can log in with.',
    [
      'Given the Add User form with valid name/username/password/role, when I save, then the new user appears in the user list',
      'Given the new user, when they log in with those credentials, then they reach /dashboard',
      'Given the save, when an admin checks Activity Logs, then a CREATE entity=User action is logged',
    ],
    'P0', 3, 'Tester 1', 'S1', 'SPR-001'),

  s('SPR-015', 'E1 Auth & Users', 'Adding a user with a duplicate username is rejected',
    'Same-username conflict must surface clearly without overwriting the existing user.',
    [
      'Given a user with username "alice@test.com" exists, when an admin tries to add another user with the same username, then an inline error appears',
      'Given the rejected save, when I refresh the user list, then only the original alice@test.com is present',
    ],
    'P1', 2, 'Tester 1', 'S1', 'SPR-014'),

  s('SPR-016', 'E1 Auth & Users', 'Admin edits a user',
    'Editing a user\'s details must persist immediately and propagate everywhere the user appears.',
    [
      'Given an existing user, when I change their name and save, then the new name shows in the list',
      'Given the rename, when I open a chat the user wrote, then the message header reflects the new name',
      'Given an admin edit, when Activity Logs is opened, then an UPDATE entity=User entry is present',
    ],
    'P1', 2, 'Tester 1', 'S1', 'SPR-014'),

  s('SPR-017', 'E1 Auth & Users', 'Admin can change a user\'s password',
    'Admin can reset a user\'s password from the edit view; the user can immediately log in with the new value.',
    [
      'Given an existing user, when an admin sets a new password and saves, then the user can log in with the new password',
      'Given a password change, when the affected user is currently logged in, then their next protected request is unaffected within their active session (no forced logout in this build)',
    ],
    'P2', 2, 'Tester 1', 'S1', 'SPR-014'),

  s('SPR-018', 'E1 Auth & Users', 'Admin deletes a user',
    'Delete removes the user from Firestore. Data they authored (chat messages) keeps the sender\'s name snapshot but the user is gone from the list.',
    [
      'Given a regular staff user with no dependent finance records, when an admin deletes them and confirms, then they vanish from Admin → Users',
      'Given the deletion, when the deleted user tries to log in, then login fails with Invalid credentials',
      'Given the deletion, when an admin opens chats the deleted user wrote, then the historical messages still render with the senderName field on the message',
    ],
    'P2', 2, 'Tester 1', 'S1', 'SPR-014'),

  s('SPR-019', 'E1 Auth & Users', 'Admin assigns modules to a user',
    'The modules array controls which sidebar groups the user sees.',
    [
      'Given a staff user with modules=[candidates], when they log in, then only Overview and Candidates appear in the sidebar',
      'Given a staff user with modules=[training,users], when they log in, then Overview, Training and Admin groups are visible',
      'Given a candidate user (role=candidate), when they log in, then they see the student-portal nav regardless of modules',
    ],
    'P1', 2, 'Tester 1', 'S1', 'SPR-014'),

  s('SPR-020', 'E1 Auth & Users', 'Master role grants Finance access regardless of modules',
    'Only the user whose username matches the master constant must see Finance routes.',
    [
      'Given a user with username=thirumalreddy@sprtechforge.com, when they log in, then the Finance group is visible',
      'Given another admin user with role=admin but a different username, when they log in, then the Finance group is hidden',
      'Given a non-master user types /finance/dashboard into the URL directly, then they are redirected to /dashboard',
    ],
    'P0', 1, 'Tester 1', 'S1', 'SPR-001'),

  s('SPR-021', 'E1 Auth & Users', 'Master views the activity log',
    'Only the master can open /admin/logs; the log shows the recent application actions.',
    [
      'Given master role, when I open /admin/logs, then a chronological list of action entries appears',
      'Given a non-master, when they type /admin/logs in the URL, then they are redirected to /dashboard',
      'Given recent CRUD activity by any user, when the master opens logs, then the actions appear within 5 seconds (real-time Firestore subscription)',
    ],
    'P1', 2, 'Tester 1', 'S1', 'SPR-020'),

  s('SPR-022', 'E1 Auth & Users', 'Master can clear activity logs',
    'A cleanup action removes all ActivityLog entries from Firestore.',
    [
      'Given a populated activity log, when the master clicks Clear and confirms, then the activity log table is empty',
      'Given the clear action, when the master refreshes, then the log stays empty until new actions are recorded',
      'Given the clear, when the master adds a new user, then the next action recorded appears in the now-empty log',
    ],
    'P2', 2, 'Tester 1', 'S1', 'SPR-021'),

  // ── E2 Candidates ─────────────────────────────────────────────────────────
  s('SPR-023', 'E2 Candidates', 'Add a new candidate with required fields',
    'The minimum-viable candidate (name, email, phone, batch, joinedDate, agreedAmount) saves successfully.',
    [
      'Given the new-candidate form, when I fill the required fields and save, then the candidate appears in /candidates',
      'Given the save, when I refresh, then the candidate persists in Firestore',
      'Given the save, when I check Activity Logs as master, then a CREATE entity=Candidate entry is logged',
    ],
    'P0', 3, 'Tester 2', 'S2', 'SPR-014'),

  s('SPR-024', 'E2 Candidates', 'Add candidate with invalid email is rejected',
    'Email validation prevents obvious garbage entries.',
    [
      'Given the form, when I enter "notanemail" in the email field and submit, then an inline validation message appears and the save is blocked',
      'Given the form, when I enter "test@" and submit, then the same validation triggers',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-023'),

  s('SPR-025', 'E2 Candidates', 'Edit candidate name',
    'Renaming a candidate updates the list and any place the candidate name is shown.',
    [
      'Given an existing candidate "John Doe", when I rename to "John D. Doe" and save, then /candidates shows the new name',
      'Given the rename, when I open a related interview, then the candidate field reflects the new name',
      'Given the rename, when Activity Logs is opened, then an UPDATE entity=Candidate entry is present',
    ],
    'P1', 2, 'Tester 2', 'S2', 'SPR-023'),

  s('SPR-026', 'E2 Candidates', 'Edit candidate contact details',
    'Email, phone, alternate phone, and address are editable and persist.',
    [
      'Given a candidate, when I change phone and save, then the phone is updated on re-open',
      'Given a candidate, when I change email and save, then the candidate detail and address-book entries (if any) reflect the new email',
    ],
    'P1', 2, 'Tester 2', 'S2', 'SPR-025'),

  s('SPR-027', 'E2 Candidates', 'Edit candidate batch / status',
    'Batch assignment and status transitions update the candidate and any dependent UI badges.',
    [
      'Given a candidate in Training status, when I change to Placed and save, then the list filter "Placed" shows them',
      'Given a candidate batch change, when I view the attendance sheet for the new batch, then the candidate appears there',
    ],
    'P1', 2, 'Tester 2', 'S2', 'SPR-023'),

  s('SPR-028', 'E2 Candidates', 'Delete candidate with no dependencies',
    'A candidate with no interviews / transactions / training logs can be deleted.',
    [
      'Given a candidate with no dependent records, when an admin deletes and confirms, then the candidate disappears from the list',
      'Given the delete, when I refresh, then they remain gone',
      'Given the delete, when Activity Logs is opened, then a DELETE entity=Candidate entry exists',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-023'),

  s('SPR-029', 'E2 Candidates', 'Delete candidate with linked records — behaviour confirmed',
    'Define + verify the behaviour when deleting a candidate who has interviews, training logs, transactions.',
    [
      'Given a candidate with linked transactions, when an admin attempts to delete, then the behaviour is consistent (allow OR block) and clearly documented',
      'Given a deletion that orphans interview records, when I open the interviews list, then orphaned records are either hidden or marked',
    ],
    'P2', 3, 'Tester 2', 'S2', 'SPR-028', 'Verify current behaviour and document it'),

  s('SPR-030', 'E2 Candidates', 'Search candidates by name',
    'The candidate list supports text search by candidate name.',
    [
      'Given >5 candidates with varied names, when I type "ali" in the search box, then only candidates whose name contains "ali" (case-insensitive) remain visible',
      'Given a search query that matches no candidates, when I type, then an empty-state message appears',
      'Given a search, when I clear the search, then all candidates re-appear',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-023'),

  s('SPR-031', 'E2 Candidates', 'Filter candidates by status',
    'Filter dropdown narrows the list to a single CandidateStatus.',
    [
      'Given candidates in multiple statuses, when I filter by Placed, then only Placed candidates show',
      'Given the Placed filter, when I switch to Training, then the list updates accordingly',
      'Given an empty status filter, when I clear, then all statuses are visible again',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-027'),

  s('SPR-032', 'E2 Candidates', 'Pagination on candidate list',
    'When more than the page size of candidates exist, the list paginates without breaking.',
    [
      'Given >20 candidates, when I open /candidates, then a pagination control appears',
      'Given page 2, when I click Next, then a different batch of candidates is visible without duplicates',
    ],
    'P3', 2, 'Tester 2', 'S2', 'SPR-023', 'If pagination is implemented; otherwise mark Won\'t Fix'),

  s('SPR-033', 'E2 Candidates', 'View candidate detail page',
    'Clicking a candidate row opens a detail view with their bio, profile, status, finance, and training history.',
    [
      'Given a candidate row, when I click the row, then I land on the candidate detail with all profile fields',
      'Given the detail page, when I scroll, then I see linked interviews, training logs and transactions',
    ],
    'P1', 3, 'Tester 2', 'S2', 'SPR-023'),

  s('SPR-034', 'E2 Candidates', 'Complete candidate profile',
    'CandidateProfile fields (DOB, address, education, experience) are editable and persist independently of the core candidate record.',
    [
      'Given a candidate, when I fill DOB, education, skills and save, then the profile is stored in /candidateProfiles',
      'Given a saved profile, when I re-open the profile page, then all fields are pre-populated',
    ],
    'P1', 3, 'Tester 2', 'S2', 'SPR-033'),

  s('SPR-035', 'E2 Candidates', 'Upload candidate resume',
    'A PDF can be attached to a candidate and downloaded later.',
    [
      'Given a candidate, when I upload a PDF resume, then a download link appears on the candidate detail',
      'Given the upload, when I click the download link, then the same file opens or downloads',
      'Given an uploaded resume, when I upload a replacement, then only the most recent version remains accessible',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-033'),

  s('SPR-036', 'E2 Candidates', 'Send agreement to candidate',
    'The agreement flow records the send date and produces a portal link the candidate can use.',
    [
      'Given a candidate with no agreement sent, when I click Send Agreement, then agreementSentDate is set on the record',
      'Given the send, when I copy the portal link, then it opens the public agreement page for that candidate',
    ],
    'P1', 3, 'Tester 2', 'S2', 'SPR-023'),

  s('SPR-037', 'E2 Candidates', 'Candidate accepts agreement via portal',
    'The candidate-facing portal lets the candidate accept the agreement, which writes agreementAcceptedDate.',
    [
      'Given a portal link, when the candidate opens it (no login required) and clicks Accept, then agreementAcceptedDate is set',
      'Given acceptance, when I view the candidate as admin, then the agreement status reflects Accepted',
    ],
    'P1', 3, 'Tester 2', 'S2', 'SPR-036'),

  s('SPR-038', 'E2 Candidates', 'Candidate rejects agreement with reason',
    'Rejection records a reason and prevents further use of the same link until re-sent.',
    [
      'Given a portal link, when the candidate clicks Reject with a reason and submits, then agreementRejectedDate and agreementRejectionReason are stored',
      'Given a rejected agreement, when an admin views the candidate, then the rejection reason is visible',
      'Given a rejected agreement, when admin re-sends, then a new agreementSentDate is recorded and the rejected timestamp clears',
    ],
    'P2', 3, 'Tester 2', 'S2', 'SPR-036'),

  s('SPR-039', 'E2 Candidates', 'Mark candidate as Placed with package details',
    'When a candidate is placed, capture the company and package fields.',
    [
      'Given a candidate, when I change status to Placed and fill placedCompany + packageDetails, then the data persists',
      'Given a Placed candidate, when I view the candidate list, then the Placed badge and company appear in the row',
    ],
    'P1', 2, 'Tester 2', 'S2', 'SPR-027'),

  s('SPR-040', 'E2 Candidates', 'Work Support tracking',
    'Active work-support assignments record dates and monthly amount.',
    [
      'Given a Placed candidate, when I set workSupportStatus=Active with start/end dates and a monthly amount, then the data persists',
      'Given an Active work-support candidate, when I view a candidate dashboard, then their support status is shown',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-039'),

  // ── E3 Enquiries & Web Leads ──────────────────────────────────────────────
  s('SPR-041', 'E3 Enquiries & Leads', 'Add a new enquiry',
    'Capturing prospective leads via the Enquiries page creates an Enquiry record.',
    [
      'Given the Enquiries page, when I add a new lead with name/phone/email/source, then it appears with status=Enquiry',
      'Given the save, when I refresh, then the enquiry persists',
    ],
    'P1', 2, 'Tester 2', 'S2'),

  s('SPR-042', 'E3 Enquiries & Leads', 'Add a note to an enquiry',
    'Notes capture follow-up history per enquiry.',
    [
      'Given an enquiry, when I add a note "Called, will join next batch", then the note appears in the enquiry timeline',
      'Given multiple notes, when I view the enquiry, then notes are listed in chronological order with author and date',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-041'),

  s('SPR-043', 'E3 Enquiries & Leads', 'Update enquiry status',
    'Status flow: Enquiry → Follow-Up → Joined or Not Interested.',
    [
      'Given an enquiry in Enquiry status, when I move it to Follow-Up, then the status persists',
      'Given a Follow-Up enquiry, when I move it to Joined, then the status updates and the merge action becomes available',
      'Given a Follow-Up enquiry, when I mark Not Interested, then the row is visibly de-emphasised in the list',
    ],
    'P1', 2, 'Tester 2', 'S2', 'SPR-041'),

  s('SPR-044', 'E3 Enquiries & Leads', 'Merge a Joined enquiry into a new candidate',
    'Merging promotes an enquiry into a full Candidate record.',
    [
      'Given an enquiry in Joined status, when I click Merge to Candidate and confirm, then a new candidate is created with the enquiry\'s name/phone/email pre-filled',
      'Given the merge, when I view the enquiry, then isMerged=true and a link to the new candidate is shown',
      'Given a merged enquiry, when I try to merge again, then the action is disabled',
    ],
    'P1', 3, 'Tester 2', 'S2', 'SPR-043'),

  s('SPR-045', 'E3 Enquiries & Leads', 'Search enquiries',
    'Free-text search filters enquiries by name, phone, or email.',
    [
      'Given >5 enquiries, when I type "999" in search, then only enquiries with that substring in phone show',
      'Given a search, when I clear it, then all enquiries re-appear',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-041'),

  s('SPR-046', 'E3 Enquiries & Leads', 'View web leads',
    'External web-form submissions appear under Web Enquiries with an unread badge.',
    [
      'Given a fresh web-lead Firestore doc, when I open Admin → Web Enquiries, then the lead shows with isRead=false',
      'Given the sidebar, when an unread web lead exists, then a red unread count appears next to Web Enquiries',
    ],
    'P2', 2, 'Tester 2', 'S2'),

  s('SPR-047', 'E3 Enquiries & Leads', 'Mark a web lead as read',
    'Reading a web lead clears the badge and updates the status.',
    [
      'Given an unread web lead, when I click into it, then isRead becomes true and the sidebar badge decrements',
      'Given all web leads are read, when I refresh, then the sidebar badge disappears',
    ],
    'P2', 1, 'Tester 2', 'S2', 'SPR-046'),

  s('SPR-048', 'E3 Enquiries & Leads', 'Update web lead status',
    'Web lead progress is tracked through New → In Progress → Responded → Closed.',
    [
      'Given a New web lead, when I change to In Progress with an internal note, then both fields persist',
      'Given Responded status, when I add a note, then the note is timestamped and visible in the row',
      'Given a Closed lead, when filtering New leads, then the Closed lead is hidden',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-046'),

  // ── E4 Training ───────────────────────────────────────────────────────────
  s('SPR-049', 'E4 Training', 'Create a training module',
    'Curriculum setup → add a module with title, description, and order.',
    [
      'Given the curriculum page, when I add a module "React Fundamentals" with order=1, then it appears in the module list at position 1',
      'Given the save, when I refresh, then the module persists',
    ],
    'P1', 2, 'Tester 2', 'S2'),

  s('SPR-050', 'E4 Training', 'Edit / reorder modules',
    'Modules can be renamed and reordered.',
    [
      'Given an existing module, when I edit the title and save, then the new title is visible',
      'Given multiple modules, when I change the order field on one, then they re-sort in the curriculum view',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-049'),

  s('SPR-051', 'E4 Training', 'Add a topic under a module',
    'Each module has one or more topics with estimated hours.',
    [
      'Given a module, when I add a topic with title and estimatedHours, then it appears nested under the module',
      'Given a topic, when I edit estimatedHours, then the value persists',
    ],
    'P1', 2, 'Tester 2', 'S2', 'SPR-049'),

  s('SPR-052', 'E4 Training', 'Record daily attendance',
    'For a given date, the attendance sheet captures Present / Absent / No Class per candidate.',
    [
      'Given today\'s date and >1 candidate, when I mark first Present and second Absent and save, then both entries persist',
      'Given a saved day, when I revisit the same date, then the marks are pre-loaded',
      'Given a save, when the master views Activity Logs, then a CREATE entity=TrainingLog entry is recorded',
    ],
    'P0', 3, 'Tester 2', 'S2', 'SPR-023'),

  s('SPR-053', 'E4 Training', 'Record assignment status alongside attendance',
    'Each candidate row also captures assignmentStatus per day.',
    [
      'Given a Present candidate, when I set assignmentStatus=Completed and save, then both attendance and assignment fields persist',
      'Given an Absent candidate, when I save, then assignmentStatus defaults to N/A',
    ],
    'P1', 2, 'Tester 2', 'S2', 'SPR-052'),

  s('SPR-054', 'E4 Training', 'Track candidate progress (admin)',
    'Progress Tracker aggregates per-candidate attendance + assignment metrics.',
    [
      'Given attendance recorded over a week, when I open the Progress Tracker, then total days present and total assignments completed match the underlying logs',
      'Given a candidate with multiple absences, when filtered, then the count of absent days is correct',
    ],
    'P2', 3, 'Tester 2', 'S2', 'SPR-052'),

  s('SPR-055', 'E4 Training', 'Candidate views their own training dashboard',
    'Candidates with role=candidate land on a dashboard that shows only their data.',
    [
      'Given a candidate logs in, when they view the student dashboard, then they see only their own attendance logs',
      'Given the candidate dashboard, when scrolled, then upcoming interview details for this candidate appear',
    ],
    'P1', 2, 'Tester 2', 'S2', 'SPR-052'),

  s('SPR-056', 'E4 Training', 'View Curriculum (read-only) for candidates',
    'Candidates see the published curriculum but cannot edit it.',
    [
      'Given a candidate logs in, when they open Curriculum, then modules and topics render read-only',
      'Given a candidate, when they look for add/edit/delete buttons, then none are present',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-049'),

  // ── E5 Interviews ─────────────────────────────────────────────────────────
  s('SPR-057', 'E5 Interviews', 'Schedule an interview',
    'Creating an interview links a candidate to a date/time/company.',
    [
      'Given a candidate exists, when I create an interview with date=tomorrow / time=11:00 / company=TestCo / type=Zoom / round=L1, then it appears under Scheduled',
      'Given the save, when the sidebar shows the Interviews badge, then the count increments by 1',
      'Given the save, when the master views activity logs, then a CREATE entity=Interview is recorded',
    ],
    'P0', 3, 'Tester 2', 'S2', 'SPR-023'),

  s('SPR-058', 'E5 Interviews', 'Edit an interview',
    'All interview fields are editable post-creation.',
    [
      'Given a scheduled interview, when I change time and save, then the new time displays in the list',
      'Given an edit, when an UPDATE log entry is checked, then the change is captured',
    ],
    'P1', 2, 'Tester 2', 'S2', 'SPR-057'),

  s('SPR-059', 'E5 Interviews', 'Mark interview outcome',
    'Outcome can be Selected / Rejected / Pending.',
    [
      'Given a Completed interview, when I set outcome=Selected, then the candidate (if not already Placed) is offered a follow-up to mark Placed',
      'Given outcome=Rejected, when I view candidate dashboard, then rejection is reflected in interview history',
    ],
    'P1', 2, 'Tester 2', 'S2', 'SPR-057'),

  s('SPR-060', 'E5 Interviews', 'Reschedule an interview',
    'Status flow: Scheduled → Rescheduled with new date/time.',
    [
      'Given a Scheduled interview, when I reschedule to a new date and save, then status=Rescheduled and the new date displays',
      'Given the reschedule, when sidebar badge re-renders, then "Today: N" reflects the new date',
    ],
    'P1', 2, 'Tester 2', 'S2', 'SPR-057'),

  s('SPR-061', 'E5 Interviews', 'Cancel an interview',
    'Cancelled interviews are visibly de-emphasised and removed from upcoming counts.',
    [
      'Given a Scheduled interview, when I cancel, then status=Cancelled and the row is greyed out',
      'Given the cancel, when sidebar badge re-renders, then the upcoming count decrements',
    ],
    'P1', 2, 'Tester 2', 'S2', 'SPR-057'),

  s('SPR-062', 'E5 Interviews', 'Sidebar shows "Today: N" badge for interviews',
    'Aggregated badge in the Training group reflects interviews scheduled for the current date.',
    [
      'Given 2 interviews scheduled for today, when I view the sidebar, then "Today: 2" appears next to Interviews & Resumes',
      'Given the day passes (date changes), when the page is loaded fresh, then today\'s count resets',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-057'),

  s('SPR-063', 'E5 Interviews', 'Manage interview question bank',
    'CRUD on InterviewModules and InterviewQuestions.',
    [
      'Given the Question Bank page, when I add a module "React" and add a question under it, then both persist',
      'Given a question, when I edit and save, then the edit persists',
      'Given a question, when I delete and confirm, then it is removed from the bank',
    ],
    'P2', 3, 'Tester 2', 'S2'),

  s('SPR-064', 'E5 Interviews', 'Candidate runs an interview prep session',
    'Candidates can practice answering questions; sessions are recorded.',
    [
      'Given a candidate logs in, when they open Prompt Practice and run a session, then their responses are scored and a session record is saved to interviewPrepSessions',
      'Given a completed session, when the candidate views past sessions, then they can replay each question with score and feedback',
    ],
    'P2', 3, 'Tester 2', 'S2', 'SPR-063'),

  s('SPR-065', 'E5 Interviews', 'View interview prep history (admin)',
    'Admins/master can view past prep sessions per candidate.',
    [
      'Given a candidate with prep sessions, when an admin opens the candidate detail, then the sessions list is visible with date and score',
    ],
    'P3', 2, 'Tester 2', 'S2', 'SPR-064'),

  // ── E6 Finance (Master only) ──────────────────────────────────────────────
  s('SPR-066', 'E6 Finance', 'Add a Bank account',
    'The master can add accounts of each AccountType.',
    [
      'Given master role, when I add an account with name "HDFC Test", type Bank, openingBalance 100000, then it appears in /finance/accounts',
      'Given an existing account, when I check Activity Logs, then a CREATE entity=Account entry exists',
    ],
    'P0', 2, 'Tester 3', 'S3', 'SPR-020'),

  s('SPR-067', 'E6 Finance', 'Add a Candidate / Debtor account',
    'Debtor accounts represent candidates and link to their candidate id.',
    [
      'Given a candidate exists, when I create a Debtor account linked to that candidate, then the account appears under Debtors',
      'Given the link, when the candidate is renamed, then the Debtor account label updates accordingly',
    ],
    'P1', 2, 'Tester 3', 'S3', 'SPR-066'),

  s('SPR-068', 'E6 Finance', 'Edit an account',
    'Account properties (name, sub-type, description) are editable.',
    [
      'Given an account, when I edit its name and save, then the new name displays in /finance/accounts',
      'Given the edit, when I open transactions referencing it, then those transactions show the new account name',
    ],
    'P1', 2, 'Tester 3', 'S3', 'SPR-066'),

  s('SPR-069', 'E6 Finance', 'Delete an account',
    'Accounts with no transactions can be deleted; with transactions, deletion is blocked.',
    [
      'Given an account with no transactions, when I delete and confirm, then it disappears',
      'Given an account with transactions, when I attempt to delete, then I see a clear error explaining why and the account stays',
    ],
    'P2', 2, 'Tester 3', 'S3', 'SPR-066'),

  s('SPR-070', 'E6 Finance', 'Record an Income transaction',
    'Income transactions credit a Bank account from a Debtor/Candidate.',
    [
      'Given a Bank and a Candidate Debtor account, when I create Income of 25000 from candidate to bank, then both account balances reflect',
      'Given the save, when I view /finance/transactions, then the new row appears at the top with date and amount',
    ],
    'P0', 3, 'Tester 3', 'S3', 'SPR-066'),

  s('SPR-071', 'E6 Finance', 'Record a Payment transaction',
    'Payment debits a Bank account to an expense / creditor.',
    [
      'Given a Bank account, when I record a Payment of 5000 to a Creditor, then the bank balance decreases by 5000',
      'Given the save, when I view the account statement, then the payment is visible with the correct sign',
    ],
    'P0', 2, 'Tester 3', 'S3', 'SPR-066'),

  s('SPR-072', 'E6 Finance', 'Record a Transfer between accounts',
    'A Transfer moves funds between two internal accounts.',
    [
      'Given two Bank accounts, when I transfer 10000 from A to B, then A decreases by 10000 and B increases by 10000',
      'Given the transfer, when I view both account statements, then matching entries appear in both with linked transaction id',
    ],
    'P1', 2, 'Tester 3', 'S3', 'SPR-066'),

  s('SPR-073', 'E6 Finance', 'Record a Refund transaction',
    'Refunds reduce a candidate\'s paid amount and credit back to a Bank account.',
    [
      'Given a candidate who paid 25000, when I record a Refund of 5000, then their paidAmount becomes 20000',
      'Given the refund, when I view the candidate\'s statement, then the refund row appears with negative sign',
    ],
    'P2', 2, 'Tester 3', 'S3', 'SPR-070'),

  s('SPR-074', 'E6 Finance', 'Lock a transaction',
    'Locked transactions become non-editable and non-deletable.',
    [
      'Given a transaction, when I click Lock and confirm, then the Edit and Delete buttons disappear or are disabled',
      'Given a locked transaction, when I attempt to edit via direct URL or API, then the change is rejected',
      'Given the lock, when I check Activity Logs, then a lock-related entry is recorded',
    ],
    'P1', 2, 'Tester 3', 'S3', 'SPR-070'),

  s('SPR-075', 'E6 Finance', 'Edit an unlocked transaction',
    'Unlocked transactions can be corrected after creation.',
    [
      'Given an unlocked transaction, when I change the amount and save, then both account balances re-compute',
      'Given the edit, when I view Activity Logs, then an UPDATE entry is recorded',
    ],
    'P1', 2, 'Tester 3', 'S3', 'SPR-070'),

  s('SPR-076', 'E6 Finance', 'Delete an unlocked transaction',
    'Deleting a transaction reverses its account balance effects.',
    [
      'Given an unlocked income transaction, when I delete and confirm, then both account balances revert to pre-transaction state',
      'Given the delete, when I view the candidate\'s statement, then the row no longer appears',
    ],
    'P1', 2, 'Tester 3', 'S3', 'SPR-070'),

  s('SPR-077', 'E6 Finance', 'View account statement',
    'Account statements list all transactions touching the account with a running balance.',
    [
      'Given an account with 5 transactions, when I open its statement, then all 5 appear in chronological order',
      'Given the statement, when I read the rightmost column, then a running balance is computed correctly',
      'Given the statement, when I export, then the same data downloads as an Excel file',
    ],
    'P1', 3, 'Tester 3', 'S3', 'SPR-070'),

  s('SPR-078', 'E6 Finance', 'Generate Balance Sheet',
    'Financial Statements page generates a balance sheet that reconciles to the underlying transactions.',
    [
      'Given some transactions, when I open Financial Statements → Balance Sheet, then total assets = total liabilities + equity',
      'Given the report, when I drill into a line item, then the contributing transactions are shown',
    ],
    'P1', 3, 'Tester 3', 'S3', 'SPR-070'),

  s('SPR-079', 'E6 Finance', 'Generate Profit & Loss',
    'P&L reconciles to income and expense transactions in the period.',
    [
      'Given a date range, when I generate P&L, then total revenue and total expense match transactions in that range',
      'Given a P&L, when I switch periods, then the totals update accordingly',
    ],
    'P1', 3, 'Tester 3', 'S3', 'SPR-078'),

  s('SPR-080', 'E6 Finance', 'Run payroll for a month',
    'Payroll generates salary transactions for staff users.',
    [
      'Given >1 staff users with salary accounts, when I run payroll for the current month, then a Payment txn is created against each salary account',
      'Given a re-run, when the same month is selected, then duplicate entries are prevented OR clearly flagged',
    ],
    'P2', 3, 'Tester 3', 'S3', 'SPR-070'),

  s('SPR-081', 'E6 Finance', 'Export full financial report',
    'Reports page exports a multi-sheet Excel with candidates, transactions, debtors, balance sheet, P&L.',
    [
      'Given some data exists, when I click Export Full Report, then a .xls file downloads',
      'Given the file, when I open in Excel, then the expected sheets (Candidates, Transactions, Sundry Debtors, Debts and Creditors, Balance Sheet, P&L) are present',
    ],
    'P2', 2, 'Tester 3', 'S3', 'SPR-077'),

  s('SPR-082', 'E6 Finance', 'Finance Dashboard reconciles with detail pages',
    'Top-line cards on /finance/dashboard match underlying tables.',
    [
      'Given some transactions, when I view the dashboard, then total revenue and total expense match those on the P&L for the same period',
      'Given a refresh after a new transaction, when I check the dashboard, then the cards reflect the new transaction within seconds',
    ],
    'P2', 2, 'Tester 3', 'S3', 'SPR-070'),

  s('SPR-083', 'E6 Finance', 'Non-master cannot access Finance routes',
    'Direct URL access to /finance/* is blocked for non-master users.',
    [
      'Given a non-master admin, when they type /finance/transactions in URL, then they are redirected to /dashboard',
      'Given a non-master, when they inspect the sidebar, then Finance group is not present',
    ],
    'P0', 1, 'Tester 3', 'S3', 'SPR-020'),

  // ── E7 SPRConnect → Chat ──────────────────────────────────────────────────
  s('SPR-084', 'E7 Chat', 'Start a DM with another user',
    'The + button opens a user picker; selecting one creates or opens the DM.',
    [
      'Given two users exist, when user A clicks + and picks user B, then a DM chat is created and selected',
      'Given user A starts a DM with B, when user B opens chat, then the same DM is available (deterministic chat id)',
      'Given an existing DM between A and B, when A tries to start a new DM with B, then the existing chat opens instead of creating a duplicate',
    ],
    'P0', 2, 'Tester 4', 'S4', 'SPR-014'),

  s('SPR-085', 'E7 Chat', 'Send a text message in a DM',
    'Composer sends a message; both participants see it in real time.',
    [
      'Given an active DM, when A sends "hi", then the bubble appears in A\'s thread immediately',
      'Given B has the same DM open in another browser, when A sends, then the message appears within 3 seconds without B refreshing',
      'Given B is on a different page when A sends, when B opens chat, then the unread badge is incremented and the new message is visible',
    ],
    'P0', 3, 'Tester 4', 'S4', 'SPR-084', 'Two-browser test'),

  s('SPR-086', 'E7 Chat', 'Send a chat message with an image attachment',
    'Images upload to Firebase Storage and render inline.',
    [
      'Given a DM, when I attach an image <2MB and send, then the image renders inline in both A\'s and B\'s threads',
      'Given the upload, when I check Firebase Storage at chats/{chatId}/, then the file exists with the original name',
      'Given the image render, when I click the image, then it opens in a new tab at full size',
    ],
    'P1', 3, 'Tester 4', 'S4', 'SPR-085'),

  s('SPR-087', 'E7 Chat', 'Send a chat message with a non-image attachment',
    'PDFs, docs, and other file types render as a download card.',
    [
      'Given a DM, when I attach a PDF and send, then the bubble shows a file card with name and size',
      'Given the card, when I click it, then the PDF opens or downloads',
    ],
    'P1', 2, 'Tester 4', 'S4', 'SPR-086'),

  s('SPR-088', 'E7 Chat', 'Composer keyboard shortcuts',
    'Enter sends; Shift+Enter inserts a newline.',
    [
      'Given the composer, when I type and press Enter, then the message is sent',
      'Given the composer, when I press Shift+Enter, then a newline is inserted without sending',
    ],
    'P2', 1, 'Tester 4', 'S4', 'SPR-085'),

  s('SPR-089', 'E7 Chat', 'Unread badge per chat',
    'Each chat row shows a count of messages I have not read.',
    [
      'Given B sent 3 messages while A was on another page, when A opens chat, then the DM row shows badge=3',
      'Given A clicks the DM, when the messages load, then the badge clears and the messages are marked readBy=A',
      'Given A on chat page B sends one more, when A is actively viewing that chat, then the badge does NOT appear',
    ],
    'P1', 2, 'Tester 4', 'S4', 'SPR-085'),

  s('SPR-090', 'E7 Chat', 'Sidebar Chat unread badge',
    'Aggregated unread count appears next to Chat in the sidebar.',
    [
      'Given >1 chat with unread messages, when I view the sidebar, then the badge shows the total unread count across visible chats',
      'Given I open one chat and clear its unread, when I view the sidebar, then the badge decrements appropriately',
    ],
    'P1', 1, 'Tester 4', 'S4', 'SPR-089'),

  s('SPR-091', 'E7 Chat', 'Admin posts in Announcements channel',
    'Only admins (or master) can post in Announcements; everyone reads.',
    [
      'Given admin role, when I open Announcements, then the composer is visible',
      'Given a non-admin, when they open Announcements, then a "Read-only" footer is shown instead of the composer',
      'Given an admin post, when a non-admin opens the channel, then they see the message in real time',
    ],
    'P1', 2, 'Tester 4', 'S4', 'SPR-084'),

  s('SPR-092', 'E7 Chat', 'Announcements channel auto-creates on first open',
    'The single global Announcements chat is created on first visit by any user.',
    [
      'Given no announcement chat in Firestore, when I open Chat for the first time, then a chat with id "announcements-global" is created and selected by default',
      'Given the auto-create, when the master views Firestore, then a single Announcements chat document exists',
    ],
    'P2', 1, 'Tester 4', 'S4', 'SPR-091'),

  s('SPR-093', 'E7 Chat', 'Chat list sorts by lastMessageAt',
    'Most recently active chats float to the top.',
    [
      'Given chats A, B, C with different lastMessageAt, when I view the chat list, then they sort with the most recent on top (Announcements pinned first)',
      'Given a new message in chat C, when the list re-renders, then C moves to the top',
    ],
    'P2', 1, 'Tester 4', 'S4', 'SPR-085'),

  s('SPR-094', 'E7 Chat', 'Message ordering is stable',
    'Messages within a chat appear in chronological order with no jumps when new ones arrive.',
    [
      'Given a chat with 10 messages, when I scroll up and down, then no message changes position',
      'Given a new message arrives, when the chat auto-scrolls to the bottom, then existing messages keep their relative order',
    ],
    'P2', 2, 'Tester 4', 'S4', 'SPR-085'),

  s('SPR-095', 'E7 Chat', 'Search users in New DM modal',
    'The user picker filters by name or username.',
    [
      'Given >5 users, when I type "alice" in the search, then only matching users remain',
      'Given an empty query, when I open the picker, then all users (except me) are listed sorted alphabetically',
    ],
    'P2', 1, 'Tester 4', 'S4', 'SPR-084'),

  // ── E8 SPRConnect → Meetings ──────────────────────────────────────────────
  s('SPR-096', 'E8 Meetings', 'Schedule a new meeting',
    'The + button opens a form to schedule a meeting with title / time / participants.',
    [
      'Given the meetings page, when I fill title, start = tomorrow 10:00, end = 10:30, pick user B, and save, then the meeting appears under Tomorrow',
      'Given the save, when I check the participant list on the new meeting, then I (organizer) have rsvp=accepted automatically',
      'Given the save, when user B opens meetings, then they see the meeting with rsvp=pending',
    ],
    'P0', 3, 'Tester 4', 'S4', 'SPR-014'),

  s('SPR-097', 'E8 Meetings', 'Participant RSVPs Going',
    'Accept button sets rsvp=accepted and propagates in real time.',
    [
      'Given an invited participant, when they open the meeting and click Going, then their badge changes to Going',
      'Given the RSVP change, when the organizer is also viewing the meeting, then the badge update appears within 3 seconds',
    ],
    'P0', 2, 'Tester 4', 'S4', 'SPR-096'),

  s('SPR-098', 'E8 Meetings', 'Participant RSVPs Maybe',
    'Tentative RSVP is treated as a third state.',
    [
      'Given an invited participant, when they click Maybe, then rsvp=tentative is stored and a yellow badge shows',
    ],
    'P1', 1, 'Tester 4', 'S4', 'SPR-097'),

  s('SPR-099', 'E8 Meetings', 'Participant declines',
    'Declined RSVP marks the participant out and visually strikes them.',
    [
      'Given an invited participant, when they click Declined, then rsvp=declined is stored and a red badge shows',
      'Given a declined RSVP, when the organizer views the meeting, then "going count" decreases by one',
    ],
    'P1', 1, 'Tester 4', 'S4', 'SPR-097'),

  s('SPR-100', 'E8 Meetings', 'Edit a meeting',
    'Organizer can change title, time, participants.',
    [
      'Given a meeting I organized, when I change time and save, then the new time displays for all participants',
      'Given a participant is removed, when I save, then they no longer see the meeting in their upcoming list',
      'Given a new participant is added, when I save, then they receive the meeting with rsvp=pending',
    ],
    'P1', 2, 'Tester 4', 'S4', 'SPR-096'),

  s('SPR-101', 'E8 Meetings', 'Cancel a meeting',
    'Cancelling sets status=cancelled and removes Join buttons.',
    [
      'Given a meeting I organized, when I cancel and confirm, then status=cancelled and the meeting card shows a Cancelled badge',
      'Given a cancelled meeting, when participants view it, then the Join button is hidden',
    ],
    'P1', 2, 'Tester 4', 'S4', 'SPR-096'),

  s('SPR-102', 'E8 Meetings', 'Permission to edit / cancel is enforced',
    'Only organizer or master can edit/cancel.',
    [
      'Given a meeting I did NOT organize, when I open it, then I see no Edit or Cancel buttons',
      'Given master role, when I open any meeting, then Edit and Cancel are available regardless of organizer',
    ],
    'P1', 1, 'Tester 4', 'S4', 'SPR-100'),

  s('SPR-103', 'E8 Meetings', 'Today\'s meetings badge in sidebar',
    'Sidebar badge under SPRConnect → Meetings shows count of meetings starting today.',
    [
      'Given 2 meetings scheduled for today, when I view the sidebar, then "Today: 2" appears next to Meetings',
      'Given a new meeting is added for today, when the sidebar re-renders, then the count increments to 3',
    ],
    'P2', 1, 'Tester 4', 'S4', 'SPR-096'),

  s('SPR-104', 'E8 Meetings', 'Tabs filter meetings',
    'Tabs: Upcoming, Organized by me, Past.',
    [
      'Given a mix of meetings, when I click Upcoming, then only scheduled future meetings appear',
      'Given the Organized by me tab, when I view it, then only meetings where I am organizer appear',
      'Given the Past tab, when I view it, then completed/cancelled or past-end-time meetings appear',
    ],
    'P2', 2, 'Tester 4', 'S4', 'SPR-096'),

  s('SPR-105', 'E8 Meetings', 'Meeting card grouping by date',
    'Meetings group under Today / Tomorrow / This week / Later.',
    [
      'Given meetings on various dates, when I view Upcoming, then each meeting falls under the correct group header',
      'Given today\'s meeting is past end-time, when I refresh, then it has moved to Past',
    ],
    'P2', 2, 'Tester 4', 'S4', 'SPR-104'),

  s('SPR-106', 'E8 Meetings', 'Schedule a meeting from a chat DM',
    'The Schedule button in a DM header opens the meeting modal with the other user pre-selected.',
    [
      'Given a DM with user B, when I click Schedule in the chat header, then the meeting modal opens with B pre-checked as a participant',
      'Given I save the meeting, when user B opens meetings, then the new meeting is in their upcoming list',
    ],
    'P2', 2, 'Tester 4', 'S4', 'SPR-096'),

  s('SPR-107', 'E8 Meetings', 'Validation: end time must be after start time',
    'Form prevents saving meetings where end <= start.',
    [
      'Given the new meeting form, when I set end-time <= start-time and click Save, then an inline error appears and the save is blocked',
    ],
    'P2', 1, 'Tester 4', 'S4', 'SPR-096'),

  // ── E9 SPRConnect → Video Calls (Jitsi) ───────────────────────────────────
  s('SPR-108', 'E9 Video Calls', 'Start a video call from a DM',
    'The Call button in DM chat header navigates to /call and creates an invitation.',
    [
      'Given a DM with user B, when I click Call, then I am taken to /call/<roomId> and a Jitsi iframe loads',
      'Given the call start, when I check Firestore /callInvitations, then a row with callerId=me and calleeId=B exists with status=ringing',
    ],
    'P0', 3, 'Tester 4', 'S4', 'SPR-084'),

  s('SPR-109', 'E9 Video Calls', 'Callee sees the ring overlay regardless of page',
    'The IncomingCallOverlay component is mounted globally and rings whenever a CallInvitation arrives.',
    [
      'Given user B is on /candidates when A calls, when the invitation is created, then B sees a full-screen ring overlay within 3 seconds',
      'Given the overlay, when B looks at it, then it shows A\'s name and Accept / Decline buttons',
      'Given the overlay, when B is in another tab, then a short ringtone (browser audio) plays',
    ],
    'P0', 3, 'Tester 4', 'S4', 'SPR-108', 'Two-browser test'),

  s('SPR-110', 'E9 Video Calls', 'Callee accepts the call',
    'Accept marks the invitation accepted and navigates to /call.',
    [
      'Given a ringing call, when B clicks Accept, then B is navigated to /call/<roomId>',
      'Given both A and B are in the room, when they look at Jitsi, then they see each other\'s video (after Google sign-in on A side)',
      'Given the accept, when the invitation is checked, then status=accepted',
    ],
    'P0', 2, 'Tester 4', 'S4', 'SPR-109'),

  s('SPR-111', 'E9 Video Calls', 'Callee declines the call',
    'Decline updates the invitation and notifies the caller.',
    [
      'Given a ringing call, when B clicks Decline, then the ring overlay closes',
      'Given the decline, when A is still on /call, then A sees a toast "B declined the call" and is navigated back to /chat',
      'Given the decline, when the invitation is checked, then status=declined',
    ],
    'P1', 2, 'Tester 4', 'S4', 'SPR-109'),

  s('SPR-112', 'E9 Video Calls', 'Ring overlay auto-hides after 45s (TTL)',
    'Stale invitations should not ring forever.',
    [
      'Given a ringing call, when B does nothing for 45 seconds, then the overlay disappears on B\'s side',
      'Given the timeout, when the invitation is checked, then status remains ringing in Firestore (caller-side cleanup is acceptable)',
    ],
    'P2', 1, 'Tester 4', 'S4', 'SPR-109'),

  s('SPR-113', 'E9 Video Calls', 'Join a scheduled meeting via video',
    'The Join button on a meeting card opens the meeting\'s Jitsi room.',
    [
      'Given a meeting I am invited to is in Scheduled status, when I click Join on the card, then I am taken to /call with the meeting title pre-set',
      'Given two invitees click Join, when they both load, then they meet in the same Jitsi room',
    ],
    'P0', 2, 'Tester 4', 'S4', 'SPR-096'),

  s('SPR-114', 'E9 Video Calls', 'Leave call returns to source page',
    'The Leave button on /call returns the user to the chat or meeting page.',
    [
      'Given I am in a call started from /chat, when I click Leave, then I return to /chat',
      'Given the leave, when I am the caller, then the invitation is marked status=ended',
    ],
    'P1', 1, 'Tester 4', 'S4', 'SPR-108'),

  s('SPR-115', 'E9 Video Calls', 'Jitsi readyToClose event also triggers leave',
    'If a user hangs up via Jitsi\'s own UI, the app should also clean up.',
    [
      'Given I am in a Jitsi call, when I click Jitsi\'s native Hang Up button, then I return to the source page automatically',
      'Given the readyToClose, when I check the invitation, then status=ended',
    ],
    'P2', 2, 'Tester 4', 'S4', 'SPR-114'),

  s('SPR-116', 'E9 Video Calls', 'Cannot call yourself',
    'Self-call attempts are blocked.',
    [
      'Given I am in my own DM (somehow), when I click Call, then a clear error is shown and no invitation is created',
    ],
    'P3', 1, 'Tester 4', 'S4', 'SPR-108'),

  s('SPR-117', 'E9 Video Calls', 'Ringing overlay does not appear when in a call',
    'Suppress the overlay while the user is on /call/* to avoid call-over-call confusion.',
    [
      'Given I am in a call, when another user calls me, then the ring overlay does NOT appear in the current /call page',
      'Given the missed call, when I leave the call, then if the invitation is still within TTL, the overlay shows; otherwise nothing appears',
    ],
    'P2', 2, 'Tester 4', 'S4', 'SPR-109'),

  // ── E10 SPRConnect → Email (Apps Script bridge) ───────────────────────────
  s('SPR-118', 'E10 Email', 'Email page shows configured state',
    'When env vars are present, the inbox loads.',
    [
      'Given VITE_EMAIL_ENDPOINT and SECRET are set in the build, when I open Email, then the inbox renders (loading then list)',
      'Given a valid response, when the page loads, then no "not configured" message appears',
    ],
    'P0', 2, 'Tester 3', 'S3'),

  s('SPR-119', 'E10 Email', 'Email page shows not-configured fallback',
    'If env vars are missing, a friendly message points to SETUP-EMAIL.md.',
    [
      'Given VITE_EMAIL_ENDPOINT is empty, when I open Email, then the "Email isn\'t configured yet" card appears',
      'Given the fallback, when I open DevTools, then no JS errors are present',
    ],
    'P0', 1, 'Tester 3', 'S3', 'SPR-118'),

  s('SPR-120', 'E10 Email', 'Inbox loads and auto-refreshes',
    'Polling every 30 seconds fetches the latest inbox messages.',
    [
      'Given the email bridge is configured, when I open Email, then the inbox loads within 5 seconds',
      'Given I leave the page open, when 30 seconds pass, then the refresh icon spins and the list updates if new mail arrived',
      'Given I click the refresh icon manually, when the request completes, then the list updates immediately',
    ],
    'P0', 3, 'Tester 3', 'S3', 'SPR-118'),

  s('SPR-121', 'E10 Email', 'Send a plain text email',
    'Compose form sends via the GAS bridge using Gmail.',
    [
      'Given the compose form, when I fill To/Subject/Body and click Send, then a success toast appears',
      'Given the send, when the recipient checks their inbox, then they receive the email from the configured Gmail address',
      'Given the send, when I check Activity Logs as master, then a CREATE entity=Email entry is recorded',
    ],
    'P0', 3, 'Tester 3', 'S3', 'SPR-118'),

  s('SPR-122', 'E10 Email', 'Send email with multiple attachments',
    'Files upload to Firebase Storage and the GAS fetches them back to attach.',
    [
      'Given a compose with a small image and a small PDF attached, when I send, then the recipient receives both files intact',
      'Given the upload, when I check Firebase Storage at emails/outbound/, then the files exist',
    ],
    'P1', 3, 'Tester 3', 'S3', 'SPR-121'),

  s('SPR-123', 'E10 Email', 'Reject sending if To/Subject/Body missing',
    'Validation prevents partial emails.',
    [
      'Given the compose form, when To is empty and I click Send, then an error toast appears and no send occurs',
      'Given an empty Body, when I click Send, then an error toast appears',
    ],
    'P2', 1, 'Tester 3', 'S3', 'SPR-121'),

  s('SPR-124', 'E10 Email', 'Send to multiple recipients (comma-separated)',
    'Multiple addresses in the To field deliver to all.',
    [
      'Given To = "a@test.com, b@test.com", when I send, then both addresses receive the email',
    ],
    'P2', 1, 'Tester 3', 'S3', 'SPR-121'),

  s('SPR-125', 'E10 Email', 'Reply to an inbox message',
    'Reply pre-fills To, Re: subject, and quoted body.',
    [
      'Given an inbox message, when I click Reply, then the compose modal opens with sender\'s address in To',
      'Given the reply, when the subject is pre-filled, then it has "Re: " prefix (not double "Re: Re:" if original was already "Re: ...")',
      'Given the reply, when the body pre-fills, then the original message snippet is quoted at the bottom',
    ],
    'P1', 2, 'Tester 3', 'S3', 'SPR-120'),

  s('SPR-126', 'E10 Email', 'Search the inbox',
    'Free-text search filters visible messages.',
    [
      'Given >5 inbox messages, when I type a sender name in the search, then only matching rows remain',
      'Given a search that matches no rows, when I clear search, then all messages re-appear',
    ],
    'P2', 2, 'Tester 3', 'S3', 'SPR-120'),

  s('SPR-127', 'E10 Email', 'Bad shared secret returns error',
    'Tampered or missing secret yields a clear error from GAS.',
    [
      'Given VITE_EMAIL_SHARED_SECRET is wrong, when I open Email, then an error banner appears in the inbox',
      'Given the same wrong secret, when I try Send, then a clear error toast appears explaining the bridge rejected the request',
    ],
    'P2', 1, 'Tester 3', 'S3', 'SPR-118'),

  // ── Cross-cutting ─────────────────────────────────────────────────────────
  s('SPR-128', 'Cross-cutting', 'Tablet layout (1024px)',
    'All top-level pages remain usable at 1024×768.',
    [
      'Given a tablet viewport, when I navigate dashboard, candidates, training, chat, meetings, email, then nothing overflows horizontally',
      'Given the viewport, when I open the chat thread + sidebar, then both panels remain readable',
    ],
    'P2', 3, 'Tester 1', 'S5'),

  s('SPR-129', 'Cross-cutting', 'Phone layout (375px)',
    'Mobile menu replaces the sidebar; main content remains readable.',
    [
      'Given a phone viewport, when I open any page, then the hamburger menu shows and the sidebar is hidden',
      'Given the phone view, when I open the chat, then the conversation list and thread stack vertically and remain usable',
    ],
    'P2', 3, 'Tester 1', 'S5', 'SPR-128'),

  s('SPR-130', 'Cross-cutting', 'Smoke pass on Chrome (Tier 1)',
    'The full smoke checklist passes on Chrome latest.',
    [
      'Given the latest QA build, when I run smoke on Chrome (login → dashboard → candidates → chat → meeting → email), then all checks pass with no console errors',
    ],
    'P0', 2, 'Tester 1', 'S5'),

  s('SPR-131', 'Cross-cutting', 'Smoke pass on Edge (Tier 1)',
    'Same smoke checklist passes on Edge latest.',
    [
      'Given the latest QA build, when I run smoke on Edge, then all checks pass with no console errors',
    ],
    'P0', 2, 'Tester 1', 'S5', 'SPR-130'),

  s('SPR-132', 'Cross-cutting', 'Smoke pass on Firefox (Tier 2)',
    'Same smoke checklist on Firefox.',
    [
      'Given the latest QA build, when I run smoke on Firefox, then all checks pass; visual differences (if any) are documented but not blockers',
    ],
    'P1', 2, 'Tester 1', 'S5', 'SPR-130'),

  s('SPR-133', 'Cross-cutting', 'Real-time sync across two browsers',
    'Firestore listeners propagate changes across sessions reliably.',
    [
      'Given two browsers logged in as A and B, when A adds a candidate, then B (already on /candidates) sees the new candidate within 5 seconds without refresh',
      'Given the same setup, when B updates the same candidate\'s name, then A sees the change within 5 seconds',
    ],
    'P0', 2, 'Tester 1', 'S5'),

  s('SPR-134', 'Cross-cutting', 'No JS errors in production console',
    'A clean DevTools console is a P1 quality gate.',
    [
      'Given any top-level page, when I open DevTools console and reload, then no red errors appear',
      'Given a happy-path action (e.g., add candidate), when it completes, then no console errors are logged',
    ],
    'P1', 2, 'Tester 1', 'S5'),

  s('SPR-135', 'Cross-cutting', 'Activity log entries are accurate and complete',
    'All CRUD operations produce a log entry; the actor identity is correct.',
    [
      'Given each major action (add user, add candidate, schedule interview, lock txn, send email), when performed, then a log entry exists with actorId, action, entityType, entityId',
      'Given an action by user A while B is also logged in, when the log entry is recorded, then actorId points to A (not the bootstrap admin)',
    ],
    'P1', 3, 'Tester 1', 'S5'),

  s('SPR-136', 'Cross-cutting', 'Keyboard navigation through key forms',
    'Tab/Shift+Tab moves focus predictably; Enter submits forms.',
    [
      'Given a form (login, new candidate, new meeting), when I Tab through, then focus moves in a logical order and the active field is visually indicated',
      'Given the form is fully filled, when I press Enter, then the primary action triggers (Save / Send / Login)',
    ],
    'P2', 2, 'Tester 1', 'S5'),

  s('SPR-137', 'Cross-cutting', 'No data leak between QA and production',
    'Verify QA reads/writes are confined to sprtechforge-qa Firestore, not sprtechforge.',
    [
      'Given the QA build, when I add a candidate on QA, then the new candidate appears in Firebase Console sprtechforge-qa only',
      'Given the same action, when I check Firebase Console sprtechforge (prod), then the data is NOT present',
    ],
    'P0', 1, 'Tester 1', 'S5'),

  // ── Additional candidates / depth ─────────────────────────────────────────
  s('SPR-138', 'E2 Candidates', 'Address book lists candidates with contact details',
    'The Address Book page presents a quick directory.',
    [
      'Given several candidates, when I open Address Book, then each candidate appears with name, phone, email',
      'Given a candidate with an empty email, when listed, then the missing field is rendered as a dash (not "undefined")',
    ],
    'P2', 2, 'Tester 2', 'S2', 'SPR-023'),

  s('SPR-139', 'E2 Candidates', 'Address book search and copy',
    'Address book is searchable and supports click-to-copy.',
    [
      'Given the address book, when I type a partial phone, then matching rows remain',
      'Given a row, when I click the phone field, then it copies to clipboard with a toast confirmation',
    ],
    'P3', 2, 'Tester 2', 'S2', 'SPR-138'),

  s('SPR-140', 'E2 Candidates', 'Candidate notes are persisted',
    'A free-text notes field per candidate captures internal commentary.',
    [
      'Given a candidate, when I add notes and save, then the notes persist across refresh',
      'Given subsequent edits, when I save, then the latest content overwrites the old',
    ],
    'P2', 1, 'Tester 2', 'S2', 'SPR-025'),

  // ── Cloud Setup & misc admin ──────────────────────────────────────────────
  s('SPR-141', 'E1 Auth & Users', 'Master can change Firebase config via Cloud Setup',
    'Cloud Setup page accepts a manual Firebase config override stored in localStorage.',
    [
      'Given master role, when I open /admin/cloud, then the current Firebase project ID is shown',
      'Given I save a new config, when the page reloads, then the app initialises against the new project (smoke test only — do not switch to prod)',
    ],
    'P3', 3, 'Tester 3', 'S3', 'SPR-020'),

  s('SPR-142', 'E1 Auth & Users', 'Master can run the in-app Test Runner',
    'Test Runner page exercises a hard-coded set of validations and reports pass/fail.',
    [
      'Given master role, when I open /admin/test-runner and run, then results are reported per test with pass/fail/skip',
      'Given a failure, when the page renders results, then the failure reason is shown clearly',
    ],
    'P3', 2, 'Tester 3', 'S3', 'SPR-020'),
];

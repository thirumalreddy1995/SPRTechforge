Feature: Interview Scheduling, Calendar & Dashboard
  As a user of the SPR platform
  I need to manage interviews across admin, staff, and candidate roles
  So that scheduling is transparent, conflict-free, and trackable

  Background:
    Given the application is loaded with Firebase sync enabled
    And the following users exist:
      | username   | role      | linkedCandidateId |
      | admin1     | admin     |                   |
      | staff1     | staff     |                   |
      | candidate1 | candidate | C001              |
    And the following candidates exist:
      | id   | name         | batchId | status              |
      | C001 | Rahul Sharma | SPR001  | Ready for Interview |
      | C002 | Priya Kumar  | SPR002  | Ready for Interview |

  # ─── Admin Scheduling ─────────────────────────────────────────────────────

  Scenario: Admin schedules an interview for a candidate
    Given I am logged in as "admin1"
    When I navigate to "/training/interviews"
    And I click "+ Schedule Interview"
    And I fill in the schedule form:
      | field          | value       |
      | candidate      | Rahul Sharma|
      | date           | 2026-07-01  |
      | time           | 10:00       |
      | companyName    | Google      |
      | interviewType  | Zoom        |
      | round          | L1          |
    And I click "Schedule Interview"
    Then I see a success toast "Interview scheduled"
    And the interview appears in the "Active Schedule" tab with status "Scheduled"
    And the interview appears in the Dashboard day view for "2026-07-01"

  Scenario: Admin edits an existing interview
    Given I am logged in as "admin1"
    And an interview exists for "Rahul Sharma" on "2026-07-01" at "10:00" with status "Scheduled"
    When I navigate to "/training/interviews"
    And I click the "Edit" button on that interview
    And I change the "round" to "L2"
    And I click "Update Interview"
    Then I see a success toast "Interview updated"
    And the interview card shows round "L2"

  Scenario: Admin deletes an interview
    Given I am logged in as "admin1"
    And an interview exists for "Rahul Sharma" on "2026-07-01" at "10:00"
    When I click "Delete" on that interview and confirm
    Then I see a success toast "Interview deleted"
    And the interview no longer appears in any tab

  # ─── Candidate Self-Scheduling ───────────────────────────────────────────

  Scenario: Candidate self-schedules an interview slot
    Given I am logged in as "candidate1"
    When I navigate to "/training/interviews"
    And I click "Request Interview Slot"
    And I fill in the self-schedule form:
      | field         | value      |
      | date          | 2026-07-05 |
      | time          | 14:00      |
      | companyName   | Infosys    |
      | interviewType | Zoom       |
      | round         | L1         |
    And I click "Submit Request"
    Then I see an info toast "Interview request submitted — awaiting admin confirmation"
    And the interview appears in "My Schedule" tab with status "Pending Approval"
    And the interview does NOT appear in the shared calendar yet

  Scenario: Admin confirms a candidate-scheduled interview
    Given I am logged in as "admin1"
    And a candidate-scheduled interview exists for "Rahul Sharma" with status "pending_confirmation"
    When I navigate to the "Active Schedule" tab
    Then I see a "Pending Approval" section with that interview
    When I click "Confirm" on the pending interview
    Then I see a success toast "Interview confirmed and scheduled"
    And the interview status changes to "Scheduled"
    And the interview appears in the Dashboard day view

  Scenario: Admin rejects a candidate-scheduled interview
    Given I am logged in as "admin1"
    And a candidate-scheduled interview exists for "Rahul Sharma" with status "pending_confirmation"
    When I click "Reject" on the pending interview and confirm
    Then I see a success toast "Interview request rejected"
    And the interview status changes to "Cancelled"
    And the interview moves to the "History" tab

  Scenario: Candidate only sees their own interviews in My Schedule
    Given I am logged in as "candidate1" linked to candidate "C001"
    And an interview exists for "Rahul Sharma" (C001) on "2026-07-01"
    And an interview exists for "Priya Kumar" (C002) on "2026-07-01"
    When I navigate to the "My Schedule" tab
    Then I see the interview for "Rahul Sharma"
    And I do NOT see the interview for "Priya Kumar"

  # ─── Conflict Detection ──────────────────────────────────────────────────

  Scenario: Scheduling is blocked when a slot conflict is detected
    Given I am logged in as "admin1"
    And an interview exists for "Rahul Sharma" on "2026-07-01" at "10:00" with status "Scheduled"
    When I try to schedule another interview for "Priya Kumar" on "2026-07-01" at "10:00"
    And I submit the form
    Then I see an error toast "This slot conflicts with an existing interview"
    And no new interview is created

  Scenario: Conflict indicator appears on overlapping interviews in Dashboard
    Given I am logged in as "admin1"
    And two interviews exist on "2026-07-02" at "11:00" with no end time
    When I navigate to the Dashboard and select "2026-07-02"
    Then both interview cards show a "Conflict" badge

  Scenario: Self-scheduled slot is blocked when it conflicts with existing interview
    Given I am logged in as "candidate1"
    And a confirmed interview exists on "2026-07-05" at "14:00"
    When I submit a self-schedule request for the same slot
    Then I see an error toast "This slot conflicts with another interview"
    And no interview request is created

  # ─── Dashboard Day View ──────────────────────────────────────────────────

  Scenario: Dashboard shows interviews for today by default
    Given I am logged in as "admin1"
    And an interview exists for today at "09:00"
    When I navigate to "/training/interviews"
    Then the Dashboard tab is active
    And the day view shows "Today" as the header
    And the interview card for today's interview is visible

  Scenario: Navigate to next day using the Next button
    Given I am logged in as "admin1"
    And today is "2026-07-01"
    When I click the "Next" navigation button
    Then the day view header shows "2026-07-02"
    And only interviews on "2026-07-02" are shown

  Scenario: Navigate to previous day using the Prev button
    Given I am logged in as "admin1"
    And today is "2026-07-01"
    When I click the "Prev" navigation button
    Then the day view header shows "2026-06-30"

  Scenario: Navigate to a specific date using the date picker
    Given I am logged in as "admin1"
    When I change the date picker to "2026-08-15"
    Then the day view shows interviews for "2026-08-15"

  Scenario: Today button resets the day view to today
    Given I am logged in as "admin1"
    And I have navigated to "2026-08-15"
    When I click the "Today" button
    Then the day view header shows "Today"

  Scenario: Empty state message appears when no interviews exist on selected day
    Given I am logged in as "admin1"
    And no interviews exist on "2026-09-01"
    When I navigate the dashboard to "2026-09-01"
    Then I see the message "No interviews on this day"

  # ─── Candidate Stats Panel ───────────────────────────────────────────────

  Scenario: Admin views candidate stats for a candidate with interview history
    Given I am logged in as "admin1"
    And "Rahul Sharma" has the following interview history:
      | date       | company | round | status   |
      | 2026-06-01 | Google  | L1    | Attended |
      | 2026-06-10 | TCS     | HR    | Cleared  |
      | 2026-06-20 | Wipro   | L1    | Rejected |
      | 2026-07-01 | HCL     | L1    | Scheduled|
    When I open the Dashboard tab
    And I select "Rahul Sharma" in the Candidate Stats filter
    Then I see the stat cards:
      | label    | count |
      | Total    | 4     |
      | Attended | 1     |
      | Cleared  | 1     |
      | Rejected | 1     |
      | Pending  | 1     |
      | No-show  | 0     |
    And the detail table lists all 4 interviews sorted by date descending

  Scenario: Candidate stats panel is not shown to candidate role users
    Given I am logged in as "candidate1"
    When I open the Dashboard tab
    Then the Candidate Stats filter panel is NOT visible

  # ─── Status Lifecycle ────────────────────────────────────────────────────

  Scenario: Admin progresses interview from Scheduled to Attended
    Given I am logged in as "admin1"
    And a "Scheduled" interview exists
    When I click "Update" on the interview
    And I select "Attended" from the status dropdown
    And I click "Save Status"
    Then the interview status badge shows "Attended"
    And the interview moves to the "History" tab

  Scenario: Admin marks interview as Cleared after Attended
    Given I am logged in as "admin1"
    And an "Attended" interview exists
    When I update the status to "Cleared"
    Then the status badge shows "Cleared"
    And the status history includes a record from "Attended" to "Cleared"

  Scenario: Admin marks interview as No-show
    Given I am logged in as "admin1"
    And a "Scheduled" interview exists for today
    When I update the status to "No-show"
    Then the status badge shows "No-show" in gray
    And the interview moves to History

  Scenario: Status history is recorded with actor and timestamp
    Given I am logged in as "admin1"
    And a "Scheduled" interview exists
    When I update its status to "Attended"
    Then clicking on the interview card shows the Status History section
    And it contains an entry: Attended ← Scheduled · admin1 · [timestamp]

  Scenario: Candidate can see their own interview status in real time
    Given I am logged in as "candidate1"
    And their interview status is "Scheduled"
    When an admin changes the status to "Attended"
    Then the "My Schedule" tab reflects "Attended" status without page reload

  # ─── Shared Calendar Visibility ─────────────────────────────────────────

  Scenario: Admin sees all interviews on the shared calendar
    Given I am logged in as "admin1"
    And interviews exist for multiple candidates on "2026-07-10"
    When I navigate the Dashboard to "2026-07-10"
    Then all interviews for that date are shown in the day view

  Scenario: Pending interviews appear on the calendar for admin
    Given I am logged in as "admin1"
    And a pending_confirmation interview exists for "2026-07-10"
    When I navigate the Dashboard to "2026-07-10"
    Then the pending interview appears with an amber "Pending Approval" badge

  Scenario: Cancelled and rescheduled interviews do NOT trigger conflicts
    Given two interviews exist on the same day and time
    And one of them has status "Cancelled"
    When I view the Dashboard for that day
    Then no "Conflict" badge appears on either card

  # ─── Pending Approval Banner ────────────────────────────────────────────

  Scenario: Admin sees pending approval banner when requests exist
    Given I am logged in as "admin1"
    And 2 pending_confirmation interviews exist
    When I open the Dashboard tab
    Then I see a banner "2 interview requests awaiting your confirmation"
    And clicking "View" navigates to the Active Schedule tab

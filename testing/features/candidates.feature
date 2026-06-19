Feature: Candidate List — Tab Structure, Filters & Discontinued Flow
  As an admin or staff user of SPR TechForge
  I need to manage candidates across different lifecycle stages
  So that I can quickly see active, placed, and discontinued candidates in separate views

  Background:
    Given the application is loaded
    And I am logged in as "admin1" with role "admin"
    And the following candidates exist:
      | name          | batchId | status              | agreedAmount | placedCompany |
      | Rahul Sharma  | SPR001  | Training            | 50000        |               |
      | Priya Kumar   | SPR002  | Ready for Interview | 50000        |               |
      | Arjun Dev     | SPR003  | Placed              | 60000        | Google        |
      | Meena Reddy   | SPR004  | Discontinued        | 45000        |               |
      | Sai Krishna   | SPR005  | Training            | 50000        |               |

  # ─── Tab order and count badges ─────────────────────────────────────────

  Scenario: Four tabs appear in the correct order
    When I navigate to "/candidates"
    Then the tabs appear in this order:
      | label                |
      | All Candidates       |
      | Active               |
      | Placed               |
      | Discontinued         |

  Scenario: Tab count badges show accurate candidate counts per status
    When I navigate to "/candidates"
    Then the tab badge counts are:
      | tab          | count |
      | All          | 5     |
      | Active       | 2     |
      | Placed       | 1     |
      | Discontinued | 1     |

  Scenario: Count badges update live when a candidate status changes
    Given I navigate to "/candidates"
    And the Discontinued badge shows "1"
    When candidate "Sai Krishna" is updated to status "Discontinued"
    Then the Discontinued badge immediately shows "2"
    And the Active badge immediately shows "1"

  # ─── Default tab and URL param ───────────────────────────────────────────

  Scenario: Default tab on page load is Active when no URL param is present
    When I navigate to "/candidates" without a tab param
    Then the "Active" tab is selected
    And the URL contains "?tab=active"

  Scenario: Selecting a tab updates the URL param
    Given I am on the candidates page
    When I click the "Discontinued" tab
    Then the URL changes to contain "?tab=discontinued"

  Scenario: Loading the page with ?tab=discontinued opens the Discontinued tab directly
    When I navigate to "/candidates?tab=discontinued"
    Then the "Discontinued" tab is active
    And only discontinued candidates are shown

  Scenario: Loading the page with ?tab=placed opens the Placed tab directly
    When I navigate to "/candidates?tab=placed"
    Then the "Placed" tab is active
    And only placed candidates are shown

  Scenario: Loading the page with ?tab=all opens the All Candidates tab
    When I navigate to "/candidates?tab=all"
    Then the "All Candidates" tab is active
    And all 5 candidates are shown

  Scenario: Browser back button restores the previous tab
    Given I am on the candidates page with "?tab=active"
    When I click the "Discontinued" tab
    And I press the browser back button
    Then the "Active" tab is restored

  # ─── All Candidates tab ──────────────────────────────────────────────────

  Scenario: All Candidates tab shows candidates of every status with no filter
    When I navigate to "/candidates?tab=all"
    Then I see 5 candidates in the list
    And I see candidates with statuses: Training, Ready for Interview, Placed, Discontinued

  Scenario: All Candidates tab shows correct columns
    When I navigate to "/candidates?tab=all"
    Then the table columns are:
      | column           |
      | #                |
      | Batch            |
      | Candidate        |
      | Status           |
      | Company / Joined |
      | Advance Collected|
      | Outstanding      |
      | Refund Issued    |
      | Actions          |

  Scenario: All Candidates tab shows status badges for each candidate
    When I navigate to "/candidates?tab=all"
    Then "Rahul Sharma" has a "Training" status badge
    And "Arjun Dev" has a "Placed" status badge
    And "Meena Reddy" has a "Discontinued" status badge

  # ─── Active tab bug fix ──────────────────────────────────────────────────

  Scenario: Active tab does not show discontinued candidates
    When I navigate to "/candidates?tab=active"
    Then "Meena Reddy" is not visible in the list
    And the count shows 2 candidates

  Scenario: Active tab does not show placed candidates
    When I navigate to "/candidates?tab=active"
    Then "Arjun Dev" is not visible in the list

  Scenario: Active tab only shows Training and Ready for Interview statuses
    When I navigate to "/candidates?tab=active"
    Then every visible candidate has status "Training" or "Ready for Interview"

  Scenario: Discontinued candidate appears in All and Discontinued but NOT in Active or Placed
    Given candidate "Meena Reddy" has status "Discontinued"
    When I open the "All Candidates" tab
    Then "Meena Reddy" is visible
    When I open the "Discontinued" tab
    Then "Meena Reddy" is visible
    When I open the "Active" tab
    Then "Meena Reddy" is NOT visible
    When I open the "Placed" tab
    Then "Meena Reddy" is NOT visible

  # ─── Placed tab — unchanged ──────────────────────────────────────────────

  Scenario: Placed tab shows only placed candidates
    When I navigate to "/candidates?tab=placed"
    Then I see exactly 1 candidate: "Arjun Dev"
    And no Training, Discontinued, or Ready for Interview candidates appear

  Scenario: Placed tab preserves the Company column
    When I navigate to "/candidates?tab=placed"
    Then the table includes a "Company" column
    And "Arjun Dev" shows "Google" in the Company column

  Scenario: Placed tab preserves all original columns without changes
    When I navigate to "/candidates?tab=placed"
    Then the table columns are exactly:
      | column  |
      | #       |
      | Batch   |
      | Candidate|
      | Status  |
      | Company |
      | Agreed  |
      | Paid    |
      | Due     |
      | Active  |
      | Actions |

  # ─── Discontinued tab ───────────────────────────────────────────────────

  Scenario: Discontinued tab shows only discontinued candidates
    When I navigate to "/candidates?tab=discontinued"
    Then I see exactly 1 candidate: "Meena Reddy"
    And no Training, Ready for Interview, or Placed candidates appear

  Scenario: Discontinued tab shows correct columns
    When I navigate to "/candidates?tab=discontinued"
    Then the table columns are:
      | column           |
      | #                |
      | Batch            |
      | Candidate        |
      | Advance Collected|
      | Refund Issued    |
      | Write-off        |
      | Actions          |

  Scenario: Discontinued tab shows advance collected amount for each row
    Given candidate "Meena Reddy" has paid ₹30,000 of her ₹45,000 agreed amount
    When I navigate to "/candidates?tab=discontinued"
    And I reveal amounts for "Meena Reddy"
    Then the Advance Collected column shows "₹30,000"

  Scenario: Discontinued tab shows refund issued as No when no refund exists
    Given candidate "Meena Reddy" has no refund transactions
    When I navigate to "/candidates?tab=discontinued"
    Then the Refund Issued column for "Meena Reddy" shows "No"

  Scenario: Discontinued tab shows refund issued as Yes with amount when refund exists
    Given candidate "Meena Reddy" has a refund of ₹5,000 issued
    When I navigate to "/candidates?tab=discontinued"
    And I reveal amounts for "Meena Reddy"
    Then the Refund Issued column for "Meena Reddy" shows "Yes (₹5,000)"

  Scenario: Discontinued tab shows write-off amount as outstanding balance
    Given candidate "Meena Reddy" paid ₹30,000 of ₹45,000 and no refund was issued
    When I navigate to "/candidates?tab=discontinued"
    And I reveal amounts for "Meena Reddy"
    Then the Write-off column shows "₹15,000"

  Scenario: Discontinued tab shows dash for write-off when balance is fully paid
    Given candidate "Meena Reddy" paid the full ₹45,000
    When I navigate to "/candidates?tab=discontinued"
    Then the Write-off column shows "—"

  Scenario: Empty state shows correct message when no discontinued candidates exist
    Given no candidates have status "Discontinued"
    When I navigate to "/candidates?tab=discontinued"
    Then I see the empty state message "No discontinued candidates"

  # ─── Issue Refund action ─────────────────────────────────────────────────

  Scenario: Issue Refund action is accessible from the Discontinued tab for Director
    Given I am logged in as a master/director user
    When I navigate to "/candidates?tab=discontinued"
    Then each discontinued candidate row shows a "Refund" button

  Scenario: Issue Refund button navigates to the finance transaction form
    Given I am logged in as a master/director user
    When I navigate to "/candidates?tab=discontinued"
    And I click "Refund" for "Meena Reddy"
    Then I am navigated to "/finance/transactions/new"
    And the navigation state includes candidateId and type "Refund"

  Scenario: Issue Refund button is not shown for non-master users
    Given I am logged in as a staff user (not master)
    When I navigate to "/candidates?tab=discontinued"
    Then the "Refund" button is NOT visible in any row

  Scenario: View Profile link is accessible from Discontinued tab
    When I navigate to "/candidates?tab=discontinued"
    And I click the View Profile icon for "Meena Reddy"
    Then the Candidate Profile modal opens showing "Meena Reddy"'s details

  # ─── Search and filter across tabs ───────────────────────────────────────

  Scenario: Search by name works within the Active tab
    When I navigate to "/candidates?tab=active"
    And I type "Rahul" in the search box
    Then only "Rahul Sharma" appears in the list

  Scenario: Clearing search shows all candidates in the current tab
    Given I have searched for "Rahul" on the Active tab
    When I click the clear button
    Then all 2 active candidates are shown again

  Scenario: Batch filter restricts results to the selected batch within the current tab
    When I navigate to "/candidates?tab=all"
    And I select batch "SPR001" from the filter
    Then only candidates with batchId "SPR001" are shown

  Scenario: Status filter is not shown on the Discontinued tab (redundant)
    When I navigate to "/candidates?tab=discontinued"
    Then the status filter dropdown is NOT visible

  Scenario: Status filter is not shown on the Placed tab (redundant)
    When I navigate to "/candidates?tab=placed"
    Then the status filter dropdown is NOT visible

  Scenario: Status filter on Active tab only shows active statuses
    When I navigate to "/candidates?tab=active"
    Then the status filter contains:
      | option              |
      | All Statuses        |
      | Training            |
      | Ready for Interview |
    And it does NOT contain "Discontinued" or "Placed"

  Scenario: Status filter on All tab includes all statuses
    When I navigate to "/candidates?tab=all"
    Then the status filter contains:
      | option              |
      | All Statuses        |
      | Training            |
      | Ready for Interview |
      | Placed              |
      | Discontinued        |

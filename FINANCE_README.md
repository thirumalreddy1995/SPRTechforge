# SPR Techforge — Finance Module Guide

This guide explains how to use the Finance module in plain language.
No accounting background required — just follow the steps below.

---

## Core Idea

Every monetary event creates a **Journal Entry** with two sides that always balance:

| Side | Means | Example |
|---|---|---|
| **Dr (Debit)** | Money / value GOING INTO this account | Dr Bank — cash arrived in the bank |
| **Cr (Credit)** | Money / value COMING OUT OF this account | Cr Income — fee was earned |

The system enforces this automatically: you pick the Dr account and the Cr account, and both sides are recorded together.

---

## How to Record Common Transactions

### 1. Candidate pays a fee

**What happens:** Money arrives in the bank, earned from a candidate.

**Go to:** Finance → New Journal Entry → Type: **Income**

| Line | Account | Dr | Cr |
|---|---|---|---|
| Dr | Your Bank or Cash account | ✓ | |
| Cr | The candidate's name | | ✓ |

The system shows you a two-line entry. Select the bank on the **Debit** line and the candidate on the **Credit** line. Save.

---

### 2. Record an expense (rent, utilities, vendor payment)

**What happens:** Money leaves the bank to pay for something.

**Go to:** Finance → New Journal Entry → Type: **Payment**

| Line | Account | Dr | Cr |
|---|---|---|---|
| Dr | The expense ledger (e.g. "Office Rent") | ✓ | |
| Cr | The bank or cash account you paid from | | ✓ |

---

### 3. Pay salary

**What happens:** Salary is paid to an employee from the bank.

**Go to:** Finance → New Journal Entry → Type: **Payment**

| Line | Account | Dr | Cr |
|---|---|---|---|
| Dr | The employee's Salary ledger (e.g. "Rahul Kumar Salary A/c") | ✓ | |
| Cr | Bank account | | ✓ |

The Payroll page (Finance → Payroll & Fixed Expenses) automatically calculates how many months have been paid vs outstanding — no extra steps needed.

---

### 4. Transfer money between accounts (bank to cash or bank to bank)

**What happens:** Move funds internally — no income or expense is created.

**Go to:** Finance → New Journal Entry → Type: **Transfer**

| Line | Account | Dr | Cr |
|---|---|---|---|
| Dr | Account receiving the money | ✓ | |
| Cr | Account sending the money | | ✓ |

---

### 5. Issue a refund to a candidate

**What happens:** Money goes back to a candidate from the bank.

**Go to:** Finance → New Journal Entry → Type: **Refund**

| Line | Account | Dr | Cr |
|---|---|---|---|
| Dr | The candidate's name | ✓ | |
| Cr | Bank or Cash account | | ✓ |

---

## How to Check the Balance of an Account

**Go to:** Finance → Chart of Accounts

- Find the account in the list.
- The **Balance** column shows the current balance.
- Click the **statement icon** (📄) on any account to see its full transaction history with a running balance.

On the Account Statement page you will see:
- **Dr column** — entries where this account was debited (money/value came in)
- **Cr column** — entries where this account was credited (money/value went out)
- **Balance** — running balance after each entry

---

## How to View All Transactions for a Date Range

**Go to:** Finance → Transaction Register

- Use the **Filters** button to set a From Date and To Date.
- You can also filter by account, transaction type, or search by description.
- Click **Export** to download as CSV.

---

## How to Read the Financial Reports

**Go to:** Finance → Financial Reports

### Balance Sheet
Shows what SPR Techforge **owns** (Assets) vs **owes** (Liabilities) at a point in time.
- Assets = Cash, Bank, amounts owed by candidates, fixed assets
- Liabilities = amounts owed to creditors, loans outstanding
- Equity = Assets − Liabilities (the net worth)

### Profit & Loss (P&L)
Shows **income earned** minus **expenses incurred** for a period.
- Use the date filter to select a financial period (e.g. April 1 – March 31).
- Income is classified by source (Candidate Fees, other Income accounts).
- Expenses are classified by the expense ledger account used.

### Trial Balance
Lists every ledger account with its balance in either the Debit or Credit column.
- If totals match: **Balanced** ✓ — the books are in order.
- If they differ: there is a data entry error somewhere; check recent transactions.

---

## Account Types — Quick Reference

| Type | What it tracks | Normal balance |
|---|---|---|
| Bank / Cash | Money in hand or in bank accounts | Positive = have money |
| Debtor | Someone who owes SPR Techforge money | Positive = they owe us |
| Income | Revenue earned (fees, services) | Positive = revenue earned |
| Expense | Costs incurred (rent, utilities) | Positive = money spent |
| Salary | Monthly salary payments to an employee | Negative = outstanding; 0 = cleared |
| Creditor | Supplier / vendor we owe money to | Negative = we owe them |
| Loan | Loan taken; tracks outstanding principal | Negative = amount still owed |
| Fixed Asset | Long-term assets (computers, furniture) | Positive = asset value |
| Capital | Money invested by owners | Positive = capital invested |

---

## Payroll — How it Works

1. Create a **Ledger Account** (Finance → New Account) with Type = **Salary**.
2. Set the **Fixed Monthly Amount** and **Start Date** on that account.
3. The system automatically calculates how many months are due based on today's date.
4. Each time salary is actually paid, record a Journal Entry (Dr Salary A/c, Cr Bank).
5. The Payroll page shows **Total Payable**, **Total Paid**, and **Outstanding** for each employee.

---

## Common Mistakes to Avoid

| Mistake | What to do instead |
|---|---|
| Recording a transfer as Income | Use Type: Transfer — it moves money between your own accounts |
| Paying a creditor as a "Payment" to an Expense account | Dr the Creditor account (not the expense) → Cr Bank |
| Deleting a locked transaction | Only Admins can delete locked entries — contact the admin |
| Entering the same transaction twice | Check the Transaction Register and filter by date/description before adding |

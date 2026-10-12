# Automation selectors (Selenium / Playwright)

Every interactive element that matters for testing carries a **`data-testid`**
attribute. Form fields on the login, registration and survey pages also carry
the same value as their **`id`**. Prefer `data-testid` everywhere:

```java
driver.findElement(By.cssSelector("[data-testid='login-submit']")).click();
driver.findElement(By.id("login-username")).sendKeys("name@sprtechforge.com");
```

Test ids are a contract with this document. They change only deliberately, and
the unit test `lib/testid.test.ts` guards the derivation rules.

## How ids are derived (shared components)

Most controls get their id automatically from their label, placeholder or text,
lower-cased, with spaces and punctuation turned into `-`, emoji removed, max 48
characters after the prefix.

| Component | Pattern | Example |
| --- | --- | --- |
| Text input with a label | `input-<label>` | `input-full-name`, `input-login-id`, `input-phone-number` |
| Text input with only a placeholder | `input-<placeholder>` | `input-you-example-com` |
| Dropdown | `select-<label>` | `select-role`, `select-event-type` |
| Multi-line text (events module) | `textarea-<label>` | `textarea-message` |
| Button (shared `Button`) | `btn-<text>` | `btn-sign-in`, `btn-create-user`, `btn-export-csv`, `btn-publish-event`, `btn-next-schedule-mode` |
| Card with a title | `card-<title>` | `card-share-this-registration-link` |
| Modal dialog | `modal-<title>` (role=dialog) and `modal-close` | `modal-candidate-profile` |
| Search box | `search-<placeholder>` and `search-clear` | `search-search-candidates` |
| Sidebar link | `nav-<label>` | `nav-events`, `nav-all-candidates`, `nav-sign-out` |
| Sidebar group | `nav-group-<title>` (aria-expanded) | `nav-group-sprconnect` |

A page can override the derived id by passing `data-testid` explicitly; the
table below lists those explicit ids.

## Explicit ids by screen

### Login (`/#/login`)
`login-username`, `login-password`, `login-password-toggle`, `login-submit`,
`login-forgot`, `login-username-error`, `login-password-error`.
Forgot-password modal: `modal-forgot-password`, `forgot-username`, `btn-send-reset-request`, `btn-cancel`.
First-login change: `login-new-password`, `login-confirm-password`, `login-update-password`.

### Layout
`nav-mobile-menu`, `nav-collapse`, `nav-expand`, `nav-current-user`,
`nav-current-user-name`, `nav-current-user-role`, `nav-sign-out`, plus
`nav-<label>` for every menu entry and `nav-group-<title>` for every section.

### Candidates (`/#/candidates`)
Tabs `tab-all`, `tab-active`, `tab-placed`, `tab-discontinued`.
Filters `search-search-candidates` (search box), `filter-batch`, `filter-status`.
Page-wide amounts switch `btn-toggle-all-amounts` (aria-pressed).
Table `candidates-table`; each row `candidate-row` with `data-candidate-id`
and `data-active="true|false"`; phone cards `candidate-card` with the same data attributes.
Row actions: `action-amounts` (title "Hide amounts" / "Reveal amounts"),
`action-view-profile`, `action-edit`, `action-agreement`, `action-statement`,
`action-create-login`, `action-refund`, `action-delete`, `action-active-toggle` (aria-pressed).
Buttons: `btn-export-csv`, `btn-enquiries`, `btn-add-candidate`.

### Add / edit user (`/#/admin/users/new`)
`input-full-name`, `input-login-id`, `input-email`, `input-phone-number`,
`input-password`, `select-role`, `btn-create-user` / `btn-save-changes`.

### Community home (`/#/community`)
`community-new-announcement`, `community-new-celebration`, `community-filter-<key>`,
posts `community-post` with `data-post-id` and `data-post-kind`.
Composer: `modal-new-post` / `modal-edit-post`, `input-title`, `btn-post`, `btn-save-changes`, `btn-cancel`.

### Events admin (`/#/events/manage/...`)
Event page tabs `tab-overview`, `tab-registrations`, `tab-invite`, `tab-feedback`, `tab-checkin`, `tab-recap`.
Editor steps `editor-step-1` … `editor-step-5` (aria-current="step"), banner file input `editor-banner-file`,
`btn-save-draft` / `btn-save-changes`, `btn-publish-event`, `btn-next-<step>`, `btn-previous`.
Invite tab: `btn-upload-excel-csv`, `invite-file` (hidden file input), `btn-download-sample-csv`,
`btn-export-list-csv`, `btn-clear-list`, `invite-mode-invite`, `invite-mode-followup` (aria-pressed),
`input-subject-line`, `input-headline-big-text-under-the-banner`, `textarea-message`, `input-button-text`,
`input-registration-link-to-use-optional` / `input-survey-page-link-to-use-optional`,
`invite-test-email`, `btn-send-test`, `btn-save-wording`, `btn-reset-to-default`,
`invite-search`, `invite-filter`, rows `invite-row` with `data-email` and `data-status`,
stat cards `stat-on-the-list`, `stat-not-sent-yet`, `stat-invited`, `stat-failed`, `stat-mobile-only`, `stat-registered`,
send button `btn-send-invitation-to-<n>-people` (text varies; locate with `[data-testid^='btn-send-']`), `btn-stop`.
Feedback tab: stat cards `stat-responses`, `stat-joined`, `stat-did-not-join`, `stat-avg-rating`,
`stat-course-yes-maybe`, `stat-next-session-yes-maybe`; `btn-export-csv`; `btn-copy-emails`.

### Public event page (`/#/events/<slug>`)
Form fields `reg-full-name`, `reg-email`, `reg-country`, `reg-mobile`, `reg-city`,
`reg-qualification-degree`, `reg-passing-year`, `reg-current-status`,
`reg-how-did-you-hear-about-us`, custom questions `reg-<question label>`,
`reg-consent`, `reg-submit`; errors `<field>-error`, `reg-consent-error`, `reg-submit-error`.

### Public survey page (`/#/events/<slug>/feedback`)
Choices `choice-<text>` with aria-pressed (`choice-yes-i-joined`, `choice-no-i-could-not`,
`choice-the-joining-link-did-not-work-on-my-phone`, `choice-yes-tell-me-more`, …),
rating `feedback-rating-1` … `feedback-rating-5`, `feedback-improve`, `feedback-comments`,
`feedback-name`, `feedback-email`, `feedback-mobile`, `feedback-submit`, `feedback-error`.

### Website enquiry form (`/`)
`enquiry-form`, `enquiry-name`, `enquiry-mobile`, `enquiry-email`, `enquiry-mode`,
`enquiry-interest`, `enquiry-message`, `enquiry-submit`.

## Unit tests

`npm test` runs the Vitest suite (also run by CI before every QA and production
build): derivation rules for test ids, the shared components' hooks, utilities,
and the Events, Seminar and Community module suites. `npm run test:watch` for
development. Browser end-to-end checks remain in the QA team's Selenium project.

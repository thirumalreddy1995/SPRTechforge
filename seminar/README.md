# Seminar Module — Free Software Testing Seminar Promotion

Self-contained module for promoting a free Software Testing coaching seminar:
import candidate lists from Excel, send personalized invitation emails with a
unique registration link per candidate, collect registrations and questions on
a public mobile-first page, and run a resumable email campaign — **all on free
services** (Firebase free tier + the app's existing Gmail Apps Script bridge).

Everything lives in `seminar/`. Integration touch-points outside this folder
(all small, all reversible) are listed under [Removing the module](#removing-the-module).

---

## How it fits this app

This is a client-only React/Vite SPA on Firebase (Firestore + Storage + Hosting)
with a Google Apps Script Gmail bridge for email — **there is no backend
server**. The module therefore adapts the classic server-side design like this:

| Classic design | This module |
| --- | --- |
| SQL tables + migrations | Firestore collections (created on first write). `seminar/services/seminarDb.ts` is the schema definition; `seminar/types.ts` is the source of truth for fields. |
| SMTP with `SMTP_HOST/PORT/USER/PASSWORD` env vars | The app's existing Apps Script Gmail bridge (`VITE_EMAIL_ENDPOINT` / `VITE_EMAIL_SHARED_SECRET`). A browser cannot speak SMTP; see [Email quotas & scaling](#email-quotas--scaling) for SMTP/Brevo alternatives. |
| `secrets.token_urlsafe()` | `crypto.getRandomValues` → base64url (`seminar/lib/token.ts`). |
| Server-side rate limiting | Client-side limit (5 questions/min/token) + a note under [Security](#security-notes). |

## Pages

| Route | Access | Purpose |
| --- | --- | --- |
| `#/seminar/dashboard` | Admin | Stats (candidates, invites sent/failed/pending, registrations online/in-person, unanswered questions) + in-app module tests |
| `#/seminar/import` | Admin | Excel/CSV upload → auto-detected column mapping (remappable) → preview → confirmed import → per-sheet report |
| `#/seminar/candidates` | Admin | Table with per-candidate `wa.me` / `sms:` links, invite-link copy, WhatsApp CSV export |
| `#/seminar/campaign` | Admin | Template editors (A/B subjects, invitation, reminder), rendered preview, test-send to yourself, resumable batch send with progress bar + dry run |
| `#/seminar/questions` | Admin | Question inbox — newest first, unanswered highlighted; replies save to the thread **and** are emailed |
| `#/seminar/settings` | Admin | Banner upload, event details, seats limit, daily send limit, delay, public base URL |
| `#/seminar/s/:token` | **Public** (no login) | Candidate registration page: banner hero, benefit copy, Reserve My Free Seat (online / in person), add-to-calendar, Q&A thread |

Admin pages use the app's existing `AdminRoute` guard (`role === 'admin'` or
`modules` includes `users`).

## Data model ("migrations")

Firestore has no migrations — collections appear on first write. These are the
module's collections (all prefixed `seminar_`), field names in the app's
camelCase convention:

- **`seminar_candidates`** — `fullName`, `email` (lowercase), `phone` (E.164),
  `city`, `state`, `qualification`, `degreeGroup` (source sheet name),
  `inviteToken` (unique), `emailStatus` (`pending|sent|failed`),
  `subjectVariant` (`A|B`), `createdAt`, `updatedAt`
- **`seminar_registrations`** — `candidateId`, `status` (`registered|declined`),
  `preferredMode` (`online|in_person`), `registeredAt`
- **`seminar_questions`** — `candidateId`, `questionText`, `createdAt`,
  `replyText`, `repliedAt`, `replyEmailed`
- **`seminar_campaign_log`** — `candidateId`, `channel`
  (`email_invite|email_reminder|email_reply|email_test`), `subjectVariant`,
  `sentAt`, `error` (null = success). This log is what makes batch sending
  resumable and gives the per-day sent count.
- **`seminar_settings`** — single doc `config`: title, dateTime, venue,
  onlineLink, trainerName, seatsLimit, showSeatsRemaining, bannerPath/Url,
  publicBaseUrl, all email/WhatsApp templates, dailySendLimit, sendDelayMs.

No indexes need to be created manually: the public page queries use single-field
`where` clauses (auto-indexed), and question sorting happens client-side.

## Setup

1. **Env vars** — nothing new. The module reuses the app's existing
   `.env.example` values: the Firebase `VITE_FIREBASE_*` config and the email
   bridge `VITE_EMAIL_ENDPOINT` / `VITE_EMAIL_SHARED_SECRET` (see
   [SETUP-EMAIL.md](../SETUP-EMAIL.md) for the one-time bridge deployment).
   No credentials are hard-coded in this module.
2. **Redeploy the email bridge once** — `apps-script/Code.gs` gained an
   additive `inlineImages` capability so the banner is embedded as a **CID
   attachment** (renders in Gmail/Outlook without the "download images"
   prompt). Copy the updated file into your Apps Script project and
   *Deploy → Manage deployments → Edit → New version → Deploy* (URL stays the
   same). Until you redeploy, invitation emails will show the banner's alt text
   instead of the image — everything else works.
3. **Firebase Storage** — the banner uploads to `seminar/banner-*.{jpg,png,webp}`
   using the app's existing `cloudService.uploadFile`. The bridge fetches it by
   URL when sending, so the file must be publicly readable (it already is under
   the app's current Storage rules).

## Email quotas & scaling (the batching plan)

You have ~4,285 contacts. Daily send capacity depends on the Gmail account
behind the bridge:

| Option | Cost | Capacity | Time to cover 4,285 |
| --- | --- | --- | --- |
| Free Gmail (current setup) | ₹0 | ~100/day (module default limit: 90) | ~48 days |
| Brevo free tier relayed through the bridge (snippet below) | ₹0 | 300/day | ~15 days |
| Google Workspace account | paid | ~1,500/day | 3 days |

The sender is built for this reality:

- **`Daily Send Limit`** (Settings, default 90) — successful sends are counted
  from `seminar_campaign_log` per calendar day; the batch stops at the limit.
- **Delay between sends** (default 2000 ms) — gentle on the bridge and Gmail.
- **Resumable** — every send updates the candidate's `emailStatus` and the log,
  so "Resume Sending" targets *pending-only*. Close the tab, hit the limit,
  come back tomorrow — nothing is double-sent.
- **Failures never stop the run** — they're logged with the error message and
  the candidate is marked `failed`; retry them with the "Include previously
  failed" checkbox.
- **Dry run** — renders and logs everything, sends nothing.
- **A/B subjects** — 50/50 rotation, variant stored per candidate and in the log.

> **Practical plan for 4,285 contacts on ₹0:** switch the bridge to the Brevo
> relay (below) → 300/day → start sending ~15 days before the seminar date,
> one "Resume Sending" click per day. Keep replies/reminders inside the same
> daily budget (the limit counts invites + reminders together, test sends
> excluded).

### Gmail App Password (only if you use an external SMTP tool)

The bridge itself does **not** use SMTP. But if you ever send through an SMTP
tool (Thunderbird mail-merge, a script on another machine, etc.):
Google Account → Security → enable **2-Step Verification** → **App passwords**
→ generate one for "Mail" → use it as `SMTP_PASSWORD` with
`SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=<your gmail>`,
`FROM_EMAIL=<your gmail>`, `FROM_NAME=<your name>`. Same 100–500/day Gmail
limits apply.

### Brevo free tier (300 emails/day, ₹0) relayed through the bridge

1. Create a free account at https://www.brevo.com → verify your sender address
   (Settings → Senders) → SMTP & API → generate an **API key**.
2. In your Apps Script project: Project Settings → Script Properties → add
   `BREVO_API_KEY` = the key, and `BREVO_FROM_EMAIL` / `BREVO_FROM_NAME`.
3. In `Code.gs`, inside `doPost` replace the `MailApp.sendEmail(...)` line with:

```javascript
const brevoKey = PropertiesService.getScriptProperties().getProperty('BREVO_API_KEY');
if (brevoKey) {
  const payload = {
    sender: {
      email: PropertiesService.getScriptProperties().getProperty('BREVO_FROM_EMAIL'),
      name: PropertiesService.getScriptProperties().getProperty('BREVO_FROM_NAME') || undefined,
    },
    to: to.split(',').map(function (a) { return { email: a.trim() }; }),
    subject: String(data.subject),
    htmlContent: data.isHtml ? String(data.body) : undefined,
    textContent: data.isHtml ? undefined : String(data.body),
  };
  const resp = UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'api-key': brevoKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  if (resp.getResponseCode() >= 400) throw new Error('Brevo: ' + resp.getContentText());
} else {
  MailApp.sendEmail(to, String(data.subject), data.isHtml ? '' : String(data.body), options);
}
```

Then raise `Daily Send Limit` to 280–300 in Seminar → Settings. Note: the Brevo
relay path sends the banner via its hosted URL rather than CID (Brevo's inline
attachment flow is different); set `BREVO_API_KEY` back to empty to return to
Gmail+CID.

## WhatsApp & SMS (free, ToS-safe)

Deliberately **no bulk WhatsApp automation** — unofficial bulk senders get
numbers banned without the paid Business API. Instead, Seminar → Candidates
gives you:

- a personalized `https://wa.me/<digits>?text=<message with their link>` link
  per candidate,
- a personalized `sms:` link per candidate,
- **Export WhatsApp CSV** (Name, Phone, Message) for use with WhatsApp
  broadcast lists from your phone — **attach the banner image manually** there,
  since `wa.me` links cannot carry images.

## Templates & placeholders

All copy is editable in Seminar → Campaign before sending. Placeholders:
`{name}` `{city}` `{link}` `{date}` `{time}` `{venue}` `{trainer}` — candidate
values are HTML-escaped at render time; your template HTML is not.
`[BRACKETED]` facts (trainer experience, institute name, tools) are
intentionally left for you to fill in — the module never invents claims.

## Security notes

- Invite tokens are 144-bit random base64url — unguessable, and the public page
  only ever loads data scoped to one token.
- All candidate-supplied text (names from Excel, questions) is escaped —
  React's default on pages, explicit `escapeHtml` in emails.
- The question rate limit (5/min per token) is client-side because there is no
  server. Real server-side enforcement belongs to the Firestore security rules
  work already tracked as **G-02** in `REMEDIATION_PLAN.md`; until then the
  public page relies on the same wide-open-rules posture as the rest of the app
  (e.g. the existing public agreement portal).
- No new credentials anywhere; the module reuses the app's env-var pattern.

## Tests

Seminar → Dashboard → **Run Module Tests** executes the suite in
`seminar/tests/seminarTests.ts` (import pipeline, upsert/dedupe, phone E.164
normalization, email validation, fuzzy header detection, template escaping,
A/B rotation, token uniqueness) — the same in-browser convention as
Admin → Test Runner. There is no Node test runner in this project.

## End-to-end walkthrough

1. **Import your Excel** — Seminar → Import Candidates → drop your `.xlsx`
   (the one with `B.Tech-BE`, `MCA`, `BCA`, `MBA-PGDM` + a `Summary` sheet).
   The `Summary` sheet is auto-skipped; verify the detected mapping per sheet
   (remap with the dropdowns if needed) → **Confirm & Import** → check the
   per-sheet report. Re-importing later merges on email/phone, never duplicates.
2. **Configure** — Seminar → Settings: date & time, venue and/or online link,
   trainer name, seats limit, upload the banner (1200×628 JPG/PNG/WebP ≤ 2 MB).
3. **Prepare the campaign** — Seminar → Campaign: fill every `[BRACKET]` in the
   templates, check the rendered preview, **Send Test to Myself**, and verify
   the banner + button + link on your phone.
4. **Send** — optionally tick *Dry run* first, then **Send Invites**. Watch the
   progress bar; click **Resume Sending** on following days until pending = 0.
5. **During the campaign** — answer questions in Seminar → Questions (replies
   are emailed automatically); track registrations on the Dashboard.
6. **Day before** — Seminar → Campaign → **Send Reminders to Registered**.

## Removing the module

1. Delete the `seminar/` folder.
2. Remove the seminar imports + `/seminar/*` routes from `App.tsx`.
3. Remove the "Seminar" `CollapsibleGroup` from `components/Layout.tsx`.
4. (Optional) Delete the `seminar_*` collections in the Firebase console and
   the `seminar/` folder in Storage.
5. (Optional) The `inlineImages` block in `apps-script/Code.gs` is inert
   without the module — keep or revert as you like.

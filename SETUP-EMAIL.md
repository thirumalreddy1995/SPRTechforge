# Email setup (Google Apps Script, $0 forever)

This is the one-time setup to make the SPRConnect → Email page actually send and receive mail. Nothing requires a credit card or billing upgrade. The whole bridge runs on Google's free Apps Script tier.

About **20–25 minutes** of clicking.

---

## Architecture in one paragraph

A Gmail account you control hosts a Google Apps Script. That script exposes two HTTP endpoints — one that returns your inbox messages as JSON, one that sends an email via Gmail. The frontend points at the deployment URL and talks to it directly. Authentication is a shared secret you choose, stored both in the Apps Script and in GitHub Secrets. The Gmail account becomes "the system's email address" — all outbound from the app is `From:` this address, and any inbound replies arrive in this inbox where the app can read them.

Free Gmail quotas: **100 emails sent per day**, 25MB max email size, 20k Apps Script executions per day. Plenty for a small team. Workspace upgrade later if you outgrow it.

---

## 1. Pick (or create) the Gmail account for the app

Two options:

- **Best:** create a dedicated Gmail account just for the system. Sign out, click *Create account* at gmail.com → choose a name like `sprtechforge.app@gmail.com`. Set a strong password. Save credentials in your password manager.
- **OK:** use an existing Gmail account you already use for the business. Outbound emails will appear to come from there.

Sign into that Gmail account in a browser before continuing — every step below happens *while signed in as that account*.

---

## 2. Create the Apps Script project

1. Open https://script.google.com **while signed in as the email account from step 1**.
2. Click **New project**.
3. Rename the project (top-left) to **SPRTechforge Email Bridge**.
4. Open the file `Code.gs` and **replace its entire contents** with the contents of [`apps-script/Code.gs`](apps-script/Code.gs) in this repo. (Copy-paste the file.)
5. **Save** with the disk icon (or Ctrl+S).

---

## 3. Set the shared secret in Script Properties

The script refuses any request that doesn't supply the matching secret.

1. In the Apps Script editor, click the **gear icon** (Project Settings) in the left sidebar.
2. Scroll down to **Script Properties** → click **Add script property**.
3. Property: `SHARED_SECRET`
4. Value: pick a long random string. **Suggested:** open a terminal and run `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"` — that prints a 32-char random secret. Copy that.
5. **Save**.

Keep the secret value handy — you'll paste it into GitHub Secrets in step 6.

---

## 4. Deploy the script as a Web App

1. Top-right of the Apps Script editor: click **Deploy → New deployment**.
2. Click the gear next to "Select type" → **Web app**.
3. Configuration:
   - **Description**: `SPRTechforge email bridge v1` (any label)
   - **Execute as**: **Me (sprtechforge.app@gmail.com)** ← important; this makes the script run as the Gmail account so it can read/send that mailbox
   - **Who has access**: **Anyone** ← required for the frontend to call it without Google sign-in
4. Click **Deploy**.
5. Apps Script will prompt you to **Authorize access**. Click through:
   - Pick the account
   - "Google hasn't verified this app" → click **Advanced** → **Go to SPRTechforge Email Bridge (unsafe)** (it's your own script — not actually unsafe)
   - Review the scopes (Gmail read + send) → **Allow**
6. After deployment, you see a **Web app URL** — looks like `https://script.google.com/macros/s/AKfycb...long.../exec`. **Copy it.** This is your `VITE_EMAIL_ENDPOINT`.

> **If you edit the script later**, click **Deploy → Manage deployments → pencil/edit icon → Version: New version → Deploy**. The URL stays the same. If instead you create a *new* deployment, you get a *new* URL and have to update GitHub Secrets.

---

## 5. Smoke-test the deployment from your terminal

Replace `<URL>` and `<SECRET>` with values from steps 3 and 4:

```bash
# List inbox (should return {"ok":true,"messages":[...]} )
curl "<URL>?action=list&secret=<SECRET>&limit=5"

# Send a test email to yourself
curl -X POST "<URL>?secret=<SECRET>" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"to":"you@yourdomain.com","subject":"Test from SPRTechforge","body":"Hello world"}'
```

If both work, you're done with the Google side. If the first returns `{"ok":false,"error":"Bad secret"}`, the secret in the URL doesn't match what's in Script Properties.

---

## 6. Add the two GitHub Secrets

Go to https://github.com/thirumalreddy1995/SPRTechforge/settings/secrets/actions and add:

| Secret name (QA) | Value |
| --- | --- |
| `EMAIL_ENDPOINT_QA` | The Web App URL from step 4 |
| `EMAIL_SHARED_SECRET_QA` | The secret string from step 3 |

When you promote to master later, also add `EMAIL_ENDPOINT` and `EMAIL_SHARED_SECRET` (no `_QA` suffix) with the same values — or with a separate Gmail account if you want prod email isolated from QA email.

---

## 7. Push (or re-run the QA workflow)

The latest QA workflow will inject the secrets at build time and bake them into the frontend bundle. Push any commit to the `QA` branch (or click **Re-run all jobs** on the latest run at https://github.com/thirumalreddy1995/SPRTechforge/actions). Once it goes green, open `https://sprtechforge-qa.web.app/#/email` — the SPRConnect → Email page should load your inbox.

---

## What to test

1. **Receive**: from a totally different email address, send a message to the Gmail address from step 1. Within 30 seconds (the auto-refresh interval) it appears in the app's inbox.
2. **Send**: click **+** in the inbox header → fill out To/Subject/Body → click **Send**. The recipient gets an email from your Gmail address.
3. **Attachment**: same as send, but click **Add file** and pick a small PDF or image. The file uploads to Firebase Storage, and the server fetches it back and attaches it. Recipient gets an email with the attachment.
4. **Reply**: click any inbox message → click **Reply** in the reader → the compose form pre-fills with the sender's address and `Re: ...` subject.
5. **Quota visibility**: send a test email; the script's response includes `quotaRemaining` (how many sends are left today on this account). Log into Apps Script and check **Executions** in the left sidebar — every send/list call is logged.

---

## Troubleshooting

**"Email isn't configured yet" screen even after setup**
The two env vars didn't make it into the build. Push a new commit to QA so the workflow re-runs and re-injects them. You can confirm by opening the deployed site, opening DevTools → Console, and running `window.__VITE_ENV__` (or just inspecting the bundled JS for `script.google.com`).

**Send fails with "Service Unavailable" or quota error**
You've hit the 100/day Gmail limit. Wait until midnight Pacific Time, or switch to a Google Workspace account (1500/day).

**Attachments don't arrive**
Either the file in Firebase Storage isn't publicly readable, or it's bigger than 24MB. Open the uploaded file URL in an incognito tab — if you can't see it, your Storage rules are blocking unauthenticated reads. For QA the wide-open rules you set earlier are fine.

**Inbox stays empty even after sending yourself test mail**
Wait up to 30 seconds (auto-refresh) or click the refresh icon. If still empty, the email may have been auto-filed by Gmail under Promotions/Updates — the script reads the *Inbox* category only.

**"Bad secret" everywhere**
The string in `EMAIL_SHARED_SECRET_QA` (GitHub) doesn't match what's in Script Properties. Edit either to make them identical; redeploy or re-run the workflow. Beware of trailing whitespace and quotes.

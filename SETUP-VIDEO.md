# Video calls (Daily.co + Firebase Cloud Functions) setup

This guide walks you through the **manual prerequisites** that the QA workflow needs before video calls will work. The frontend code is already done — once you finish these four sections, push to QA and calls work end-to-end with no auth gates.

Roughly **15 minutes** of clicking.

---

## 1. Upgrade your Firebase QA project to the Blaze plan

Cloud Functions cannot call third-party APIs (like Daily.co) on the free Spark plan. The Blaze plan is pay-as-you-go but has a generous free tier — for the call volume we expect (dozens of calls per day), you will not pay anything. You just have to put a credit card on file.

1. Go to https://console.firebase.google.com/project/sprtechforge-qa/usage/details
2. Click **Modify plan** (or **Upgrade**).
3. Select **Blaze**.
4. Pick or create a billing account (you'll be asked for a card).
5. Confirm.
6. (Optional but recommended) Set a budget alert: https://console.cloud.google.com/billing/budgets?project=sprtechforge-qa — e.g., notify me if usage exceeds $5/month. This is purely a safety net.

You only need to do this for the **QA** Firebase project right now. Repeat for production (`sprtechforge`) when promoting to master.

---

## 2. Sign up for Daily.co and grab an API key

1. Go to https://dashboard.daily.co/signup and create a free account. Pick any sub-domain name (e.g., `sprtechforge` → your rooms will live at `https://sprtechforge.daily.co/<roomname>`).
2. After signup, open **Developers → API keys** in the left sidebar (or directly https://dashboard.daily.co/developers).
3. Copy the API key (a long string starting with letters/digits).

Free tier covers **10,000 participant-minutes/month** — equivalent to ~83 hours of 2-person calls, or ~33 hours of 5-person calls. Plenty for QA testing and small-team daily use.

---

## 3. Tell the Cloud Function about your Daily.co API key

The key is stored in Google Secret Manager (NOT in source code, NOT in GitHub secrets). You set it once via the Firebase CLI.

If you don't have the Firebase CLI installed:

```
npm install -g firebase-tools
firebase login
```

Then from anywhere on your machine:

```
firebase functions:secrets:set DAILY_API_KEY --project sprtechforge-qa
```

It will prompt you to paste the value. Paste the key from step 2 and press Enter.

To verify:

```
firebase functions:secrets:access DAILY_API_KEY --project sprtechforge-qa
```

(It prints the value. Make sure you didn't paste a newline or extra space.)

When you eventually do this for production, repeat with `--project sprtechforge`.

---

## 4. Add Cloud Functions permissions to the QA service account

The CI workflow uses `FIREBASE_SERVICE_ACCOUNT_QA` (the service-account JSON you already set up) to deploy. For it to deploy Cloud Functions (in addition to Hosting), the service account needs a couple of extra IAM roles in the Google Cloud project.

1. Open https://console.cloud.google.com/iam-admin/iam?project=sprtechforge-qa
2. Find the row for `firebase-adminsdk-fbsvc@sprtechforge-qa.iam.gserviceaccount.com` (or whatever the service account email is — same one in your `FIREBASE_SERVICE_ACCOUNT_QA` secret).
3. Click the pencil/edit icon.
4. Click **+ Add another role** and add these (one at a time):
   - **Cloud Functions Admin** (`roles/cloudfunctions.admin`)
   - **Service Account User** (`roles/iam.serviceAccountUser`)
   - **Cloud Build Editor** (`roles/cloudbuild.builds.editor`) — needed for v2 functions to build
   - **Artifact Registry Writer** (`roles/artifactregistry.writer`) — needed to publish function images
5. **Save**.

If you skip this, the CI deploy will succeed for Hosting but fail on the **Deploy Cloud Functions** step with a permission error. Hosting will still update; calls just won't work until you fix the IAM.

---

## After all four steps: deploy and test

1. Push any commit to the `QA` branch (or re-run the latest failed workflow).
2. The workflow will:
   - Build the frontend with QA Firebase secrets
   - Deploy to Firebase Hosting
   - Install function dependencies, build the function, deploy it to your QA Firebase project
3. Open https://sprtechforge-qa.web.app in **two browsers** logged in as different users.
4. From one, open a DM and click **Call** in the chat header.
5. The other browser should immediately show the ring overlay — no Google sign-in, no prejoin screen.
6. Accept → both users in the same Daily.co room with name preset.

---

## Promotion to production (later)

When you're happy with QA, repeat for the production project:

1. Upgrade `sprtechforge` to Blaze: https://console.firebase.google.com/project/sprtechforge/usage/details
2. Add the same IAM roles to the prod service account at https://console.cloud.google.com/iam-admin/iam?project=sprtechforge
3. Run `firebase functions:secrets:set DAILY_API_KEY --project sprtechforge`. You can reuse the same Daily.co API key — same Daily account, same domain.
4. Update `.github/workflows/deploy.yml` to deploy functions (currently it only deploys to GitHub Pages — we'll need to migrate prod to Firebase Hosting OR add a separate functions-only deploy step). Tell me when you're ready and we'll handle this.

---

## Troubleshooting

**`Cloud Functions deploy` step fails with "Cloud Functions API has not been enabled"**
Run once: `gcloud services enable cloudfunctions.googleapis.com --project=sprtechforge-qa` (or enable it in the Console).

**Call starts but says "Could not start the call. Check that the call service is configured."**
Either the function hasn't been deployed yet, or `DAILY_API_KEY` isn't set in Secret Manager. Open the function logs:
```
firebase functions:log --project sprtechforge-qa
```

**Call works for the caller but the callee sees "Room not found"**
The room expired (default 90 min). Just hang up and start a fresh call.

**Want to revoke the Daily.co API key**
https://dashboard.daily.co/developers → delete the key → repeat step 3 with a new one.

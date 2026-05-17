# Operations Runbook — SPR Techforge Management Platform

Operator-facing procedures for deploys, migrations, backups, and incident response. Written so an operator with **no prior context** can follow these steps and recover from common situations.

This document grows with every sprint. Per-sprint procedures live under their own headings; cross-cutting procedures (backups, restore, key rotation) live in §1.

---

## 1. Cross-cutting procedures

### 1.1 Backup — client-side JSON dump (Spark plan compatible)

The managed `firebase firestore:export` command **requires the Blaze plan** and is therefore unavailable to us. We use a master-only in-app "Backup" page instead. The trade-off is documented and accepted:

> **Trade-off — no point-in-time consistency.** The dump iterates each collection sequentially via the existing Firestore listeners. There is a several-second window during which writes happening *during* the export are partially captured (some collections snapshotted before the write, some after). For the migration sizes we deal with in Sprint A (users, candidates — low hundreds of docs each), the inconsistency window is acceptable. Do not use this backup as a primary disaster-recovery mechanism — it is a migration safety net.

**Procedure:**

1. Log in to the app as the master account.
2. Navigate to **Admin → Cloud Setup → Backup & Restore** (the page extends the existing `pages/admin/Migration.tsx` — added in a Sprint-A follow-up commit once the underlying helpers exist).
3. Click **Download full backup**. The browser downloads `spr-backup-<env>-<YYYYMMDD-HHMMSS>.json`.
4. Save the file to your local `backups/` directory (gitignored). For Sprint-A migrations, also copy it to a second physical location (USB stick, second laptop, encrypted cloud drive — operator's choice).
5. Verify the file is non-empty (`> 1 KB`) and the JSON parses (`jq . spr-backup-*.json > /dev/null`).
6. **Do not** proceed with any migration step until you have confirmed the backup is valid.

**Restore (master-only "Restore from JSON" page):**

1. **Confirm you want to do this.** Restore overwrites every document in the affected collections. There is no undo.
2. Open **Admin → Cloud Setup → Backup & Restore → Restore**.
3. Select the backup JSON file.
4. The page displays a summary: "About to restore <N> collections / <M> total documents."
5. A confirmation modal asks you to **type the Firebase project name** (e.g., `sprtechforge-qa`) before the Restore button enables. This prevents misfires across environments.
6. Click **Restore**. The page writes documents back via the existing `cloudService` write paths — Firestore rules apply.

**Backup file format** is a single JSON object: `{ "exportedAt": "<iso>", "projectId": "<id>", "collections": { "users": [...], "candidates": [...], ... } }`.

> **Sprint-A status:** the Backup & Restore page is not yet implemented. The G-01 password migration uses a manual one-time export-via-cloud-console approach until this page lands. The next gap that genuinely requires bulk export (G-11 resume backfill) will deliver this page.

### 1.2 Break-glass: Firebase Admin SDK migration

Used only when an in-app migration is infeasible (e.g., > 10k documents to process, or rules prevent the operation client-side). The primary path remains the in-app migration page.

**Generate a fresh service-account key:**

1. Go to https://console.firebase.google.com/project/<project-id>/settings/serviceaccounts/adminsdk.
2. Click **Generate new private key** → confirm. A JSON file downloads.
3. Save it as `./scripts/.firebase-admin-key.json`. This path is gitignored (`.gitignore` entry: `scripts/.firebase-admin-key.json`). **Never commit this file. Never paste its contents into chat.**

**Run a migration script:**

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "$(Resolve-Path .\scripts\.firebase-admin-key.json)"
$env:FIREBASE_PROJECT_ID = "sprtechforge-qa"   # or sprtechforge for prod
node scripts/<script-name>.mjs
```

```bash
# bash equivalent
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/scripts/.firebase-admin-key.json"
export FIREBASE_PROJECT_ID="sprtechforge-qa"
node scripts/<script-name>.mjs
```

**Rotate the key immediately after the migration:**

1. Go back to https://console.firebase.google.com/project/<project-id>/settings/serviceaccounts/adminsdk.
2. Click the **Manage service account permissions** link → opens Google Cloud IAM.
3. Find the service account row, click the kebab menu → **Manage keys**.
4. Locate the key you just used (match by creation timestamp and the key-ID prefix shown in the JSON's `private_key_id` field).
5. Click the trash icon → **Delete**. Confirm.
6. Delete the local JSON file: `Remove-Item .\scripts\.firebase-admin-key.json` (or `rm scripts/.firebase-admin-key.json`).

**Rotation cadence:** every break-glass use rotates. If no break-glass use has occurred in a calendar year, rotate annually anyway (Q1 every year). Set a calendar reminder.

**Audit:** every key generation and revocation is logged by Google Cloud IAM under the project's audit logs. Master can review the trail at https://console.cloud.google.com/iam-admin/audit/?project=<project-id>.

### 1.3 Verification checklist (end of every commit)

Before pushing every commit in Sprint A, the working loop is:

1. `npm run build` passes (TypeScript + Vite).
2. `npm test` passes (once C-06 lands; until then this step is a no-op).
3. Manual smoke test of the affected feature in a clean browser session — log out, clear localStorage if needed, log back in, exercise the change path.
4. `git push` only after steps 1–3 are green.

This is a hard rule, not a "try to remember". If any step fails, fix it before moving on.

---

## 2. Sprint A — gap-specific procedures

### 2.1 G-06 — Master `isMaster` flag rollout

**What changed:** master-capability is now read from `user.isMaster === true` instead of compared against the hardcoded username `thirumalreddy@sprtechforge.com`. Existing user records in Firestore that have the bootstrap username but lack the flag will be auto-patched on the next app load — the patch action writes a `BOOTSTRAP_ISMASTER_PATCH` event to the `events` collection.

**Deploy steps:**

1. **Backup first.** Follow §1.1 (in-app dump). For Sprint A's G-06 specifically the backup is light — just `users`, `events`. If the in-app Backup page is not yet shipped, use the break-glass path (§1.2) and run a one-off Node script that exports `users` and writes JSON to disk.
2. Merge `DevelopmentBranch` → `QA` (auto-deploys via existing GitHub Actions workflow).
3. Log in to QA as the master account.
4. Verify: open the browser dev console, expect a single log line near the `users` snapshot indicating either no patch was needed (record already correct in QA) or one patch event was emitted (bootstrap admin patched).
5. Visit **Admin → Activity Logs** (master-only); confirm you can still reach it.
6. Visit **Finance → Dashboard**; confirm you can still reach it.
7. Log in as a non-master admin (test the route guard); confirm `/finance/*` and `/admin/logs` redirect to `/dashboard`.
8. Merge `QA` → `master` only after QA verification passes.

**Rollback:** revert the G-06 commit. The `isMaster: true` field on the Firestore record is harmless if no code reads it. The `events` collection accumulates one `BOOTSTRAP_ISMASTER_PATCH` row — also harmless.

### 2.2 G-01 — Post-deploy password rotation (mandatory)

**This step is REQUIRED to complete Sprint A.** It is what makes the plaintext-in-history (RR-01 in [CODE_REVIEW_FINDINGS.md](CODE_REVIEW_FINDINGS.md)) actually mitigated rather than just nominally documented.

**Timing:** within 24 hours of G-01 (password hashing) reaching production.

**Steps:**

1. Confirm G-01 is live in production: `https://sprtechforge.github.io/SPRTechforge` (or current prod URL) is serving the new build with bcryptjs in the JS bundle.
2. Log in to **production** with `thirumalreddy@sprtechforge.com` and the bootstrap plaintext password `ThiruPriya@13`. This login uses the dual-format `verify()` path — it will succeed against the legacy plaintext and the lazy-migration step will rehash and persist a bcrypt value.
3. Verify the rehash worked: in the Firebase Console, navigate to Firestore → `users` → `admin-01`. Confirm the `password` field now starts with `$2a$` or `$2b$` and is no longer the readable plaintext.
4. From the app, go to **Profile / Settings → Change Password** (or the equivalent flow). Set a NEW password (not `ThiruPriya@13`, and not any password you have used on another system). Use a generated value from a password manager — record it there, not in source control or in chat.
5. Log out. Log back in with the new password. Confirm success.
6. Repeat steps 2–5 against QA so QA and prod both have the source-tree bootstrap password retired.
7. Tick off this step in the sprint tracker. **Sprint A is not complete until this step is done.**

**Why this matters:** the bootstrap bcrypt hash compiled into the JS bundle still corresponds to `ThiruPriya@13`. Anyone with access to git history could verify the plaintext. Once the master rotates the password via the in-app flow, the Firestore record carries a fresh hash that has no representative in source — the source-tree hash is inert.

**If you cannot rotate within 24 hours:** restrict the master account by other means (block via Firestore rules to require a known IP, etc.) until the rotation can happen. Notify the team.

### 2.3 G-07 — Audit-log triage (placeholder; full procedure lands with G-07)

The `events` collection accumulates security and business events. Until G-07 ships the in-app Audit page, master can read events directly from the Firebase Console: Firestore → `events`. Sort by `timestamp` descending; filter by `category == 'security'` for security events only. The first runtime event you should expect to see post-G-06 deploy is one `BOOTSTRAP_ISMASTER_PATCH` per environment.

---

## 3. Known-gotchas

- **`firebase firestore:export` is Blaze-only.** Do not promise this in deploy plans. Use §1.1 instead.
- **Firebase Anonymous Auth is required for G-02 rules to work.** It is enabled at app start via `signInAnonymously()` (added in the Sprint-A G-02 commit). If Anonymous Auth is disabled at the project level (Firebase Console → Authentication → Sign-in method → Anonymous), every Firestore call will fail with `permission-denied`. Verify it is **Enabled** on both QA and prod projects before deploying G-02.
- **Service-account JSON in chat = security incident.** If the key file is ever exposed (chat, screenshot, public repo), follow §1.2's rotation procedure immediately and then audit IAM logs for any unauthorised activity.

---

## 4. Changelog

| Date | Change |
| --- | --- |
| 2026-05-17 | Initial runbook. Created alongside G-06 commit. |

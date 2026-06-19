# Environment setup: Dev → QA → Production

This repo has three environments. Code flows in one direction:

```
DevelopmentBranch  →  QA  →  master
   (local dev)       (test)   (production)
```

| Branch              | Where it runs                                 | Database (Firebase project)       |
| ------------------- | --------------------------------------------- | --------------------------------- |
| `DevelopmentBranch` | Your laptop (`npm run dev`)                   | Whatever `.env.local` points at   |
| `QA`                | Firebase Hosting (deploys on push to `QA`)    | `sprtechforge-qa` (fresh, isolated) |
| `master`            | GitHub Pages → sprtechforge.com (on push)     | `sprtechforge` (production)       |

Deployments are automatic on push. You merge between branches via PRs.

---

## One-time setup (you must do this — I cannot)

### 1. Create the QA Firebase project (fresh database)

1. Go to https://console.firebase.google.com → **Add project**.
2. Name it something like `sprtechforge-qa`. Skip Google Analytics if you don't need it.
3. Once created, in the project: **Build → Firestore Database → Create database** → start in **production mode** (or test mode if your existing rules are open) → pick a region.
4. **Project settings (gear icon) → Your apps → Add app → Web (`</>`)**. Register the app with a nickname like `sprtechforge-qa-web`. Copy the resulting config object — you'll need its values for step 3.
5. **Build → Hosting → Get started**. Accept defaults. Note the default site URL (looks like `https://sprtechforge-qa.web.app`).

### 2. Generate a Firebase service account for CI

The QA deploy workflow uses a service account to authenticate, not your personal login.

1. In the QA Firebase project: **Project settings → Service accounts → Generate new private key**. Download the JSON file.
2. Open it — you'll paste the entire JSON content into a GitHub secret in step 3.

### 3. Add GitHub Actions secrets

Go to https://github.com/thirumalreddy1995/SPRTechforge/settings/secrets/actions and add the following.

**Production secrets** (one-time — these match your existing hardcoded values, so prod won't break even if you skip this):

| Secret name | Value (from existing `services/cloud.ts`) |
| --- | --- |
| `FIREBASE_API_KEY` | `AIzaSyDWiI7gQ-sCLiMfoNPAmbqrT_XNAH2SxL8` |
| `FIREBASE_AUTH_DOMAIN` | `sprtechforge.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `sprtechforge` |
| `FIREBASE_STORAGE_BUCKET` | `sprtechforge.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `576106145208` |
| `FIREBASE_APP_ID` | `1:576106145208:web:fcd3c869f30544efca2bcd` |
| `FIREBASE_MEASUREMENT_ID` | `G-JN6S6L5KH5` |

**QA secrets** (from the config you copied in step 1.4):

| Secret name | Value |
| --- | --- |
| `FIREBASE_API_KEY_QA` | from QA Firebase config |
| `FIREBASE_AUTH_DOMAIN_QA` | from QA Firebase config |
| `FIREBASE_PROJECT_ID_QA` | from QA Firebase config (e.g. `sprtechforge-qa`) |
| `FIREBASE_STORAGE_BUCKET_QA` | from QA Firebase config |
| `FIREBASE_MESSAGING_SENDER_ID_QA` | from QA Firebase config |
| `FIREBASE_APP_ID_QA` | from QA Firebase config |
| `FIREBASE_MEASUREMENT_ID_QA` | from QA Firebase config |
| `FIREBASE_SERVICE_ACCOUNT_QA` | **entire JSON content** of the service-account file from step 2 |

The QA deploy workflow will refuse to run if `FIREBASE_PROJECT_ID_QA`, `FIREBASE_API_KEY_QA`, or `FIREBASE_SERVICE_ACCOUNT_QA` are missing — that guard is intentional, so QA traffic can never accidentally hit production.

### 4. (Recommended) Protect `master` and `QA` so changes only enter via PR

Go to https://github.com/thirumalreddy1995/SPRTechforge/settings/branches → **Add branch protection rule**.

- Rule for `master`: require a pull request before merging. Optionally require status checks to pass.
- Rule for `QA`: same.

This enforces the Dev → QA → master direction.

### 5. (Optional) Local development with a separate Firebase project

If you want local `npm run dev` to write to a third sandbox database instead of the production project (current fallback behavior):

1. Create a third Firebase project (`sprtechforge-dev` or similar), or just reuse the QA one.
2. Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is gitignored.

---

## How the deployment flow works after setup

### Daily workflow

```bash
# 1. Work on a feature locally
git checkout DevelopmentBranch
# ...make changes, commit...
git push origin DevelopmentBranch

# 2. Promote to QA for testing
#    Open a PR from DevelopmentBranch → QA on GitHub.
#    Merging it triggers .github/workflows/deploy-qa.yml
#    which deploys to https://sprtechforge-qa.web.app

# 3. Promote to production
#    Open a PR from QA → master.
#    Merging it triggers .github/workflows/deploy.yml
#    which deploys to sprtechforge.com
```

### What runs on what push

| Push to             | Workflow file       | Deploy target                       |
| ------------------- | ------------------- | ----------------------------------- |
| `DevelopmentBranch` | — (no workflow)     | Nothing. Local development only.    |
| `QA`                | `deploy-qa.yml`     | Firebase Hosting (QA project)       |
| `master`            | `deploy.yml`        | GitHub Pages → sprtechforge.com     |

### Useful URLs after setup

- **Production** — https://sprtechforge.com
- **QA** — https://<your-qa-project-id>.web.app (shown in Firebase Hosting after first deploy)
- **GitHub Actions** — https://github.com/thirumalreddy1995/SPRTechforge/actions
- **GitHub Secrets** — https://github.com/thirumalreddy1995/SPRTechforge/settings/secrets/actions
- **Firebase Console (QA)** — https://console.firebase.google.com/project/<your-qa-project-id>

---

## Troubleshooting

**QA workflow fails with "FIREBASE_*_QA is not set"** — You haven't added that secret yet. See step 3.

**QA deploys but data is going to the production database** — Either the QA secrets are pointing at the production project ID, or the secrets are missing and the build silently fell back to the hardcoded prod values. The guard in `deploy-qa.yml` should prevent this; if it doesn't, double-check `FIREBASE_PROJECT_ID_QA`.

**Production deploy stopped working after this change** — Unlikely, because `services/cloud.ts` falls back to the previous hardcoded values when secrets aren't set. But if it does, set the production secrets from the table in step 3.

**Want a `qa.sprtechforge.com` custom domain instead of `*.web.app`** — In the Firebase Hosting console for the QA project: **Hosting → Add custom domain**. Then add the DNS records Firebase shows at your domain registrar. Nothing in this repo needs to change.

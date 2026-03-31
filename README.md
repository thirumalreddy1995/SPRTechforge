# SPR Techforge Management

A full-featured internal management system for SPR Techforge, built with React, TypeScript, and Firebase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Language | TypeScript 5 |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS v3 |
| Fonts | Inter (Google Fonts) |
| Backend / Database | Firebase Firestore v12 |
| Build Tool | Vite 5 |
| Runtime | Node.js |

---

## Features

- **Dashboard** — Overview of key metrics and activity
- **Candidates** — Add candidates, manage enquiries, candidate info, agreements, and candidate list
- **Training** — Curriculum, attendance sheets, progress monitoring, interviews, candidate dashboard, and interview questions
- **Finance** — Accounts, transactions, payroll, account statements, and financial statements
- **Reports** — Cross-module reporting
- **Address Book** — Contact management
- **Web Leads** — Manage incoming web leads
- **Admin** — User management, cloud setup, data migration, test runner, and activity logs
- **Public Portal** — Candidate-facing agreement portal

---

## Project Structure

```
SPRTechforge/
├── components/          # Shared UI components
├── pages/
│   ├── admin/           # User management, cloud setup, migration, logs
│   ├── candidates/      # Candidate add, list, info, enquiry, agreement
│   ├── finance/         # Accounts, transactions, payroll, statements
│   ├── training/        # Curriculum, attendance, progress, interviews
│   └── public/          # Public-facing portal pages
├── services/
│   └── cloud.ts         # Firebase Firestore service (CRUD + real-time sync)
├── index.css            # Global styles + Tailwind directives
├── tailwind.config.js   # Tailwind theme (custom spr, slate, gray colors)
├── postcss.config.js    # PostCSS config for Tailwind
└── vite.config.ts       # Vite build config
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)

### Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output is placed in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## Firebase Configuration

The app connects to Firebase Firestore using a default hardcoded config. To override with your own Firebase project:

1. Go to **Admin → Cloud Setup** in the app.
2. Paste your Firebase config JSON.
3. The app will reload and connect to your project.

To revert to the default config, use the **Clear Config** option in Cloud Setup.

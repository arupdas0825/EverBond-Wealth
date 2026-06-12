<div align="center">

<img
  src="https://github.com/user-attachments/assets/ebd070b6-2b36-4ba3-a2ed-f10e27f4df3a"
  width="120"
  height="84"
  alt="EverBond Wealth Logo"
/>

<br /><br />

<picture>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=B8902A,C9A84C,1A1714&height=200&section=header&text=EverBond%20Wealth&fontSize=52&fontColor=FDFCF9&fontAlignY=38&desc=Build%20Wealth%20Through%20Every%20Stage%20of%20Life&descAlignY=60&descColor=C9A84C&animation=fadeIn" width="100%" alt="EverBond Wealth Banner"/>
</picture>

<br /><br />

# EverBond Wealth

### **Build Wealth Through Every Stage of Life**

EverBond Wealth is a relationship-driven, premium financial planning platform that evolves with your life. Whether you are building solo, planning with a committed partner, or orchestrating multi-generational family wealth, the platform restructures its entire workspace — dashboards, calculations, and tools — around your current life stage.

<br />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-everbond--wealth.vercel.app-B8902A?style=flat-square&logo=vercel&logoColor=white)](https://everbond-wealth.vercel.app)
[![Version](https://img.shields.io/badge/Version-2.0.0-C9A84C?style=flat-square)](https://github.com/arupdas0825/EverBond-Wealth/releases)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-4E9B78?style=flat-square)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A67D8?style=flat-square&logo=pwa&logoColor=white)](#-pwa--offline-support)

<br />

**[🌐 Live Demo](https://everbond-wealth.vercel.app)** &nbsp;·&nbsp; **[🐛 Report a Bug](https://github.com/arupdas0825/EverBond-Wealth/issues)** &nbsp;·&nbsp; **[💡 Request a Feature](https://github.com/arupdas0825/EverBond-Wealth/issues)**

<br />

---

</div>

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Live Demo](#-live-demo)
- [Screenshots](#-screenshots)
- [Core Philosophy](#-core-philosophy)
- [Feature Documentation](#-feature-documentation)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Installation Guide](#-installation-guide)
- [Firebase Setup Guide](#-firebase-setup-guide)
- [Environment Variables](#-environment-variables)
- [Authentication Documentation](#-authentication-documentation)
- [Firestore Documentation](#-firestore-documentation)
- [State Management](#-state-management)
- [Financial Calculation Engine](#-financial-calculation-engine)
- [EverBond ID System](#-everbond-id-system)
- [PWA & Offline Support](#-pwa--offline-support)
- [Deployment Guide](#-deployment-guide)
- [Security Practices](#-security-practices)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Project Overview

EverBond Wealth is a **fully client-side, PWA-enabled React application** backed by **Firebase Authentication and Firestore**. It is built around a core insight: financial planning tools should not be static. They should evolve in step with the user's life.

The platform supports three distinct planning modes — **Single**, **Committed Partner**, and **Family Dynasty** — each unlocking a progressively deeper set of collaborative financial tools. Every dashboard, chart, goal tracker, and simulation adapts in real time based on the active life stage and income data entered.

**Current Implementation Status:**

| Module | Status |
|---|---|
| Landing Page | ✅ Complete |
| Firebase Authentication | ✅ Complete |
| Firestore User Database | ✅ Complete |
| Multi-Step Onboarding | ✅ Complete |
| Main Dashboard | ✅ Complete |
| Income Management | ✅ Complete |
| Asset Allocation Engine | ✅ Complete |
| Wealth Simulation (SIP) | ✅ Complete |
| Goals & Milestones | ✅ Complete |
| Wealth Insights Center | ✅ Complete |
| Partner Connection System (QR + ID) | ✅ Complete |
| Couple Planning Workspace | ✅ Complete |
| Family Dynasty Workspace | ✅ Complete |
| Notification Center | ✅ Complete |
| Journey Timeline | ✅ Complete |
| Settings Center | ✅ Complete |
| Profile Management | ✅ Complete |
| In-App Documentation | ✅ Complete |
| Light / Dark Theme | ✅ Complete |
| PWA + Service Worker | ✅ Complete |
| Route Guard System | ✅ Complete |

---

## 🌐 Live Demo

> **[https://everbond-wealth.vercel.app](https://everbond-wealth.vercel.app)**

The live deployment on Vercel includes the complete production build with all lazy-loaded page chunks, asset optimization, and Firebase authentication configured.

---

## 📸 Screenshots

### Landing Page
![Landing Page](https://github.com/user-attachments/assets/ebd070b6-2b36-4ba3-a2ed-f10e27f4df3a)

### Onboarding Flow
<img width="1574" height="790" alt="Onboarding Flow" src="https://github.com/user-attachments/assets/165f9b89-e3e3-46d0-9084-0a96dc2c6242" />

### Settings Center
![Settings Center](https://github.com/user-attachments/assets/dca526b7-8ddc-411b-b23e-8b49902debdc)

### Dark Theme
![Dark Theme](https://github.com/user-attachments/assets/bebd0c01-d41b-4b3e-aad3-9811ae1feb48)

---

## 🧠 Core Philosophy

EverBond Wealth is built around three life stages that unlock progressively deeper collaborative tools:

| Stage | Mode | Purpose |
|---|---|---|
| 🧍 **Single** | Solo Builder | Personal financial autonomy — income tracking, individual asset allocation, solo wealth simulations, personal milestone tracking. |
| 💑 **Committed** | Partner Mode | Shared future planning — dual income dashboards, partner connection system, combined goal timelines, couple planning workspace. |
| 👨‍👩‍👧 **Married** | Family Dynasty | Multi-generational wealth — unified household ledgers, family planning workspace, child fund targets, joint retirement modeling. |

Each stage change triggers an automatic reconfiguration of every dashboard widget, chart, and financial metric across the entire application.

---

## ✨ Feature Documentation

### 🔐 Authentication System

Firebase Authentication is fully integrated with three sign-in providers:

- **Email / Password** — Standard credential-based registration and login.
- **Google OAuth** — One-click sign-in via `GoogleAuthProvider` with `select_account` prompt forced.
- **Apple OAuth** — Sign in with Apple via `OAuthProvider('apple.com')`.

All providers share the same `createUserDocument()` flow in Firestore, guaranteeing a single canonical user document regardless of sign-in method. Session state is persisted across browser refreshes via Firebase's built-in auth state listener (`onAuthStateChanged`).

---

### 🧭 Onboarding System

A three-step onboarding flow fires for every new user after their first authentication:

**Step 1 — Personal Identity**
Collects: Full Name, Age, Country (from a predefined list of 8 regions), and preferred Currency.

**Step 2 — Journey Selection**
User selects one of three life-stage modes: Single, Committed Partner, or Family Dynasty. This selection determines which dashboard workspaces are initially unlocked.

**Step 3 — Legal Consent**
Full Terms & Conditions, Privacy Policy, and Data Storage Consent flow. Consent must be granted before the `onboardingCompleted` flag is written to Firestore.

---

### 📊 Main Dashboard

The dashboard is the central command view. It displays:

- **Financial Health Score** — A 0–100 score computed from savings rate (30 pts), emergency reserve adequacy (20 pts), portfolio diversification (20 pts), crypto exposure risk (20 pts), and a consistency bonus (10 pts). Labelled: Excellent / Strong / Healthy / Average / Needs Work.
- **Budget Overview** — Income split across Expenses, Investments, and Emergency Reserve using the active preset ratios.
- **Cashflow Bar Chart** — Recharts `BarChart` visualizing Income, Expenses, Investments, and Savings in the user's selected currency.
- **Asset Allocation Donut** — Recharts `PieChart` showing portfolio split across Equity, Debt, Gold, Cash, Crypto, and Other.
- **Milestone Highlights** — Recent timeline events pulled from the journey timeline system.
- **Personalized Greeting** — Time-aware greeting (Good Morning / Afternoon / Evening) addressed to the user's name.

The dashboard fully respects the active life stage: `stage === 'Single'` uses only P1 salary; `Committed` and `Married` modes add P2 salary to all calculations.

---

### 💰 Income Management

A dedicated income page to configure salary inputs:

- **Primary Income (P1)** — Personal monthly income in the user's chosen currency.
- **Secondary Income (P2)** — Partner income (unlocked for Committed and Married stages).
- Real-time recalculation of all financial snapshots on input change.
- Currency-aware formatting using `Intl.NumberFormat` with locale-specific symbols.

---

### 📐 Asset Allocation Engine

A full breakdown of how income is distributed according to the active investment preset:

- **Budget Layer** — Needs, Emergency Reserve, Investments.
- **Investment Layer** — Equity, Debt, Commodities, Crypto.
- **Equity Sub-Layer** — Large Cap, Mid Cap, Small Cap.
- **Debt Sub-Layer** — Liquid Fund, Short-Term Mutual Fund, Target Maturity Fund.
- **Commodities Sub-Layer** — Gold, Silver.
- **Goal Allocation** — Child Fund, Retirement, House, Vacation (with Excel-derived fractions).
- **Blended Return Rate** — Weighted-average expected return across all asset classes.

Three preset profiles calibrate all ratios simultaneously:

| Preset | Needs | Investments | Equity | Crypto |
|---|---|---|---|---|
| Conservative | 60% | 30% | 40% | 2% |
| Balanced | 55% | 35% | 60% | 2% |
| Aggressive | 50% | 40% | 70% | 2% |

---

### 📈 Wealth Simulation Engine

An interactive SIP future-value projector with:

- **Formula** — `FV = PMT × [((1 + r)^n − 1) / r] × (1 + r)` — the exact formula used in the source Excel workbook.
- **Inflation Adjustment** — Optional toggle that applies 6% annual inflation to compute real returns.
- **Projection Horizons** — 1, 5, 10, 20, 30 years (configurable).
- **Custom Return Rate Override** — Users can override the blended return with a manual rate.
- **Area Chart** — Recharts `AreaChart` showing Wealth Corpus vs. Total Invested over time.
- **Summary Metrics** — Final corpus, total invested, total gains, and wealth multiplier.

---

### 🎯 Goals & Milestones

**Goals Page**
Goal targets for Child Fund, Retirement Corpus, House Purchase, and Vacation. Tracks each goal's monthly SIP allocation, projected corpus, and time-to-target using the `calculateGoalTimeline()` utility.

**Milestone Page**
Chronological milestone log. Users can create custom milestones with titles and dates. System milestones are auto-generated on key events (partner connection, stage upgrade).

---

### 📉 Visual Wealth Insights Center

A data-rich analytics view with multiple chart types:

- **Net Worth Timeline** — Area chart tracking historical net worth.
- **Income History** — Multi-line chart overlaying P1 and P2 income trends.
- **Wealth Forecast** — 3-scenario area chart (Optimistic, Base, Conservative) projecting long-term corpus.
- **Asset Allocation Doughnut** — Interactive pie with hover states.
- **Savings Rate Analysis** — Savings rate over time.
- All charts use Recharts with fully custom tooltip styling and gold/warm color palette.

---

### 🔗 Partner Connection System

A full partner linking flow supporting both QR-code-based and manual ID-based connection:

**QR Code Flow**
- Generates a JSON-encoded QR code from `react-qr-code` containing the user's `userId`, `userName`, and connection metadata.
- Camera-based scanning using `jsQR` via the `MediaDevices.getUserMedia` API with `requestAnimationFrame` scan loop.
- Mobile: opens native camera in a full-screen overlay. Desktop: opens a modal with a scan placeholder and manual fallback.

**Manual ID Flow**
- Validates EverBond ID format (`EB-[A-Z0-9]{6}`) via `isValidEverBondId()`.
- User enters the partner's EverBond ID, partner name, and anniversary date.
- Sends a connection request that transitions `connectionStatus` from `none` → `pending`.

**Connection States**
`none` → `pending` → `received` → `connected`

**Disconnect Partner**
A confirmed disconnection flow that resets all partner-related state fields.

---

### 💑 Couple & Family Planning Workspaces

**Couple Planning Page** — Accessible in Committed and above stages. Displays combined income, shared goal planning, and relationship milestone management.

**Family Dynasty Page** — Accessible in Married stage with a confirmed partner link. Orchestrates multi-generational planning tools, family ID generation (`FAM-YEAR-NUM`), and child fund projections.

---

### 🔔 Notification Center

A persistent notification system with four categories:

- `system` — Theme changes, platform events.
- `financial` — Income updates, allocation changes.
- `partner` — Connection requests and status changes.
- `relationship` — Stage upgrades and journey events.

Notifications support read/unread states, timestamps, and a dropdown notification panel in the layout header.

---

### 📅 Journey Timeline

A chronological event log automatically updated by platform actions:

- Profile creation, income setup, goal creation.
- Partner connection requests and confirmations.
- Stage transitions (Single → Committed → Married).
- User-created milestones.

Events carry a `isMilestone` flag that highlights significant relationship and financial turning points.

---

### ⚙️ Settings Center

A full-featured settings panel organized into sections:

- **Theme Configuration** — Light, Dark, and Auto (UI-exposed) modes.
- **Notification Preferences** — Toggles for Push Notifications, Couple Alerts, Goal Alerts, and Milestone Alerts.
- **Data Visibility** — `public` / `shared` / `private` sharing mode selector.
- **Active Sessions** — View and revoke active browser sessions.
- **Data Export** — Exports the full Zustand persist state from `localStorage` as a JSON file.
- **Account Deletion** — Permanently deletes both the Firestore user document and the Firebase Auth record.

---

### 👤 Profile Management

- View and edit full name, bio, country, currency.
- Profile photo upload.
- Display EverBond ID with a one-click copy button.
- Join date, relationship stage badge.

---

### 📖 In-App Documentation

A full in-app documentation page covering platform usage, EverBond ID system, partner connection guide, and calculation methodology.

---

### 🎨 UI / UX System

- **Premium Warm Light Theme** — Beige background (`#FAF6EE`), gold accents (`#B8902A`), Inter body + Cormorant Garamond display.
- **Deep Dark Theme** — High-contrast charcoal dark mode with CSS variable swap.
- **Floating Desktop Sidebar** — Fixed left navigation for dashboard modules on screens ≥ 1024px.
- **Glassmorphic Mobile Bottom Nav** — A pill-shaped bottom navigation bar with smooth active state transitions.
- **CursorSpotlight** — GPU-accelerated radial gold gradient that follows the cursor via `requestAnimationFrame`, with zero React re-renders (pure DOM + RAF).
- **AnimatePresence Transitions** — Framer Motion fade/blur transitions between all route changes.
- **Lazy Loading** — All 14 page components are `React.lazy()` loaded with `Suspense` shimmer skeletons.
- **Toast System** — A global toast notification provider with `success`, `error`, and `info` variants.
- **Cookie Consent Banner** — GDPR-style consent banner on first visit.
- **Privacy Drawer** — In-app full-screen privacy policy and terms drawer.
- **Splash Screen** — Branded splash screen shown on initial app load.
- **Error Boundary** — React `ErrorBoundary` wrapping all partner page content.
- **Firebase Config Guard** — Detects missing or malformed environment variables and renders a human-readable error UI instead of crashing.
- **Route Guard Screen** — Renders a locked-stage message when a user attempts to access a workspace above their current life stage.

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|---|---|---|
| UI Framework | React | 19.2.5 |
| Build Tool | Vite | 8.0.10 |
| State Management | Zustand (with persist) | 5.0.12 |
| Animation | Framer Motion | 12.38.0 |
| Authentication | Firebase Auth | 12.14.0 |
| Database | Firebase Firestore | 12.14.0 |
| Charts | Recharts | 3.8.1 |
| QR Code Generation | react-qr-code | 2.0.21 |
| QR Code Scanning | jsQR | 1.4.0 |
| Icons | lucide-react | 1.14.0 |
| Linting | ESLint | 10.2.1 |
| Deployment | Vercel | — |

**No TypeScript. No Tailwind CSS.** All styling is handled via custom CSS custom properties defined in `src/index.css`, with a centralized design token object at `src/theme/tokens.js`.

---

## 📁 Folder Structure

```
EverBond-Wealth/
├── public/
│   ├── favicon.svg
│   ├── logo.png
│   ├── manifest.json              # PWA manifest
│   ├── offline.html               # Offline fallback page
│   ├── sw.js                      # Service Worker (stale-while-revalidate)
│   └── icons/                     # PWA icons (192×192, 512×512, maskable)
│
├── scripts/
│   └── generate-icons.js          # Jimp-based PWA icon generator script
│
├── src/
│   ├── main.jsx                   # React DOM entry point
│   ├── App.jsx                    # Root component: routing, auth listener, layout
│   ├── index.css                  # Global CSS, CSS custom properties, theme tokens
│   │
│   ├── assets/                    # Static image assets (auth_banner, hero)
│   │
│   ├── components/
│   │   ├── allocation/
│   │   │   └── AllocationPage.jsx # Asset allocation breakdown view
│   │   ├── common/
│   │   │   ├── Card.jsx           # Reusable card container
│   │   │   ├── CookieConsent.jsx  # GDPR cookie consent banner
│   │   │   ├── ErrorBoundary.jsx  # React error boundary
│   │   │   ├── FirebaseConfigGuard.jsx # Env var validation UI
│   │   │   ├── InstallAppButton.jsx    # PWA install prompt trigger
│   │   │   ├── Logo.jsx           # Brand logo component
│   │   │   ├── PrivacyDrawer.jsx  # Full-screen privacy/terms drawer
│   │   │   ├── ResetModal.jsx     # Confirm-before-reset modal
│   │   │   ├── RouteGuardScreen.jsx    # Stage-lock guard screen
│   │   │   ├── SplashScreen.jsx   # Branded initial splash
│   │   │   ├── ThemeToggle.jsx    # Light/dark toggle button
│   │   │   └── Toast.jsx          # Global toast notification system
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx      # Main financial overview page
│   │   │   └── JourneyTimeline.jsx # Chronological event timeline
│   │   ├── docs/
│   │   │   ├── DocumentationModal.jsx
│   │   │   └── DocumentationPage.jsx  # In-app docs
│   │   ├── goals/
│   │   │   └── GoalsPage.jsx      # Goal targets and SIP tracking
│   │   ├── income/
│   │   │   └── IncomePage.jsx     # P1/P2 income configuration
│   │   ├── insights/
│   │   │   └── WealthInsightsPage.jsx # Multi-chart analytics center
│   │   ├── layout/
│   │   │   ├── FloatingNav.jsx    # Desktop floating sidebar navigation
│   │   │   ├── MobileNav.jsx      # Glassmorphic bottom navigation pill
│   │   │   ├── NotificationCenter.jsx # Notification dropdown panel
│   │   │   └── ProfileChip.jsx    # User avatar chip in header
│   │   ├── milestones/
│   │   │   └── MilestonePage.jsx  # User-created milestone log
│   │   ├── partner/
│   │   │   └── PartnerPage.jsx    # QR + ID partner connection center
│   │   ├── profile/
│   │   │   ├── ProfileEditModal.jsx
│   │   │   └── ProfilePage.jsx    # User profile view and edit
│   │   ├── settings/
│   │   │   └── SettingsPage.jsx   # Platform settings center
│   │   ├── simulation/
│   │   │   └── SimulationPage.jsx # SIP wealth projection sandbox
│   │   └── welcome/
│   │       ├── AuthPage.jsx       # Sign in / Sign up page
│   │       ├── CouplePlanningPage.jsx # Committed stage workspace
│   │       ├── FamilyPlanningPage.jsx # Family Dynasty workspace
│   │       ├── LandingPage.jsx    # Public landing / marketing page
│   │       ├── OnboardingSystem.jsx   # 3-step onboarding flow
│   │       └── WelcomeScreen.jsx  # Post-login welcome screen
│   │
│   ├── constants/
│   │   └── presets.js             # Investment presets + currency + region constants
│   │
│   ├── store/
│   │   └── useFinanceStore.js     # Zustand global store with persist middleware
│   │
│   ├── theme/
│   │   └── tokens.js              # Design token object (colors, radii, fonts, shadows)
│   │
│   └── utils/
│       ├── everbondId.js          # EverBond ID generation and validation
│       ├── finance.js             # Financial calculation engine (Excel-accurate)
│       ├── firebase.js            # Firebase init, auth providers, Firestore helpers
│       ├── insightsData.js        # Insights data generator for charts
│       └── milestones.js          # Milestone utility helpers
│
├── .env.example                   # Environment variable template
├── .gitignore
├── eslint.config.js
├── index.html                     # HTML entry point with PWA meta tags
├── package.json
├── vercel.json                    # Vercel SPA rewrite rules
└── vite.config.js                 # Vite config with manual chunk splitting
```

---

## 🚀 Installation Guide

### Prerequisites

- **Node.js** — v18 or higher recommended
- **npm** — v9 or higher (bundled with Node.js)
- A **Firebase project** with Authentication and Firestore enabled

### Steps

**1. Clone the Repository**

```bash
git clone https://github.com/arupdas0825/EverBond-Wealth.git
cd EverBond-Wealth
```

**2. Install Dependencies**

```bash
npm install
```

**3. Configure Environment Variables**

Copy the example file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Edit `.env` and populate all six required variables (see [Environment Variables](#-environment-variables) below).

**4. Start the Development Server**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

**5. Build for Production**

```bash
npm run build
```

Output is written to `dist/`. The build automatically splits vendor chunks (React, Framer Motion, Recharts) for optimized browser caching.

**6. Preview the Production Build**

```bash
npm run preview
```

---

## 🔥 Firebase Setup Guide

### 1. Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) and click **Add project**.
2. Name your project (e.g., `everbond-wealth`), disable Google Analytics if not needed, and click **Create project**.

### 2. Register a Web App

1. In the Firebase console, click the **Web** icon (`</>`) to add a web app.
2. Give it a nickname (e.g., `EverBond Web`) and click **Register app**.
3. Copy the `firebaseConfig` object — you will need these values for your `.env` file.

### 3. Enable Authentication Providers

Navigate to **Authentication → Sign-in method** and enable:

- **Email/Password** — Toggle to Enabled.
- **Google** — Toggle to Enabled, add a support email.
- **Apple** — Toggle to Enabled. Requires an Apple Developer account with the appropriate Service ID and Key configured.

### 4. Create a Firestore Database

1. Navigate to **Firestore Database → Create database**.
2. Choose **Start in production mode** (recommended) or test mode for development.
3. Select a Cloud Firestore location close to your users.
4. Click **Done**.

### 5. Configure Firestore Security Rules

Navigate to **Firestore Database → Rules** and replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection: read/write only by the authenticated owner
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **Publish** to deploy the rules.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` at the project root and populate all fields:

```env
# EverBond Wealth — Firebase Configuration
# All values are found in your Firebase project's Web App config.

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> **Important:** `VITE_FIREBASE_MEASUREMENT_ID` is optional (used for Analytics) but all other six variables are required. The `FirebaseConfigGuard` component will block the app from rendering and display a human-readable error if any required variable is missing, contains surrounding quotes, has leading/trailing whitespace, or is the literal string `undefined`.

**Never commit `.env` to version control.** It is listed in `.gitignore`. Only `.env.example` (with empty values) should be committed.

---

## 🔐 Authentication Documentation

Firebase Authentication is initialized in `src/utils/firebase.js`. The module exports:

| Export | Type | Description |
|---|---|---|
| `auth` | `Auth` | Firebase Auth instance |
| `db` | `Firestore` | Firestore database instance |
| `googleProvider` | `GoogleAuthProvider` | Configured Google OAuth provider |
| `appleProvider` | `OAuthProvider` | Configured Apple OAuth provider |
| `initError` | `object \| null` | Non-null if Firebase failed to initialize |
| `createUserDocument()` | `async function` | Creates or retrieves a user's Firestore document |
| `deleteUserAccountAndData()` | `async function` | Permanently deletes Firestore doc + Auth record |

### Auth Flow

```
User visits app
       │
       ▼
onAuthStateChanged fires
       │
       ├── No user → LandingPage / AuthPage
       │
       └── User found
               │
               ├── onboardingCompleted: false → OnboardingSystem
               │
               └── onboardingCompleted: true → Dashboard
```

### createUserDocument()

Called immediately after any successful sign-in (email, Google, Apple). It:
1. Attempts to read the existing Firestore document for the `user.uid`.
2. If it exists, returns the existing data (no overwrite).
3. If it does not exist, creates a new document with the schema below.

### deleteUserAccountAndData()

Called from the Settings page account deletion flow. It:
1. Deletes the `users/{uid}` Firestore document.
2. Calls `deleteUser(auth.currentUser)` to remove the Firebase Auth record.
3. The caller is responsible for clearing local state afterwards.

---

## 🗄️ Firestore Documentation

### Collection: `users`

Every registered user has a single document at `users/{uid}`.

| Field | Type | Description |
|---|---|---|
| `uid` | `string` | Firebase Auth UID (document key) |
| `ebId` | `string` | EverBond Personal ID (e.g., `EB-A7K92X`) |
| `fullName` | `string` | User's display name |
| `email` | `string` | Email address |
| `authProvider` | `string` | `"password"`, `"google.com"`, or `"apple.com"` |
| `mode` | `string` | Journey mode selected during onboarding |
| `country` | `string` | Country selected during onboarding |
| `currency` | `string` | Currency code (e.g., `"INR"`) |
| `age` | `string` | Age entered during onboarding |
| `onboardingCompleted` | `boolean` | `false` until Step 3 of onboarding is completed |
| `createdAt` | `string` | ISO 8601 timestamp of account creation |

### Example Document

```json
{
  "uid": "abc123xyz",
  "ebId": "EB-K7M3PQ",
  "fullName": "Arup Das",
  "email": "arup@example.com",
  "authProvider": "google.com",
  "mode": "Committed",
  "country": "India",
  "currency": "INR",
  "age": "23",
  "onboardingCompleted": true,
  "createdAt": "2026-06-12T10:32:00.000Z"
}
```

> **Note:** All ongoing financial data (income, goals, milestones, partner connection state) is stored in the browser's `localStorage` via Zustand's `persist` middleware under the key `eb_v6`. The Firestore document currently serves as the identity and authentication record only.

---

## 🗃️ State Management

EverBond Wealth uses **Zustand 5** with the `persist` middleware.

- **Store file:** `src/store/useFinanceStore.js`
- **Persistence key:** `eb_v6` (localStorage)

### Key State Slices

| Slice | Fields |
|---|---|
| Auth | `isAuthenticated`, `user`, `userId`, `everBondId` |
| Life Stage | `stage`, `relationshipStatus`, `relationshipId`, `familyId` |
| Partner | `partnerId`, `connectionStatus`, `requestSentAt`, `incomingRequest` |
| Income | `p1Salary`, `p2Salary` |
| Settings | `mode` (investment preset), `currency`, `region`, `theme` |
| Goals | `goalTargets` (child, retirement, house, vacation) |
| Simulation | `simYears`, `simReturn` |
| Notifications | `notifications[]` |
| Timeline | `timelineEvents[]` |
| Milestones | `milestones[]` |
| Insights | `historicalNetWorth`, `incomeHistory`, `wealthForecast`, `savingsRate` |
| Onboarding | `onboardingSingle`, `onboardingCommitted`, `onboardingMarried` |

### Key Actions

| Action | Effect |
|---|---|
| `setStage(stage)` | Upgrades life stage, generates IDs, dispatches notification + timeline event |
| `setMindset(mindset)` | Updates investment preset, re-syncs insights data |
| `setTheme(theme)` | Updates theme, dispatches system notification + timeline event |
| `syncInsightsData()` | Regenerates all chart data from current state |
| `addNotification(payload)` | Prepends notification with auto-generated ID and timestamp |
| `addTimelineEvent(payload)` | Appends a journey timeline event |
| `initEverBondId()` | Generates and stores a new Personal EverBond ID if none exists |
| `reset()` | Clears all state back to defaults |

---

## 🧮 Financial Calculation Engine

Located in `src/utils/finance.js`. All formulas mirror the source `Investment_Planner.xlsx` exactly.

### calculateFinancialSnapshot(totalSalary, mode)

Computes the full financial breakdown for a given monthly salary and investment mode. Returns:

```
budget:           { needs, emergency, investments }
investmentSplit:  { equity, debt, commodities, crypto }
equityBreakdown:  { largeCap, midCap, smallCap }
debtBreakdown:    { liquid, shortTMF, targetMat }
commoditiesBreakdown: { gold, silver }
goalSplit:        { child, retirement, house, vacation }
blendedReturn:    weighted average return across all asset classes
```

### calculateHealthScore(snapshot)

Returns `{ value: 0-100, label: string, tips: string[] }`. Scoring criteria:

- Savings rate ≥ 40%: 30 pts / ≥ 30%: 22 pts / ≥ 20%: 14 pts / else: 5 pts
- Emergency ≥ 10%: 20 pts / ≥ 6%: 12 pts / else: 4 pts
- Portfolio diversified (Equity + Debt + Commodities): +20 pts
- Crypto ≤ 2%: 20 pts / ≤ 5%: 12 pts / ≤ 10%: 6 pts / > 10%: −5 pts
- Consistency bonus: 10 pts

### simulateGrowth(monthlyAmount, years, annualReturnPct, inflationAdjusted)

SIP future value projection formula:
```
FV = PMT × [((1 + r)^n − 1) / r] × (1 + r)
```
Where `r = monthly real return rate` and `n = total months`. Returns `{ fv, dataPoints[] }`.

### calculateGoalTimeline(monthlyContrib, targetAmount, annualReturnPct)

Computes months needed to reach a target corpus via SIP:
```
n = log(1 + (target × r) / (PMT × (1 + r))) / log(1 + r)
```

### formatCurrency(amount, currencyCode) / formatCompact(amount, currencyCode)

Currency-aware formatting using `Intl.NumberFormat` with locale support for all 8 currencies. Compact format displays ₹1,00,00,000 as `₹1.00Cr`, ₹1,00,000 as `₹1.00L`.

### Supported Currencies

| Code | Symbol | Region |
|---|---|---|
| INR | ₹ | India |
| USD | $ | United States |
| EUR | € | European Union |
| GBP | £ | United Kingdom |
| CHF | Fr | Switzerland |
| CAD | C$ | Canada |
| SGD | S$ | Singapore |
| AED | د.إ | UAE |

---

## 🆔 EverBond ID System

Every user receives a **Personal EverBond ID** on account creation. IDs are generated by `src/utils/everbondId.js`.

### ID Format

| ID Type | Format | Example |
|---|---|---|
| Personal ID | `EB-[A-Z0-9]{6}` | `EB-K7M3PQ` |
| Relationship ID | `REL-[YEAR]-[3-digit]` | `REL-2026-741` |
| Family ID | `FAM-[YEAR]-[3-digit]` | `FAM-2026-382` |

### Utility Functions

```javascript
generatePersonalId()       // → "EB-K7M3PQ"
generateRelationshipId()   // → "REL-2026-741"
generateFamilyId()         // → "FAM-2026-382"
isValidEverBondId(id)      // → true/false
formatEverBondId(raw)      // normalizes input to uppercase, no spaces
```

The Personal ID is the key used in the Partner Connection Center for manual ID-based pairing. It is also embedded in the generated QR code payload for camera-based scanning.

---

## 📱 PWA & Offline Support

EverBond Wealth is a fully installable Progressive Web App.

### Service Worker (`public/sw.js`)

Uses a **Stale-While-Revalidate** caching strategy:

1. On install: pre-caches core assets (`/`, `/index.html`, `/offline.html`, logo, manifest, all PWA icons).
2. On activate: purges old cache versions.
3. On fetch (navigation): serves network response and caches it; falls back to cached version, then `/offline.html` if fully offline.
4. On fetch (assets): serves from cache immediately, updates cache in background.

### Web App Manifest (`public/manifest.json`)

- `display: "standalone"` — installs as a native-feeling app.
- `orientation: "portrait"` — locks to portrait on mobile.
- `theme_color: "#B8902A"` — gold brand color in the browser chrome.
- Full icon set: 192×192, 512×512, maskable 192×192, maskable 512×512.

### PWA Install Prompt

The `InstallAppButton` component captures the native `beforeinstallprompt` event and surfaces a branded "Install EverBond" button when the platform signals the app is installable.

### iOS / iPadOS Support

- `apple-mobile-web-app-capable: "yes"` — enables standalone mode on iOS.
- `apple-mobile-web-app-status-bar-style: "black-translucent"` — full-bleed display.
- `apple-touch-icon` linked to `/icons/icon-192x192.png`.

---

## 🚢 Deployment Guide

### Deploying to Vercel (Recommended)

**1. Push to GitHub**

```bash
git add .
git commit -m "Initial deploy"
git push origin main
```

**2. Connect to Vercel**

1. Go to [https://vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Vercel will auto-detect Vite. Leave build settings as default.

**3. Configure Environment Variables**

In the Vercel project dashboard, go to **Settings → Environment Variables** and add all six Firebase keys from your `.env` file. Apply them to **Production**, **Preview**, and **Development** environments.

**4. Deploy**

Click **Deploy**. Vercel handles the build and routes all requests to `index.html` via the rewrite rule in `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This is required for client-side routing — without it, direct URL access and browser refresh will return 404.

### Build Output Chunks

The Vite config splits vendor libraries into separate cached chunks:

| Chunk | Libraries | Purpose |
|---|---|---|
| `vendor-react` | `react`, `react-dom` | Core React — rarely changes |
| `vendor-motion` | `framer-motion` | Animation library |
| `vendor-charts` | `recharts`, `d3-*` | Charting libraries |
| `index` | Application code | Changes on every deploy |

This means returning users only re-download the `index` chunk on updates — vendor libraries are served from browser cache.

---

## 🔒 Security Practices

### Environment Variable Protection

- All Firebase credentials are accessed via `import.meta.env.VITE_*` — never hardcoded.
- `.env` is listed in `.gitignore`. Only `.env.example` (with empty values) is committed.
- The `firebase.js` module validates all required variables on startup and sanitizes values for common mistakes (surrounding quotes, leading/trailing whitespace, literal `"undefined"` strings).

### Firebase Security Rules

Firestore rules enforce that users can only read and write their own document (`request.auth.uid == userId`). No user can access another user's data.

### Authentication Guards

- Client-side routing is protected by an `OnboardingGuard` component that checks Firebase auth state before rendering any dashboard page.
- All dashboard pages are blocked from unauthenticated access.
- Stage-specific pages (Couple Planning, Family Dynasty) are guarded by `RouteGuardScreen`, preventing lower-stage users from accessing higher-stage workspaces.

### API Key Rotation

If a Firebase API key is exposed:

1. Go to **Google Cloud Console → APIs & Services → Credentials**.
2. Delete the existing API key and create a new one.
3. Update the key in Vercel's Environment Variables.
4. Trigger a new Vercel deployment.

Firebase API keys are client-facing by design and are restricted by Firebase Security Rules and authorized domains — they are not secret keys and do not grant privileged access on their own.

### Account Deletion

The `deleteUserAccountAndData()` function performs a two-step irreversible deletion: first the Firestore document, then the Firebase Auth record. Local `localStorage` state is cleared separately by the calling component via `reset()`.

---

## 🗺️ Future Roadmap

### Phase 1 — Real-Time Partner Sync (Next Priority)

The current partner connection system manages state locally. The immediate next milestone is elevating it to real, persistent, cross-device synchronization:

- [ ] Write connection requests to Firestore (`partnerRequests` collection).
- [ ] Firestore `onSnapshot` listener for live incoming request detection.
- [ ] Accept / Reject flow updating both users' documents atomically.
- [ ] Shared workspace document (`sharedWorkspaces/{relationshipId}`) for synced financial data.
- [ ] Real-time partner data mirroring via Firestore listeners.

### Phase 2 — Cloud Data Persistence

- [ ] Migrate all Zustand-persisted state to Firestore for cross-device access.
- [ ] Incremental sync on income, goal, and milestone updates.
- [ ] Conflict resolution strategy for concurrent edits.

### Phase 3 — Wealth Analytics

- [ ] AI-generated financial health insights and improvement suggestions.
- [ ] Tax efficiency scoring based on asset allocation.
- [ ] Inflation-adjusted net worth projection with configurable inflation rates.
- [ ] Benchmark comparisons (peer age-group wealth percentiles).

### Phase 4 — Notifications & Reminders

- [ ] Web Push Notifications for milestone anniversaries and goal deadlines.
- [ ] Scheduled SIP reminders.
- [ ] Partner activity alerts (goal updated, milestone added).

### Phase 5 — Secure Vault

- [ ] Encrypted private record storage for documents and notes.
- [ ] Firestore Security Rules with field-level encryption.

### Phase 6 — Family Dynasty Tools

- [ ] Multi-child fund planning with individual corpus targets.
- [ ] Estate planning worksheet.
- [ ] Joint account simulation with contribution-ratio sliders.

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome.

### Getting Started

1. **Fork** the repository.
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/EverBond-Wealth.git`
3. **Install** dependencies: `npm install`
4. **Create a branch**: `git checkout -b feature/your-feature-name`
5. **Configure Firebase**: copy `.env.example` to `.env` and fill in your own Firebase project credentials.
6. **Make your changes** and test locally.
7. **Commit**: `git commit -m "feat: describe your change"`
8. **Push**: `git push origin feature/your-feature-name`
9. **Open a Pull Request** against the `main` branch.

### Code Style

- Plain JSX — no TypeScript.
- CSS custom properties for all theming — no Tailwind, no CSS-in-JS.
- Design tokens from `src/theme/tokens.js` for all color and spacing values.
- Zustand store actions for all state mutations — no direct `set()` calls from components.
- `React.lazy()` + `Suspense` for all new page-level components.

### Reporting Issues

Please use the [GitHub Issues](https://github.com/arupdas0825/EverBond-Wealth/issues) tracker. Include:
- Browser and OS version.
- Steps to reproduce.
- Expected vs. actual behavior.
- Console error output if applicable.

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Arup Das

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

<div align="center">

<picture>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=B8902A,C9A84C,1A1714&height=120&section=footer&animation=fadeIn" width="100%" alt="Footer"/>
</picture>

**Built with ♥ by [Arup Das](https://github.com/arupdas0825)**

*EverBond Wealth — Build Wealth Through Every Stage of Life*

</div>

<div align="center">

<br />

<picture>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=B8902A,C9A84C,1A1714&height=200&section=header&text=EverBond%20Wealth&fontSize=52&fontColor=FDFCF9&fontAlignY=38&desc=Premium%20Couple%20Financial%20Planning%20Platform&descAlignY=60&descColor=C9A84C&animation=fadeIn" width="100%" alt="EverBond Wealth Banner"/>
</picture>

<br /><br />

<!-- STATUS BADGES -->
<p>
  <img src="https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/everbond-wealth/deploy.yml?branch=main&label=CI%2FCD%20Pipeline&logo=github-actions&logoColor=white&style=flat-square&color=4E9B78" alt="CI/CD" />
  &nbsp;
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
  &nbsp;
  <img src="https://img.shields.io/badge/Version-2.0.0-B8902A?style=flat-square" alt="v2.0.0" />
  &nbsp;
  <img src="https://img.shields.io/badge/Status-Active-4E9B78?style=flat-square" alt="Active" />
</p>

<!-- TECH BADGES -->
<p>
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  &nbsp;
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 5" />
  &nbsp;
  <img src="https://img.shields.io/badge/Zustand-4.5-FF6B35?style=flat-square" alt="Zustand" />
  &nbsp;
  <img src="https://img.shields.io/badge/Recharts-2.12-22B5BF?style=flat-square" alt="Recharts" />
  &nbsp;
  <img src="https://img.shields.io/badge/License-MIT-C9A84C?style=flat-square" alt="MIT" />
  &nbsp;
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
</p>

<br />

> *"A beautiful digital space where couples build their future, dreams, and wealth — together."*

<br />

**[🌐 Live Demo](https://everbond-wealth.vercel.app)** &nbsp;·&nbsp; **[🐛 Report Bug](https://github.com/YOUR_USERNAME/everbond-wealth/issues)** &nbsp;·&nbsp; **[💡 Request Feature](https://github.com/YOUR_USERNAME/everbond-wealth/discussions)**

<br />

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Financial Logic](#-financial-logic--excel-brain)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [Deployment](#️-deployment)
- [CI/CD Setup](#️-cicd-pipeline-setup)
- [Project Structure](#-project-structure)
- [Privacy](#-privacy)
- [Contributing](#-contributing)

---

## 🌟 Overview

**EverBond Wealth** is a premium, fully responsive financial planning platform purpose-built for modern couples. It transforms a professional Excel investment planner into a cinematic, emotionally engaging web experience — without losing a single decimal of financial precision.

The platform is architected around a strict separation of concerns:

```
Excel Brain  (presets.js  +  finance.js)
                     │
        ┌────────────┴────────────┐
  Financial Engine          State Layer
  (formulas, SIP, FV)       (Zustand + localStorage)
        └────────────┬────────────┘
                     │
          Currency Display Layer
          (Intl.NumberFormat · 8 currencies)
                     │
              UI Components
              (React · Recharts)
```

Every calculation is a mathematically faithful JavaScript translation of `Investment_Planner.xlsx`. The Excel file **is** the brain. The UI is just how it breathes.

---

## 📸 Screenshots

> *ASCII representations — actual UI is fully rendered with charts, glassmorphism, and premium typography.*

<details>
<summary><b>🖥️ Desktop — Dashboard</b></summary>

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  💑 EverBond  │  Good Morning ☀️  Arup & Shatarupa  ·  Balanced Mode       ║
╠═══════════════╬══════════════════════════════════════════════════════════════╣
║  ◉ Dashboard  ║  ┌───────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐ ║
║  💰 Income    ║  │ 💰        │  │ 📈        │  │ 🛡️        │  │ ⚡        │ ║
║  📊 Allocation║  │ ₹1,00,000 │  │ ₹35,000   │  │ ₹10,000  │  │ 82/100   │ ║
║  🎯 Goals     ║  │ Combined  │  │ 35% rate  │  │ Safety   │  │ Strong   │ ║
║  🚀 Simulate  ║  └───────────┘  └───────────┘  └──────────┘  └──────────┘ ║
║               ║                                                              ║
║  ──────────── ║  ┌─────────────────────────┐  ┌──────────────────────────┐ ║
║  💑 Arup ❤   ║  │  🍩 Budget Allocation   │  │  📊 Asset Portfolio      │ ║
║    Shatarupa  ║  │  [PIE CHART]            │  │  [HORIZONTAL BAR CHART]  │ ║
║  ↺ Reset      ║  │  Essentials · Emergency │  │  Equity · Debt · Comm.   │ ║
╚═══════════════╩══════════════════════════════════════════════════════════════╝
```
</details>

<details>
<summary><b>🖥️ Desktop — Allocation Page (all 6 Excel sections)</b></summary>

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  Investment Allocation                                                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ┌──────────────────────────┐  ┌────────────────────────────────────────┐   ║
║  │ Full Portfolio Donut     │  │ Goal Funding Bar Chart                 │   ║
║  │ [9-slice donut chart]    │  │ 🎓 Child · 🌅 Retire · 🏡 Home · ✈️   │   ║
║  └──────────────────────────┘  └────────────────────────────────────────┘   ║
║                                                                               ║
║  Section 1 · Budget Split        Section 2 · Investment Split                ║
║  Essentials    55%  ₹55,000      Equity        60%   ₹21,000                ║
║  Emergency     10%  ₹10,000      Debt          30%   ₹10,500                ║
║  Investments   35%  ₹35,000      Commodities    8%    ₹2,800                ║
║                                  Crypto          2%      ₹700                ║
║  Section 3 · Equity              Section 4 · Debt                            ║
║  Large Cap  60%  ₹12,600         Liquid         30%   ₹3,150                ║
║  Mid Cap    30%   ₹6,300         Short TMF      45%   ₹4,725                ║
║  Small Cap  10%   ₹2,100         Target Mat.    25%   ₹2,625                ║
║                                                                               ║
║  Section 5 · Commodities         Section 6 · Goal Funding                    ║
║  Gold    80%  ₹2,240             🎓 Child Edu.  ₹10,526                     ║
║  Silver  20%    ₹560             🌅 Retirement  ₹10,526                     ║
║                                  🏡 Home        ₹3,947                      ║
║                                  ✈️  Vacation    ₹10,000                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```
</details>

<details>
<summary><b>🖥️ Desktop — Simulation Page</b></summary>

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  Future Simulation                                                            ║
║  FV = PMT × [((1+r)ⁿ − 1) / r] × (1+r)                                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Horizon   [1yr] [5yr] [●10yr] [20yr] [30yr]    Blended: 10.9%              ║
║  Return    ──────────────●──────────────  12.0%                              ║
║  Inflation [OFF ○──]                                                          ║
║                                                                               ║
║  ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐               ║
║  │🏦 ₹2.36Cr │  │ ₹42.0L  │  │ ₹1.94Cr │  │   5.61×    │               ║
║  │Final Corpus│  │Contributed│  │Net Gains │  │ Multiplier  │               ║
║  └────────────┘  └──────────┘  └──────────┘  └─────────────┘               ║
║                                                                               ║
║  Growth Trajectory — Shared Wealth Compounding Curve                         ║
║  ₹2.4Cr ┤                                                    ╭──╮           ║
║  ₹1.8Cr ┤                                              ╭─────╯  │           ║
║  ₹1.2Cr ┤                                       ╭──────╯        │           ║
║  ₹0.6Cr ┤                             ╭─────────╯               │           ║
║  ₹42.0L ┤ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ╯  (invested)              │           ║
║         └──────────────────────────────────────────────────────              ║
║          Now  Yr1  Yr2  Yr3  Yr4  Yr5  Yr6  Yr7  Yr8  Yr9  Yr10            ║
╚══════════════════════════════════════════════════════════════════════════════╝
```
</details>

<details>
<summary><b>📱 Mobile — Apple Glassmorphism Bottom Nav</b></summary>

```
┌─────────────────────────┐
│  Good Morning ☀️        │
│  Arup & Shatarupa       │  ← Personalized greeting
│  Balanced Mode          │
│                         │
│ ┌──────────┬──────────┐ │
│ │ 💰 ₹1L  │ 📈 ₹35K  │ │  ← Stat cards
│ ├──────────┼──────────┤ │
│ │ 🛡️ ₹10K │ ⚡ 82/100 │ │
│ └──────────┴──────────┘ │
│                         │
│  ╭─ Budget Allocation ─╮│
│  │     [🍩 DONUT]      ││  ← Recharts PieChart
│  ╰─────────────────────╯│
│                         │
│  Monthly Snapshot       │
│  ────────────────────   │
│  Essentials   ₹55,000   │
│  Emergency    ₹10,000   │
│  Investments  ₹35,000   │
│  Equity       ₹21,000   │
│  Debt         ₹10,500   │
│                         │
│  ╔═══════════════════╗  │
│  ║ ◉  💰  📊  🎯  🚀║  │  ← Glassmorphism Pill
│  ╚═══════════════════╝  │     backdrop-filter: blur(24px)
└─────────────────────────┘     border-radius: 28px
```
</details>

---

## ✨ Features

### 💎 Platform Highlights

| Feature | Detail |
|---|---|
| 🧠 **Excel Brain** | `Investment_Planner.xlsx` is the single source of truth |
| 💑 **Couple-First Engine** | Dual salary inputs — combined monthly corpus |
| 📊 **6-Section Allocation** | All Excel sections faithfully reproduced |
| 📱 **Apple-style Mobile Nav** | Glassmorphism pill · `blur(24px)` · iOS-native feel |
| 🔒 **Zero Auth / Zero Cloud** | 100% localStorage · no backend ever |
| 🌍 **8 Currencies** | INR · USD · EUR · GBP · CHF · CAD · SGD · AED |
| 📡 **Live FX Rates** | Real-time rates via Open Exchange Rates |
| ⚡ **Financial Health Score** | 0–100 scored across 4 dimensions |
| 🚀 **SIP Simulation** | 1–30 year projections with inflation adjustment |
| 🎯 **Goal Planner** | 1Y / 5Y / 10Y corpus at goal-specific return rates |

---

## 🧮 Financial Logic — Excel Brain

### Allocation Chain (Balanced, ₹1,00,000 salary)

```
₹1,00,000 Salary
    │
    ├─ Essentials   (×0.55) ─→  ₹55,000
    ├─ Emergency    (×0.10) ─→  ₹10,000
    └─ Investments  (×0.35) ─→  ₹35,000
            │
            ├─ Equity       (×0.60) ─→  ₹21,000
            │     ├─ Large Cap  (×0.60) ─→  ₹12,600
            │     ├─ Mid Cap    (×0.30) ─→   ₹6,300
            │     └─ Small Cap  (×0.10) ─→   ₹2,100
            │
            ├─ Debt         (×0.30) ─→  ₹10,500
            │     ├─ Liquid      (×0.30) ─→  ₹3,150
            │     ├─ Short TMF   (×0.45) ─→  ₹4,725
            │     └─ Target Mat. (×0.25) ─→  ₹2,625
            │
            ├─ Commodities  (×0.08) ─→   ₹2,800
            │     ├─ Gold        (×0.80) ─→  ₹2,240
            │     └─ Silver      (×0.20) ─→    ₹560
            │
            └─ Crypto       (×0.02) ─→     ₹700
```

### SIP Formula (exact Excel translation)

```javascript
// Excel =FV(rate/12, months, -pmt, 0, 1)
// Code:
function simulateGrowth(monthlyAmount, years, annualReturnPct) {
  const r = annualReturnPct / 100 / 12;
  const n = years * 12;
  return monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}
```

### Preset Modes (from Excel `Presets` sheet)

| Mode | Needs | Emergency | Invest | Equity | Debt | Comm. | Crypto |
|---|---|---|---|---|---|---|---|
| **Conservative** | 60% | 10% | 30% | 40% | 50% | 8% | 2% |
| **Balanced** | 55% | 10% | 35% | 60% | 30% | 8% | 2% |
| **Aggressive** | 50% | 10% | 40% | 70% | 20% | 8% | 2% |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| UI Framework | React 18 | Component tree, rendering |
| Build Tool | Vite 5 | HMR, code splitting, bundling |
| State | Zustand 4.5 | Global state + localStorage persist |
| Charts | Recharts 2.12 | AreaChart, PieChart, BarChart |
| Styling | Pure CSS (custom system) | No Tailwind, full control |
| Fonts | Cormorant Garamond + DM Sans | Premium display + body |
| Hosting | Vercel Edge | Global CDN, instant deploys |
| CI/CD | GitHub Actions | Automated quality gate + deploy |
| FX Data | Open Exchange Rates | Live currency benchmarks |

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/everbond-wealth.git
cd everbond-wealth

# Install
npm install

# Dev server
npm run dev
# → http://localhost:5173

# Production build
npm run build
npm run preview
```

---

## 🖥️ Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

Add `vercel.json` to project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## ⚙️ CI/CD Pipeline Setup

### What the pipeline does

```
Push to main
      │
      ▼
┌─────────────┐     ┌──────────────────┐
│ Quality Gate │────▶│  Deploy to Vercel│
│ npm install  │     │  npx vercel --prod│
│ npm run build│     └──────────────────┘
└─────────────┘
```

### Setup (3 steps)

**Step 1** — Get Vercel Token from [vercel.com/account/tokens](https://vercel.com/account/tokens)

**Step 2** — Add to GitHub: **Settings → Secrets → Actions → New secret**

| Secret | Value |
|---|---|
| `VERCEL_TOKEN` | Your Vercel token |

**Step 3** — Push to `main`. Check the **Actions** tab for live logs.

> Personal Vercel accounts do not require `VERCEL_ORG_ID` or `VERCEL_PROJECT_ID`.

---

## 📁 Project Structure

```
everbond-wealth/
├── .github/workflows/deploy.yml   ← CI/CD pipeline
├── src/
│   ├── constants/presets.js       ← ⭐ Excel Presets (source of truth)
│   ├── utils/finance.js           ← ⭐ SIP formula engine
│   ├── store/useFinanceStore.js   ← Zustand + persist
│   ├── theme/tokens.js            ← Design tokens
│   ├── index.css                  ← Full design system (638 lines)
│   ├── App.jsx                    ← Root layout
│   └── components/
│       ├── welcome/               ← Onboarding screen
│       ├── layout/                ← Sidebar + mobile nav
│       ├── dashboard/             ← Overview + health score
│       ├── income/                ← Salary + mode + FX
│       ├── allocation/            ← All 6 Excel sections
│       ├── goals/                 ← Goal planner + projections
│       └── simulation/            ← SIP wealth curve
├── index.html                     ← PWA + viewport-fit=cover
├── vercel.json
├── vite.config.js
└── package.json
```

---

## 🔒 Privacy

```
No backend   · No database   · No accounts   · No tracking
All data → browser localStorage only
Clear browser data = complete wipe
```

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
# make changes
git commit -m "feat: your feature"
git push origin feature/your-feature
# open pull request
```

---

## 📄 License

MIT © 2025 EverBond Wealth

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=B8902A,C9A84C,1A1714&height=100&section=footer&animation=fadeIn" width="100%" />

<br />

**Built with 💑 for couples who build their future together.**

<sub>EverBond Wealth · Powered by Excel Intelligence · Deployed on Vercel Edge</sub>

</div>

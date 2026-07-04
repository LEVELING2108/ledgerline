# Ledgerline — AI-Powered Personal Finance Manager

Next.js (App Router) + Tailwind CSS + Recharts. Light and dark mode on every screen.

## Setup

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — this lands on Onboarding/Upload. After a
simulated import, "Go to dashboard" takes you to the rest of the app.

## Structure

```
app/
  page.jsx              Onboarding / Upload (root)
  dashboard/page.jsx     Dashboard (home)
  transactions/page.jsx  Transactions list
  trends/page.jsx        Trends & Forecast
  alerts/page.jsx        Alerts
  chat/page.jsx          Chat (full view)
  settings/page.jsx      Settings
components/
  MetricCard.jsx
  AlertBanner.jsx
  CategoryChart.jsx
  ChatPanel.jsx
  TransactionRow.jsx
  NavBar.jsx
  ThemeProvider.jsx      light/dark context, persists to localStorage
  ThemeToggle.jsx
lib/
  mockData.js            sample transactions, alerts, trend, chat history
```

## Design system

Tokens live in `tailwind.config.js` as named colors (`teal`, `coral`,
`purple`, `ink`, `muted`, `hairline`, `cream`, `surface`) with a `-dark`
counterpart for each, switched via Tailwind's `darkMode: "class"` strategy —
every utility in the app is paired with a `dark:` variant rather than
relying on `prefers-color-scheme` alone, so the toggle in the nav bar is
authoritative.

Type scale is also tokenized (`text-page-title`, `text-section-heading`,
`text-body`, `text-metric`, `text-caption`) at 22 / 15 / 14 / 24 / 13px, all
at Regular or Medium weight — no bold/black weight exists anywhere in the
config, by design.

**Signature detail:** metric cards carry a small hairline sparkline next to
the number instead of a chart — it supports the figure without competing
with it, in keeping with the "numbers first, chart second" principle.

Color is reserved for meaning: teal for primary/positive, coral for
warnings/anomalies, purple as a secondary category accent — never used
decoratively. Every color-coded element (category dots, tags) ships with a
text label alongside it.

## Notes on data

`lib/mockData.js` holds placeholder data so every screen renders
meaningfully without a backend. Swap in real API calls at the same shape
and the UI needs no changes.

# SENTINEL — UI Polish & UX Refinement (Phase 14)

This document details the frontend visual polish, micro-animations, keyboard navigation systems, and accessibility enhancements inspired by modern fintech leaders like Uniswap and Bloomberg Terminal.

---

## 1. Uniswap-Inspired Design Architecture

* **Glassmorphism & Surface Depth:**
  - Standardized `.glass-panel` surfaces (`rgba(18, 20, 26, 0.75)` with `16px` backdrop blur).
  - Subtle borders: `border-white/5` to `border-white/10` with interactive hover state `hover:border-white/20`.
  - Radiant accents: Emerald (`#10b981`), Rose (`#f43f5e`), Indigo (`#6366f1`), Cyan (`#06b6d4`), and Amber (`#f59e0b`).
  - Consistent border radii (`rounded-2xl` and `rounded-3xl`).
* **Micro-Animations & Motion Design:**
  - **Interactive Scale:** `.card-interactive` with `hover:translate-y-[-2px]` and `active:scale-[0.99]`.
  - **Shimmer Loading:** Custom CSS `@keyframes shimmer` on skeleton loaders for fluid async state transitions.
  - **Live Heartbeats:** Pulsing radar indicators for active SSE telemetry streams.
  - **Smooth Transitions:** Transitions tuned with `cubic-bezier(0.16, 1, 0.3, 1)` easing.

---

## 2. Global Keyboard Navigation & Hotkeys

Integrated globally into [`frontend/src/layouts/AppLayout.tsx`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/frontend/src/layouts/AppLayout.tsx):

| Shortcut | Action | Destination |
| :--- | :--- | :--- |
| **`1`** | Navigate to Dashboard Overview | `/` |
| **`2`** | Navigate to Markets & Screening | `/markets` |
| **`3`** | Navigate to Portfolio Analytics | `/portfolio` |
| **`4`** | Navigate to Active Holdings | `/positions` |
| **`5`** | Navigate to AI Agent Command Center | `/agent` |
| **`6`** | Navigate to Decision Waterfall & Feed | `/activity` |
| **`7`** | Navigate to Deterministic Risk Engine | `/risk` |
| **`8`** | Navigate to Trade History & Audit Ledger | `/trades` |
| **`/`** | Focus Global Search Input | Header Search |
| **`?`** or **`Shift + /`** | Toggle Keyboard Shortcuts Help Dialog | Modal |
| **`Escape`** | Dismiss Active Modal, Drawer, or Dialog | — |

---

## 3. Resilience: Backend Health Alert Banner

Implemented in [`frontend/src/components/BackendHealthBanner.tsx`](file:///c:/Users/BusinessComputers.in/Pictures/New%20folder%20(2)/frontend/src/components/BackendHealthBanner.tsx):
* Continuously probes `GET /api/health` in the background.
* If the backend server is offline or disconnected, renders a non-intrusive banner informing the user to launch `npm run dev` in `backend/` and provides a one-click **"Retry Connection"** action.
* Automatically dismisses once healthy connection is re-established.

---

## 4. Accessibility & Mobile Responsiveness

* **Accessibility:**
  - High-contrast visual pairings meeting WCAG AA standards.
  - Added `.focus-ring` utility with visible dual-ring focus styling (`box-shadow: 0 0 0 2px #0A0B0E, 0 0 0 4px #6366F1`).
  - Added explicit `aria-label` attributes to icon-only buttons.
* **Responsive Layouts:**
  - **Mobile ($375\text{px}$):** Sticky bottom glass navigation bar, collapsible hamburger menu, stacked cards.
  - **Tablet ($768\text{px}$):** 2-column balanced layouts.
  - **Desktop ($1280\text{px}+$):** Multi-column institutional financial command center.

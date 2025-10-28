# Mobile Optimization Plan

This document consolidates the mobile-first strategy for the budget application, including Phase 1 (implemented) and Phase 2 (in progress), and outlines Phase 3.

Status legend:
- ✅ Completed
- 🔄 In progress
- ⏳ Planned

---

## Phase 1 — Mobile Foundation (✅)

Objective: Ship immediately visible mobile UX value with minimal disruption.

Deliverables:
- Bottom navigation bar
  - File: client/src/components/navigation/BottomNavigationBar.js
  - Responsive via matchMedia listener; shows on ≤768px
- Floating Action Button (FAB)
  - File: client/src/components/ui/FloatingActionButton.js
  - Quick “Add” action with expandable secondary actions
- Basic gesture navigation (Deferred ⏸️)
  - File: client/src/hooks/useSwipeNavigation.js
  - Status: Not used in ModernLayout; page-level gestures deferred to a future native app
- Touch utilities and mobile styles
  - File: client/src/styles/touch.css
  - 48px touch targets, FAB and bottom-nav styles, small-screen glassmorphism reduction
- Integration into active layout
  - File: client/src/components/layout/ModernLayout.js
  - Renders BottomNavigationBar and FAB; enables swipe hook
- Sidebar behavior at mobile breakpoint
  - File: client/src/styles/design-system.css
  - Hides fixed sidebar; main-content becomes full width under 768px

Validation:
- Resize to ≤768px: bottom-nav and FAB appear; sidebar hides
- Desktop unaffected

---

## Phase 2 — Interactions & Progressive Disclosure (🔄)

Objective: Improve mobile usability by revealing details on demand and optimizing touch interactions and performance.

New components/hooks (implemented):
- Progressive disclosure
  - ExpandableCard: client/src/components/ui/ExpandableCard.js (Phase 1)
  - BudgetAccordion: client/src/components/ui/BudgetAccordion.js (persisted expand state)
- Touch-native lists (Deferred ⏸️ for web)
  - SwipeableCard: client/src/components/ui/SwipeableCard.js
  - PullToRefresh: client/src/components/ui/PullToRefresh.js
  - Rationale: Adds complexity and performance cost; better suited for native app
- Lazy loading and visual feedback
  - useLazyLoad: client/src/hooks/useLazyLoad.js (IntersectionObserver)
  - Skeletons: client/src/components/ui/Skeletons.js (KPI/Chart/Table skeletons)

Integration (initial):
- Budget page
  - File: client/src/pages/Budget.js
  - Added lazy-load refs for heavy charts with SkeletonChart fallback
  - Prepared BudgetAccordion-based “Manage Budgets” with SwipeableCard row interactions
  - Note: The original “Manage Budgets” inputs remain; Accordion path is added alongside to avoid breaking current flows

Next integration targets:
- Expenses page (keep explicit buttons for edit/delete; no swipe)
- Dashboard (wrap heavy charts/sections with useLazyLoad and SkeletonChart)

Acceptance criteria:
- Sections collapse by default on mobile; expand state persisted per section
- Expense/budget lists support swipe actions with clear affordances
- Pull-to-refresh reloads data at top with subtle feedback, no layout jump
- Charts mount only when visible; scrolling remains smooth

---

## Phase 3 — Performance & Polish (⏳)

Objective: Optimize load/render on mobile and refine accessibility.

Planned work:
- Code splitting and deferred imports by route and major components
- Chart interaction improvements
  - Larger legend touch targets (≥48px)
  - Tap-to-toggle series; optional pinch-to-zoom with fallbacks to preset zoom (1m/3m/6m)
  - Targeted files: client/src/components/charts/* and client/src/components/charts/chartUtils.js
- Accessibility and reduced motion
  - Respect prefers-reduced-motion across animations
  - ARIA labels and keyboard access for new components (FAB, bottom-nav, accordions)
- Offline and network optimizations (optional)
  - Service Worker for static caching and background sync
  - Asset optimization (WebP, responsive images), CDN for static assets where applicable

Success metrics:
- Perceived load time on mobile networks improved (skeletons + lazy load)
- Reduced main bundle size via splitting and deferred mounting
- Mobile engagement with native-feeling interactions while keeping desktop parity

---

## Files Overview

- Layout & Navigation
  - client/src/components/layout/ModernLayout.js
  - client/src/components/navigation/BottomNavigationBar.js
  - client/src/components/ui/FloatingActionButton.js
  - client/src/hooks/useSwipeNavigation.js (deferred)
- Interactions & Disclosure
  - client/src/components/ui/ExpandableCard.js
  - client/src/components/ui/BudgetAccordion.js
  - client/src/components/ui/SwipeableCard.js (deferred)
  - client/src/components/ui/PullToRefresh.js (deferred)
- Performance & Feedback
  - client/src/hooks/useLazyLoad.js
  - client/src/components/ui/Skeletons.js
  - client/src/styles/touch.css
  - client/src/styles/design-system.css (mobile breakpoint behavior)
- Initial Integration
  - client/src/pages/Budget.js (lazy charts; accordion pathway)

---

## Roadmap Checklist

Phase 1 — Foundation (Complete)
- [x] Bottom nav + FAB
- [x] Mobile sidebar behavior and content width reset
- [x] Touch CSS utilities

Phase 2 — Interactions & Progressive Disclosure (Simplified)
- [x] Add core components/hooks (Accordion, useLazyLoad, Skeletons)
- [x] Integrate on Budget page (lazy charts)
- [x] Ensure Expenses uses simple explicit buttons and remains performant
- [ ] Clean up unused gesture code (delete or archive SwipeableCard, PullToRefresh, useSwipeNavigation)
- [ ] Integrate on Dashboard (lazy-load heavy sections, skeletons) — partial

Phase 3 — Performance & Polish (Planned)
- [ ] Code splitting by route and heavy components
- [ ] Chart interaction: touch-friendly legends, zoom presets
- [ ] Accessibility & reduced-motion pass
- [ ] Optional offline and network performance enhancements

---

## Notes

- Routes referenced in mobile UI: '/', '/expenses', '/budget', '/settings', '/add'
- If route names differ, update BottomNavigationBar accordingly
- FAB secondary actions use placeholder targets (?mode=scan, ?mode=voice)—adjust implementation to match feature availability
- Budget page currently keeps the original “Manage Budgets” UI; the new Accordion path is additive to avoid regressions. We can replace the legacy inputs after validation.

# PR: Dual‑Ledger Design System Transition (Design‑Only)

- Type: UI/Design refresh
- Scope: CSS tokens, classes, and JSX className usage only
- Functionality: No new features, logic, data, or routing changes
- References: `.horizondesign/mockup-a-dual-ledger.html`, `.horizondesign/mockup-a-dual-ledger.md`

## Summary
This PR transitions the app’s visuals to the Dual‑Ledger system:
- Solid surfaces and soft shadows (remove glassmorphism & gradients for UI surfaces)
- Clear Mine • Ours • Partner scope tabs (segmented control look)
- 5‑item bottom navigation with accessible active/selected states
- Calm, high‑contrast ledger style for cards, lists, banners

## Rationale
Aligns UI with the approved Dual‑Ledger mockup for a trustworthy, banking‑app feel without changing any functionality.

## Changes Overview
- Design tokens: add new mockup‑aligned tokens while preserving old ones for compatibility
- Components restyled to use `--surface` + `--shadow` instead of glass backgrounds
- Introduce missing utility classes seen in mockup (feed, list rows, badges, banners, FAB)
- Keep all logic and routes unchanged

## File‑by‑File Plan

### 1) `client/src/styles/design-system.css`

Add tokens (do not remove old yet):
```css
:root {
  /* Dual‑Ledger core tokens */
  --bg: #f5f7fb;
  --surface: #ffffff;
  --ink: #0b1320;
  --muted: #596174;
  --primary: #2A5CFF;
  --success: #2EAF5E;
  --warn: #FFB020;
  --danger: #E5484D;
  --card-radius: 12px;
  --shadow: 0 8px 24px rgba(16,24,40,0.08);
}
```

Transition surfaces away from glassmorphism:
```css
/* Cards */
.card, .stat-card {
  background: var(--surface);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow);
  border: none; /* replaces translucent borders */
  backdrop-filter: none; /* remove blurs */
}
```

Header + segmented control (visual only):
```css
.header { position: sticky; top: 0; background: var(--surface); box-shadow: var(--shadow); }
.topbar { display:flex; align-items:center; gap:12px; padding:12px 16px; }
.segmented { display:flex; background:#e8ecf9; border-radius:999px; padding:4px; gap:4px; }
.segmented button { border:0; background:transparent; padding:8px 12px; border-radius:999px; color:var(--muted); font-weight:600; }
.segmented button[aria-pressed="true"], .segmented button[aria-selected="true"] { background:var(--surface); color:var(--ink); box-shadow:0 1px 2px rgba(0,0,0,.08); }
```

KPI + progress bar:
```css
.kpi .label { color: var(--muted); font-size: 12px; }
.kpi .value { font-variant-numeric: tabular-nums; font-size: 20px; font-weight: 700; }
.bar { height: 8px; border-radius: 6px; background: #eef1f8; overflow: hidden; }
.bar > i { display: block; height: 100%; background: var(--primary); width: 60%; }
```

Feed, badges, transactions list, states:
```css
.feed { display:flex; flex-direction:column; gap:12px; margin-top:12px; }
.feed-item { display:flex; gap:12px; }
.badge { padding:2px 8px; border-radius:999px; font-size:12px; font-weight:600; }
.b-ours { background:#e9efff; color:#2143c5; }
.b-mine { background:#e8f7ee; color:#176f3d; }
.b-partner { background:#fff1e6; color:#8a4b0f; }

.list { display:flex; flex-direction:column; gap:8px; }
.row { display:flex; justify-content:space-between; align-items:center; background:var(--surface); border-radius:10px; box-shadow:var(--shadow); padding:10px 12px; }
.row .left { display:flex; align-items:center; gap:10px; }
.icon { width:32px; height:32px; border-radius:8px; background:#eef2ff; display:grid; place-items:center; color:#3949ab; font-weight:700; }
.amount { font-variant-numeric: tabular-nums; font-weight:700; }
.state { font-size:12px; }
.state.success { color: var(--success); }
.state.warn { color: var(--warn); }
.state.danger { color: var(--danger); }
```

Bottom navigation: keep structure, change visuals to solid surface:
```css
.bn-inner { background: var(--surface); border: none; backdrop-filter: none; box-shadow: 0 -8px 24px rgba(16,24,40,.08); }
.bn-item { color: var(--muted); font-size: 12px; }
.bn-active { color: var(--primary); font-weight: 700; background: transparent; }
```

Banners and FAB:
```css
.banner { padding:10px; border-radius:10px; }
.banner.info { background:#eef4ff; color:#1b3fb3; }
.banner.error { background:#ffecec; color:#b32323; }
.banner.success { background:#e9f9ee; color:#136432; }

.fab { position:fixed; inset:auto 16px 84px auto; width:56px; height:56px; border-radius:50%; background:var(--primary); color:#fff; display:grid; place-items:center; font-size:26px; box-shadow:0 10px 30px rgba(42,92,255,.4); }
```

Responsive/two‑col (tablet+):
```css
@media (min-width: 768px) {
  .app { max-width: 840px; margin: 0 auto; }
  .two-col { display:grid; grid-template-columns:320px 1fr; gap:16px; }
}
```

Accessibility defaults:
```css
body { color: var(--ink); background: var(--bg); }
```

---

### 2) `client/src/components/navigation/BottomNavigationBar.js`
- Keep logic intact.
- Ensure active state remains via existing `bn-active` class.
- Optional: add `aria-current` handling is already provided by `NavLink`; retain `aria-label`.
- No routing/structure changes.

Minimal class adjustments if needed to align with solid surface styles (no behavior changes):
```jsx
<nav role="navigation" aria-label="Primary" className="bn-container">
  <div className="bn-inner"> {/* solid surface now */}
    {/* existing items */}
  </div>
</nav>
```

---

### 3) `client/src/components/layout/ModernLayout.js`
- No logic changes. Ensure wrapper classes allow header/topbar styles and bottom padding for nav clearance.
- Keep `Navbar` and `FloatingActionButton` placements.

---

### 4) `client/src/components/ModernEnhancedDashboard.js`
- No data/logic changes. Existing `.card` wrappers will adopt new surface style.
- If KPI cards are in `KPISummaryCards`, ensure items use `.kpi .label`/`.kpi .value` class names or add selectors in CSS to style existing markup safely without refactor.

## Accessibility
- Contrast: ≥ 4.5:1 for body text, 3:1 for large numerals
- Touch targets: ≥ 44×44; maintain bottom safe area padding
- ARIA: segmented control uses `aria-pressed`/`aria-selected` as presentational state; bottom nav uses `aria-current`

## Testing Plan
- Visual regression on Dashboard, Budget, Transactions, Settings
- Dark backgrounds/glass removed: verify shadows, borders, contrast
- Keyboard focus outlines unaffected; screen reader announces selected states

## Performance
- Remove backdrop blurs to reduce paint cost
- Use single, soft shadows

## Rollout
- Phase 1: Tokens + cards + bottom nav
- Phase 2: KPI typography + banners + lists/badges
- Phase 3: Tablet two‑col patterns

## Risks & Mitigations
- Token conflicts with legacy styles → Keep old tokens, migrate progressively
- Component using glass classes → Provide safe fallback styles via selectors

## Checklist
- [ ] No new functionality (logic, data, or routes)
- [ ] Tokens added; surfaces solid; blurs removed
- [ ] Bottom nav matches solid surface style
- [ ] KPI, lists, badges styled per mockup
- [ ] Accessibility verified (contrast, ARIA, touch targets)
- [ ] Screenshots updated

## How to Review
1. Inspect UI on mobile and tablet widths
2. Compare to `.horizondesign/mockup-a-dual-ledger.html`
3. Confirm no behavior or data changes

## Follow‑ups (Out‑of‑Scope)
- Any new flows (approvals, proposals, etc.) remain unchanged
- Insights chart palette harmonization if needed (future task)

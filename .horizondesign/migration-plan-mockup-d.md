# Migration Plan — Convert current CSS to Mockup D (Neon Dark Solid)

Objective:
Refactor the existing design system and app styles to the Mockup D visual language: solid dark surfaces, neon accents (electric cyan + soft lime), high-contrast typography, no glassmorphism, touch-first, and accessible.

Scope:
- Update tokens and base theme (colors, typography, radii, shadows) in client/src/styles/design-system.css and client/src/index.css.
- Remove or quarantine glassmorphism and pastel gradients across styles.
- Introduce a new dark theme layer and opt-in class that progressively styles pages/components.
- Create utilities for scope chips, neon buttons, cards, ribbons, banners, list rows, bottom nav, FAB, sheets.
- Apply minimal JSX class updates where needed (separate step-by-step PRs).

Phased Execution (4 PRs):

PR1 — Foundation Tokens and Theme Hookup (global, safe, reversible)
1) Add a new layer and root variables for the Mockup D theme without breaking current theme.
   - Create a :root.dark-neon token set (prefixed with --d-*) based on Mockup D.
   - Implement a .theme-dark-neon class on html that maps base variables to d-variables via a cascade block, enabling instant theme switching.
2) Disable glassmorphism by default, keep optional utility class .is-glass for legacy contexts.
3) Provide color-scheme: dark to leverage OS defaults and improve form controls.

Deliverables:
- Dark-neon tokens, mapping layer, and a top-level “theme switch class”.
- No component-specific CSS replaced yet; risk is minimal.

PR2 — Core Components and Layout Surfaces
1) Cards: solid surfaces (no blur), neon borders at low opacity, updated radii/shadows.
2) Buttons: primary (neon cyan gradient solid), secondary (lime gradient), ghost (border neon).
3) Segmented scope chips (Mine/Ours/Partner) and state chips (success/warn/error).
4) Bottom navigation and FAB styles that match Mockup D.
5) Banners for info/error/success and approval actions.

Deliverables:
- New component classes with token usage.
- Progressive override via .theme-dark-neon namespace to avoid regressions.

PR3 — Budget & Analytics Screens
1) Replace current budget-enhancements.css styles with dark-neon equivalents (or new file).
2) Charts: ensure container bg is solid dark; axes/labels follow high-contrast theme.
3) Tables/lists: dark rows, neon dividers, hover/active states, zebra optional.

Deliverables:
- Updated selectors for Budget.js, Dashboard.js, and chart wrappers.
- Theme-aware states (empty/loading/error/overspent/under).

PR4 — Interaction and Motion Polish
1) Microinteractions: focus/hover lift, magnetic action buttons, success toasts.
2) Offline/pending badges with icons + color desaturation.
3) Reduced motion and high-contrast support auditing.
4) Documentation + migration checklist for any remaining components.

Deliverables:
- Utility classes and motion rules.
- Accessibility verification notes.

Design Tokens (Mockup D)
Add these tokens; do not remove existing yet.

:root (append)
- --d-bg: #0b0f1a
- --d-panel: #0f1524
- --d-card: #121a2b
- --d-ink: #e9eefc
- --d-muted: #9aa7c8
- --d-primary: #7cf4ff
- --d-secondary: #a5ff9b
- --d-danger: #ff6b6b
- --d-warn: #ffd166
- --d-border: rgba(124, 244, 255, 0.18)
- --d-shadow: 0 16px 48px rgba(0,0,0,.45)
- --d-radius-sm: 10px
- --d-radius-md: 14px
- --d-radius-lg: 16px
- --d-radius-xl: 20px

Theme application (mapping)
.theme-dark-neon {
  color-scheme: dark;
  --bg-gradient: var(--d-bg);
  --bg-primary: var(--d-panel);
  --bg-secondary: var(--d-card);
  --bg-card: var(--d-card);
  --color-text-primary: var(--d-ink);
  --color-text-secondary: var(--d-muted);
  --border-color: var(--d-border);
  --shadow-lg: var(--d-shadow);
  --border-radius-sm: var(--d-radius-sm);
  --border-radius-md: var(--d-radius-md);
  --border-radius-lg: var(--d-radius-lg);
  --border-radius-xl: var(--d-radius-xl);
  --color-primary: var(--d-primary);
  --color-success: var(--d-secondary);
  --color-warning: var(--d-warn);
  --color-error: var(--d-danger);
}

Component Class Additions (new utilities)
- .neon-card: solid dark card with subtle neon border/shadow
- .neon-kpi: ribbon style for KPIs
- .neon-btn, .neon-btn--secondary, .neon-btn--ghost
- .neon-chip, .neon-chip--mine, .neon-chip--partner, .neon-chip--ours
- .neon-banner.info|success|error
- .neon-fab
- .neon-bottom-nav
- .neon-segment (scope tabs)
- .neon-sheet (bottom composer)

Refactor Rules
- Replace glass/blur usages in design-system.css and budget-enhancements.css with solid surfaces under .theme-dark-neon.
- Keep legacy tokens intact; only remap when .theme-dark-neon is present.
- Introduce CSS variables for gradients to avoid inline hard-coding.
- Ensure min 4.5:1 contrast for body text; avoid color-only semantics.

File-by-File Changes

1) client/src/styles/design-system.css
- Append dark-neon tokens to :root (no breaking change).
- Add mapping under .theme-dark-neon.
- Add component classes (neon-card, neon-btn, etc.) in a new section “Mockup D Components”.
- Wrap glassmorphism sections with .legacy-glass class or add .theme-dark-neon .glassmorphism-card { display:none } where safe.
- Make body background follow --bg-gradient (already set), which will switch under the theme mapping.

2) client/src/index.css
- Add a top-level helper: .theme-dark-neon on html/body for scoping.
- Create a small utility layer: @layer utilities { .text-neon {...}, .border-neon {...} }
- Ensure chart-container background uses var(--bg-card) to adopt dark theme.

3) client/src/styles/budget-enhancements.css
- Create a parallel block .theme-dark-neon { … } overriding:
  - .dashboard-content background to var(--d-bg)
  - .dashboard-header and .glass-card to solid dark (remove blur)
  - Buttons to neon variants
  - Enhanced-tabs to use neon segments
  - Lists/cards/tables to dark variants
- Do not delete old rules; add themed overrides.

4) New helper file (optional, if preferred)
- client/src/styles/mockup-d-theme.css for clarity, then import it after design-system.css.

Adoption Strategy
- Step 1: Add html className="theme-dark-neon" in ModernLayout.js gated behind a feature flag (e.g., localStorage.getItem('theme') === 'dark-neon').
- Step 2: Validate critical screens (Login, Dashboard, Budget, Expenses). Fix any missing contrasts.
- Step 3: Expand to all screens. Remove remaining glass-only rules once parity confirmed.

Accessibility & Performance
- Use color-scheme: dark; and prefers-reduced-motion blocks.
- Replace heavy shadows/filters with precomputed shadows; avoid blur filters entirely for perf.
- Ensure component focus states are neon-outline with 2px outline-offset.
- Test contrast with WCAG tool; adjust muted text to #b7c3e6 if needed.

QA Checklist
- [ ] All text readable on dark surfaces (≥4.5:1)
- [ ] Buttons/links keyboard focus visible
- [ ] Charts adopt dark axes/labels
- [ ] Empty/loading/error states visible and distinct
- [ ] No glass blur remains under .theme-dark-neon
- [ ] iOS/Android touch targets ≥44px
- [ ] Reduced motion honored

Code Snippets (to add)

A) Theme variable mapping (design-system.css)
.theme-dark-neon { /* mapping block as above */ }

B) Cards & Buttons
.neon-card { background: var(--bg-card); border:1px solid var(--border-color); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-lg); }
.neon-btn { background: linear-gradient(180deg,var(--color-primary), #59dae6); color:#002833; border:0; border-radius:14px; padding:12px 16px; font-weight:800; }
.neon-btn--secondary { background: linear-gradient(180deg, var(--color-success), #68e771); color:#003a1e; }
.neon-btn--ghost { background: transparent; border:1px solid var(--border-color); color: var(--color-text-primary); }

C) Scope chips
.neon-segment { display:flex; gap:6px; }
.neon-segment .seg { border:1px solid var(--border-color); background:transparent; color:var(--color-text-secondary); padding:6px 10px; border-radius:999px; font-weight:700; }
.neon-segment .seg.is-active { background: rgba(124,244,255,.12); color: var(--color-text-primary); box-shadow: inset 0 6px 18px rgba(124,244,255,.18); }

D) Banners
.neon-banner.info { background:#0f1f3e; color:#7cf4ff; border:1px solid rgba(124,244,255,.25); border-radius:12px; padding:10px; }
.neon-banner.error { background:#2a1216; color:#ffb0b0; border:1px solid rgba(255,107,107,.45); }
.neon-banner.success { background:#0f2a1a; color:#a5ff9b; border:1px solid rgba(165,255,155,.35); }

Rollout Timeline
- Day 1: PR1 merge (tokens + theme switch).
- Day 2: PR2 merge (core components).
- Day 3–4: PR3 merge (Budget/Dashboard + charts).
- Day 5: PR4 polish + docs; remove lingering glass dependencies.

Acceptance Criteria
- Enabling .theme-dark-neon visually matches Mockup D for Dashboard, Budget, and Transactions.
- No visual regressions when theme class is absent.
- All interactive states visible in dark mode.
- Performance equal or better (no blur filters).

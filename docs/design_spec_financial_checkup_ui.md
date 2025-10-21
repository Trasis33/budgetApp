# Financial Check-up UI Design Specification

This document captures the visual and interaction standards established for the "Your Financial Check-up" experience. Use these guidelines when designing new components or refining existing ones to ensure stylistic cohesion across the product.

## 1. Design Principles
- **Conversational & Supportive** – copy should feel like a helpful coach. Lead with wins before surfacing opportunities.
- **Data-rich, never overwhelming** – every insight has a visual that makes the data immediately understandable.
- **Action-oriented** – each card provides clear next steps (see transactions, adjust budget, snooze, not helpful).
- **Calming confidence** – rounded shapes, soft gradients, and gentle shadows keep the UI inviting even when delivering tough news.

## 2. Layout & Spacing
- **Canvas**: cards live on a white background with generous 32–40px padding from container edges.
- **Sections**: headline banner (accent gradient) → cards grid (1 column mobile, 2 columns ≥ 768px). Use 24px gaps vertically, 20–24px between cards.
- **Card padding**: 24px on desktop, 20px on mobile. Cards have 24px corner radius and 8–12px soft shadow (`0 12px 30px rgba(15, 23, 42, 0.06)`).

## 3. Typography
- **Headline**: `font-weight: 600`, `font-size: 24–32px`, `color: #0f172a`.
- **Section subtitle**: `font-size: 14px`, `color: #64748b`.
- **Card title**: `font-weight: 600`, `font-size: 18px`, `color: #0f172a`.
- **Body copy**: `font-size: 14px`, `line-height: 1.6`, `color: #475569`.
- **Meta labels (badges, captions)**: uppercase, `letter-spacing: 0.08em`, `font-size: 12px`, `color: #64748b`.

## 4. Color Palette
- **Base**: white background, `#f8fafc` section dividers.
- **Text**: primary `#0f172a`, secondary `#475569`, quiet `#94a3b8`.
- **Status accents**:
  - Wins / savings: emerald (`#10b981` fill, `#ecfdf5` background).
  - Alerts / reductions: rose (`#fb7185` icon, `#fee2e2` → `#ffe4e6` gradient) with blue trend line default.
  - Reallocation: indigo (`#6366f1` line, `#eef2ff` background).
  - Seasonal: amber (`#f59e0b` line, `#fef3c7` background).
  - Goal cards: emerald background with deeper accent for progress bar.
- **Confidence badge**: emerald >= 80%, amber 60–79, slate < 60. Badge background uses the lightest tint, border is one step darker.

### 4.1 Accent Palette System
Use the shared accent ramp whenever you need multiple cards or chips to feel related but distinct (goals, dashboards, modals, etc.). Colors are assigned by index so the experience stays predictable—when a card surfaces first (pinned or primary), it receives the emerald tone.

| Index | Token | Surface / Border | Progress / Accent | Buttons & Pills | Notes |
| --- | --- | --- | --- | --- | --- |
| 0 | `emerald` | `bg-emerald-50/80` / `border-emerald-200` | `bg-emerald-500` | `border-emerald-200 text-emerald-600 hover:border-emerald-300` | Default mint for pinned/top goal |
| 1 | `teal` | `bg-teal-50/80` / `border-teal-200` | `bg-teal-500` | `border-teal-200 text-teal-600 hover:border-teal-300` | Soothing seafoam |
| 2 | `sky` | `bg-sky-50/80` / `border-sky-200` | `bg-sky-500` | `border-sky-200 text-sky-600 hover:border-sky-300` | Light airy blue |
| 3 | `indigo` | `bg-indigo-50/80` / `border-indigo-200` | `bg-indigo-500` | `border-indigo-200 text-indigo-600 hover:border-indigo-300` | Reallocation accent |
| 4 | `violet` | `bg-violet-50/80` / `border-violet-200` | `bg-violet-500` | `border-violet-200 text-violet-600 hover:border-violet-300` | Rich secondary accent |
| 5 | `amber` | `bg-amber-50/80` / `border-amber-200` | `bg-amber-500` | `border-amber-200 text-amber-600 hover:border-amber-300` | Warm highlight |
| 6 | `rose` | `bg-rose-50/80` / `border-rose-200` | `bg-rose-500` | `border-rose-200 text-rose-600 hover:border-rose-300` | Soft warning |
| 7 | `slate` | `bg-slate-50/80` / `border-slate-200` | `bg-slate-500` | `border-slate-200 text-slate-600 hover:border-slate-300` | Neutral fallback |

Implementation guidance:
- Load palette via `getGoalColorScheme(index)` in `client/src/utils/goalColorPalette.js`.
- Use `assignGoalColors(collection)` whenever a sorted list of cards needs consistent colors; the helper works for goals, dashboard tiles, or future analytics stacks.
- Accent objects expose keys for `surface`, `border`, `ring`, `quickButton`, `primaryButton`, `progressTrack`, `progressBar`, `accent`, `heading`, and `body` to keep styling coherent.
- Apply the palette across the check-up experience (Savings cards, inline composer, dashboard chips, optimization tips) so multi-card layouts share the same visual language.


## 5. Iconography & Micro-visuals
- Use Lucide icons (via `lucide-react`) sized 20–24px. Pair icon color with the section accent for quick recognition.
- Mini charts (Recharts) use soft gridlines (`#e2e8f0`, dashed) and rounded stroke widths (2px).
- Area fills blend from 40% opacity accent to 5%.
- Progress bars: 2px radius, background `rgba(226,232,240,0.6)`, foreground accent color.

## 6. Section Banners
- Layout: 60px tall, 24px padding, gradient background per tip type, icon left, text stacked right.
- Gradient recipe: `linear-gradient(90deg, accentTint 0%, white 100%)` with 12% opacity border.
- Copy pattern: `{Icon} Opportunity headline` + subtitle describing the value proposition.

## 7. Card Anatomy
1. **Header row**: title & confidence badge.
2. **Body copy**: short paragraph, aim for two sentences max.
3. **Impact chip**: pill badge (`border-radius: 999px`) with emerald background.
4. **Visualization block**: 130px tall Rechart component with matching accent and caption label.
5. **Goal detail (goal-based only)**: mint panel showing target / saved / progress / months remaining.
6. **Actions row**: pills with ghost style.

### Action Pill Styling
- `border: 1px solid #cbd5f5` (default slate), `background: #ffffff`.
- Hover: lighten background and border (`#f8fafc`, `#cbd5f5`).
- Disabled: `#e2e8f0` background, `#94a3b8` text.

## 8. States & Feedback
- **Loading**: multi-step checklist animation in a frosted glass container.
- **Empty**: celebratory card (Lucide icon, positive headline, re-run CTA).
- **Error**: soft red border card explaining next steps.
- **Snooze / Not helpful**: show subtle confirmation toast (not yet implemented; leave space for future pattern).

## 9. Motion & Transitions
- Cards fade/slide in (`opacity 0 → 1`, `translateY 16px → 0`, 250ms ease).
- Buttons: 150ms background/ border transition.
- Loading dots: animate via CSS `animation: pulse 1.5s infinite` for active step indicator.

## 10. Content Guidance
- Headline statements should mention the category or goal explicitly.
- Impact chip copy patterns:
  - Reductions: `Potential impact: {amount}`
  - Goal adjustments: `Suggested monthly contribution: {amount}`
- Keep chart tooltips in currency; show month abbreviation.
- Use plain-language percentages (round to whole numbers unless nuance is needed).

## 11. Accessibility
- Ensure contrast ratio ≥ 4.5:1 for text on gradient backgrounds by adjusting opacity or switching to darker text.
- All buttons must have `aria-label` equivalents when icon-only.
- Charts should expose alt copy summarizing the trend (future enhancement: provide visually hidden summary text below chart).

## 12. Implementation Snippets
- **Card container**: `className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md hover:shadow-lg transition-shadow"`
- **Impact chip**: `className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600"`
- **Section banner**: `className="rounded-3xl bg-gradient-to-r from-{accent} to-white px-6 py-5 mb-5 border border-slate-100 flex items-center gap-3 shadow-sm"`

Keep this document updated as new interaction patterns emerge.

## 13. Mini-chart baseline (applies across features)

Scope: This is the baseline visual system for small in-card charts used anywhere in the product (Optimization Tips, Savings, Analytics dashboard tiles, and deep‑dive modals). The examples reference `BudgetOptimizationTips.js`, but the rules below are general.

This section documents the exact visual spec for the three mini-chart types used on Opportunity cards inside the Financial Check‑up. All charts are Recharts components wrapped in a 100% width ResponsiveContainer. Axes typography is small and quiet to keep the cards calm.

- Shared chart rules
  - Grid: CartesianGrid with dashed lines `strokeDasharray="3 3"` and soft tint.
  - XAxis: stroke `#94a3b8` (Slate 400), `fontSize: 11`.
  - YAxis: stroke `#94a3b8`, `fontSize: 11`, ticks formatted with compact currency (e.g., `formatCurrencyShort`).
  - Tooltip: custom panel with month label and currency value only. Styles: rounded 8px, white background, `border: 1px solid #e2e8f0`, shadow-sm, text-xs slate.
  - Heights: Reduction and Seasonal charts are 128px tall; Reallocation is 160px.
  - Container: rounded 16px, subtle border, light tinted background per type, small heading label in uppercase 12px.

- Reduction trend (LineChart)
  - Use for category over-spend/optimization suggestions.
  - Colors: line `#2563eb` (Blue 600), strokeWidth 2, no dots (`dot={false}`).
  - Grid: `stroke="#e2e8f0"` (Slate 200).
  - Heading label: "Recent trend" in slate.
  - Container style: `rounded-2xl border border-slate-100 bg-slate-50 p-3`.

- Seasonal pattern (AreaChart)
  - Use for categories with month‑over‑month seasonal lift.
  - Area gradient: top `#f97316` at 40% opacity → bottom at 5% opacity.
    - `stopColor="#f97316" stopOpacity={0.4}` at 0%.
    - `stopColor="#f97316" stopOpacity={0.05}` at 100%.
  - Stroke: `#f97316` (Orange 500), strokeWidth 2.
  - Grid: `stroke="#fcd34d"` (Amber 200).
  - Axes: `stroke="#f59e0b"` (Amber 500), font size 11.
  - Heading label: "Seasonal pattern" in amber.
  - Container style: `rounded-2xl border border-amber-100 bg-amber-50 p-3`.

- Reallocation comparison (BarChart)
  - Use for "move budget from A to B" recommendations.
  - Bars:
    - Budget: `fill="#a5b4fc"` (Indigo 300), `radius={[4,4,0,0]}`.
    - Spent: `fill="#4338ca"` (Indigo 700), `radius={[4,4,0,0]}`.
  - Grid: `stroke="#c7d2fe"` (Indigo 200).
  - Axes: `stroke="#6366f1"` (Indigo 500), font size 11.
  - Heading label: "Budget comparison" in indigo.
  - Container style: `rounded-2xl border border-indigo-100 bg-indigo-50 p-3`.

- Confidence badge and impact chip
  - Confidence badge appears in the header row, right side.
    - Calculation: `percent = Math.round(confidence_score * 100)`.
    - Tones: ≥ 80 emerald (success), 60–79 amber (caution), < 60 slate (neutral).
    - Style: pill with light background tint and one‑step darker border.
  - Impact chip (below description): emerald pill; copy varies by type
    - Reductions: "Potential impact: {amount}"
    - Goal‑based: "Suggested monthly contribution: {amount}"

- Analysis progress overlay
  - When analyzing, show a full‑card frosted overlay: `absolute inset-0 bg-white/90 backdrop-blur`.
  - Checklist with 5 steps, each rendered as a rounded row with status styles:
    - Completed: `bg-emerald-50 text-emerald-700 border border-emerald-100` with solid emerald dot.
    - Active: `bg-blue-50 text-blue-700 border border-blue-100` with animated blue dot.
    - Pending: `bg-slate-100 text-slate-500 border border-slate-200` with slate dot.

- Tip type accents (banner/header use)
  - Types map to icon + gradient surface tints:
    - reduction → Lightbulb, icon amber, gradient `from-rose-100 to-pink-50`.
    - reallocation → RefreshCcw, icon indigo, gradient `from-violet-100 to-indigo-50`.
    - seasonal → CalendarClock, icon amber, gradient `from-amber-100 to-yellow-50`.
    - goal_based → Target, icon emerald, gradient `from-emerald-100 to-green-50`.
    - general → Sparkles, icon sky, gradient `from-blue-100 to-sky-50`.
  - Apply Section Banner recipe in §6 with the corresponding gradient.

## 14. Card patterns & flows (general baseline)

Scope: These are the shared card patterns used across Savings, Budgets, Optimization, and Analytics tiles. The examples reference `Savings.js`, but treat them as the default card anatomy and interactions unless a screen has an explicit exception.

Guidance for the Savings page cards and interactions. These inherit the same calm, supportive language and accent system.

- Card foundations
  - Base card: `rounded-3xl border border-slate-100 bg-white p-6 shadow-md hover:shadow-lg`.
  - Section banner (Savings): `rounded-3xl bg-gradient-to-r from-emerald-100 via-white to-white px-6 py-5 border border-slate-100`, responsive stack on mobile.
  - Action pills: pill variant buttons; default ghost on white with subtle border, emerald variant for primary actions.

- Accent palette usage
  - Every Goal card uses `getGoalColorScheme(color_index)` (see §4.1 for tokens).
  - Apply returned classes to: surface, border, ring (when pinned), quick buttons, heading/body text, progress track/bar.
  - Pinned goal shows an accent ring; pin button toggles state with active/inactive styles from the scheme.

- GoalPanel anatomy
  1) Header: category label (uppercase, tracking), title, optional pin action.
  2) Body copy: "Saved {current} of {target}" in secondary tone.
  3) Progress: 2px radius bar, track uses scheme.progressTrack, bar uses scheme.progressBar with smooth width transition.
  4) Meta row: target date (CalendarDays) and remaining amount (Wallet).
  5) Quick actions: "Log Contribution" and "Edit Goal" as accent‑tinted pill buttons (`bg-white` + `scheme.quickButton`).
  6) Contribution composer (inline) appears below when opened; inherits accent scheme and enforces remaining cap.
  7) Remove goal link at the bottom right (text link in accent body tone).

- GoalForm variants
  - Panel layout: `rounded-2xl border p-5` using scheme.surface + scheme.border.
  - Inline layout: `rounded-2xl border px-5 py-5 shadow-sm bg-white` using scheme.border; pairs with quick buttons.
  - Context label: uppercase 12px with scheme.accent; submit/cancel buttons follow pill vs ghost per layout.

- SharedGoalsCard
  - Header with description and primary CTA "Add New Goal" as pill button: `border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50`.
  - List of GoalPanels below; empty state uses dashed emerald border over soft mint background.

- SavingsOpportunityCard
  - Amber accent focus: card uses base styles with `border-amber-100` and icon chip `bg-amber-100 text-amber-600`.
  - Copy pattern: headline + primary message; impact pill `bg-amber-100 text-amber-700` with "Potential impact: {amount}".
  - Actions: primary pill in amber outline, secondary ghost pill in slate.

- Savings Rate tooltip (charts)
  - Tooltip style: `rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm`.
  - Content: Month (short + year) in slate, value as percentage with one decimal.

- Loading & empty states
  - LoadingGrid: single wide card with `bg-white/60 backdrop-blur-sm`, three progress chips each `rounded-2xl border bg-white/80` and a pulsing emerald dot.
  - EmptyState: centered, circular emerald icon background, headline, supportive copy, and solid emerald primary button.

- Accessibility specifics
  - Maintain ≥ 4.5:1 contrast on text over gradient banners; prefer dark text on light mints.
  - All icon-only controls (pin, close) include `aria-label` and are focusable with visible focus ring from the scheme.
  - Progress bars include textual percent and target date descriptors adjacent to the visual bar.

- Micro-interactions
  - Progress bar width transitions `duration-500 ease-out` on updates.
  - Pills transition background/border within ~150ms; cards elevate on hover.

These additions align the Savings experience and Optimization Tips with the shared accent system, ensuring consistent tones, chart styles, and interaction patterns.

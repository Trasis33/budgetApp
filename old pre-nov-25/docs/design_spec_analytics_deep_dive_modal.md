# Analytics Deep Dive Modal - Design Implementation Spec

## Overview
This document outlines the redesign of `AnalyticsDeepDiveModal.js` to align with the Financial Check-up UI design specification (`docs/design_spec_financial_checkup_ui.md`). The modal provides detailed financial analytics across multiple views (Overview, Trends, Breakdown, Cash flow) with a calm, supportive, data-rich experience.

**Design mockup**: `.superdesign/design_iterations/analytics_deep_dive_modal_1.html`

---

## 1. Header Section

### Layout & Styling
- **Background**: Emerald gradient (`linear-gradient(135deg, #ecfdf5 0%, rgba(255, 255, 255, 0.8) 100%)`)
- **Border**: 1px solid `#e2e8f0`
- **Padding**: 32px on desktop, 24px on mobile
- **Structure**: Two-column flex layout (left: content, right: controls)

### Header Elements

#### Badge
- **Style**: Emerald pill with icon
- **Classes**: `bg-emerald-100/50 border border-emerald-200 text-emerald-600 rounded-full px-3 py-1`
- **Typography**: 11px, uppercase, letter-spacing 0.18em, font-weight 600
- **Icon**: Sparkles (Lucide)
- **Text**: "Financial check-up"

#### Title
- **Typography**: 32px, font-weight 600, color `#0f172a`
- **Text**: "Your financial story in detail"
- **Margin**: 12px below badge

#### Subtitle
- **Typography**: 14px, color `#64748b`, line-height 1.6
- **Max-width**: 600px
- **Text**: Conversational copy explaining the modal's purpose

#### Meta Pills
- **Layout**: Flex wrap, gap 12px
- **Style**: White background, 1px border `#cbd5e1`, rounded-full
- **Typography**: 12px, uppercase, letter-spacing 0.1em, font-weight 600
- **Content**: 
  - Scope label (e.g., "Shared view", "My view")
  - Time range label (e.g., "Last 6 months")
- **Icon**: Optional (chart, calendar icons)

#### Controls (Right side)
- **Time Range Select**:
  - Height: 44px
  - Padding: 0 16px
  - Border: 1px solid `#cbd5e1`, rounded-full
  - Font: 14px, font-weight 500
  - Background: white
  - Hover: border `#a1aec4`, background `#f8fafc`
  - Options: "Last 3 months", "Last 6 months", "Last 12 months"

- **Close Button**:
  - Size: 44x44px, rounded-full
  - Border: 1px solid `#cbd5e1`
  - Icon: X (Lucide, 20px)
  - Hover: background `#f1f5f9`, border `#a1aec4`
  - Aria-label: "Close deep dive"

---

## 2. Main Content Area

### Background & Padding
- **Background**: `#f8fafc`
- **Padding**: 32px 40px (desktop), 20px (mobile)
- **Overflow**: Scrollable (y-axis)
- **Bottom padding**: 112px (to accommodate sticky footer if needed)

---

## 3. Tabs System

### Tab List Container
- **Background**: White with 1px border `#cbd5e1`
- **Border-radius**: 999px (pill shape)
- **Padding**: 12px
- **Gap**: 12px
- **Width**: fit-content
- **Box-shadow**: `0 2px 4px rgba(15, 23, 42, 0.04)`
- **Margin-bottom**: 32px

### Tab Triggers
- **Padding**: 10px 16px
- **Border-radius**: 999px
- **Font**: 14px, font-weight 500
- **Gap**: 8px (icon + text)
- **States**:
  - **Default**: color `#64748b`, background transparent
  - **Hover**: background `#f1f5f9`, color `#334155`
  - **Active**: background `#ecfdf5`, color `#059669`
- **Transition**: 150ms ease
- **Icons**: Lucide icons (LineChart, TrendingUp, List, CircleDollarSign)

---

## 4. Overview Tab

### 4.1 Savings Rate Chart Card

#### Section Banner
- **Background**: Emerald gradient (`linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, white 100%)`)
- **Border**: 1px solid `rgba(16, 185, 129, 0.15)`
- **Border-radius**: 24px
- **Padding**: 24px
- **Layout**: Flex with icon + content
- **Gap**: 16px
- **Margin-bottom**: 24px

**Banner Icon**:
- Size: 40x40px, rounded-full
- Background: `rgba(16, 185, 129, 0.1)`
- Color: `#059669`
- Icon: Chart icon (Lucide)

**Banner Content**:
- **Headline**: 14px, font-weight 600, color `#0f172a`
- **Description**: 13px, color `#64748b`

#### Chart Container
- **Background**: `#f8fafc`
- **Border**: 1px solid `#e2e8f0`
- **Border-radius**: 20px
- **Padding**: 16px
- **Height**: 300px
- **Chart**: Recharts ComposedChart (dual-axis: savings rate % on left, amount saved $ on right)

**Chart Styling** (per §13 of design spec):
- **Grid**: Dashed, stroke `#e2e8f0`, strokeDasharray "4 6"
- **XAxis**: fontSize 11px, color `#94a3b8`, no axis line/ticks
- **YAxis**: fontSize 11px, color `#94a3b8`, no axis line/ticks
- **Bar** (Amount saved):
  - Fill: Gradient blue (`#0EA5E9` at 48% opacity to 5%)
  - Stroke: `#0EA5E9`, strokeWidth 1.5
  - Radius: [12, 12, 4, 4]
  - Max bar size: 36px
- **Line** (Savings rate):
  - Stroke: `#6366F1`, strokeWidth 3
  - Dot: radius 4, stroke `#a6bafc`, strokeWidth 2
  - Active dot: radius 6, fill `#6366F1`, stroke `#EEF2FF`
- **Tooltip**: Custom SavingsTooltip (rounded-2xl, border, white bg, shadow-xl)
- **Legend**: Bottom, circle icons

---

### 4.2 Period Summary & Highlights Grid

#### Grid Layout
- **Columns**: 1.6fr 1fr (desktop), 1fr (mobile)
- **Gap**: 24px
- **Margin-bottom**: 24px

#### Left Card: Period Summary

**Card Container**:
- Background: white
- Border: 1px solid `#e2e8f0`
- Border-radius: 24px
- Padding: 24px
- Box-shadow: `0 4px 12px rgba(15, 23, 42, 0.06)`

**Net Position Highlight Box**:
- Background: Emerald gradient (`linear-gradient(135deg, #f0fdf4 0%, rgba(16, 185, 129, 0.05) 100%)`)
- Border: 1px solid `rgba(16, 185, 129, 0.2)`
- Border-radius: 20px
- Padding: 20px
- Margin-bottom: 16px

**Highlight Content**:
- **Label**: 11px, uppercase, letter-spacing 0.14em, color `#059669`, margin-bottom 12px
- **Value**: 18px, font-weight 600, color `#0f172a`, margin-bottom 8px
- **Description**: 13px, color `#475569`, line-height 1.5
- **Icon**: ArrowUpRight (Lucide, 20px) in white circle

**Metrics Grid** (below highlight):
- **Layout**: 2 columns (auto-fit, minmax 200px)
- **Gap**: 16px
- **Margin-top**: 16px

**Metric Cards**:
- Background: Emerald tint (`bg-emerald-50/80`)
- Border: 1px solid `border-emerald-200`
- Border-radius: 16px
- Padding: 16px
- **Label**: 11px, uppercase, letter-spacing 0.12em, color `#64748b`
- **Value**: 20px, font-weight 600, color `#0f172a`
- **Description**: 12px, color `#64748b`

**Action Pills**:
- **Layout**: Flex wrap, gap 12px, margin-top 20px
- **Style**: Ghost (white bg, 1px border `#cbd5e1`, rounded-full)
- **Typography**: 13px, font-weight 500, color `#475569`
- **Hover**: background `#f1f5f9`, border `#a1aec4`
- **Primary variant**: background `#ecfdf5`, border `rgba(16, 185, 129, 0.3)`, color `#059669`
- **Primary hover**: background `#d1fae5`, border `rgba(16, 185, 129, 0.5)`

#### Right Card: Highlights

**Card Container**: Same as left

**Highlight Boxes** (3 total):
1. **Bright Spot** (best month):
   - Background: Sky gradient (`linear-gradient(135deg, #eff6ff 0%, rgba(59, 130, 246, 0.05) 100%)`)
   - Border: 1px solid `rgba(59, 130, 246, 0.2)`
   - Label color: `#1e40af`

2. **Tougher Month** (worst month):
   - Background: Rose gradient (`linear-gradient(135deg, #fef2f2 0%, rgba(220, 38, 38, 0.05) 100%)`)
   - Border: 1px solid `rgba(220, 38, 38, 0.2)`
   - Label color: `#991b1b`

3. **Top Category**:
   - Background: Slate gradient (`linear-gradient(135deg, #f8fafc 0%, rgba(15, 23, 42, 0.05) 100%)`)
   - Border: 1px solid `#e2e8f0`
   - Label color: `#64748b`

**Highlight Box Structure**:
- **Label**: 11px, uppercase, letter-spacing 0.14em, margin-bottom 12px
- **Value**: 18px, font-weight 600, color `#0f172a`, margin-bottom 8px
- **Description**: 13px, color `#475569`, line-height 1.5

---

### 4.3 Top Categories Card

**Card Container**: Standard (white, border, rounded-3xl, shadow)

**Chart Container**:
- **Type**: Pie chart (donut style)
- **Height**: 250px
- **Background**: `#f8fafc`
- **Border**: 1px solid `#e2e8f0`
- **Border-radius**: 20px
- **Padding**: 16px

**Pie Chart Styling**:
- **Inner radius**: 50px
- **Outer radius**: 90px
- **Padding angle**: 2px
- **Stroke**: white
- **Colors**: Use chartPalette array (8 colors)
- **Gradient fills**: Each category gets a gradient from 80% opacity to 25%
- **Tooltip**: Custom CategoryPieTooltip

**Category List** (below chart):
- **Layout**: Grid or flex column
- **Gap**: 8px
- **Margin-top**: 20px

**Category Row**:
- **Layout**: Flex between
- **Padding**: 12px 0
- **Border-bottom**: 1px solid `#e2e8f0`
- **Name**: 14px, font-weight 500, color `#0f172a`
- **Percent**: 14px, color `#64748b`
- **Progress bar**: 2px height, rounded-full, background `#e2e8f0`, fill with category color

---

## 5. Trends Tab

### Category Composition Chart

**Card Container**: Standard

**Chart Container**:
- **Type**: Stacked Area Chart
- **Height**: 420px
- **Background**: `#f8fafc`
- **Border**: 1px solid `#e2e8f0`
- **Border-radius**: 20px
- **Padding**: 16px

**Legend Pills** (above chart):
- **Layout**: Flex wrap, gap 8px
- **Style**: White bg, 1px border `#cbd5e1`, rounded-full
- **Typography**: 12px, font-weight 500, color `#475569`
- **Dot**: 8px circle with category color
- **Margin-bottom**: 16px

**Area Chart Styling**:
- **Grid**: Dashed, stroke `#e2e8f0`, strokeDasharray "4 6"
- **XAxis**: fontSize 11px, color `#94a3b8`
- **YAxis**: fontSize 11px, color `#94a3b8`, formatted as currency
- **Areas**: Gradient fills (40% opacity to 5%), stroke 2px
- **Colors**: Use chartPalette array
- **Tooltip**: Custom formatter (currency, category name)
- **Legend**: Top, circle icons

---

## 6. Breakdown Tab

### 6.1 Shared vs Personal Contributions Chart

**Card Container**: Standard

**Legend Pills**: Same as Trends tab
- Show: Shared, Mine, Partner with color dots

**Chart Container**:
- **Type**: Stacked Bar Chart (100% normalized)
- **Height**: 320px
- **Background**: `#f8fafc`
- **Border**: 1px solid `#e2e8f0`
- **Border-radius**: 20px
- **Padding**: 16px

**Bar Chart Styling**:
- **Grid**: Dashed, stroke `#e2e8f0`, strokeDasharray "4 6"
- **XAxis**: fontSize 11px, color `#94a3b8`
- **YAxis**: fontSize 11px, color `#94a3b8`, formatted as percentage
- **Bars**: 
  - Shared: `#0EA5E9`
  - Mine: `#6366F1`
  - Partner: `#10B981`
  - Radius: [12, 12, 0, 0]
  - Max bar size: 48px
- **Tooltip**: Custom ContributionTooltip
- **Legend**: Top, circle icons

---

### 6.2 Monthly Breakdown Table

**Card Container**: Standard

**Table Container**:
- **Border-radius**: 20px
- **Border**: 1px solid `#e2e8f0`
- **Background**: `#f8fafc`
- **Overflow**: Auto (horizontal & vertical)
- **Max-height**: 360px

**Table Styling**:
- **Font-size**: 13px
- **Border-collapse**: collapse

**Table Head**:
- **Background**: white
- **Border-bottom**: 1px solid `#e2e8f0`
- **Position**: sticky top 0
- **Padding**: 12px 16px
- **Typography**: 11px, uppercase, letter-spacing 0.08em, font-weight 600, color `#64748b`

**Table Body**:
- **Row padding**: 12px 16px
- **Border-bottom**: 1px solid `#e2e8f0`
- **Color**: `#475569`
- **Hover**: background `#f1f5f9`
- **Font-size**: 13px

**Cell Styling**:
- **Month**: font-weight 500, color `#0f172a`
- **Net (positive)**: color `#059669`, font-weight 600
- **Net (negative)**: color `#dc2626`, font-weight 600
- **Savings rate**: formatted as percentage with 1 decimal

---

## 7. Cash Flow Tab

### Income vs Expenses Chart

**Card Container**: Standard

**Chart Container**:
- **Type**: Grouped Bar Chart
- **Height**: 360px
- **Background**: `#f8fafc`
- **Border**: 1px solid `#e2e8f0`
- **Border-radius**: 20px
- **Padding**: 16px

**Bar Chart Styling**:
- **Grid**: Dashed, stroke `#e2e8f0`, strokeDasharray "4 6"
- **XAxis**: fontSize 11px, color `#94a3b8`
- **YAxis**: fontSize 11px, color `#94a3b8`, formatted as currency
- **Bars**:
  - Income: `#10B981` (emerald)
  - Expenses: `#F97316` (orange)
  - Radius: [12, 12, 0, 0]
  - Max bar size: 42px
- **Tooltip**: Custom CashflowTooltip
- **Legend**: Top, circle icons

---

## 8. Loading State

**Container**:
- **Height**: 200px
- **Background**: white
- **Border**: 1px solid `#e2e8f0`
- **Border-radius**: 24px
- **Display**: Flex center
- **Typography**: 14px, color `#64748b`
- **Text**: "Refreshing your analytics…"

---

## 9. Error State

**Container**:
- **Background**: `#fee2e2`
- **Border**: 1px solid `#fecaca`
- **Border-radius**: 24px
- **Padding**: 24px
- **Typography**: 14px, color `#dc2626`
- **Text**: Error message from API

---

## 10. Empty State

**Container**:
- **Background**: white
- **Border**: 1px solid `#e2e8f0`
- **Border-radius**: 24px
- **Padding**: 40px 20px
- **Text-align**: center

**Content**:
- **Icon**: 48px emoji or Lucide icon
- **Title**: 16px, font-weight 600, color `#0f172a`
- **Description**: 14px, color `#64748b`
- **CTA**: Optional button to try different range

---

## 11. Responsive Design

### Breakpoints
- **Mobile** (< 768px):
  - Header: Single column, 24px padding
  - Controls: Stack vertically, full width
  - Grid layouts: 1 column
  - Font sizes: Reduce by 2-4px
  - Padding: Reduce to 20px

- **Tablet** (768px - 1024px):
  - Header: Two columns with wrap
  - Grid layouts: 1 column
  - Padding: 24px

- **Desktop** (> 1024px):
  - Header: Two columns side-by-side
  - Grid layouts: 2 columns (1.6fr 1fr for summary)
  - Full spacing as specified

---

## 12. Accessibility

- **Contrast**: All text meets 4.5:1 ratio on gradient backgrounds
- **Focus states**: Visible ring on all interactive elements
- **Aria-labels**: Close button, select, all icon-only controls
- **Keyboard navigation**: Tab through tabs, select, buttons
- **Screen readers**: Descriptive labels for charts (alt text or hidden summary)

---

## 13. Motion & Transitions

- **Tab transitions**: Fade in/out, 150ms ease
- **Button hover**: Background/border transition, 150ms ease
- **Card elevation**: Hover shadow increase, 150ms ease
- **Loading animation**: Pulse effect on loading state

---

## 14. Implementation Checklist

- [ ] Update header with emerald gradient and new badge style
- [ ] Refactor tab system to use new pill-style container
- [ ] Redesign Overview tab:
  - [ ] Add section banner for savings rate chart
  - [ ] Update chart styling per §13 specs
  - [ ] Redesign period summary card with highlight boxes
  - [ ] Add metric cards with accent colors
  - [ ] Implement action pills
  - [ ] Redesign highlights card (bright spot, tough month, top category)
  - [ ] Update top categories card with new chart styling
- [ ] Redesign Trends tab:
  - [ ] Add legend pills
  - [ ] Update area chart styling
- [ ] Redesign Breakdown tab:
  - [ ] Add legend pills to contribution chart
  - [ ] Update bar chart styling
  - [ ] Redesign table with new styling
- [ ] Redesign Cash flow tab:
  - [ ] Update bar chart styling
- [ ] Update loading, error, and empty states
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Verify accessibility (contrast, focus, aria-labels)
- [ ] Test all chart interactions (tooltips, legends)

---

## 15. Color Reference

### Accent Palette (per goalColorPalette.js)
- **Emerald** (0): `#10b981` / `#ecfdf5`
- **Teal** (1): `#14b8a6` / `#f0fdfa`
- **Sky** (2): `#0ea5e9` / `#f0f9fe`
- **Indigo** (3): `#6366f1` / `#eef2ff`
- **Violet** (4): `#8b5cf6` / `#f5f3ff`
- **Amber** (5): `#f59e0b` / `#fef3c7`
- **Rose** (6): `#fb7185` / `#ffe4e6`
- **Slate** (7): `#64748b` / `#f1f5f9`

### Chart Palette
```javascript
const chartPalette = [
  '#0EA5E9',  // Sky
  '#6366F1',  // Indigo
  '#10B981',  // Emerald
  '#14B8A6',  // Teal
  '#8B5CF6',  // Violet
  '#F97316',  // Orange
  '#F59E0B',  // Amber
  '#475569'   // Slate
];
```

---

## 16. Files to Update

1. **`client/src/components/dashboard/modals/AnalyticsDeepDiveModal.js`**
   - Refactor header section
   - Update tab styling
   - Redesign all tab content cards
   - Update chart styling per spec
   - Add new state styles

2. **`client/src/index.css`** (if needed)
   - Add any global styles for modal
   - Ensure design-system.css tokens are applied

3. **Design mockup**: `.superdesign/design_iterations/analytics_deep_dive_modal_1.html`
   - Reference for visual implementation

---

## 17. Notes

- Maintain all existing data transformations and calculations
- Keep all API calls and data fetching logic
- Focus on UI/UX improvements, not functional changes
- Use Tailwind classes where possible, inline styles for dynamic values
- Ensure all Recharts components maintain their current functionality
- Test with various data ranges (3, 6, 12 months)
- Verify all tooltips display correctly
- Check that all action pills are functional (if implemented)


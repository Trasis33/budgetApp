# Product Guidelines: Couples Budget App

## Design Philosophy

The Couples Budget App follows a **"Refined Nordic Finance"** aesthetic — a warm, editorial design language inspired by Scandinavian design principles. The visual identity balances generous whitespace with high data density where needed, using sophisticated typography and a restrained color palette with purposeful accent colors.

**Core Principles:**
1. **Warmth over Coldness** — Warm ivory/cream backgrounds instead of pure white or cold grays
2. **Editorial Typography** — Distinctive serif display font (Instrument Serif) paired with refined sans-serif body font (DM Sans)
3. **Purposeful Color** — Accent colors used sparingly and meaningfully
4. **Density When Needed** — Support both spacious dashboard views and compact data-dense tables
5. **Progressive Disclosure** — Essential information first, complexity revealed on demand
6. **Desktop-First** — Optimized for focused desktop sessions during monthly reconciliation

## Visual Identity

### Style
Modern and clean with a focus on clarity, high-quality typography, and a warm, trustworthy feel. The design avoids cold, corporate aesthetics in favor of an approachable yet professional appearance.

### Typography
- **Display Font:** Instrument Serif (headings, stat values)
- **Body Font:** DM Sans (body text, labels, UI elements)

### Color Palette (OKLCH)

**Semantic Theme Colors:**
| Color | Token | Usage |
|-------|-------|-------|
| Teal | `--theme-teal` | Success, progress, positive actions, "on track" states |
| Coral | `--theme-coral` | Warnings, over-budget, attention needed, danger states |
| Gold | `--theme-gold` | Highlights, pinned items, premium features |
| Amber | `--theme-amber` | Caution, near-limit states |
| Indigo | `--theme-indigo` | Primary actions, links, interactive elements |

**Extended Palette (Categories & Charts):**
- Yellow, Golden, Violet, Cyan, Periwinkle, Mint

**Usage Guidelines:**
- Theme colors are used for category identification, chart series, and accent elements
- Background tints use 10-15% opacity: `bg-theme-teal/10`
- Always balanced against warm neutrals for a secure, trustworthy feel
- Never use raw hex values — always CSS variables or Tailwind theme classes

### Data Density

The design supports two density modes:

**Standard Density** (Dashboards, Forms):
- Generous padding (`p-4` to `p-6`)
- Spacious gaps (`gap-4` to `gap-6`)
- Large stat displays and progress indicators

**Compact Density** (Tables, Lists):
- Tight padding (`py-2 px-3`)
- Minimal gaps (`gap-1` to `gap-2`)
- Smaller text sizes (`text-sm`, `text-xs`)
- Hover-reveal action buttons

## User Interface Principles

### Progressive Disclosure
Complexity is managed by showing essential information first. Advanced options, detailed breakdowns, and dense data views are revealed only when requested or in specific workflows.

### Desktop Optimization
Prioritize the layout and interaction patterns for desktop usage during the primary "end-of-month" reconciliation sessions. Mobile is supported but not the primary target.

### Consistency
Use standardized shadcn/ui components to ensure a predictable and professional experience. Always check the Design System documentation (`client-v2/DESIGN_SYSTEM.md`) for component patterns.

### Component Patterns
- **Cards:** Primary container with section labels in uppercase micro text
- **Badges:** Status badges follow semantic color system (teal/amber/coral)
- **Progress Bars:** Color changes based on status thresholds
- **Tables:** Compact rows with hover-reveal actions
- **Modals:** Header/body/footer structure with border separators

## Interaction & Communication

### Language
The language of the app is in **Swedish**.

### Tone of Voice
Direct, professional, and reassuring. Avoid overly casual language to maintain the sense of financial responsibility.

### Feedback Loop
Provide immediate and clear feedback for all user actions.

### Notifications & Alerts
- **Toasts:** Non-intrusive, self-dismissing for routine confirmations (e.g., "Expense recorded")
- **Banners:** Persistent, urgent for critical system states or budget alerts (e.g., "Monthly budget exceeded")
- **Actionable Feedback:** Every confirmation or alert provides a clear next step

## Design System Reference

For detailed implementation guidelines, component patterns, and code examples, refer to:

📄 **`client-v2/DESIGN_SYSTEM.md`**

This document includes:
- Complete color token reference
- Typography scale and usage
- Spacing and density guidelines
- Component patterns with code examples
- Layout patterns
- Animation guidelines
- Accessibility requirements

**AI Agents:** Always consult the Design System documentation when creating or modifying UI components to ensure consistency with the established visual language.

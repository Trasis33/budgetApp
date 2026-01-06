# Couples Budget App — Design System

> **For AI Agents**: This document defines the visual language, component patterns, and implementation guidelines for the Couples Budget App. Follow these specifications when creating or modifying UI components.

## Design Philosophy

**"Refined Nordic Finance"** — A warm, editorial aesthetic inspired by Scandinavian design principles. The design balances generous whitespace with high data density where needed, using sophisticated typography and a restrained color palette with purposeful accent colors.

### Core Principles

1. **Warmth over Coldness** — Use warm ivory/cream backgrounds instead of pure white or cold grays
2. **Editorial Typography** — Pair a distinctive serif display font with a refined sans-serif body font
3. **Purposeful Color** — Use accent colors sparingly and meaningfully (teal for success/progress, coral for warnings/attention, gold for highlights)
4. **Density When Needed** — Support both spacious dashboard views and compact data-dense tables
5. **Progressive Disclosure** — Show essential information first, reveal complexity on demand
6. **Desktop-First** — Optimize for focused desktop sessions during monthly reconciliation

---

## Color System

### Semantic Color Tokens

All colors use OKLCH format for perceptual uniformity. Use CSS variables via Tailwind classes.

#### Canvas & Surfaces
| Token | OKLCH Value | Tailwind Class | Usage |
|-------|-------------|----------------|-------|
| `--background` | `oklch(0.982 0.008 75)` | `bg-background` | Main page canvas (warm ivory) |
| `--card` | `oklch(1 0 0)` | `bg-card` | Card surfaces (pure white) |
| `--muted` | `oklch(0.965 0.006 75)` | `bg-muted` | Subtle backgrounds, input backgrounds |
| `--popover` | `oklch(1 0 0)` | `bg-popover` | Dropdowns, popovers, modals |

#### Text Colors
| Token | OKLCH Value | Tailwind Class | Usage |
|-------|-------------|----------------|-------|
| `--foreground` | `oklch(0.25 0.015 75)` | `text-foreground` | Primary text (warm charcoal) |
| `--muted-foreground` | `oklch(0.55 0.01 75)` | `text-muted-foreground` | Secondary text, labels |

#### Accent Colors (Theme Colors)
| Token | OKLCH Value | Tailwind Class | Semantic Usage |
|-------|-------------|----------------|----------------|
| `--theme-teal` | `oklch(0.65 0.14 175)` | `text-theme-teal` | Success, progress, positive actions |
| `--theme-coral` | `oklch(0.68 0.16 25)` | `text-theme-coral` | Warnings, over-budget, attention |
| `--theme-gold` | `oklch(0.75 0.15 85)` | `text-theme-gold` | Highlights, pinned items, premium |
| `--theme-indigo` | `oklch(0.45 0.12 270)` | `text-theme-indigo` | Primary actions, links, interactive |
| `--theme-amber` | `oklch(0.72 0.18 55)` | `text-theme-amber` | Caution, near-limit states |

#### Status Colors
| State | Color Token | Background Pattern |
|-------|-------------|-------------------|
| Success/On Track | `--theme-teal` | `bg-theme-teal/10` with `text-theme-teal` |
| Warning/Near Limit | `--theme-amber` | `bg-theme-amber/10` with `text-theme-amber` |
| Danger/Over Budget | `--theme-coral` | `bg-theme-coral/10` with `text-theme-coral` |
| Neutral/Pending | `--muted` | `bg-muted` with `text-muted-foreground` |

### Color Usage Rules

1. **Never use raw hex values** — Always use CSS variables or Tailwind theme classes
2. **Accent backgrounds use 10-15% opacity** — `bg-theme-teal/10`, `bg-theme-coral/12`
3. **Icons inherit text color** — Set color on parent, icon inherits via `currentColor`
4. **Category colors are dynamic** — Use `getCategoryColor()` utility, apply via inline styles
5. **Dark mode support** — All tokens have dark mode variants defined in globals.css

---

## Typography

### Font Stack

```css
--font-display: 'Instrument Serif', Georgia, serif;
--font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Type Scale

| Element | Font | Size | Weight | Line Height | Usage |
|---------|------|------|--------|-------------|-------|
| Page Title | Display | `text-2xl` (1.5rem) | 500 | 1.2 | Main page headings |
| Section Title | Display | `text-lg` (1.125rem) | 500 | 1.3 | Card titles, section headers |
| Card Title | Body | `text-sm` uppercase | 500 | 1.5 | Small section labels |
| Body | Body | `text-base` (1rem) | 400 | 1.5 | Paragraphs, descriptions |
| Body Strong | Body | `text-base` | 600 | 1.5 | Emphasis, important values |
| Small | Body | `text-sm` (0.875rem) | 400 | 1.5 | Secondary info, metadata |
| Tiny | Body | `text-xs` (0.75rem) | 500 | 1.5 | Labels, badges, timestamps |
| Stat Value | Display | `text-3xl` (1.875rem) | 600 | 1.1 | Large numbers, KPIs |

### Typography Patterns

```tsx
// Page header
<h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
  Budget Manager
</h1>
<p className="text-muted-foreground mt-1">
  Track your monthly spending
</p>

// Section label (uppercase micro)
<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
  Month at a Glance
</h3>

// Stat display
<div className="font-display text-3xl font-semibold tracking-tight">
  {formatCurrency(amount)}
</div>

// Data table cell
<td className="text-sm font-medium text-foreground">
  {expense.description}
</td>
```

---

## Spacing System

Use Tailwind's spacing scale consistently. The app supports two density modes:

### Standard Density (Dashboards, Forms)
| Element | Padding | Gap |
|---------|---------|-----|
| Page | `p-6` to `p-10` | — |
| Card | `p-4` to `p-6` | `gap-4` |
| Card Header | `pb-2` | `gap-1.5` |
| Section | `py-6` | `gap-6` |
| Form Group | — | `gap-4` (vertical), `gap-3` (inline) |
| Button Group | — | `gap-2` to `gap-3` |

### Compact Density (Tables, Lists)
| Element | Padding | Gap |
|---------|---------|-----|
| Table Cell | `py-2 px-3` | — |
| Table Row | — | — |
| List Item | `p-3` | `gap-3` |
| Inline Badge Group | — | `gap-2` |
| Icon + Text | — | `gap-2` |

### Density Utility Classes

```tsx
// Standard density container
<div className="space-y-6">

// Compact density container
<div className="space-y-1">

// Table with compact cells
<td className="py-2 px-3 text-sm">
```

---

## Component Patterns

### Cards

Cards are the primary container. Use shadcn's `Card` component with these patterns:

```tsx
// Standard card with section label
<Card className="rounded-xl border-border/60">
  <CardHeader className="pb-2">
    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      Section Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// Card with subtle background (for emphasis)
<Card className="rounded-xl bg-muted/30 border-border/40">

// Pinned/highlighted card
<Card className="rounded-xl border-theme-gold bg-gradient-to-b from-theme-gold/5 to-transparent">
```

### Buttons

Use shadcn's `Button` component. Primary actions use theme colors:

```tsx
// Primary action (teal accent)
<Button className="bg-theme-teal hover:bg-theme-teal/90 text-white">
  Save Changes
</Button>

// Smart/AI action (gradient)
<Button className="bg-gradient-to-r from-theme-indigo to-theme-teal text-white hover:opacity-90">
  <Sparkles className="h-4 w-4" />
  Smart Setup
</Button>

// Destructive action
<Button variant="destructive">
  Delete
</Button>

// Ghost with hover reveal (for row actions)
<Button 
  variant="ghost" 
  size="icon"
  className="opacity-0 group-hover:opacity-100 transition-opacity"
>
  <Pencil className="h-4 w-4" />
</Button>
```

### Badges

Status badges follow the semantic color system:

```tsx
// Status badges
<Badge className="bg-theme-teal/10 text-theme-teal border-theme-teal/20">
  On track
</Badge>

<Badge className="bg-theme-amber/10 text-theme-amber border-theme-amber/20">
  Near limit
</Badge>

<Badge className="bg-theme-coral/10 text-theme-coral border-theme-coral/20">
  Over budget
</Badge>

// Category badge (dynamic color)
<Badge 
  style={{ 
    backgroundColor: `oklch(from ${categoryColor} l c h / 0.1)`,
    color: categoryColor,
    borderColor: `oklch(from ${categoryColor} l c h / 0.2)`
  }}
>
  {categoryName}
</Badge>
```

### Progress Bars

```tsx
// Standard progress bar
<div className="h-2 bg-muted rounded-full overflow-hidden">
  <div 
    className="h-full rounded-full transition-all duration-500"
    style={{ 
      width: `${Math.min(100, progress)}%`,
      backgroundColor: progress >= 90 ? 'var(--theme-coral)' : 
                       progress >= 80 ? 'var(--theme-amber)' : 
                       'var(--theme-teal)'
    }}
  />
</div>

// Compact progress bar (for tables)
<div className="h-1.5 bg-muted rounded-full overflow-hidden">
  <div 
    className="h-full rounded-full"
    style={{ 
      width: `${progress}%`,
      backgroundColor: categoryColor 
    }}
  />
</div>
```

### Scope Switcher

The scope switcher (Ours/Mine/Partner's) is a key navigation pattern:

```tsx
<div className="inline-flex bg-muted rounded-lg p-1 gap-1">
  {['ours', 'mine', 'partner'].map((scope) => (
    <button
      key={scope}
      onClick={() => setScope(scope)}
      className={cn(
        "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
        currentScope === scope
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {scope === 'ours' ? 'Shared' : scope === 'mine' ? 'Mine' : "Partner's"}
    </button>
  ))}
</div>
```

### Category Icons with Color

```tsx
import { getIconByName } from '@/lib/categoryIcons';
import { getCategoryColor } from '@/lib/categoryColors';
import { getCategoryIconStyle } from '@/lib/iconUtils';

// Category icon with background
const IconComponent = getIconByName(category.icon);
const categoryColor = getCategoryColor(category);

<div 
  className="w-9 h-9 rounded-lg flex items-center justify-center"
  style={getCategoryIconStyle(categoryColor, false, 0.15)}
>
  <IconComponent className="h-4 w-4" />
</div>
```

### Data Tables

For data-dense views like ExpenseList:

```tsx
<table className="w-full">
  <thead>
    <tr className="border-b border-border">
      <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Date
      </th>
      {/* More headers */}
    </tr>
  </thead>
  <tbody>
    {expenses.map(expense => (
      <tr 
        key={expense.id} 
        className="group border-b border-border/50 hover:bg-muted/30 transition-colors"
      >
        <td className="py-2 px-3 text-sm text-muted-foreground">
          {formatDate(expense.date)}
        </td>
        <td className="py-2 px-3 text-sm font-medium text-foreground">
          {expense.description}
        </td>
        {/* Actions column - reveal on hover */}
        <td className="py-2 px-3 text-right">
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### Modals/Dialogs

Use shadcn's Dialog with these styling patterns:

```tsx
<Dialog>
  <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">
    {/* Header with border */}
    <div className="p-6 pb-4 border-b border-border/50">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold tracking-tight">
          Create New Goal
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Set a savings target to track your progress
        </DialogDescription>
      </DialogHeader>
    </div>
    
    {/* Body */}
    <div className="p-6 space-y-6">
      {/* Form content */}
    </div>
    
    {/* Footer with border */}
    <DialogFooter className="p-6 pt-4 border-t border-border/50 bg-muted/30">
      <Button variant="ghost">Cancel</Button>
      <Button className="bg-theme-teal text-white">Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Collapsible Sections

For progressive disclosure in dense views:

```tsx
<Collapsible>
  <CollapsibleTrigger asChild>
    <button className="w-full flex items-center justify-between p-4 hover:bg-muted/30 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <RefreshCw className="h-5 w-5 text-theme-indigo" />
        <span className="font-medium">Recurring Expenses</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {count} items • {formatCurrency(total)}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </div>
    </button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    {/* Expanded content */}
  </CollapsibleContent>
</Collapsible>
```

---

## Layout Patterns

### Page Layout

```tsx
<div className="min-h-screen bg-background">
  {/* Header */}
  <header className="border-b border-border">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="font-display text-xl font-medium">Page Title</h1>
          <DateSelector />
        </div>
        <div className="flex items-center gap-4">
          <ScopeSelector />
          <Button>Primary Action</Button>
        </div>
      </div>
    </div>
  </header>
  
  {/* Main content */}
  <main className="max-w-7xl mx-auto px-6 py-8">
    {/* Content */}
  </main>
</div>
```

### Two-Column Dashboard Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
  {/* Left sidebar - Summary */}
  <aside className="lg:col-span-5 space-y-6">
    <Card>{/* Summary content */}</Card>
    <Card>{/* Quick stats */}</Card>
  </aside>
  
  {/* Right main area - Data */}
  <section className="lg:col-span-7">
    <Card>{/* Main data table/list */}</Card>
  </section>
</div>
```

### Card Grid Layout

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>
```

---

## Animation Guidelines

### Transitions

Use Tailwind's transition utilities with these durations:

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Hover states | 150ms | `ease-out` | Button hover, link hover |
| Expand/collapse | 200ms | `ease-out` | Collapsibles, dropdowns |
| Page transitions | 300ms | `ease-out` | Route changes, modal open |
| Progress bars | 500ms | `ease-out` | Progress updates |

```tsx
// Standard transition
className="transition-colors duration-150"

// Expand animation
className="transition-all duration-200 ease-out"

// Hover reveal
className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
```

### Entry Animations

Use `animate-in` from tailwindcss-animate for modal/page entries:

```tsx
// Fade up entry
className="animate-in fade-in slide-in-from-bottom-4 duration-300"

// Scale entry (modals)
className="animate-in fade-in zoom-in-95 duration-200"
```

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape, tablet portrait |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop (primary target) |
| `xl` | 1280px | Large desktop |

### Mobile Adaptations

- Sidebar collapses to bottom nav or hamburger menu
- Two-column layouts stack vertically
- Tables may switch to card-based list view
- Touch targets minimum 44x44px

---

## Accessibility Requirements

1. **Color contrast** — All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
2. **Focus indicators** — All interactive elements have visible focus rings
3. **Keyboard navigation** — All actions accessible via keyboard
4. **ARIA labels** — Icons without text have `aria-label`
5. **Reduced motion** — Respect `prefers-reduced-motion`

```tsx
// Focus ring pattern
className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

// Icon button with label
<Button variant="ghost" size="icon" aria-label="Edit expense">
  <Pencil className="h-4 w-4" />
</Button>
```

---

## File Organization

```
client-v2/src/
├── styles/
│   └── globals.css          # CSS variables, base styles
├── lib/
│   ├── utils.ts             # cn(), formatCurrency(), etc.
│   ├── categoryColors.ts    # Category color utilities
│   ├── categoryIcons.ts     # Icon mapping
│   └── iconUtils.ts         # Icon styling helpers
├── components/
│   └── ui/                   # shadcn components (do not modify)
```

---

## Quick Reference: Common Patterns

### Status Badge
```tsx
<Badge className="bg-theme-teal/10 text-theme-teal border-theme-teal/20">
  On track
</Badge>
```

### Category Chip
```tsx
<div 
  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full"
  style={getCategoryIconStyle(categoryColor, false, 0.1)}
>
  <Icon className="h-3.5 w-3.5" />
  <span className="text-xs font-medium">{name}</span>
</div>
```

### Stat Card
```tsx
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      Total Spent
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="font-display text-3xl font-semibold tracking-tight">
      {formatCurrency(amount)}
    </div>
  </CardContent>
</Card>
```

### Table Row with Hover Actions
```tsx
<tr className="group hover:bg-muted/30">
  <td>{/* content */}</td>
  <td className="text-right">
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <Edit2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  </td>
</tr>
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-06 | Initial design system based on "Refined Nordic Finance" aesthetic |

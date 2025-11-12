# Prompt: Comprehensive UI/UX Redesign for the Savings Page

**Objective:** Reimagine and implement a new `Savings.js` page that transforms the user experience from a simple data display into a modern, inviting, and supportive "financial check-up." The new design must strictly adhere to the principles and specifications outlined in the `design_spec_financial_checkup_ui.md` document.

**Context:**
The current `Savings.js` page is a functional but uninspired layout. It consists of three distinct sections: a header, a `SavingsRateTracker` component, and a `SavingsGoalsManager` component. This separation feels disjointed. The goal is to create a unified, conversational, and action-oriented experience that helps users feel confident and in control of their savings.

**Core Task:**
Your task is to replace the entire content of `client/src/pages/Savings.js` with a new implementation that reflects a complete rethinking of the UI/UX. You will use the existing data sources and component logic from `SavingsRateTracker` and `SavingsGoalsManager` but present them within a new, cohesive, and visually appealing layout based on the "Financial Check-up" design system.

---

## Design & Implementation Mandates

### 1. Adhere to Core Design Principles:
You MUST follow the design philosophy from `design_spec_financial_checkup_ui.md`:
- **Conversational & Supportive:** The language should be encouraging, like a financial coach. Lead with wins.
- **Data-rich, Never Overwhelming:** Use visuals to make complex data immediately understandable.
- **Action-oriented:** Every piece of information should have a clear next step.
- **Calming Confidence:** Employ rounded shapes, soft gradients, and gentle shadows to create an inviting UI.

### 2. New Page Structure:
Move away from the current stacked-section layout. Instead, adopt a card-based dashboard grid.

- **Main Container:** Use a layout with generous padding (e.g., `p-6` or `p-8`).
- **Header:** Start with a "Section Banner" as defined in the spec.
  - **Icon:** Use a `lucide-react` icon like `PiggyBank` or `Landmark`.
  - **Headline:** "Your Savings Check-up"
  - **Subtitle:** "A supportive look at your savings habits, goals, and opportunities."
- **Card Grid:** Display insights in a 1-column (mobile) or 2-column (desktop) grid. Use a gap of `20-24px`.

### 3. Component Redesign - From Components to "Insight Cards":

Instead of just rendering the `SavingsRateTracker` and `SavingsGoalsManager` components directly, you will break their functionality down into multiple, smaller, more focused "Insight Cards."

#### Card 1: Savings Rate Analysis
- **Title:** "Savings Rate Health"
- **Anatomy:**
  1.  **Header:** Title and a "Confidence Badge" (e.g., Emerald for >20% rate, Amber for 10-20%, Slate for <10%).
  2.  **Body Copy:** A short, conversational summary of their average savings rate (e.g., "You're saving an average of 18% of your income. That's a great foundation!").
  3.  **Visualization:** A 130px tall `Recharts` area chart showing the `savingsRate` over the selected `timePeriod`.
      - Use the `reallocation` color scheme (indigo line, `eef2ff` background).
      - The chart should include a dashed reference line for a target rate (e.g., 20%).
  4.  **Stat Block:** Display key metrics from the `summary` object (`averageSavingsRate`, `totalSavings`, `savingsRateTrend`) in a clean, readable format. Use `lucide-react` icons for each stat.
  5.  **Actions:** Include action pills like "Change Period" (to modify the time horizon) and "View Transactions".

#### Card 2: Shared Savings Goals
- **Title:** "Our Shared Goals"
- **Anatomy:**
  1.  **Header:** Title and an action pill to "Add New Goal".
  2.  **Body Copy:** "Here's a look at the progress we're making on the big things."
  3.  **Goal List:** Iterate through the `savingsGoals` array. For each goal:
      - Display it in a "mint panel" as described in the spec.
      - Show `goal_name` and `category`.
      - Include a progress bar using the `emerald` accent color.
      - Display text like: `Saved {formatCurrency(current_amount)} of {formatCurrency(target_amount)}`.
      - Show "Months Remaining" or "Overdue" based on `target_date`.
      - Provide actions for each goal: "Log Contribution" and "Edit Goal".

#### Card 3: Savings Opportunity (New Concept)
- **Title:** "Savings Opportunity"
- **Anatomy:**
  1.  **Header:** Use a `seasonal` (amber) accent color.
  2.  **Body Copy:** Create a proactive insight. For example, if their savings trend is negative, you could say: "Your savings dipped slightly last month. A small adjustment to your 'Dining Out' budget could get you back on track."
  3.  **Impact Chip:** `Potential impact: +$50/month`
  4.  **Actions:** "Adjust Budget" or "See Spending".

### 4. Visual & Styling Requirements:
- **Cards:** Use the specified card styling: `className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md hover:shadow-lg transition-shadow"`
- **Typography:** Strictly follow the font sizes, weights, and colors from the spec.
- **Color Palette:** Use the specified accent colors for different contexts (e.g., `emerald` for wins, `indigo` for reallocation).
- **Iconography:** Use `lucide-react` for all icons, sized at 20-24px.
- **State Management:**
  - Retain the `timePeriod` state.
  - Fetch data within the main page component and pass it down to the new "Insight Cards" as props.
  - Implement `loading`, `error`, and `empty` states as defined in the spec (e.g., frosted glass loader, celebratory empty state).

### Deliverable:
A single, complete `Savings.js` file that implements this new design. The file should be self-contained and use existing hooks (`useAuth`, `useScope`) and data-fetching logic. You are expected to integrate `recharts` for visualizations and `lucide-react` for icons. Assume `shadcn/ui` components like `Card` are available.

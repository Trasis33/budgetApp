# Product Guidelines: Couples Budget App

## Design Philosophy
The Couples Budget App follows a "Professional & Secure" tone, emphasizing reliability and financial trust. The visual aesthetic is "Modern & Clean," leveraging the shadcn/ui design system for a refined, contemporary look. While maintaining a clean interface, the design accommodates high data density for advanced users during focused financial review sessions.

## Visual Identity
- **Style:** Modern and clean with ample white space and high-quality typography.
- **Data Density:** Surfaces complex data and dense tables where necessary (e.g., end-of-month reconciliation), ensuring all critical information is visible without overwhelming the user.
- **Color Palette (oklch):**
    - `Amber`: `oklch(.646 .222 41.116)`
    - `Teal`: `oklch(.6 .118 184.704)`
    - `Indigo`: `oklch(.398 .07 227.392)`
    - `Yellow`: `oklch(.828 .189 84.429)`
    - `Golden`: `oklch(.769 .188 70.08)`
    - `Coral`: `oklch(.71 .18 16)`
    - `Violet`: `oklch(.74 .16 320)`
    - `Cyan`: `oklch(.7 .16 200)`
    - `Periwinkle`: `oklch(.78 .16 260)`
    - `Mint`: `oklch(.82 .12 140)`
    - *Usage:* These vibrant theme colors are used for category identification, chart series, and accent elements, balanced against professional neutrals (grays/whites) to maintain a secure and trustworthy feel.

## User Interface Principles
- **Progressive Disclosure:** Complexity is managed by showing essential information first. Advanced options, detailed breakdowns, and dense data views are revealed only when requested or in specific workflows.
- **Desktop Optimization:** Prioritize the layout and interaction patterns for desktop usage during the primary "end-of-month" reconciliation sessions.
- **Consistency:** Use standardized shadcn/ui components to ensure a predictable and professional experience across the entire application.

## Interaction & Communication
- **Tone of Voice:** Direct, professional, and reassuring. Avoid overly casual language to maintain the sense of financial responsibility.
- **Feedback Loop:** Provide immediate and clear feedback for all user actions.
- **Notifications & Alerts:**
    - **Toasts:** Use non-intrusive, self-dismissing toasts for routine confirmations (e.g., "Expense recorded").
    - **Banners:** Use persistent, urgent banners for critical system states or budget alerts (e.g., "Monthly budget exceeded").
    - **Actionable Feedback:** Ensure every confirmation or alert provides a clear next step or path forward.

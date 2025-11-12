# Navbar to shadcn/ui Migration Implementation Prompt

I need to create a focused implementation plan for budgetApp.

**Project Context:**
- Project Type: WEB_APP
- Technology Stack: React + Node.js/Express + SQLite
- Current Phase: Design System Integration Phase (shadcn/ui Migration)

**Minor Feature Request:**
I want to implement shadcn/ui Navbar Migration which will replace the current Tailwind-based section navigation with shadcn/ui Tabs component that adheres to the established design system with glass morphism effects and gradient styling.

**Current State:**
- Section navigation in Budget.js (lines 742-759) currently uses basic Tailwind classes with gray background and white active states
- design-system.css with comprehensive glassmorphism styling and CSS custom properties is available as the target system
- Successful shadcn/ui CategorySpendingChart migration is available as reference pattern
- Current navbar structure: `bg-gray-100`, `bg-white`, `text-blue-600` styling needs complete transformation

**Target Changes:**
1. Replace Tailwind navbar with shadcn/ui Tabs component using glass morphism effects
2. Integrate design system styling (backdrop blur, gradient colors, hover animations)
3. Maintain existing section navigation functionality while improving visual consistency
4. Add A/B testing toggle to compare old vs new implementations

**Requirements:**
- Implementation Timeline: 2-3 days
- Priority Level: HIGH
- Scope: STYLING + COMPONENT_MIGRATION
- Must preserve existing section switching functionality
- Must follow design-system.css patterns established in CategorySpendingChart migration

Please provide:

1. **Quick implementation plan (3-5 pages)** including:
   - Current state analysis of Budget.js navbar implementation
   - Step-by-step transformation guide using shadcn/ui Tabs
   - Before/after code examples with exact class replacements
   - Integration with design-system.css properties
   - A/B testing implementation strategy
   - Testing checklist and success criteria
   - Implementation timeline (day-by-day)

**For the implementation plan, include:**
- Executive Summary (1 paragraph) comparing current Tailwind navbar vs target shadcn/ui design system version
- Component analysis showing transformation from native buttons to TabsList/TabsTrigger
- Code transformation examples with exact shadcn/ui component usage
- Design system integration steps (glass effects, backdrop blur, gradient styling)
- Implementation steps (numbered list with file changes)
- Quality assurance checklist ensuring no functionality regression
- Success criteria focusing on visual consistency and preserved functionality

**Technical Requirements:**
- Use shadcn/ui Tabs, TabsList, TabsTrigger components as primary navigation structure
- Apply design-system.css variables (--bg-card, --backdrop-blur, --border-color, --color-primary, etc.)
- Implement glass morphism effects matching CategorySpendingChart pattern
- Include hover animations and transitions using design system timing
- Preserve existing sections array structure and activeSection state management
- Add A/B testing toggle similar to useShadcnChart pattern from chart migration
- Maintain responsive behavior and accessibility features
- Follow established design system button styling for toggle

**Design System Integration Requirements:**
- Use CSS custom properties from design-system.css
- Implement .glass-effect, .hover-lift, .text-gradient classes
- Apply backdrop-filter: var(--backdrop-blur) for glass morphism
- Use design system color palette (--color-primary, --color-secondary)
- Follow established card styling patterns (.card, .chart-card)
- Maintain consistent spacing using --spacing-* variables
- Implement smooth transitions matching design system animations

**Styling Context:**
- Current Styling Approach: TAILWIND (basic gray/white theme)
- Target Styling System: DESIGN_SYSTEM_CSS (glassmorphism with shadcn/ui)
- Visual Reference: CategorySpendingChart.js implementation and design-system.css patterns
- Browser Support: MODERN_BROWSERS (backdrop-filter support required)

**Component Structure Reference:**
```javascript
// Current structure (Budget.js lines 742-759)
<nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
  {sections.map((section) => (
    <button className="flex items-center px-6 py-3 rounded-md...">
      <span className="mr-2 text-lg">{section.icon}</span>
      {section.label}
    </button>
  ))}
</nav>

// Target shadcn/ui structure
<Tabs value={activeSection} onValueChange={setActiveSection}>
  <TabsList className="glass-effect backdrop-blur...">
    {sections.map((section) => (
      <TabsTrigger value={section.id} className="hover-lift...">
        <span className="text-lg">{section.icon}</span>
        {section.label}
      </TabsTrigger>
    ))}
  </TabsList>
</Tabs>
```

**Documentation Style:**
- Concise and actionable with practical code examples
- Code blocks with clear before/after transformations
- Simple day-by-day timeline with specific file changes
- Practical success metrics focusing on visual consistency
- Use emojis for quick visual scanning (✅, 🔄, 🎨, 💎)
- Follow chartjs_to_shadcn_migration_plan.md structure and formatting

The output should be a focused, immediately actionable implementation guide that transforms the basic Tailwind navbar into a stunning glassmorphism shadcn/ui navigation that seamlessly integrates with the established design system.

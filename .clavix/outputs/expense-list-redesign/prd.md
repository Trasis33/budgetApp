# Expense List Redesign - Product Requirements Document

**Version**: 1.0  
**Date**: 2025-11-24  
**Author**: Clavix Requirements Analysis  
**Status**: Draft for Implementation

## Executive Summary

This PRD outlines the redesign of the ExpenseList component to better organize and display expenses by separating variable spending from recurring expenses. The current implementation clutters the view with recurring expenses, making it difficult for users to identify standout variable expenses during monthly budget reviews.

**Key Benefits:**
- Improved focus on variable expenses that require attention
- Better budget analysis workflow for couples
- Enhanced user experience for monthly expense reviews
- Maintained accessibility to recurring expenses when needed

## Problem Statement

### Current Pain Points
1. **Visual Clutter**: Recurring expenses (10-20 per month) obscure variable expenses (10-50 per month)
2. **Reduced Focus**: Users can't easily identify unusual spending patterns in their monthly reviews
3. **Cognitive Load**: Mixed presentation requires users to mentally filter recurring vs variable expenses
4. **Workflow Inefficiency**: Monthly budget reviews take longer due to unnecessary detail exposure

### Impact
- Users spend more time analyzing their monthly spending
- Risk of missing important variable expense patterns
- Reduced effectiveness of the expense tracking system for budget management
- Poor user experience leading to potential system abandonment

## Current State Analysis

### Existing Implementation
- **Component Location**: `/client-v2/src/components/ExpenseList.tsx`
- **Backend Infrastructure**: 
  - Server routes: `/server/routes/recurringExpenses.js`
  - Client services: `/client-v2/src/api/services/recurringExpenseService.ts`
- **Current Behavior**: Single list with badges indicating recurring status
- **Data Volume**: 
  - Variable expenses: 10-50 per month
  - Recurring expenses: 10-20 per month

### Technical Foundation
- ✅ Recurring expense logic fully implemented
- ✅ Expense categorization services available
- ✅ API endpoints functional
- ❌ No separation of expense types in UI
- ❌ No user preference storage
- ❌ No collapsible section functionality

## Proposed Solution

### Core Architecture Changes

#### 1. Two-Section Layout
```
┌─ Variable Expenses (Always Visible) ─┐
│ • All non-recurring expenses         │
│ • Personal recurring expenses        │
│ • Header: Label + Total + Count      │
├─ Recurring Expenses (Collapsible) ──┤
│ • Shared recurring expenses only     │
│ • Header: Label + Total + Count      │
│ • [Expand/Collapse Button]           │
└──────────────────────────────────────┘
```

#### 2. Smart Categorization Logic
- **Variable Section**: 
  - All non-recurring expenses
  - Personal recurring expenses (stays here with recurring badge)
- **Recurring Section**: 
  - Shared recurring expenses only
  - Collapsible by default

#### 3. User Experience Features
- **Persistent Preferences**: Remember user's collapse/expand choice
- **Default State**: Both sections visible, recurring collapsed
- **Section Headers**: Display labels, totals, and expense counts
- **Smooth Transitions**: Animated expand/collapse behavior

### Technical Implementation Details

#### Component Structure
```
ExpenseList.tsx
├── SectionHeader.tsx (reusable)
├── VariableExpenseSection.tsx
├── RecurringExpenseSection.tsx (collapsible)
├── useExpensePreferences.ts (localStorage hook)
└── expenseService integration
```

#### Data Flow
1. Fetch expenses using existing API
2. Categorize expenses based on type and ownership
3. Calculate section totals and counts
4. Render sections with user's preference state
5. Update preference on user interaction

#### Storage Strategy
- **Key**: `expenseList_preferences`
- **Value**: `{ recurringExpanded: boolean }`
- **Scope**: User-specific (per browser/device)
- **Fallback**: Default to collapsed recurring section

## User Stories & Acceptance Criteria

### Primary User Story
> As a user reviewing my monthly expenses, I want to see my variable spending clearly separated from recurring expenses so that I can focus on identifying unusual patterns and make better budget decisions.

### Acceptance Criteria

#### AC1: Layout Structure
- [ ] Variable expenses section always visible at top
- [ ] Recurring expenses section below variable expenses
- [ ] Both sections have distinct visual separation
- [ ] Section headers clearly label each type

#### AC2: Expense Categorization
- [ ] Personal recurring expenses appear in Variable section with badges
- [ ] Shared recurring expenses appear in Recurring section
- [ ] Non-recurring expenses appear in Variable section
- [ ] Categorization matches existing backend logic

#### AC3: User Preferences
- [ ] Recurring section collapsed by default
- [ ] User can expand/collapse recurring section
- [ ] User's choice persists across browser sessions
- [ ] Preference storage uses localStorage

#### AC4: Section Headers
- [ ] Variable section shows: "Variable Expenses", total amount, expense count
- [ ] Recurring section shows: "Recurring Expenses", total amount, expense count
- [ ] Headers update when section content changes
- [ ] Headers are accessible and keyboard navigable

#### AC5: Accessibility
- [ ] Collapsible sections use proper ARIA attributes
- [ ] Keyboard navigation supported for expand/collapse
- [ ] Screen readers can distinguish section types
- [ ] Focus management works correctly

### Edge Cases

#### EC1: No Recurring Expenses
- **Scenario**: User has no recurring expenses for the month
- **Expected**: Recurring section still visible but empty
- **UI**: Show "No recurring expenses this month" message

#### EC2: No Variable Expenses  
- **Scenario**: User has only recurring expenses
- **Expected**: Variable section shows empty state
- **UI**: Show "No variable expenses this month" message

#### EC3: Large Expense Lists
- **Scenario**: User has maximum expenses (50+ variable, 20+ recurring)
- **Expected**: Performance remains smooth, scrolling works well
- **UI**: Consider pagination if needed for performance

#### EC4: First-time User
- **Scenario**: New user with no expense history
- **Expected**: Both sections visible, recurring collapsed by default
- **UI**: Show appropriate empty states for each section

## Technical Requirements

### Frontend Changes
1. **ExpenseList.tsx**: Major refactor for two-section layout
2. **SectionHeader.tsx**: New reusable component for section headers
3. **useExpensePreferences.ts**: Custom hook for preference management
4. **Styling**: Update CSS/Tailwind classes for section separation
5. **Animation**: Implement smooth expand/collapse transitions

### Integration Points
1. **Existing Services**: Utilize `recurringExpenseService.ts`
2. **API Compatibility**: Ensure no breaking changes to existing endpoints
3. **State Management**: Update any global state if needed
4. **Testing**: Update component tests and add new test coverage

### Performance Considerations
- **Lazy Loading**: Consider loading recurring section on demand
- **Memoization**: Memoize section calculations to prevent re-renders
- **Virtual Scrolling**: Implement if expense lists become very large

## Success Metrics

### Quantitative Metrics
1. **Task Completion Time**: Reduce monthly expense review time by 30%
2. **User Engagement**: Increase time spent reviewing variable expenses
3. **Preference Usage**: Track how often users expand recurring section
4. **Error Rate**: Zero UI bugs during initial implementation

### Qualitative Metrics
1. **User Satisfaction**: Improved feedback on expense review experience
2. **Workflow Efficiency**: Users report finding patterns faster
3. **Feature Adoption**: High usage of collapsible recurring section
4. **Accessibility Compliance**: Full WCAG 2.1 AA compliance

## Implementation Plan

### Phase 1: Foundation (Days 1-2)
- [ ] Review existing ExpenseList component architecture
- [ ] Create SectionHeader reusable component
- [ ] Implement useExpensePreferences hook
- [ ] Set up basic two-section layout structure

### Phase 2: Core Functionality (Days 3-4)
- [ ] Implement expense categorization logic
- [ ] Build VariableExpenseSection component
- [ ] Build RecurringExpenseSection with collapsible functionality
- [ ] Integrate with existing expense API

### Phase 3: Polish & Testing (Days 5-6)
- [ ] Add smooth animations for expand/collapse
- [ ] Implement section header totals and counts
- [ ] Add comprehensive error handling
- [ ] Write unit and integration tests
- [ ] Conduct accessibility testing

### Phase 4: Launch & Validation (Day 7)
- [ ] Deploy to staging environment
- [ ] Conduct user acceptance testing
- [ ] Monitor performance metrics
- [ ] Gather initial user feedback
- [ ] Prepare for production deployment

## Risk Assessment

### High Risk
1. **Performance Impact**: Large expense lists might cause rendering issues
   - **Mitigation**: Implement virtual scrolling if needed
2. **User Confusion**: Changing familiar interface might confuse existing users
   - **Mitigation**: Clear onboarding and consistent design patterns

### Medium Risk
1. **Categorization Logic**: Edge cases in expense type determination
   - **Mitigation**: Comprehensive testing with various expense types
2. **Preference Storage**: localStorage might not work in all environments
   - **Mitigation**: Fallback to sessionStorage, then to memory

### Low Risk
1. **Browser Compatibility**: Modern browsers should handle all features
   - **Mitigation**: Test across major browsers and devices

## Dependencies

### Technical Dependencies
- ✅ Existing recurring expense backend services
- ✅ Expense API endpoints
- ✅ UI component library (shadcn/ui)
- ✅ Tailwind CSS for styling

### Resource Dependencies
- Frontend developer for implementation
- QA tester for testing phase
- UX review for design validation
- Product owner for acceptance criteria validation

## Future Enhancements

### Post-Launch Considerations
1. **Advanced Filtering**: Allow users to filter by categories within sections
2. **Bulk Actions**: Enable batch operations on expense sections
3. **Export Features**: Section-specific expense exports
4. **Comparison Views**: Month-over-month section comparisons
5. **Smart Suggestions**: AI-powered expense categorization improvements

---

**Next Steps:**
1. Technical feasibility review with development team
2. Design mockups for final approval
3. Implementation kickoff with Phase 1 tasks
4. Weekly progress reviews during development

**Approval Required:**
- [ ] Product Owner
- [ ] Engineering Lead  
- [ ] UX/UI Designer
- [ ] QA Lead
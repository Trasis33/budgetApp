# Minor Feature Planning & Implementation Prompt Template

## Lightweight Prompt Structure

Use this template to generate focused implementation plans for minor features, styling updates, component refactoring, and small enhancements. This template is designed for features that can be completed in 1-5 days and don't require extensive database changes or new API endpoints.

---

## **Primary Prompt Template**

```
I need to create a focused implementation plan for [PROJECT_NAME].

**Project Context:**
- Project Type: [WEB_APP/MOBILE_APP/DESKTOP_APP/etc.]
- Technology Stack: [FRONTEND_TECH] + [BACKEND_TECH]
- Current Phase: [CURRENT_PROJECT_PHASE]

**Minor Feature Request:**
I want to implement [FEATURE_NAME] which will [FEATURE_OBJECTIVE].

**Current State:**
- [EXISTING_COMPONENTS] are currently implemented
- [CURRENT_STYLING/FUNCTIONALITY] needs to be updated
- [REFERENCE_PATTERN] is available as a successful example

**Target Changes:**
1. [CHANGE_1] - [BRIEF_DESCRIPTION]
2. [CHANGE_2] - [BRIEF_DESCRIPTION]
3. [CHANGE_3] - [BRIEF_DESCRIPTION]

**Requirements:**
- Implementation Timeline: [1-5_DAYS]
- Priority Level: [HIGH/MEDIUM/LOW]
- Scope: [STYLING/REFACTORING/MINOR_FEATURE]

Please provide:

1. **Quick implementation plan (3-5 pages)** including:
   - Current state analysis
   - Step-by-step transformation guide
   - Before/after code examples
   - Testing checklist
   - Implementation timeline (day-by-day)

**For the implementation plan, include:**
- Executive Summary (1 paragraph)
- Component analysis and changes needed
- Code transformation examples with exact replacements
- Implementation steps (numbered list)
- Quality assurance checklist
- Success criteria

**Technical Requirements:**
- Provide specific code examples for key changes
- Include exact class/style replacements
- Show before/after component structure
- Maintain existing functionality
- Preserve responsive behavior
- No performance regression

**Documentation Style:**
- Concise and actionable
- Code blocks with clear annotations
- Simple day-by-day timeline
- Practical success metrics
- Use emojis for quick visual scanning (✅, 🔄, 🎨, etc.)

The output should be a focused, immediately actionable implementation guide.
```

---

## **Example Usage Scenarios**

### **For Styling Updates:**
```
**Minor Feature Request:**
I want to implement Design System Integration which will standardize component styling across the application.

**Target Changes:**
1. Replace Tailwind classes with design system classes
2. Update component structure to match established patterns
3. Ensure visual consistency across related components
```

### **For Component Refactoring:**
```
**Minor Feature Request:**
I want to implement Component Structure Optimization which will improve code maintainability and consistency.

**Target Changes:**
1. Extract reusable UI patterns into shared components
2. Standardize prop interfaces across similar components
3. Improve component organization and file structure
```

### **For Minor UI Enhancements:**
```
**Minor Feature Request:**
I want to implement Enhanced Loading States which will improve user experience during data fetching.

**Target Changes:**
1. Add skeleton loading animations
2. Improve error state messaging
3. Add retry functionality for failed requests
```

---

## **Specialized Templates**

### **For Styling/CSS Updates:**
Add these sections:
```
**Styling Context:**
- Current Styling Approach: [TAILWIND/CSS_MODULES/STYLED_COMPONENTS/etc.]
- Target Styling System: [DESIGN_SYSTEM_NAME]
- Visual Reference: [REFERENCE_COMPONENT/DESIGN]
- Browser Support: [MODERN_BROWSERS/IE11_SUPPORT/etc.]
```

### **For Component Refactoring:**
Add these sections:
```
**Refactoring Context:**
- Code Quality Goals: [MAINTAINABILITY/PERFORMANCE/CONSISTENCY]
- Breaking Changes Allowed: [YES/NO]
- Testing Coverage: [EXISTING_TESTS/NO_TESTS]
- Component Dependencies: [LIST_DEPENDENT_COMPONENTS]
```

### **For Performance Optimization:**
Add these sections:
```
**Performance Context:**
- Current Performance Issues: [SPECIFIC_PROBLEMS]
- Target Metrics: [LOAD_TIME/BUNDLE_SIZE/etc.]
- Measurement Tools: [LIGHTHOUSE/PROFILER/etc.]
- Constraints: [NO_EXTERNAL_DEPS/BUNDLE_SIZE_LIMIT/etc.]
```

---

## **Output Structure Template**

The AI should produce a focused document following this structure:

```
# [FEATURE_NAME] Implementation Guide

## 🎯 Executive Summary
- Current state: [1-2 sentences]
- Objective: [1-2 sentences]
- Expected outcome: [1-2 sentences]

## 📋 Implementation Plan

### Step 1: [STEP_NAME] (Day 1)
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Step 2: [STEP_NAME] (Day 2)
- [ ] Task 1
- [ ] Task 2

### Step 3: [STEP_NAME] (Day 3)
- [ ] Task 1
- [ ] Task 2

## 🔧 Code Transformations

### Component 1: [COMPONENT_NAME]
**Before:**
```javascript
// Current code
```

**After:**
```javascript
// Updated code
```

**Changes:**
- Change 1
- Change 2

### Component 2: [COMPONENT_NAME]
[Same structure]

## ✅ Quality Checklist
- [ ] Functionality preserved
- [ ] Responsive design maintained
- [ ] No console errors
- [ ] Visual consistency achieved
- [ ] Performance not degraded

## 📊 Success Metrics
- Visual consistency: 100% compliance with design system
- No functionality regression
- Implementation completed within timeline
```

---

## **Quality Checklist for Minor Features**

Ensure the generated documentation includes:

- [ ] **Focused**: Stays within the minor feature scope
- [ ] **Actionable**: Clear step-by-step instructions
- [ ] **Practical**: Realistic 1-5 day timeline
- [ ] **Specific**: Exact code examples and replacements
- [ ] **Preservative**: Maintains existing functionality
- [ ] **Testable**: Simple verification steps
- [ ] **Visual**: Before/after examples where applicable

---

## **When to Use This Template vs. Comprehensive Template**

### **Use Minor Feature Template for:**
- Styling updates and CSS refactoring
- Component structure improvements
- UI polish and consistency fixes
- Minor functionality additions
- Performance optimizations
- Code organization improvements
- Design system integration
- Accessibility improvements

### **Use Comprehensive Template for:**
- New feature development
- Database schema changes
- New API endpoints
- Complex user flows
- Third-party integrations
- Major architectural changes
- Multi-week implementations

---

## **Example Filled Template**

```
I need to create a focused implementation plan for budgetApp.

**Project Context:**
- Project Type: WEB_APP
- Technology Stack: React + Node.js/Express + SQLite
- Current Phase: Design System Integration Phase

**Minor Feature Request:**
I want to implement Design System Integration for Analytics Components which will standardize styling across SpendingPatternsChart, SavingsRateTracker, and DashboardAnalytics components.

**Current State:**
- KPISummaryCards component is currently implemented with modern design system styling
- SpendingPatternsChart, SavingsRateTracker, and DashboardAnalytics need styling updates from Tailwind to design system classes
- design-system.css with comprehensive glassmorphism styling is available as the target system

**Target Changes:**
1. Replace Tailwind CSS classes with design system equivalents
2. Update component structure to match stat-card pattern from KPISummaryCards
3. Ensure visual consistency and preserve Chart.js functionality

**Requirements:**
- Implementation Timeline: 2-3 days
- Priority Level: HIGH
- Scope: STYLING

[Continue with rest of template...]
```

This template is perfect for your current request and similar minor features, providing focused, actionable guidance without the overhead of comprehensive planning documentation.

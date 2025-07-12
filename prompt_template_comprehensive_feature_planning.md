# Comprehensive Feature Planning & Implementation Prompt Template

## Generic Prompt Structure

Use this template to generate detailed feature plans and implementation documentation for any software project. Simply replace the bracketed placeholders with your specific details.

---

## **Primary Prompt Template**

```
I need to create a comprehensive feature plan and implementation documentation for [PROJECT_NAME]. 

**Project Context:**
- Project Type: [WEB_APP/MOBILE_APP/DESKTOP_APP/etc.]
- Technology Stack: [FRONTEND_TECH] + [BACKEND_TECH] + [DATABASE_TECH]
- Current Phase: [CURRENT_PROJECT_PHASE]
- User Base: [TARGET_USERS]

**Feature Request:**
I want to implement [FEATURE_NAME] which will [FEATURE_OBJECTIVE]. 

**Current State:**
- [EXISTING_RELATED_FEATURES] are already implemented
- [CURRENT_LIMITATIONS] need to be addressed
- [EXISTING_INFRASTRUCTURE] is available to build upon

**Desired Features:**
1. [FEATURE_1_NAME] - [FEATURE_1_DESCRIPTION]
2. [FEATURE_2_NAME] - [FEATURE_2_DESCRIPTION]
3. [FEATURE_3_NAME] - [FEATURE_3_DESCRIPTION]

**Requirements:**
- Implementation Timeline: [DESIRED_TIMELINE]
- Priority Level: [HIGH/MEDIUM/LOW]
- Mobile-First: [YES/NO]
- Integration Requirements: [INTEGRATION_NEEDS]

Please provide:

1. **Update project documentation** ([PROJECT_DOCS_FILE]) to reflect:
   - Current status with completed features marked as ✅
   - New features as current phase with 🔄 status indicators
   - Updated priority sections and timelines

2. **Create two comprehensive planning documents:**
   - High-level feature overview markdown file
   - Detailed technical implementation plan (30-50 pages)

**For the implementation plan, include:**
- Executive Summary with current state analysis
- Feature breakdown with technical specifications
- Database schema changes with SQL
- API endpoints with code examples
- Frontend components with React/[FRONTEND_TECH] code
- Integration strategies with existing codebase
- Implementation timeline (phase-by-phase)
- Database migration strategy
- Testing approach (unit, integration, user acceptance)
- Performance considerations
- Success metrics and KPIs
- Risk mitigation strategies
- Future enhancement roadmap

**Technical Requirements:**
- Provide actual code examples for key components
- Include database schema with proper relationships
- Show API endpoint implementations
- Demonstrate frontend component structure
- Include error handling and edge cases
- Consider mobile responsiveness and UX
- Plan for scalability and performance

**Documentation Style:**
- Use clear section headers and numbering
- Include code blocks with syntax highlighting
- Add implementation timelines with day-by-day breakdown
- Provide realistic effort estimates
- Include success metrics and testing strategies
- Use emojis for visual organization (✅, 🔄, 📊, etc.)
- Create actionable next steps

The output should be production-ready planning documentation that a development team can immediately use to implement the features.
```

---

## **Example Usage**

Here's how to use the template for different types of features:

### **For Analytics Features:**
Replace with:
- `[FEATURE_NAME]`: "Advanced Analytics Dashboard"
- `[FEATURE_OBJECTIVE]`: "provide users with deeper insights into their data patterns and trends"
- `[FEATURE_1_NAME]`: "Real-time Data Visualization"
- `[INTEGRATION_NEEDS]`: "Chart.js integration and existing data APIs"

### **For User Management Features:**
Replace with:
- `[FEATURE_NAME]`: "Advanced User Authentication"
- `[FEATURE_OBJECTIVE]`: "enhance security and user experience with modern auth flows"
- `[FEATURE_1_NAME]`: "OAuth Integration"
- `[INTEGRATION_NEEDS]`: "Third-party auth providers and existing user database"

### **For E-commerce Features:**
Replace with:
- `[FEATURE_NAME]`: "Shopping Cart & Checkout"
- `[FEATURE_OBJECTIVE]`: "enable users to purchase products with a seamless checkout experience"
- `[FEATURE_1_NAME]`: "Product Cart Management"
- `[INTEGRATION_NEEDS]`: "Payment gateway APIs and inventory management"

---

## **Advanced Customization Options**

### **For Complex Features:**
Add these sections to the prompt:
```
**Additional Requirements:**
- Third-party Integrations: [LIST_INTEGRATIONS]
- Security Considerations: [SECURITY_REQUIREMENTS]
- Compliance Needs: [COMPLIANCE_REQUIREMENTS]
- Performance Targets: [PERFORMANCE_METRICS]
- Accessibility Requirements: [A11Y_REQUIREMENTS]
```

### **For Team Planning:**
Add these sections:
```
**Team Context:**
- Team Size: [NUMBER_OF_DEVELOPERS]
- Skill Levels: [JUNIOR/MID/SENIOR_DISTRIBUTION]
- Available Time: [HOURS_PER_WEEK]
- Deadline Constraints: [HARD_DEADLINES]
```

### **For Stakeholder Communication:**
Add these sections:
```
**Stakeholder Requirements:**
- Business Objectives: [BUSINESS_GOALS]
- User Impact: [EXPECTED_USER_BENEFITS]
- Revenue Impact: [EXPECTED_REVENUE_IMPACT]
- Risk Tolerance: [HIGH/MEDIUM/LOW]
```

---

## **Output Structure Template**

The AI should produce documentation following this structure:

```
# [FEATURE_NAME] Implementation Plan

## Executive Summary
- Current state analysis
- Feature objectives
- Expected outcomes

## Feature Breakdown
### Feature 1: [FEATURE_1_NAME]
- Objective
- Technical Implementation
- Database Changes
- API Endpoints
- Frontend Components
- Integration Strategy

### Feature 2: [FEATURE_2_NAME]
[Same structure as Feature 1]

## Implementation Timeline
- Phase 1: [PHASE_1_NAME] (Days 1-X)
- Phase 2: [PHASE_2_NAME] (Days X-Y)
- Phase 3: [PHASE_3_NAME] (Days Y-Z)

## Technical Specifications
- Database Schema
- API Documentation
- Component Architecture
- Integration Points

## Testing Strategy
- Unit Tests
- Integration Tests
- User Acceptance Tests

## Performance Considerations
- Database Optimization
- Frontend Performance
- API Performance

## Success Metrics
- Feature Adoption
- User Engagement
- Technical Metrics

## Risk Mitigation
- Technical Risks
- User Experience Risks
- Timeline Risks

## Future Enhancements
- Phase 2 Additions
- Long-term Vision
```

---

## **Quality Checklist**

Ensure the generated documentation includes:

- [ ] **Actionable**: Each section provides concrete next steps
- [ ] **Detailed**: Code examples and technical specifications
- [ ] **Realistic**: Practical timelines and effort estimates
- [ ] **Comprehensive**: Covers all aspects from database to UI
- [ ] **Maintainable**: Clear structure for future updates
- [ ] **Testable**: Includes testing strategies and success metrics
- [ ] **Scalable**: Considers future growth and enhancements
- [ ] **User-Focused**: Addresses user needs and experience
- [ ] **Performance-Aware**: Includes optimization considerations
- [ ] **Risk-Aware**: Identifies and mitigates potential issues

---

## **Tips for Best Results**

1. **Be Specific**: The more details you provide, the better the output
2. **Include Context**: Share existing codebase patterns and conventions
3. **Set Realistic Scope**: Don't try to plan everything at once
4. **Consider Your Team**: Adjust complexity based on team capabilities
5. **Think Long-term**: Include future enhancement considerations
6. **Focus on Value**: Emphasize user benefits and business objectives

---

## **Example Filled Template**

```
I need to create a comprehensive feature plan and implementation documentation for BudgetApp.

**Project Context:**
- Project Type: WEB_APP
- Technology Stack: React + Node.js/Express + SQLite
- Current Phase: Phase 3 (Advanced Analytics Completed)
- User Base: Couples tracking shared expenses

**Feature Request:**
I want to implement Enhanced Savings Rate Tracking which will provide users with detailed insights into their savings habits and progress toward financial goals.

**Current State:**
- Basic income vs expenses tracking is already implemented
- Monthly spending trends and budget performance visualizations exist
- Chart.js integration and analytics infrastructure is available to build upon

**Desired Features:**
1. Savings Rate Calculation - Calculate and display savings percentage over time
2. Goal Tracking - Allow users to set and track savings goals with milestones
3. Visual Progress Indicators - Show progress bars and milestone achievements

**Requirements:**
- Implementation Timeline: 2 weeks
- Priority Level: HIGH
- Mobile-First: YES
- Integration Requirements: Existing Budget.js analytics section and Chart.js charts

[Continue with the rest of the template...]
```

This template will generate comprehensive planning documentation similar to what was created for your Budget App analytics features, but adaptable to any project or feature set.

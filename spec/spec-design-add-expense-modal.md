---
title: "Design Prompt: A Modern, Conversational Add/Edit Expense Experience"
version: 2.0
date_created: 2025-10-14
last_updated: 2025-10-14
owner: Frontend Team
tags: [design-prompt, ux, ui, component, expense-modal]
---

# 1. Objective

This document outlines a design prompt to completely reimagine the `AddExpenseModal.js` component. The goal is to transform the current utilitarian form into a modern, inviting, and conversational user experience. The new design must adhere to the visual and interaction principles defined in the **Financial Check-up UI Design Specification** (`docs/design_spec_financial_checkup_ui.md`), adapting its card-based, supportive, and action-oriented patterns for the context of adding an expense.

We are moving away from a simple, dense form towards a guided, more intuitive flow that reduces cognitive load and makes expense tracking feel less like a chore.

# 2. Core Concept: "The Guided Expense Entry"

Instead of presenting all fields at once, the new experience will guide the user through a quick, logical, multi-step process within the modal. This approach, known as progressive disclosure, makes the task feel more manageable and conversational.

The flow should be broken down into three logical steps:

1.  **The "What":** Focus on the core of the expense – the amount and description. This is the most critical information and should be captured first with maximum clarity.
2.  **The "How":** Detail the logistics – category, date, and who paid. This step should leverage smart defaults and suggestions.
3.  **The "Split":** Handle the division of the expense. This is often the most complex part and deserves its own focused step.

The modal itself should feel less like a rigid form and more like a series of clean, focused cards or panels that transition smoothly.

# 3. Design & UX Requirements

Apply the design system from `docs/design_spec_financial_checkup_ui.md` to the following areas.

### 3.1. Overall Modal & Layout
- **Container**: The modal should adopt the `Card Anatomy` from the spec. Use a large `24px` corner radius, soft shadows, and generous internal padding (`24px`).
- **Transitions**: Implement the specified `fade/slide in` motion for the modal's appearance. Each step within the modal should also have a subtle transition (e.g., a horizontal slide or a quick fade).
- **Navigation**: A simple progress indicator (e.g., "Step 1 of 3") or subtle dots should be present. Navigation should be handled by "Next" and "Back" buttons styled as `Action Pills`.

### 3.2. Step 1: The "What" (Amount & Description)
- **Amount Input**: This is the hero of this step.
    - Use the `Headline` typography size (`24-32px`, `font-weight: 600`).
    - The input should be large, centered, and feel interactive.
    - The "Quick Add" buttons (`+100`, `+500`) should be styled as `Action Pills` and placed conveniently around the amount input.
- **Description Input**:
    - A clean, simple text input below the amount.
    - Consider incorporating an AI-powered suggestion feature in the future, but for now, focus on a beautiful and simple input field.

### 3.3. Step 2: The "How" (Category, Date, Payer)
- **Category Selection**:
    - Instead of a standard dropdown, display popular or recent categories as a grid of selectable `Impact Chips` or pills. This makes selection faster.
    - Include a "More" or "Search" option that reveals a full list or search input.
- **Date Picker**:
    - Style the native date picker to match the UI theme or use a custom, well-designed calendar component that aligns with the `Calming confidence` principle. Default to today.
- **Payer Selection**:
    - There are only two users, this can be a simple, styled toggle or segmented control.

### 3.4. Step 3: The "Split"
- **Split Type**:
    - Use a prominent, styled segmented control to switch between "Split 50/50", "You Paid in Full", and "Custom Split".
- **Custom Split UI**:
    - Avoid the current, basic number inputs.
    - Design a more visual and intuitive control. This could be a slider with two handles that shows the percentage for each user, or two input fields that are visually linked to show they must sum to 100%.
    - Provide real-time feedback on the calculated amounts for each person as the ratio is adjusted.
    - Changes can be in steps of 5 or 10

### 3.5. Ancillary Features
- **Recent Expenses**:
    - The "Recent Expenses" list should be redesigned. Instead of a plain list, present each recent expense as a mini-card, matching the overall aesthetic.
    - Each mini-card could have a "Copy" or "Use this" button to quickly pre-fill the form, embodying the `Action-oriented` principle.
- **Error Handling & Validation**:
    - Errors should be displayed inline, close to the field that needs correction.
    - Use the `Alerts / reductions` color palette (soft reds) for error messages and input borders, as specified in the design document.
- **Buttons**:
    - All buttons ("Next", "Back", "Save Expense", "Cancel") must be styled as `Action Pills`.
    - The primary action ("Save Expense") should be visually distinct. Use a solid fill with an `emerald` background to signify a positive "win" action.

# 4. Key Principles to Embody

- **Conversational & Supportive**: The language and flow should feel like the app is helping the user, not demanding data. Use placeholder text and labels that are friendly and clear.
- **Data-rich, never overwhelming**: Break down the complex form into simple, digestible steps.
- **Action-oriented**: Make common choices (popular categories, 50/50 split) the easiest to select.
- **Calming confidence**: Use the specified rounded shapes, soft gradients, and gentle shadows to create an inviting and stress-free UI.

# 5. Deliverable

A series of high-fidelity mockups or a detailed interactive prototype demonstrating the complete, multi-step user flow for adding a new expense, from opening the modal to successful submission. The design must explicitly show the application of the "Financial Check-up" design system.
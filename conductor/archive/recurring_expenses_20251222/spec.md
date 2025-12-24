# Specification: Recurring Expenses Management System

## Overview
This track implements a robust system for managing recurring expenses (bills, subscriptions, utilities) for couples. It focuses on the end-of-month workflow where these expenses are reviewed, edited, and prepared for splitting.

## User Stories
- As a user, I want to define recurring expenses with categories, amounts, and split rules.
- As a user, I want to distinguish between shared recurring expenses and personal subscriptions.
- As a user, I want to see a list of upcoming or pending recurring expenses during my monthly reconciliation.
- As a user, I want to easily edit the amount of a recurring utility bill that fluctuates each month.
- As a user, I want these expenses to be automatically factored into the monthly "who owes who" calculation.

## Functional Requirements
- **Backend:**
  - CRUD API for recurring expense templates.
  - Logic to generate actual expense records from recurring templates for a given month.
  - Support for custom split ratios per recurring item.
- **Frontend:**
  - Management interface to create/edit/delete recurring expense templates.
  - Integration with the monthly reconciliation dashboard to "commit" recurring expenses for the current month.
  - Visual differentiation between shared and personal items.

## Technical Constraints
- Must use existing Express backend and SQLite/Knex.
- Frontend components must use shadcn/ui and React Hook Form.
- Adhere to the defined oklch color palette.

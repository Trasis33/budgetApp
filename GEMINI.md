# Project Overview: Budget App

This document serves as a comprehensive guide to the Budget App project, detailing its architecture, key features, and important implementation considerations. It is intended to help maintain context across development sessions and provide a quick reference for anyone working on the project.

## 1. Project Goal

The Budget App is a lightweight web application designed to help couples track expenses, split bills, and manage personal finances efficiently. It aims to replace manual tracking methods (like spreadsheets) with an intuitive, automated system.

## 2. Architecture

The application follows a standard client-server architecture:

*   **Frontend:** Built with **React.js** and styled using **Tailwind CSS** for a mobile-first, responsive user interface.
*   **Backend:** Developed with **Node.js** and **Express.js**, providing RESTful API endpoints for data management.
*   **Database:** Uses **SQLite** for lightweight, file-based data persistence, suitable for small-scale deployments.
*   **Authentication:** Implements **JWT (JSON Web Tokens)** for secure user authentication and authorization.

## 3. Key Features Implemented

### 3.1. User Authentication
*   Login/logout functionality with token storage.
*   Server-side authentication middleware for protected routes.

### 3.2. Expense Management
*   Comprehensive expense entry form with fields for date, amount, category, payer, split type, and description.
*   Full expense listing with filtering capabilities.
*   **Recurring Expenses:**
    *   Management of recurring bill templates (description, default amount, category, payer, split type, split ratios).
    *   Automatic generation of monthly expenses from active recurring templates.
    *   **Update Handling:** Generated expenses are linked to their recurring templates via `recurring_expense_id` and `recurring_template_updated_at`. If a recurring template is updated, the corresponding generated expense for the current month is deleted and re-inserted to reflect the changes. This ensures that manual edits to generated expenses are preserved unless the template itself is modified.
    *   **Duplicate Prevention:** A unique constraint on `(recurring_expense_id, date)` in the `expenses` table prevents duplicate entries for the same recurring expense on the same date.

### 3.3. Bill Splitting Calculator
*   Frontend UI (`client/src/pages/BillSplitter.js`) for selecting month and year.
*   Backend API endpoint (`/api/summary/settle`) to calculate who owes whom based on shared expenses and split types.
*   Supports 50/50, custom ratio, and personal expense splitting.

### 3.4. Monthly Statement Generator
*   Frontend UI (`client/src/pages/MonthlyStatement.js`) to display a detailed financial summary for a selected month.
*   Includes total expenses, category breakdown, and settlement summary.
*   Print functionality for generating a printable version of the statement.
*   The monthly statement data is dynamically calculated and updated, ensuring consistency with the latest expense data.

### 3.5. Budget Tracking & Advanced Analytics
*   **Personal & Household Budgets:** Supports both individual and combined household budget views.
*   **Flexible Income Management:** Allows users to log a primary salary and add multiple other income sources per month.
*   **Dashboard Integration:** Displays a personal budget summary (income, expenses, remaining) on the main dashboard.
*   **Dedicated Budget Page:** A new page at `/budget` allows for detailed household budget management and income entry.
*   **Data Visualizations:** Includes charts for monthly spending by category, income vs. expenses, and budget vs. actual spending, powered by Chart.js.
*   **Enhanced Savings Rate Tracking:** Comprehensive savings analysis with goal tracking, milestone achievements, and trend analysis.
*   **Budget Optimization Tips:** AI-powered recommendations based on spending patterns, seasonal trends, and financial goals.
*   **Revolutionary Trend Strength Analysis:** 
    - Normalized strength calculation (0-100% relative to average spending)
    - Categorical classification (minimal, weak, moderate, strong, very_strong)
    - Confidence scoring based on data consistency and volatility
    - Detailed metrics including percentage change, monthly change, and volatility
    - Color-coded visual indicators with human-readable descriptions

## 4. Database Schema Highlights

*   **`users`**: Stores user authentication details.
*   **`categories`**: Predefined expense categories.
*   **`budgets`**: Stores monthly budget targets for each category.
    *   `category_id`: Foreign key linking to `categories`.
    *   `amount`: The budgeted amount for the category.
    *   `month`, `year`: The month and year the budget applies to.
    *   `unique(['category_id', 'month', 'year'])`: Constraint to ensure only one budget per category per month/year.
*   **`recurring_expenses`**: Stores templates for recurring bills.
    *   `default_amount`: The default amount for the recurring expense.
    *   `split_type`: Defines how the expense is split ('50/50', 'custom', 'personal').
    *   `split_ratio_user1`, `split_ratio_user2`: Ratios for custom splits.
*   **`expenses`**: Stores individual expense entries.
    *   `recurring_expense_id`: Foreign key linking to `recurring_expenses` for generated entries.
    *   `recurring_template_updated_at`: Timestamp from the recurring template's `updated_at` field, used for update detection.
    *   `date`: Stored as `YYYY-MM-DD` string for consistent comparison.
    *   `unique(['recurring_expense_id', 'date'])`: Constraint to prevent duplicate generated expenses.
*   **`monthly_statements`**: Stores calculated monthly summaries.
    *   `unique(['month', 'year'])`: Constraint to ensure only one statement per month/year.
*   **`incomes`**: Stores user income entries.
    *   `source`: The source of the income (e.g., 'Primary Salary', 'Freelance').
    *   `amount`: The amount of income.
    *   `date`: The date the income was received.
    *   `user_id`: Foreign key linking to the `users` table.
*   **`savings_goals`**: Stores user savings goals and targets.
    *   `goal_name`: The name/description of the savings goal.
    *   `target_amount`: The target amount to save.
    *   `current_amount`: The current progress toward the goal.
    *   `target_date`: Optional target date for achieving the goal.
    *   `category`: Goal category (e.g., 'emergency', 'vacation', 'house').
*   **`budget_optimization_tips`**: Stores AI-generated budget optimization recommendations.
    *   `tip_type`: Type of recommendation ('reduction', 'reallocation', 'seasonal', 'goal_based').
    *   `category`: Affected expense category.
    *   `title`: Short title for the recommendation.
    *   `description`: Detailed description of the recommendation.
    *   `impact_amount`: Potential savings amount.
    *   `confidence_score`: AI confidence level (0-1) in the recommendation.
    *   `is_dismissed`: Whether the user has dismissed the tip.
    *   `expires_at`: When the tip expires and should be removed.

## 5. Development Workflow & Considerations

*   **Starting the App:** Use `npm run dev` from the project root to start both the client and server.
*   **Database Reset:** If schema changes are made to `server/db/setup.js`, you must delete the `server/db/expense_tracker.sqlite` file to force a recreation of the database with the new schema.
*   **Debugging Duplicates:** If recurring expense duplicates persist, check the server console for `console.log` outputs from `generateRecurringExpenses.js` to inspect date formats and `updated_at` timestamps.
*   **Frontend/Backend Consistency:** Ensure that field names and data types are consistent between frontend components (e.g., `client/src/pages/Recurring.js`) and backend API endpoints (e.g., `server/routes/recurringExpenses.js`).

## 6. Future Enhancements (from `wip.md`)

*   Basic reporting (monthly summary reports, running total of balances).
*   Settings customization (default split ratios, personal details management).
*   Data visualizations with Chart.js.
*   Export functionality to CSV/PDF.
*   UI polish and mobile optimization.
*   Final security review.
*   Deployment (Docker containerization, HTTPS, database backup, deployment to Raspberry Pi or cloud service).

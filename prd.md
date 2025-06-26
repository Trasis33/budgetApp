Overview

A lightweight web app that helps couples track expenses, split bills, and keep an eye on personal finances. This replaces our current Numbers document and gives both of us an
easy way to input and track our financial data.


Goals

 • Create a user-friendly interface for expense tracking
 • Automate calculations for bill splitting
 • Provide financial overview and reports
 • Keep our data secure and private
 • Keep the app lightweight and easy to maintain


Target Users

 • You and me
 • Maybe other couples down the road if they're interested


Key Features

1. User Authentication

 • Simple login for both of us
 • No complicated registration since it's just for us

2. Expense Entry

 • Form to add new expenses with fields:
    • Date (optional; defaults to current month)
    • Amount (in SEK)
    • Category
    • Paid by (you/me)
    • Split type (50/50, custom ratio, personal)
    • Description/notes

3. Bill Splitting Calculator

 • Auto-calculation each month of who owes who
 • Running total of what's outstanding
 • Settlement suggestions
 • Selection interface for monthly bills paid by each of us
 • Calculation of total monthly bills + split expenses (food, kids clothes, etc.)

4. Budget Tracking

 • Salary input and tracking
 • Calculation of what's left after expenses
 • Monthly spending breakdown by category

5. Reports & Visualization

 • Monthly summary reports
 • Simple charts showing spending patterns
 • Export to CSV/PDF

6. Settings

 • Customize categories
 • Set default split ratios
 • Update personal details


Technical Specifications

Recommended Tech Stack

Frontend

 • React.js - lightweight, component-based, large ecosystem
 • Tailwind CSS - utility-first CSS framework for simple styling
 • Chart.js - for simple visualizations

Backend

 • Node.js with Express - JavaScript across the stack
 • SQLite - lightweight database requiring minimal setup, suitable for small applications

Deployment

 • Docker - containerization for easy deployment
 • Raspberry Pi (home server) or Netlify/Vercel (hosting)

Data Model

 1 Users
    • id, name, email, password (hashed)
 2 Expenses
    • id, date, amount, category_id, paid_by_user_id, split_ratio, description
 3 Categories
    • id, name, icon
 4 MonthlyStatement
    • id, month, year, user1_owes_user2, remaining_budget_user1, remaining_budget_user2

Security Considerations

 • HTTPS for secure data transfer
 • Environment variables for secrets
 • Regular backups of the database


Implementation Phases

Phase 1: MVP (2-3 weeks)

 • Basic authentication
 • Expense entry and listing
 • Simple bill splitting calculation

Phase 2: Enhanced Features (2-3 weeks)

 • Budget tracking
 • Basic reporting
 • Settings customization

Phase 3: Refinement (1-2 weeks)

 • Visualizations
 • Export functionality
 • UI polish


Success Metrics

 • Both of us regularly using the system
 • Less time spent on manual calculations
 • Better visibility into our finances


Open Questions and Answers

Q: Would you prefer mobile-first design or desktop-focused?
A: Let's go with mobile-first. The app should make data entry as easy or easier than filling a Numbers table.

Q: Are there specific algorithms from your Numbers document that need to be preserved exactly?
A: Yes, we need to keep the ability to select which monthly bills were paid by each of us and calculate the total of those bills plus the split expenses (food, kids clothes, etc.).

Q: Do you need data migration from the existing Numbers document?
A: No data migration needed right now.

Q: Any specific categories you'd like pre-configured?
A: Yes, let's start with these 10 standard categories:
 1. Groceries
 2. Kids Clothes
 3. Mortgage
 4. Utilities
 5. Transportation
 6. Dining Out
 7. Entertainment
 8. Healthcare
 9. Household Items
 10. Miscellaneous

Design Considerations

 • Mobile-first design for easy data entry on the go
 • Simple, intuitive interface that doesn't need a manual
 • Data entry flow should be faster than using Numbers
 • Focus on making monthly bill selection and splitting calculations straightforward

This tech stack works well because:

 1 It's lightweight and can run on minimal hardware
 2 JavaScript throughout makes maintenance easier
 3 React provides a responsive UI that works well on all devices
 4 SQLite requires minimal configuration but provides proper data persistence
 5 Docker makes deployment and updates straightforward

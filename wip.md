# Budget App Implementation

A lightweight web app that helps couples track expenses, split bills, and keep an eye on personal finances. This replaces our current Numbers document and gives both of us an easy way to input and track our financial data.

## Completed Tasks

### Project Setup and Infrastructure
- [x] Git repository established
- [x] Basic project structure created (React frontend, Node.js backend)
- [x] SQLite database configuration started

### Authentication System
- [x] User authentication context implemented
- [x] Login/logout functionality with token storage
- [x] Authentication middleware on server-side
- [x] Protected route handling

### Frontend Foundation
- [x] Basic layout components (Layout, Sidebar)
- [x] Initial responsive design
- [x] Basic routing structure
- [x] Complete expense entry form with all required fields
- [x] Implement full expense listing with filtering functionality

### Dashboard
- [x] Monthly summary data structure (UI & backend integration)
- [x] Recent expenses listing
- [x] Currency formatting utility
- [x] Fix database schema (add `split_ratio`, `user1_owes_user2`, `remaining_budget_user1`, `remaining_budget_user2`)
- [x] Seed all 10 predefined categories in `server/db/setup.js`
- [x] Extract reusable currency formatting utility (`src/utils/formatCurrency.js`) and refactor existing usage

### Recurring Bills Feature
- [x] Implement recurring bills feature (frontend and backend setup, including auth middleware re-addition and `amount` column correction) ([see plan](./recurring-bills-feature.md))
- [x] Implement recurring expense generation logic with update handling and unique constraint enforcement.

### Bill Splitting Calculator
- [x] Build bill splitting calculator functionality (frontend UI and backend API) ([see plan](./bill-splitting-calculator.md))

### Monthly Statement Generator
- [x] Create monthly statement generator UI with print functionality.

## In Progress Tasks



## Future Tasks

### Phase 2: Enhanced Features
- [x] Budget tracking
  - [x] Salary input and tracking
  - [x] Remaining budget calculations
  - [ ] Monthly spending breakdown by category
- [ ] Basic reporting
  - [ ] Monthly summary reports
  - [ ] Running total of balances
- [ ] Settings customization
  - [ ] Default split ratios
  - [ ] Personal details management
- [ ] Category management (10 predefined categories)

### Phase 3: Refinement
- [ ] Data visualizations with Chart.js
- [ ] Export functionality to CSV/PDF
- [ ] UI polish and mobile optimization
- [ ] Final security review

### Deployment
- [ ] Docker containerization
- [ ] HTTPS configuration
- [ ] Database backup solution
- [ ] Deployment to Raspberry Pi or cloud service

## Implementation Plan

### Architecture Overview
The app follows a React frontend + Node.js/Express backend architecture with SQLite database. Key technical decisions:

- **Frontend**: React.js with Tailwind CSS for mobile-first responsive design
- **Backend**: Node.js with Express for API endpoints
- **Database**: SQLite for lightweight, minimal-setup data persistence
- **Authentication**: JWT-based authentication with secure token storage

### Data Flow
1. **Expense Entry**: Users input expenses through React forms → API validates and stores in SQLite
2. **Bill Splitting**: Algorithm calculates who owes whom based on split ratios and monthly bills
3. **Monthly Statements**: Automated generation of monthly summaries with balance calculations

### Key Components Needed
- Expense form with fields: date, amount, category, paid by, split type, description
- Bill splitting calculator with monthly bill selection interface
- Monthly statement generator for balance tracking
- Budget tracking with salary input and remaining budget calculations

### Technical Requirements
- Mobile-first design for easy data entry
- 10 predefined categories: Groceries, Kids Clothes, Mortgage, Utilities, Transportation, Dining Out, Entertainment, Healthcare, Household Items, Miscellaneous
- Environment variables for security
- Regular database backups

## Relevant Files

### Backend Files
- `server/` - Node.js backend directory
- `server/db/` - SQLite database configuration ✅
- `server/routes/expenses.js` - Expense CRUD endpoints ✅
- `server/routes/categories.js` - Category CRUD endpoints ✅
- `server/routes/summary.js` - Monthly summary & balances ✅

### Frontend Files  
- `client/src/` - React frontend source directory ✅
- `client/src/components/layout/Layout.js` - Main layout component ✅
- `client/src/components/layout/Sidebar.js` - Navigation sidebar ✅
- `client/src/context/AuthContext.js` - Authentication context ✅
- `client/src/utils/formatCurrency.js` - Currency formatting utility (to be created)

### Configuration Files
- `package.json` - Project dependencies ✅
- Project root structure established ✅

### Files to be Created/Modified
- `client/src/components/ExpenseForm.js` - Complete expense entry form
- `client/src/components/ExpenseList.js` - Full expense listing with filtering
- `client/src/components/BillSplitter.js` - Bill splitting calculator
- `client/src/components/MonthlyStatement.js` - Monthly statement generator
- `server/db/setup.js` - Database schema & seed adjustments
- `server/routes/statements.js` - Monthly statement API endpoints

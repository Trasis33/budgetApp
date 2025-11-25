# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CouplesFlow** is a full-stack web application designed for couples to track shared expenses, split bills, and manage personal finances together. The app features a React frontend with a Node.js/Express backend and SQLite database.

### Key Features
- **Expense Tracking**: Mobile-first data entry with categories and split ratios
- **Bill Splitting**: Automated calculations (50/50, custom ratios, personal, bill payer)
- **Recurring Bills**: Template-based monthly expense generation
- **Budget Management**: Category-based budgeting with performance tracking
- **Analytics Dashboard**: Interactive charts and spending pattern analysis using Recharts and shadcn-ui
- **Savings Goals**: Track and visualize financial goals with color-coded progress
- **Settlement Calculator**: Automated "who owes whom" calculations
- **Couple-Centric**: Partner-aware interface with shared dashboards

### Technology Stack
- **Frontend**: React 18.3.1 + TypeScript 5.9+, React Router DOM 7.9+, Vite 6.3+, Tailwind CSS 4.1+, shadcn-ui (Radix UI) + Recharts 2.15+
- **Backend**: Node.js + Express 4.18.2, SQLite + Knex.js 2.4.2, JWT + bcryptjs authentication
- **State Management**: React Context API
- **UI Libraries**: shadcn/ui components, Lucide React icons, React Hook Form 7.55+

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation & Development

```bash
# Install all dependencies (root + client-v2)
npm run setup

# Start both client and server in development
npm run dev

# Or run individually
npm run dev:client  # Client on http://localhost:3001
npm run dev:server  # Server on http://localhost:5001

# Production build
npm run build

# Start production server
npm start

# Run tests
npm test  # Server tests (Jest)
cd client-v2 && npm test  # Client tests (Jest + React Testing Library + TypeScript)

# Database migrations
npm run migrate
```

### Environment Configuration

Create `.env` in the root directory:

```env
PORT=5001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
```

## Project Structure

```
budgetApp/
├── client-v2/                   # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── components/          # React components (.tsx)
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── budget/         # Budget-specific components
│   │   │   ├── shared/         # Shared utilities
│   │   │   └── ...             # Page-level components
│   │   ├── lib/                # Utility functions (.ts)
│   │   ├── hooks/              # Custom React hooks (.ts)
│   │   ├── api/                # API layer
│   │   │   ├── axios.ts        # Axios instance
│   │   │   └── services/       # API service modules
│   │   ├── context/            # React Context providers (.tsx)
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ScopeContext.tsx
│   │   │   └── ...
│   │   ├── types/              # TypeScript type definitions
│   │   ├── styles/             # CSS modules
│   │   └── __tests__/          # Test files
│   ├── index.html              # Vite entry point
│   ├── vite.config.ts          # Vite configuration
│   ├── tsconfig.json           # TypeScript configuration
│   └── tailwind.config.js      # Tailwind configuration
├── server/                     # Node.js/Express backend
│   ├── routes/                # API route handlers
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── categories.js
│   │   ├── budgets.js
│   │   ├── analytics.js
│   │   ├── savings.js
│   │   ├── couple.js          # Couples-specific routes
│   │   └── ...
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── db/                    # Database layer
│   │   ├── migrations/        # Knex migrations
│   │   ├── database.js        # DB connection
│   │   └── knexfile.js        # Knex configuration
│   ├── utils/                 # Server utilities
│   │   ├── budgetOptimizer.js
│   │   ├── scopeUtils.js
│   │   └── generateRecurringExpenses.js
│   └── index.js               # Express server entry
├── docs/                      # Project documentation
├── .superdesign/             # Design system files
│   └── design_iterations/    # UI design iterations
└── specs/                    # Feature specifications
```

## Backend Architecture

### API Routes

All API routes are mounted under `/api` and require JWT authentication (except auth endpoints).

**Base URL**: `http://localhost:5001/api`

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/user` - Get current user
- `GET /auth/users` - List all users (for couple setup)
- `POST /auth/invite-partner` - Invite partner to link accounts
- `PUT /auth/profile` - Update profile

#### Expenses
- `GET /expenses` - List expenses (with category and payer names)
- `GET /expenses/recent` - Last 5 expenses
- `GET /expenses/:id` - Get expense by ID
- `POST /expenses` - Create expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

**Expense Split Types**: `50/50`, `custom`, `personal`, `bill`

#### Categories
- `GET /categories` - List all categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

#### Budgets
- `GET /budgets?month=MM&year=YYYY` - List budgets for a specific month/year with category names
- `POST /budgets` - Create/update budget (upsert)
- `DELETE /budgets/:id` - Delete a budget by id
- `GET /budgets/available-categories?month=MM&year=YYYY` - Categories without budgets for specified period
- `GET /budgets/summary/:month/:year` - Detailed budget summary with spending, progress, and status for all categories
- `GET /budgets/test` - Test database connection (dev endpoint)

#### Recurring Expenses
- `GET /recurring-expenses` - List active templates
- `POST /recurring-expenses` - Create template
- `PUT /recurring-expenses/:id` - Update template
- `DELETE /recurring-expenses/:id` - Soft delete

#### Analytics
- `GET /analytics/trends/:startDate/:endDate` - Monthly spending trends
- `GET /analytics/category-trends/:startDate/:endDate` - Category breakdown analysis
- `GET /analytics/income-expenses/:startDate/:endDate` - Income vs expenses
- `GET /analytics/savings-analysis/:startDate/:endDate` - Savings rate analysis
- `GET /analytics/current-settlement` - Current month settlement

#### Savings Goals
- `GET /savings/goals` - List user's savings goals
- `POST /savings/goals` - Create savings goal
- `PUT /savings/goals/:id` - Update goal
- `DELETE /savings/goals/:id` - Delete goal
- `GET /savings/rate/:startDate/:endDate` - Savings rate over period

#### Optimization Tips
- `GET /optimization/analyze` - Generate spending optimization analysis
- `GET /optimization/tips` - List active tips
- `POST /optimization/tips/:id/dismiss` - Dismiss tip
- `PUT /optimization/tips/:id` - Update tip

### Database

The application uses **SQLite** with Knex.js for migrations and queries.

**Database location**: `server/db/expense_tracker.sqlite`

**Key tables**:
- `users` - User accounts (includes `partner_id` for couples)
- `expenses` - Individual expense records
- `categories` - Expense categories
- `budgets` - Monthly budgets per category
- `recurring_expenses` - Templates for recurring expenses
- `savings_goals` - User savings goals (includes `is_pinned`, `color_index`)
- `optimization_tips` - AI-generated spending tips

### Database Migrations

```bash
# Run migrations
npx knex migrate:latest --knexfile server/db/knexfile.js

# Create migration
npx knex migrate:make migration_name --knexfile server/db/knexfile.js

# Rollback
npx knex migrate:rollback --knexfile server/db/knexfile.js
```

## Frontend Architecture

### State Management

- **AuthContext**: Manages user authentication state and JWT tokens (`client-v2/src/context/AuthContext.tsx`)
- **ScopeContext**: Multi-user scope selection for filtering data (`client-v2/src/context/ScopeContext.tsx`)
- **Local State**: useState/useReducer for component-level state
- **Custom Hooks**: Reusable stateful logic (located in `client-v2/src/hooks/`)
  - `useBudgetData.ts`: Budget data fetching and management
  - `useBudgetCalculations.ts`: Budget calculations and metrics

### UI Components

- **shadcn/ui**: Primary component library (Radix UI primitives + Tailwind) located in `client-v2/src/components/ui/`
- **Recharts**: Data visualization library for charts and analytics
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form validation and management

### Styling

- **Tailwind CSS**: Primary styling approach with v4.1+ configuration
- **CSS Modules**: Located in `client-v2/src/styles/` for component-specific styles
- **Global Styles**: `client-v2/src/index.css` for global styles and custom components
- **Color System**: Color utilities in `client-v2/src/lib/` directory (TypeScript modules)
  - Consistent color schemes for cards, progress bars, and UI elements
  - Design system follows the palette defined in project documentation

### Key Components

- **Dashboard** (`client-v2/src/components/Dashboard.tsx`): Overview of finances, recent expenses, budgets
- **BudgetManager** (`client-v2/src/components/BudgetManager.tsx`): Comprehensive budget management interface
- **Analytics** (`client-v2/src/components/Analytics.tsx`): Charts and spending analysis
- **ExpenseForm** (`client-v2/src/components/ExpenseForm.tsx`): Mobile-first expense entry
- **ExpenseList** (`client-v2/src/components/ExpenseList.tsx`): Expense list with filtering
- **Budget Components** (`client-v2/src/components/budget/`): Modular budget UI components
  - `BudgetTable.tsx`: Budget category table
  - `BudgetMetricsGrid.tsx`: Budget performance metrics
  - `BudgetProgressBar.tsx`: Visual progress indicators

## Coding Conventions

### Backend (Node.js/Express)
- **File naming**: camelCase for route files (plural: `expenses.js`, `categories.js`)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Async/await**: Preferred over callbacks
- **Error handling**: Try-catch blocks, meaningful error messages

### Frontend (React + TypeScript)
- **File naming**: PascalCase for components (`BudgetManager.tsx`), camelCase for utilities (`useBudgetData.ts`)
- **File extensions**: `.tsx` for components with JSX, `.ts` for utilities and types
- **Indentation**: 2 spaces
- **TypeScript**: Strict mode enabled, full type coverage required
- **Components**: Functional components with hooks (no class components)
- **Styling**: Tailwind utility classes preferred
- **Type definitions**: Located in `client-v2/src/types/` directory

### Database
- **Migrations**: Use descriptive names with timestamps (e.g., `20250904_add_savings_contributions.js`)
- **Column naming**: snake_case
- **Foreign keys**: Explicitly defined with `references()` in migrations

## Couples-Specific Features

The app is designed for exactly **2 users per installation** (couples).

### Key Concepts

1. **Partner System**: Users are linked via `partner_id` field
2. **Split Types**:
   - `50/50`: Equal split (default for shared expenses)
   - `custom`: Custom ratio based on income or agreement
   - `personal`: 100% to one partner
   - `bill`: One partner pays, split calculated automatically

3. **Settlement**: Monthly calculation of who owes whom based on shared expenses

4. **Shared Goals**: Savings goals visible to both partners with pinning and color coordination

### Example Settlement Calculation

```javascript
// GET /api/summary/settle?month=09&year=2025
{
  "settlement": {
    "amount": "450.00",
    "creditor": "Anna",
    "debtor": "Fredrik",
    "message": "Fredrik owes Anna 450.00 SEK"
  },
  "totalSharedExpenses": "12000.00"
}
```

## Design System & Colors

The project uses a modern design system built on **shadcn/ui** components with **Tailwind CSS v4** and **oklch color space**. All styles are defined in `client-v2/src/styles/globals.css`.

### Color System

Colors use **oklch format** for perceptual uniformity and are defined as CSS custom properties:

**Core Colors:**
- `--background`: `#ffffff` (light) / `oklch(0.145 0 0)` (dark)
- `--foreground`: `oklch(0.145 0 0)` (light text)
- `--primary`: `#030213` (near-black primary)
- `--muted`: `#ececf0` (subtle backgrounds)
- `--muted-foreground`: `#717182` (secondary text)
- `--border`: `rgba(0, 0, 0, 0.1)` (subtle borders)
- `--destructive`: `#d4183d` (errors/delete actions)

**Theme Accent Colors:**
- `--theme-amber`, `--theme-teal`, `--theme-indigo`, `--theme-yellow`
- `--theme-golden`, `--theme-coral`, `--theme-violet`, `--theme-cyan`
- `--theme-periwinkle`, `--theme-mint`

All colors have dark mode variants defined in the `.dark` class.

### Component Patterns

**shadcn/ui components** located in `client-v2/src/components/ui/`:

**Buttons:**
```tsx
<Button variant="ghost">Cancel</Button>
<Button>Save</Button>
<Button variant="destructive">Delete</Button>
```

**Cards:**
```tsx
<Card>
  <CardHeader><CardTitle>Title</CardTitle></CardHeader>
  <CardContent>{/* content */}</CardContent>
</Card>
```

**Dialogs:**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

**Icons:** Lucide React with standard sizes (`h-4 w-4` or `h-5 w-5`)

**Notifications:** Sonner toast library
```tsx
import { toast } from 'sonner';
toast.success('Success message');
toast.error('Error message');
```

### Typography

- Font sizes: `--font-size-xs` through `--font-size-2xl` (12px-24px)
- Font weights: normal (400), medium (500), semibold (600), bold (700)
- All elements have consistent 1.5 line-height

### Layout & Spacing

- Spacing scale: `--spacing-1` through `--spacing-64`
- Standard padding: `p-6` (1.5rem)
- Standard gap: `space-y-6`, `gap-3`
- Border radius: `--radius` (0.625rem/10px)

### Responsive Design

- **Mobile-first**: Tailwind breakpoints start from mobile (`sm:`, `md:`, `lg:`)
- **Touch-friendly**: Button sizes and touch targets optimized for mobile
- **Flexible layouts**: Flexbox and Grid for responsive structures
- **Dark mode**: Full support with automatic contrast adjustment

### Implementation Guidelines

1. Use shadcn/ui components from `client-v2/src/components/ui/`
2. Use CSS custom properties instead of hard-coded colors
3. Apply Tailwind utility classes for spacing and layout
4. Follow patterns in `client-v2/src/components/BudgetManager.tsx`
5. Use toast notifications for user feedback

Refer to `client-v2/src/styles/globals.css` for complete design tokens and `client-v2/src/components/BudgetManager.tsx` for component usage examples.

## Testing

### Backend Testing
- **Framework**: Jest
- **Location**: `server/test_*.js`
- **Example**: `server/test_sek_currency.js`, `server/test_enhanced_trend.js`
- **Run**: `npm test`

### Frontend Testing
- **Framework**: Jest + React Testing Library + TypeScript
- **Location**: `client-v2/src/**/__tests__/*.test.tsx` or `*.test.ts`
- **Example**: `client-v2/src/components/budget/__tests__/BudgetProgressBar.test.tsx`
- **Run**: `cd client-v2 && npm test` (watch mode)
- **Commands**: 
  - `npm run test:watch` - Explicit watch mode
  - `npm run test:coverage` - Generate coverage report

### API Testing with Jest

Example test for analytics endpoint:

```javascript
const request = require('supertest');
const app = require('../index');

describe('Analytics API', () => {
  it('should return spending trends', async () => {
    const response = await request(app)
      .get('/api/analytics/trends/2025-07-01/2025-08-31')
      .set('x-auth-token', validToken);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('monthlyTotals');
  });
});
```

## Common Development Tasks

### Adding a New API Endpoint

1. Create route file in `server/routes/` (e.g., `server/routes/newFeature.js`)
2. Export router with routes
3. Register in `server/index.js`:
   ```javascript
   app.use('/api/newFeature', auth, require('./routes/newFeature'));
   ```
4. Add to `AGENTS.md` documentation

### Adding a New Component

1. Create file in `client-v2/src/components/` (PascalCase with `.tsx` extension)
2. Define TypeScript interfaces for props in the component file or `client-v2/src/types/`
3. Import from `shadcn/ui` when possible (from `client-v2/src/components/ui/`)
4. Use Tailwind for styling
5. Add to relevant page or component
6. Create test file in `__tests__/` directory if applicable

### Adding a Database Migration

1. Create migration:
   ```bash
   npx knex migrate:make add_new_field --knexfile server/db/knexfile.js
   ```
2. Edit migration file with `exports.up` and `exports.down`
3. Run migration:
   ```bash
   npm run migrate
   ```

### Adding a New Page

1. Create component in `client-v2/src/components/` (PascalCase with `.tsx` extension)
2. Add route in `client-v2/src/App.tsx`:
   ```typescript
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add navigation link in `client-v2/src/components/Navigation.tsx`
4. Create any necessary API services in `client-v2/src/api/services/`

## Authentication Flow

1. User registers/logs in via `POST /api/auth/login`
2. Server returns JWT token
3. Client stores token in localStorage (via AuthContext)
4. Token sent in `x-auth-token` header for authenticated requests
5. Middleware validates token on protected routes

## Environment-Specific Configuration

### Development
- Client: Vite dev server on port 3001 (with hot module replacement)
- Server: Express on port 5001
- Database: `server/db/expense_tracker.sqlite`

### Production
- Client: Built static files served by Express (optimized by Vite)
- Server: Serves client build from `../client-v2/build`
- Database: Same SQLite file

## Cursor Rules Integration

This project includes Cursor AI editor rules in `.cursor/rules/`:

- **design.mdc**: Comprehensive frontend design guidelines including workflow, styling (Flowbite, oklch colors), and component patterns
- **extract-design.mdc**: Instructions for extracting design systems from images
- **multiple-ui.mdc**: Generate multiple UI versions for comparison
- **infinite-design.mdc**: Create variations of existing designs

When working with design tasks, Claude should follow these rules for consistency.

## Troubleshooting

### Database Issues
- Reset: Delete `server/db/expense_tracker.sqlite` and run `npm run migrate`
- View data: Use SQLite browser or `sqlite3` CLI
- Check migrations: `npx knex migrate:status --knexfile server/db/knexfile.js`

### Port Already in Use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change port in .env
PORT=5002
```

### Client Build Issues
```bash
cd client-v2
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Server Won't Start
- Check `.env` exists with required variables
- Verify PORT is available
- Check database permissions
- Review error logs in console

## Currency Handling

The app is configured for **Swedish Krona (SEK)**:
- Default currency symbol: "kr"
- Locale: sv-SE
- Formatting: `new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' })`

## Performance Considerations

1. **Client**: React.memo for expensive components, lazy loading for routes
2. **Server**: Pagination for large expense lists, database indexing
3. **Database**: Indexed on frequently queried columns (date, user_id, category_id)

## Security Best Practices

1. **JWT Secrets**: Never commit to git, use strong secrets
2. **Passwords**: bcryptjs hashing before storage
3. **SQL Injection**: Use Knex query builder, parameterized queries
4. **XSS**: Sanitize user input, use React's built-in escaping
5. **CORS**: Configured for development (port 3001)

## Future Enhancements (From Specification)

The `COUPLES_BUDGET_SPECIFICATION.md` outlines planned features:

- **Expense Approval Workflows**: Large purchases requiring partner approval
- **Enhanced Partner Features**: Budget change notifications, approval prompts
- **Communication Tools**: Expense comments, monthly review workflow
- **Privacy Controls**: Permission-based visibility of personal expenses

## Useful Scripts

```bash
# Database
npm run migrate              # Run Knex migrations
npx knex migrate:latest --knexfile server/db/knexfile.js

# Development
npm run dev                  # Start both client and server
npm run dev:client          # Client only
npm run dev:server         # Server only

# Production
npm run build              # Build client
npm start                 # Start production server

# Testing
npm test                    # Server tests
cd client-v2 && npm test   # Client tests
```

## Key Files Reference

- **README.md**: Project overview and setup instructions
- **package.json**: Scripts and dependencies
- **AGENTS.md**: Comprehensive API documentation and development guidelines
- **COUPLES_BUDGET_SPECIFICATION.md**: Product requirements and couple-focused features
- **GEMINI.md**: Alternative project overview for AI assistants
- **client-v2/src/lib/**: Utility functions and color system implementation
- **client-v2/src/types/**: TypeScript type definitions
- **server/db/knexfile.js**: Database configuration
- **server/index.js**: Express server setup and route registration

## Notes for Claude Code

1. **Always use tools**: Never output messages about tool calls - use the actual tools
2. **Design tasks**: Follow `.cursor/rules/design.mdc` for UI work
3. **Code style**: Match existing patterns (2-space indent, single quotes, etc.)
4. **Tests**: Add tests for new features, especially utilities and API endpoints
5. **Documentation**: Update relevant files (AGENTS.md, code comments) when adding features
6. **Database changes**: Create migrations, never modify SQLite directly
7. **Couples context**: Remember this is for exactly 2 users, design features accordingly


<!-- CLAVIX:START -->
## Clavix Integration

This project uses Clavix for prompt improvement and PRD generation. The following slash commands are available:

### /clavix:fast [prompt]
Quick prompt improvements with smart triage. Clavix will analyze your prompt and recommend deep analysis if needed. Perfect for making "shitty prompts good" quickly.

### /clavix:deep [prompt]
Comprehensive prompt analysis with alternative phrasings, edge cases, implementation examples, and potential issues. Use for complex requirements or when you want thorough exploration.

### /clavix:prd
Launch the PRD generation workflow. Clavix will guide you through strategic questions and generate both a comprehensive PRD and a quick-reference version optimized for AI consumption.

### /clavix:start
Enter conversational mode for iterative prompt development. Discuss your requirements naturally, and later use `/clavix:summarize` to extract an optimized prompt.

### /clavix:summarize
Analyze the current conversation and extract key requirements into a structured prompt and mini-PRD.

**When to use which mode:**
- **Fast mode** (`/clavix:fast`): Quick cleanup for simple prompts
- **Deep mode** (`/clavix:deep`): Comprehensive analysis for complex requirements
- **PRD mode** (`/clavix:prd`): Strategic planning with architecture and business impact

**Pro tip**: Start complex features with `/clavix:prd` or `/clavix:start` to ensure clear requirements before implementation.
<!-- CLAVIX:END -->

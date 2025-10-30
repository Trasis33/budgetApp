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
- **Frontend**: React 18.2.0, React Router DOM 6.14.1, Tailwind CSS 3.3.2, shadcn-ui + Recharts (migrating from Chart.js)
- **Backend**: Node.js + Express 4.18.2, SQLite + Knex.js 2.4.2, JWT + bcryptjs authentication
- **State Management**: React Context API
- **UI Libraries**: Flowbite React, Radix UI components, Lucide React icons

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation & Development

```bash
# Install all dependencies (root + client)
npm run setup

# Start both client and server in development
npm run dev

# Or run individually
npm run dev:client  # Client on http://localhost:3000
npm run dev:server  # Server on http://localhost:5001

# Production build
npm run build

# Start production server
npm start

# Run tests
npm test  # Server tests (Jest)
cd client && npm test  # Client tests (React Testing Library)

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
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/             # shadcn-ui components
│   │   │   ├── charts/         # Recharts components
│   │   │   └── ...
│   │   ├── pages/              # Route-level components
│   │   │   ├── Dashboard.js
│   │   │   ├── Expenses.js
│   │   │   ├── Analytics.js
│   │   │   └── ...
│   │   ├── context/            # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   └── ...
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Helper functions
│   │   │   ├── goalColorPalette.js  # Shared color schemes
│   │   │   └── ...
│   │   ├── api/                # API client
│   │   │   └── axios.js
│   │   ├── config/             # Configuration files
│   │   └── styles/             # Global styles
│   └── public/                 # Static assets
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
- `POST /budgets` - Create/update budget (upsert)

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

- **AuthContext**: Manages user authentication state and JWT tokens
- **Local State**: useState/useReducer for component-level state
- **Custom Hooks**: Reusable stateful logic (located in `client/src/hooks/`)

### UI Components

- **shadcn-ui**: Primary component library (Radix UI + Tailwind)
- **Recharts**: Data visualization library
- **Flowbite React**: Additional UI components and modals
- **Lucide React**: Icon library

### Styling

- **Tailwind CSS**: Primary styling approach
- **Custom CSS**: `client/src/index.css` for global styles and custom components
- **Color System**: Shared palette via `client/src/utils/goalColorPalette.js`
  - Use `getGoalColorScheme(index)` for consistent card colors
  - Use `assignGoalColors(collection)` for auto-assigning colors

### Key Pages & Components

- **Dashboard** (`client/src/pages/Dashboard.js`): Overview of finances, recent expenses, budgets
- **Expenses** (`client/src/pages/ExpensesV2.js`): Expense list with filtering
- **Analytics** (`client/src/pages/Analytics.js`): Charts and spending analysis
- **Budgets** (`client/src/pages/Budgets.js`): Budget management
- **Savings** (`client/src/pages/Savings.js`): Savings goals tracking

## Coding Conventions

### Backend (Node.js/Express)
- **File naming**: camelCase for route files (plural: `expenses.js`, `categories.js`)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Async/await**: Preferred over callbacks
- **Error handling**: Try-catch blocks, meaningful error messages

### Frontend (React)
- **File naming**: PascalCase for components (`Dashboard.js`), camelCase for utilities
- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Components**: Functional components with hooks (no class components)
- **Styling**: Tailwind utility classes preferred

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

### Shared Color Palette

The app uses a **shared goal color palette** (`client/src/utils/goalColorPalette.js`) for consistent visual design across:
- Savings goal cards
- Dashboard tiles
- Analytics visualizations
- Progress indicators

Each color scheme includes:
- `surface`: Background color
- `border`: Border color
- `ring`: Focus ring color
- `quickButton`: Button background
- `text`: Text color

### shadcn-ui Integration

The app is migrating from Chart.js to **shadcn-ui + Recharts** for data visualization. Components are located in `client/src/components/ui/` and follow shadcn patterns.

### Responsive Design

- **Mobile-first**: Tailwind breakpoints start from mobile (`sm:`, `md:`, `lg:`)
- **Touch-friendly**: Button sizes and touch targets optimized for mobile
- **Flexible layouts**: Flexbox and Grid for responsive structures

## Testing

### Backend Testing
- **Framework**: Jest
- **Location**: `server/test_*.js`
- **Example**: `server/test_sek_currency.js`, `server/test_enhanced_trend.js`
- **Run**: `npm test`

### Frontend Testing
- **Framework**: Jest + React Testing Library
- **Location**: `client/src/**/__tests__/*.test.js`
- **Example**: `client/src/pages/__tests__/Dashboard.test.js`
- **Run**: `cd client && npm test`

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

1. Create file in `client/src/components/` (PascalCase)
2. Import from `shadcn-ui` when possible
3. Use Tailwind for styling
4. Add to relevant page

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

1. Create component in `client/src/pages/` (PascalCase)
2. Add route in `client/src/App.js`:
   ```javascript
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add navigation link in navbar/sidebar

## Authentication Flow

1. User registers/logs in via `POST /api/auth/login`
2. Server returns JWT token
3. Client stores token in localStorage (via AuthContext)
4. Token sent in `x-auth-token` header for authenticated requests
5. Middleware validates token on protected routes

## Environment-Specific Configuration

### Development
- Client: React dev server on port 3000 (with hot reload)
- Server: Express on port 5001
- Database: `server/db/expense_tracker.sqlite`

### Production
- Client: Built static files served by Express
- Server: Serves client build from `../client/build`
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
cd client
rm -rf node_modules package-lock.json
npm install
npm start
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
5. **CORS**: Configured for development (port 3000)

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
npm test                  # Server tests
cd client && npm test    # Client tests
```

## Key Files Reference

- **README.md**: Project overview and setup instructions
- **package.json**: Scripts and dependencies
- **AGENTS.md**: Comprehensive API documentation and development guidelines
- **COUPLES_BUDGET_SPECIFICATION.md**: Product requirements and couple-focused features
- **GEMINI.md**: Alternative project overview for AI assistants
- **client/src/utils/goalColorPalette.js**: Color system implementation
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

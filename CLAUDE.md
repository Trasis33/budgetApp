# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A lightweight web application for expense tracking and bill splitting designed for couples. The app helps track shared expenses, split bills with custom ratios, manage budgets, and provide analytics for spending patterns.

**Active Frontend**: `client-v2/` (React + TypeScript + Vite + Tailwind CSS v4)
**Backend**: `server/` (Node.js + Express + SQLite/Knex.js)
**Deprecated**: `client/` (legacy React app, do not modify)

---

## Development Commands

```bash
# Install all dependencies (root + client-v2)
npm run setup

# Development (both client and server)
npm run dev

# Development (individual services)
npm run dev:server    # Start backend on port 5001
cd client-v2 && npm run dev   # Start frontend on port 3001

# Testing
cd client-v2 && npm test              # Run all tests
cd client-v2 && npm run test:watch    # Watch mode
cd client-v2 && npm run test:coverage # Coverage report

# Build
cd client-v2 && npm run build   # Production build
```

---

## Architecture

### Frontend (client-v2/)

**Technology Stack**:
- React 18.3 with TypeScript
- Vite 6.3 (dev server with HMR)
- React Router DOM 7.9 for routing
- Tailwind CSS v4 with custom design system
- Radix UI primitives (via shadcn/ui patterns)
- Recharts for data visualization
- Axios for API communication

**Key Directories**:
- `src/components/` - React components organized by feature
- `src/components/ui/` - Reusable UI primitives (shadcn/ui style)
- `src/components/smart-budget/` - Budget optimization wizard
- `src/components/savings/` - Savings goals tracking
- `src/api/services/` - API service layer (one file per domain)
- `src/context/` - React contexts (Auth, Scope, Date)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities and helpers
- `src/types/` - TypeScript type definitions

**Context Providers** (wrapped in App.tsx):
1. **AuthProvider** (`context/AuthContext.tsx`) - JWT authentication, user session
2. **ScopeProvider** (`context/ScopeContext.tsx`) - "ours/mine/partner" budget scoping
3. **DateProvider** (`context/DateContext.tsx`) - Month/year selection with localStorage persistence

**Scope System**:
The app uses a three-scope architecture for filtering expenses:
- `ours` - Shared/couple expenses (default)
- `mine` - Current user's personal expenses
- `partner` - Partner's personal expenses (requires partner connection)

Scope affects which expenses/budgets are displayed and is persisted to localStorage.

### Backend (server/)

**Technology Stack**:
- Express.js REST API
- SQLite database with Knex.js query builder
- JWT authentication with bcryptjs
- Express-validator for input validation

**Key Directories**:
- `routes/` - API route handlers
- `middleware/` - Auth middleware for protected routes
- `db/` - Database setup, migrations, and Knex config
- `utils/` - Server utilities (recurring expense generation, budget optimization)

**API Routes** (all protected except `/api/auth/*`):
- `/api/auth` - Login, register, token refresh
- `/api/expenses` - CRUD for expenses
- `/api/categories` - Category management
- `/api/budgets` - Budget CRUD with comments
- `/api/recurring-expenses` - Recurring bill templates
- `/api/incomes` - Income tracking
- `/api/couple` - Partner linking and summary
- `/api/analytics` - Spending trends and patterns
- `/api/savings` - Savings goals tracking
- `/api/optimization` - Smart budget recommendations
- `/api/summary` - Monthly summaries

**Database**: SQLite file at `server/db/expense_tracker.sqlite`
- Migrations in `server/db/migrations/`
- Seed data includes default categories with `budget_weight` for intelligent allocation

---

## Design System

The app uses "Refined Nordic Finance" design with OKLCH color architecture.

**Colors**: Defined in `client-v2/src/styles/globals.css` as CSS custom properties.
- Theme accents: `--theme-teal`, `--theme-coral`, `--theme-gold`, `--theme-amber`, `--theme-indigo`
- Use raw OKLCH values with Tailwind: `bg-[oklch(var(--theme-teal))]`
- Dark mode support via `.dark` class

**Typography**:
- Display: `Bricolage Grotesque` (headings)
- Body: `DM Sans` (fallback: system sans-serif)

**Component Patterns**:
- Buttons: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-teal`, `.btn-gradient`
- Scope selector: `.scope-selector` pattern
- Status badges: `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`
- Progress bars: `.progress-bar` with status-based fills

---

## Important Patterns

### API Service Layer

Services in `client-v2/src/api/services/` follow a consistent pattern:
```typescript
import { apiClient } from '@/api/axios';

export const someService = {
  getAll: (params) => apiClient.get('/endpoint', { params }),
  getById: (id) => apiClient.get(`/endpoint/${id}`),
  create: (data) => apiClient.post('/endpoint', data),
  update: (id, data) => apiClient.put(`/endpoint/${id}`, data),
  delete: (id) => apiClient.delete(`/endpoint/${id}`)
};
```

The `apiClient` automatically includes JWT tokens from AuthContext.

### Test Structure

Tests are co-located with components using `__tests__` directories:
- `src/components/**/__tests__/ComponentName.test.tsx`
- Integration tests: `src/__tests__/integration/`
- Service tests: `src/api/services/__tests__/`

Jest is configured with moduleNameMapper for `@/` path alias.

### Split Types

Expenses support flexible split ratios for couples:
- `50/50` - Equal split (default)
- `custom` - Uses `split_ratio_user1` and `split_ratio_user2` decimals
- Personal expenses may not have split ratios

---

## Environment Configuration

Create `.env` in project root:
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=<your-secret>
```

Frontend uses `VITE_API_URL` (defaults to `http://localhost:5001/api`).

---

## Notes

- The `client/` directory is deprecated; all new frontend work goes in `client-v2/`
- Category colors are user-customizable (stored on users table)
- Budget weights (0.0-1.0) drive the "Smart Budget Wizard" recommendations
- Recurring expenses auto-generate actual expenses on the first of each month
- Partner linking is done via `users.partner_id` (bidirectional relationship)

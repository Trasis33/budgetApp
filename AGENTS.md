# Repository Guidelines

## Project Structure & Module Organization
- Root: Node.js workspace with `client-v2` (React + TypeScript + Vite + Tailwind) and `server` (Express + SQLite/Knex).
- Client: app code in `client-v2/src` (components, lib, hooks, api, types). Uses TypeScript (`.tsx`, `.ts`) for all source files.
- Server: HTTP API in `server/index.js`; routes in `server/routes/*`, middleware in `server/middleware`, data layer in `server/db/*` and helpers in `server/utils/*`.
- Tests: client unit tests under `client-v2/src/**/__tests__/*.test.tsx`. Server includes ad‑hoc scripts in `server/test_*.js`.
- Config: copy `.env.example` to `.env` (e.g., `PORT`, `JWT_SECRET`).

## Build, Test, and Development Commands
- `npm run setup`: install root deps and client deps.
- `npm run dev`: run server and client concurrently (API on `:5001`, client on `:3001`).
- `npm run dev:server` / `npm run dev:client`: run each side in isolation.
- `npm run build`: build production client to `client-v2/build` using Vite.
- `npm start`: start Express API; in production it serves `client-v2/build`.
- Client dev commands: `cd client-v2 && npm run dev` (dev server), `npm run build` (production build), `npm run preview` (preview build).
- Tests: `cd client-v2 && npm test` for React tests. Root `npm test` runs Jest for Node when present.
- **Run single test**: `cd client-v2 && npm test -- src/path/to/Component.test.tsx` (or `*.test.ts` for utilities)

## Code Style & Naming Conventions

### Client (TypeScript/React)
- **Indentation**: 2 spaces
- **File naming**: PascalCase for components (`BudgetManager.tsx`), camelCase for hooks/utilities (`useBudgetData.ts`)
- **Component naming**: PascalCase for components (`export function BudgetManager`)
- **Variable/State naming**: camelCase (`const [selectedMonth, setSelectedMonth]`)
- **Import style**: Named imports preferred: `import { useState, useEffect } from 'react'`
- **UI Components**: Always use shadcn/ui components from `client-v2/src/components/ui/`
- **Icons**: Import from lucide-react: `import { Plus, Trash2 } from 'lucide-react'`
- **Styling**: Prefer Tailwind utility classes over custom CSS. Use CSS custom properties from `globals.css` for colors.
- **Types**: Define types in `client-v2/src/types/` directory, import with `import type { Expense } from '../types'`
- **Error handling**: Use toast notifications from sonner for user feedback: `toast.error('Failed to save')`
- **Path aliases**: Use `@/*` for imports: `import { formatCurrency } from '@/lib/utils'`

### Server (JavaScript/Node)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Route naming**: camelCase plural (`recurringExpenses.js`, `budgets.js`)
- **File structure**: Routes in `server/routes/*`, utils in `server/utils/*` (avoid side effects)
- **Error handling**: Return consistent error responses: `res.status(400).json({ error: '...' })`

## Testing Guidelines
- **Frameworks**: Jest + React Testing Library + TypeScript (client). Place tests near code in `__tests__` using `*.test.tsx` or `*.test.ts`.
- **Run single test**: `cd client-v2 && npm test -- path/to/testFile.test.tsx`
- **Mock API calls**: Use axios mocks in `client-v2/src/__mocks__/axios.js` or jest.mock
- **Coverage**: Run `cd client-v2 && npm run test:coverage` for coverage report
- **Test behavior**: Focus on component behavior and user interactions, not implementation details

## Commit & Pull Request Guidelines
- Use Conventional Commits seen in history: `feat: ...`, `refactor: ...`, `fix: ...`.
- PRs: small, focused, with description, linked issue, screenshots for UI changes, and test plan.
- Include API or schema notes if touching `server/routes/*` or `server/db/*`.

## Security & Configuration Tips
- Do not commit secrets; set `JWT_SECRET` and `PORT` in `.env`.
- SQLite lives in `server/db/expense_tracker.sqlite`; back up locally and avoid editing by hand.

## API Endpoint Overview
- Base URL: `http://localhost:5001/api`. Auth: send `x-auth-token: <JWT>` (except `POST /auth/register` and `POST /auth/login`).
- Dates use `YYYY-MM-DD` format.
- Key routes: Auth, Expenses, Categories, Incomes, Budgets, Recurring Expenses, Summary, Analytics, Savings, Optimization, Users, Couple

## UI Design Guidelines (Cursor Rules)
- Use shadcn/ui components from `client-v2/src/components/ui/` - do not build custom modals/buttons/dialogs from scratch
- Prefer CSS custom properties from `client-v2/src/styles/globals.css` over hard-coded colors
- Tailwind utility classes for spacing and layout
- Icon libraries: Lucide React for all icons (standard size `h-4 w-4` or `h-5 w-5`)
- Toast notifications via sonner for user feedback
- Implement loading states with spinners and skeleton loaders
- Accessible components with focus rings and aria labels
- Color tokens: `--primary`, `--muted`, `--destructive`, theme accents (`--theme-amber`, `--theme-teal`, etc.)
- Dark mode supported via `.dark` class on root element

## Task List Management (Cursor Rules)
When working on multi-step features, maintain task lists in markdown files:
- Create `TASKS.md` or descriptive filename in project root
- Structure with: Completed Tasks, In Progress Tasks, Future Tasks, Implementation Plan, Relevant Files
- Mark tasks with `[x]` when completed, move between sections as appropriate
- Keep "Relevant Files" section updated with file paths and descriptions

## Key Technology Stack
- **Client**: React 18, TypeScript 5.9+, Vite 6.3+, React Router DOM 7.9+, shadcn/ui (Radix UI), Recharts 2.15+, Lucide React, React Hook Form 7.55+, Axios
- **Server**: Express 4.18+, Knex 2.4+, SQLite3, JWT, bcryptjs
- **State**: React Context API for global state (AuthContext, ScopeContext)
- **Services**: API services organized in `client-v2/src/api/services/` by domain (auth, budget, expense, etc.)

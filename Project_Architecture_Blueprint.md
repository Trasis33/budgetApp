# Project Architecture Blueprint

Generated: 2025-12-15
Scope: budgetApp monorepo (client, client-v2, server)

## 1. Architecture Detection and Analysis

- Technology stacks detected:
  - React (client, client-v2) with TypeScript in client-v2 and JavaScript in client
  - Vite build tool (client-v2), legacy CRA-style build present under client
  - Express.js API (server) with SQLite via Knex
  - Jest + React Testing Library for client tests
  - Tailwind CSS for styling (both clients)
- Architectural patterns:
  - Monolithic repository with clear Client–Server separation
  - Layered server architecture: routes → middleware → data layer (db/utils)
  - Client component-based architecture with service layer for API calls and hooks/context for state
  - Hybrid evolution: legacy client (client) and modern client (client-v2) coexist

## 2. Architectural Overview

- Overall approach: A monorepo with a RESTful server that exposes domain endpoints (auth, budgets, expenses, analytics, savings, couple) and a modern React client consuming those endpoints through an organized API service layer and context-based state.
- Guiding principles:
  - Separation of concerns between UI (React) and API (Express)
  - Layered responsibilities on the server (routing, middleware, data access)
  - Type safety and modern tooling in client-v2 (TypeScript + Vite)
  - Consistent UI via shadcn/ui + Tailwind and strict design tokens
- Boundaries:
  - Client(s) do not directly access the database; all data flows through HTTP APIs
  - Server responsibility for authentication, authorization, business rules, persistence
- Hybrid patterns:
  - Coexistence of client and client-v2; client-v2 is the forward-looking implementation with stricter typing and architecture

## 3. Architecture Visualization (C4)

- Level 1 (System Context):
  - Users interact with the React client in the browser
  - Client communicates over HTTP to Express API at /server
  - Server persists data to SQLite (Knex) and returns JSON
- Level 2 (Container):
  - Web App (client-v2): React + TS + Vite + shadcn/ui + Axios
  - Web App (client legacy): React + JS + CRA-like setup
  - API Server: Express + routes + middleware + utils + db (Knex/SQLite)
  - Database: SQLite file at server/db/expense_tracker.sqlite
- Level 3 (Component):
  - Client-v2: components, hooks, context, api/services, lib, types, styles
  - Server: routes/* (feature modules), middleware/auth, utils/*, db/*
- Data Flow:
  - Client dispatches requests via axios instance → server routes → db via Knex → JSON responses → client components via contexts/hooks

## 4. Core Architectural Components

### Client-v2
- Purpose: Modern, type-safe UI with coherent design system and service/hook architecture
- Internal structure:
  - components: UI and page-level; shadcn/ui patterns
  - hooks: reusable logic (e.g., useBudgetData)
  - api/services: axios-based modules for domains (auth, budgets, expenses, analytics, savings)
  - context: Scope and global state providers
  - lib: utilities (color, calculations)
  - styles: Tailwind and CSS tokens
  - types: TypeScript domain models
- Interaction patterns:
  - axios instance communicates with Express endpoints
  - Context provides app-wide state; hooks consume services
- Evolution patterns:
  - Add new service module per domain, corresponding hooks and components; extend types accordingly

### Server
- Purpose: REST API providing authentication, domain logic, data persistence
- Internal structure:
  - index.js: app bootstrap, middleware, route registration
  - routes/*: feature-based routers (auth, budgets, expenses, analytics, savings, couple, categories, recurringExpenses, summary, users)
  - middleware/auth.js: JWT-based authentication
  - db/*: knexfile, migrations, database setup
  - utils/*: cross-cutting helpers (budgetOptimizer, generateRecurringExpenses, scopeUtils)
- Interaction patterns:
  - Routes call utils/db; auth middleware guards protected endpoints
  - JSON payloads exchanged with client
- Evolution patterns:
  - New domain = new route module + db queries + optional utils; observe auth boundaries

## 5. Architectural Layers and Dependencies

- Server layers and rules:
  - Routes (controllers) depend on middleware, utils, db; they do not access Express internals beyond routing
  - Middleware encapsulates cross-cutting concerns (auth)
  - Data layer (db via Knex) encapsulates persistence; routes should avoid raw SQL scattered elsewhere
- Client layers and rules:
  - Components depend on hooks/context/services; avoid direct axios usage except within `api/services`
  - Types are shared across components/services for consistency
  - Styles are centralized via design tokens and Tailwind config
- No circular dependencies evident in directory structure; enforce boundaries via module placement and reviews

## 6. Data Architecture

- Domain models include Users, Expenses, Categories, Budgets, Incomes, Savings (Goals, Contributions), Analytics, Summary
- Entity relationships:
  - Expenses link to `category_id` and `paid_by_user_id`
  - Budgets tied to category and month/year
  - Savings goals with contributions
- Data access patterns:
  - Server uses Knex query builder, migrations manage schema
- Transformations:
  - Aggregations for analytics and summaries; budget optimization via utils
- Caching:
  - Not explicitly implemented; potential for server-side caching with memory/Redis in future
- Validation:
  - Request validation done in routes/middleware; client forms perform input validation with RHF

## 7. Cross-Cutting Concerns Implementation

- Authentication & Authorization:
  - JWT-based auth via `middleware/auth.js`; endpoints enforce token except register/login
- Error Handling & Resilience:
  - Try/catch in routes; potential for centralized error middleware improvement
  - No circuit breaker; retries can be added at axios level
- Logging & Monitoring:
  - Console-based logging; opportunity to integrate pino/winston and metrics
- Validation:
  - Server-side basic validation within routes; client via form libs
- Configuration Management:
  - `.env` usage for `PORT`, `JWT_SECRET`; environment-specific server start
  - Secret management currently local dev oriented

## 8. Service Communication Patterns

- Boundaries: Single API service exposing REST endpoints
- Protocols: HTTP/JSON
- Synchronous communication; no message queues detected
- API versioning: Not explicit; paths organized by domain
- Discovery: Static URL base via config
- Resilience: Auth middleware, basic error handling; axios interceptors can add retries

## 9. Technology-Specific Architectural Patterns

### React (client-v2)
- Component composition with shadcn/ui; reusable cards, charts
- State management via Context and hooks
- Side effects within hooks and service modules
- Routing via React Router DOM (7.x)
- Data fetching via axios services; potential caching layer can be introduced
- Rendering optimizations: memoization at component level as needed

### Node.js/Express
- Middleware pipeline (JSON parsing, CORS, auth)
- Controllers in routes/* per domain
- Knex ORM with migrations
- DI: implicit via module imports; can formalize with explicit injection patterns if needed

## 10. Implementation Patterns

- Interface Design:
  - TypeScript types/interfaces in `client-v2/src/types` segregate API contracts
- Service Implementation:
  - `api/services/*` encapsulate endpoint calls, handle errors, and return typed data
- Repository/Data Access:
  - Knex queries inside routes/utils; consider consolidating into repository modules for reuse
- Controller/API Implementation:
  - Express routers map HTTP verbs to handlers, validate inputs, and send responses
- Domain Model Implementation:
  - Types and helpers represent domain objects on client; server uses schema via migrations

## 11. Testing Architecture

- Client tests: Jest + React Testing Library located near components/utilities
- Test boundaries: unit tests for components and utilities; integration tests for service calls with axios mocks
- Test doubles: axios mock under `__mocks__/axios.js`
- Test data strategies: fixtures within tests; consider shared factories

## 12. Deployment Architecture

- Topology:
  - Dev: `npm run dev` runs server and client concurrently
  - Prod: `npm run build` builds client-v2 to `client-v2/build`; Express can serve static build
- Environment-specific adaptations:
  - `.env` controls port and secrets
- Containerization:
  - Dockerfile present; builds both server and client in container
- Orchestration:
  - Not specified; local-run focus

## 13. Extension and Evolution Patterns

- Feature Addition:
  - Server: add route module under `server/routes`, wire in `server/index.js`, implement db queries and auth as required
  - Client-v2: add `api/services/<domain>.ts`, types, hooks, components; integrate into pages and context
- Modification:
  - Maintain backward compatibility for API shapes consumed by clients
  - Use migrations for schema changes
- Integration:
  - External systems can be integrated via adapter utilities on server and service modules on client

## 14. Architectural Pattern Examples

- Layer Separation (client-v2):
```ts
// api/services/budgets.ts
import axios from '../axios';
export async function getBudgets(params: { month: string; year: string }) {
  const { data } = await axios.get('/budgets', { params });
  return data;
}
```

- Component Communication:
```tsx
// hooks/useBudgetData.ts
import { useEffect, useState } from 'react';
import { getBudgets } from '../api/services/budgets';
export function useBudgetData(month: string, year: string) {
  const [data, setData] = useState(null);
  useEffect(() => { (async () => setData(await getBudgets({ month, year })))(); }, [month, year]);
  return data;
}
```

- Extension Points:
```ts
// context/ScopeContext.tsx
// Add new scope types and providers without touching consumer components
```

## 15. Architectural Decision Records

- Style Decisions:
  - Adopt client-v2 with TS + Vite to improve type safety and performance over legacy client
  - Maintain monorepo to coordinate server and clients
- Technology Selection:
  - shadcn/ui + Tailwind for consistent UI and accessibility
  - Knex + SQLite for simple, file-based persistence suitable for local and small deployments
- Implementation Approaches:
  - Domain-based route modules on server to keep controllers cohesive
  - Service modules on client to isolate HTTP concerns from UI

Each decision balances maintainability, developer velocity, and reliability; future scaling may introduce DB and caching changes.

## 16. Architecture Governance

- Consistency:
  - Follow directory conventions and naming standards defined in AGENTS.md
  - Require API additions to include types and services in client-v2
- Automated checks:
  - Consider adding ESLint/Prettier configs and TypeScript strict checks; CI to run tests/build
- Review process:
  - PRs with Conventional Commits; request tests and screenshots
- Documentation:
  - Update README and this blueprint when adding domains or changing patterns

## 17. Blueprint for New Development

- Development Workflow:
  - Start with API design: add server route + db access
  - Implement client-v2 service and types; build hook and components
  - Integrate into pages, add tests (unit + integration)
- Implementation Templates:
  - Server: `server/routes/<domain>.js` exporting router
  - Client: `client-v2/src/api/services/<domain>.ts`, `types/<domain>.ts`, `hooks/use<Domain>.ts`, `components/<Domain>/*.tsx`
- Common Pitfalls:
  - Bypassing service layer with direct axios in components
  - Mixing data access logic in controllers without utils/repository
  - Inconsistent types between server responses and client models

Keep this document updated as architecture evolves and new features are introduced.

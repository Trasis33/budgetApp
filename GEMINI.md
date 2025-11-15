# Gemini Project: Budget App

This document provides a comprehensive overview of the Budget App project, designed to be used as instructional context for Gemini.

## Project Overview

The project is a full-stack web application designed to help couples track their expenses, split bills, and manage their personal finances. It features a React + TypeScript frontend (client-v2) built with Vite and a Node.js/Express backend, with a SQLite database.

### Key Features:

*   **Expense Tracking:** Mobile-first data entry with categories and descriptions.
*   **Bill Splitting:** Automated calculations with custom split ratios.
*   **Recurring Bills:** Management of predictable monthly expenses.
*   **Budget Management:** Category-based budgeting with performance tracking.
*   **Analytics Dashboard:** Interactive charts and spending pattern analysis.
*   **User Authentication:** Secure JWT-based authentication system.

### Technology Stack:

*   **Frontend (client-v2):**
    *   React 18.3.1 + TypeScript 5.9+
    *   React Router DOM 7.9+
    *   Vite 6.3+ (build tool)
    *   Tailwind CSS 4.1+
    *   shadcn/ui (Radix UI primitives) + Recharts 2.15+
    *   React Hook Form 7.55+
    *   Lucide React (icons)
    *   Axios
*   **Backend:**
    *   Node.js + Express 4.18.2
    *   SQLite 3 + Knex.js 2.4.2
    *   JWT + bcryptjs
    *   Express-validator

## Building and Running

### Prerequisites:

*   Node.js (v14 or higher)
*   npm or yarn

### Installation:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd budget-app
    ```
2.  **Install dependencies:**
    ```bash
    npm run setup
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This starts both the client-v2 (port 3001) and server (port 5001) simultaneously.

### Available Scripts:

*   `npm run dev`: Start both client and server.
*   `npm run dev:client`: Start client only.
*   `npm run dev:server`: Start server only.
*   `npm run build`: Build client for production.
*   `npm start`: Start production server.
*   `npm test`: Run tests.

## Development Conventions

*   The project uses a feature-branch workflow for contributions.
*   **Frontend (client-v2):**
    *   TypeScript with strict mode enabled
    *   Components use `.tsx` extension, utilities use `.ts`
    *   File naming: PascalCase for components, camelCase for utilities
    *   shadcn/ui components located in `client-v2/src/components/ui/`
    *   API services organized by domain in `client-v2/src/api/services/`
    *   Type definitions in `client-v2/src/types/`
    *   Testing with Jest + React Testing Library
*   **Backend:**
    *   Knex.js for database migrations in `server/db/migrations/`
    *   API routes defined in `server/routes/` directory
    *   JavaScript with 2-space indentation, single quotes

## Design System

*   **Styling:** Tailwind CSS v4 with oklch color space for perceptual uniformity
*   **Components:** shadcn/ui (Radix UI primitives) with TypeScript support
*   **Colors:** CSS custom properties defined in `client-v2/src/styles/globals.css`
*   **Icons:** Lucide React for consistent iconography
*   **Notifications:** Sonner toast library for user feedback
*   **Dark Mode:** Full support with automatic theme switching
*   **Patterns:** Follow examples in `client-v2/src/components/BudgetManager.tsx`

Key principles:
- Mobile-first responsive design
- Type-safe components with strict TypeScript
- Consistent spacing using CSS custom properties
- Accessible (WCAG AA compliant)

# Gemini Project: Budget App

This document provides a comprehensive overview of the Budget App project, designed to be used as instructional context for Gemini.

## Project Overview

The project is a full-stack web application designed to help couples track their expenses, split bills, and manage their personal finances. It features a React-based frontend and a Node.js/Express backend, with a SQLite database.

### Key Features:

*   **Expense Tracking:** Mobile-first data entry with categories and descriptions.
*   **Bill Splitting:** Automated calculations with custom split ratios.
*   **Recurring Bills:** Management of predictable monthly expenses.
*   **Budget Management:** Category-based budgeting with performance tracking.
*   **Analytics Dashboard:** Interactive charts and spending pattern analysis.
*   **User Authentication:** Secure JWT-based authentication system.

### Technology Stack:

*   **Frontend:**
    *   React 18.2.0
    *   React Router DOM 6.14.1
    *   Tailwind CSS 3.3.2
    *   Chart.js 4.3.0 (migrating to shadcn-ui)
    *   shadcn-ui + Recharts (in progress)
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
    This starts both the client (port 3000) and server (port 5001) simultaneously.

### Available Scripts:

*   `npm run dev`: Start both client and server.
*   `npm run dev:client`: Start client only.
*   `npm run dev:server`: Start server only.
*   `npm run build`: Build client for production.
*   `npm start`: Start production server.
*   `npm test`: Run tests.

## Development Conventions

*   The project uses a feature-branch workflow for contributions.
*   The frontend is migrating from Chart.js to shadcn-ui and Recharts for data visualizations.
*   The backend uses Knex.js for database migrations. Migrations are located in `server/db/migrations/`.
*   API routes are defined in the `server/routes/` directory.
*   React components are organized into `components/` (reusable) and `pages/` (route-level).

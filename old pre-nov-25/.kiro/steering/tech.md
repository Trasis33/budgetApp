# Technology Stack & Build System

## Architecture
Full-stack JavaScript application with separate client and server components.

## Frontend Stack
- **React 18.2.0**: Component-based UI with hooks and context
- **React Router DOM 6.14.1**: Client-side routing with protected routes
- **Tailwind CSS 3.3.2**: Utility-first CSS framework with custom design system
- **Chart.js 4.3.0 + React-ChartJS-2**: Interactive data visualizations
- **Axios**: HTTP client with interceptors for API communication
- **Lucide React**: Modern icon library
- **Date-fns**: Date manipulation and formatting

## Backend Stack
- **Node.js + Express 4.18.2**: RESTful API server
- **SQLite 3 + Knex.js 2.4.2**: Database with query builder and migrations
- **JWT + bcryptjs**: Authentication and password hashing
- **Express-validator**: Input validation middleware
- **CORS**: Cross-origin resource sharing

## Development Tools
- **Create React App**: Frontend build system
- **Nodemon**: Backend development server with hot reload
- **Concurrently**: Run client and server simultaneously
- **Jest**: Testing framework
- **Docker**: Containerization for deployment

## Common Commands

### Setup
```bash
# Full project setup
npm run setup

# Install client dependencies only
npm run install-client
```

### Development
```bash
# Start both client and server
npm run dev

# Start server only (port 5001)
npm run dev:server

# Start client only (port 3000)
npm run dev:client
```

### Production
```bash
# Build client for production
npm run build

# Start production server
npm start
```

### Testing
```bash
# Run tests
npm test
```

## Environment Configuration
- Server runs on port 5001 (configurable via PORT env var)
- Client proxy configured to backend in development
- JWT secrets and database paths via environment variables
- Production builds served statically by Express server

## Database Management
- Knex migrations in `server/db/migrations/`
- Database setup runs automatically on server start
- SQLite database files in `server/db/`
# Budget App - Expense Tracker for Couples

A lightweight web application that helps couples track expenses, split bills, and manage personal finances. This replaces manual tracking methods with an intuitive, automated system.

## Features

- **Expense Tracking**: Quick mobile-first data entry with categories and descriptions
- **Bill Splitting**: Automated calculations with custom split ratios
- **Recurring Bills**: Management of predictable monthly expenses
- **Budget Management**: Category-based budgeting with performance tracking
- **Analytics Dashboard**: Interactive charts and spending pattern analysis
- **Monthly Statements**: Comprehensive financial summaries with export capabilities
- **User Authentication**: Secure JWT-based authentication system

## Technology Stack

### Frontend
- **React 18.2.0** with hooks and context
- **React Router DOM 6.14.1** for client-side routing
- **Tailwind CSS 3.3.2** with custom design system
- **Chart.js 4.3.0** for data visualizations (migrating to shadcn-ui)
- **shadcn-ui + Recharts** for modern chart components (in progress)
- **Axios** for API communication

### Backend
- **Node.js + Express 4.18.2** RESTful API
- **SQLite 3 + Knex.js 2.4.2** database with migrations
- **JWT + bcryptjs** for authentication
- **Express-validator** for input validation

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budget-app
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   This starts both the client (port 3000) and server (port 5001) simultaneously.

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Database Configuration
# Using SQLite by default, no additional config needed
```

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start both client and server
npm run dev:client   # Start client only (port 3000)
npm run dev:server   # Start server only (port 5001)

# Production
npm run build        # Build client for production
npm start           # Start production server

# Testing
npm test            # Run tests

# Setup
npm run setup       # Install all dependencies
npm run install-client  # Install client dependencies only
```

### Database Management

The application uses SQLite with Knex.js for migrations:

- Database files are stored in `server/db/`
- Migrations are in `server/db/migrations/`
- To reset the database, delete `server/db/expense_tracker.sqlite`

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route-level components
│   │   ├── context/       # React Context providers
│   │   ├── api/           # API client configuration
│   │   ├── utils/         # Helper functions
│   │   └── styles/        # CSS files and design system
│   └── public/            # Static assets
├── server/                # Node.js/Express backend
│   ├── routes/           # API route handlers
│   ├── middleware/       # Custom middleware
│   ├── db/              # Database configuration and migrations
│   └── utils/           # Server-side utilities
├── docs/                # Project documentation
├── designs/             # UI mockups and design system
```

## Key Features

### Dashboard
- Monthly spending summary
- Recent expenses listing
- Budget performance indicators
- Quick action buttons

### Expense Management
- Mobile-optimized entry form
- Category-based organization
- Custom split ratios for shared expenses
- Bulk operations and filtering

### Budget Tracking
- Monthly budget setting per category
- Budget vs. actual spending comparisons
- Visual progress indicators
- Income tracking and management

### Analytics
- Interactive spending charts
- Category breakdown analysis
- Monthly trends and comparisons
- Savings rate tracking

### Bill Splitting
- Automated monthly calculations
- Custom split ratios (50/50, custom, personal)
- Balance tracking between users
- Settlement recommendations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please refer to the documentation in the `docs/` folder or create an issue in the repository.
# Project Structure & Organization

## Root Level
- **client/**: React frontend application
- **server/**: Node.js/Express backend API
- **designs/**: UI mockups and design assets
- **completed/**: Documentation for finished features
- **in_progress/**: Active development documentation
- **ux-implementation-plans/**: UX improvement roadmaps

## Client Structure (`client/`)
```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   ├── Dashboard*.js    # Dashboard-specific components
│   ├── Budget*.js       # Budget-related components
│   └── *.js            # Feature-specific components
├── pages/               # Route-level page components
│   ├── archive/         # Deprecated/unused pages
│   └── *.js            # Main application pages
├── context/             # React Context providers
├── api/                 # API client configuration
├── utils/               # Helper functions and utilities
├── styles/              # CSS modules and global styles
└── index.js            # Application entry point
```

## Server Structure (`server/`)
```
├── routes/              # Express route handlers
├── middleware/          # Custom middleware (auth, validation)
├── db/                  # Database configuration and migrations
│   ├── migrations/      # Knex database migrations
│   └── *.sqlite        # SQLite database files
├── utils/               # Server-side utilities
└── index.js            # Server entry point
```

## Key Conventions

### Component Organization
- **Pages**: Route-level components in `pages/`
- **Components**: Reusable UI components in `components/`
- **Layout**: Navigation and layout components in `components/layout/`
- **Feature Groups**: Related components prefixed by feature (e.g., `Dashboard*.js`, `Budget*.js`)

### API Structure
- RESTful endpoints under `/api/` prefix
- Authentication middleware applied to protected routes
- Route files organized by feature domain

### Database Patterns
- Knex.js for query building and migrations
- Migration files with timestamp prefixes
- Foreign key relationships with CASCADE deletes
- Unique constraints for business logic enforcement

### Styling Approach
- Tailwind CSS utility classes for styling
- Custom design system in `tailwind.config.js`
- Component-specific CSS modules in `styles/`
- Mobile-first responsive design patterns

### State Management
- React Context for global state (AuthContext)
- Local component state with useState/useEffect hooks
- API data fetching with axios and custom hooks

### File Naming
- PascalCase for React components
- camelCase for utilities and non-component files
- Descriptive names indicating component purpose
- Feature prefixes for related components
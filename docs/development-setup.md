# Development Setup Guide

This guide covers the development environment setup for the Budget App, including IDE configuration and development tools.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git
- Kiro IDE (recommended) or VS Code

## Project Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd budget-app
npm run setup
```

### 2. Environment Configuration

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

### 3. Start Development Server

```bash
npm run dev
```

This starts both the client (port 3000) and server (port 5001) simultaneously.

### VS Code Setup

If using VS Code, install these recommended extensions:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## Development Workflow

### 1. Database Management

The application uses SQLite with automatic setup:

- Database files: `server/db/expense_tracker.sqlite`
- Migrations: `server/db/migrations/`
- Reset database: Delete the SQLite file to force recreation

### 2. API Development

- Backend runs on port 5001
- API endpoints are prefixed with `/api/`
- Authentication required for most endpoints
- Use Postman or similar for API testing

### 3. Frontend Development

- React app runs on port 3000
- Hot reload enabled for development
- Tailwind CSS for styling
- Chart.js for data visualizations (being migrated to shadcn-ui charts)
- shadcn-ui + Recharts for modern chart components (in progress)

### 4. Testing

```bash
npm test              # Run all tests
npm run test:client   # Run client tests only
npm run test:server   # Run server tests only
```

## Common Development Tasks

### Adding New Components

1. Create component in `client/src/components/`
2. Use existing design system from `client/src/styles/design-system.css`
3. Follow mobile-first responsive design patterns
4. Use MCP server for shadcn/ui component reference if needed

### Database Schema Changes

1. Create new migration file in `server/db/migrations/`
2. Use Knex.js migration format
3. Test migration with fresh database
4. Update seed data if necessary

### API Endpoint Development

1. Add route handler in `server/routes/`
2. Include authentication middleware where needed
3. Add input validation using express-validator
4. Update API documentation

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in package.json scripts if needed
2. **Database locked**: Stop all processes and restart
3. **MCP server not working**: Check GitHub API key in MCP configuration
4. **Build failures**: Clear node_modules and reinstall dependencies

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev:server  # Server debug logs
```

### Database Reset

If you encounter database issues:

```bash
rm server/db/expense_tracker.sqlite
npm run dev:server  # Will recreate database
```

## Production Build

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5001
JWT_SECRET=secure_production_secret
```

## Additional Resources

- [Project Documentation](./warp.md) - Complete project overview
- [shadcn/ui Implementation Analysis](./shadcn_implementation_analysis.md) - UI library migration guide
- [UX Implementation Plans](../ux-implementation-plans/) - User experience improvement roadmap

## Support

For development questions or issues:

1. Check existing documentation in `docs/` folder
2. Review completed features in `completed/` folder
3. Use MCP integration for component-specific questions
4. Create issues in the project repository
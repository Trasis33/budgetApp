require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const categoryRoutes = require('./routes/categories');
const summaryRoutes = require('./routes/summary');
const recurringExpenseRoutes = require('./routes/recurringExpenses');
const incomeRoutes = require('./routes/incomes');
const userRoutes = require('./routes/users');
const budgetRoutes = require('./routes/budgets');
const { setupDatabase } = require('./db/setup');

const app = express();
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Initialize database
    await setupDatabase();
    console.log('Database setup complete.');

    // Middleware
    app.use(cors());
    app.use(express.json());

    // API Routes
    const auth = require('./middleware/auth');

    app.use('/api/auth', authRoutes);
    app.use('/api/expenses', auth, expenseRoutes);
    app.use('/api/categories', auth, categoryRoutes);
    app.use('/api/summary', auth, summaryRoutes);
    app.use('/api/recurring-expenses', auth, recurringExpenseRoutes);
    app.use('/api/incomes', auth, incomeRoutes);
    app.use('/api/users', auth, userRoutes);
    app.use('/api/budgets', auth, budgetRoutes);
    app.use('/api/analytics', auth, require('./routes/analytics'));
    app.use('/api/savings', auth, require('./routes/savings'));
    app.use('/api/optimization', auth, require('./routes/optimization'));

    // Serve static assets in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/build')));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
      });
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app; // For testing
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// Apply authentication to all savings routes
router.use(authMiddleware);

// Get all savings goals for user
router.get('/goals', async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await db('savings_goals').where({ user_id: userId });
    res.json(goals);
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    res.status(500).json({ error: 'Failed to fetch savings goals' });
  }
});

// Create new savings goal
router.post('/goals', async (req, res) => {
  try {
    const userId = req.user.id;
    const { goal_name, target_amount, target_date, category } = req.body;
    const [goalId] = await db('savings_goals').insert({
      user_id: userId,
      goal_name,
      target_amount,
      target_date,
      category
    });
    const goal = await db('savings_goals').where({ id: goalId }).first();
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating savings goal:', error);
    res.status(500).json({ error: 'Failed to create savings goal' });
  }
});

// Update savings goal
router.put('/goals/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;
    const goal = await db('savings_goals')
      .where({ id, user_id: userId })
      .update(updates)
      .returning('*');
    res.json(goal);
  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(500).json({ error: 'Failed to update savings goal' });
  }
});

// Delete savings goal
router.delete('/goals/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await db('savings_goals').where({ id, user_id: userId }).del();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ error: 'Failed to delete savings goal' });
  }
});

// Get savings rate over time
router.get('/rate/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const userId = req.user.id;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Query total income and expenses
    const incomeData = await db.raw(`
      SELECT 
        strftime('%Y-%m', i.date) as month,
        SUM(i.amount) as total_income
      FROM incomes i
      WHERE i.date BETWEEN ? AND ?
        AND i.user_id = ?
      GROUP BY month
      ORDER BY month ASC
    `, [startDate, endDate, userId]);

    const expenseData = await db.raw(`
      SELECT 
        strftime('%Y-%m', e.date) as month,
        SUM(e.amount) as total_expenses
      FROM expenses e
      WHERE e.date BETWEEN ? AND ?
        AND e.paid_by_user_id = ?
      GROUP BY month
      ORDER BY month ASC
    `, [startDate, endDate, userId]);

    // Calculate savings rate per month
    const savingsRateData = incomeData.map(income => {
      const expenses = expenseData.find(e => e.month === income.month);
      const totalExpenses = expenses ? expenses.total_expenses : 0;
      const savingsRate = income.total_income > 0 
        ? ((income.total_income - totalExpenses) / income.total_income) * 100
        : 0;
      return {
        month: income.month,
        savingsRate
      };
    });

    res.json({ savingsRateData });

  } catch (error) {
    console.error('Error calculating savings rate:', error);
    res.status(500).json({ error: 'Failed to calculate savings rate' });
  }
});

module.exports = router;

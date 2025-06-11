const express = require('express');
const router = express.Router();
const { db } = require('../db/setup');
const auth = require('../middleware/auth');

// @route   GET api/summary/monthly/:year/:month
// @desc    Get monthly summary
// @access  Private
router.get('/monthly/:year/:month', auth, async (req, res) => {
  const { year, month } = req.params;
  
  try {
    // Get all users for reference
    const users = await db('users').select('id', 'name');
    if (users.length < 2) {
      return res.status(400).json({ message: 'Need at least two users for bill splitting' });
    }
    
    // Get monthly expenses
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`;
    
    const expenses = await db('expenses')
      .whereBetween('date', [startDate, endDate])
      .join('categories', 'expenses.category_id', 'categories.id')
      .join('users', 'expenses.paid_by_user_id', 'users.id')
      .select(
        'expenses.*',
        'categories.name as category_name',
        'users.name as paid_by_name'
      );
    
    // Calculate totals by category
    const categoryTotals = {};
    expenses.forEach(expense => {
      if (!categoryTotals[expense.category_name]) {
        categoryTotals[expense.category_name] = 0;
      }
      categoryTotals[expense.category_name] += parseFloat(expense.amount);
    });
    
    // Calculate who paid what
    const userPayments = {};
    users.forEach(user => {
      userPayments[user.id] = 0;
    });
    
    expenses.forEach(expense => {
      userPayments[expense.paid_by_user_id] += parseFloat(expense.amount);
    });
    
    // Calculate balances (assuming 50/50 split for this example)
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const perPersonShare = totalExpenses / users.length;
    
    const balances = {};
    users.forEach(user => {
      balances[user.id] = {
        paid: userPayments[user.id],
        share: perPersonShare,
        balance: userPayments[user.id] - perPersonShare
      };
    });
    
    // Find existing monthly statement or create a new one
    let statement = await db('monthly_statements')
      .where({ month: parseInt(month), year: parseInt(year) })
      .first();
    
    if (!statement) {
      // Calculate user1_owes_user2 (assuming user1 is first user, user2 is second)
      const user1 = users[0];
      const user2 = users[1];
      
      let user1_owes_user2 = 0;
      
      if (balances[user1.id].balance < 0) {
        // User1 has paid less than their share
        user1_owes_user2 = Math.abs(balances[user1.id].balance);
      } else {
        // User1 has paid more than their share
        user1_owes_user2 = -balances[user1.id].balance;
      }
      
      const [id] = await db('monthly_statements').insert({
        month: parseInt(month),
        year: parseInt(year),
        user1_owes_user2,
        // Add budgets if available
        remaining_budget_user1: null,
        remaining_budget_user2: null
      });
      
      statement = await db('monthly_statements').where('id', id).first();
    }
    
    res.json({
      expenses,
      categoryTotals,
      userPayments,
      balances,
      statement
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/summary/monthly/:year/:month
// @desc    Update monthly statement with budget information
// @access  Private
router.put('/monthly/:year/:month', auth, async (req, res) => {
  const { year, month } = req.params;
  const { remaining_budget_user1, remaining_budget_user2 } = req.body;
  
  try {
    // Find existing monthly statement
    let statement = await db('monthly_statements')
      .where({ month: parseInt(month), year: parseInt(year) })
      .first();
    
    if (!statement) {
      return res.status(404).json({ message: 'Monthly statement not found' });
    }
    
    await db('monthly_statements')
      .where('id', statement.id)
      .update({
        remaining_budget_user1: remaining_budget_user1 !== undefined ? remaining_budget_user1 : statement.remaining_budget_user1,
        remaining_budget_user2: remaining_budget_user2 !== undefined ? remaining_budget_user2 : statement.remaining_budget_user2
      });
    
    statement = await db('monthly_statements').where('id', statement.id).first();
    
    res.json(statement);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

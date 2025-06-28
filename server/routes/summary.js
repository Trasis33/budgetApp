const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');
const generateRecurringExpenses = require('../utils/generateRecurringExpenses');

// @route   GET api/summary/monthly/:year/:month
// @desc    Get monthly summary
// @access  Private
router.get('/monthly/:year/:month', auth, async (req, res) => {
  const { year, month } = req.params;
  
  try {
    await generateRecurringExpenses(year, month);

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
    
    // Calculate user1_owes_user2
    const user1 = users[0];
    const user2 = users[1];
    let user1_owes_user2 = 0;
    if (balances[user1.id].balance < 0) {
      user1_owes_user2 = Math.abs(balances[user1.id].balance);
    } else {
      user1_owes_user2 = -balances[user1.id].balance;
    }

    // Find existing monthly statement or create/update a new one
    let statement = await db('monthly_statements')
      .where({ month: parseInt(month), year: parseInt(year) })
      .first();
    
    if (statement) {
      await db('monthly_statements')
        .where({ id: statement.id })
        .update({
          total_expenses: totalExpenses,
          user1_owes_user2: user1_owes_user2,
        });
      statement = await db('monthly_statements').where({ id: statement.id }).first();
    } else {
      const [id] = await db('monthly_statements').insert({
        month: parseInt(month),
        year: parseInt(year),
        total_expenses: totalExpenses,
        user1_owes_user2: user1_owes_user2,
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

// @route   GET api/summary/settle
// @desc    Calculate and settle the bill for a given month
// @access  Private
router.get('/settle', auth, async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: 'Month and year are required' });
  }

  try {
    await generateRecurringExpenses(year, month);

    const users = await db('users').select('id', 'name');
    if (users.length !== 2) {
      return res.status(400).json({ message: 'This feature is designed for two users.' });
    }

    const [user1, user2] = users;

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const expenses = await db('expenses').whereBetween('date', [startDate, endDate]);

    let totalSharedExpenses = 0;
    const userShares = { [user1.id]: 0, [user2.id]: 0 };
    const userPaid = { [user1.id]: 0, [user2.id]: 0 };

    for (const expense of expenses) {
      const amount = parseFloat(expense.amount);
      userPaid[expense.paid_by_user_id] += amount;

      if (expense.split_type === 'personal') {
        continue; // Skip personal expenses in settlement
      }

      totalSharedExpenses += amount;

      if (expense.split_type === '50/50') {
        userShares[user1.id] += amount / 2;
        userShares[user2.id] += amount / 2;
      } else if (expense.split_type === 'custom') {
        userShares[user1.id] += amount * (expense.split_ratio_user1 / 100);
        userShares[user2.id] += amount * (expense.split_ratio_user2 / 100);
      }
    }

    const balance1 = userPaid[user1.id] - userShares[user1.id];

    let settlement = {};
    const amountOwed = Math.abs(balance1);

    if (balance1 > 0) {
      settlement.message = `${user2.name} owes ${user1.name} ${amountOwed.toFixed(2)} SEK`;
    } else if (balance1 < 0) {
      settlement.message = `${user1.name} owes ${user2.name} ${amountOwed.toFixed(2)} SEK`;
    } else {
      settlement.message = 'All settled up!';
    }

    res.json({
      totalSharedExpenses: totalSharedExpenses.toFixed(2),
      user1: { name: user1.name, paid: userPaid[user1.id].toFixed(2) },
      user2: { name: user2.name, paid: userPaid[user2.id].toFixed(2) },
      settlement,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

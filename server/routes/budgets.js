const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// @route   GET api/budgets
// @desc    Get budgets for a specific month and year
// @access  Private
router.get('/', auth, async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: 'Month and year are required' });
  }

  try {
    const budgets = await db('budgets')
      .join('categories', 'budgets.category_id', 'categories.id')
      .select(
        'budgets.id',
        'budgets.category_id',
        'budgets.month',
        'budgets.year',
        'budgets.amount',
        'categories.name as category_name'
      )
      .where('budgets.month', month)
      .andWhere('budgets.year', year);

    res.json(budgets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/budgets
// @desc    Create or update a budget for a category
// @access  Private
router.post('/', auth, async (req, res) => {
  const { category_id, amount, month, year } = req.body;

  if (!category_id || !amount || !month || !year) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingBudget = await db('budgets')
      .where({ category_id, month, year })
      .first();

    if (existingBudget) {
      await db('budgets')
        .where({ id: existingBudget.id })
        .update({ amount });
    } else {
      await db('budgets').insert({ category_id, amount, month, year });
    }

    res.status(201).json({ message: 'Budget saved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

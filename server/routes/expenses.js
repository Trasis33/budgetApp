const express = require('express');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// @route   GET api/expenses
// @desc    Get all expenses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await db('expenses')
      .join('categories', 'expenses.category_id', 'categories.id')
      .join('users', 'expenses.paid_by_user_id', 'users.id')
      .select(
        'expenses.*',
        'categories.name as category_name',
        'categories.icon as category_icon',
        'users.name as paid_by_name'
      );
    
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/expenses/recent
// @desc    Get recent expenses
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const recentExpenses = await db('expenses')
      .join('categories', 'expenses.category_id', 'categories.id')
      .join('users', 'expenses.paid_by_user_id', 'users.id')
      .select(
        'expenses.*',
        'categories.name as category_name',
        'categories.icon as category_icon',
        'users.name as paid_by_name'
      )
      .orderBy('date', 'desc')
      .limit(5);

    res.json(recentExpenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/expenses/:id
// @desc    Get a single expense
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await db('expenses')
      .join('categories', 'expenses.category_id', 'categories.id')
      .join('users', 'expenses.paid_by_user_id', 'users.id')
      .select(
        'expenses.*',
        'categories.name as category_name',
        'categories.icon as category_icon',
        'users.name as paid_by_name'
      )
      .where('expenses.id', req.params.id)
      .first();

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/expenses
// @desc    Create a new expense
// @access  Private
router.post('/', auth, async (req, res) => {
  const {
    date,
    amount,
    category_id,
    paid_by_user_id,
    split_type,
    split_ratio_user1,
    split_ratio_user2,
    description
  } = req.body;

  try {
    // Validate mandatory fields (date can be omitted)
    if (!amount || !category_id || !paid_by_user_id) {
      return res.status(400).json({ message: 'Please provide amount, category and payer' });
    }

    // Default the date to the first of the current month if not supplied
    const today = new Date();
    const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

    const [id] = await db('expenses').insert({
      date: date || defaultDate,
      amount,
      category_id,
      paid_by_user_id,
      split_type: split_type || '50/50',
      split_ratio_user1: split_ratio_user1 || null,
      split_ratio_user2: split_ratio_user2 || null,
      description
    });

    const expense = await db('expenses')
      .join('categories', 'expenses.category_id', 'categories.id')
      .join('users', 'expenses.paid_by_user_id', 'users.id')
      .select(
        'expenses.*',
        'categories.name as category_name',
        'categories.icon as category_icon',
        'users.name as paid_by_name'
      )
      .where('expenses.id', id)
      .first();

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const {
    date,
    amount,
    category_id,
    paid_by_user_id,
    split_type,
    split_ratio_user1,
    split_ratio_user2,
    description
  } = req.body;

  try {
    const expenseExists = await db('expenses').where('id', req.params.id).first();
    
    if (!expenseExists) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await db('expenses')
      .where('id', req.params.id)
      .update({
        date: date || expenseExists.date,
        amount,
        category_id,
        paid_by_user_id,
        split_type,
        split_ratio_user1,
        split_ratio_user2,
        description
      });

    const expense = await db('expenses')
      .join('categories', 'expenses.category_id', 'categories.id')
      .join('users', 'expenses.paid_by_user_id', 'users.id')
      .select(
        'expenses.*',
        'categories.name as category_name',
        'categories.icon as category_icon',
        'users.name as paid_by_name'
      )
      .where('expenses.id', req.params.id)
      .first();

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const expenseExists = await db('expenses').where('id', req.params.id).first();
    
    if (!expenseExists) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await db('expenses').where('id', req.params.id).del();

    res.json({ message: 'Expense removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

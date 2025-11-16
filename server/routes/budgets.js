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
        'categories.name as category_name',
        'categories.color as category_color'
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

// @route   DELETE api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const budgetExists = await db('budgets').where('id', req.params.id).first();
    
    if (!budgetExists) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await db('budgets').where('id', req.params.id).del();

    res.json({ message: 'Budget removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/budgets/available-categories
// @desc    Get categories that don't have budgets for current month
// @access  Private
router.get('/available-categories', auth, async (req, res) => {
  const { month, year } = req.query;

  // Validate month and year parameters
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  
  if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ message: 'Invalid month or year parameters' });
  }

  try {
    console.log(`Fetching available categories for month: ${monthNum}, year: ${yearNum}`);
    
    // Get categories that already have budgets
    const budgetedCategories = await db('budgets')
      .where('budgets.month', monthNum)
      .andWhere('budgets.year', yearNum)
      .pluck('category_id');

    // Get all categories and filter out budgeted ones
    const allCategories = await db('categories').select('*');
    const availableCategories = allCategories.filter(
      category => !budgetedCategories.includes(category.id)
    );

    console.log(`Found ${availableCategories.length} available categories`);
    res.json(availableCategories);
  } catch (err) {
    console.error('Error in available categories endpoint:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      sql: err.sql ? err.sql : 'No SQL available'
    });
    res.status(500).json({ 
      message: 'Server Error', 
      error: err.message
    });
  }
});

// @route   GET api/budgets/summary/:month/:year
// @desc    Get budget summary with spending data
// @access  Private
router.get('/summary/:month/:year', auth, async (req, res) => {
  const { month, year } = req.params;

  // Validate month and year parameters
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  
  if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ message: 'Invalid month or year parameters' });
  }

  try {
    console.log(`Fetching budget summary for month: ${monthNum}, year: ${yearNum}`);
    
    // Get budgets with categories
    const budgets = await db('budgets')
      .join('categories', 'budgets.category_id', 'categories.id')
      .leftJoin('expenses', function() {
        this.on('budgets.category_id', '=', 'expenses.category_id')
          .andOn(db.raw("strftime('%m', expenses.date) = ?", [monthNum.toString().padStart(2, '0')]))
          .andOn(db.raw("strftime('%Y', expenses.date) = ?", [yearNum.toString()]));
      })
      .select(
        'budgets.id',
        'budgets.category_id',
        'budgets.month',
        'budgets.year',
        'budgets.amount',
        'categories.name as category_name',
        'categories.icon as category_icon',
        'categories.color as category_color',
        db.raw('COALESCE(SUM(expenses.amount), 0) as spent')
      )
      .where('budgets.month', monthNum)
      .andWhere('budgets.year', yearNum)
      .groupBy('budgets.id', 'categories.id', 'categories.name', 'categories.icon', 'categories.color')
      .orderBy('categories.name');

    console.log(`Found ${budgets.length} budgets`);

    // If no budgets found, return empty response with default summary
    if (budgets.length === 0) {
      return res.json({
        budgets: [],
        summary: {
          totalBudget: 0,
          totalSpent: 0,
          totalRemaining: 0,
          overallProgress: 0
        }
      });
    }

    // Calculate totals
    const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount || 0), 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + parseFloat(budget.spent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;

    // Add progress calculations
    const budgetsWithProgress = budgets.map(budget => {
      const spent = parseFloat(budget.spent || 0);
      const budgetAmount = parseFloat(budget.amount || 0);
      const remaining = budgetAmount - spent;
      const progressPercentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
      
      let status = 'good';
      if (progressPercentage >= 100) status = 'over';
      else if (progressPercentage >= 90) status = 'warning';

      return {
        ...budget,
        spent,
        remaining,
        progressPercentage: Math.round(progressPercentage * 10) / 10,
        status
      };
    });

    res.json({
      budgets: budgetsWithProgress,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining,
        overallProgress: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
      }
    });
  } catch (err) {
    console.error('Error in budget summary endpoint:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      sql: err.sql ? err.sql : 'No SQL available',
      bindings: err.bindings ? err.bindings : 'No bindings available'
    });
    res.status(500).json({ 
      message: 'Server Error', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   GET api/budgets/test
// @desc    Test database connection
// @access  Private
router.get('/test', auth, async (req, res) => {
  try {
    // Test basic database connection
    const categories = await db('categories').select('*').limit(1);
    const budgets = await db('budgets').select('*').limit(1);
    const expenses = await db('expenses').select('*').limit(1);
    
    res.json({
      status: 'Database connection successful',
      counts: {
        categories: await db('categories').count('* as count').first(),
        budgets: await db('budgets').count('* as count').first(),
        expenses: await db('expenses').count('* as count').first()
      },
      sample: {
        categories,
        budgets,
        expenses
      }
    });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: err.message 
    });
  }
});

module.exports = router;

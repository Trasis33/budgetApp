const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// Apply authentication to all analytics routes
router.use(authMiddleware);

/**
 * GET /api/analytics/trends/:startDate/:endDate
 * Returns spending trends data for priority charts
 * Includes monthly totals, category breakdowns, budget comparisons
 * Optimized for 6-month default period
 */
router.get('/trends/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const userId = req.user.id;

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Get monthly spending totals with budget comparisons
    const monthlyTotals = await db.raw(`
      SELECT 
        strftime('%Y-%m', e.date) as month,
        SUM(e.amount) as total_spending,
        COUNT(e.id) as expense_count,
        AVG(e.amount) as avg_expense,
        COALESCE(SUM(b.amount), 0) as total_budget
      FROM expenses e
      LEFT JOIN budgets b ON strftime('%Y', e.date) = b.year 
        AND strftime('%m', e.date) = printf('%02d', b.month)
      WHERE e.date BETWEEN ? AND ?
        AND (e.paid_by_user_id = ? OR e.paid_by_user_id IN (
          SELECT id FROM users WHERE id != ? LIMIT 1
        ))
      GROUP BY strftime('%Y-%m', e.date)
      ORDER BY month ASC
    `, [startDate, endDate, userId, userId]);

    // Get previous year comparison data for the same period
    const previousYearStart = new Date(startDate);
    previousYearStart.setFullYear(previousYearStart.getFullYear() - 1);
    const previousYearEnd = new Date(endDate);
    previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1);

    const previousYearTotals = await db.raw(`
      SELECT 
        strftime('%Y-%m', e.date) as month,
        SUM(e.amount) as total_spending
      FROM expenses e
      WHERE e.date BETWEEN ? AND ?
        AND (e.paid_by_user_id = ? OR e.paid_by_user_id IN (
          SELECT id FROM users WHERE id != ? LIMIT 1
        ))
      GROUP BY strftime('%Y-%m', e.date)
      ORDER BY month ASC
    `, [
      previousYearStart.toISOString().split('T')[0],
      previousYearEnd.toISOString().split('T')[0],
      userId,
      userId
    ]);

    // Calculate trend indicators
    const currentPeriodTotal = monthlyTotals.reduce((sum, month) => sum + month.total_spending, 0);
    const previousPeriodTotal = previousYearTotals.reduce((sum, month) => sum + month.total_spending, 0);
    const trendPercentage = previousPeriodTotal > 0 
      ? ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal * 100)
      : 0;

    // Calculate average monthly spending
    const avgMonthlySpending = monthlyTotals.length > 0 
      ? currentPeriodTotal / monthlyTotals.length 
      : 0;

    res.json({
      monthlyTotals,
      previousYearTotals,
      summary: {
        totalSpending: currentPeriodTotal,
        avgMonthlySpending,
        trendPercentage: Math.round(trendPercentage * 100) / 100,
        trendDirection: trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'stable',
        monthCount: monthlyTotals.length
      }
    });

  } catch (error) {
    console.error('Error fetching trends data:', error);
    res.status(500).json({ error: 'Failed to fetch trends data' });
  }
});

/**
 * GET /api/analytics/category-trends/:startDate/:endDate
 * Returns category-specific spending over time
 * Top categories with monthly breakdowns
 * Budget vs actual for each category
 */
router.get('/category-trends/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const userId = req.user.id;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Get category spending by month
    const categoryTrends = await db.raw(`
      SELECT 
        c.name as category,
        c.id as category_id,
        strftime('%Y-%m', e.date) as month,
        SUM(e.amount) as total_spending,
        COUNT(e.id) as expense_count,
        AVG(e.amount) as avg_expense
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.date BETWEEN ? AND ?
        AND (e.paid_by_user_id = ? OR e.paid_by_user_id IN (
          SELECT id FROM users WHERE id != ? LIMIT 1
        ))
      GROUP BY c.id, c.name, strftime('%Y-%m', e.date)
      ORDER BY c.name, month ASC
    `, [startDate, endDate, userId, userId]);

    // Get total spending by category (for top categories)
    const categoryTotals = await db.raw(`
      SELECT 
        c.name as category,
        c.id as category_id,
        SUM(e.amount) as total_spending,
        COUNT(e.id) as expense_count
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
      WHERE e.date BETWEEN ? AND ?
        AND (e.paid_by_user_id = ? OR e.paid_by_user_id IN (
          SELECT id FROM users WHERE id != ? LIMIT 1
        ))
      GROUP BY c.id, c.name
      ORDER BY total_spending DESC
      LIMIT 5
    `, [startDate, endDate, userId, userId]);

    // Get budget data for categories
    const categoryBudgets = await db.raw(`
      SELECT 
        c.name as category,
        c.id as category_id,
        strftime('%Y-%m', printf('%04d-%02d-01', b.year, b.month)) as month,
        b.amount as budget_amount
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE printf('%04d-%02d-01', b.year, b.month) BETWEEN ? AND ?
      ORDER BY c.name, month ASC
    `, [startDate, endDate]);

    // Organize data by category for easier frontend consumption
    const topCategories = categoryTotals.map(cat => cat.category);
    const trendsByCategory = {};
    
    topCategories.forEach(category => {
      trendsByCategory[category] = {
        monthlyData: categoryTrends.filter(trend => trend.category === category),
        budgetData: categoryBudgets.filter(budget => budget.category === category),
        totalSpending: categoryTotals.find(cat => cat.category === category)?.total_spending || 0
      };
    });

    res.json({
      topCategories,
      trendsByCategory,
      categoryTotals,
      summary: {
        totalCategories: categoryTotals.length,
        topCategory: categoryTotals[0]?.category || null,
        topCategorySpending: categoryTotals[0]?.total_spending || 0
      }
    });

  } catch (error) {
    console.error('Error fetching category trends:', error);
    res.status(500).json({ error: 'Failed to fetch category trends data' });
  }
});

/**
 * GET /api/analytics/income-expenses/:startDate/:endDate
 * Returns monthly income and expense totals
 * Surplus/deficit calculations
 * Trend indicators
 */
router.get('/income-expenses/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const userId = req.user.id;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Get monthly income and expense data using a more robust query
    const monthlyIncome = await db.raw(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as total_income
      FROM incomes
      WHERE date BETWEEN ? AND ? AND user_id = ?
      GROUP BY month
    `, [startDate, endDate, userId]);

    const monthlyExpenses = await db.raw(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as total_expenses
      FROM expenses
      WHERE date BETWEEN ? AND ? AND paid_by_user_id = ?
      GROUP BY month
    `, [startDate, endDate, userId]);

    // Combine income and expense data by month
    const monthlyData = [];
    const allMonths = new Set([
      ...monthlyIncome.map(m => m.month),
      ...monthlyExpenses.map(m => m.month)
    ]);

    Array.from(allMonths).sort().forEach(month => {
      const income = monthlyIncome.find(m => m.month === month);
      const expense = monthlyExpenses.find(m => m.month === month);
      monthlyData.push({
        month,
        income: income ? income.total_income : 0,
        expenses: expense ? expense.total_expenses : 0
      });
    });

    // Calculate summary statistics
    const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
    const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
    const totalSurplus = totalIncome - totalExpenses;
    const avgSavingsRate = monthlyData.length > 0 
      ? monthlyData.reduce((sum, month) => sum + month.savingsRate, 0) / monthlyData.length
      : 0;

    // Calculate trends
    const recentMonths = monthlyData.slice(-3); // Last 3 months
    const earlierMonths = monthlyData.slice(0, -3);
    
    const recentAvgSavings = recentMonths.length > 0 
      ? recentMonths.reduce((sum, month) => sum + month.savingsRate, 0) / recentMonths.length
      : 0;
    const earlierAvgSavings = earlierMonths.length > 0 
      ? earlierMonths.reduce((sum, month) => sum + month.savingsRate, 0) / earlierMonths.length
      : 0;

    const savingsTrend = earlierAvgSavings > 0 
      ? ((recentAvgSavings - earlierAvgSavings) / earlierAvgSavings * 100)
      : 0;

    res.json({
      monthlyData,
      summary: {
        totalIncome,
        totalExpenses,
        totalSurplus,
        avgSavingsRate: Math.round(avgSavingsRate * 100) / 100,
        savingsTrend: Math.round(savingsTrend * 100) / 100,
        savingsTrendDirection: savingsTrend > 0 ? 'improving' : savingsTrend < 0 ? 'declining' : 'stable',
        monthCount: monthlyData.length
      }
    });

  } catch (error) {
    console.error('Error fetching income-expenses data:', error);
    res.status(500).json({ error: 'Failed to fetch income-expenses data' });
  }
});

/**
 * GET /api/analytics/savings-analysis/:startDate/:endDate
 * Returns comprehensive savings analysis including rates, trends, and goals
 */
router.get('/savings-analysis/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const userId = req.user.id;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Check data availability first
    const incomeCount = await db('incomes')
      .where({ user_id: userId })
      .whereBetween('date', [startDate, endDate])
      .count('id as count')
      .first();
    
    const expenseCount = await db('expenses')
      .where({ paid_by_user_id: userId })
      .whereBetween('date', [startDate, endDate])
      .count('id as count')
      .first();
    
    const totalIncomeEntries = incomeCount.count;
    const totalExpenseEntries = expenseCount.count;
    
    // If no data exists, return helpful information
    if (totalIncomeEntries === 0 && totalExpenseEntries === 0) {
      return res.json({
        monthlyData: [],
        savingsGoals: await db('savings_goals').where({ user_id: userId }),
        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          totalSavings: 0,
          averageSavingsRate: 0,
          savingsRateTrend: 0,
          trendDirection: 'no-data',
          monthCount: 0
        },
        dataAvailability: {
          hasIncome: false,
          hasExpenses: false,
          incomeEntries: totalIncomeEntries,
          expenseEntries: totalExpenseEntries,
          requiredForMeaningfulAnalysis: 2, // At least 2 months of data
          message: 'Add income and expense entries to see meaningful savings analysis'
        }
      });
    }
    
    // Check for partial data scenarios
    if (totalIncomeEntries === 0) {
      return res.json({
        monthlyData: [],
        savingsGoals: await db('savings_goals').where({ user_id: userId }),
        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          totalSavings: 0,
          averageSavingsRate: 0,
          savingsRateTrend: 0,
          trendDirection: 'no-data',
          monthCount: 0
        },
        dataAvailability: {
          hasIncome: false,
          hasExpenses: true,
          incomeEntries: totalIncomeEntries,
          expenseEntries: totalExpenseEntries,
          requiredForMeaningfulAnalysis: 2,
          message: `You have ${totalExpenseEntries} expense entries but no income entries. Add income entries to calculate your savings rate.`
        }
      });
    }
    
    if (totalExpenseEntries === 0) {
      return res.json({
        monthlyData: [],
        savingsGoals: await db('savings_goals').where({ user_id: userId }),
        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          totalSavings: 0,
          averageSavingsRate: 0,
          savingsRateTrend: 0,
          trendDirection: 'no-data',
          monthCount: 0
        },
        dataAvailability: {
          hasIncome: true,
          hasExpenses: false,
          incomeEntries: totalIncomeEntries,
          expenseEntries: totalExpenseEntries,
          requiredForMeaningfulAnalysis: 2,
          message: `You have ${totalIncomeEntries} income entries but no expense entries. Add expense entries to calculate your savings rate.`
        }
      });
    }
    
    // Get monthly income and expense data using a more robust query
    const monthlyIncome = await db.raw(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as total_income
      FROM incomes
      WHERE date BETWEEN ? AND ? AND user_id = ?
      GROUP BY month
    `, [startDate, endDate, userId]);

    const monthlyExpenses = await db.raw(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as total_expenses
      FROM expenses
      WHERE date BETWEEN ? AND ? AND paid_by_user_id = ?
      GROUP BY month
    `, [startDate, endDate, userId]);

    // Combine income and expense data by month
    const monthlyData = [];
    const allMonths = new Set([
      ...monthlyIncome.map(m => m.month),
      ...monthlyExpenses.map(m => m.month)
    ]);

    Array.from(allMonths).sort().forEach(month => {
      const income = monthlyIncome.find(m => m.month === month);
      const expense = monthlyExpenses.find(m => m.month === month);
      monthlyData.push({
        month,
        total_income: income ? income.total_income : 0,
        total_expenses: expense ? expense.total_expenses : 0
      });
    });

    // Calculate savings rate and additional metrics
    const savingsAnalysis = monthlyData.map(month => {
      const savings = month.total_income - month.total_expenses;
      const savingsRate = month.total_income > 0 
        ? (savings / month.total_income) * 100
        : 0;
      
      return {
        month: month.month,
        income: month.total_income,
        expenses: month.total_expenses,
        savings: savings,
        savingsRate: Math.round(savingsRate * 100) / 100
      };
    });

    // Get savings goals
    const savingsGoals = await db('savings_goals').where({ user_id: userId });
    
    // Check if we have enough data for meaningful analysis
    if (savingsAnalysis.length < 2) {
      return res.json({
        monthlyData: savingsAnalysis,
        savingsGoals,
        summary: {
          totalIncome: savingsAnalysis.reduce((sum, month) => sum + month.income, 0),
          totalExpenses: savingsAnalysis.reduce((sum, month) => sum + month.expenses, 0),
          totalSavings: savingsAnalysis.reduce((sum, month) => sum + month.savings, 0),
          averageSavingsRate: savingsAnalysis.length > 0 ? savingsAnalysis[0].savingsRate : 0,
          savingsRateTrend: 0,
          trendDirection: 'insufficient-data',
          monthCount: savingsAnalysis.length
        },
        dataAvailability: {
          hasIncome: true,
          hasExpenses: true,
          incomeEntries: totalIncomeEntries,
          expenseEntries: totalExpenseEntries,
          requiredForMeaningfulAnalysis: 2,
          monthsWithData: savingsAnalysis.length,
          message: `You have data for ${savingsAnalysis.length} month(s). Add more income and expense entries across multiple months to see trends and meaningful analysis.`
        }
      });
    }

    // Calculate summary statistics
    const totalIncome = savingsAnalysis.reduce((sum, month) => sum + month.income, 0);
    const totalExpenses = savingsAnalysis.reduce((sum, month) => sum + month.expenses, 0);
    const totalSavings = totalIncome - totalExpenses;
    const averageSavingsRate = savingsAnalysis.length > 0 
      ? savingsAnalysis.reduce((sum, month) => sum + month.savingsRate, 0) / savingsAnalysis.length
      : 0;

    // Calculate trends
    const recentMonths = savingsAnalysis.slice(-3);
    const earlierMonths = savingsAnalysis.slice(0, -3);
    
    const recentAvgSavingsRate = recentMonths.length > 0 
      ? recentMonths.reduce((sum, month) => sum + month.savingsRate, 0) / recentMonths.length
      : 0;
    const earlierAvgSavingsRate = earlierMonths.length > 0 
      ? earlierMonths.reduce((sum, month) => sum + month.savingsRate, 0) / earlierMonths.length
      : 0;
    
    const savingsRateTrend = earlierAvgSavingsRate > 0 
      ? ((recentAvgSavingsRate - earlierAvgSavingsRate) / earlierAvgSavingsRate) * 100
      : 0;

    res.json({
      monthlyData: savingsAnalysis,
      savingsGoals,
      summary: {
        totalIncome,
        totalExpenses,
        totalSavings,
        averageSavingsRate: Math.round(averageSavingsRate * 100) / 100,
        savingsRateTrend: Math.round(savingsRateTrend * 100) / 100,
        trendDirection: savingsRateTrend > 0 ? 'improving' : savingsRateTrend < 0 ? 'declining' : 'stable',
        monthCount: savingsAnalysis.length
      }
    });

  } catch (error) {
    console.error('Error fetching savings analysis:', error);
    res.status(500).json({ error: 'Failed to fetch savings analysis' });
  }
});

module.exports = router;

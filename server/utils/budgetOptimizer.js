// Budget Optimizer - Analysis Engine for Budget Optimization Tips
// Created: 2025-07-12

const db = require('../db/database');

class BudgetOptimizer {
  constructor(userId) {
    this.userId = userId;
  }

  // Analyze spending patterns and generate insights
  async analyzeSpendingPatterns() {
    try {
      const expenses = await this.getExpenseHistory(12); // 12 months
      const budgets = await this.getBudgetHistory(12);
      const savingsGoals = await this.getSavingsGoals();
      
      const patterns = this.identifyPatterns(expenses);
      const seasonalTrends = this.detectSeasonalTrends(expenses);
      const budgetVariances = this.analyzeBudgetVariances(expenses, budgets);
      
      return {
        patterns,
        seasonalTrends,
        budgetVariances,
        recommendations: this.generateRecommendations(patterns, budgetVariances, savingsGoals)
      };
    } catch (error) {
      console.error('Error analyzing spending patterns:', error);
      throw error;
    }
  }

  // Get expense history for the last N months
  async getExpenseHistory(months) {
    const query = `
      SELECT 
        category,
        strftime('%Y-%m', date) as month,
        SUM(amount) as amount
      FROM expenses 
      WHERE user_id = ? 
        AND date >= date('now', '-${months} months')
      GROUP BY category, strftime('%Y-%m', date)
      ORDER BY month DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.all(query, [this.userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Get budget history for the last N months
  async getBudgetHistory(months) {
    const query = `
      SELECT 
        category,
        strftime('%Y-%m', start_date) as month,
        amount as budget_amount
      FROM budgets 
      WHERE user_id = ? 
        AND start_date >= date('now', '-${months} months')
      ORDER BY start_date DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.all(query, [this.userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Get savings goals
  async getSavingsGoals() {
    const query = `
      SELECT * FROM savings_goals 
      WHERE user_id = ? 
        AND (target_date IS NULL OR target_date > date('now'))
      ORDER BY created_at DESC
    `;
    
    return new Promise((resolve, reject) => {
      db.all(query, [this.userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Generate specific optimization recommendations
  generateRecommendations(patterns, budgetVariances, savingsGoals) {
    const recommendations = [];

    // 1. Identify overspending categories
    const overspendingCategories = budgetVariances.filter(v => v.variance > 0.2);
    overspendingCategories.forEach(category => {
      recommendations.push({
        type: 'reduction',
        category: category.name,
        title: `Reduce ${category.name} spending`,
        description: `You're spending ${category.overagePercentage}% over budget in ${category.name}. Consider reducing by ${this.formatCurrency(category.suggestedReduction)}.`,
        impact_amount: category.suggestedReduction,
        confidence_score: 0.8
      });
    });

    // 2. Suggest budget reallocation
    const underutilizedCategories = budgetVariances.filter(v => v.variance < -0.3);
    if (underutilizedCategories.length > 0 && overspendingCategories.length > 0) {
      recommendations.push({
        type: 'reallocation',
        title: 'Reallocate unused budget',
        description: `Move ${this.formatCurrency(underutilizedCategories[0].unusedAmount)} from ${underutilizedCategories[0].name} to ${overspendingCategories[0].name}`,
        impact_amount: underutilizedCategories[0].unusedAmount,
        confidence_score: 0.7
      });
    }

    // 3. Seasonal spending alerts
    const seasonalSpikes = Object.entries(patterns).filter(([_, pattern]) => 
      pattern.trend === 'increasing' && pattern.trendStrength > 0.3
    );
    seasonalSpikes.forEach(([category, pattern]) => {
      recommendations.push({
        type: 'seasonal',
        category: category,
        title: `Prepare for ${category} seasonal increase`,
        description: `${category} spending has been increasing. Consider planning for higher expenses in this category.`,
        impact_amount: pattern.suggestedPreparation || 0,
        confidence_score: 0.6
      });
    });

    // 4. Goal-based optimization
    if (savingsGoals.length > 0) {
      const shortfall = this.calculateGoalShortfall(savingsGoals[0]);
      if (shortfall > 0) {
        recommendations.push({
          type: 'goal_based',
          title: 'Adjust spending to meet savings goal',
          description: `To reach your goal of ${this.formatCurrency(savingsGoals[0].target_amount)}, consider reducing spending by ${this.formatCurrency(shortfall)} per month.`,
          impact_amount: shortfall,
          confidence_score: 0.9
        });
      }
    }

    return recommendations;
  }

  // Identify spending patterns (increasing/decreasing trends)
  identifyPatterns(expenses) {
    const categoryTrends = {};
    
    expenses.forEach(expense => {
      if (!categoryTrends[expense.category]) {
        categoryTrends[expense.category] = [];
      }
      categoryTrends[expense.category].push({
        month: expense.month,
        amount: expense.amount
      });
    });

    // Calculate trend direction for each category
    Object.keys(categoryTrends).forEach(category => {
      const data = categoryTrends[category].sort((a, b) => a.month.localeCompare(b.month));
      const trend = this.calculateTrend(data.map(d => d.amount));
      categoryTrends[category] = {
        data,
        trend: trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable',
        trendStrength: Math.abs(trend)
      };
    });

    return categoryTrends;
  }

  // Calculate linear trend
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * values[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  // Detect seasonal patterns
  detectSeasonalTrends(expenses) {
    const monthlyAverages = {};
    
    // Calculate average spending by month across all years
    expenses.forEach(expense => {
      const month = expense.month.split('-')[1]; // Extract month number
      if (!monthlyAverages[month]) {
        monthlyAverages[month] = [];
      }
      monthlyAverages[month].push(expense.amount);
    });

    // Calculate seasonal factors
    const overallAverage = Object.values(monthlyAverages)
      .flat()
      .reduce((a, b) => a + b, 0) / Object.values(monthlyAverages).flat().length;

    const seasonalFactors = {};
    Object.keys(monthlyAverages).forEach(month => {
      const monthAverage = monthlyAverages[month].reduce((a, b) => a + b, 0) / monthlyAverages[month].length;
      seasonalFactors[month] = monthAverage / overallAverage;
    });

    return seasonalFactors;
  }

  // Analyze budget variances
  analyzeBudgetVariances(expenses, budgets) {
    const variances = [];
    
    // Group expenses by category and month
    const expensesByCategory = {};
    expenses.forEach(expense => {
      const key = `${expense.category}-${expense.month}`;
      expensesByCategory[key] = expense.amount;
    });

    // Group budgets by category and month
    const budgetsByCategory = {};
    budgets.forEach(budget => {
      const key = `${budget.category}-${budget.month}`;
      budgetsByCategory[key] = budget.budget_amount;
    });

    // Calculate variances
    Object.keys(budgetsByCategory).forEach(key => {
      const [category, month] = key.split('-');
      const budgetAmount = budgetsByCategory[key];
      const actualAmount = expensesByCategory[key] || 0;
      const variance = (actualAmount - budgetAmount) / budgetAmount;
      
      variances.push({
        name: category,
        month,
        budgetAmount,
        actualAmount,
        variance,
        overagePercentage: Math.max(0, variance * 100),
        suggestedReduction: Math.max(0, actualAmount - budgetAmount),
        unusedAmount: Math.max(0, budgetAmount - actualAmount)
      });
    });

    return variances;
  }

  // Calculate shortfall for savings goal
  calculateGoalShortfall(goal) {
    const today = new Date();
    const targetDate = new Date(goal.target_date);
    const monthsRemaining = Math.max(1, (targetDate.getFullYear() - today.getFullYear()) * 12 + targetDate.getMonth() - today.getMonth());
    
    const remainingAmount = goal.target_amount - goal.current_amount;
    const monthlyRequired = remainingAmount / monthsRemaining;
    
    // Assuming current monthly savings of 0 for simplicity
    return Math.max(0, monthlyRequired);
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

module.exports = BudgetOptimizer;

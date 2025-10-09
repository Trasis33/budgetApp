// Budget Optimizer - Analysis Engine for Budget Optimization Tips
// Created: 2025-07-12

const knex = require('../db/database');

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
  // For couples' budget app: Include split expenses from both users + personal expenses from current user
  async getExpenseHistory(months) {
    try {
      const userId = this.userId; // Capture userId for use in nested functions
      const rows = await knex('expenses')
        .select(
          'categories.name as category',
          knex.raw("strftime('%Y-%m', expenses.date) as month"),
          knex.raw('SUM(expenses.amount) as amount')
        )
        .join('categories', 'expenses.category_id', 'categories.id')
        .where('expenses.date', '>=', knex.raw(`date('now', '-${months} months')`))
        .where(function() {
          // Include personal expenses only for the current user
          this.where(function() {
            this.where('expenses.paid_by_user_id', userId)
                .andWhere('expenses.split_type', '=', 'personal');
          })
          // Include all shared/split expenses regardless of who paid
          .orWhere('expenses.split_type', '!=', 'personal');
        })
        .groupBy(['categories.name', knex.raw("strftime('%Y-%m', expenses.date)")])
        .orderBy('month', 'desc');
      
      return rows || [];
    } catch (error) {
      console.error('Error getting expense history:', error);
      throw error;
    }
  }

  // Get budget history for the last N months
  async getBudgetHistory(months) {
    try {
      const currentDate = new Date();
      const startYear = currentDate.getFullYear();
      const startMonth = currentDate.getMonth() + 1;
      
      const rows = await knex('budgets')
        .select(
          'categories.name as category',
          knex.raw("printf('%04d-%02d', budgets.year, budgets.month) as month"),
          knex.raw('budgets.amount as budget_amount')
        )
        .join('categories', 'budgets.category_id', 'categories.id')
        .where(function() {
          // Get budgets from the last N months
          for (let i = 0; i < months; i++) {
            const targetDate = new Date(startYear, startMonth - 1 - i, 1);
            const year = targetDate.getFullYear();
            const month = targetDate.getMonth() + 1;
            this.orWhere(function() {
              this.where('budgets.year', year).where('budgets.month', month);
            });
          }
        })
        .orderBy('budgets.year', 'desc')
        .orderBy('budgets.month', 'desc');
      
      return rows || [];
    } catch (error) {
      console.error('Error getting budget history:', error);
      throw error;
    }
  }

  // Get savings goals
  async getSavingsGoals() {
    try {
      const rows = await knex('savings_goals')
        .select('*')
        .where('user_id', this.userId)
        .where(function() {
          this.whereNull('target_date')
            .orWhere('target_date', '>', knex.raw("date('now')"));
        })
        .orderBy('created_at', 'desc');
      
      return rows || [];
    } catch (error) {
      console.error('Error getting savings goals:', error);
      // Return empty array if savings_goals table doesn't exist yet
      return [];
    }
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
      pattern.trend === 'increasing' && 
      (pattern.enhancedTrend.category === 'strong' || pattern.enhancedTrend.category === 'very_strong')
    );
    seasonalSpikes.forEach(([category, pattern]) => {
      const confidenceScore = pattern.enhancedTrend.confidence / 100;
      recommendations.push({
        type: 'seasonal',
        category: category,
        title: `Prepare for ${category} seasonal increase`,
        description: `${category} spending has been increasing with ${pattern.enhancedTrend.category} trend strength (${pattern.enhancedTrend.normalizedStrength}%). Consider planning for higher expenses in this category.`,
        impact_amount: pattern.suggestedPreparation || Math.round(pattern.enhancedTrend.monthlyChange * 2),
        confidence_score: Math.min(confidenceScore, 0.9)
      });
    });

    // 4. Goal-based optimization
    if (savingsGoals.length > 0) {
      savingsGoals.forEach(goal => {
        const plan = this.calculateGoalSavingsPlan(goal);
        if (!plan) {
          return;
        }

        recommendations.push({
          type: 'goal_based',
          goal_id: goal.id,
          goal_name: goal.goal_name,
          target_amount: plan.targetAmount,
          current_amount: plan.currentAmount,
          remaining_amount: plan.remainingAmount,
          months_remaining: plan.monthsRemaining,
          recommended_monthly: plan.recommendedMonthly,
          monthly_needed: plan.monthlyNeeded,
          title: goal.goal_name ? `Keep ${goal.goal_name} on track` : 'Keep your savings goal on track',
          description: this.buildGoalRecommendationCopy(goal, plan),
          impact_amount: plan.recommendedMonthly,
          confidence_score: plan.confidence
        });
      });
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
      const amounts = data.map(d => d.amount);
      const rawTrend = this.calculateTrend(amounts);
      const trendAnalysis = this.calculateEnhancedTrendStrength(amounts, rawTrend);
      
      categoryTrends[category] = {
        data,
        trend: rawTrend > 0.1 ? 'increasing' : rawTrend < -0.1 ? 'decreasing' : 'stable',
        trendStrength: Math.abs(rawTrend),
        enhancedTrend: trendAnalysis
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

  // Calculate enhanced trend strength with detailed metrics
  calculateEnhancedTrendStrength(amounts, rawTrend) {
    if (amounts.length < 2) {
      return {
        category: 'insufficient_data',
        normalizedStrength: 0,
        percentageChange: 0,
        monthlyChange: 0,
        volatility: 0,
        confidence: 0,
        description: 'Not enough data to calculate trend'
      };
    }

    // Calculate basic statistics
    const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const firstValue = amounts[0] || 0;
    const lastValue = amounts[amounts.length - 1] || 0;
    
    // Calculate percentage change from first to last value
    const percentageChange = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    
    // Calculate monthly change in absolute terms
    const monthlyChange = Math.abs(rawTrend);
    
    // Calculate volatility (standard deviation)
    const variance = amounts.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / amounts.length;
    const volatility = Math.sqrt(variance);
    
    // Normalize trend strength based on average spending
    const normalizedStrength = average > 0 ? (monthlyChange / average) * 100 : 0;
    
    // Calculate confidence based on data consistency and trend strength
    const dataPoints = amounts.length;
    const consistencyFactor = Math.min(dataPoints / 6, 1); // More data = higher confidence
    const strengthFactor = Math.min(normalizedStrength / 10, 1); // Reasonable strength = higher confidence
    const volatilityFactor = Math.max(0, 1 - (volatility / average)); // Lower volatility = higher confidence
    const confidence = (consistencyFactor + strengthFactor + volatilityFactor) / 3;
    
    // Categorize the trend strength
    let category, description;
    if (normalizedStrength < 2) {
      category = 'minimal';
      description = 'Very small change, spending is relatively stable';
    } else if (normalizedStrength < 5) {
      category = 'weak';
      description = 'Small change, minor trend detected';
    } else if (normalizedStrength < 15) {
      category = 'moderate';
      description = 'Noticeable change, clear trend present';
    } else if (normalizedStrength < 30) {
      category = 'strong';
      description = 'Significant change, strong trend detected';
    } else {
      category = 'very_strong';
      description = 'Major change, very strong trend - requires attention';
    }
    
    return {
      category,
      normalizedStrength: Math.round(normalizedStrength * 10) / 10,
      percentageChange: Math.round(percentageChange * 10) / 10,
      monthlyChange: Math.round(monthlyChange),
      volatility: Math.round(volatility),
      confidence: Math.round(confidence * 100),
      description,
      dataPoints,
      average: Math.round(average)
    };
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
  calculateGoalSavingsPlan(goal) {
    const targetAmount = Number(goal.target_amount || 0);
    const currentAmount = Number(goal.current_amount || 0);
    const remainingAmount = Math.max(0, targetAmount - currentAmount);

    if (remainingAmount <= 0) {
      return null;
    }

    const today = new Date();
    let monthsRemaining = null;

    if (goal.target_date) {
      const targetDate = new Date(goal.target_date);
      if (!Number.isNaN(targetDate.getTime())) {
        monthsRemaining = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());

        // Include the current month if there is still time left in the target month
        if (targetDate.getDate() >= today.getDate()) {
          monthsRemaining += 1;
        }
      }
    }

    if (!monthsRemaining || monthsRemaining <= 0) {
      monthsRemaining = 6; // Default horizon if no valid target date
    }

    const monthlyNeededRaw = remainingAmount / monthsRemaining;
    const smoothingWindow = Math.max(monthsRemaining, 6);
    const recommendedMonthlyRaw = remainingAmount / smoothingWindow;

    const monthlyNeeded = Math.max(0, Math.round(monthlyNeededRaw * 100) / 100);
    const recommendedMonthly = Math.max(0, Math.round(recommendedMonthlyRaw * 100) / 100);

    const confidence = smoothingWindow >= 12 ? 0.92 : smoothingWindow >= 6 ? 0.88 : 0.82;

    return {
      targetAmount,
      currentAmount,
      remainingAmount,
      monthsRemaining,
      monthlyNeeded,
      smoothingWindow,
      recommendedMonthly,
      confidence,
      targetDate: goal.target_date || null
    };
  }

  buildGoalRecommendationCopy(goal, plan) {
    const { monthsRemaining, recommendedMonthly, monthlyNeeded, targetDate } = plan;
    const monthsLabel = monthsRemaining === 1 ? 'month' : 'months';
    const recommendedText = this.formatCurrency(recommendedMonthly);
    const neededText = this.formatCurrency(monthlyNeeded);
    const goalName = goal.goal_name || 'your savings goal';

    if (monthsRemaining <= 2) {
      return `Only ${monthsRemaining} ${monthsLabel} remain for ${goalName}. You'd need about ${neededText} each month to hit the target—consider setting aside at least ${recommendedText} or updating the target date.`;
    }

    if (targetDate) {
      return `You have ${monthsRemaining} ${monthsLabel} until ${goalName} reaches its target (${new Date(targetDate).toLocaleDateString('en')}). Setting aside around ${recommendedText} each month keeps you on track (current pace requires ${neededText}).`;
    }

    return `Setting aside around ${recommendedText} each month will keep ${goalName} on track (target pace requires ${neededText}).`;
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount);
  }
}

module.exports = BudgetOptimizer;

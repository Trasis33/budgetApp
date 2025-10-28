/**
 * Budget Optimizer - Analysis Engine for Budget Optimization Tips
 * Analyzes spending patterns, budget variances, and generates personalized recommendations
 * for budget optimization and savings goals.
 * 
 * @class BudgetOptimizer
 * @created 2025-07-12
 * @filepath /Users/fredriklanga/Documents/projects2024/budgetApp/server/utils/budgetOptimizer.js
 */
// Budget Optimizer - Analysis Engine for Budget Optimization Tips
// Created: 2025-07-12

const knex = require('../db/database');

/**
 * Creates an instance of BudgetOptimizer.
 * 
 * @constructor
 * @param {number} userId - The ID of the user to analyze
 */
class BudgetOptimizer {
  constructor(context) {
    if (typeof context === 'number') {
      this.scope = 'mine';
      this.viewerId = context;
      this.partnerId = null;
      this.payerIds = [context];
      this.sharedOnly = false;
    } else if (context && typeof context === 'object') {
      this.scope = context.scope || 'ours';
      this.viewerId = context.viewerId;
      this.partnerId = context.counterpartId ?? null;
      this.payerIds = Array.isArray(context.payerIds)
        ? context.payerIds.filter((id) => id !== null && id !== undefined)
        : [];
      this.sharedOnly = Boolean(context.sharedOnly);
    } else {
      throw new Error('BudgetOptimizer requires a user context');
    }
  }

/**
 * Analyzes spending patterns and generates comprehensive insights.
 * Combines expense history, budgets, and savings goals to identify patterns,
 * seasonal trends, and budget variances.
 * 
 * @async
 * @returns {Promise<Object>} Analysis results containing:
 *   - patterns: Spending pattern trends by category
 *   - seasonalTrends: Seasonal spending factors by month
 *   - budgetVariances: Differences between budgeted and actual spending
 *   - recommendations: Array of optimization recommendations
 * @throws {Error} If database queries fail
 */
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

/**
 * Retrieves expense history for the last N months.
 * For couples' budget app: Includes split expenses from both users and personal expenses from current user.
 * 
 * @async
 * @param {number} months - Number of months to retrieve
 * @returns {Promise<Array<Object>>} Array of expense records grouped by category and month
 * @throws {Error} If database query fails
 */
  async getExpenseHistory(months) {
    try {
      if (!this.payerIds || this.payerIds.length === 0) {
        return [];
      }
      const rows = await knex('expenses')
        .select(
          'categories.name as category',
          knex.raw("strftime('%Y-%m', expenses.date) as month"),
          knex.raw('SUM(expenses.amount) as amount')
        )
        .join('categories', 'expenses.category_id', 'categories.id')
        .where('expenses.date', '>=', knex.raw(`date('now', '-${months} months')`))
        .whereIn('expenses.paid_by_user_id', this.payerIds)
        .modify((query) => {
          if (this.sharedOnly) {
            query.andWhere(function () {
              this.whereNull('expenses.split_type')
                .orWhereRaw("LOWER(expenses.split_type) NOT IN ('personal','personal_only')");
            });
          }
        })
        .groupBy(['categories.name', knex.raw("strftime('%Y-%m', expenses.date)")])
        .orderBy('month', 'desc');
      
      return rows || [];
    } catch (error) {
      console.error('Error getting expense history:', error);
      throw error;
    }
  }

/**
 * Retrieves budget history for the last N months.
 * 
 * @async
 * @param {number} months - Number of months to retrieve
 * @returns {Promise<Array<Object>>} Array of budget records grouped by category and month
 * @throws {Error} If database query fails
 */
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

/**
 * Retrieves active savings goals for the user.
 * 
 * @async
 * @returns {Promise<Array<Object>>} Array of active savings goals (empty array if table doesn't exist)
 * @throws {Error} If database query fails (except missing table)
 */
  async getSavingsGoals() {
    try {
      let targetUserIds = [this.viewerId];
      if (this.scope === 'partner' && this.partnerId) {
        targetUserIds = [this.partnerId];
      } else if (this.scope === 'ours' && this.partnerId) {
        targetUserIds = [this.viewerId, this.partnerId];
      }

      const rows = await knex('savings_goals')
        .select('*')
        .whereIn('user_id', targetUserIds)
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

/**
 * Generates specific optimization recommendations based on analysis results.
 * Creates recommendations for:
 * - Reducing overspending in categories
 * - Reallocating unused budget
 * - Preparing for seasonal spending spikes
 * - Staying on track with savings goals
 * 
 * @param {Object} patterns - Spending pattern trends by category
 * @param {Array<Object>} budgetVariances - Budget variance data
 * @param {Array<Object>} savingsGoals - Active savings goals
 * @returns {Array<Object>} Array of recommendation objects with type, title, description, impact_amount, and confidence_score
 */
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

/**
 * Identifies spending patterns and trends for each category.
 * Calculates trend direction (increasing/decreasing/stable) and enhanced trend metrics.
 * 
 * @param {Array<Object>} expenses - Expense history data
 * @returns {Object} Category trends with data, trend direction, strength, and enhanced metrics
 */
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

/**
 * Calculates linear trend (slope) from an array of values.
 * Uses least squares method to determine trend direction and strength.
 * 
 * @param {Array<number>} values - Array of numeric values
 * @returns {number} Slope value indicating trend direction and strength
 */
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

/**
 * Calculates enhanced trend strength with detailed metrics.
 * Provides comprehensive trend analysis including volatility, confidence, and categorization.
 * 
 * @param {Array<number>} amounts - Array of spending amounts
 * @param {number} rawTrend - Raw trend slope value
 * @returns {Object} Enhanced trend analysis containing:
 *   - category: Trend strength category (minimal/weak/moderate/strong/very_strong)
 *   - normalizedStrength: Normalized trend strength as percentage
 *   - percentageChange: Total percentage change from first to last value
 *   - monthlyChange: Average monthly change in absolute terms
 *   - volatility: Standard deviation of amounts
 *   - confidence: Confidence score (0-100)
 *   - description: Human-readable trend description
 *   - dataPoints: Number of data points analyzed
 *   - average: Average spending amount
 */
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

/**
 * Detects seasonal spending patterns across all years.
 * Calculates seasonal factors by comparing monthly averages to overall average.
 * 
 * @param {Array<Object>} expenses - Expense history data
 * @returns {Object} Seasonal factors by month (1-12)
 */
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

/**
 * Analyzes variances between budgeted and actual spending.
 * Calculates overage percentages and suggests reductions or identifies unused budget.
 * 
 * @param {Array<Object>} expenses - Expense history data
 * @param {Array<Object>} budgets - Budget history data
 * @returns {Array<Object>} Array of variance objects with:
 *   - name: Category name
 *   - month: Year-month string
 *   - budgetAmount: Budgeted amount
 *   - actualAmount: Actual spending
 *   - variance: Variance ratio
 *   - overagePercentage: Overage as percentage
 *   - suggestedReduction: Suggested reduction amount
 *   - unusedAmount: Unused budget amount
 */
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
      const rawBudget = Number(budgetsByCategory[key] || 0);
      const rawActual = Number(expensesByCategory[key] || 0);
      let variance = 0;
      if (rawBudget > 0) {
        variance = (rawActual - rawBudget) / rawBudget;
      } else if (rawActual > 0) {
        variance = 1;
      }
      
      variances.push({
        name: category,
        month,
        budgetAmount: rawBudget,
        actualAmount: rawActual,
        variance,
        overagePercentage: Math.max(0, variance * 100),
        suggestedReduction: Math.max(0, rawActual - rawBudget),
        unusedAmount: Math.max(0, rawBudget - rawActual)
      });
    });

    return variances;
  }

/**
 * Calculates savings plan for achieving a goal.
 * Determines monthly savings needed and recommended based on target date and remaining amount.
 * 
 * @param {Object} goal - Savings goal object with target_amount, current_amount, and target_date
 * @returns {Object|null} Savings plan with monthly recommendations and confidence, or null if goal is complete
 */
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

/**
 * Builds human-readable recommendation copy for savings goals.
 * Creates contextual messages based on time remaining and savings pace.
 * 
 * @param {Object} goal - Savings goal object
 * @param {Object} plan - Calculated savings plan
 * @returns {string} Formatted recommendation text
 */
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

/**
 * Formats a number as currency in Swedish Krona (SEK).
 * 
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
  formatCurrency(amount) {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount);
  }
}

module.exports = BudgetOptimizer;

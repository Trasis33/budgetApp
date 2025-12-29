/**
 * Budget Optimizer - Analysis Engine for Budget Optimization Tips
 * Analyzes spending patterns, budget variances, and generates personalized recommendations
 * for budget optimization and savings goals.
 * 
 * @class BudgetOptimizer
 * @created 2025-07-12
 * @updated 2025-12-29 - Added enhanced recommendation logic with category-specific tips
 * @filepath /Users/fredriklanga/Documents/projects2024/budgetApp/server/utils/budgetOptimizer.js
 */
// Budget Optimizer - Analysis Engine for Budget Optimization Tips
// Created: 2025-07-12

const knex = require('../db/database');

// Category-specific spending tips database
const CATEGORY_TIPS = {
  'Groceries': [
    { id: 'grocery_1', text: 'Plan meals for the week before shopping', potentialSavings: 800, difficulty: 'easy' },
    { id: 'grocery_2', text: 'Buy store brands instead of name brands', potentialSavings: 500, difficulty: 'easy' },
    { id: 'grocery_3', text: 'Shop with a list and stick to it', potentialSavings: 600, difficulty: 'moderate' },
    { id: 'grocery_4', text: 'Buy in bulk for non-perishables', potentialSavings: 400, difficulty: 'easy' },
    { id: 'grocery_5', text: 'Reduce food waste by using leftovers', potentialSavings: 700, difficulty: 'moderate' }
  ],
  'Dining Out': [
    { id: 'dining_1', text: 'Pack lunch instead of eating out', potentialSavings: 1200, difficulty: 'moderate' },
    { id: 'dining_2', text: 'Limit restaurant visits to once per week', potentialSavings: 1500, difficulty: 'moderate' },
    { id: 'dining_3', text: 'Make coffee at home instead of cafes', potentialSavings: 800, difficulty: 'easy' },
    { id: 'dining_4', text: 'Use happy hour specials and lunch menus', potentialSavings: 600, difficulty: 'easy' },
    { id: 'dining_5', text: 'Cook at home more often', potentialSavings: 2000, difficulty: 'moderate' }
  ],
  'Entertainment': [
    { id: 'ent_1', text: 'Audit streaming subscriptions and cancel unused ones', potentialSavings: 300, difficulty: 'easy' },
    { id: 'ent_2', text: 'Look for free community events', potentialSavings: 500, difficulty: 'easy' },
    { id: 'ent_3', text: 'Use library for books and movies', potentialSavings: 400, difficulty: 'easy' },
    { id: 'ent_4', text: 'Host game nights instead of going out', potentialSavings: 600, difficulty: 'moderate' },
    { id: 'ent_5', text: 'Take advantage of free museum days', potentialSavings: 300, difficulty: 'easy' }
  ],
  'Transportation': [
    { id: 'trans_1', text: 'Carpool or use public transit when possible', potentialSavings: 1000, difficulty: 'moderate' },
    { id: 'trans_2', text: 'Combine errands to reduce fuel costs', potentialSavings: 400, difficulty: 'easy' },
    { id: 'trans_3', text: 'Use fuel price comparison apps', potentialSavings: 300, difficulty: 'easy' },
    { id: 'trans_4', text: 'Keep up with vehicle maintenance to improve efficiency', potentialSavings: 500, difficulty: 'moderate' },
    { id: 'trans_5', text: 'Walk or bike for short trips', potentialSavings: 600, difficulty: 'moderate' }
  ],
  'Default': [
    { id: 'default_1', text: 'Track all spending in this category for a month', potentialSavings: null, difficulty: 'easy' },
    { id: 'default_2', text: 'Set up spending alerts for this category', potentialSavings: null, difficulty: 'easy' },
    { id: 'default_3', text: 'Review and eliminate unnecessary expenses', potentialSavings: null, difficulty: 'moderate' },
    { id: 'default_4', text: 'Look for cheaper alternatives or better deals', potentialSavings: null, difficulty: 'moderate' },
    { id: 'default_5', text: 'Consider if each purchase is a need or want', potentialSavings: null, difficulty: 'hard' }
  ]
};

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
  async analyzeSpendingPatterns(proposedBudgets = null) {
    try {
      const expenses = await this.getExpenseHistory(12); // 12 months
      let budgets = await this.getBudgetHistory(12);
      const savingsGoals = await this.getSavingsGoals();
      
      // Fetch ALL categories with is_fixed flag for accurate detection
      const allCategories = await knex('categories').select('id', 'name', 'is_fixed');
      const categoryFixedMap = {};
      allCategories.forEach(cat => {
        categoryFixedMap[cat.name] = Boolean(cat.is_fixed);
      });
      console.log('[BudgetOptimizer] Category is_fixed map:', JSON.stringify(categoryFixedMap));
      
      // If proposed budgets provided (from Step 2), use them for the latest month
      if (proposedBudgets && Object.keys(proposedBudgets).length > 0) {
        console.log('[BudgetOptimizer] Using proposed budgets from Step 2:', JSON.stringify(proposedBudgets));
        
        // Get category names from database
        const categories = await knex('categories')
          .select('id', 'name', 'is_fixed')
          .whereIn('id', Object.keys(proposedBudgets).map(id => parseInt(id)));
        
        console.log('[BudgetOptimizer] Found categories for proposed budgets:', categories.map(c => `${c.id}:${c.name}(fixed:${Boolean(c.is_fixed)})`).join(', '));
        
        const categoryMap = {};
        categories.forEach(cat => {
          categoryMap[cat.id] = cat;
        });
        
        // Get current month
        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        console.log('[BudgetOptimizer] Current month:', currentMonth);
        
        // Replace latest month budgets with proposed values
        budgets = budgets.filter(b => b.month !== currentMonth);
        
        Object.entries(proposedBudgets).forEach(([categoryId, amount]) => {
          const category = categoryMap[categoryId];
          if (category) {
            budgets.push({
              category: category.name,
              is_fixed: Boolean(category.is_fixed),
              month: currentMonth,
              budget_amount: amount
            });
            console.log(`[BudgetOptimizer] Added proposed budget: ${category.name} = ${amount} (is_fixed: ${Boolean(category.is_fixed)})`);
          }
        });
      }
      
      // Ensure all budgets have correct is_fixed from master category list
      budgets = budgets.map(b => ({
        ...b,
        is_fixed: categoryFixedMap[b.category] !== undefined ? categoryFixedMap[b.category] : Boolean(b.is_fixed)
      }));
      
      const patterns = this.identifyPatterns(expenses);
      const seasonalTrends = this.detectSeasonalTrends(expenses);
      const budgetVariances = this.analyzeBudgetVariances(expenses, budgets);
      
      const recommendationResult = this.generateRecommendations(patterns, budgetVariances, savingsGoals);
      
      return {
        patterns,
        seasonalTrends,
        budgetVariances,
        recommendations: recommendationResult.recommendations,
        structuredInsights: recommendationResult.structuredInsights
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
          'categories.is_fixed as is_fixed',
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
 * Generates enhanced recommendations with structured insights.
 * Returns separate arrays for overspending, underspending, and on-track categories.
 * Also includes legacy recommendations for backward compatibility.
 * 
 * @param {Object} patterns - Spending pattern trends by category
 * @param {Array<Object>} budgetVariances - Budget variance data
 * @param {Array<Object>} savingsGoals - Active savings goals
 * @returns {Object} Object containing:
 *   - recommendations: Legacy format recommendations
 *   - structuredInsights: Enhanced insights (overspending, underspending, onTrack)
 */
  generateRecommendations(patterns, budgetVariances, savingsGoals) {
    const recommendations = [];
    const overspendingInsights = [];
    const underspendingInsights = [];
    const onTrackInsights = [];

    // Group variances by category (latest month only)
    const latestVariances = {};
    budgetVariances.forEach(v => {
      if (!latestVariances[v.name] || v.month > latestVariances[v.name].month) {
        latestVariances[v.name] = v;
      }
    });

    // Process each category with enhanced logic
    Object.values(latestVariances).forEach(variance => {
      const categoryPattern = patterns[variance.name];
      const historicalData = categoryPattern?.data || [];
      
      // Ensure isFixed is a boolean (SQLite returns 0/1)
      const isFixed = Boolean(variance.isFixed);
      
      console.log(`[generateRecommendations] Processing ${variance.name}: budget=${variance.budgetAmount}, actual=${variance.actualAmount}, isFixed=${isFixed} (raw: ${variance.isFixed})`);
      
      // Convert to format expected by recommendation methods
      const formattedHistory = historicalData.map(d => ({
        month: d.month,
        amount: d.amount,
        budget: variance.budgetAmount // Use current budget as historical budget
      }));

      // Try overspending recommendation
      const overspending = this.calculateOverspendingRecommendation(
        variance.name,
        variance.budgetAmount,
        variance.actualAmount,
        formattedHistory,
        isFixed
      );

      if (overspending) {
        overspendingInsights.push(overspending);
        
        // Add legacy format recommendation
        recommendations.push({
          type: 'reduction',
          category: variance.name,
          title: `Reduce ${variance.name} spending`,
          description: `You're spending ${overspending.overagePercentage}% over budget. ${overspending.isRecurringPattern ? 'This is a recurring pattern.' : 'This appears to be an anomaly.'}`,
          impact_amount: overspending.suggestedSpendingReduction,
          confidence_score: 0.8,
          enhanced: overspending
        });
        return;
      }

      // Try on-track recommendation
      const onTrack = this.calculateOnTrackRecommendation(
        variance.name,
        variance.budgetAmount,
        variance.actualAmount,
        formattedHistory
      );

      if (onTrack) {
        onTrackInsights.push(onTrack);
        return;
      }

      // Try underspending recommendation
      const underspending = this.calculateUnderspendingRecommendation(
        variance.name,
        variance.budgetAmount,
        variance.actualAmount,
        formattedHistory,
        overspendingInsights.length > 0
      );

      if (underspending) {
        underspendingInsights.push(underspending);
        
        // Add legacy format recommendation if significant
        if (underspending.potentialReallocation > 500) {
          recommendations.push({
            type: 'reallocation',
            category: variance.name,
            title: 'Reallocate unused budget',
            description: `You have ${this.formatCurrency(underspending.unusedAmount)} unused in ${variance.name}.`,
            impact_amount: underspending.potentialReallocation,
            confidence_score: 0.7,
            enhanced: underspending
          });
        }
      }
    });

    // Add seasonal spending alerts (keep existing logic)
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

    // Add goal-based optimization (keep existing logic)
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

    return {
      recommendations,
      structuredInsights: {
        overspending: overspendingInsights,
        underspending: underspendingInsights,
        onTrack: onTrackInsights
      }
    };
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
    
    // Use a separator that won't appear in category names or months
    const SEP = '|||';
    
    // Group expenses by category and month
    const expensesByCategory = {};
    expenses.forEach(expense => {
      const key = `${expense.category}${SEP}${expense.month}`;
      expensesByCategory[key] = expense.amount;
    });

    // Group budgets by category and month, and track is_fixed flag
    const budgetsByCategory = {};
    const categoryIsFixed = {};
    budgets.forEach(budget => {
      const key = `${budget.category}${SEP}${budget.month}`;
      budgetsByCategory[key] = budget.budget_amount;
      categoryIsFixed[budget.category] = Boolean(budget.is_fixed);
    });

    console.log('[analyzeBudgetVariances] Budget keys:', Object.keys(budgetsByCategory).slice(0, 5));
    console.log('[analyzeBudgetVariances] isFixed map:', categoryIsFixed);

    // Calculate variances
    Object.keys(budgetsByCategory).forEach(key => {
      const [category, month] = key.split(SEP);
      const rawBudget = Number(budgetsByCategory[key] || 0);
      const rawActual = Number(expensesByCategory[key] || 0);
      let variance = 0;
      if (rawBudget > 0) {
        variance = (rawActual - rawBudget) / rawBudget;
      } else if (rawActual > 0) {
        variance = 1;
      }
      
      const isFixed = categoryIsFixed[category] || false;
      
      variances.push({
        name: category,
        month,
        budgetAmount: rawBudget,
        actualAmount: rawActual,
        variance,
        overagePercentage: Math.max(0, variance * 100),
        suggestedReduction: Math.max(0, rawActual - rawBudget),
        unusedAmount: Math.max(0, rawBudget - rawActual),
        isFixed
      });
    });

    console.log('[analyzeBudgetVariances] Sample variances:', variances.slice(0, 3).map(v => `${v.name}: budget=${v.budgetAmount}, actual=${v.actualAmount}, isFixed=${v.isFixed}`));

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

  /**
   * Generates category-specific spending tips based on reduction target.
   * Prioritizes tips by potential savings and difficulty.
   * 
   * @param {string} categoryName - Name of the category
   * @param {number} reductionTarget - Target reduction amount
   * @returns {Array<Object>} Array of up to 3 relevant tips
   */
  generateCategoryTips(categoryName, reductionTarget) {
    const tips = CATEGORY_TIPS[categoryName] || CATEGORY_TIPS['Default'];
    
    // Sort tips by relevance (potential savings close to reduction target)
    const sortedTips = [...tips].sort((a, b) => {
      if (!a.potentialSavings && !b.potentialSavings) return 0;
      if (!a.potentialSavings) return 1;
      if (!b.potentialSavings) return -1;
      
      const aDiff = Math.abs(a.potentialSavings - reductionTarget);
      const bDiff = Math.abs(b.potentialSavings - reductionTarget);
      return aDiff - bDiff;
    });
    
    // Return top 3 tips
    return sortedTips.slice(0, 3);
  }

  /**
   * Calculates enhanced overspending recommendations with historical context.
   * Provides multiple budget adjustment options and actionable spending tips.
   * 
   * @param {string} categoryName - Category name
   * @param {number} budgetAmount - Current budget amount
   * @param {number} actualAmount - Actual spending amount
   * @param {Array<Object>} historicalData - Historical spending data
   * @param {boolean} isFixed - Whether this is a fixed expense (bill)
   * @returns {Object|null} Overspending insight or null if not overspending
   */
  calculateOverspendingRecommendation(categoryName, budgetAmount, actualAmount, historicalData, isFixed = false) {
    // Fixed expenses (bills) should NEVER show overspending recommendations
    // Bills are exact amounts that can't be reduced through behavioral changes
    if (isFixed) {
      return null;
    }
    
    const overageAmount = actualAmount - budgetAmount;
    const overagePercentage = budgetAmount > 0 ? (overageAmount / budgetAmount) * 100 : 0;
    
    // Only flag as overspending if >10% over budget
    if (overagePercentage < 10) {
      return null;
    }
    
    // Check if this is a recurring pattern (need at least 2 months of data)
    const recentMonths = historicalData.slice(-3);
    const overspentMonths = recentMonths.filter(m => m.amount > m.budget).length;
    const isRecurringPattern = recentMonths.length >= 2 && overspentMonths >= 2;
    
    // Calculate statistics
    const amounts = historicalData.length > 0 ? historicalData.map(h => h.amount) : [actualAmount];
    const averageMonthlySpend = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const recentAmounts = amounts.slice(-3);
    const highestRecentSpend = recentAmounts.length > 0 ? Math.max(...recentAmounts) : actualAmount;
    const lowestRecentSpend = recentAmounts.length > 0 ? Math.min(...recentAmounts) : actualAmount;
    
    // Calculate realistic budget target - should always differ from current budget
    let realisticBudgetTarget;
    if (isRecurringPattern) {
      // If recurring, suggest average + 10% buffer
      realisticBudgetTarget = Math.round(averageMonthlySpend * 1.1);
    } else {
      // If anomaly, suggest a moderate increase (halfway between current and actual)
      realisticBudgetTarget = Math.round((budgetAmount + actualAmount) / 2);
    }
    
    // Ensure realisticBudgetTarget is different from budgetAmount
    if (realisticBudgetTarget === budgetAmount) {
      realisticBudgetTarget = Math.round(budgetAmount * 1.15);
    }
    
    // Calculate suggested spending reduction
    const suggestedSpendingReduction = Math.round(actualAmount - budgetAmount);
    
    // Determine difficulty
    const varianceFromAverage = Math.abs(actualAmount - averageMonthlySpend) / averageMonthlySpend;
    let reductionDifficulty;
    if (varianceFromAverage < 0.15) {
      reductionDifficulty = 'easy';
    } else if (varianceFromAverage < 0.35) {
      reductionDifficulty = 'moderate';
    } else {
      reductionDifficulty = 'challenging';
    }
    
    // Generate tips only for flexible expenses (not fixed bills)
    const tips = isFixed ? [] : this.generateCategoryTips(categoryName, suggestedSpendingReduction);
    
    return {
      type: 'overspending',
      categoryName,
      budgetAmount,
      actualAmount,
      overageAmount,
      overagePercentage: Math.round(overagePercentage),
      isRecurringPattern,
      averageMonthlySpend: Math.round(averageMonthlySpend),
      highestRecentSpend: Math.round(highestRecentSpend),
      lowestRecentSpend: Math.round(lowestRecentSpend),
      realisticBudgetTarget,
      suggestedSpendingReduction,
      reductionDifficulty,
      tips
    };
  }

  /**
   * Calculates underspending recommendations with reallocation suggestions.
   * 
   * @param {string} categoryName - Category name
   * @param {number} budgetAmount - Current budget amount
   * @param {number} actualAmount - Actual spending amount
   * @param {Array<Object>} historicalData - Historical spending data
   * @param {boolean} hasOverspending - Whether there are overspending categories
   * @returns {Object|null} Underspending insight or null if not underspending
   */
  calculateUnderspendingRecommendation(categoryName, budgetAmount, actualAmount, historicalData, hasOverspending) {
    const unusedAmount = budgetAmount - actualAmount;
    const utilizationPercentage = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0;
    
    // Only flag as underspending if <70% utilized
    if (utilizationPercentage >= 70) {
      return null;
    }
    
    // Calculate average utilization over last 3 months
    const recentMonths = historicalData.slice(-3);
    const avgUtilization = recentMonths.length > 0
      ? recentMonths.reduce((sum, m) => sum + (m.budget > 0 ? (m.amount / m.budget) * 100 : 0), 0) / recentMonths.length
      : utilizationPercentage;
    
    const isConsistentPattern = recentMonths.length >= 3 && avgUtilization < 75;
    
    // Determine recommended action
    let recommendedAction;
    if (hasOverspending) {
      recommendedAction = 'reallocate';
    } else if (isConsistentPattern) {
      recommendedAction = 'reduce_budget';
    } else {
      recommendedAction = 'boost_savings';
    }
    
    // Calculate suggested new budget (average + 15% buffer)
    const amounts = historicalData.map(h => h.amount);
    const averageSpend = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const suggestedNewBudget = Math.round(averageSpend * 1.15);
    
    // Potential reallocation amount
    const potentialReallocation = Math.round(budgetAmount - suggestedNewBudget);
    
    return {
      type: 'underspending',
      categoryName,
      budgetAmount,
      actualAmount,
      unusedAmount: Math.round(unusedAmount),
      utilizationPercentage: Math.round(utilizationPercentage),
      recommendedAction,
      suggestedNewBudget,
      potentialReallocation,
      isConsistentPattern,
      averageUtilization: Math.round(avgUtilization)
    };
  }

  /**
   * Calculates on-track recommendations for categories within budget.
   * 
   * @param {string} categoryName - Category name
   * @param {number} budgetAmount - Current budget amount
   * @param {number} actualAmount - Actual spending amount
   * @param {Array<Object>} historicalData - Historical spending data
   * @returns {Object|null} On-track insight or null if not on track
   */
  calculateOnTrackRecommendation(categoryName, budgetAmount, actualAmount, historicalData) {
    const utilizationPercentage = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0;
    
    // On track if between 70-110% utilization
    if (utilizationPercentage < 70 || utilizationPercentage > 110) {
      return null;
    }
    
    // Count consecutive on-track months
    const recentMonths = historicalData.slice(-6).reverse();
    let consecutiveOnTrackMonths = 0;
    for (const month of recentMonths) {
      const util = month.budget > 0 ? (month.amount / month.budget) * 100 : 0;
      if (util >= 70 && util <= 110) {
        consecutiveOnTrackMonths++;
      } else {
        break;
      }
    }
    
    // Calculate trend
    const amounts = historicalData.slice(-3).map(h => h.amount);
    let trend = 'stable';
    if (amounts.length >= 2) {
      const change = ((amounts[amounts.length - 1] - amounts[0]) / amounts[0]) * 100;
      if (change < -5) trend = 'improving';
      else if (change > 5) trend = 'slightly_increasing';
    }
    
    // Generate message
    let message;
    if (consecutiveOnTrackMonths >= 3) {
      message = `Great job! You've stayed on budget for ${consecutiveOnTrackMonths} months in a row.`;
    } else if (trend === 'improving') {
      message = `You're doing well and your spending is trending down.`;
    } else {
      message = `You're on track with your budget. Keep it up!`;
    }
    
    return {
      type: 'on_track',
      categoryName,
      budgetAmount,
      actualAmount,
      utilizationPercentage: Math.round(utilizationPercentage),
      consecutiveOnTrackMonths,
      trend,
      message
    };
  }
}

module.exports = BudgetOptimizer;

export interface MonthlySpend {
  month: string;
  amount: number;
  budget: number;
}

export interface SpendingTip {
  id: string;
  text: string;
  potentialSavings?: number;
  difficulty: 'easy' | 'moderate' | 'hard';
}

export interface OverspendingInsight {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  
  budgetAmount: number;
  actualAmount: number;
  overageAmount: number;
  overagePercentage: number;
  
  isRecurringPattern: boolean;
  averageMonthlySpend: number;
  highestRecentSpend: number;
  lowestRecentSpend: number;
  
  realisticBudgetTarget: number;
  suggestedSpendingReduction: number;
  reductionDifficulty: 'easy' | 'moderate' | 'challenging';
  
  tips: SpendingTip[];
}

export interface OnTrackInsight {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  budgetAmount: number;
  actualAmount: number;
  utilizationPercentage: number;
  consecutiveOnTrackMonths: number;
  trend: 'improving' | 'stable' | 'slightly_increasing';
  message: string;
}

export interface UnderspendingInsight {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  budgetAmount: number;
  actualAmount: number;
  unusedAmount: number;
  utilizationPercentage: number;
  
  recommendedAction: 'reallocate' | 'reduce_budget' | 'boost_savings';
  suggestedNewBudget: number;
  potentialReallocation: number;
  
  isConsistentPattern: boolean;
  averageUtilization: number;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  confidence: number;
  projection: number;
  volatility: 'low' | 'medium' | 'high';
}

const CATEGORY_TIPS: Record<string, SpendingTip[]> = {
  'groceries': [
    { id: 'meal-plan', text: 'Plan weekly meals before shopping to avoid impulse buys', difficulty: 'easy' },
    { id: 'store-brands', text: 'Switch to store brands for staples (saves ~20%)', difficulty: 'easy', potentialSavings: 500 },
    { id: 'bulk-buy', text: 'Buy non-perishables in bulk when on sale', difficulty: 'moderate' },
    { id: 'reduce-waste', text: 'Track expiration dates to reduce food waste', difficulty: 'moderate' },
  ],
  'dining out': [
    { id: 'lunch-prep', text: 'Bring lunch to work 3x per week', difficulty: 'moderate', potentialSavings: 800 },
    { id: 'coffee-home', text: 'Make coffee at home instead of buying', difficulty: 'easy', potentialSavings: 400 },
    { id: 'happy-hour', text: 'Choose happy hour specials over dinner prices', difficulty: 'easy' },
  ],
  'entertainment': [
    { id: 'streaming-audit', text: 'Audit streaming subscriptions - cancel unused ones', difficulty: 'easy', potentialSavings: 200 },
    { id: 'free-events', text: 'Look for free local events and activities', difficulty: 'easy' },
    { id: 'library', text: 'Use library for books, movies, and digital content', difficulty: 'easy' },
  ],
  'transportation': [
    { id: 'carpool', text: 'Carpool or use public transit 2x per week', difficulty: 'moderate', potentialSavings: 600 },
    { id: 'fuel-prices', text: 'Use apps to find cheapest fuel prices', difficulty: 'easy', potentialSavings: 200 },
    { id: 'maintenance', text: 'Keep up with maintenance to avoid costly repairs', difficulty: 'moderate' },
  ],
  'default': [
    { id: 'track-daily', text: 'Track spending daily to stay aware', difficulty: 'easy' },
    { id: 'wait-24h', text: 'Wait 24 hours before non-essential purchases', difficulty: 'easy' },
    { id: 'set-limit', text: 'Set a weekly spending limit and check progress', difficulty: 'moderate' },
  ]
};

function generateCategoryTips(categoryName: string, reductionTarget: number): SpendingTip[] {
  const normalizedName = categoryName.toLowerCase();
  const categoryTips = CATEGORY_TIPS[normalizedName] || CATEGORY_TIPS['default'];
  
  return categoryTips
    .sort((a, b) => {
      const aRelevance = (a.potentialSavings || 0) >= reductionTarget * 0.2 ? 1 : 0;
      const bRelevance = (b.potentialSavings || 0) >= reductionTarget * 0.2 ? 1 : 0;
      return bRelevance - aRelevance;
    })
    .slice(0, 3);
}

export function calculateOverspendingRecommendation(
  categoryId: number,
  categoryName: string,
  categoryColor: string,
  currentBudget: number,
  currentActual: number,
  historicalData: MonthlySpend[]
): OverspendingInsight | null {
  
  if (currentActual <= currentBudget || currentBudget === 0) {
    return null;
  }

  const overagePercentage = ((currentActual - currentBudget) / currentBudget) * 100;
  
  if (overagePercentage < 10) {
    return null;
  }

  const last3Months = historicalData.slice(-3);
  
  if (last3Months.length < 2) {
    return null;
  }

  const averageSpend = last3Months.reduce((sum, m) => sum + m.amount, 0) / last3Months.length;
  const highestSpend = Math.max(...last3Months.map(m => m.amount));
  const lowestSpend = Math.min(...last3Months.map(m => m.amount));
  
  const overspendingMonths = last3Months.filter(m => m.amount > m.budget).length;
  const isRecurringPattern = overspendingMonths >= 2;
  
  let realisticBudgetTarget: number;
  if (isRecurringPattern) {
    realisticBudgetTarget = Math.round(averageSpend * 1.1);
  } else {
    realisticBudgetTarget = currentBudget;
  }
  
  const suggestedSpendingReduction = currentActual - currentBudget;
  
  const varianceFromAverage = (currentActual - averageSpend) / averageSpend;
  let reductionDifficulty: 'easy' | 'moderate' | 'challenging';
  if (varianceFromAverage < 0.15) {
    reductionDifficulty = 'easy';
  } else if (varianceFromAverage < 0.30) {
    reductionDifficulty = 'moderate';
  } else {
    reductionDifficulty = 'challenging';
  }
  
  const tips = generateCategoryTips(categoryName, suggestedSpendingReduction);
  
  return {
    categoryId,
    categoryName,
    categoryColor,
    budgetAmount: currentBudget,
    actualAmount: currentActual,
    overageAmount: currentActual - currentBudget,
    overagePercentage,
    isRecurringPattern,
    averageMonthlySpend: averageSpend,
    highestRecentSpend: highestSpend,
    lowestRecentSpend: lowestSpend,
    realisticBudgetTarget,
    suggestedSpendingReduction,
    reductionDifficulty,
    tips
  };
}

function calculateTrend(monthlyData: MonthlySpend[]): 'improving' | 'stable' | 'slightly_increasing' {
  if (monthlyData.length < 2) return 'stable';
  
  const changes: number[] = [];
  for (let i = 1; i < monthlyData.length; i++) {
    const prev = monthlyData[i - 1].amount;
    const curr = monthlyData[i].amount;
    if (prev > 0) {
      changes.push(((curr - prev) / prev) * 100);
    }
  }
  
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  
  if (avgChange < -5) return 'improving';
  if (avgChange > 5) return 'slightly_increasing';
  return 'stable';
}

export function calculateOnTrackRecommendation(
  categoryId: number,
  categoryName: string,
  categoryColor: string,
  currentBudget: number,
  currentActual: number,
  historicalData: MonthlySpend[]
): OnTrackInsight | null {
  
  if (currentBudget === 0) return null;
  
  const utilizationPercentage = (currentActual / currentBudget) * 100;
  
  if (utilizationPercentage < 70 || utilizationPercentage > 110) {
    return null;
  }
  
  let consecutiveOnTrackMonths = 1;
  for (let i = historicalData.length - 1; i >= 0; i--) {
    const month = historicalData[i];
    if (month.budget === 0) continue;
    const monthUtil = (month.amount / month.budget) * 100;
    if (monthUtil >= 70 && monthUtil <= 110) {
      consecutiveOnTrackMonths++;
    } else {
      break;
    }
  }
  
  const last3 = historicalData.slice(-3);
  const trend = calculateTrend(last3);
  
  const messages = {
    improving: `Great progress! Your ${categoryName} spending has been decreasing.`,
    stable: `Consistent budgeting! You've stayed on track for ${consecutiveOnTrackMonths} months.`,
    slightly_increasing: `Mostly on track, but spending is trending up slightly. Keep an eye on it.`
  };
  
  return {
    categoryId,
    categoryName,
    categoryColor,
    budgetAmount: currentBudget,
    actualAmount: currentActual,
    utilizationPercentage,
    consecutiveOnTrackMonths,
    trend,
    message: messages[trend]
  };
}

export function calculateUnderspendingRecommendation(
  categoryId: number,
  categoryName: string,
  categoryColor: string,
  currentBudget: number,
  currentActual: number,
  historicalData: MonthlySpend[],
  hasOverspendingCategories: boolean
): UnderspendingInsight | null {
  
  if (currentBudget === 0) return null;
  
  const unusedAmount = currentBudget - currentActual;
  const utilizationPercentage = (currentActual / currentBudget) * 100;
  
  if (utilizationPercentage >= 70) {
    return null;
  }
  
  const last3 = historicalData.slice(-3).filter(m => m.budget > 0);
  if (last3.length === 0) {
    return null;
  }
  
  const avgUtilization = last3.reduce((sum, m) => {
    return sum + ((m.amount / m.budget) * 100);
  }, 0) / last3.length;
  const isConsistentPattern = avgUtilization < 75;
  
  let recommendedAction: 'reallocate' | 'reduce_budget' | 'boost_savings';
  if (hasOverspendingCategories) {
    recommendedAction = 'reallocate';
  } else if (isConsistentPattern) {
    recommendedAction = 'boost_savings';
  } else {
    recommendedAction = 'reduce_budget';
  }
  
  const avgActual = last3.reduce((sum, m) => sum + m.amount, 0) / last3.length;
  const suggestedNewBudget = Math.round(avgActual * 1.15);
  const potentialReallocation = currentBudget - suggestedNewBudget;
  
  return {
    categoryId,
    categoryName,
    categoryColor,
    budgetAmount: currentBudget,
    actualAmount: currentActual,
    unusedAmount,
    utilizationPercentage,
    recommendedAction,
    suggestedNewBudget: Math.max(0, suggestedNewBudget),
    potentialReallocation: Math.max(0, potentialReallocation),
    isConsistentPattern,
    averageUtilization: avgUtilization
  };
}

export function analyzeTrend(monthlyData: MonthlySpend[]): TrendAnalysis {
  if (monthlyData.length < 3) {
    return {
      direction: 'stable',
      percentageChange: 0,
      confidence: 0,
      projection: monthlyData[monthlyData.length - 1]?.amount || 0,
      volatility: 'high'
    };
  }
  
  const changes: number[] = [];
  for (let i = 1; i < monthlyData.length; i++) {
    const prev = monthlyData[i - 1].amount;
    const curr = monthlyData[i].amount;
    if (prev > 0) {
      changes.push(((curr - prev) / prev) * 100);
    }
  }
  
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  
  let direction: 'increasing' | 'decreasing' | 'stable';
  if (avgChange > 5) {
    direction = 'increasing';
  } else if (avgChange < -5) {
    direction = 'decreasing';
  } else {
    direction = 'stable';
  }
  
  const variance = changes.reduce((sum, c) => sum + Math.pow(c - avgChange, 2), 0) / changes.length;
  const stdDev = Math.sqrt(variance);
  let volatility: 'low' | 'medium' | 'high';
  if (stdDev < 10) {
    volatility = 'low';
  } else if (stdDev < 25) {
    volatility = 'medium';
  } else {
    volatility = 'high';
  }
  
  const dataPointScore = Math.min(monthlyData.length / 6, 1) * 50;
  const consistencyScore = (1 - Math.min(stdDev / 50, 1)) * 50;
  const confidence = Math.round(dataPointScore + consistencyScore);
  
  const lastAmount = monthlyData[monthlyData.length - 1].amount;
  const projection = Math.round(lastAmount * (1 + avgChange / 100));
  
  return {
    direction,
    percentageChange: Math.round(avgChange * 10) / 10,
    confidence,
    projection,
    volatility
  };
}

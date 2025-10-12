export const getDateKey = (value) => {
  if (!value) return null;
  const iso = new Date(value).toISOString();
  return iso.split('T')[0];
};

const parseMonth = (month) => {
  if (!month) return null;
  const parsed = parseInt(month, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const createRangeFromFilters = (filters = {}) => {
  const now = new Date();
  const month = parseMonth(filters.month);
  const year = parseInt(filters.year, 10) || now.getFullYear();

  if (month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const prevMonthDate = new Date(start);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevStart = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
    const prevEnd = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);

    return {
      start,
      end,
      previousStart: prevStart,
      previousEnd: prevEnd,
      month,
      year,
      mode: 'month',
    };
  }

  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  const prevStart = new Date(year - 1, 0, 1);
  const prevEnd = new Date(year - 1, 11, 31, 23, 59, 59, 999);

  return {
    start,
    end,
    previousStart: prevStart,
    previousEnd: prevEnd,
    month: null,
    year,
    mode: 'year',
  };
};

export const expenseInRange = (expense, start, end) => {
  if (!expense?.date) return false;
  const d = new Date(expense.date);
  return d >= start && d <= end;
};

export const filterExpensesByRange = (expenses = [], start, end, categoryId) => {
  return expenses.filter((expense) => {
    if (!expenseInRange(expense, start, end)) {
      return false;
    }

    if (categoryId && String(expense.category_id) !== String(categoryId)) {
      return false;
    }

    return true;
  });
};

export const sumAmounts = (items = []) =>
  items.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);

export const buildDailySeries = (expenses = [], start, end) => {
  const map = new Map();

  expenses.forEach((expense) => {
    const key = getDateKey(expense.date);
    if (!key) return;
    map.set(key, (map.get(key) || 0) + (parseFloat(expense.amount) || 0));
  });

  const series = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().split('T')[0];
    series.push({
      date: key,
      total: map.get(key) || 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return series;
};

export const buildMonthlySeries = (expenses = [], monthsBack = 6, categoryId) => {
  const now = new Date();
  const items = [];

  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(target.getFullYear(), target.getMonth(), 1);
    const end = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59, 999);
    const key = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
    const bucket = filterExpensesByRange(expenses, start, end, categoryId);
    items.push({
      month: key,
      total: sumAmounts(bucket),
    });
  }

  return items;
};

export const classifyTrend = (currentValue, previousValue) => {
  if (!previousValue && !currentValue) return { direction: 'stable', percentage: 0 };
  if (!previousValue) return { direction: 'up', percentage: 100 };
  const delta = currentValue - previousValue;
  const percentage = (delta / previousValue) * 100;
  const rounded = Math.round(percentage * 10) / 10;
  if (rounded > 2) return { direction: 'up', percentage: rounded };
  if (rounded < -2) return { direction: 'down', percentage: rounded };
  return { direction: 'stable', percentage: rounded };
};

export const buildCategorySummaries = ({
  currentExpenses = [],
  previousExpenses = [],
  allExpenses = [],
  categories = [],
}) => {
  const currentTotals = new Map();
  const currentCounts = new Map();
  currentExpenses.forEach((expense) => {
    const id = expense.category_id;
    const current = currentTotals.get(id) || 0;
    currentTotals.set(id, current + (parseFloat(expense.amount) || 0));
    currentCounts.set(id, (currentCounts.get(id) || 0) + 1);
  });

  const previousTotals = new Map();
  previousExpenses.forEach((expense) => {
    const id = expense.category_id;
    previousTotals.set(id, (previousTotals.get(id) || 0) + (parseFloat(expense.amount) || 0));
  });

  const results = [];
  currentTotals.forEach((total, id) => {
    const previousTotal = previousTotals.get(id) || 0;
    const trend = classifyTrend(total, previousTotal);
    const category = categories.find((cat) => String(cat.id) === String(id));
    const sparkline = buildMonthlySeries(allExpenses, 6, id);

    results.push({
      categoryId: id,
      categoryName: category?.name || 'Other',
      categoryIcon: category?.icon || null,
      total,
      previousTotal,
      count: currentCounts.get(id) || 0,
      trend,
      sparkline,
    });
  });

  return results.sort((a, b) => b.total - a.total);
};

export const computeRecurringSummary = ({
  recurringTemplates = [],
  expenses = [],
  start,
  end,
}) => {
  if (!recurringTemplates.length) {
    return {
      totalTemplates: 0,
      generatedCount: 0,
      upcomingCount: 0,
      generatedAmount: 0,
      scheduledAmount: 0,
      coverage: 0,
      generatedByTemplate: {},
    };
  }

  const generatedByTemplate = {};
  expenses.forEach((expense) => {
    if (!expense.recurring_expense_id) return;
    if (!expenseInRange(expense, start, end)) return;
    const templateId = expense.recurring_expense_id;
    generatedByTemplate[templateId] = (generatedByTemplate[templateId] || 0) + (parseFloat(expense.amount) || 0);
  });

  let generatedCount = 0;
  let generatedAmount = 0;
  let scheduledAmount = 0;

  recurringTemplates.forEach((template) => {
    const templateId = template.id;
    const defaultAmount = parseFloat(template.default_amount) || 0;
    scheduledAmount += defaultAmount;
    if (generatedByTemplate[templateId]) {
      generatedCount += 1;
      generatedAmount += generatedByTemplate[templateId];
    }
  });

  const totalTemplates = recurringTemplates.length;
  const upcomingCount = totalTemplates - generatedCount;
  const coverage = totalTemplates ? Math.round((generatedCount / totalTemplates) * 100) : 0;

  return {
    totalTemplates,
    generatedCount,
    upcomingCount,
    generatedAmount,
    scheduledAmount,
    coverage,
    generatedByTemplate,
  };
};

export const buildHeroCopy = ({ filters, categories, range }) => {
  const categoryId = filters?.category;
  const categoryName = categoryId
    ? categories.find((cat) => String(cat.id) === String(categoryId))?.name
    : null;

  if (range.mode === 'month') {
    const monthDate = new Date(range.year, range.month - 1, 1);
    const monthLabel = monthDate.toLocaleString('en', { month: 'long' });
    if (categoryName) {
      return {
        title: `Your ${categoryName} spending for ${monthLabel} ${range.year}`,
        subtitle: `We pulled highlights from every ${categoryName.toLowerCase()} transaction this month so you can stay confident.`,
      };
    }
    return {
      title: `Here's your spending for ${monthLabel} ${range.year}`,
      subtitle: 'These highlights spotlight what changed most and where to focus next.',
    };
  }

  if (categoryName) {
    return {
      title: `Tracking ${categoryName} through ${range.year}`,
      subtitle: 'Let’s celebrate the wins and fine-tune areas that need attention.',
    };
  }

  return {
    title: `A look at your ${range.year} so far`,
    subtitle: "You're doing great—here's where your spending is working hardest.",
  };
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

export const buildInsights = ({
  categorySummaries = [],
  totals,
  previousTotals,
  recurringSummary,
  dailySeries,
}) => {
  const insights = [];
  const [topCategory] = categorySummaries;

  if (topCategory) {
    const delta = topCategory.total - topCategory.previousTotal;
    const percentage = topCategory.previousTotal
      ? Math.abs(Math.round(((delta) / topCategory.previousTotal) * 100))
      : 0;

    if (delta > 0 && percentage >= 5) {
      insights.push({
        id: 'category-trend-increase',
        tone: 'alert',
        title: `${topCategory.categoryName} is trending up`,
        body: `Spending rose by ${percentage}% compared to last period. Plan ahead so it stays intentional.`,
        action: 'See transactions',
        actionKey: 'view-category-transactions',
        meta: formatCurrency(topCategory.total),
        chart: topCategory.sparkline.map((point) => ({
          label: point.month,
          value: point.total,
        })),
        categoryId: topCategory.categoryId,
      });
    } else if (delta < 0 && percentage >= 5) {
      insights.push({
        id: 'category-trend-decrease',
        tone: 'celebration',
        title: `Nice work on ${topCategory.categoryName}`,
        body: `You're spending about ${percentage}% less than last period. Keep up what’s working.`,
        action: 'Adjust budget',
        actionKey: 'adjust-category-budget',
        meta: formatCurrency(Math.abs(delta)),
        chart: topCategory.sparkline.map((point) => ({
          label: point.month,
          value: point.total,
        })),
        categoryId: topCategory.categoryId,
      });
    }
  }

  if (recurringSummary?.upcomingCount > 0) {
    insights.push({
      id: 'recurring-upcoming',
      tone: 'info',
      title: `${recurringSummary.upcomingCount} upcoming recurring ${recurringSummary.upcomingCount === 1 ? 'bill' : 'bills'}`,
      body: 'A quick review now keeps next month stress-free. Make sure amounts still look right.',
      action: 'Review recurring',
      actionKey: 'review-recurring',
      meta: `${recurringSummary.coverage}% generated`,
      chart: [
        { label: 'Generated', value: recurringSummary.generatedCount },
        { label: 'Upcoming', value: recurringSummary.upcomingCount },
      ],
    });
  }

  if (totals !== undefined && previousTotals !== undefined) {
    const delta = totals - previousTotals;
    const direction = delta >= 0 ? 'up' : 'down';
    const percentage = previousTotals
      ? Math.round((Math.abs(delta) / previousTotals) * 100)
      : 100;

    if (Math.abs(percentage) >= 5) {
      insights.push({
        id: 'overall-change',
        tone: direction === 'up' ? 'alert' : 'celebration',
        title: direction === 'up' ? 'Spending ticked up overall' : 'Spending eased back overall',
        body:
          direction === 'up'
            ? `You're trending ${percentage}% higher than last period. Spot the outliers below.`
            : `You're ${percentage}% under the previous period. Celebrate and keep the momentum.`,
        action: 'View daily trend',
        actionKey: 'view-daily-trend',
        meta: formatCurrency(Math.abs(delta)),
        chart: dailySeries.slice(-7).map((point) => ({
          label: point.date,
          value: point.total,
        })),
      });
    }
  }

  return insights.slice(0, 3);
};

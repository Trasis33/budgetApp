const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { resolveScopeContext, isPersonalSplit } = require('../utils/scopeUtils');

// Apply authentication to all analytics routes
router.use(authMiddleware);

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const toNumber = (value, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const buildExpenseFilterClause = (startDate, endDate, payerIds, sharedOnly = false) => {
  if (!Array.isArray(payerIds) || payerIds.length === 0) {
    return null;
  }
  const sanitizedIds = payerIds.map((id) => Number(id));
  const params = [startDate, endDate, ...sanitizedIds];
  let clause = `e.date BETWEEN ? AND ? AND e.paid_by_user_id IN (${sanitizedIds.map(() => '?').join(', ')})`;
  if (sharedOnly) {
    clause += " AND (e.split_type IS NULL OR LOWER(e.split_type) NOT IN ('personal','personal_only'))";
  }
  return { clause, params };
};

const fetchTrendData = async (startDate, endDate, payerIds, sharedOnly = false) => {
  const filter = buildExpenseFilterClause(startDate, endDate, payerIds, sharedOnly);
  if (!filter) {
    return { monthlyTotals: [], previousYearTotals: [] };
  }

  const monthlyTotals = await db.raw(`
    SELECT 
      strftime('%Y-%m', e.date) as month,
      SUM(e.amount) as total_spending,
      COUNT(e.id) as expense_count,
      AVG(e.amount) as avg_expense,
      COALESCE(SUM(b.amount), 0) as total_budget
    FROM expenses e
    LEFT JOIN budgets b ON strftime('%Y', e.date) = printf('%04d', b.year)
      AND strftime('%m', e.date) = printf('%02d', b.month)
    WHERE ${filter.clause}
    GROUP BY strftime('%Y-%m', e.date)
    ORDER BY month ASC
  `, filter.params);

  const previousYearStart = new Date(startDate);
  previousYearStart.setFullYear(previousYearStart.getFullYear() - 1);
  const previousYearEnd = new Date(endDate);
  previousYearEnd.setFullYear(previousYearEnd.getFullYear() - 1);

  const previousFilter = buildExpenseFilterClause(
    previousYearStart.toISOString().split('T')[0],
    previousYearEnd.toISOString().split('T')[0],
    payerIds,
    sharedOnly
  );

  const previousYearTotals = previousFilter
    ? await db.raw(`
      SELECT 
        strftime('%Y-%m', e.date) as month,
        SUM(e.amount) as total_spending
      FROM expenses e
      WHERE ${previousFilter.clause}
      GROUP BY strftime('%Y-%m', e.date)
      ORDER BY month ASC
    `, previousFilter.params)
    : [];

  return { monthlyTotals, previousYearTotals };
};

const computeTrendSummary = (monthlyTotals, previousYearTotals) => {
  const currentTotal = monthlyTotals.reduce((sum, month) => sum + Number(month.total_spending || 0), 0);
  const previousTotal = previousYearTotals.reduce((sum, month) => sum + Number(month.total_spending || 0), 0);
  const trendPercentage = previousTotal > 0
    ? ((currentTotal - previousTotal) / previousTotal) * 100
    : 0;
  const avgMonthlySpending = monthlyTotals.length > 0
    ? currentTotal / monthlyTotals.length
    : 0;

  return {
    totalSpending: currentTotal,
    avgMonthlySpending,
    trendPercentage: Math.round(trendPercentage * 100) / 100,
    trendDirection: trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'stable',
    monthCount: monthlyTotals.length
  };
};

const defaultTrendSummary = () => ({
  totalSpending: 0,
  avgMonthlySpending: 0,
  trendPercentage: 0,
  trendDirection: 'stable',
  monthCount: 0
});

const buildIncomeFilterClause = (startDate, endDate, userIds) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return null;
  }
  const sanitizedIds = userIds.map((id) => Number(id));
  const params = [startDate, endDate, ...sanitizedIds];
  const clause = `date BETWEEN ? AND ? AND user_id IN (${sanitizedIds.map(() => '?').join(', ')})`;
  return { clause, params };
};

const fetchMonthlyIncome = async (startDate, endDate, userIds) => {
  const filter = buildIncomeFilterClause(startDate, endDate, userIds);
  if (!filter) {
    return [];
  }
  return db.raw(`
    SELECT 
      strftime('%Y-%m', date) as month,
      SUM(amount) as total_income
    FROM incomes
    WHERE ${filter.clause}
    GROUP BY month
    ORDER BY month ASC
  `, filter.params);
};

const fetchMonthlyExpenses = async (startDate, endDate, payerIds, sharedOnly = false) => {
  const filter = buildExpenseFilterClause(startDate, endDate, payerIds, sharedOnly);
  if (!filter) {
    return [];
  }
  return db.raw(`
    SELECT 
      strftime('%Y-%m', e.date) as month,
      SUM(e.amount) as total_expenses
    FROM expenses e
    WHERE ${filter.clause}
    GROUP BY strftime('%Y-%m', e.date)
    ORDER BY month ASC
  `, filter.params);
};

const mergeMonthlyIncomeExpenses = (incomeRows, expenseRows) => {
  const incomeMap = incomeRows.reduce((acc, row) => {
    acc[row.month] = Number(row.total_income || 0);
    return acc;
  }, {});
  const expenseMap = expenseRows.reduce((acc, row) => {
    acc[row.month] = Number(row.total_expenses || 0);
    return acc;
  }, {});

  const monthKeys = new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)]);
  const sortedMonths = Array.from(monthKeys).sort();

  return sortedMonths.map((month) => {
    const income = incomeMap[month] || 0;
    const expenses = expenseMap[month] || 0;
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    return {
      month,
      income,
      expenses,
      savings,
      savingsRate: Math.round(savingsRate * 100) / 100
    };
  });
};

const computeIncomeExpenseSummary = (monthlyData) => {
  const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
  const totalSurplus = totalIncome - totalExpenses;
  const avgSavingsRate = monthlyData.length > 0
    ? monthlyData.reduce((sum, month) => sum + month.savingsRate, 0) / monthlyData.length
    : 0;

  const recentMonths = monthlyData.slice(-3);
  const earlierMonths = monthlyData.slice(0, -3);

  const recentAvgSavings = recentMonths.length > 0
    ? recentMonths.reduce((sum, month) => sum + month.savingsRate, 0) / recentMonths.length
    : 0;
  const earlierAvgSavings = earlierMonths.length > 0
    ? earlierMonths.reduce((sum, month) => sum + month.savingsRate, 0) / earlierMonths.length
    : 0;

  const savingsTrend = earlierAvgSavings > 0
    ? ((recentAvgSavings - earlierAvgSavings) / earlierAvgSavings) * 100
    : 0;

  return {
    totalIncome,
    totalExpenses,
    totalSurplus,
    avgSavingsRate: Math.round(avgSavingsRate * 100) / 100,
    savingsTrend: Math.round(savingsTrend * 100) / 100,
    savingsTrendDirection: savingsTrend > 0 ? 'improving' : savingsTrend < 0 ? 'declining' : 'stable',
    monthCount: monthlyData.length
  };
};

const roundCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.round(numeric * 100) / 100;
};

const fetchDetailedExpenses = async (startDate, endDate, payerIds, sharedOnly = false) => {
  if (!Array.isArray(payerIds) || payerIds.length === 0) {
    return [];
  }

  const query = db('expenses as e')
    .leftJoin('categories as c', 'c.id', 'e.category_id')
    .whereBetween('e.date', [startDate, endDate])
    .whereIn('e.paid_by_user_id', payerIds.map((id) => Number(id)))
    .select(
      db.raw("strftime('%Y-%m', e.date) as month"),
      'e.amount',
      'e.category_id',
      'c.name as category_name',
      'e.paid_by_user_id',
      'e.split_type',
      'e.split_ratio_user1',
      'e.split_ratio_user2'
    )
    .orderBy('e.date', 'asc');

  if (sharedOnly) {
    query.andWhere(function () {
      this.whereNull('e.split_type')
        .orWhereRaw("LOWER(e.split_type) NOT IN ('personal','personal_only')");
    });
  }

  return query;
};

const countIncomes = async (startDate, endDate, userIds) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return 0;
  }
  const result = await db('incomes')
    .whereBetween('date', [startDate, endDate])
    .whereIn('user_id', userIds.map((id) => Number(id)))
    .count({ count: 'id' })
    .first();
  return Number(result?.count || 0);
};

const countExpenses = async (startDate, endDate, payerIds, sharedOnly = false) => {
  if (!Array.isArray(payerIds) || payerIds.length === 0) {
    return 0;
  }
  const query = db('expenses')
    .whereBetween('date', [startDate, endDate])
    .whereIn('paid_by_user_id', payerIds.map((id) => Number(id)));

  if (sharedOnly) {
    query.andWhere(function () {
      this.whereNull('split_type')
        .orWhereRaw("LOWER(split_type) NOT IN ('personal','personal_only')");
    });
  }

  const result = await query.count({ count: 'id' }).first();
  return Number(result?.count || 0);
};

const computeSavingsAnalysisSummary = (monthlyData) => {
  const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
  const totalSavings = monthlyData.reduce((sum, month) => sum + month.savings, 0);
  const averageSavingsRate = monthlyData.length > 0
    ? monthlyData.reduce((sum, month) => sum + month.savingsRate, 0) / monthlyData.length
    : 0;

  const recentMonths = monthlyData.slice(-3);
  const earlierMonths = monthlyData.slice(0, -3);

  const recentAverage = recentMonths.length > 0
    ? recentMonths.reduce((sum, month) => sum + month.savingsRate, 0) / recentMonths.length
    : 0;
  const earlierAverage = earlierMonths.length > 0
    ? earlierMonths.reduce((sum, month) => sum + month.savingsRate, 0) / earlierMonths.length
    : 0;

  const savingsRateTrend = earlierAverage > 0
    ? ((recentAverage - earlierAverage) / earlierAverage) * 100
    : 0;

  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    averageSavingsRate: Math.round(averageSavingsRate * 100) / 100,
    savingsRateTrend: Math.round(savingsRateTrend * 100) / 100,
    trendDirection: savingsRateTrend > 0 ? 'improving' : savingsRateTrend < 0 ? 'declining' : 'stable',
    monthCount: monthlyData.length
  };
};

const buildDataAvailability = (incomeCount, expenseCount, message) => ({
  hasIncome: incomeCount > 0,
  hasExpenses: expenseCount > 0,
  incomeEntries: incomeCount,
  expenseEntries: expenseCount,
  requiredForMeaningfulAnalysis: 2,
  message
});

const fetchSavingsGoalsForScope = async ({ scope, currentUser, partner }) => {
  let goalsQuery = db('savings_goals');
  if (scope === 'partner' && partner) {
    goalsQuery = goalsQuery.where('user_id', partner.id);
  } else if (scope === 'ours' && partner) {
    goalsQuery = goalsQuery.whereIn('user_id', [currentUser.id, partner.id]);
  } else {
    goalsQuery = goalsQuery.where('user_id', currentUser.id);
  }
  const goals = await goalsQuery
    .select('*')
    .orderBy([{ column: 'is_pinned', order: 'desc' }, { column: 'created_at', order: 'desc' }]);

  return goals.map((goal, index) => ({
    ...goal,
    color_index: index
  }));
};

const computeSettlementBalances = (expenses, currentUserId, partnerId) => {
  const totals = {
    [currentUserId]: { paid: 0, share: 0 },
    [partnerId]: { paid: 0, share: 0 }
  };
  let totalSharedExpenses = 0;

  expenses.forEach((expense) => {
    const amount = Number(expense.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    if (isPersonalSplit(expense.split_type)) {
      return;
    }

    const splitType = String(expense.split_type || '50/50').toLowerCase();

    let ratioCurrent = 0.5;
    let ratioPartner = 0.5;

    if (splitType === 'custom') {
      const rawRatioCurrent = Number(expense.split_ratio_user1);
      const rawRatioPartner = Number(expense.split_ratio_user2);
      if (Number.isFinite(rawRatioCurrent) && Number.isFinite(rawRatioPartner) && rawRatioCurrent + rawRatioPartner > 0) {
        ratioCurrent = rawRatioCurrent / (rawRatioCurrent + rawRatioPartner);
        ratioPartner = rawRatioPartner / (rawRatioCurrent + rawRatioPartner);
      } else if (Number.isFinite(rawRatioCurrent)) {
        ratioCurrent = Math.max(0, Math.min(100, rawRatioCurrent)) / 100;
        ratioPartner = 1 - ratioCurrent;
      } else if (Number.isFinite(rawRatioPartner)) {
        ratioPartner = Math.max(0, Math.min(100, rawRatioPartner)) / 100;
        ratioCurrent = 1 - ratioPartner;
      }
    } else if (splitType === 'bill') {
      // For bill payer type, default to 50/50 unless ratios provided
      const rawRatioCurrent = Number(expense.split_ratio_user1);
      if (Number.isFinite(rawRatioCurrent)) {
        ratioCurrent = Math.max(0, Math.min(100, rawRatioCurrent)) / 100;
        ratioPartner = 1 - ratioCurrent;
      }
    }

    totalSharedExpenses += amount;
    totals[currentUserId].share += amount * ratioCurrent;
    totals[partnerId].share += amount * ratioPartner;

    if (totals[expense.paid_by_user_id]) {
      totals[expense.paid_by_user_id].paid += amount;
    }
  });

  return { totals, totalSharedExpenses };
};

const buildSettlementPayload = (scope, { currentUser, partner }, balances, totalSharedExpenses, monthYear) => {
  if (!partner) {
    const message = 'Link a partner to calculate settlements.';
    const payload = {
      settlement: {
        amount: '0.00',
        creditor: null,
        debtor: null,
        message
      },
      totalSharedExpenses: '0.00',
      monthYear
    };
    return payload;
  }

  const currentTotals = balances[currentUser.id] || { paid: 0, share: 0 };
  const partnerTotals = balances[partner.id] || { paid: 0, share: 0 };

  const currentBalance = currentTotals.paid - currentTotals.share;
  const partnerBalance = partnerTotals.paid - partnerTotals.share;

  const config = {
    ours: {
      balance: currentBalance,
      creditorPositive: currentUser.name,
      debtorPositive: partner.name,
      creditorNegative: partner.name,
      debtorNegative: currentUser.name,
      total: totalSharedExpenses
    },
    mine: {
      balance: currentBalance,
      creditorPositive: currentUser.name,
      debtorPositive: partner.name,
      creditorNegative: partner.name,
      debtorNegative: currentUser.name,
      total: currentTotals.share
    },
    partner: {
      balance: partnerBalance,
      creditorPositive: partner.name,
      debtorPositive: currentUser.name,
      creditorNegative: currentUser.name,
      debtorNegative: partner.name,
      total: partnerTotals.share
    }
  }[scope];

  if (!config) {
    return {
      settlement: {
        amount: '0.00',
        creditor: null,
        debtor: null,
        message: 'Unable to determine settlement for this view.'
      },
      totalSharedExpenses: '0.00',
      monthYear
    };
  }

  const roundedTotal = Number(config.total || 0).toFixed(2);
  const balance = config.balance || 0;
  const absoluteAmount = Math.abs(balance);

  if (absoluteAmount < 0.005) {
    return {
      settlement: {
        amount: '0.00',
        creditor: null,
        debtor: null,
        message: 'All settled up!'
      },
      totalSharedExpenses: roundedTotal,
      monthYear
    };
  }

  const settlement = {
    amount: absoluteAmount.toFixed(2),
    creditor: balance > 0 ? config.creditorPositive : config.creditorNegative,
    debtor: balance > 0 ? config.debtorPositive : config.debtorNegative,
    message: balance > 0
      ? `${config.debtorPositive} owes ${config.creditorPositive}`
      : `${config.debtorNegative} owes ${config.creditorNegative}`
  };

  return {
    settlement,
    totalSharedExpenses: roundedTotal,
    monthYear
  };
};

/**
 * GET /api/analytics/trends/detailed/:startDate/:endDate
 * Provides extended analytics dataset for the deep dive modal
 */
router.get('/trends/detailed/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    if (!DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const scopeContext = await resolveScopeContext(db, req.user.id, req.query.scope);
    const {
      scope,
      requestedScope,
      payerIds,
      sharedOnly,
      currentUser,
      partner
    } = scopeContext;

    const timeRange = { start: startDate, end: endDate };

    if (!Array.isArray(payerIds) || payerIds.length === 0) {
      const emptyPayload = {
        timeRange,
        monthlyData: [],
        periodSummary: {
          totalIncome: 0,
          totalSpending: 0,
          netSurplus: 0,
          avgMonthlySpending: 0,
          topCategories: []
        },
        dataAvailability: buildDataAvailability(0, 0, 'Link a partner to explore shared analytics.')
      };
      return res.json({
        scope,
        requestedScope,
        ...emptyPayload,
        scopes: {
          [scope]: { ...emptyPayload }
        }
      });
    }

    const effectiveSharedOnly = scope === 'ours' ? false : sharedOnly;

    const [incomeCount, expenseCount, incomeRows, expenseRows] = await Promise.all([
      countIncomes(startDate, endDate, payerIds),
      countExpenses(startDate, endDate, payerIds, effectiveSharedOnly),
      fetchMonthlyIncome(startDate, endDate, payerIds),
      fetchDetailedExpenses(startDate, endDate, payerIds, effectiveSharedOnly)
    ]);

    const monthMap = new Map();
    const categoryAggregates = new Map();

    const ensureMonthEntry = (month) => {
      if (!monthMap.has(month)) {
        monthMap.set(month, {
          income: 0,
          spending: 0,
          expenseCount: 0,
          categories: new Map(),
          scopeTotals: {
            ours: 0,
            shared: 0,
            mine: 0,
            partner: 0
          }
        });
      }
      return monthMap.get(month);
    };

    incomeRows.forEach((row) => {
      const month = row.month;
      if (!month) {
        return;
      }
      const entry = ensureMonthEntry(month);
      entry.income += toNumber(row.total_income || row.totalIncome || 0, 0);
    });

    expenseRows.forEach((row) => {
      const month = row.month;
      if (!month) {
        return;
      }

      const amount = toNumber(row.amount, 0);
      if (!Number.isFinite(amount) || amount <= 0) {
        return;
      }

      const categoryId = row.category_id != null ? Number(row.category_id) : null;
      const categoryKey = categoryId != null ? categoryId : 'uncategorized';
      const categoryName = row.category_name || 'Uncategorized';
      const paidById = Number(row.paid_by_user_id);
      const personalExpense = isPersonalSplit(row.split_type);
      let scopeKey = 'shared';
      if (personalExpense) {
        if (paidById === currentUser.id) {
          scopeKey = 'mine';
        } else if (partner && paidById === partner.id) {
          scopeKey = 'partner';
        }
      }

      const entry = ensureMonthEntry(month);
      entry.spending += amount;
      entry.expenseCount += 1;
      entry.scopeTotals.ours += amount;
      entry.scopeTotals.shared += scopeKey === 'shared' ? amount : 0;
      entry.scopeTotals.mine += scopeKey === 'mine' ? amount : 0;
      entry.scopeTotals.partner += scopeKey === 'partner' ? amount : 0;

      if (!entry.categories.has(categoryKey)) {
        entry.categories.set(categoryKey, {
          categoryId,
          name: categoryName,
          total: 0,
          count: 0,
          scope: {
            ours: 0,
            shared: 0,
            mine: 0,
            partner: 0
          }
        });
      }

      const categoryEntry = entry.categories.get(categoryKey);
      categoryEntry.total += amount;
      categoryEntry.count += 1;
      categoryEntry.scope.ours += amount;
      categoryEntry.scope.shared += scopeKey === 'shared' ? amount : 0;
      categoryEntry.scope.mine += scopeKey === 'mine' ? amount : 0;
      categoryEntry.scope.partner += scopeKey === 'partner' ? amount : 0;

      const aggregateEntry = categoryAggregates.get(categoryKey) || {
        categoryId,
        name: categoryName,
        total: 0,
        count: 0
      };
      aggregateEntry.total += amount;
      aggregateEntry.count += 1;
      categoryAggregates.set(categoryKey, aggregateEntry);
    });

    const sortedMonths = Array.from(monthMap.keys()).sort();
    const monthlyData = sortedMonths.map((month) => {
      const entry = monthMap.get(month);
      const categories = Array.from(entry.categories.values())
        .map((category) => ({
          category_id: category.categoryId,
          name: category.name,
          total: roundCurrency(category.total),
          expense_count: category.count,
          avg_expense: category.count ? roundCurrency(category.total / category.count) : 0,
          scope: {
            ours: roundCurrency(category.scope.ours),
            shared: roundCurrency(category.scope.shared),
            mine: roundCurrency(category.scope.mine),
            partner: roundCurrency(category.scope.partner)
          }
        }))
        .sort((a, b) => b.total - a.total);

      const income = roundCurrency(entry.income);
      const spending = roundCurrency(entry.spending);
      const net = roundCurrency(income - spending);
      const savingsRate = income > 0 ? (income - spending) / income : 0;

      return {
        month,
        income,
        spending,
        net,
        savingsRate,
        categories,
        scopeTotals: {
          ours: roundCurrency(entry.scopeTotals.ours),
          shared: roundCurrency(entry.scopeTotals.shared),
          mine: roundCurrency(entry.scopeTotals.mine),
          partner: roundCurrency(entry.scopeTotals.partner)
        },
        expenseCount: entry.expenseCount
      };
    });

    const totalIncome = roundCurrency(monthlyData.reduce((sum, row) => sum + row.income, 0));
    const totalSpending = roundCurrency(monthlyData.reduce((sum, row) => sum + row.spending, 0));
    const netSurplus = roundCurrency(totalIncome - totalSpending);
    const avgMonthlySpending = monthlyData.length
      ? roundCurrency(totalSpending / monthlyData.length)
      : 0;

    const topCategories = Array.from(categoryAggregates.values())
      .map((category) => ({
        name: category.name,
        category_id: category.categoryId,
        total: roundCurrency(category.total),
        expense_count: category.count,
        avg_expense: category.count ? roundCurrency(category.total / category.count) : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const dataAvailability = buildDataAvailability(
      incomeCount,
      expenseCount,
      'Add income and expense entries in this range to explore detailed analytics.'
    );

    const payload = {
      timeRange,
      monthlyData,
      periodSummary: {
        totalIncome,
        totalSpending,
        netSurplus,
        avgMonthlySpending,
        topCategories
      },
      dataAvailability
    };

    res.json({
      scope,
      requestedScope,
      ...payload,
      scopes: {
        [scope]: { ...payload }
      }
    });
  } catch (error) {
    console.error('Error fetching detailed trends:', error);
    res.status(500).json({ error: 'Failed to fetch detailed trends data' });
  }
});

/**
 * GET /api/analytics/trends/:startDate/:endDate
 * Returns spending trends data for priority charts
 * Includes monthly totals, category breakdowns, budget comparisons
 * Optimized for 6-month default period
 */
router.get('/trends/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    if (!DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const scopeContext = await resolveScopeContext(db, req.user.id, req.query.scope);
    const { scope, requestedScope, payerIds, sharedOnly } = scopeContext;

    const { monthlyTotals, previousYearTotals } = await fetchTrendData(
      startDate,
      endDate,
      payerIds,
      sharedOnly
    );
    const summary = monthlyTotals.length
      ? computeTrendSummary(monthlyTotals, previousYearTotals)
      : defaultTrendSummary();

    const payload = {
      monthlyTotals,
      previousYearTotals,
      summary
    };

    res.json({
      scope,
      requestedScope,
      ...payload,
      scopes: {
        [scope]: { ...payload }
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
    if (!DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const scopeContext = await resolveScopeContext(db, req.user.id, req.query.scope);
    const { scope, requestedScope, payerIds, sharedOnly } = scopeContext;

    const monthlyIncome = await fetchMonthlyIncome(startDate, endDate, payerIds);
    const monthlyExpenses = await fetchMonthlyExpenses(startDate, endDate, payerIds, sharedOnly);
    const monthlyData = mergeMonthlyIncomeExpenses(monthlyIncome, monthlyExpenses);
    const summary = computeIncomeExpenseSummary(monthlyData);

    const payload = {
      monthlyData,
      summary
    };

    res.json({
      scope,
      requestedScope,
      ...payload,
      scopes: {
        [scope]: { ...payload }
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
    if (!DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const scopeContext = await resolveScopeContext(db, req.user.id, req.query.scope);
    const { scope, requestedScope, payerIds, sharedOnly } = scopeContext;

    const [incomeCount, expenseCount, savingsGoals] = await Promise.all([
      countIncomes(startDate, endDate, payerIds),
      countExpenses(startDate, endDate, payerIds, sharedOnly),
      fetchSavingsGoalsForScope(scopeContext)
    ]);

    const baseSummary = computeSavingsAnalysisSummary([]);

    if (incomeCount === 0 && expenseCount === 0) {
      const payload = {
        monthlyData: [],
        savingsGoals,
        summary: { ...baseSummary, trendDirection: 'no-data' },
        dataAvailability: buildDataAvailability(
          incomeCount,
          expenseCount,
          'Add income and expense entries to see meaningful savings analysis'
        )
      };
      return res.json({
        scope,
        requestedScope,
        ...payload,
        scopes: {
          [scope]: { ...payload }
        }
      });
    }

    if (incomeCount === 0) {
      const payload = {
        monthlyData: [],
        savingsGoals,
        summary: { ...baseSummary, trendDirection: 'no-data' },
        dataAvailability: buildDataAvailability(
          incomeCount,
          expenseCount,
          `You have ${expenseCount} expense entries but no income entries. Add income entries to calculate your savings rate.`
        )
      };
      return res.json({
        scope,
        requestedScope,
        ...payload,
        scopes: {
          [scope]: { ...payload }
        }
      });
    }

    if (expenseCount === 0) {
      const payload = {
        monthlyData: [],
        savingsGoals,
        summary: { ...baseSummary, trendDirection: 'no-data' },
        dataAvailability: buildDataAvailability(
          incomeCount,
          expenseCount,
          `You have ${incomeCount} income entries but no expense entries. Add expense entries to calculate your savings rate.`
        )
      };
      return res.json({
        scope,
        requestedScope,
        ...payload,
        scopes: {
          [scope]: { ...payload }
        }
      });
    }

    const monthlyIncome = await fetchMonthlyIncome(startDate, endDate, payerIds);
    const monthlyExpenses = await fetchMonthlyExpenses(startDate, endDate, payerIds, sharedOnly);
    const monthlyData = mergeMonthlyIncomeExpenses(monthlyIncome, monthlyExpenses);

    const summary = computeSavingsAnalysisSummary(monthlyData);

    const payload = {
      monthlyData,
      savingsGoals,
      summary
    };

    if (monthlyData.length < 2) {
      payload.dataAvailability = {
        ...buildDataAvailability(
          incomeCount,
          expenseCount,
          `You have data for ${monthlyData.length} month(s). Add more income and expense entries across multiple months to see trends and meaningful analysis.`
        ),
        monthsWithData: monthlyData.length
      };
      payload.summary.trendDirection = 'insufficient-data';
      payload.summary.savingsRateTrend = 0;
    }

    res.json({
      scope,
      requestedScope,
      ...payload,
      scopes: {
        [scope]: { ...payload }
      }
    });

  } catch (error) {
    console.error('Error fetching savings analysis:', error);
    res.status(500).json({ error: 'Failed to fetch savings analysis' });
  }
});

/**
 * GET /api/analytics/current-settlement
 * Returns current settlement status between users
 */
router.get('/current-settlement', async (req, res) => {
  try {
    const scopeContext = await resolveScopeContext(db, req.user.id, req.query.scope);
    const { scope, requestedScope, currentUser, partner, hasPartner } = scopeContext;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
    const monthYear = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    let totals = { [currentUser.id]: { paid: 0, share: 0 } };
    let totalSharedExpenses = 0;

    if (hasPartner) {
      const expenses = await db('expenses')
        .whereBetween('date', [startDate, endDate])
        .whereIn('paid_by_user_id', [currentUser.id, partner.id]);
      const settlementData = computeSettlementBalances(expenses, currentUser.id, partner.id);
      totals = settlementData.totals;
      totalSharedExpenses = settlementData.totalSharedExpenses;
    }

    const payload = buildSettlementPayload(scope, scopeContext, totals, totalSharedExpenses, monthYear);

    res.json({
      scope,
      requestedScope,
      ...payload,
      scopes: {
        [scope]: { ...payload }
      }
    });

  } catch (error) {
    console.error('Error fetching current settlement:', error);
    res.status(500).json({ error: 'Failed to fetch current settlement data' });
  }
});

module.exports = router;

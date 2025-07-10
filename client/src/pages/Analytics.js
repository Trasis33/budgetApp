import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import formatCurrency from '../utils/formatCurrency';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Budget Performance Summary Components
import BudgetPerformanceCards from '../components/BudgetPerformanceCards';
import BudgetPerformanceBars from '../components/BudgetPerformanceBars';
import BudgetPerformanceBadges from '../components/BudgetPerformanceBadges';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Time period state (default: 6 months)
  const [timePeriod, setTimePeriod] = useState('6months');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data states
  const [trendsData, setTrendsData] = useState(null);
  const [categoryTrendsData, setCategoryTrendsData] = useState(null);
  const [incomeExpensesData, setIncomeExpensesData] = useState(null);

  // Calculate date range based on selected time period
  const calculateDateRange = useCallback((period) => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start;

    switch (period) {
      case '3months':
        start = new Date(today.setMonth(today.getMonth() - 3)).toISOString().split('T')[0];
        break;
      case '6months':
        start = new Date(today.setMonth(today.getMonth() - 6)).toISOString().split('T')[0];
        break;
      case '1year':
        start = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0];
        break;
      case '2years':
        start = new Date(today.setFullYear(today.getFullYear() - 2)).toISOString().split('T')[0];
        break;
      default:
        start = new Date(today.setMonth(today.getMonth() - 6)).toISOString().split('T')[0];
    }

    return { start, end };
  }, []);

  // Fetch all analytics data
  const fetchAnalyticsData = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const [trendsRes, categoryTrendsRes, incomeExpensesRes] = await Promise.all([
        axios.get(`/analytics/trends/${startDate}/${endDate}`),
        axios.get(`/analytics/category-trends/${startDate}/${endDate}`),
        axios.get(`/analytics/income-expenses/${startDate}/${endDate}`)
      ]);

      setTrendsData(trendsRes.data);
      setCategoryTrendsData(categoryTrendsRes.data);
      setIncomeExpensesData(incomeExpensesRes.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Update date range when time period changes
  useEffect(() => {
    const { start, end } = calculateDateRange(timePeriod);
    setStartDate(start);
    setEndDate(end);
  }, [timePeriod, calculateDateRange]);

  // Fetch data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalyticsData();
    }
  }, [startDate, endDate, fetchAnalyticsData]);

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  );

  const SkeletonOverviewCard = () => (
    <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
    </div>
  );

  // Empty state component
  const EmptyState = ({ message, suggestion }) => (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="text-gray-400 text-6xl mb-4">📊</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-sm text-gray-500 mb-4">{suggestion}</p>
      <button
        onClick={() => window.location.href = '/add-expense'}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Add First Expense
      </button>
    </div>
  );

  // Chart colors (matching existing theme)
  const chartColors = {
    primary: '#3b82f6',      // Blue
    secondary: '#22c55e',    // Green
    accent: '#f97316',       // Orange
    purple: '#8b5cf6',       // Purple
    pink: '#ec4899',         // Pink
    gray: '#6b7280',         // Gray
    red: '#ef4444',          // Red
    yellow: '#eab308'        // Yellow
  };

  // Chart utility functions
  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  // Chart data preparation functions
  const getMonthlyTrendChartData = () => {
    if (!trendsData || !trendsData.monthlyTotals) return null;

    const months = trendsData.monthlyTotals.map(item => formatMonthLabel(item.month));
    const currentSpending = trendsData.monthlyTotals.map(item => item.total_spending);
    const budgetTargets = trendsData.monthlyTotals.map(item => item.total_budget || 0);

    // Previous year data (if available)
    const previousYearSpending = trendsData.previousYearTotals ?
      trendsData.previousYearTotals.map(item => item.total_spending) : [];

    const datasets = [
      {
        label: 'Current Spending',
        data: currentSpending,
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary + '10',
        borderWidth: 3,
        fill: false,
        tension: 0.1
      }
    ];

    // Add budget line if budget data exists
    if (budgetTargets.some(budget => budget > 0)) {
      datasets.push({
        label: 'Budget Target',
        data: budgetTargets,
        borderColor: chartColors.secondary,
        backgroundColor: chartColors.secondary + '10',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.1
      });
    }

    // Add previous year line if data exists
    if (previousYearSpending.length > 0) {
      datasets.push({
        label: 'Previous Year',
        data: previousYearSpending,
        borderColor: chartColors.gray,
        backgroundColor: chartColors.gray + '10',
        borderWidth: 2,
        borderDash: [2, 2],
        fill: false,
        tension: 0.1
      });
    }

    return {
      labels: months,
      datasets
    };
  };

  const getCategoryTrendChartData = () => {
    if (!categoryTrendsData || !categoryTrendsData.topCategories) return null;

    // Get all unique months from the data
    const allMonths = new Set();
    Object.values(categoryTrendsData.trendsByCategory).forEach(categoryData => {
      categoryData.monthlyData.forEach(item => {
        allMonths.add(item.month);
      });
    });

    const sortedMonths = Array.from(allMonths).sort();
    const monthLabels = sortedMonths.map(formatMonthLabel);

    // Take top 5 categories for mobile, or limit based on screen size
    const maxCategories = window.innerWidth < 768 ? 3 : 5;
    const topCategories = categoryTrendsData.topCategories.slice(0, maxCategories);

    const colors = [chartColors.primary, chartColors.secondary, chartColors.accent, chartColors.purple, chartColors.pink];

    const datasets = topCategories.map((category, index) => {
      const categoryData = categoryTrendsData.trendsByCategory[category];
      const monthlySpending = sortedMonths.map(month => {
        const monthData = categoryData.monthlyData.find(item => item.month === month);
        return monthData ? monthData.total_spending : 0;
      });

      return {
        label: category,
        data: monthlySpending,
        borderColor: colors[index],
        backgroundColor: colors[index] + '10',
        borderWidth: 2,
        fill: false,
        tension: 0.1
      };
    });

    return {
      labels: monthLabels,
      datasets
    };
  };

  const getIncomeExpenseChartData = () => {
    if (!incomeExpensesData || !incomeExpensesData.monthlyData) return null;

    const months = incomeExpensesData.monthlyData.map(item => formatMonthLabel(item.month));
    const incomeData = incomeExpensesData.monthlyData.map(item => item.income);
    const expenseData = incomeExpensesData.monthlyData.map(item => item.expenses);

    return {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: chartColors.secondary,
          backgroundColor: chartColors.secondary + '20',
          borderWidth: 3,
          fill: true,
          tension: 0.1
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: chartColors.accent,
          backgroundColor: chartColors.accent + '20',
          borderWidth: 3,
          fill: true,
          tension: 0.1
        }
      ]
    };
  };

  const getBudgetPerformanceData = () => {
    if (!categoryTrendsData || !categoryTrendsData.topCategories) return null;

    const categories = categoryTrendsData.topCategories.slice(0, 6); // Show top 6 for better visualization
    const performanceData = [];

    // Helper function to get all months in the selected period
    const getMonthsInPeriod = (startDate, endDate) => {
      const months = [];
      const current = new Date(startDate);
      const end = new Date(endDate);

      while (current <= end) {
        months.push(current.toISOString().slice(0, 7)); // YYYY-MM format
        current.setMonth(current.getMonth() + 1);
      }
      return months;
    };

    const periodMonths = getMonthsInPeriod(startDate, endDate);

    categories.forEach(category => {
      const categoryData = categoryTrendsData.trendsByCategory[category];
      const totalSpending = categoryData.totalSpending;

      // Create a time-period-aware budget calculation
      let totalBudgetForPeriod = 0;
      let budgetMonthsFound = 0;
      let lastKnownBudget = 0;

      // First, get all available budget data for this category, sorted by month
      const availableBudgets = categoryData.budgetData || [];
      const budgetByMonth = {};

      availableBudgets.forEach(budget => {
        budgetByMonth[budget.month] = budget.budget_amount;
        lastKnownBudget = budget.budget_amount; // Keep track of the most recent budget
      });

      // Now, for each month in the period, use actual budget or fill with last known value
      periodMonths.forEach(month => {
        if (budgetByMonth[month]) {
          // Use actual budget for this month
          totalBudgetForPeriod += budgetByMonth[month];
          lastKnownBudget = budgetByMonth[month]; // Update last known budget
          budgetMonthsFound++;
        } else if (lastKnownBudget > 0) {
          // Fill with last known budget value
          totalBudgetForPeriod += lastKnownBudget;
          budgetMonthsFound++;
        }
      });

      // Only include categories that have budget data (actual or filled)
      if (budgetMonthsFound > 0 && totalBudgetForPeriod > 0) {
        const budgetUtilization = (totalSpending / totalBudgetForPeriod) * 100;
        const avgMonthlyBudget = totalBudgetForPeriod / periodMonths.length;

        performanceData.push({
          category,
          spending: totalSpending,
          budget: totalBudgetForPeriod,
          avgMonthlyBudget,
          utilization: budgetUtilization,
          status: budgetUtilization > 100 ? 'over' : budgetUtilization > 90 ? 'warning' : 'good',
          monthsWithBudget: budgetMonthsFound,
          monthsInPeriod: periodMonths.length,
          budgetCoverage: (budgetMonthsFound / periodMonths.length) * 100
        });
      }
    });

    return performanceData;
  };

  const getBudgetPerformanceChartData = () => {
    const performanceData = getBudgetPerformanceData();
    if (!performanceData || performanceData.length === 0) return null;

    const labels = performanceData.map(item => item.category);
    const budgetData = performanceData.map(item => item.budget);
    const spendingData = performanceData.map(item => item.spending);

    // Color bars based on performance
    const budgetColors = performanceData.map(item => {
      switch (item.status) {
        case 'over': return chartColors.red;
        case 'warning': return chartColors.yellow;
        default: return chartColors.secondary;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: `Budget (${timePeriod.replace('months', 'mo').replace('year', 'yr')})`,
          data: budgetData,
          backgroundColor: chartColors.primary + '40',
          borderColor: chartColors.primary,
          borderWidth: 1
        },
        {
          label: 'Actual Spending',
          data: spendingData,
          backgroundColor: budgetColors.map(color => color + '80'),
          borderColor: budgetColors,
          borderWidth: 1
        }
      ]
    };
  };

  // Overview cards data
  const getOverviewData = () => {
    if (!trendsData || !incomeExpensesData) return null;

    return {
      avgMonthlySpending: trendsData.summary.avgMonthlySpending,
      trendDirection: trendsData.summary.trendDirection,
      trendPercentage: trendsData.summary.trendPercentage,
      savingsRate: incomeExpensesData.summary.avgSavingsRate,
      savingsTrend: incomeExpensesData.summary.savingsTrendDirection
    };
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Insights into your spending patterns and financial trends</p>
      </div>

      {/* Time Period Selector - Sticky on mobile */}
      <div className="sticky top-0 z-10 bg-white p-4 rounded-lg shadow-md mb-6 border">
        <label htmlFor="timePeriod" className="block text-sm font-medium text-gray-700 mb-2">
          Time Period
        </label>
        <select
          id="timePeriod"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
          <option value="2years">Last 2 Years</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchAnalyticsData}
                className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonOverviewCard />
            <SkeletonOverviewCard />
            <SkeletonOverviewCard />
            <SkeletonOverviewCard />
          </>
        ) : (
          (() => {
            const overview = getOverviewData();

            if (!overview || trendsData?.summary.monthCount === 0) {
              return (
                <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                  <EmptyState
                    message="No data available for this period"
                    suggestion="Add some expenses to see your analytics. We need at least 3 months of data for meaningful insights."
                  />
                </div>
              );
            }

            return (
              <>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Avg Monthly Spending</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(overview.avgMonthlySpending)}
                  </p>
                  <p className="text-xs text-gray-500">Per month average</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Spending Trend</h3>
                  <p className={`text-2xl font-bold ${overview.trendDirection === 'up' ? 'text-red-600' : overview.trendDirection === 'down' ? 'text-green-600' : 'text-gray-600'}`}>
                    {overview.trendDirection === 'up' ? '↗️' : overview.trendDirection === 'down' ? '↘️' : '→'} {Math.abs(overview.trendPercentage)}%
                  </p>
                  <p className="text-xs text-gray-500">vs previous year</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Savings Rate</h3>
                  <p className={`text-2xl font-bold ${overview.savingsRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overview.savingsRate > 0 ? '+' : ''}{overview.savingsRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Income vs expenses</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Balance Trend</h3>
                  <p className={`text-2xl font-bold ${overview.savingsTrend === 'improving' ? 'text-green-600' : overview.savingsTrend === 'declining' ? 'text-red-600' : 'text-gray-600'}`}>
                    {overview.savingsTrend === 'improving' ? '📈' : overview.savingsTrend === 'declining' ? '📉' : '📊'} {overview.savingsTrend}
                  </p>
                  <p className="text-xs text-gray-500">Recent trend</p>
                </div>
              </>
            );
          })()
        )}
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Budget Performance Badges - Now in its own card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
              {(() => {
                const performanceData = getBudgetPerformanceData();
                if (!performanceData || performanceData.length === 0) return null;

                return <BudgetPerformanceBadges performanceData={performanceData} />;
              })()}
            </div>
            {/* Monthly Spending Trend Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Monthly Spending Trends</h2>
                <div className="text-sm text-gray-500">
                  {trendsData?.monthlyTotals?.length || 0} months
                </div>
              </div>
              <div className="h-80">
                {(() => {
                  const chartData = getMonthlyTrendChartData();
                  if (!chartData || chartData.labels.length === 0) {
                    return (
                      <div className="h-full bg-gray-50 rounded flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📈</div>
                          <p>No spending data available for this period</p>
                          <p className="text-sm mt-1">Add some expenses to see trends</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Line
                      data={chartData}
                      options={{
                        ...commonChartOptions,
                        plugins: {
                          ...commonChartOptions.plugins,
                          title: {
                            display: false
                          }
                        }
                      }}
                    />
                  );
                })()
                }
              </div>
            </div>

            {/* Category Spending Trends Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Category Spending Trends</h2>
                <div className="text-sm text-gray-500">
                  Top {window.innerWidth < 768 ? '3' : '5'} categories
                </div>
              </div>
              <div className="h-80">
                {(() => {
                  const chartData = getCategoryTrendChartData();
                  if (!chartData || chartData.datasets.length === 0) {
                    return (
                      <div className="h-full bg-gray-50 rounded flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📊</div>
                          <p>No category data available</p>
                          <p className="text-sm mt-1">Add expenses with categories to see trends</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Line
                      data={chartData}
                      options={{
                        ...commonChartOptions,
                        plugins: {
                          ...commonChartOptions.plugins,
                          legend: {
                            ...commonChartOptions.plugins.legend,
                            position: window.innerWidth < 768 ? 'bottom' : 'top'
                          }
                        }
                      }}
                    />
                  );
                })()
                }
              </div>
            </div>

            {/* Income vs Expenses Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Income vs Expenses</h2>
                <div className="text-sm text-gray-500">
                  Avg savings: {incomeExpensesData?.summary?.avgSavingsRate?.toFixed(1) || 0}%
                </div>
              </div>
              <div className="h-80">
                {(() => {
                  const chartData = getIncomeExpenseChartData();
                  if (!chartData || chartData.labels.length === 0) {
                    return (
                      <div className="h-full bg-gray-50 rounded flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">💰</div>
                          <p>No income/expense data available</p>
                          <p className="text-sm mt-1">Add income and expenses to see comparison</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Line
                      data={chartData}
                      options={{
                        ...commonChartOptions,
                        plugins: {
                          ...commonChartOptions.plugins,
                          tooltip: {
                            ...commonChartOptions.plugins.tooltip,
                            callbacks: {
                              label: function (context) {
                                const value = formatCurrency(context.parsed.y);
                                const surplus = context.parsed.y - (context.chart.data.datasets[1 - context.datasetIndex]?.data[context.dataIndex] || 0);
                                const surplusText = context.datasetIndex === 0 ? ` (Surplus: ${formatCurrency(Math.abs(surplus))})` : '';
                                return `${context.dataset.label}: ${value}${surplusText}`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  );
                })()
                }
              </div>
            </div>

            {/* Budget Performance Section */}
            <div className="space-y-6">
              {/* Chart Section */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">Budget Performance</h2>
                  <div className="text-sm text-gray-500">
                    {timePeriod.replace('months', ' months').replace('year', ' year')}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-blue-600">ⓘ</span>
                    Budget totals are calculated using actual monthly budgets when available,
                    filled with the most recent budget value for missing months.
                  </span>
                </div>
                <div className="h-80">
                  {(() => {
                    const chartData = getBudgetPerformanceChartData();
                    const performanceData = getBudgetPerformanceData();

                    if (!chartData || !performanceData || performanceData.length === 0) {
                      return (
                        <div className="h-full bg-gray-50 rounded flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="text-4xl mb-2">🎯</div>
                            <p>No budget data available</p>
                            <p className="text-sm mt-1">Set budgets for categories to see performance comparison</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Bar
                        data={chartData}
                        options={{
                          ...commonChartOptions,
                          plugins: {
                            ...commonChartOptions.plugins,
                            tooltip: {
                              ...commonChartOptions.plugins.tooltip,
                              callbacks: {
                                label: function (context) {
                                  const value = formatCurrency(context.parsed.y);
                                  const dataIndex = context.dataIndex;
                                  const performance = performanceData[dataIndex];
                                  const utilizationText = context.datasetIndex === 1 ?
                                    ` (${performance.utilization.toFixed(1)}% of budget)` : '';
                                  return `${context.dataset.label}: ${value}${utilizationText}`;
                                }
                              }
                            }
                          },
                          scales: {
                            ...commonChartOptions.scales,
                            x: {
                              ticks: {
                                maxRotation: window.innerWidth < 768 ? 45 : 0,
                                font: {
                                  size: window.innerWidth < 768 ? 10 : 11
                                }
                              }
                            }
                          }
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Debug Info (only in development) */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium mb-2">Debug Info:</h3>
          <p className="text-sm text-gray-600">Date range: {startDate} to {endDate}</p>
          <p className="text-sm text-gray-600">Loading: {loading.toString()}</p>
          <p className="text-sm text-gray-600">
            Data loaded: trends={!!trendsData}, categories={!!categoryTrendsData}, income={!!incomeExpensesData}
          </p>
        </div>
      )} */}
    </div>
  );
};

export default Analytics;

import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
        {/* Chart placeholders - will be implemented in Phase 3 */}
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Monthly Spending Trend Chart Placeholder */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Monthly Spending Trends</h2>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📈</div>
                  <p>Chart will be implemented in Phase 3</p>
                  <p className="text-sm mt-1">
                    Data available: {trendsData?.monthlyTotals?.length || 0} months
                  </p>
                </div>
              </div>
            </div>

            {/* Category Spending Trends Chart Placeholder */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Category Spending Trends</h2>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <p>Chart will be implemented in Phase 3</p>
                  <p className="text-sm mt-1">
                    Top categories: {categoryTrendsData?.topCategories?.slice(0, 3).join(', ') || 'None'}
                  </p>
                </div>
              </div>
            </div>

            {/* Income vs Expenses Chart Placeholder */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Income vs Expenses</h2>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">💰</div>
                  <p>Chart will be implemented in Phase 3</p>
                  <p className="text-sm mt-1">
                    Avg savings rate: {incomeExpensesData?.summary?.avgSavingsRate?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Budget Performance Placeholder */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Budget Performance</h2>
              <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>Chart will be implemented in Phase 3</p>
                  <p className="text-sm mt-1">Budget heatmap coming soon</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium mb-2">Debug Info:</h3>
          <p className="text-sm text-gray-600">Date range: {startDate} to {endDate}</p>
          <p className="text-sm text-gray-600">Loading: {loading.toString()}</p>
          <p className="text-sm text-gray-600">
            Data loaded: trends={!!trendsData}, categories={!!categoryTrendsData}, income={!!incomeExpensesData}
          </p>
        </div>
      )}
    </div>
  );
};

export default Analytics;

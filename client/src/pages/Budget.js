import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import formatCurrency from '../utils/formatCurrency';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Filler,
} from 'chart.js';

// Import analytics components
import BudgetPerformanceCards from '../components/BudgetPerformanceCards';
import BudgetPerformanceBars from '../components/BudgetPerformanceBars';
import BudgetPerformanceBadges from '../components/BudgetPerformanceBadges';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Filler
);

const Budget = () => {
  // Active section state for horizontal pill navigation
  const [activeSection, setActiveSection] = useState('budget');
  
  const [incomes, setIncomes] = useState([]);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [chartData, setChartData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({});
  
  // Analytics state

  const [trendsData, setTrendsData] = useState(null);
  const [categoryTrendsData, setCategoryTrendsData] = useState(null);
  const [incomeExpensesData, setIncomeExpensesData] = useState(null);

  const [analyticsData, setAnalyticsData] = useState(null);
  const [timePeriod, setTimePeriod] = useState('6months');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  
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

  // Navigation sections
  const sections = [
    { id: 'budget', label: 'Budget Overview', icon: '💰' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'income', label: 'Income Management', icon: '💼' }
  ];

  const fetchBudgetData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Base API calls that don't depend on date range
      const basePromises = [
        axios.get(`/incomes?month=${month}&year=${year}`),
        axios.get(`/summary/charts/${year}/${month}`),
        axios.get('/categories')
      ];
      
      // Analytics API calls that depend on date range - only make if dates are available
      const analyticsPromises = [];
      if (startDate && endDate) {
        analyticsPromises.push(
          axios.get(`/analytics/trends/${startDate}/${endDate}`),
          axios.get(`/analytics/category-trends/${startDate}/${endDate}`),
          axios.get(`/analytics/income-expenses/${startDate}/${endDate}`)
        );
      }
      
      const [incomesRes, chartsRes, categoriesRes, ...analyticsResults] = await Promise.all([
        ...basePromises,
        ...analyticsPromises
      ]);
      setIncomes(incomesRes.data);
      setChartData(chartsRes.data);
      setCategories(categoriesRes.data);
      
      // Set analytics data if available
      if (analyticsResults.length >= 3) {
        setTrendsData(analyticsResults[0].data);
        setCategoryTrendsData(analyticsResults[1].data);
        setIncomeExpensesData(analyticsResults[2].data);
      } else {
        // Clear analytics data if no date range available
        setTrendsData(null);
        setCategoryTrendsData(null);
        setIncomeExpensesData(null);
      }

      const initialBudgets = {};
      chartsRes.data.categorySpending.forEach(item => {
        const category = categoriesRes.data.find(c => c.name === item.category);
        if (category) {
          initialBudgets[category.id] = item.budget || '';
        }
      });
      setBudgets(initialBudgets);

    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError('Failed to load budget data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [month, year, startDate, endDate]);

  useEffect(() => {
    const { start, end } = calculateDateRange(timePeriod);
    setStartDate(start);
    setEndDate(end);
  }, [timePeriod, calculateDateRange]);

  // Separate useEffect for fetchBudgetData to avoid dependency issues
  useEffect(() => {
    if (startDate && endDate) {
      fetchBudgetData();
    }
  }, [month, year, startDate, endDate, fetchBudgetData]);

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/incomes', { source, amount, date });
      setSource('');
      setAmount('');
      fetchBudgetData(); // Refetch all data
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await axios.delete(`/incomes/${id}`);
      fetchBudgetData(); // Refetch all data
    } catch (err) {
      console.error(err);
    }
  };

  const handleBudgetChange = (categoryId, value) => {
    setBudgets(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleSaveBudget = async (categoryId) => {
    try {
      const amount = budgets[categoryId];
      if (amount === '' || isNaN(parseFloat(amount))) {
        alert('Please enter a valid number for the budget.');
        return;
      }
      await axios.post('/budgets', {
        category_id: categoryId,
        amount: parseFloat(amount),
        month,
        year,
      });
      alert('Budget saved!');
      fetchBudgetData(); // Refetch to update charts
    } catch (err) {
      console.error('Failed to save budget:', err);
      alert('Failed to save budget.');
    }
  };

  // Chart colors (matching Analytics.js theme)
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

  // Format month label for charts
  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  // Analytics chart data functions (simplified versions for now)
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

  const getBudgetPerformanceData = () => {
    if (!chartData?.categorySpending || chartData.categorySpending.length === 0) {
      return null;
    }

    const performanceData = [];
    
    chartData.categorySpending.forEach(category => {
      if (category.budget && category.budget > 0) {
        const utilization = (category.total / category.budget) * 100;
        performanceData.push({
          category: category.category,
          spending: category.total,
          budget: category.budget,
          utilization: utilization,
          status: utilization > 100 ? 'over' : utilization > 90 ? 'warning' : 'good'
        });
      }
    });

    return performanceData;
  };

  const getBudgetPerformanceChartData = () => {
    const performanceData = getBudgetPerformanceData();
    if (!performanceData || performanceData.length === 0) {
      return null;
    }

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

  const getIncomeExpensesChartData = () => {
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

  // Common chart options for consistency
  // Custom legend for the budget vs actual chart
  const budgetVsActualLegend = {
    id: 'budgetVsActualLegend',
    afterDraw(chart, args, options) {
      const { ctx, chartArea, width } = chart;
      if (!chartArea) return;

      const legendItems = [
        { text: 'Budgeted', fillStyle: chartColors.primary + '40' },
        { text: 'Actual Spending', fillStyle: chartColors.accent + '80' },
        { text: 'Good', fillStyle: chartColors.secondary },
        { text: 'Warning', fillStyle: chartColors.yellow },
        { text: 'Over', fillStyle: chartColors.red },
      ];

      ctx.save();
      ctx.font = "12px 'Inter', sans-serif";
      ctx.textBaseline = 'middle';

      const boxSize = 10;
      const itemSpacing = 15;
      const totalLegendWidth = legendItems.reduce((acc, item) => {
        return acc + boxSize + 5 + ctx.measureText(item.text).width + itemSpacing;
      }, 0) - itemSpacing;

      let x = (width - totalLegendWidth) / 2;
      const y = chartArea.top - 20;

      legendItems.forEach(item => {
        ctx.fillStyle = item.fillStyle;
        ctx.fillRect(x, y, boxSize, boxSize);
        x += boxSize + 5;

        ctx.fillStyle = '#6b7280';
        ctx.fillText(item.text, x, y + boxSize / 2);
        x += ctx.measureText(item.text).width + itemSpacing;
      });

      ctx.restore();
    }
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
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y || context.parsed)}`;
          }
        }
      }
    }
  };

  // Doughnut chart specific options
  const doughnutChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      legend: {
        position: window.innerWidth < 768 ? 'bottom' : 'right',
        labels: {
          boxWidth: 20,
          padding: window.innerWidth < 768 ? 8 : 15,
          font: {
            size: window.innerWidth < 768 ? 10 : 11
          }
        }
      }
    }
  };

  // Bar chart specific options
  const barChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-80 bg-gray-200 rounded"></div>
    </div>
  );

  // Empty state component
  const EmptyChartState = ({ message, suggestion, icon }) => (
    <div className="h-80 bg-gray-50 rounded flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
        <p className="text-sm text-gray-500 mb-4">{suggestion}</p>
        <button 
          onClick={() => window.location.href = '/add-expense'}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Expense
        </button>
      </div>
    </div>
  );

  // Chart data preparation functions
  const getCategoryChartData = () => {
    if (!chartData?.categorySpending || chartData.categorySpending.length === 0) {
      return null;
    }

    // Define a base color palette
    const colors = [
      chartColors.primary,
      chartColors.secondary,
      chartColors.accent,
      chartColors.purple,
      chartColors.pink,
      chartColors.gray,
      chartColors.red,
      chartColors.yellow,
    ];

    // Lighten the colors by adding opacity (e.g., 'B3' for ~70% opacity)
    const donutColors = colors.map(color => `${color}B3`);

    // Sort categories by amount (descending) for consistent color assignment
    const sortedCategories = [...chartData.categorySpending].sort((a, b) => b.total - a.total);

    return {
      labels: sortedCategories.map((c) => c.category),
      datasets: [
        {
          label: 'Spending by Category',
          data: sortedCategories.map((c) => c.total),
          backgroundColor: donutColors.slice(0, sortedCategories.length),
          borderWidth: 1,
          borderColor: '#ffffff',
          hoverOffset: 8,
          borderRadius: 8,
          spacing: 2
        },
      ],
    };
  };

  const getIncomeExpenseChartData = () => {
    if (!chartData?.monthlyTotals) {
      return null;
    }

    return {
      labels: ['Income vs. Expenses'],
      datasets: [
        {
          label: 'Income',
          data: [chartData.monthlyTotals.income || 0],
          backgroundColor: chartColors.secondary + '80',
          borderColor: chartColors.secondary,
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'Expenses',
          data: [chartData.monthlyTotals.expenses || 0],
          backgroundColor: chartColors.accent + '80',
          borderColor: chartColors.accent,
          borderWidth: 1,
          borderRadius: 6
        },
      ],
    };
  };

  const getBudgetVsActualChartData = () => {
    if (!chartData?.categorySpending || chartData.categorySpending.length === 0) {
      return null;
    }

    // Get categories that are over/under budget for coloring
    const performanceData = chartData.categorySpending.map(item => {
      if (!item.budget) return 'none';
      const utilization = (item.total / item.budget) * 100;
      return utilization > 100 ? 'over' : utilization > 90 ? 'warning' : 'good';
    });

    // Color bars based on performance
    const budgetColors = performanceData.map(status => {
      switch (status) {
        case 'over': return chartColors.red;
        case 'warning': return chartColors.yellow;
        case 'good': return chartColors.secondary;
        default: return chartColors.gray; // For categories without budget
      }
    });

    return {
      labels: chartData.categorySpending.map(c => c.category),
      datasets: [
        {
          label: 'Budgeted',
          data: chartData.categorySpending.map(c => c.budget || 0),
          backgroundColor: chartColors.primary + '40',
          borderColor: chartColors.primary,
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'Actual Spending',
          data: chartData.categorySpending.map(c => c.total || 0),
          backgroundColor: budgetColors.map(color => color + '80'),
          borderColor: budgetColors,
          borderWidth: 1,
          borderRadius: 6,
          // Custom legend configuration
          legend: {
            display: true,
            labels: {
              generateLabels: function(chart) {
                // Return empty array to prevent default legend items
                return [];
              }
            }
          }
        }
      ]
    };
  };
  
  // Custom options for the budget vs actual chart
  const budgetVsActualChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container
    plugins: {
      // Disable the default legend and title
      legend: {
        display: false
      },
      title: {
        display: false
      },
      // Add our custom legend
      [budgetVsActualLegend.id]: {}
    },
    // Adjust layout to make room for our custom legend
    layout: {
      padding: {
        top: 40, // Add space at the top for our custom legend
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    devicePixelRatio: window.devicePixelRatio || 1 // Handle high DPI displays
  };

  if (!user) {
    return null;
  }

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'budget':
        return renderBudgetSection();
      case 'analytics':
        return renderAnalyticsSection();
      case 'income':
        return renderIncomeSection();
      default:
        return renderBudgetSection();
    }
  };

  const renderBudgetSection = () => (
    <div className="space-y-6">
      {/* Month/Year Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Filter by Month</h3>
        <div className="flex gap-4">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const yearOption = new Date().getFullYear() - 2 + i;
                return (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Charts */}
      {loading ? (
        <div className="space-y-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard />
        </div>
      ) : (
        <div className="space-y-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Spending by Category Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
              <div className="h-80">
                {(() => {
                  const chartData = getCategoryChartData();
                  if (!chartData) {
                    return (
                      <EmptyChartState 
                        message="No category data available"
                        suggestion="Add some expenses to see your spending breakdown by category"
                        icon="🍰"
                      />
                    );
                  }
                  return (
                    <Doughnut
                      data={chartData}
                      options={doughnutChartOptions}
                    />
                  );
                })()}
              </div>
            </div>

            {/* Income vs Expenses Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Income vs. Expenses</h2>
              <div className="h-80">
                {(() => {
                  const chartData = getIncomeExpenseChartData();
                  if (!chartData) {
                    return (
                      <EmptyChartState 
                        message="No income/expense data available"
                        suggestion="Add income and expenses to see your financial overview"
                        icon="💰"
                      />
                    );
                  }
                  return (
                    <Bar data={chartData} options={barChartOptions} />
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Budget vs Actual Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Budget vs. Actual Spending</h2>
            <div className="h-80">
              {(() => {
                const chartData = getBudgetVsActualChartData();
                if (!chartData) {
                  return (
                    <EmptyChartState 
                      message="No budget comparison data available"
                      suggestion="Set budgets for categories and add expenses to see budget performance"
                      icon="🎯"
                    />
                  );
                }
                const budgetVsActualData = chartData;
                return (
                  <Bar
                    data={budgetVsActualData}
                    options={budgetVsActualChartOptions}
                    plugins={[budgetVsActualLegend]}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Manage Budgets */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Manage Budgets</h2>
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category.id} className="flex items-center gap-2">
                <label htmlFor={`budget-${category.id}`} className="flex-1 text-sm font-medium text-gray-700 truncate">{category.name}</label>
                <input
                  type="number"
                  id={`budget-${category.id}`}
                  value={budgets[category.id] || ''}
                  onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                  placeholder="0.00"
                />
                <button onClick={() => handleSaveBudget(category.id)} className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">Save</button>
              </div>
            ))}
          </div>
        </div>

        {/* Manage Income */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Manage Income</h2>
          <form onSubmit={handleAddIncome} className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">Income Source</label>
              <input
                type="text"
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Primary Salary, Freelance"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="1000.00"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">Add Income</button>
          </form>
        </div>

        {/* Income List */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Income This Month</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ul className="space-y-4">
              {incomes.map((income) => (
                <li key={income.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{income.source}</p>
                    <p className="text-sm text-gray-500">{new Date(income.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(income.amount)}</p>
                    <button onClick={() => handleDeleteIncome(income.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsSection = () => (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Time Period</h3>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
          <option value="2years">Last 2 Years</option>
        </select>
      </div>
    

      {/* Monthly Spending Trends */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Monthly Spending Trends</h2>
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
          })()}
        </div>
      </div>

      {/* Category Spending Trends */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Category Spending Trends</h2>
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
          })()}
        </div>
      </div>

      {/* Income vs Expenses */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Income vs Expenses</h2>
        <div className="h-80">
          {(() => {
            const chartData = getIncomeExpensesChartData();
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
          })()}
        </div>
      </div>

      {/* Budget Performance */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Budget Performance</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Spending</h3>
          <p className="text-3xl font-bold text-blue-600">
            {chartData?.categorySpending ? 
              formatCurrency(chartData.categorySpending.reduce((sum, cat) => sum + cat.total, 0)) : 
              'No data'
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Average per Category</h3>
          <p className="text-3xl font-bold text-green-600">
            {chartData?.categorySpending?.length > 0 ? 
              formatCurrency(chartData.categorySpending.reduce((sum, cat) => sum + cat.total, 0) / chartData.categorySpending.length) : 
              'No data'
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">Per category</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Budget Usage</h3>
          <p className="text-3xl font-bold text-orange-600">
            {chartData?.categorySpending ? 
              (() => {
                const totalSpent = chartData.categorySpending.reduce((sum, cat) => sum + cat.total, 0);
                const totalBudget = chartData.categorySpending.reduce((sum, cat) => sum + (cat.budget || 0), 0);
                const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
                return `${percentage}%`;
              })() : 
              'No data'
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">Of total budget</p>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {chartData?.categorySpending?.map((category) => {
              const budgetUsage = category.budget > 0 ? (category.total / category.budget) * 100 : 0;
              const isOverBudget = budgetUsage > 100;
              const isWarning = budgetUsage > 90;
              
              return (
                <div key={category.category} className="border-l-4 pl-4 py-3" style={{borderColor: isOverBudget ? '#ef4444' : isWarning ? '#eab308' : '#22c55e'}}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{category.category}</h4>
                    <span className="text-sm font-semibold">{formatCurrency(category.total)}</span>
                  </div>
                  {category.budget > 0 && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Budget: {formatCurrency(category.budget)}</span>
                        <span className={`font-medium ${
                          isOverBudget ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {Math.round(budgetUsage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            isOverBudget ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{width: `${Math.min(budgetUsage, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }) || (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <p className="text-gray-500">No category data available</p>
                <p className="text-sm text-gray-400 mt-2">Add some expenses to see analytics</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Coming Soon Features */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">Advanced Analytics Coming Soon</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-blue-600">📈</span>
            <span className="text-blue-800">Monthly spending trends</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-purple-600">🔍</span>
            <span className="text-blue-800">Deep category analysis</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-green-600">💰</span>
            <span className="text-blue-800">Savings rate tracking</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-orange-600">🎯</span>
            <span className="text-blue-800">Budget optimization tips</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIncomeSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Income Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Add Income</h3>
          <form onSubmit={handleAddIncome} className="space-y-4">
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">Income Source</label>
              <input
                type="text"
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Primary Salary, Freelance"
                required
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="1000.00"
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
              Add Income
            </button>
          </form>
        </div>

        {/* Income List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Income This Month</h3>
          <div className="space-y-4">
            {incomes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No income recorded for this month</p>
            ) : (
              incomes.map((income) => (
                <div key={income.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{income.source}</p>
                    <p className="text-sm text-gray-500">{new Date(income.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">{formatCurrency(income.amount)}</p>
                    <button 
                      onClick={() => handleDeleteIncome(income.id)} 
                      className="text-red-500 hover:text-red-700 text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Management</h1>
        <p className="text-gray-600">Manage your budget, track performance, and analyze spending patterns</p>
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
                onClick={fetchBudgetData}
                className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Pill Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2 text-lg">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dynamic Content */}
      {renderContent()}
    </div>
  );
};

export default Budget;

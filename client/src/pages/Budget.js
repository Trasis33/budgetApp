import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import formatCurrency from '../utils/formatCurrency';

// Import shadcn/ui enhanced tabs
import { Tabs, TabsList, TabsTrigger } from '../components/ui/enhanced-tabs';

// Import month/year navigator
import { MonthYearNavigator } from '../components/ui/month-year-navigator';

// Import analytics components
import BudgetPerformanceCards from '../components/BudgetPerformanceCards';
import BudgetPerformanceBars from '../components/BudgetPerformanceBars';
import BudgetPerformanceBadges from '../components/BudgetPerformanceBadges';
import SavingsRateTracker from '../components/SavingsRateTracker';
import SavingsGoalsManager from '../components/SavingsGoalsManager';
import BudgetOptimizationTips from '../components/BudgetOptimizationTips';
import EnhancedCategorySpendingChart from '../components/charts/EnhancedCategorySpendingChart';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import BudgetActualChart from '../components/charts/BudgetActualChart';

const Budget = () => {
  // Active section state for shadcn/ui tabs navigation
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
  const [timePeriod, setTimePeriod] = useState('6months');

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
      const basePromises = [
        axios.get(`/incomes?month=${month}&year=${year}`),
        axios.get(`/summary/charts/${year}/${month}`),
        axios.get('/categories')
      ];
      
      const [incomesRes, chartsRes, categoriesRes] = await Promise.all(basePromises);
      setIncomes(incomesRes.data);
      setChartData(chartsRes.data);
      setCategories(categoriesRes.data);
      
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
  }, [month, year]);

  useEffect(() => {
    fetchBudgetData();
  }, [month, year, fetchBudgetData]);

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/incomes', { source, amount, date });
      setSource('');
      setAmount('');
      fetchBudgetData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await axios.delete(`/incomes/${id}`);
      fetchBudgetData();
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
      fetchBudgetData();
    } catch (err) {
      console.error('Failed to save budget:', err);
      alert('Failed to save budget.');
    }
  };

  // Chart colors
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#22c55e',
    accent: '#f97316',
    purple: '#8b5cf6',
    pink: '#ec4899',
    gray: '#6b7280',
    red: '#ef4444',
    yellow: '#eab308'
  };

  const getCategoryChartData = () => {
    if (!chartData?.categorySpending || chartData.categorySpending.length === 0) {
      return null;
    }

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

    const donutColors = colors.map(color => `${color}B3`);

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
        },
        {
          label: 'Expenses',
          data: [chartData.monthlyTotals.expenses || 0],
          backgroundColor: chartColors.accent + '80',
          borderColor: chartColors.accent,
          borderWidth: 1,
        },
      ],
    };
  };

  const getBudgetVsActualChartData = () => {
    if (!chartData?.categorySpending || chartData.categorySpending.length === 0) {
      return null;
    }

    const performanceData = chartData.categorySpending.map(item => {
      if (!item.budget) return 'none';
      const utilization = (item.total / item.budget) * 100;
      return utilization > 100 ? 'over' : utilization > 90 ? 'warning' : 'good';
    });

    const budgetColors = performanceData.map(status => {
      switch (status) {
        case 'over': return chartColors.red;
        case 'warning': return chartColors.yellow;
        case 'good': return chartColors.secondary;
        default: return chartColors.gray;
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
        },
        {
          label: 'Actual Spending',
          data: chartData.categorySpending.map(c => c.total || 0),
          backgroundColor: budgetColors.map(color => color + '80'),
          borderColor: budgetColors,
          borderWidth: 1,
        }
      ]
    };
  };

  if (!user) {
    return null;
  }

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
      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-80 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-80 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="section-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h2 className="section-title" style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0
                }}>Spending by Category</h2>
              </div>

              <EnhancedCategorySpendingChart
                chartData={getCategoryChartData()}
                formatCurrency={formatCurrency}
                selectedMonth={month - 1}
                onMonthChange={(m) => setMonth(m + 1)}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Income vs. Expenses</h2>
              <div className="h-80">
                <IncomeExpenseChart 
                  chartData={getIncomeExpenseChartData()} 
                  formatCurrency={formatCurrency}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Budget vs. Actual Spending</h2>
            <div className="h-98">
              <BudgetActualChart 
                chartData={getBudgetVsActualChartData()} 
                formatCurrency={formatCurrency}
                categories={categories}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BudgetPerformanceCards />
        <BudgetPerformanceBars />
        <BudgetPerformanceBadges />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Manage Budgets</h2>
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category.id} className="flex items-center gap-2">
                <label className="flex-1 text-sm font-medium text-gray-700">{category.name}</label>
                <input
                  type="number"
                  value={budgets[category.id] || ''}
                  onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                  placeholder="0.00"
                />
                <button onClick={() => handleSaveBudget(category.id)} className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm">Save</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Manage Income</h2>
          <form onSubmit={handleAddIncome} className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Income Source</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Salary, Freelance"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="1000.00"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
              Add Income
            </button>
          </form>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Income This Month</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ul className="space-y-4">
            {incomes.map((income) => (
              <li key={income.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{income.source}</p>
                  <p className="text-sm text-gray-500">{new Date(income.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">{formatCurrency(income.amount)}</p>
                  <button onClick={() => handleDeleteIncome(income.id)} className="text-red-500 hover:text-red-700 text-sm">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsSection = () => (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Time Period</h3>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
          <option value="2years">Last 2 Years</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SavingsRateTracker />
        <SavingsGoalsManager />
      </div>

      <BudgetOptimizationTips />
    </div>
  );

  const renderIncomeSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Add Income</h3>
          <form onSubmit={handleAddIncome} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Income Source</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Salary, Freelance"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="1000.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
              Add Income
            </button>
          </form>
        </div>

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
                      className="text-red-500 hover:text-red-700 text-sm"
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Management</h1>
        <p className="text-gray-600">Manage your budget, track performance, and analyze spending patterns</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button onClick={fetchBudgetData} className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded">
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList>
              {sections.map((section) => (
                <TabsTrigger key={section.id} value={section.id}>
                  <span style={{ 
                    marginRight: 'var(--spacing-lg)', 
                    fontSize: 'var(--font-size-xl)' 
                  }}>
                    {section.icon}
                  </span>
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <span style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              fontWeight: 500
            }}>Filter:</span>
            <MonthYearNavigator 
              month={month}
              year={year}
              onMonthChange={setMonth}
              onYearChange={setYear}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default Budget;

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
import BudgetAccordion from '../components/ui/BudgetAccordion';
import useLazyLoad from '../hooks/useLazyLoad';
import { SkeletonChart } from '../components/ui/Skeletons';

const Budget = () => {
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
  const [timePeriod, setTimePeriod] = useState('6months');

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

  // Lazy-load refs (single declaration)
  const { ref: catRef, isVisible: catVisible } = useLazyLoad();
  const { ref: ieRef, isVisible: ieVisible } = useLazyLoad();
  const { ref: bvaRef, isVisible: bvaVisible } = useLazyLoad();

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
        <div className="space-y-4">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div ref={catRef}>
                {catVisible ? (
                  <EnhancedCategorySpendingChart
                    chartData={getCategoryChartData()}
                    formatCurrency={formatCurrency}
                    selectedMonth={month - 1}
                    onMonthChange={(m) => setMonth(m + 1)}
                  />
                ) : (
                  <SkeletonChart />
                )}
              </div>

              <div ref={ieRef}>
                {ieVisible ? (
                  <IncomeExpenseChart
                    chartData={getIncomeExpenseChartData()}
                    formatCurrency={formatCurrency}
                  />
                ) : (
                  <SkeletonChart />
                )}
              </div>
          </div>

          <div ref={bvaRef}>
              {bvaVisible ? (
                <BudgetActualChart
                  chartData={getBudgetVsActualChartData()}
                  formatCurrency={formatCurrency}
                  categories={categories}
                />
              ) : (
                <SkeletonChart />
              )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BudgetPerformanceCards />
        <BudgetPerformanceBars />
        <BudgetPerformanceBadges />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card hover-lift">
          <div className="section-header">
            <h2 className="section-title gradient-text">Manage Budgets</h2>
          </div>
          <div className="space-y-4">
            <BudgetAccordion
              sections={categories.map(category => {
                const categoryBudget = budgets[category.id] || '';
                return {
                  id: String(category.id),
                  title: category.name,
                  spent: chartData?.categorySpending?.find(c => c.category === category.name)?.total ?? 0,
                  budget: Number(categoryBudget || 0),
                  children: (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={categoryBudget}
                        onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                      <span className="text-sm text-gray-600">kr</span>
                    </div>
                  )
                };
              })}
            />
          </div>
        </div>

        <div>
          <div className="section-header">
            <h2 className="section-title gradient-text">Manage Income</h2>
          </div>
          <form onSubmit={handleAddIncome} className="card hover-lift">
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
            <button type="submit" className="w-full btn btn-primary flex items-center justify-center">
              Add Income
            </button>
          </form>
        </div>
      </div>

      <div className="card hover-lift">
        <div className="section-header">
          <h2 className="section-title">Income This Month</h2>
        </div>
        <div>
          <ul className="space-y-4">
            {incomes.map((income) => (
              <li key={income.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{income.source}</p>
                  <p className="text-sm text-gray-500">{new Date(income.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">{formatCurrency(income.amount)}</p>
                  <button
                    onClick={() => handleDeleteIncome(income.id)}
                    className="btn btn-secondary"
                    style={{ padding: '0.375rem 0.75rem' }}
                  >
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
      <div className="glass-card hover-lift">
        <h3 className="section-title gradient-text">Time Period</h3>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="form-select"
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
    <div className="dashboard-content">
      {/* Page Header */}
      {/*<div className="dashboard-header">
         <h2 className="dashboard-title">Financial Management</h2>
         <div className="dashboard-header-right">
          <div className="dashboard-actions">
            <MonthYearNavigator
              month={month}
              year={year}
              onMonthChange={setMonth}
              onYearChange={setYear}
              className="w-auto"
            />
          </div>
        </div> 
      </div>*/}

      {/* Error card */}
      {error && (
        <div className="glass-card error-card">
          <div className="section-header">
            <h3 className="section-title gradient-text">Error</h3>
          </div>
          <p className="error-message-text">{error}</p>
          <button onClick={fetchBudgetData} className="btn btn-secondary">
            Retry
          </button>
        </div>
      )}

      {/* Tabs card */}
      <div className="dashboard-header">
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="tabs-list-enhanced">
            {sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="tab-trigger-enhanced">
                <span className="tab-icon">{section.icon}</span>
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="dashboard-header-left">
          <div className="dashboard-actions">
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

import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import formatCurrency from '../utils/formatCurrency';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Budget = () => {
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

  const fetchBudgetData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [incomesRes, chartsRes, categoriesRes] = await Promise.all([
        axios.get(`/incomes?month=${month}&year=${year}`),
        axios.get(`/summary/charts/${year}/${month}`),
        axios.get('/categories'),
      ]);
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
  }, [fetchBudgetData]);

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

  // Common chart options for consistency
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

    const colors = [
      chartColors.primary,
      chartColors.secondary,
      chartColors.accent,
      chartColors.purple,
      chartColors.pink,
      chartColors.gray,
      chartColors.red,
      chartColors.yellow
    ];

    return {
      labels: chartData.categorySpending.map((c) => c.category),
      datasets: [
        {
          label: 'Spending by Category',
          data: chartData.categorySpending.map((c) => c.total),
          backgroundColor: colors.slice(0, chartData.categorySpending.length),
          borderWidth: 1,
          borderColor: '#ffffff'
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
          backgroundColor: chartColors.secondary,
          borderColor: chartColors.secondary,
          borderWidth: 1
        },
        {
          label: 'Expenses',
          data: [chartData.monthlyTotals.expenses || 0],
          backgroundColor: chartColors.pink,
          borderColor: chartColors.pink,
          borderWidth: 1
        },
      ],
    };
  };

  const getBudgetVsActualChartData = () => {
    if (!chartData?.categorySpending || chartData.categorySpending.length === 0) {
      return null;
    }

    return {
      labels: chartData.categorySpending.map(c => c.category),
      datasets: [
        {
          label: 'Budgeted',
          data: chartData.categorySpending.map(c => c.budget || 0),
          backgroundColor: chartColors.primary,
          borderColor: chartColors.primary,
          borderWidth: 1
        },
        {
          label: 'Actual',
          data: chartData.categorySpending.map(c => c.total || 0),
          backgroundColor: chartColors.accent,
          borderColor: chartColors.accent,
          borderWidth: 1
        },
      ],
    };
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Household Budget</h1>

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
                className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Month/Year Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
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
                return (
                  <Bar data={chartData} options={barChartOptions} />
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
};

export default Budget;

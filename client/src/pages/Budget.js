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

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [chartData, setChartData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({});

  const fetchBudgetData = useCallback(async () => {
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
      console.error(err);
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

  const categoryChartData = {
    labels: chartData?.categorySpending.map((c) => c.category),
    datasets: [
      {
        label: 'Spending by Category',
        data: chartData?.categorySpending.map((c) => c.total),
        backgroundColor: ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ec4899'],
      },
    ],
  };

  const incomeExpenseChartData = {
    labels: ['Income vs. Expenses'],
    datasets: [
      {
        label: 'Income',
        data: [chartData?.monthlyTotals.income],
        backgroundColor: '#22c55e',
      },
      {
        label: 'Expenses',
        data: [chartData?.monthlyTotals.expenses],
        backgroundColor: '#ec4899',
      },
    ],
  };

  const budgetVsActualChartData = {
    labels: chartData?.categorySpending.map(c => c.category),
    datasets: [
      {
        label: 'Budgeted',
        data: chartData?.categorySpending.map(c => c.budget),
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Actual',
        data: chartData?.categorySpending.map(c => c.total),
        backgroundColor: '#f97316',
      },
    ],
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Household Budget</h1>

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 pb-20 rounded-lg shadow-md h-96">
          <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
          {chartData && (
            <Doughnut
              data={categoryChartData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      boxWidth: 20,
                      padding: 10,
                    },
                  },
                },
              }}
            />
          )}
        </div>
        <div className="bg-white p-6 pb-20 rounded-lg shadow-md h-96">
          <h2 className="text-xl font-semibold mb-4">Income vs. Expenses</h2>
          {chartData && <Bar data={incomeExpenseChartData} options={{ responsive: true, maintainAspectRatio: false }} />}
        </div>
      </div>

      {/* New Budget vs Actual Chart */}
      <div className="bg-white p-6 pb-14 rounded-lg shadow-md mb-8 h-96">
        <h2 className="text-xl font-semibold mb-4">Budget vs. Actual Spending</h2>
        {chartData && <Bar data={budgetVsActualChartData} options={{ responsive: true, maintainAspectRatio: false }} />}
      </div>

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

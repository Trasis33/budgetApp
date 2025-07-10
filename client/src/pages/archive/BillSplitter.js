
import React, { useState } from 'react';
import api from '../api/axios';

const BillSplitter = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const response = await api.get(`/summary/settle?month=${month}&year=${year}`);
      setSummary(response.data);
    } catch (err) {
      setError('Failed to calculate bill split. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bill Splitter</h1>
      <div className="flex gap-4 mb-4">
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
          <select
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleCalculate}
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {loading ? 'Calculating...' : 'Calculate'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {summary && (
        <div className="mt-8 p-4 border rounded-md bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Settlement Summary</h2>
          <p><strong>Total Shared Expenses:</strong> {summary.totalSharedExpenses} SEK</p>
          <p><strong>{summary.user1.name} Paid:</strong> {summary.user1.paid} SEK</p>
          <p><strong>{summary.user2.name} Paid:</strong> {summary.user2.paid} SEK</p>
          <p className="text-lg font-bold mt-4">{summary.settlement.message}</p>
        </div>
      )}
    </div>
  );
};

export default BillSplitter;

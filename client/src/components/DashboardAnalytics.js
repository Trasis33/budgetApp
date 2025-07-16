import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import formatCurrency from '../utils/formatCurrency';
import { AlertCircle } from 'lucide-react';
import MonthlyBreakdownTable from './MonthlyBreakdownTable';
import SpendingTrendsChart from './SpendingTrendsChart';
import MonthlyComparisonChart from './MonthlyComparisonChart';
import KPISummaryCards from './KPISummaryCards';



const DashboardAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('6months');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selection
      const endDate = new Date();
      const startDate = new Date();
      
      switch(timeRange) {
        case '3months':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 6);
      }

      const response = await axios.get(
        `/analytics/trends/${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`
      );
      
      setAnalytics(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);







  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3">
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4 text-red-500 mr-1.5" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-fluid-lg font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center space-x-1.5">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      {/* <KPISummaryCards
        analytics={analytics}
        formatCurrency={formatCurrency}
      /> */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpendingTrendsChart
          monthlyTotals={analytics?.monthlyTotals}
          formatCurrency={formatCurrency}
        />
        <MonthlyComparisonChart
          monthlyTotals={analytics?.monthlyTotals}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Monthly Breakdown Table */}
      <MonthlyBreakdownTable
        monthlyTotals={analytics?.monthlyTotals}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default DashboardAnalytics;

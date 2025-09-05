import React, { useState, useEffect } from 'react';
import DashboardAnalytics from './DashboardAnalytics';
import SpendingPatternsChart from './SpendingPatternsChart';
import BudgetPerformanceCards from './BudgetPerformanceCards';
import BudgetPerformanceBadges from './BudgetPerformanceBadges';
import SavingsRateTracker from './SavingsRateTracker';
import OptimizationTipCard from './OptimizationTipCard';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import { 
  RefreshCw, 
  Download,
  TrendingUp,
  Target,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Helper function to safely calculate numbers and avoid NaN
  const getSafeNumber = (spending, income) => {
    if (!spending || !income || income === 0) return 0;
    const rate = ((income - spending) / income) * 100;
    return isNaN(rate) ? 0 : Math.round(rate);
  };

  useEffect(() => {
    fetchDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const fetchDashboardData = async () => {
    try {
      const currentDate = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [summaryRes, patternsRes, optimizationRes] = await Promise.all([
        axios.get(`/summary/monthly/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}`),
        axios.get(`/analytics/trends/${sixMonthsAgo.toISOString().split('T')[0]}/${currentDate.toISOString().split('T')[0]}`),
        axios.get('/optimization/tips')
      ]);

      setDashboardData({
        summary: summaryRes.data,
        patterns: patternsRes.data,
        optimization: optimizationRes.data
      });
      
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  const handleExportData = () => {
    // Implementation for data export
    const dataToExport = {
      timestamp: new Date().toISOString(),
      summary: dashboardData?.summary,
      patterns: dashboardData?.patterns,
      user: user?.email
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading && !dashboardData) {
    return (
      <div className="dashboard-content">
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen bg-gray-50">
    <div className="main-content">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-gray-200">
        <div className="container-contained">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4">
            <div className="mb-3 sm:mb-0">
              <h1 className="text-fluid-xl font-bold text-gray-900 tracking-tight">Enhanced Dashboard</h1>
              <p className="text-sm text-gray-600 mt-0.5 font-medium">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                 onClick={handleManualRefresh}
                 disabled={loading}
                 className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-soft text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
               >
                 <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                 Refresh
               </button>
               
               <button
                 onClick={handleExportData}
                 className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-soft text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
               >
                 <Download className="w-4 h-4 mr-1.5" />
                 Export
               </button>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="autoRefresh" className="ml-2 text-sm text-gray-700 font-medium">
                  Auto-refresh
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-contained py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-3 hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-0.5">This Month</p>
                <p className="text-lg font-bold text-gray-900 truncate" title={formatCurrency(dashboardData?.summary?.expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0)}>
                  {formatCurrency(dashboardData?.summary?.expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0)}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-3 hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-0.5">Savings Rate</p>
                <p className="text-lg font-bold text-gray-900 truncate" title={`${getSafeNumber(dashboardData?.patterns?.summary?.avgMonthlySpending, dashboardData?.summary?.income)}%`}>
                  {getSafeNumber(dashboardData?.patterns?.summary?.avgMonthlySpending, dashboardData?.summary?.income)}%
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-3 hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-0.5">Budget Status</p>
                <p className="text-lg font-bold text-gray-900 truncate" title={dashboardData?.summary?.budgetStatus || 'On Track'}>
                  {dashboardData?.summary?.budgetStatus || 'On Track'}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <div className="p-1.5 bg-purple-50 rounded-lg">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft border border-gray-100 p-3 hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-0.5">Alerts</p>
                <p className="text-lg font-bold text-gray-900">
                  {dashboardData?.optimization?.alerts?.length || 0}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <div className="p-1.5 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Main Analytics */}
          <div className="lg:col-span-2 space-y-4">
            {/* Analytics Overview */}
            <div className="bg-white rounded-lg shadow-soft border border-gray-100">
              <DashboardAnalytics />
            </div>

            {/* Spending Patterns */}
            <div className="bg-white rounded-lg shadow-soft border border-gray-100">
              <div className="px-3 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Spending Patterns</h3>
              </div>
              <div className="p-3">
                <SpendingPatternsChart patterns={dashboardData?.patterns?.categoryTrends || {}} />
              </div>
            </div>

            {/* Budget Performance */}
            <div className="bg-white rounded-lg shadow-soft border border-gray-100">
              <div className="px-3 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Budget Performance</h3>
              </div>
              <div className="p-3">
                <BudgetPerformanceCards />
              </div>
            </div>
          </div>

          {/* Right Column - Insights & Optimization */}
          <div className="space-y-4">
            {/* Savings Tracker */}
            <div className="bg-white rounded-lg shadow-soft border border-gray-100">
              <div className="px-3 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Savings Progress</h3>
              </div>
              <div className="p-3">
                <SavingsRateTracker />
              </div>
            </div>

            {/* Performance Badges */}
            <div className="bg-white rounded-lg shadow-soft border border-gray-100">
              <div className="px-3 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Achievements</h3>
              </div>
              <div className="p-3">
                <BudgetPerformanceBadges />
              </div>
            </div>

            {/* Optimization Tips */}
            <div className="bg-white rounded-lg shadow-soft border border-gray-100">
              <div className="px-3 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Smart Tips</h3>
              </div>
              <div className="p-3 space-y-2">
                {dashboardData?.optimization?.tips?.map((tip, index) => (
                  <OptimizationTipCard key={index} tip={tip} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-soft border border-gray-100">
              <div className="px-3 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-3 space-y-1.5">
                <button className="w-full text-left px-2 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm">
                  Add Expense
                </button>
                <button className="w-full text-left px-2 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm">
                  Set Budget Goal
                </button>
                <button className="w-full text-left px-2 py-1.5 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors text-sm">
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;

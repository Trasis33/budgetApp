import React, { useState, useEffect, useCallback } from 'react';
import DashboardAnalytics from './DashboardAnalytics';
import BudgetPerformanceCards from './BudgetPerformanceCards';
import BudgetPerformanceBadges from './BudgetPerformanceBadges';
import OptimizationTipCard from './OptimizationTipCard';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import KPISummaryCards from './KPISummaryCards';
import { 
  RefreshCw, 
  Download,
  AlertTriangle
} from 'lucide-react';

// Import the redesigned mini-components
import SpendingPatternsMini from './dashboard-mini/SpendingPatternsMini';
import SavingsRateMini from './dashboard-mini/SavingsRateMini';

const RedesignedModernEnhancedDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(30000); // 30 seconds
  const [timePeriod, setTimePeriod] = useState('6months'); // Track selected time period
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(null);

  // Responsive viewport tracking
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDateRange = useCallback(() => {
    const currentDate = new Date();
    const startDate = new Date();
    
    switch(timePeriod) {
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default: // '6months'
        startDate.setMonth(startDate.getMonth() - 6);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: currentDate.toISOString().split('T')[0]
    };
  }, [timePeriod]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null); // Clear any previous errors
      const { startDate, endDate } = getDateRange();
      const currentDate = new Date();
      
      // Get current month/year for charts data
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const [chartsRes, analyticsRes, patternsRes, optimizationRes, savingsRes] = await Promise.all([
        axios.get(`/summary/charts/${currentYear}/${currentMonth}`),
        axios.get(`/analytics/trends/${startDate}/${endDate}`),
        axios.get('/optimization/analyze'),
        axios.get('/optimization/tips').catch(() => ({ data: { tips: [] } })),
        axios.get(`/analytics/savings-analysis/${startDate}/${endDate}`).catch(() => ({ data: null }))
      ]);

      setDashboardData({
        summary: {
          expenses: chartsRes.data.categorySpending || [],
          income: chartsRes.data.monthlyTotals?.income || 0,
          totalExpenses: chartsRes.data.monthlyTotals?.expenses || 0
        },
        analytics: analyticsRes.data,
        patterns: patternsRes.data,
        optimization: optimizationRes.data,
        savings: savingsRes.data
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    fetchDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchDashboardData]); // Re-fetch when time period changes

  const handleManualRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !dashboardData) {
    return (
      <div className="dashboard-content">
        <div className="flex justify-center items-center h-64">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="error-message">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <strong>Error</strong>
          </div>
          <p>{error}</p>
          <button 
            onClick={handleManualRefresh}
            className="btn btn-primary mt-3"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h2 className="dashboard-title">Enhanced Dashboard</h2>
        </div>
        <div className="dashboard-header-right">
          <p className="dashboard-subtitle">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <div className="dashboard-actions">
            <button 
              onClick={handleManualRefresh}
              className="btn btn-secondary"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {!isMobile && <span>Refresh</span>}
            </button>
            <button 
              onClick={handleExportData}
              className="btn btn-secondary"
            >
              <Download className="h-4 w-4" />
              {!isMobile && <span>Export</span>}
            </button>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span>Auto-refresh</span>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="stats-grid">
        <KPISummaryCards 
            analytics={dashboardData?.analytics}
            formatCurrency={formatCurrency}
        />
      </div>

      {/* Redesigned Analytics Section with Improved Container Structure */}
      <div className="analytics-section">
        <div className="section-header">
          <h3 className="section-title">Analytics Dashboard</h3>
          <select 
            className="time-filter" 
            value={timePeriod} 
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            <option value="6months">Last 6 Months</option>
            <option value="3months">Last 3 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>

        {/* Redesigned Analytics Grid with Better Height Management */}
        <div className="redesigned-analytics-grid">
          {/* Left Column - Primary Analytics */}
          <div className="analytics-column-left">
            {/* Spending Patterns Mini Component */}
            <div className="mini-chart-container">
              <SpendingPatternsMini 
                patterns={dashboardData?.patterns?.patterns || {}}
                loading={loading}
              />
            </div>
            
            {/* Budget Performance Cards */}
            <div className="mini-chart-container">
              <div className="chart-header">
                <h4 className="chart-title">Budget Performance</h4>
                <p className="chart-subtitle">Budget vs actual spending</p>
              </div>
              <div className="contained-content">
                <BudgetPerformanceCards />
              </div>
            </div>
          </div>

          {/* Right Column - Secondary Analytics */}
          <div className="analytics-column-right">
            {/* Savings Rate Mini Component */}
            <div className="mini-chart-container">
              <SavingsRateMini 
                savingsData={dashboardData?.savings}
                loading={loading}
                timePeriod={timePeriod}
              />
            </div>
            
            {/* Performance Metrics */}
            <div className="mini-chart-container">
              <div className="chart-header">
                <h4 className="chart-title">Performance Metrics</h4>
                <p className="chart-subtitle">Key achievements</p>
              </div>
              <div className="contained-content">
                <BudgetPerformanceBadges />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Analytics Component - Full Width */}
      <div className="card full-width-card">
        <div className="chart-header">
          <h3 className="section-title">Detailed Analytics</h3>
        </div>
        <div className="contained-content">
          <DashboardAnalytics data={dashboardData?.analytics} />
        </div>
      </div>

      {/* Optimization Tips */}
      {dashboardData?.optimization?.tips && dashboardData.optimization.tips.length > 0 && (
        <div className="card full-width-card">
          <div className="chart-header">
            <h3 className="section-title">Smart Optimization Tips</h3>
          </div>
          <div className="space-y-3">
            {dashboardData.optimization.tips.map((tip, index) => (
              <OptimizationTipCard key={index} tip={tip} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RedesignedModernEnhancedDashboard;

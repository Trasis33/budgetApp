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
import KPISummaryCards from './KPISummaryCards';
import { 
  RefreshCw, 
  Download,
  TrendingUp,
  Target,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

const ModernEnhancedDashboard = () => {
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

      const startDate = sixMonthsAgo.toISOString().split('T')[0];
      const endDate = currentDate.toISOString().split('T')[0];
      
      // Get current month/year for charts data
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const [chartsRes, analyticsRes, patternsRes, optimizationRes] = await Promise.all([
        axios.get(`/summary/charts/${currentYear}/${currentMonth}`),
        axios.get(`/analytics/trends/${startDate}/${endDate}`),
        axios.get('/optimization/analyze'),
        axios.get('/optimization/tips').catch(() => ({ data: { tips: [] } }))
      ]);

      setDashboardData({
        summary: {
          expenses: chartsRes.data.categorySpending || [],
          income: chartsRes.data.monthlyTotals?.income || 0,
          totalExpenses: chartsRes.data.monthlyTotals?.expenses || 0
        },
        analytics: analyticsRes.data,
        patterns: patternsRes.data,
        optimization: optimizationRes.data
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">Enhanced Dashboard</h2>
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
              Refresh
            </button>
            <button 
              onClick={handleExportData}
              className="btn btn-secondary"
            >
              <Download className="h-4 w-4" />
              Export
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
        {/* <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">This Month</span>
            <div className="stat-icon" style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)', 
              color: '#3b82f6'
            }}>
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="stat-value">
            {formatCurrency(dashboardData?.summary?.totalExpenses || 0)}
          </div>
          <div className="stat-change" style={{color: '#10b981'}}>
            +2.5% from last month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Savings Rate</span>
            <div className="stat-icon" style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(134, 239, 172, 0.1) 100%)', 
              color: '#22c55e'
            }}>
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="stat-value">
            {getSafeNumber(dashboardData?.patterns?.summary?.avgMonthlySpending, dashboardData?.summary?.income)}%
          </div>
          <div className="stat-change" style={{color: '#64748b'}}>
            No change
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Budget Status</span>
            <div className="stat-icon" style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(196, 181, 253, 0.1) 100%)', 
              color: '#8b5cf6'
            }}>
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="stat-value">On Track</div>
          <div className="stat-change" style={{color: '#10b981'}}>
            Within budget
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Alerts</span>
            <div className="stat-icon" style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(252, 211, 77, 0.1) 100%)', 
              color: '#f59e0b'
            }}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="stat-value">0</div>
          <div className="stat-change" style={{color: '#64748b'}}>
            No alerts
          </div>
        </div> */}
      </div>

      {/* Analytics Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h3 className="section-title">Analytics Dashboard</h3>
          <select className="time-filter">
            <option>Last 6 Months</option>
            <option>Last 3 Months</option>
            <option>Last Year</option>
          </select>
        </div>

        <div className="analytics-grid">
          <SpendingPatternsChart patterns={dashboardData.patterns.patterns || {}} />
          <SavingsRateTracker />
          <BudgetPerformanceCards />
          <BudgetPerformanceBadges />
        </div>
      </div>

      {/* Main Dashboard Analytics Component */}
      <div className="card">
        <div className="chart-header">
          <h3 className="section-title">Detailed Analytics</h3>
        </div>
        <DashboardAnalytics data={dashboardData?.analytics} />
      </div>

      {/* Optimization Tips */}
      {dashboardData?.optimization?.tips && dashboardData.optimization.tips.length > 0 && (
        <div className="card">
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

export default ModernEnhancedDashboard;

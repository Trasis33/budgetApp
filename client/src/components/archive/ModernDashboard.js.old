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
  DollarSign,
  BarChart3,
  CreditCard,
  Calendar,
  Settings
} from 'lucide-react';

const ModernDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);

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
      <div className="app-container">
        <nav className="sidebar">
          <div className="logo">Expense Tracker</div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </nav>
        <main className="main-content">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-sm font-medium">Loading enhanced dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div className="logo">Expense Tracker</div>
        <a href="#" className="nav-item active">
          <BarChart3 className="nav-icon" />
          Dashboard
        </a>
        <a href="#" className="nav-item">
          <DollarSign className="nav-icon" />
          Financial
        </a>
        <a href="#" className="nav-item">
          <CreditCard className="nav-icon" />
          Expenses
        </a>
        <a href="#" className="nav-item">
          <Calendar className="nav-icon" />
          Monthly Statement
        </a>
        <a href="#" className="nav-item">
          <Settings className="nav-icon" />
          Settings
        </a>
      </nav>

      <main className="main-content">
        {/* Header */}
        <header className="header">
          <h1 className="header-title">Expense Tracker</h1>
          <div className="header-actions">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span>{user?.name || 'User'}</span>
            </div>
            <button className="btn btn-secondary">Logout</button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h2 className="dashboard-title">Enhanced Dashboard</h2>
            <p className="dashboard-subtitle">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
            <div className="dashboard-actions">
              <button 
                onClick={handleManualRefresh}
                disabled={loading}
                className="btn btn-secondary"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={handleExportData}
                className="btn btn-secondary"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input 
                  type="checkbox" 
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span>Auto-refresh</span>
              </label>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">This Month</span>
                <div className="stat-icon">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="stat-value">
                {formatCurrency(dashboardData?.summary?.expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0)}
              </div>
              <div className="stat-change up">
                +2.5% from last month
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Savings Rate</span>
                <div className="stat-icon">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="stat-value">
                {getSafeNumber(dashboardData?.patterns?.summary?.avgMonthlySpending, dashboardData?.summary?.income)}%
              </div>
              <div className="stat-change neutral">
                No change
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Budget Status</span>
                <div className="stat-icon">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="stat-value">
                {dashboardData?.summary?.budgetStatus || 'On Track'}
              </div>
              <div className="stat-change up">
                Within budget
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-title">Alerts</span>
                <div className="stat-icon">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="stat-value">
                {dashboardData?.optimization?.alerts?.length || 0}
              </div>
              <div className="stat-change neutral">
                No alerts
              </div>
            </div>
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
              <div className="chart-card">
                <div className="chart-header">
                  <h4 className="chart-title">Total Spending</h4>
                  <p className="chart-subtitle">
                    {formatCurrency(dashboardData?.patterns?.summary?.totalSpending || 0)}
                  </p>
                </div>
                <div className="chart-container" style={{ height: '140px' }}>
                  <SpendingPatternsChart patterns={dashboardData?.patterns?.categoryTrends || {}} />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h4 className="chart-title">Avg Monthly</h4>
                  <p className="chart-subtitle">
                    {formatCurrency(dashboardData?.patterns?.summary?.avgMonthlySpending || 0)}
                  </p>
                </div>
                <div className="chart-container" style={{ height: '140px' }}>
                  <DashboardAnalytics />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h4 className="chart-title">Budget Performance</h4>
                  <p className="chart-subtitle">This Month</p>
                </div>
                <div className="chart-container" style={{ height: '140px' }}>
                  <BudgetPerformanceCards />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h4 className="chart-title">Savings Progress</h4>
                  <p className="chart-subtitle">Trending Up</p>
                </div>
                <div className="chart-container" style={{ height: '140px' }}>
                  <SavingsRateTracker />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Table and Sidebar */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            {/* Monthly Breakdown Table */}
            <div className="table-card">
              <div className="table-header">
                <h3 className="table-title">Monthly Breakdown</h3>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Spending</th>
                    <th>Budget</th>
                    <th>Variance</th>
                    <th>Expenses</th>
                    <th>Avg/Expense</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.patterns?.monthlyBreakdown?.map((month, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 600 }}>{month.month}</td>
                      <td>{formatCurrency(month.spending)}</td>
                      <td>{formatCurrency(month.budget)}</td>
                      <td>
                        <span className={`badge ${month.variance >= 0 ? 'badge-success' : 'badge-error'}`}>
                          {month.variance >= 0 ? '+' : ''}{formatCurrency(month.variance)} ({month.variancePercent}%)
                        </span>
                      </td>
                      <td>{month.expenseCount}</td>
                      <td>{formatCurrency(month.avgExpense)}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Savings Progress Sidebar */}
            <div className="savings-progress">
              <div className="progress-header">
                <h3 className="progress-title">Savings Progress</h3>
              </div>

              <div className="progress-stats">
                <div className="progress-stat">
                  <div className="progress-stat-label">Avg Savings Rate</div>
                  <div className="progress-stat-value">
                    {getSafeNumber(dashboardData?.patterns?.summary?.avgMonthlySpending, dashboardData?.summary?.income)}.0%
                  </div>
                </div>
                <div className="progress-stat">
                  <div className="progress-stat-label">Total Savings</div>
                  <div className="progress-stat-value">
                    {formatCurrency(dashboardData?.summary?.totalSavings || 0)}
                  </div>
                </div>
                <div className="progress-stat">
                  <div className="progress-stat-label">Trend</div>
                  <div className="progress-stat-value" style={{ color: '#10b981' }}>
                    Stable
                  </div>
                </div>
              </div>

              <div className="chart-container" style={{ height: '120px' }}>
                <SavingsRateTracker />
              </div>

              {/* Optimization Tips */}
              <div className="savings-goals">
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1e293b' }}>
                  💡 Smart Tips
                </h4>
                {dashboardData?.optimization?.tips?.slice(0, 3).map((tip, index) => (
                  <div key={index} className="goal-item">
                    <div className="goal-info">
                      <div className="goal-icon">💡</div>
                      <div className="goal-details">
                        <h4>{tip.title}</h4>
                        <p>{tip.description}</p>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="goal-item">
                    <div className="goal-info">
                      <div className="goal-icon">🚨</div>
                      <div className="goal-details">
                        <h4>Emergency fund</h4>
                        <p>Build your emergency savings</p>
                      </div>
                    </div>
                    <div className="goal-amount">50 000,00 kr</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModernDashboard;
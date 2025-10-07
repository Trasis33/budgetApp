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
 

// Phase 2: lazy-loading and skeletons
import useLazyLoad from '../hooks/useLazyLoad';
import { SkeletonChart } from './ui/Skeletons';

const ModernEnhancedDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  // Auto-refresh controls removed per design choice

  // Helper function to safely calculate numbers and avoid NaN
  const getSafeNumber = (spending, income) => {
    if (!spending || !income || income === 0) return 0;
    const rate = ((income - spending) / income) * 100;
    return isNaN(rate) ? 0 : Math.round(rate);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      
      const [chartsRes, analyticsRes, patternsRes, optimizationRes, settlementRes] = await Promise.all([
        axios.get(`/summary/charts/${currentYear}/${currentMonth}`),
        axios.get(`/analytics/trends/${startDate}/${endDate}`),
        axios.get('/optimization/analyze'),
        axios.get('/optimization/tips').catch(() => ({ data: { tips: [] } })),
        axios.get('/analytics/current-settlement')
      ]);

      setDashboardData({
        summary: {
          expenses: chartsRes.data.categorySpending || [],
          income: chartsRes.data.monthlyTotals?.income || 0,
          totalExpenses: chartsRes.data.monthlyTotals?.expenses || 0
        },
        analytics: {
          ...analyticsRes.data,
          settlement: settlementRes.data
        },
        patterns: patternsRes.data || { patterns: {} },
        optimization: optimizationRes.data
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  

  // Declare lazy-load refs before any early returns (Rules of Hooks)
  const { ref: patternsRef, isVisible: patternsVisible } = useLazyLoad();
  const { ref: savingsRef, isVisible: savingsVisible } = useLazyLoad();
  const { ref: perfCardsRef, isVisible: perfCardsVisible } = useLazyLoad();
  const { ref: perfBadgesRef, isVisible: perfBadgesVisible } = useLazyLoad();
  const { ref: analyticsRef, isVisible: analyticsVisible } = useLazyLoad();

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
{/*       <div className="dashboard-header">
        <h2 className="dashboard-title">Enhanced Dashboard</h2>
        <div className="dashboard-header-right">
          <p className="dashboard-subtitle">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div> */}

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
          <div className="stat-change neutral">
            No change
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Budget Status</span>
            <div className="stat-icon">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="stat-value">On Track</div>
          <div className="stat-change up">
            Within budget
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Alerts</span>
            <div className="stat-icon">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="stat-value">0</div>
          <div className="stat-change">
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
          <div ref={patternsRef}>
            {patternsVisible ? (
              <SpendingPatternsChart patterns={dashboardData?.patterns?.patterns || {}} />
            ) : (
              <SkeletonChart />
            )}
          </div>
          <div ref={savingsRef}>
            {savingsVisible ? <SavingsRateTracker /> : <SkeletonChart />}
          </div>
          <div ref={perfCardsRef}>
            {perfCardsVisible ? <BudgetPerformanceCards /> : <SkeletonChart />}
          </div>
          <div ref={perfBadgesRef}>
            {perfBadgesVisible ? <BudgetPerformanceBadges /> : <SkeletonChart />}
          </div>
        </div>
      </div>

      {/* Main Dashboard Analytics Component */}
      <div className="card" ref={analyticsRef}>
        <div className="chart-header">
          <h3 className="section-title">Detailed Analytics</h3>
        </div>
        {analyticsVisible ? (
          <DashboardAnalytics data={dashboardData?.analytics} />
        ) : (
          <SkeletonChart />
        )}
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

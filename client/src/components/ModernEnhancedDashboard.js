import React, { useState, useEffect, useMemo } from 'react';
import DashboardAnalytics from './DashboardAnalytics';
import SpendingPatternsChart from './SpendingPatternsChart';
import BudgetPerformanceCards from './BudgetPerformanceCards';
import BudgetPerformanceBadges from './BudgetPerformanceBadges';
import SavingsRateTracker from './SavingsRateTracker';
import OptimizationTipCard from './OptimizationTipCard';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import KPISummaryCards from './KPISummaryCards';
import { useScope } from '../context/ScopeContext';
 
// Phase 2: lazy-loading and skeletons
import useLazyLoad from '../hooks/useLazyLoad';
import { SkeletonChart } from './ui/Skeletons';

const ModernEnhancedDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { scope, totals, isPartnerConnected } = useScope();
  // Auto-refresh controls removed per design choice

  const scopeMeta = useMemo(() => {
    const base = {
      ours: { key: 'ours', label: 'Shared scope', amount: totals?.ours || 0, disabled: false },
      mine: { key: 'mine', label: 'My scope', amount: totals?.mine || 0, disabled: false },
      partner: {
        key: 'partner',
        label: isPartnerConnected ? "Partner scope" : 'Partner scope (link required)',
        amount: totals?.partner || 0,
        disabled: !isPartnerConnected,
      },
    };
    return base[scope] || base.ours;
  }, [isPartnerConnected, scope, totals]);

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

      {/* Quick Stats Grid */}
      <div className="stats-grid">
        <KPISummaryCards 
            analytics={dashboardData?.analytics}
            formatCurrency={formatCurrency}
      scopeMeta={scopeMeta}
        />
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
{/*           <div ref={perfCardsRef}>
            {perfCardsVisible ? <BudgetPerformanceCards /> : <SkeletonChart />}
          </div>
          <div ref={perfBadgesRef}>
            {perfBadgesVisible ? <BudgetPerformanceBadges /> : <SkeletonChart />}
          </div> */}
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

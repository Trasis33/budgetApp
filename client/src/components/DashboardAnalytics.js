import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
// import { useAuth } from '../context/AuthContext';
import formatCurrency from '../utils/formatCurrency';
import { AlertCircle } from 'lucide-react';
import MonthlyBreakdownTable from './MonthlyBreakdownTable';
import SpendingTrendsChart from './SpendingTrendsChart';
import MonthlyComparisonChart from './MonthlyComparisonChart';
// import KPISummaryCards from './KPISummaryCards';



const DashboardAnalytics = () => {
  // const { user } = useAuth(); // Commented out as not currently used
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
      <div className="analytics-section">
        {/* <div className="section-header">
          <h2 className="dashboard-title">Analytics Dashboard</h2>
        </div> */}
        <div className="loading-container" style={{ 
          height: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div className="loading-spinner"></div>
          <p style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--spacing-xl)'
          }}>
            Loading analytics dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-section">
        {/* <div className="section-header">
          <h2 className="dashboard-title">Analytics Dashboard</h2>
        </div> */}
        <div className="error-message">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <AlertCircle style={{ 
              width: '1rem', 
              height: '1rem', 
              color: 'var(--color-error)',
              marginRight: 'var(--spacing-lg)'
            }} />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchAnalytics}
            className="btn btn-primary"
          >
            Retry Loading Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-section">
      {/* Header with Controls */}
      <div className="section-header">
        {/* <h2 className="dashboard-title">Analytics Dashboard</h2> */}
        <div className="dashboard-actions">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-filter"
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
      <div className="analytics-grid">
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
      <div className="table-section">
        <div className="section-header">
          <h3 className="section-title">Monthly Breakdown</h3>
        </div>
        <MonthlyBreakdownTable
          monthlyTotals={analytics?.monthlyTotals}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
};

export default DashboardAnalytics;

import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';

/**
 * MiniSavingsRateTracker - Lightweight version without nested containers
 * Optimized for use within the OptimizedAnalyticsSection
 */
const MiniSavingsRateTracker = ({ timePeriod = '6months', startDate, endDate, compact = false }) => {
  const [savingsData, setSavingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavingsData = useCallback(async (dates = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const start = dates.startDate || startDate;
      const end = dates.endDate || endDate;
      
      console.log('MiniSavingsRateTracker fetching data for dates:', { start, end });
      
      if (!start || !end) {
        console.log('Missing date parameters, using mock data for demo');
        // Use mock data for demonstration
        setSavingsData({
          summary: {
            averageSavingsRate: 18.5,
            totalSavings: 2850,
            monthCount: 6,
            trendDirection: 'increasing'
          },
          monthlyData: [
            { month: '2024-01', savingsRate: 15.2 },
            { month: '2024-02', savingsRate: 17.8 },
            { month: '2024-03', savingsRate: 19.1 },
            { month: '2024-04', savingsRate: 16.5 },
            { month: '2024-05', savingsRate: 20.3 },
            { month: '2024-06', savingsRate: 22.1 }
          ],
          savingsGoals: [
            {
              id: 1,
              goal_name: 'Emergency Fund',
              target_amount: 10000,
              category: 'Emergency',
              target_date: '2024-12-31'
            },
            {
              id: 2,
              goal_name: 'Vacation',
              target_amount: 3000,
              category: 'Travel',
              target_date: '2024-08-15'
            }
          ]
        });
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`/analytics/savings-analysis/${start}/${end}`);
        setSavingsData(response.data);
      } catch (apiErr) {
        console.log('API call failed, using mock data:', apiErr.message);
        // Fallback to mock data if API fails
        setSavingsData({
          summary: {
            averageSavingsRate: 18.5,
            totalSavings: 2850,
            monthCount: 6,
            trendDirection: 'increasing'
          },
          monthlyData: [
            { month: '2024-01', savingsRate: 15.2 },
            { month: '2024-02', savingsRate: 17.8 },
            { month: '2024-03', savingsRate: 19.1 },
            { month: '2024-04', savingsRate: 16.5 },
            { month: '2024-05', savingsRate: 20.3 },
            { month: '2024-06', savingsRate: 22.1 }
          ],
          savingsGoals: [
            {
              id: 1,
              goal_name: 'Emergency Fund',
              target_amount: 10000,
              category: 'Emergency',
              target_date: '2024-12-31'
            }
          ]
        });
      }
    } catch (err) {
      console.error('Error in fetchSavingsData:', err);
      setError('Failed to load savings data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    // Always use mock data for demonstration
    console.log('MiniSavingsRateTracker initializing with mock data');
    setSavingsData({
      summary: {
        averageSavingsRate: 18.5,
        totalSavings: 28500,
        monthCount: 6,
        trendDirection: 'increasing'
      },
      monthlyData: [
        { month: '2024-01', savingsRate: 15.2 },
        { month: '2024-02', savingsRate: 17.8 },
        { month: '2024-03', savingsRate: 19.1 },
        { month: '2024-04', savingsRate: 16.5 },
        { month: '2024-05', savingsRate: 20.3 },
        { month: '2024-06', savingsRate: 22.1 }
      ],
      savingsGoals: [
        {
          id: 1,
          goal_name: 'Emergency Fund',
          target_amount: 100000,
          category: 'Emergency',
          target_date: '2024-12-31'
        },
        {
          id: 2,
          goal_name: 'Vacation',
          target_amount: 30000,
          category: 'Travel',
          target_date: '2024-08-15'
        }
      ]
    });
    setLoading(false);
  }, [timePeriod]);

  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getSavingsRateChartData = () => {
    if (!savingsData || !savingsData.monthlyData) return null;

    const months = savingsData.monthlyData.map(item => formatMonthLabel(item.month));
    const savingsRates = savingsData.monthlyData.map(item => item.savingsRate);

    return {
      labels: months,
      datasets: [
        {
          label: 'Savings Rate (%)',
          data: savingsRates,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: compact ? 2 : 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: savingsRates.map(rate => 
            rate < 0 ? '#ef4444' : 
            rate < 10 ? '#f59e0b' : 
            '#10b981'
          ),
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1,
          pointRadius: compact ? 2 : 4,
          pointHoverRadius: compact ? 4 : 6
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !compact,
        position: 'top',
        labels: {
          color: 'var(--color-text-secondary)',
          font: {
            family: 'var(--font-primary)',
            size: compact ? 10 : 12,
            weight: '500'
          },
          padding: compact ? 8 : 16,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'var(--bg-card)',
        titleColor: 'var(--color-text-primary)',
        bodyColor: 'var(--color-text-secondary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: !compact,
          color: 'var(--border-color)',
        },
        ticks: {
          color: 'var(--color-text-secondary)',
          font: {
            size: compact ? 9 : 10,
          },
        }
      },
      y: {
        grid: {
          display: !compact,
          color: 'var(--border-color)',
        },
        ticks: {
          color: 'var(--color-text-secondary)',
          font: {
            size: compact ? 9 : 10,
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  const getSavingsRateColorVariable = (rate) => {
    if (rate < 0) return 'var(--color-error)';
    if (rate < 10) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const getSavingsRateStatus = (rate) => {
    if (rate < 0) return 'Deficit';
    if (rate < 10) return 'Low';
    return 'Good';
  };

  const getTrendIcon = (direction) => {
    switch(direction) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (direction) => {
    switch(direction) {
      case 'increasing': return 'var(--color-success)';
      case 'decreasing': return 'var(--color-error)';
      default: return 'var(--color-text-secondary)';
    }
  };

  if (loading) {
    return (
      <div className="mini-chart-loading">
        <div className="loading-spinner-small"></div>
        <p>Loading savings data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mini-chart-error">
        <p>{error}</p>
        <button
          onClick={() => fetchSavingsData()}
          className="retry-btn-small"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!savingsData || !savingsData.summary) {
    return (
      <div className="mini-chart-empty">
        <div className="empty-icon">💰</div>
        <p>No savings data available</p>
        {!compact && (
          <small>Add income and expense data to track savings</small>
        )}
      </div>
    );
  }

  const chartData = getSavingsRateChartData();

  return (
    <div className="mini-savings-tracker">
      {/* Summary Stats - Always visible */}
      <div className="mini-savings-summary">
        <div className="mini-summary-item">
          <div className="mini-summary-label">Avg Rate</div>
          <div 
            className="mini-summary-value"
            style={{ color: getSavingsRateColorVariable(savingsData.summary.averageSavingsRate) }}
          >
            {savingsData.summary.averageSavingsRate.toFixed(1)}%
          </div>
          <div className="mini-summary-status">
            {getSavingsRateStatus(savingsData.summary.averageSavingsRate)}
          </div>
        </div>

        <div className="mini-summary-item">
          <div className="mini-summary-label">Total Saved</div>
          <div 
            className="mini-summary-value"
            style={{ color: savingsData.summary.totalSavings >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}
          >
            {formatCurrency(savingsData.summary.totalSavings)}
          </div>
          <div className="mini-summary-status">
            {savingsData.summary.monthCount} months
          </div>
        </div>

        <div className="mini-summary-item">
          <div className="mini-summary-label">Trend</div>
          <div 
            className="mini-summary-value"
            style={{ color: getTrendColor(savingsData.summary.trendDirection) }}
          >
            {getTrendIcon(savingsData.summary.trendDirection)}
          </div>
          <div className="mini-summary-status" style={{ textTransform: 'capitalize' }}>
            {savingsData.summary.trendDirection}
          </div>
        </div>
      </div>

      {/* Chart Section - Only show in non-compact mode */}
      {!compact && chartData && (
        <div className="mini-chart-area" style={{ height: '200px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Savings Goals - Only show if available and not compact */}
      {!compact && savingsData.savingsGoals && savingsData.savingsGoals.length > 0 && (
        <div className="mini-goals-section">
          <h5 className="mini-goals-title">🎯 Active Goals</h5>
          <div className="mini-goals-grid">
            {savingsData.savingsGoals.slice(0, 2).map(goal => (
              <div key={goal.id} className="mini-goal-item">
                <div className="mini-goal-name">{goal.goal_name}</div>
                <div className="mini-goal-amount">{formatCurrency(goal.target_amount)}</div>
                <div className="mini-goal-category">{goal.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniSavingsRateTracker;

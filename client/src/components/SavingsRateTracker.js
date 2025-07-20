import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';

const SavingsRateTracker = ({ timePeriod = '6months', startDate, endDate }) => {
  const [savingsData, setSavingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavingsData = useCallback(async (dates = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use provided dates or the ones passed in the function parameter
      const start = dates.startDate || startDate;
      const end = dates.endDate || endDate;
      
      if (!start || !end) {
        console.error('Missing date parameters for savings analysis');
        setError('Missing date parameters');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`/analytics/savings-analysis/${start}/${end}`);
      setSavingsData(response.data);
    } catch (err) {
      console.error('Error fetching savings data:', err);
      setError('Failed to load savings data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    // Set default dates if not provided
    const getDefaultDates = () => {
      const end = new Date();
      const start = new Date();
      
      // Default to 6 months if not specified
      switch(timePeriod) {
        case '3months':
          start.setMonth(start.getMonth() - 3);
          break;
        case '1year':
          start.setFullYear(start.getFullYear() - 1);
          break;
        default: // '6months' or any other value
          start.setMonth(start.getMonth() - 6);
      }
      
      return {
        startDate: startDate || start.toISOString().split('T')[0],
        endDate: endDate || end.toISOString().split('T')[0]
      };
    };
    
    fetchSavingsData(getDefaultDates());
  }, [startDate, endDate, timePeriod, fetchSavingsData]);

  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
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
          borderColor: '#10b981', // Keep as hex for Chart.js compatibility
          // backgroundColor: 'rgba(16, 185, 129, 0.1)',
          backgroundColor: (context) => { // This sets the fill color
            if (!context.chart) return null; // Ensure chart context is available
            if (!context.chart.ctx) return null; // Ensure context has a canvas context
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            
            if (!chartArea) return null;
            
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, `${'#10b981'}30`); // More opaque at top
            gradient.addColorStop(1, `${'#10b981'}00`); // Transparent at bottom
            return gradient;
          },
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: savingsRates.map(rate => 
            rate < 0 ? '#ef4444' : 
            rate < 10 ? '#f59e0b' : 
            '#10b981'
          ),
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 8
        }
      ]
    };
  };

  /* const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--color-text-secondary)',
          font: {
            family: 'var(--font-primary)',
            size: 12,
            weight: '500'
          },
          padding: 16,
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
          color: 'var(--border-color)',
          borderColor: 'var(--border-color)'
        },
        ticks: {
          color: 'var(--color-text-secondary)',
          font: {
            family: 'var(--font-primary)',
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'var(--border-color)',
          borderColor: 'var(--border-color)'
        },
        ticks: {
          color: 'var(--color-text-secondary)',
          font: {
            family: 'var(--font-primary)',
            size: 11
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  }; */

  // Optimized chart options for compact 180px height container
  const optimizedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 5,
        right: 5
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 8,
          font: { 
            size: 10,
            family: 'var(--font-primary)'
          },
          color: 'var(--color-text-secondary)'
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
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
        ticks: { 
          maxTicksLimit: 6,
          font: { 
            size: 9,
            family: 'var(--font-primary)'
          },
          color: '#897bceff'
        },
        grid: { 
          display: true 
        },
        border: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: { 
          maxTicksLimit: 5,
          font: { 
            size: 9,
            family: 'var(--font-primary)'
          },
          color: '#897bceff',
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          display: true
        },
        border: {
          display: false
        }
      }
    }
  };

  const getSavingsRateColorVariable = (rate) => {
    if (rate < 0) return 'var(--color-error)';
    if (rate < 10) return 'var(--color-warning)';
    if (rate < 20) return 'var(--color-primary)';
    return 'var(--color-success)';
  };

  const getSavingsRateStatus = (rate) => {
    if (rate < 0) return 'Negative';
    if (rate < 10) return 'Low';
    if (rate < 20) return 'Good';
    return 'Excellent';
  };

  const getTrendIcon = (direction) => {
    switch(direction) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (direction) => {
    switch(direction) {
      case 'improving': return 'var(--color-success)';
      case 'declining': return 'var(--color-error)';
      default: return 'var(--color-text-secondary)';
    }
  };

  if (loading) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">💰 Savings Rate Analysis</h3>
          <div className="chart-subtitle">
            {timePeriod ? timePeriod.replace('months', 'mo').replace('year', 'yr') : 'Period'}
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--spacing-lg)'
          }}>
            Loading savings analysis...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">💰 Savings Rate Analysis</h3>
          <div className="chart-subtitle">
            {timePeriod ? timePeriod.replace('months', 'mo').replace('year', 'yr') : 'Period'}
          </div>
        </div>
        <div className="error-message">
          <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-lg)' }}>⚠️</div>
          <p>{error}</p>
          <button 
            onClick={fetchSavingsData}
            className="btn btn-primary"
            style={{ marginTop: 'var(--spacing-4xl)' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!savingsData || !savingsData.monthlyData || savingsData.monthlyData.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">💰 Savings Rate Analysis</h3>
          <div className="chart-subtitle">
            {timePeriod ? timePeriod.replace('months', 'mo').replace('year', 'yr') : 'Period'}
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-8xl) var(--spacing-4xl)',
          color: 'var(--color-text-secondary)',
          height: '320px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-lg)' }}>💰</div>
          <p style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-xs)' }}>
            No savings data available
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)' }}>
            Add income and expenses to see your savings rate
          </p>
        </div>
      </div>
    );
  }

  const chartData = getSavingsRateChartData();

  return (
    <div className="chart-card" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className="chart-header" style={{ flexShrink: 0 }}>
        <h3 className="chart-title">💰 Savings Rate Analysis</h3>
        <div className="chart-subtitle">
          {timePeriod ? timePeriod.replace('months', 'mo').replace('year', 'yr') : 'Period'}
        </div>
      </div>

      <div className="stats-grid" style={{ 
        flexShrink: 0,
        marginBottom: 'var(--spacing-3xl)',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--spacing-md)'
      }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Average Savings Rate</span>
            <div className="stat-icon" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
              color: 'var(--color-success)'
            }}>
              💰
            </div>
          </div>
          <div className="stat-value" style={{
            color: getSavingsRateColorVariable(savingsData.summary.averageSavingsRate)
          }}>
            {savingsData.summary.averageSavingsRate.toFixed(1)}%
          </div>
          <div className="stat-change">
            {getSavingsRateStatus(savingsData.summary.averageSavingsRate)}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Savings</span>
            <div className="stat-icon" style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)',
              color: 'var(--color-primary)'
            }}>
              💵
            </div>
          </div>
          <div className="stat-value" style={{
            color: savingsData.summary.totalSavings >= 0 ? 'var(--color-success)' : 'var(--color-error)'
          }}>
            {formatCurrency(savingsData.summary.totalSavings)}
          </div>
          <div className="stat-change">
            Over {savingsData.summary.monthCount} months
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Trend</span>
            <div className="stat-icon" style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)',
              color: 'var(--color-warning)'
            }}>
              {getTrendIcon(savingsData.summary.trendDirection)}
            </div>
          </div>
          <div className="stat-value" style={{
            color: getTrendColor(savingsData.summary.trendDirection)
          }}>
            {getTrendIcon(savingsData.summary.trendDirection)}
          </div>
          <div className="stat-change" style={{ textTransform: 'capitalize' }}>
            {savingsData.summary.trendDirection}
          </div>
        </div>
      </div>

      <div className="chart-container" style={{ 
        height: '280px', 
        flexShrink: 0,
        marginBottom: 'var(--spacing-3xl)'
      }}>
        {chartData ? (
          <Line data={chartData} options={optimizedChartOptions} />
        ) : (
          <div className="error-message" style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-lg)' }}>📊</div>
            <p>Unable to render chart</p>
          </div>
        )}
      </div>

      {savingsData.savingsGoals && savingsData.savingsGoals.length > 0 && (
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          paddingTop: 'var(--spacing-3xl)',
          borderTop: `1px solid var(--border-color)`
        }}>
          <details>
            <summary className="section-title" style={{ 
              cursor: 'pointer', 
              marginBottom: 'var(--spacing-3xl)'
            }}>
              🎯 Savings Goals ({savingsData.savingsGoals.length})
            </summary>
            <div className="stats-grid" style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--spacing-md)'
            }}>
              {savingsData.savingsGoals.map(goal => (
                <div key={goal.id} className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">{goal.goal_name}</span>
                    <div className="stat-icon" style={{
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)',
                      color: 'var(--color-warning)'
                    }}>
                      🎯
                    </div>
                  </div>
                  <div className="stat-value">{formatCurrency(goal.target_amount)}</div>
                  <div className="stat-change">
                    <div style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--spacing-xs)'
                    }}>
                      {goal.category}
                    </div>
                    <div style={{ 
                      fontSize: 'var(--font-size-xs)', 
                      color: 'var(--color-text-muted)'
                    }}>
                      {goal.target_date && new Date(goal.target_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default SavingsRateTracker;

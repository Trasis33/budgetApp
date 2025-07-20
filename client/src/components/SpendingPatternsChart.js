import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import formatCurrency from '../utils/formatCurrency';
import { modernChartOptions, createGradient, modernColors } from '../utils/chartConfig';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SpendingPatternsChart = ({ patterns = null }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedPatterns, setProcessedPatterns] = useState(null);

  useEffect(() => {
    // Process patterns data asynchronously to avoid UI blocking
    const processData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate a short delay to ensure UI shows loading state
        // This helps with perceived performance
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!patterns) {
          // If patterns is null, we consider it as no data
          setProcessedPatterns({});
        } else {
          // Otherwise use the provided patterns data
          setProcessedPatterns(patterns);
        }
      } catch (err) {
        console.error('Error processing patterns data:', err);
        setError('Failed to process spending patterns data');
      } finally {
        setLoading(false);
      }
    };

    processData();
  }, [patterns]);
  const getChartData = () => {
    if (!processedPatterns || Object.keys(processedPatterns).length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const categories = Object.keys(processedPatterns).slice(0, 4); // Limit for glass morphism clarity
    // const colors = [modernColors.primary, modernColors.secondary, modernColors.success];
    const colors = [modernColors.primary, modernColors.secondary, modernColors.success, modernColors.warning, modernColors.error];
    const datasets = categories.map((category, index) => {
      const data = processedPatterns[category]?.data ? processedPatterns[category].data.map(d => d.amount) : [];
      
      return {
        label: category,
        data: data,
        borderColor: colors[index], // This sets the line color
        backgroundColor: (context) => { // This sets the fill color
          if (!context.chart) return null; // Ensure chart context is available
          if (!context.chart.ctx) return null; // Ensure context has a canvas context
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, `${colors[index]}30`); // More opaque at top
          gradient.addColorStop(1, `${colors[index]}00`); // Transparent at bottom
          return gradient;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: colors[index],
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });
    
    const allMonths = [...new Set(
      categories.flatMap(cat => processedPatterns[cat]?.data ? processedPatterns[cat].data.map(d => d.month) : [])
    )].sort();
    
    return {
      labels: allMonths,
      datasets: datasets
    };
  };
  
  const getTrendIndicator = (trend, enhancedTrend) => {
    const baseInfo = {
      increasing: { icon: '📈', color: 'var(--color-error)', text: 'Increasing' },
      decreasing: { icon: '📉', color: 'var(--color-success)', text: 'Decreasing' },
      stable: { icon: '➡️', color: 'var(--color-text-secondary)', text: 'Stable' }
    };

    const strengthColors = {
      minimal: 'var(--color-text-muted)',
      weak: 'var(--color-warning)',
      moderate: '#f97316', // orange-500 equivalent
      strong: 'var(--color-error)',
      very_strong: '#dc2626' // red-600 equivalent
    };

    const base = baseInfo[trend] || baseInfo.stable;
    const strengthColor = strengthColors[enhancedTrend && enhancedTrend.category ? enhancedTrend.category : 'minimal'];

    return {
      ...base,
      strengthColor,
      strengthText: enhancedTrend && enhancedTrend.category ? enhancedTrend.category : 'unknown'
    };
  };
  
  /* const options = {
    ...modernChartOptions,
    plugins: {
      ...modernChartOptions.plugins,
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          color: 'var(--color-text-secondary)',
          font: {
            size: 11,
            weight: '500',
            family: 'var(--font-primary)'
          },
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: 'var(--bg-card)',
        titleColor: 'var(--color-text-primary)',
        bodyColor: 'var(--color-text-secondary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        cornerRadius: 8
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
      }
    }
  }; */

  // Optimized chart options for compact 200px height container
  const optimizedOptions = {
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
        cornerRadius: 8
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
        ticks: { 
          maxTicksLimit: 5,
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
      }
    }
  };

  if (loading) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">📊 Spending Patterns</h3>
          <div className="chart-subtitle">Monthly spending trends by category</div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--spacing-lg)'
          }}>
            Loading spending patterns...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">📊 Spending Patterns</h3>
          <div className="chart-subtitle">Monthly spending trends by category</div>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              setTimeout(() => {
                setProcessedPatterns(patterns || {});
                setLoading(false);
              }, 500);
            }}
            className="btn btn-primary"
            style={{ marginTop: 'var(--spacing-4xl)' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!processedPatterns || Object.keys(processedPatterns).length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">📊 Spending Patterns</h3>
          <div className="chart-subtitle">Monthly spending trends by category</div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-8xl) var(--spacing-4xl)',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-lg)' }}>📊</div>
          <p style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-xs)' }}>
            No spending patterns data available
          </p>
          <p style={{ fontSize: 'var(--font-size-xs)' }}>
            Add more transactions to see your spending patterns
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chart-card" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className="chart-header" style={{ flexShrink: 0 }}>
        <h3 className="chart-title">📊 Spending Patterns</h3>
        <div className="chart-subtitle">Monthly spending trends by category</div>
      </div>
      
      <div className="chart-container" style={{ 
        height: '280px', 
        flexShrink: 0,
        marginBottom: 'var(--spacing-3xl)'
      }}>
        <Line data={getChartData()} options={optimizedOptions} />
      </div>
      
      <div className="stats-grid" style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '300px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-lg)'
      }}>
        {Object.entries(processedPatterns || {}).slice(0, 6).map(([category, pattern]) => {
          const trendInfo = getTrendIndicator(pattern?.trend, pattern?.enhancedTrend);
          return (
            <div key={category} className="stat-card">
              <div className="stat-header">
                <span className="stat-title">{category}</span>
                <div className="stat-icon" style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)',
                  color: '#3b82f6'
                }}>
                  <span style={{ fontSize: 'var(--font-size-xs)' }}>
                    {trendInfo.icon}
                  </span>
                </div>
              </div>
              <div className="stat-value" style={{ 
                fontSize: 'var(--font-size-lg)',
                marginBottom: 'var(--spacing-sm)',
                color: trendInfo.strengthColor
              }}>
                {trendInfo.strengthText}
              </div>
              <div className="stat-change">
                <div style={{ 
                  fontSize: 'var(--font-size-xs)', 
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  Strength: {pattern?.enhancedTrend?.normalizedStrength || 0}%
                </div>
                <div style={{ 
                  fontSize: 'var(--font-size-xs)', 
                  color: 'var(--color-text-secondary)'
                }}>
                  Change: {pattern?.enhancedTrend?.percentageChange || 0}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpendingPatternsChart;

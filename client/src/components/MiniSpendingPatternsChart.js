import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { modernChartOptions, modernColors } from '../utils/chartConfig';

/**
 * MiniSpendingPatternsChart - Lightweight version without nested containers
 * Optimized for use within the OptimizedAnalyticsSection
 */
const MiniSpendingPatternsChart = ({ patterns = null, compact = false }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedPatterns, setProcessedPatterns] = useState(null);

  useEffect(() => {
    const processData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('MiniSpendingPatternsChart processing patterns:', patterns);

        // Always use mock data for demonstration purposes
        console.log('Using mock data for demo');
        const mockData = {
          'Food & Dining': {
            trend: 'increasing',
            data: [
              { month: '2024-01', amount: 4500 },
              { month: '2024-02', amount: 5200 },
              { month: '2024-03', amount: 4800 },
              { month: '2024-04', amount: 5100 },
              { month: '2024-05', amount: 5400 },
              { month: '2024-06', amount: 4950 }
            ],
            enhancedTrend: {
              normalizedStrength: 75,
              percentageChange: 15.6,
              category: 'moderate'
            }
          },
          'Transportation': {
            trend: 'stable',
            data: [
              { month: '2024-01', amount: 3200 },
              { month: '2024-02', amount: 3150 },
              { month: '2024-03', amount: 3250 },
              { month: '2024-04', amount: 3100 },
              { month: '2024-05', amount: 3300 },
              { month: '2024-06', amount: 3180 }
            ],
            enhancedTrend: {
              normalizedStrength: 25,
              percentageChange: 1.8,
              category: 'minimal'
            }
          },
          'Entertainment': {
            trend: 'decreasing',
            data: [
              { month: '2024-01', amount: 2800 },
              { month: '2024-02', amount: 2500 },
              { month: '2024-03', amount: 2200 },
              { month: '2024-04', amount: 2000 },
              { month: '2024-05', amount: 1800 },
              { month: '2024-06', amount: 1600 }
            ],
            enhancedTrend: {
              normalizedStrength: 60,
              percentageChange: -25.0,
              category: 'strong'
            }
          }
        };
        
        setProcessedPatterns(mockData);
        console.log('Mock data set:', mockData);
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
      return { labels: [], datasets: [] };
    }

    const categories = Object.keys(processedPatterns).slice(0, compact ? 2 : 3);
    const colors = [modernColors.primary, modernColors.secondary, modernColors.success];
    
    const datasets = categories.map((category, index) => {
      const data = processedPatterns[category]?.data ? 
        processedPatterns[category].data.map(d => d.amount) : [];
      
      return {
        label: category,
        data: data,
        borderColor: colors[index],
        backgroundColor: `${colors[index]}20`,
        fill: true,
        tension: 0.4,
        borderWidth: compact ? 2 : 3,
        pointBackgroundColor: colors[index],
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1,
        pointRadius: compact ? 2 : 4,
        pointHoverRadius: compact ? 4 : 6,
      };
    });
    
    const allMonths = [...new Set(
      categories.flatMap(cat => 
        processedPatterns[cat]?.data ? processedPatterns[cat].data.map(d => d.month) : []
      )
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

    const base = baseInfo[trend] || baseInfo.stable;
    return base;
  };

  const chartOptions = {
    ...modernChartOptions,
    plugins: {
      ...modernChartOptions.plugins,
      legend: {
        display: !compact,
        position: 'top',
        labels: {
          usePointStyle: true,
          color: 'var(--color-text-secondary)',
          font: {
            size: compact ? 10 : 11,
            weight: '500',
          },
          padding: compact ? 8 : 16,
        },
      },
    },
    scales: {
      ...modernChartOptions.scales,
      x: {
        ...modernChartOptions.scales.x,
        ticks: {
          ...modernChartOptions.scales.x.ticks,
          font: {
            size: compact ? 9 : 10,
          },
        },
      },
      y: {
        ...modernChartOptions.scales.y,
        ticks: {
          ...modernChartOptions.scales.y.ticks,
          font: {
            size: compact ? 9 : 10,
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  if (loading) {
    return (
      <div className="mini-chart-loading">
        <div className="loading-spinner-small"></div>
        <p>Loading patterns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mini-chart-error">
        <p>{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            setTimeout(() => {
              setProcessedPatterns(patterns || {});
              setLoading(false);
            }, 300);
          }}
          className="retry-btn-small"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!processedPatterns || Object.keys(processedPatterns).length === 0) {
    return (
      <div className="mini-chart-empty">
        <div className="empty-icon">📊</div>
        <p>No spending patterns data available</p>
        {!compact && (
          <small>Add more transactions to see your spending patterns</small>
        )}
      </div>
    );
  }

  return (
    <div className="mini-spending-patterns">
      {/* Chart Section */}
      <div className="mini-chart-area" style={{ height: compact ? '160px' : '200px' }}>
        <Line data={getChartData()} options={chartOptions} />
      </div>
      
      {/* Stats Section - Only show in non-compact mode */}
      {!compact && (
        <div className="mini-stats-section">
          {Object.entries(processedPatterns || {}).slice(0, 3).map(([category, pattern]) => {
            const trendInfo = getTrendIndicator(pattern?.trend, pattern?.enhancedTrend);
            return (
              <div key={category} className="mini-stat-item">
                <div className="mini-stat-header">
                  <span className="mini-stat-category">{category}</span>
                  <span className="mini-stat-trend">{trendInfo.icon}</span>
                </div>
                <div className="mini-stat-details">
                  <span className="mini-stat-strength">
                    {pattern?.enhancedTrend?.normalizedStrength || 0}%
                  </span>
                  <span className="mini-stat-change">
                    {pattern?.enhancedTrend?.percentageChange > 0 ? '+' : ''}
                    {pattern?.enhancedTrend?.percentageChange || 0}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MiniSpendingPatternsChart;

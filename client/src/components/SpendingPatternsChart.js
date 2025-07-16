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

    const categories = Object.keys(processedPatterns).slice(0, 3); // Limit for glass morphism clarity
    const colors = [modernColors.primary, modernColors.secondary, modernColors.success];
    
    const datasets = categories.map((category, index) => {
      const data = processedPatterns[category]?.data ? processedPatterns[category].data.map(d => d.amount) : [];
      
      return {
        label: category,
        data: data,
        borderColor: colors[index],
        backgroundColor: modernColors.gradients.primary,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: colors[index],
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
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
      increasing: { icon: '📈', color: 'text-red-500', text: 'Increasing' },
      decreasing: { icon: '📉', color: 'text-green-500', text: 'Decreasing' },
      stable: { icon: '➡️', color: 'text-gray-500', text: 'Stable' }
    };

    const strengthColors = {
      minimal: 'text-gray-400',
      weak: 'text-yellow-500',
      moderate: 'text-orange-500',
      strong: 'text-red-500',
      very_strong: 'text-red-700'
    };

    const base = baseInfo[trend] || baseInfo.stable;
    const strengthColor = strengthColors[enhancedTrend && enhancedTrend.category ? enhancedTrend.category : 'minimal'];

    return {
      ...base,
      strengthColor,
      strengthText: enhancedTrend && enhancedTrend.category ? enhancedTrend.category : 'unknown'
    };
  };
  
  const options = {
    ...modernChartOptions,
    plugins: {
      ...modernChartOptions.plugins,
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          color: '#64748b',
          font: {
            size: 11,
            weight: '500'
          },
          padding: 16
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-500">
        <p className="text-sm">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            // Re-process data after a short delay
            setTimeout(() => {
              setProcessedPatterns(patterns || {});
              setLoading(false);
            }, 500);
          }}
          className="mt-3 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!processedPatterns || Object.keys(processedPatterns).length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-base mb-1">📊 No spending patterns data available</p>
        <p className="text-xs">Add more transactions to see your spending patterns</p>
      </div>
    );
  }
  
  return (
    <div className="spending-patterns-chart">
      <div className="mb-3">
        <Line data={getChartData()} options={options} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(processedPatterns || {}).slice(0, 6).map(([category, pattern]) => {
          const trendInfo = getTrendIndicator(pattern?.trend, pattern?.enhancedTrend);
          return (
            <div key={category} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <h5 className="stat-title truncate">{category}</h5>
                <div className="flex items-center gap-1">
                  <span className={`text-xs ${trendInfo.color}`}>
                    {trendInfo.icon}
                  </span>
                  <span className={`text-xs font-medium ${trendInfo.strengthColor}`}>
                    {trendInfo.strengthText}
                  </span>
                </div>
              </div>
              <div className="text-xs space-y-1">
                <p className="truncate text-gray-600">Strength: {pattern?.enhancedTrend?.normalizedStrength || 0}%</p>
                <p className="truncate text-gray-600">Change: {pattern?.enhancedTrend?.percentageChange || 0}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpendingPatternsChart;

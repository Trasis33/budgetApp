import React from 'react';
import { Line } from 'react-chartjs-2';
import formatCurrency from '../utils/formatCurrency';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SpendingPatternsChart = ({ patterns }) => {
  const getChartData = () => {
    if (!patterns || Object.keys(patterns).length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const categories = Object.keys(patterns).slice(0, 5);
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'
    ];
    
    const datasets = categories.map((category, index) => {
      const data = patterns[category].data ? patterns[category].data.map(d => d.amount) : [];
      const labels = patterns[category].data ? patterns[category].data.map(d => d.month) : [];
      
      return {
        label: category,
        data: data,
        borderColor: colors[index],
        backgroundColor: colors[index] + '20',
        fill: false,
        tension: 0.1,
      };
    });
    
    const allMonths = [...new Set(
      categories.flatMap(cat => patterns[cat] && patterns[cat].data ? patterns[cat].data.map(d => d.month) : [])
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
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Spending Trends by Category',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };
  
  if (!patterns || Object.keys(patterns).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No spending patterns data available</p>
      </div>
    );
  }
  
  return (
    <div className="spending-patterns-chart">
      <div className="mb-4">
        <Line data={getChartData()} options={options} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(patterns).slice(0, 6).map(([category, pattern]) => {
          const trendInfo = getTrendIndicator(pattern.trend, pattern.enhancedTrend);
          return (
            <div key={category} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <h5 className="font-medium text-sm">{category}</h5>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${trendInfo.color}`}>
                    {trendInfo.icon} {trendInfo.text}
                  </span>
                  <span className={`text-xs font-medium ${trendInfo.strengthColor}`}>
                    {trendInfo.strengthText}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Strength:</strong> {pattern.enhancedTrend && pattern.enhancedTrend.normalizedStrength ? pattern.enhancedTrend.normalizedStrength : 0}%</p>
                <p><strong>Change:</strong> {pattern.enhancedTrend && pattern.enhancedTrend.percentageChange ? pattern.enhancedTrend.percentageChange : 0}% over {pattern.enhancedTrend && pattern.enhancedTrend.dataPoints ? pattern.enhancedTrend.dataPoints : 0} months</p>
                <p><strong>Volatility:</strong> {formatCurrency(pattern.enhancedTrend && pattern.enhancedTrend.volatility ? pattern.enhancedTrend.volatility : 0)}</p>
                <p><strong>Confidence:</strong> {pattern.enhancedTrend && pattern.enhancedTrend.confidence ? pattern.enhancedTrend.confidence : 0}%</p>
                <p className="text-xs italic">{pattern.enhancedTrend && pattern.enhancedTrend.description ? pattern.enhancedTrend.description : 'No description'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpendingPatternsChart;

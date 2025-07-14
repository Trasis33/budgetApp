import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';

const SavingsRateTracker = ({ timePeriod = '6months', startDate, endDate }) => {
  const [savingsData, setSavingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [startDate, endDate, timePeriod]);

  const fetchSavingsData = async (dates = {}) => {
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
  };

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
          borderColor: '#10b981',
          backgroundColor: '#10b98120',
          borderWidth: 3,
          fill: true,
          tension: 0.1,
          pointBackgroundColor: savingsRates.map(rate => 
            rate < 0 ? '#ef4444' : 
            rate < 10 ? '#f59e0b' : 
            '#10b981'
          ),
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  const getSavingsRateColor = (rate) => {
    if (rate < 0) return 'text-red-600';
    if (rate < 10) return 'text-yellow-600';
    if (rate < 20) return 'text-blue-600';
    return 'text-green-600';
  };

  const getSavingsRateStatus = (rate) => {
    if (rate < 0) return 'Negative';
    if (rate < 10) return 'Low';
    if (rate < 20) return 'Good';
    return 'Excellent';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={fetchSavingsData}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!savingsData || !savingsData.monthlyData || savingsData.monthlyData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">💰 Savings Rate Analysis</h3>
        <div className="h-80 bg-gray-50 rounded flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">💰</div>
            <p>No savings data available</p>
            <p className="text-sm mt-1">Add income and expenses to see your savings rate</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = getSavingsRateChartData();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">💰 Savings Rate Analysis</h3>
        <div className="text-sm text-gray-500">
          {timePeriod ? timePeriod.replace('months', 'mo').replace('year', 'yr') : 'Period'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Average Savings Rate</div>
          <div className={`text-2xl font-bold ${getSavingsRateColor(savingsData.summary.averageSavingsRate)}`}>
            {savingsData.summary.averageSavingsRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            {getSavingsRateStatus(savingsData.summary.averageSavingsRate)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Savings</div>
          <div className={`text-2xl font-bold ${savingsData.summary.totalSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(savingsData.summary.totalSavings)}
          </div>
          <div className="text-xs text-gray-500">
            Over {savingsData.summary.monthCount} months
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Trend</div>
          <div className={`text-2xl font-bold ${
            savingsData.summary.trendDirection === 'improving' ? 'text-green-600' : 
            savingsData.summary.trendDirection === 'declining' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {savingsData.summary.trendDirection === 'improving' ? '📈' : 
             savingsData.summary.trendDirection === 'declining' ? '📉' : 
             '➡️'}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {savingsData.summary.trendDirection}
          </div>
        </div>
      </div>

      <div className="h-80">
        {chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="h-full bg-gray-50 rounded flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>Unable to render chart</p>
            </div>
          </div>
        )}
      </div>

      {savingsData.savingsGoals && savingsData.savingsGoals.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold mb-3">🎯 Savings Goals</h4>
          <div className="space-y-3">
            {savingsData.savingsGoals.map(goal => (
              <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{goal.goal_name}</div>
                  <div className="text-sm text-gray-600">{goal.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(goal.target_amount)}</div>
                  <div className="text-sm text-gray-500">
                    {goal.target_date && new Date(goal.target_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsRateTracker;

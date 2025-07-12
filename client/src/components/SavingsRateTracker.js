import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';

const SavingsRateTracker = ({ timePeriod, startDate, endDate }) => {
  const [savingsData, setSavingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavingsData();
  }, [startDate, endDate]);

  const fetchSavingsData = async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/analytics/savings-analysis/${startDate}/${endDate}`);
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

    // Chart colors
    const chartColors = {
      primary: '#10b981',      // Green for savings
      secondary: '#3b82f6',    // Blue for target
      accent: '#f59e0b',       // Amber for warning
      red: '#ef4444'           // Red for negative
    };

    return {
      labels: months,
      datasets: [
        {
          label: 'Savings Rate (%)',
          data: savingsRates,
          borderColor: chartColors.primary,
          backgroundColor: chartColors.primary + '20',
          borderWidth: 3,
          fill: true,
          tension: 0.1,
          pointBackgroundColor: savingsRates.map(rate => 
            rate < 0 ? chartColors.red : 
            rate < 10 ? chartColors.accent : 
            chartColors.primary
          ),
          pointRadius: 6,
          pointHoverRadius: 8
        },
        // Add target line if there are savings goals
        ...(savingsData.savingsGoals && savingsData.savingsGoals.length > 0 ? [{
          label: 'Savings Goal',
          data: Array(months.length).fill(20), // Default 20% target
          borderColor: chartColors.secondary,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0
        }] : [])
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          }
        }
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
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
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
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Handle data availability scenarios
  if (savingsData && savingsData.dataAvailability) {
    const { dataAvailability } = savingsData;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">💰 Savings Rate Analysis</h3>
        
        {/* Data Status Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="text-3xl">
              {dataAvailability.hasIncome && dataAvailability.hasExpenses ? '📊' : 
               dataAvailability.hasIncome ? '💰' : 
               dataAvailability.hasExpenses ? '💸' : '📝'}
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-800 mb-2">
                {dataAvailability.trendDirection === 'no-data' ? 'No Data Available' :
                 dataAvailability.trendDirection === 'insufficient-data' ? 'Insufficient Data for Analysis' :
                 'Data Status'}
              </div>
              <p className="text-gray-600 mb-4">{dataAvailability.message}</p>
              
              {/* Data Status Indicators */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {dataAvailability.incomeEntries || 0}
                  </div>
                  <div className="text-sm text-gray-500">Income Entries</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {dataAvailability.hasIncome ? '✅ Available' : '❌ Missing'}
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-red-600">
                    {dataAvailability.expenseEntries || 0}
                  </div>
                  <div className="text-sm text-gray-500">Expense Entries</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {dataAvailability.hasExpenses ? '✅ Available' : '❌ Missing'}
                  </div>
                </div>
              </div>
              
              {/* Progress toward meaningful analysis */}
              {dataAvailability.monthsWithData !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Data Coverage Progress</span>
                    <span>{dataAvailability.monthsWithData} / {dataAvailability.requiredForMeaningfulAnalysis} months</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (dataAvailability.monthsWithData / dataAvailability.requiredForMeaningfulAnalysis) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Action suggestions */}
              <div className="text-sm text-gray-600">
                <div className="font-medium mb-2">Next Steps:</div>
                <ul className="space-y-1">
                  {!dataAvailability.hasIncome && (
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">•</span>
                      <span>Add income entries to track your earnings</span>
                    </li>
                  )}
                  {!dataAvailability.hasExpenses && (
                    <li className="flex items-center space-x-2">
                      <span className="text-red-500">•</span>
                      <span>Add expense entries to track your spending</span>
                    </li>
                  )}
                  {dataAvailability.monthsWithData !== undefined && dataAvailability.monthsWithData < dataAvailability.requiredForMeaningfulAnalysis && (
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-500">•</span>
                      <span>Add data for {dataAvailability.requiredForMeaningfulAnalysis - dataAvailability.monthsWithData} more month(s) to see trends</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Show partial data if available */}
        {savingsData.monthlyData && savingsData.monthlyData.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-3">📈 Available Data</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(savingsData.summary.totalIncome)}
                  </div>
                  <div className="text-sm text-gray-500">Total Income</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(savingsData.summary.totalExpenses)}
                  </div>
                  <div className="text-sm text-gray-500">Total Expenses</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    savingsData.summary.totalSavings >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(savingsData.summary.totalSavings)}
                  </div>
                  <div className="text-sm text-gray-500">Net Savings</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Retry button */}
        <div className="text-center mt-6">
          <button 
            onClick={fetchSavingsData}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Check Again
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
          {timePeriod.replace('months', 'mo').replace('year', 'yr')}
        </div>
      </div>

      {/* Summary Cards */}
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

      {/* Chart */}
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

      {/* Savings Goals Section */}
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

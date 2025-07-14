import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';

const MonthlyComparisonChart = ({ monthlyTotals, formatCurrency }) => {
  const chartData = () => {
    if (!monthlyTotals) return null;
    
    return {
      labels: monthlyTotals.map(m => {
        const [year, month] = m.month.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' });
      }),
      datasets: [
        {
          label: 'Expenses',
          data: monthlyTotals.map(m => m.total_spending),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
        {
          label: 'Budget',
          data: monthlyTotals.map(m => m.total_budget || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
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
        labels: {
          usePointStyle: true,
          padding: 12,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          },
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Monthly Comparison</h3>
      <div className="h-56">
        {chartData() && <Bar data={chartData()} options={chartOptions} />}
      </div>
    </div>
  );
};

MonthlyComparisonChart.propTypes = {
  monthlyTotals: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      total_spending: PropTypes.number.isRequired,
      total_budget: PropTypes.number
    })
  ),
  formatCurrency: PropTypes.func.isRequired
};

export default MonthlyComparisonChart;

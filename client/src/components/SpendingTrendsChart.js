import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';

const SpendingTrendsChart = ({ monthlyTotals, formatCurrency }) => {
  const chartData = () => {
    if (!monthlyTotals) return null;
    
    return {
      labels: monthlyTotals.map(m => {
        const [year, month] = m.month.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }),
      datasets: [
        {
          label: 'Monthly Spending',
          data: monthlyTotals.map(m => m.total_spending),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
        {
          label: 'Budget',
          data: monthlyTotals.map(m => m.total_budget || 0),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
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
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="section-title">Spending Trends</h3>
      </div>
      <div className="chart-container">
        {chartData() && <Line data={chartData()} options={chartOptions} />}
      </div>
    </div>
  );
};

SpendingTrendsChart.propTypes = {
  monthlyTotals: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      total_spending: PropTypes.number.isRequired,
      total_budget: PropTypes.number
    })
  ),
  formatCurrency: PropTypes.func.isRequired
};

export default SpendingTrendsChart;

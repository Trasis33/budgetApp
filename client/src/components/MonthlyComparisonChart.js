import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';

const MonthlyComparisonChart = ({ monthlyTotals, formatCurrency }) => {
  // Resolve CSS variables to concrete colors for canvas (Chart.js)
  const cssVar = (name, fallback) => {
    try {
      const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return val || fallback;
    } catch (_) {
      return fallback;
    }
  };

  const toAlpha = (color, alpha, fallback) => {
    if (!color) return fallback;
    const a = Math.max(0, Math.min(1, alpha));
    if (color.startsWith('#') && color.length === 7) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${a})`);
    }
    return fallback;
  };

  const danger = cssVar('--danger', '#ef4444');
  const success = cssVar('--success', '#10b981');
  const border = cssVar('--border-color', 'rgba(226, 232, 240, 0.5)');
  const ink = cssVar('--ink', '#0f172a');
  const surface = cssVar('--surface', '#ffffff');
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
          backgroundColor: toAlpha(danger, 0.8, 'rgba(239, 68, 68, 0.8)'),
          borderColor: danger,
          borderWidth: 1,
        },
        {
          label: 'Budget',
          data: monthlyTotals.map(m => m.total_budget || 0),
          backgroundColor: toAlpha(success, 0.8, 'rgba(16, 185, 129, 0.8)'),
          borderColor: success,
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
        backgroundColor: surface,
        titleColor: ink,
        bodyColor: ink,
        borderColor: border,
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
          color: border,
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
        <h3 className="section-title">Monthly Comparison</h3>
      </div>
      <div className="chart-container">
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

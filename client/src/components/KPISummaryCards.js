import React from 'react';
import PropTypes from 'prop-types';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  Target, 
  Clock
} from 'lucide-react';

const KPISummaryCards = ({ analytics, formatCurrency }) => {
  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTrend = (percentage) => {
    if (percentage > 0) return `+${percentage}%`;
    return `${percentage}%`;
  };

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Total Spending</span>
          <div className="stat-icon" style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)', 
            color: '#3b82f6'
          }}>
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="stat-value">
          {formatCurrency(analytics?.summary?.totalSpending || 0)}
        </div>
        <div className="stat-change" style={{
          color: analytics?.summary?.trendDirection === 'up' ? '#ef4444' : 
                 analytics?.summary?.trendDirection === 'down' ? '#10b981' : '#64748b'
        }}>
          {getTrendIcon(analytics?.summary?.trendDirection)}
          <span style={{ marginLeft: 'var(--spacing-xs)' }}>
            {formatTrend(analytics?.summary?.trendPercentage || 0)} vs last year
          </span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Avg Monthly</span>
          <div className="stat-icon" style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(134, 239, 172, 0.1) 100%)', 
            color: '#22c55e'
          }}>
            <Target className="h-4 w-4" />
          </div>
        </div>
        <div className="stat-value">
          {formatCurrency(analytics?.summary?.avgMonthlySpending || 0)}
        </div>
        <div className="stat-change" style={{color: '#64748b'}}>
          Across {analytics?.summary?.monthCount || 0} months
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Months Tracked</span>
          <div className="stat-icon" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(196, 181, 253, 0.1) 100%)', 
            color: '#8b5cf6'
          }}>
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="stat-value">
          {analytics?.summary?.monthCount || 0}
        </div>
        <div className="stat-change" style={{color: '#64748b'}}>
          Complete data coverage
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Status</span>
          <div className="stat-icon" style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(252, 211, 77, 0.1) 100%)', 
            color: '#f59e0b'
          }}>
            {analytics?.summary?.trendDirection === 'stable' ? <Minus className="h-4 w-4" /> :
             analytics?.summary?.trendDirection === 'up' ? <TrendingUp className="h-4 w-4" /> :
             <TrendingDown className="h-4 w-4" />}
          </div>
        </div>
        <div className="stat-value">
          {analytics?.summary?.trendDirection === 'stable' ? 'Stable' :
           analytics?.summary?.trendDirection === 'up' ? 'Rising' : 'Declining'}
        </div>
        <div className="stat-change" style={{color: '#64748b'}}>
          Pattern
        </div>
      </div>
    </div>
  );
};

KPISummaryCards.propTypes = {
  analytics: PropTypes.shape({
    summary: PropTypes.shape({
      totalSpending: PropTypes.number,
      avgMonthlySpending: PropTypes.number,
      monthCount: PropTypes.number,
      trendDirection: PropTypes.string,
      trendPercentage: PropTypes.number
    })
  }),
  formatCurrency: PropTypes.func.isRequired
};

export default KPISummaryCards;

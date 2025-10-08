import React from 'react';
import { Card } from './ui/card';
import PropTypes from 'prop-types';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  Target, 
  Clock,
  Users,
  ArrowRightLeft
} from 'lucide-react';

const KPISummaryCards = ({ analytics, formatCurrency, scopeMeta }) => {
  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <TrendingUp className="w-4 h-4 kpi-up" />;
      case 'down': return <TrendingDown className="w-4 h-4 kpi-down" />;
      default: return <Minus className="w-4 h-4 kpi-neutral" />;
    }
  };

  const formatTrend = (percentage) => {
    if (percentage > 0) return `+${percentage}%`;
    return `${percentage}%`;
  };

  const activeScopeAmount = scopeMeta?.amount ?? analytics?.summary?.totalSpending ?? 0;
  const activeScopeLabel = scopeMeta?.label || 'Total Spending';
  const scopeDisabledHelper = scopeMeta?.key === 'partner' && scopeMeta?.disabled;

  return (
    <div className="stats-grid">
      <Card className="stat-card">
        <div className="stat-header">
          <span className="stat-title">{activeScopeLabel}</span>
          <div className="stat-icon">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="stat-value">
          {formatCurrency(activeScopeAmount)}
        </div>
        {scopeDisabledHelper && (
          <div className="stat-change neutral text-xs text-neutral-500">
            Link a partner account in Settings to unlock partner totals
          </div>
        )}
        <div className={`stat-change ${analytics?.summary?.trendDirection || 'neutral'}`}>
          {getTrendIcon(analytics?.summary?.trendDirection)}
          <span style={{ marginLeft: 'var(--spacing-xs)' }}>
            {formatTrend(analytics?.summary?.trendPercentage || 0)} vs last year
          </span>
        </div>
        <div className="stat-title">
          {analytics?.summary?.monthCount || 0} months tracked
        </div>
      </Card>

      <Card className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Avg Monthly</span>
          <div className="stat-icon">
            <Target className="h-4 w-4" />
          </div>
        </div>
        <div className="stat-value">
          {formatCurrency(analytics?.summary?.avgMonthlySpending || 0)}
        </div>
        <div className="stat-change">
          Based on tracked data
        </div>
      </Card>

      <Card className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Who Owes Who</span>
          <div className="stat-icon">
            {analytics?.settlement?.settlement?.amount === '0.00' ?
              <Users className="h-4 w-4" /> :
              <ArrowRightLeft className="h-4 w-4" />
            }
          </div>
        </div>
        <div className="stat-value">
          {analytics?.settlement?.settlement?.amount === '0.00' ?
            'All settled!' :
            formatCurrency(analytics?.settlement?.settlement?.amount || 0)
          }
        </div>
        <div className="stat-change">
          {analytics?.settlement?.settlement?.message || 'No pending settlements'}
        </div>
      </Card>
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
    }),
    settlement: PropTypes.shape({
      settlement: PropTypes.shape({
        amount: PropTypes.string,
        message: PropTypes.string,
        creditor: PropTypes.string,
        debtor: PropTypes.string
      }),
      totalSharedExpenses: PropTypes.string,
      monthYear: PropTypes.string
    })
  }),
  formatCurrency: PropTypes.func.isRequired,
  scopeMeta: PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string,
    amount: PropTypes.number,
    disabled: PropTypes.bool
  })
};

export default KPISummaryCards;

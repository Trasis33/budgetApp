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

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'up': return 'text-red-600 bg-red-50';
      case 'down': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTrend = (percentage) => {
    if (percentage > 0) return `+${percentage}%`;
    return `${percentage}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Spending</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {formatCurrency(analytics?.summary?.totalSpending || 0)}
            </p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className={`mt-3 flex items-center text-xs ${getTrendColor(analytics?.summary?.trendDirection)} rounded px-2 py-1`}>
          {getTrendIcon(analytics?.summary?.trendDirection)}
          <span className="ml-1 font-medium">
            {formatTrend(analytics?.summary?.trendPercentage || 0)} vs last year
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg Monthly</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {formatCurrency(analytics?.summary?.avgMonthlySpending || 0)}
            </p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <Target className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Across {analytics?.summary?.monthCount || 0} months
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Months Tracked</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {analytics?.summary?.monthCount || 0}
            </p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Complete data coverage
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 truncate">Status</p>
            <p className="text-lg font-bold text-gray-900 mt-1 truncate" title={
              analytics?.summary?.trendDirection === 'stable' ? 'Stable' :
              analytics?.summary?.trendDirection === 'up' ? 'Rising' : 'Declining'
            }>
              {analytics?.summary?.trendDirection === 'stable' ? 'Stable' :
               analytics?.summary?.trendDirection === 'up' ? 'Rising' : 'Declining'}
            </p>
          </div>
          <div className="p-2 bg-yellow-50 rounded-lg ml-2">
            {analytics?.summary?.trendDirection === 'stable' ? <Minus className="w-4 h-4 text-yellow-600" /> :
             analytics?.summary?.trendDirection === 'up' ? <TrendingUp className="w-4 h-4 text-red-600" /> :
             <TrendingDown className="w-4 h-4 text-green-600" />}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Pattern
        </p>
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

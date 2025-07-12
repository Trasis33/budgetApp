import React from 'react';

const OptimizationTipCard = ({ tip, onDismiss }) => {
  const getTipIcon = (type) => {
    switch (type) {
      case 'reduction': return '⬇️';
      case 'reallocation': return '🔄';
      case 'seasonal': return '📅';
      case 'goal_based': return '🎯';
      default: return '💡';
    }
  };

  const getConfidenceColor = (score) => {
    if (score > 0.8) return 'text-green-600';
    if (score > 0.6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="optimization-tip-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{getTipIcon(tip.tip_type)}</div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{tip.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
            
            {tip.impact_amount && (
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-sm font-medium text-green-600">
                  Potential savings: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tip.impact_amount)}
                </span>
                <span className={`text-xs ${getConfidenceColor(tip.confidence_score)}`}>
                  {(tip.confidence_score * 100).toFixed(0)}% confidence
                </span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default OptimizationTipCard;


import { useState } from 'react';
import { UnderspendingInsight, OverspendingInsight } from '@/lib/recommendationEngine';
import { cn } from '@/lib/utils';

interface UnderspendingCardProps {
  insight: UnderspendingInsight;
  overspendingCategories: OverspendingInsight[];
  onAdjustBudget: (categoryId: number, newAmount: number) => void;
  onReallocate: (fromCategoryId: number, toCategoryId: number, amount: number) => void;
  formatCurrency: (amount: number) => string;
}

export function UnderspendingCard({ 
  insight, 
  overspendingCategories, 
  onAdjustBudget, 
  onReallocate, 
  formatCurrency 
}: UnderspendingCardProps) {
  const [isApplied, setIsApplied] = useState(false);
  
  const handleReduceBudget = () => {
    onAdjustBudget(insight.categoryId, insight.suggestedNewBudget);
    setIsApplied(true);
  };
  
  const handleReallocate = (toCategoryId: number) => {
    onReallocate(insight.categoryId, toCategoryId, insight.potentialReallocation);
    setIsApplied(true);
  };
  
  return (
    <div className="rounded-xl border-l-4 border-l-emerald-500 bg-white shadow-sm p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
            style={{ backgroundColor: `var(--theme-${insight.categoryColor})` }}
          >
            {insight.categoryName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-lg">{insight.categoryName}</h4>
            <p className="text-sm text-slate-600">
              Budget: {formatCurrency(insight.budgetAmount)} • Used: {formatCurrency(insight.actualAmount)}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
          {insight.utilizationPercentage.toFixed(0)}% used
        </span>
      </div>
      
      <div className="text-sm text-slate-700">
        <span className="font-semibold text-emerald-600">
          {formatCurrency(insight.unusedAmount)} unused
        </span>
        {' '}this month
      </div>
      
      {insight.recommendedAction === 'reallocate' && overspendingCategories.length > 0 && (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <p className="text-sm text-amber-800 font-medium mb-3">
            Consider reallocating to categories that need more budget:
          </p>
          <div className="space-y-2">
            {overspendingCategories.slice(0, 2).map(cat => (
              <button
                key={cat.categoryId}
                onClick={() => handleReallocate(cat.categoryId)}
                disabled={isApplied}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors text-sm',
                  isApplied
                    ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50'
                    : 'border-amber-300 bg-white hover:bg-amber-50 hover:border-amber-400'
                )}
              >
                <span className="font-medium text-slate-900">Move to {cat.categoryName}</span>
                <span className="text-emerald-600 font-semibold">
                  +{formatCurrency(insight.potentialReallocation)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {insight.recommendedAction === 'boost_savings' && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-800">
            All categories are on track! Consider moving {formatCurrency(insight.potentialReallocation)} to savings.
          </p>
        </div>
      )}
      
      {insight.recommendedAction === 'reduce_budget' && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-slate-700">
            Your spending is consistently below budget. Consider reducing to {formatCurrency(insight.suggestedNewBudget)} to free up funds.
          </p>
        </div>
      )}
      
      <button
        onClick={handleReduceBudget}
        disabled={isApplied}
        className={cn(
          'w-full py-3 rounded-lg font-medium transition-colors text-sm',
          isApplied
            ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        )}
      >
        {isApplied ? '✓ Applied' : `Reduce to ${formatCurrency(insight.suggestedNewBudget)}`}
      </button>
    </div>
  );
}

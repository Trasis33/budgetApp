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
    <div className="rounded-xl border-l-4 border-l-[oklch(var(--theme-teal))] bg-card shadow-sm p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
            style={{ backgroundColor: `var(--theme-${insight.categoryColor})` }}
          >
            {insight.categoryName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-lg">{insight.categoryName}</h4>
            <p className="text-sm text-muted-foreground">
              Budget: {formatCurrency(insight.budgetAmount)} • Used: {formatCurrency(insight.actualAmount)}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-[oklch(var(--theme-teal)/0.15)] text-[oklch(var(--theme-teal))] text-sm font-semibold">
          {insight.utilizationPercentage.toFixed(0)}% used
        </span>
      </div>
      
      <div className="text-sm text-foreground">
        <span className="font-semibold text-[oklch(var(--theme-teal))]">
          {formatCurrency(insight.unusedAmount)} unused
        </span>
        {' '}this month
      </div>
      
      {insight.recommendedAction === 'reallocate' && overspendingCategories.length > 0 && (
        <div className="bg-[oklch(var(--theme-amber)/0.1)] rounded-lg p-4 border border-[oklch(var(--theme-amber)/0.3)]">
          <p className="text-sm text-foreground font-medium mb-3">
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
                    ? 'border-border bg-muted cursor-not-allowed opacity-50'
                    : 'border-[oklch(var(--theme-amber)/0.4)] bg-card hover:bg-[oklch(var(--theme-amber)/0.1)] hover:border-[oklch(var(--theme-amber)/0.6)]'
                )}
              >
                <span className="font-medium text-foreground">Move to {cat.categoryName}</span>
                <span className="text-[oklch(var(--theme-teal))] font-semibold">
                  +{formatCurrency(insight.potentialReallocation)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {insight.recommendedAction === 'boost_savings' && (
        <div className="bg-[oklch(var(--theme-indigo)/0.1)] rounded-lg p-4 border border-[oklch(var(--theme-indigo)/0.3)]">
          <p className="text-sm text-foreground">
            All categories are on track! Consider moving {formatCurrency(insight.potentialReallocation)} to savings.
          </p>
        </div>
      )}
      
      {insight.recommendedAction === 'reduce_budget' && (
        <div className="bg-muted rounded-lg p-4 border border-border">
          <p className="text-sm text-foreground">
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
            ? 'bg-[oklch(var(--theme-teal)/0.15)] text-[oklch(var(--theme-teal))] cursor-not-allowed'
            : 'bg-muted text-foreground hover:bg-muted/80'
        )}
      >
        {isApplied ? '✓ Applied' : `Reduce to ${formatCurrency(insight.suggestedNewBudget)}`}
      </button>
    </div>
  );
}

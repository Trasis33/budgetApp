import { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { OnTrackInsight } from '@/lib/recommendationEngine';

interface OnTrackSummaryProps {
  insights: OnTrackInsight[];
  formatCurrency: (amount: number) => string;
}

export function OnTrackSummary({ insights, formatCurrency }: OnTrackSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (insights.length === 0) return null;
  
  return (
    <div className="rounded-xl border border-[oklch(var(--theme-teal)/0.3)] bg-[oklch(var(--theme-teal)/0.1)] shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-[oklch(var(--theme-teal)/0.15)] transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[oklch(var(--theme-teal))] flex items-center justify-center">
            <Check className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-foreground">
              On Track ({insights.length} {insights.length === 1 ? 'category' : 'categories'})
            </h3>
            <p className="text-sm text-muted-foreground">
              {insights.map(i => i.categoryName).slice(0, 3).join(', ')}
              {insights.length > 3 && `, +${insights.length - 3} more`}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-5 pb-5 space-y-3">
          {insights.map(insight => (
            <div
              key={insight.categoryId}
              className="bg-card rounded-lg p-4 border border-[oklch(var(--theme-teal)/0.2)]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: insight.categoryColor?.startsWith('#') ? insight.categoryColor : `oklch(var(--theme-${insight.categoryColor}))` }}
                  >
                    {insight.categoryName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{insight.categoryName}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(insight.actualAmount)} of {formatCurrency(insight.budgetAmount)}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full bg-[oklch(var(--theme-teal)/0.15)] text-[oklch(var(--theme-teal))] text-xs font-semibold">
                  {insight.utilizationPercentage.toFixed(0)}%
                </span>
              </div>
              
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-[oklch(var(--theme-teal))] rounded-full transition-all"
                  style={{ width: `${Math.min(insight.utilizationPercentage, 100)}%` }}
                />
              </div>
              
              <p className="text-sm text-muted-foreground">{insight.message}</p>
              
              {insight.consecutiveOnTrackMonths > 1 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-[oklch(var(--theme-teal))]">
                  <Check className="h-3 w-3" />
                  <span>{insight.consecutiveOnTrackMonths} months on track</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

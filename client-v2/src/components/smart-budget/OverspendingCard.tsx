import { useState } from 'react';
import { TrendingUp, BarChart, Lightbulb } from 'lucide-react';
import { OverspendingInsight } from '@/lib/recommendationEngine';
import { cn } from '@/lib/utils';

interface OverspendingCardProps {
  insight: OverspendingInsight;
  onAdjustBudget: (categoryId: number, newAmount: number) => void;
  formatCurrency: (amount: number) => string;
}

interface BudgetOption {
  id: 'keep' | 'realistic' | 'average';
  label: string;
  description: string;
  amount: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
}

function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'moderate' | 'challenging' }) {
  const colors = {
    easy: 'bg-[oklch(var(--theme-teal)/0.15)] text-[oklch(var(--theme-teal))]',
    moderate: 'bg-[oklch(var(--theme-amber)/0.15)] text-[oklch(var(--theme-amber))]',
    challenging: 'bg-[oklch(var(--theme-coral)/0.15)] text-[oklch(var(--theme-coral))]'
  };
  
  return (
    <span className={cn('text-xs font-medium px-2 py-1 rounded-full', colors[difficulty])}>
      {difficulty}
    </span>
  );
}

function OverspendProgressBar({ budget, actual }: { budget: number; actual: number }) {
  const percentage = Math.min((actual / budget) * 100, 200);
  const overagePercentage = percentage - 100;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Budget</span>
        <span>Actual: {overagePercentage.toFixed(0)}% over</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full transition-all duration-300',
            percentage > 150 ? 'bg-[oklch(var(--theme-coral))]' : percentage > 100 ? 'bg-[oklch(var(--theme-amber))]' : 'bg-[oklch(var(--theme-teal))]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function OverspendingCard({ insight, onAdjustBudget, formatCurrency }: OverspendingCardProps) {
  const [selectedOption, setSelectedOption] = useState<'keep' | 'realistic' | 'average'>('realistic');
  const [isApplied, setIsApplied] = useState(false);
  
  const options: BudgetOption[] = [
    {
      id: 'keep',
      label: `Keep at ${formatCurrency(insight.budgetAmount)}`,
      description: 'Challenging - requires significant spending cuts',
      amount: insight.budgetAmount,
      difficulty: 'challenging'
    },
    {
      id: 'realistic',
      label: `Adjust to ${formatCurrency(insight.realisticBudgetTarget)}`,
      description: 'Moderate - based on your average + buffer',
      amount: insight.realisticBudgetTarget,
      difficulty: 'moderate'
    },
    {
      id: 'average',
      label: `Match average ${formatCurrency(Math.round(insight.averageMonthlySpend))}`,
      description: 'Easy - reflects your actual spending pattern',
      amount: Math.round(insight.averageMonthlySpend),
      difficulty: 'easy'
    }
  ];
  
  const handleApply = () => {
    const selected = options.find(o => o.id === selectedOption);
    if (selected) {
      onAdjustBudget(insight.categoryId, selected.amount);
      setIsApplied(true);
    }
  };
  
  return (
    <div className="rounded-xl border-l-4 border-l-[oklch(var(--theme-coral))] bg-card shadow-sm p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
            style={{ backgroundColor: insight.categoryColor?.startsWith('#') ? insight.categoryColor : `oklch(var(--theme-${insight.categoryColor}))` }}
          >
            {insight.categoryName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-lg">{insight.categoryName}</h4>
            <p className="text-sm text-muted-foreground">
              Budget: {formatCurrency(insight.budgetAmount)} • Actual: {formatCurrency(insight.actualAmount)}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-[oklch(var(--theme-coral)/0.15)] text-[oklch(var(--theme-coral))] text-sm font-semibold">
          +{insight.overagePercentage.toFixed(0)}% over
        </span>
      </div>
      
      <OverspendProgressBar budget={insight.budgetAmount} actual={insight.actualAmount} />
      
      <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span>
            {insight.isRecurringPattern 
              ? 'Pattern: Overspent in recent months'
              : 'This appears to be a one-time spike'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <BarChart className="h-4 w-4 text-muted-foreground" />
          <span>Your 3-month average: {formatCurrency(insight.averageMonthlySpend)}</span>
        </div>
      </div>
      
      {insight.tips && insight.tips.length > 0 && (
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-foreground">
            <Lightbulb className="h-4 w-4 text-[oklch(var(--theme-gold))]" />
            <h5 className="text-sm font-semibold">Ways to reduce spending:</h5>
          </div>
          <ul className="space-y-2">
            {insight.tips.map(tip => (
              <li key={tip.id} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span className="flex-1">
                  {tip.text}
                  {tip.potentialSavings && (
                    <span className="text-[oklch(var(--theme-teal))] font-medium ml-1">
                      (~{formatCurrency(tip.potentialSavings)}/mo savings)
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="border border-border rounded-lg p-4 space-y-3">
        <h5 className="text-sm font-semibold text-foreground">Adjust your budget target:</h5>
        <div className="space-y-2">
          {options.map(option => (
            <label
              key={option.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                selectedOption === option.id 
                  ? 'border-[oklch(var(--theme-teal))] bg-[oklch(var(--theme-teal)/0.1)]' 
                  : 'border-border hover:border-border/80'
              )}
            >
              <input
                type="radio"
                name="budget-option"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={(e) => setSelectedOption(e.target.value as typeof selectedOption)}
                className="w-4 h-4 text-[oklch(var(--theme-teal))]"
              />
              <div className="flex-1">
                <div className="font-medium text-foreground text-sm">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>
              <DifficultyBadge difficulty={option.difficulty} />
            </label>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleApply}
        disabled={isApplied}
        className={cn(
          'w-full py-3 rounded-lg font-medium transition-colors',
          isApplied
            ? 'bg-[oklch(var(--theme-teal)/0.15)] text-[oklch(var(--theme-teal))] cursor-not-allowed'
            : 'bg-[oklch(var(--theme-teal))] text-white hover:bg-[oklch(var(--theme-teal)/0.9)]'
        )}
      >
        {isApplied ? '✓ Budget Adjusted' : 'Apply Budget Adjustment'}
      </button>
    </div>
  );
}

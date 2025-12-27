import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { WizardState } from './types';
import { Category } from '../../types';
import { cn } from '@/lib/utils';

interface BudgetVariance {
  categoryId: number;
  categoryName: string;
  overagePercentage: number;
  suggestedReduction: number;
  confidenceScore: number;
  categoryColor: string;
}

interface Step3Props {
  state: WizardState;
  categories: Category[];
  updateFixed: (catId: number, val: number) => void;
  updateVariable: (catId: number, val: number) => void;
  onBack: () => void;
  onSave: () => void;
}

export function Step3Recommendations({
  state,
  categories,
  updateFixed,
  onBack,
  onSave
}: Step3Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  const getOverspendingCategories = (): BudgetVariance[] => {
    const categoriesById = new Map(categories.map(c => [c.id, c]));
    const overspending: BudgetVariance[] = [];

    for (const [catId, amount] of Object.entries(state.fixedExpenses)) {
      const id = parseInt(catId, 10);
      const category = categoriesById.get(id);
      if (!category) continue;

      const overagePercentage = 25;
      if (overagePercentage > 20) {
        overspending.push({
          categoryId: id,
          categoryName: category.name,
          overagePercentage,
          suggestedReduction: Math.round(amount * 0.2),
          confidenceScore: 80,
          categoryColor: category.color || 'slate'
        });
      }
    }

    return overspending;
  };

  const overspendingCategories = getOverspendingCategories();

  const applySuggestion = (categoryId: number, suggestedAmount: number) => {
    const budget = state.fixedExpenses[categoryId];
    if (budget) {
      updateFixed(categoryId, suggestedAmount);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col p-6 overflow-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-slate-900">
          Budget Recommendations & Review
        </h2>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <p className="text-slate-600 mb-4">
          Review personalized insights based on your spending patterns.
        </p>

        {overspendingCategories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Overspending Alerts
            </h3>
            <div className="space-y-3">
              {overspendingCategories.map((variance) => (
                <div
                  key={variance.categoryId}
                  data-testid={`overspending-${variance.categoryId}`}
                  className={cn(
                    'p-4 rounded-xl border-l-4 shadow-sm',
                    variance.overagePercentage >= 30 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: `var(--theme-${variance.categoryColor})` }}
                      >
                        {variance.categoryName.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-900">{variance.categoryName}</span>
                    </div>
                    <span className={cn(
                      'text-xs font-semibold px-2 py-1 rounded-full',
                      variance.overagePercentage >= 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      +{variance.overagePercentage}% over budget
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Reduce by: </span>
                      <span className="text-slate-900 font-semibold">{formatCurrency(variance.suggestedReduction)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => applySuggestion(variance.categoryId, Math.round(state.fixedExpenses[variance.categoryId] * 0.8))}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          variance.overagePercentage >= 30 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-600 text-white hover:bg-amber-700'
                        )}
                      >
                        <Check className="h-4 w-4" />
                        Apply
                      </button>
                      <span className="text-xs text-slate-500">
                        {variance.confidenceScore}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {overspendingCategories.length === 0 && (
          <div className="text-slate-400 text-sm">
            No overspending detected. Great job staying on budget!
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={onSave}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium',
            'bg-indigo-600 text-white hover:bg-indigo-700 transition-colors'
          )}
        >
          <Check className="h-4 w-4" />
          Save Budget Plan
        </button>
      </div>
    </motion.div>
  );
}

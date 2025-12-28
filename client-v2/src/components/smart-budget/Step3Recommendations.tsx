import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WizardState } from './types';
import { cn } from '@/lib/utils';
import { TrendSparkline } from './TrendSparkline';

interface BudgetVariance {
  categoryId: number;
  categoryName: string;
  overagePercentage: number;
  suggestedReduction: number;
  suggestedAmount: number;
  confidenceScore: number;
  categoryColor: string;
}

interface UnderutilizedBudget {
  categoryId: number;
  categoryName: string;
  unusedAmount: number;
  usagePercentage: number;
  categoryColor: string;
}

interface TrendingBudget {
  categoryId: number;
  categoryName: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  monthlyData: { month: string; value: number }[];
  categoryColor: string;
}

interface SeasonalPattern {
  categoryId: number;
  categoryName: string;
  patternType: 'spike' | 'trough' | 'consistent';
  upcomingSpikeMonth: string;
  suggestedPreparation: number;
  categoryColor: string;
}

interface Step3Props {
  state: WizardState;
  updateFixed: (catId: number, val: number) => void;
  updateVariable: (catId: number, val: number) => void;
  onBack: () => void;
  onSave: () => void;
  mockOverspending?: BudgetVariance[];
  mockUnderutilized?: UnderutilizedBudget[];
  mockTrending?: TrendingBudget[];
  mockSeasonal?: SeasonalPattern[];
}

export function Step3Recommendations({
  state,
  updateFixed,
  updateVariable,
  onBack,
  onSave,
  mockOverspending,
  mockUnderutilized,
  mockTrending,
  mockSeasonal
}: Step3Props) {
  const [appliedCategories, setAppliedCategories] = React.useState<Set<number>>(new Set());
  const [appliedAmounts, setAppliedAmounts] = React.useState<Record<number, number>>({});
  const debounceTimeoutsRef = React.useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  const getOverspendingCategories = (): BudgetVariance[] => {
    if (mockOverspending) return mockOverspending;
    return [];
  };

  const getUnderutilizedCategories = (): UnderutilizedBudget[] => {
    if (mockUnderutilized) return mockUnderutilized;
    return [];
  };

  const getTrendingCategories = (): TrendingBudget[] => {
    if (mockTrending) return mockTrending;
    return [];
  };

  const getSeasonalCategories = (): SeasonalPattern[] => {
    if (mockSeasonal) return mockSeasonal;
    return [];
  };

  const overspendingCategories = getOverspendingCategories();
  const underutilizedCategories = getUnderutilizedCategories();
  const trendingCategories = getTrendingCategories();
  const seasonalCategories = getSeasonalCategories();

  const applySuggestion = (categoryId: number, suggestedAmount: number, isFixed: boolean = true) => {
    if (appliedCategories.has(categoryId) || state.appliedSuggestions[categoryId]) {
      return;
    }

    const budget = isFixed ? state.fixedExpenses[categoryId] : state.variableAllocations[categoryId];
    if (!budget) {
      return;
    }

    if (debounceTimeoutsRef.current[categoryId]) {
      clearTimeout(debounceTimeoutsRef.current[categoryId]);
    }

    debounceTimeoutsRef.current[categoryId] = setTimeout(() => {
      setAppliedAmounts(prev => ({ ...prev, [categoryId]: suggestedAmount }));
      if (isFixed) {
        updateFixed(categoryId, suggestedAmount);
      } else {
        updateVariable(categoryId, suggestedAmount);
      }
      setAppliedCategories(prev => new Set(prev).add(categoryId));
    }, 300);
  };

  const applyAllSuggestions = () => {
    overspendingCategories.forEach((variance) => {
      if (!appliedCategories.has(variance.categoryId) && !state.appliedSuggestions[variance.categoryId]) {
        const budget = state.fixedExpenses[variance.categoryId];
        if (budget) {
          if (debounceTimeoutsRef.current[variance.categoryId]) {
            clearTimeout(debounceTimeoutsRef.current[variance.categoryId]);
          }

          debounceTimeoutsRef.current[variance.categoryId] = setTimeout(() => {
            setAppliedAmounts(prev => ({ ...prev, [variance.categoryId]: variance.suggestedAmount }));
            updateFixed(variance.categoryId, variance.suggestedAmount);
            setAppliedCategories(prev => new Set(prev).add(variance.categoryId));
          }, 300);
        }
      }
    });
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Overspending Alerts
              </h3>
              <button
                onClick={applyAllSuggestions}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Apply All
              </button>
            </div>
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
                        disabled={appliedCategories.has(variance.categoryId) || !!state.appliedSuggestions[variance.categoryId]}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          variance.overagePercentage >= 30 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-600 text-white hover:bg-amber-700',
                          (appliedCategories.has(variance.categoryId) || !!state.appliedSuggestions[variance.categoryId]) && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {(appliedCategories.has(variance.categoryId) || !!state.appliedSuggestions[variance.categoryId]) ? (
                          <Check className="h-4 w-4" data-testid="check-icon" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {(appliedCategories.has(variance.categoryId) || !!state.appliedSuggestions[variance.categoryId]) ? 'Applied' : 'Apply'}
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

        {underutilizedCategories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-emerald-600 mb-3 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Underutilized Budgets
            </h3>
            <div className="space-y-3">
              {underutilizedCategories.map((underutilized) => (
                <div
                  key={underutilized.categoryId}
                  data-testid={`underutilized-${underutilized.categoryId}`}
                  className="p-4 rounded-xl border-l-4 shadow-sm bg-emerald-50 border-emerald-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: `var(--theme-${underutilized.categoryColor})` }}
                      >
                        {underutilized.categoryName.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-900">{underutilized.categoryName}</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      {underutilized.usagePercentage}% used
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Unused: </span>
                    <span className="text-slate-900 font-semibold">{formatCurrency(underutilized.unusedAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {trendingCategories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-indigo-600 mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Spending Trends
            </h3>
            <div className="space-y-3">
              {trendingCategories.map((trend) => (
                <div
                  key={trend.categoryId}
                  data-testid={`trend-card-${trend.categoryId}`}
                  className={cn(
                    'p-4 rounded-xl border-l-4 shadow-sm',
                    trend.trend === 'increasing' && 'bg-rose-50 border-rose-200',
                    trend.trend === 'decreasing' && 'bg-emerald-50 border-emerald-200',
                    trend.trend === 'stable' && 'bg-indigo-50 border-indigo-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: `var(--theme-${trend.categoryColor})` }}
                      >
                        {trend.categoryName.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-900">{trend.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1',
                          trend.trend === 'increasing' && 'bg-rose-100 text-rose-700',
                          trend.trend === 'decreasing' && 'bg-emerald-100 text-emerald-700',
                          trend.trend === 'stable' && 'bg-indigo-100 text-indigo-700'
                        )}
                      >
                        {trend.trend === 'increasing' && <TrendingUp className="h-3 w-3" />}
                        {trend.trend === 'decreasing' && <TrendingDown className="h-3 w-3" />}
                        {trend.trend === 'stable' && <Minus className="h-3 w-3" />}
                        {Math.abs(trend.percentageChange)}%
                      </span>
                      <span className="text-xs text-slate-500">
                        confidence: 85%
                      </span>
                    </div>
                  </div>
                  <div className="h-[60px] w-full">
                    <TrendSparkline
                      data={trend.monthlyData}
                      trend={trend.trend}
                      height={60}
                      width={400}
                    />
                  </div>
                 </div>
               ))}
             </div>
           </div>
         )}

        {seasonalCategories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-amber-600 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Seasonal Patterns
            </h3>
            <div className="space-y-3">
              {seasonalCategories.map((seasonal) => (
                <div
                  key={seasonal.categoryId}
                  data-testid={`seasonal-${seasonal.categoryId}`}
                  className={cn(
                    'p-4 rounded-xl border-l-4 shadow-sm',
                    seasonal.patternType === 'spike' && 'bg-rose-50 border-rose-200',
                    seasonal.patternType === 'trough' && 'bg-emerald-50 border-emerald-200',
                    seasonal.patternType === 'consistent' && 'bg-indigo-50 border-indigo-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: `var(--theme-${seasonal.categoryColor})` }}
                      >
                        {seasonal.categoryName.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-900">{seasonal.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1',
                          seasonal.patternType === 'spike' && 'bg-rose-100 text-rose-700',
                          seasonal.patternType === 'trough' && 'bg-emerald-100 text-emerald-700',
                          seasonal.patternType === 'consistent' && 'bg-indigo-100 text-indigo-700'
                        )}
                      >
                        {seasonal.patternType === 'spike' && '⚡ Spike'}
                        {seasonal.patternType === 'trough' && '📉 Consistent'}
                        {seasonal.patternType === 'consistent' && '➡️ Average'}
                      </span>
                      {seasonal.upcomingSpikeMonth && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {seasonal.upcomingSpikeMonth}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">3-month average: </span>
                      <span className="text-slate-900 font-semibold">{formatCurrency(seasonal.suggestedPreparation)}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Typical range: </span>
                      <span className="text-slate-900">{formatCurrency(seasonal.suggestedPreparation * 0.8)} - {formatCurrency(seasonal.suggestedPreparation * 1.2)}</span>
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

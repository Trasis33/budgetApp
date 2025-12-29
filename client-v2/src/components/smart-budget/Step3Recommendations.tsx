import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, AlertTriangle, Home, PieChart, PiggyBank, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { WizardState } from './types';
import { cn } from '@/lib/utils';
import { optimizationService, AnalysisResponse } from '@/api/services/optimizationService';
import { OverspendingCard } from './OverspendingCard';
import { UnderspendingCard } from './UnderspendingCard';
import { OnTrackSummary } from './OnTrackSummary';
import { DataIntegrityBanner } from './DataIntegrityBanner';

// Backend insight types (enriched with frontend data)
interface OverspendingInsight {
  type: 'overspending';
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  budgetAmount: number;
  actualAmount: number;
  overageAmount: number;
  overagePercentage: number;
  isRecurringPattern: boolean;
  averageMonthlySpend: number;
  highestRecentSpend: number;
  lowestRecentSpend: number;
  realisticBudgetTarget: number;
  suggestedSpendingReduction: number;
  reductionDifficulty: 'easy' | 'moderate' | 'challenging';
  tips: Array<{
    id: string;
    text: string;
    potentialSavings?: number;
    difficulty: 'easy' | 'moderate' | 'hard';
  }>;
}

interface UnderspendingInsight {
  type: 'underspending';
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  budgetAmount: number;
  actualAmount: number;
  unusedAmount: number;
  utilizationPercentage: number;
  recommendedAction: 'reallocate' | 'reduce_budget' | 'boost_savings';
  suggestedNewBudget: number;
  potentialReallocation: number;
  isConsistentPattern: boolean;
  averageUtilization: number;
}

interface OnTrackInsight {
  type: 'on_track';
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  budgetAmount: number;
  actualAmount: number;
  utilizationPercentage: number;
  consecutiveOnTrackMonths: number;
  trend: 'improving' | 'stable' | 'slightly_increasing';
  message: string;
}

interface StructuredInsights {
  overspending: Array<Omit<OverspendingInsight, 'categoryId' | 'categoryColor'>>;
  underspending: Array<Omit<UnderspendingInsight, 'categoryId' | 'categoryColor'>>;
  onTrack: Array<Omit<OnTrackInsight, 'categoryId' | 'categoryColor'>>;
}


interface Step3Props {
  state: WizardState;
  updateFixed: (catId: number, val: number) => void;
  updateVariable: (catId: number, val: number) => void;
  onBack: () => void;
  onSave: () => void;
  categories?: { id: number; name: string; color: string; icon?: string }[];
}

export function Step3Recommendations({
  state,
  updateFixed,
  updateVariable,
  onBack,
  onSave,
  categories = []
}: Step3Props) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [optimizationData, setOptimizationData] = useState<(AnalysisResponse & { structuredInsights?: StructuredInsights }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);
  
  const [overspendingInsights, setOverspendingInsights] = useState<OverspendingInsight[]>([]);
  const [underspendingInsights, setUnderspendingInsights] = useState<UnderspendingInsight[]>([]);
  const [onTrackInsights, setOnTrackInsights] = useState<OnTrackInsight[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const loadOptimizationData = async () => {
      console.log('[Step3] Fetching optimization data from API...');
      setIsLoading(true);

      try {
        // Combine fixed and variable allocations into proposed budgets
        const proposedBudgets: Record<number, number> = {
          ...state.fixedExpenses,
          ...state.variableAllocations
        };
        
        console.log('[Step3] Sending proposed budgets from Step 2:', proposedBudgets);
        
        const data = await optimizationService.getAnalysis(proposedBudgets);
        console.log('[Step3] Optimization API response:', data);

        if (!isMounted.current) {
          console.warn('[Step3] Component unmounted, skipping state update');
          return;
        }

        setOptimizationData(data);

        console.log('[Step3] Data loaded successfully:');
        console.log('  - Budget variances:', data.budgetVariances?.length || 0);
        console.log('  - Patterns:', Object.keys(data.patterns || {}).length);

      } catch (error) {
        console.error('[Step3] Failed to load optimization data:', error);
        if (isMounted.current) {
          toast.error(`Failed to load recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    loadOptimizationData();
  }, [state.fixedExpenses, state.variableAllocations]);

  // Process recommendations from backend
  useEffect(() => {
    if (!optimizationData?.structuredInsights) {
      console.log('[Step3] No structured insights from backend yet');
      return;
    }

    const { overspending, underspending, onTrack } = optimizationData.structuredInsights;

    // Map category names to IDs and add color information
    const enrichedOverspending = overspending.map(insight => {
      const category = categories.find(c => c.name.trim().toLowerCase() === insight.categoryName.trim().toLowerCase());
      return {
        ...insight,
        categoryId: category?.id || 0,
        categoryColor: category?.color || 'amber'
      };
    });

    const enrichedUnderspending = underspending.map(insight => {
      const category = categories.find(c => c.name.trim().toLowerCase() === insight.categoryName.trim().toLowerCase());
      return {
        ...insight,
        categoryId: category?.id || 0,
        categoryColor: category?.color || 'teal'
      };
    });

    const enrichedOnTrack = onTrack.map(insight => {
      const category = categories.find(c => c.name.trim().toLowerCase() === insight.categoryName.trim().toLowerCase());
      return {
        ...insight,
        categoryId: category?.id || 0,
        categoryColor: category?.color || 'emerald'
      };
    });

    setOverspendingInsights(enrichedOverspending);
    setUnderspendingInsights(enrichedUnderspending);
    setOnTrackInsights(enrichedOnTrack);

    console.log('[Step3] Backend recommendations loaded:', {
      overspending: enrichedOverspending.length,
      underspending: enrichedUnderspending.length,
      onTrack: enrichedOnTrack.length
    });
  }, [optimizationData, categories]);

  const totalFixed = useMemo(
    () => Object.values(state.fixedExpenses).reduce((sum, amount) => sum + amount, 0),
    [state.fixedExpenses]
  );
  const totalVariable = useMemo(
    () => Object.values(state.variableAllocations).reduce((sum, amount) => sum + amount, 0),
    [state.variableAllocations]
  );
  const unallocated = useMemo(
    () => state.income - totalFixed - totalVariable,
    [state.income, totalFixed, totalVariable]
  );
  const isOverallocated = unallocated < 0;
  const savingsRate = useMemo(
    () => state.income > 0 ? ((state.income - totalFixed - totalVariable) / state.income) * 100 : 0,
    [state.income, totalFixed, totalVariable]
  );

  const handleSave = () => {
    if (isOverallocated) {
      toast.error('Cannot save: Budget is over budget. Please reduce expenses.');
      return;
    }

    setShowConfirmation(true);
  };

  const handleAdjustBudget = (categoryId: number, newAmount: number) => {
    const isFixed = state.fixedExpenses[categoryId] !== undefined;
    if (isFixed) {
      updateFixed(categoryId, newAmount);
    } else {
      updateVariable(categoryId, newAmount);
    }
    toast.success('Budget adjusted successfully');
  };

  const handleReallocate = (fromCategoryId: number, toCategoryId: number, amount: number) => {
    const fromIsFixed = state.fixedExpenses[fromCategoryId] !== undefined;
    const toIsFixed = state.fixedExpenses[toCategoryId] !== undefined;
    
    if (fromIsFixed) {
      const currentAmount = state.fixedExpenses[fromCategoryId];
      updateFixed(fromCategoryId, currentAmount - amount);
    } else {
      const currentAmount = state.variableAllocations[fromCategoryId];
      updateVariable(fromCategoryId, currentAmount - amount);
    }
    
    if (toIsFixed) {
      const currentAmount = state.fixedExpenses[toCategoryId];
      updateFixed(toCategoryId, currentAmount + amount);
    } else {
      const currentAmount = state.variableAllocations[toCategoryId];
      updateVariable(toCategoryId, currentAmount + amount);
    }
    
    toast.success('Budget reallocated successfully');
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
        <DataIntegrityBanner />

        {isLoading && (
          <div className="text-center py-8 text-slate-600">
            Loading recommendations...
          </div>
        )}

        {!isLoading && overspendingInsights.length === 0 && underspendingInsights.length === 0 && onTrackInsights.length === 0 && (
          <div className="text-center py-8 text-slate-600">
            No recommendations available yet. We need more spending data to provide insights.
          </div>
        )}

        {overspendingInsights.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Attention Needed ({overspendingInsights.length} {overspendingInsights.length === 1 ? 'category' : 'categories'})
            </h3>
            <div className="space-y-4">
              {overspendingInsights.map((insight) => (
                <OverspendingCard
                  key={insight.categoryId}
                  insight={insight}
                  onAdjustBudget={handleAdjustBudget}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          </div>
        )}

        {underspendingInsights.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-emerald-600 mb-4 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Opportunities ({underspendingInsights.length} {underspendingInsights.length === 1 ? 'category' : 'categories'})
            </h3>
            <div className="space-y-4">
              {underspendingInsights.map((insight) => (
                <UnderspendingCard
                  key={insight.categoryId}
                  insight={insight}
                  overspendingCategories={overspendingInsights}
                  onAdjustBudget={handleAdjustBudget}
                  onReallocate={handleReallocate}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          </div>
        )}

        {onTrackInsights.length > 0 && (
          <div className="mb-6">
            <OnTrackSummary
              insights={onTrackInsights}
              formatCurrency={formatCurrency}
            />
          </div>
        )}

        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Budget Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-600">Total Income</div>
              <div className="text-xl font-semibold text-slate-900">{formatCurrency(state.income)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">Fixed Expenses</div>
              <div className="text-xl font-semibold text-slate-900">{formatCurrency(totalFixed)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">Variable Budgets</div>
              <div className="text-xl font-semibold text-slate-900">{formatCurrency(totalVariable)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">Unallocated</div>
              <div className={cn(
                'text-xl font-semibold',
                isOverallocated ? 'text-red-600' : 'text-emerald-600'
              )}>
                {formatCurrency(unallocated)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={handleSave}
          aria-label={isOverallocated ? "Cannot save: Budget is over-allocated" : "Save budget plan"}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium',
            'bg-indigo-600 text-white hover:bg-indigo-700 transition-colors',
            (isOverallocated || isLoading) && 'opacity-50 cursor-not-allowed'
          )}
          disabled={isOverallocated || isLoading}
        >
          <Check className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Budget Plan'}
        </button>
      </div>

      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="flex justify-center mb-6"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-semibold text-slate-900 text-center mb-2">
                Budget Saved Successfully!
              </h2>

              <p className="text-slate-600 text-center mb-6">
                Your budget plan has been applied and is ready to use.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Total Budget</span>
                  </div>
                  <span className="font-semibold text-slate-900">{formatCurrency(state.income)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Fixed + Variable</span>
                  </div>
                  <span className="font-semibold text-slate-900">{formatCurrency(totalFixed + totalVariable)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Savings Rate</span>
                  </div>
                  <span className="font-semibold text-emerald-600">{savingsRate.toFixed(1)}%</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSave();
                  setShowConfirmation(false);
                }}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium',
                  'bg-indigo-600 text-white hover:bg-indigo-700 transition-colors'
                )}
              >
                <Home className="h-4 w-4" />
                View Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

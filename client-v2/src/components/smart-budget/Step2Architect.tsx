import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Plus } from 'lucide-react';
import { WizardState, STRATEGIES } from './types';
import { Category } from '../../types';
import { cn } from '@/lib/utils';
import { getIconByName } from '@/lib/categoryIcons';
import { getCategoryColor } from '@/lib/categoryColors';
import { getCategoryIconStyle } from '@/lib/iconUtils';

interface Step2Props {
  state: WizardState;
  categories: Category[];
  billCategoryIds: number[];
  updateFixed: (catId: number, val: number) => void;
  updateVariable: (catId: number, val: number) => void;
  onBack: () => void;
  onSave: () => void;
}

export function Step2Architect({
  state,
  categories,
  billCategoryIds,
  updateFixed,
  updateVariable,
  onBack,
  onSave
}: Step2Props) {
  // Separate categories into fixed (needs) and variable (lifestyle/savings)
  // This is a heuristic since we don't have a strict flag yet, but we can default common ones
  // or rely on user input. For now, let's categorize based on names for defaults
  
  const strategy = STRATEGIES.find(s => s.id === state.selectedStrategy) || STRATEGIES[0];

  const [localFixed, setLocalFixed] = useState<Record<number, number>>(state.fixedExpenses);
  const [localVariable, setLocalVariable] = useState<Record<number, number>>(state.variableAllocations);
  // Tracks only *manual* edits done in Step 2. Seeding from previous months
  // or other automatic state changes should not flip this to true.
  const [hasUserEditedVariables, setHasUserEditedVariables] = useState(false);

  // Keep local fixed/variable state in sync when the parent wizard state changes
  useEffect(() => {
    setLocalFixed(state.fixedExpenses || {});
  }, [state.fixedExpenses]);

  useEffect(() => {
    const parentVariable = state.variableAllocations || {};
    setLocalVariable(parentVariable);
  }, [state.variableAllocations]);

  // Helper: get spending role with sensible default
  const getCategoryRole = (cat: Category): 'need' | 'want' | 'save' => {
      return cat.spending_role || 'need';
  };

  const billCategoryIdSet = useMemo(
    () => new Set<number>(billCategoryIds || []),
    [billCategoryIds]
  );

  // Define fixed vs variable categories
  // Prioritize the is_fixed flag from the database, fallback to name matching for legacy/defaults
  const isFixedCategory = (cat: Category) => {
      if (cat.is_fixed !== undefined) return cat.is_fixed;
      
      const fixedNames = ['housing', 'mortgage', 'rent', 'utilities', 'insurance', 'internet', 'phone', 'transportation', 'car'];
      const name = cat.name.toLowerCase();
      return fixedNames.some(f => name.includes(f));
  };

  const fixedCats = useMemo(() => categories.filter(c => isFixedCategory(c)), [categories]);
  const variableCats = useMemo(() => categories.filter(c => !isFixedCategory(c)), [categories]);

  // Calculate totals
  const totalFixed = Object.values(localFixed).reduce((sum, val) => sum + val, 0);
  const disposableIncome = Math.max(0, state.income - totalFixed);
  const totalVariable = Object.values(localVariable).reduce((sum, val) => sum + val, 0);
  const unallocated = disposableIncome - totalVariable;

  // Bucketed totals for Needs/Wants/Saves across fixed + variable
  const needsTotal = useMemo(() => {
      const fixedNeeds = fixedCats
        .filter((c) => getCategoryRole(c) === 'need')
        .reduce((sum, c) => sum + (localFixed[c.id] || 0), 0);
      const variableNeeds = variableCats
        .filter((c) => getCategoryRole(c) === 'need')
        .reduce((sum, c) => sum + (localVariable[c.id] || 0), 0);
      return fixedNeeds + variableNeeds;
  }, [fixedCats, variableCats, localFixed, localVariable]);

  const needsTargetAmount = state.income * strategy.distribution.needs;
  const needsTargetPercent = strategy.distribution.needs * 100;
  const needsActualPercent = state.income > 0 ? (needsTotal / state.income) * 100 : 0;

  // Initial Allocation Logic based on spending_role (need/want/save)
  // This distributes budgets across ALL variable categories proportionally,
  // rather than only filling unassigned ones.
  useEffect(() => {
      // Once the user has manually adjusted variable categories, we stop
      // auto-rebalancing and leave their choices untouched.
      if (hasUserEditedVariables || disposableIncome <= 0) {
          return;
      }

      const variableNeedCats = variableCats.filter((c) => getCategoryRole(c) === 'need');
      const variableWantCats = variableCats.filter((c) => getCategoryRole(c) === 'want');
      const variableSaveCats = variableCats.filter((c) => getCategoryRole(c) === 'save');

      // Fixed needs already committed
      const fixedNeeds = fixedCats
        .filter((c) => getCategoryRole(c) === 'need')
        .reduce((sum, c) => sum + (localFixed[c.id] || 0), 0);

      // Calculate target budgets for each bucket based on strategy
      // Variable needs = needs target minus what's already in fixed
      let variableNeedsBudget = Math.max(0, needsTargetAmount - fixedNeeds);
      let wantsBudget = state.income * strategy.distribution.wants;
      let savingsBudget = state.income * strategy.distribution.savings;

      // Scale down if total exceeds disposable income
      const plannedTotal = variableNeedsBudget + wantsBudget + savingsBudget;
      if (plannedTotal > disposableIncome && plannedTotal > 0) {
        const scale = disposableIncome / plannedTotal;
        variableNeedsBudget *= scale;
        wantsBudget *= scale;
        savingsBudget *= scale;
      }

      const newAllocations: Record<number, number> = {};

      // Distribute each bucket evenly among its categories
      if (variableNeedCats.length > 0 && variableNeedsBudget > 0) {
        const perCat = variableNeedsBudget / variableNeedCats.length;
        variableNeedCats.forEach((c) => {
          newAllocations[c.id] = Math.round(perCat);
        });
      }

      if (variableWantCats.length > 0 && wantsBudget > 0) {
        const perCat = wantsBudget / variableWantCats.length;
        variableWantCats.forEach((c) => {
          newAllocations[c.id] = Math.round(perCat);
        });
      }

      if (variableSaveCats.length > 0 && savingsBudget > 0) {
        const perCat = savingsBudget / variableSaveCats.length;
        variableSaveCats.forEach((c) => {
          newAllocations[c.id] = Math.round(perCat);
        });
      }

      // Update local slider/input state
      setLocalVariable(newAllocations);

      // Also push the auto-calculated allocations up to the wizard state so that
      // the final save call persists them.
      Object.entries(newAllocations).forEach(([id, val]) => {
        updateVariable(parseInt(id, 10), val as number);
      });
  }, [
      state.income,
      state.selectedStrategy,
      needsTargetAmount,
      disposableIncome,
      variableCats,
      fixedCats,
      localFixed,
      hasUserEditedVariables,
      updateVariable,
      strategy.distribution.wants,
      strategy.distribution.savings
  ]);


  const handleFixedChange = (id: number, val: string) => {
      const num = parseInt(val.replace(/\D/g, '')) || 0;
      setLocalFixed(prev => ({ ...prev, [id]: num }));
      updateFixed(id, num);
  };

  const handleVariableChange = (id: number, val: string | number) => {
      setHasUserEditedVariables(true);
      const num = typeof val === 'string' ? parseInt(val.replace(/\D/g, '')) || 0 : val;
      setLocalVariable(prev => ({ ...prev, [id]: num }));
      updateVariable(id, num);
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('sv-SE', { useGrouping: true }).format(num);

  return (
    <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex-1 flex flex-col h-full overflow-hidden min-h-0"
    >
      {/* Header */}
      <div className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
            <div className="p-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">Change Strategy</span>
        </button>

        {/* Income Summary Pill */}
        <div className="hidden md:flex items-center gap-6 bg-slate-50 px-6 py-2 rounded-full border border-slate-200">
            <div className="text-right">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Income</span>
                <span className="block text-lg font-bold text-slate-900">kr {formatNumber(state.income)}</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unallocated</span>
                <span className={cn(
                    "block text-lg font-bold",
                    unallocated < 0 ? "text-red-500" : "text-green-600"
                )}>kr {formatNumber(unallocated)}</span>
            </div>
        </div>

        <div className="w-32"></div>
      </div>

      {/* Needs vs target summary */}
      {state.income > 0 && (
        <div className="flex-none bg-white border-b border-slate-100 px-6 py-2 text-[11px] text-slate-500">
          <span
            className={cn(
              "font-medium",
              needsActualPercent > needsTargetPercent + 5 ? "text-red-500" : "text-slate-600"
            )}
          >
            Needs: {Math.round(needsActualPercent)}% of income
          </span>
          <span className="text-slate-400">
            {' '}· Strategy target {Math.round(needsTargetPercent)}%
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 bg-slate-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Fixed Expenses */}
            <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fixed Expenses</h2>
                    <span className="text-xs font-medium text-slate-500">Total: kr {formatNumber(totalFixed)}</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="divide-y divide-slate-50">
                        {fixedCats.map(category => {
                            const Icon = getIconByName(category.icon);
                            const color = getCategoryColor(category);
                            const amount = localFixed[category.id] || 0;
                            const isBill = billCategoryIdSet.has(category.id);

                            return (
                                <div key={category.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                                                style={getCategoryIconStyle(color, false, 0.1)}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{category.name}</span>
                                            {isBill && (
                                              <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">
                                                Bill
                                              </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">kr</span>
                                        <input 
                                            type="text" 
                                            value={amount > 0 ? formatNumber(amount) : ''} 
                                            placeholder="0"
                                            onChange={(e) => handleFixedChange(category.id, e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-slate-900 text-right placeholder:text-slate-300" 
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Add Mock Button (non-functional for now per scope, but visually there) */}
                        <button className="w-full py-3 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                            <Plus className="h-3 w-3" />
                            Add Fixed Category
                        </button>
                    </div>
                </div>
            </div>
 
            {/* Right Column: Variable Expenses */}
            <div className="lg:col-span-8 space-y-4 flex flex-col">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Variable Lifestyle & Savings</h2>
                    <span className="text-xs font-medium text-slate-500">Disposable: kr {formatNumber(disposableIncome)}</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 p-6 space-y-6 min-h-[400px]">
                    
                    {variableCats.map(category => {
                        const Icon = getIconByName(category.icon);
                        const color = getCategoryColor(category);
                        const amount = localVariable[category.id] || 0;
                        const percentOfDisposable = disposableIncome > 0 ? Math.round((amount / disposableIncome) * 100) : 0;
                        
                        // Helper for distinct saving look
                        const isSavings = category.name.toLowerCase().includes('sav');

                        return (
                            <div 
                                key={category.id}
                                className={cn(
                                    "bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-300",
                                    isSavings ? "border-green-200 ring-1 ring-green-500/10" : "border-slate-100"
                                )}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                            style={getCategoryIconStyle(color, false, 0.15)}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">{category.name}</h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right relative">
                                            <input 
                                                type="text" 
                                                value={amount > 0 ? formatNumber(amount) : ''}
                                                placeholder="0"
                                                onChange={(e) => handleVariableChange(category.id, e.target.value)}
                                                className={cn(
                                                    "w-28 text-right font-bold text-lg border-b focus:border-blue-500 outline-none bg-transparent transition-colors pb-1",
                                                    isSavings ? "text-green-600 border-green-200" : "text-slate-900 border-slate-200"
                                                )}
                                            />
                                            <span className="text-xs text-slate-400 ml-1 absolute right-0 -bottom-5">kr</span>
                                        </div>
                                    </div>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={disposableIncome > 0 ? disposableIncome : 10000} 
                                    step="100"
                                    value={amount}
                                    onChange={(e) => handleVariableChange(category.id, parseInt(e.target.value))}
                                    className={cn(
                                        "w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer",
                                        "accent-slate-900" // default fallback
                                    )}
                                    style={{ accentColor: color }}
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-[10px] font-medium text-slate-400">0%</span>
                                    <span className={cn(
                                        "text-[10px] font-bold",
                                        isSavings ? "text-green-600" : "text-slate-600"
                                    )}>{percentOfDisposable}% of disposable</span>
                                </div>
                            </div>
                        );
                    })}

                    {variableCats.length === 0 && (
                         <div className="text-center py-10 text-slate-400">
                            <p>No variable categories found.</p>
                         </div>
                    )}
                </div>

                {/* Debug summary: how many budgets will be saved */}
                <div className="text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Fixed budgets to save:{' '}
                    {fixedCats.filter(c => (localFixed[c.id] || 0) > 0 && !billCategoryIdSet.has(c.id)).length}
                  </span>
                  <span>
                    Variable budgets to save:{' '}
                    {variableCats.filter(c => (localVariable[c.id] || 0) > 0).length}
                  </span>
                  {hasUserEditedVariables && (
                    <span className="text-[11px] text-slate-400">
                      Variable allocations are now manual; strategy wont auto-rebalance.
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <button 
                    onClick={onSave}
                    className="w-full mt-2 py-4 bg-slate-900 text-white rounded-xl font-semibold shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 text-lg"
                >
                    <Check className="h-5 w-5" />
                    Apply Budget Plan
                </button>
            </div>

        </div>
      </div>
    </motion.div>
  );
}

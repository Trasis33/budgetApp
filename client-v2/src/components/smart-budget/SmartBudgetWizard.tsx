import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Category, BudgetWithSpending } from '../../types';
import { Step1Strategy } from './Step1Strategy';
import { Step2Architect } from './Step2Architect';
import { WizardState, StrategyType, STRATEGIES } from './types';
import { budgetService } from '../../api/services/budgetService';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

interface SmartBudgetWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  categories: Category[];
  existingBudgets: BudgetWithSpending[];
  month: number;
  year: number;
}

export function SmartBudgetWizard({
  isOpen,
  onClose,
  onComplete,
  categories,
  existingBudgets,
  month,
  year
}: SmartBudgetWizardProps) {
  const [state, setState] = useState<WizardState>({
    step: 1,
    income: 45000, // Default start value
    selectedStrategy: 'balanced',
    fixedExpenses: {},
    variableAllocations: {}
  });

  // Initialize fixed expenses from existing budgets if available
  React.useEffect(() => {
    if (isOpen) {
      const initialFixed: Record<number, number> = {};
      existingBudgets.forEach(b => {
        // We'll need a way to identify fixed vs variable eventually. 
        // For now, we can check if the category name implies fixed costs or rely on future backend flag
        // Or just pre-fill if the amount > 0
        if (b.amount > 0) {
          // initialFixed[b.category_id] = b.amount; 
          // Actually, let's not pre-fill too aggressively to allow a clean slate feel
          // unless the user specifically wants to 'edit' their plan.
          // For this MVP, let's start clean or maybe pre-fill common fixed categories
        }
      });
      
      // Reset state on open
      setState(prev => ({
        ...prev,
        step: 1,
        // income: prev.income // keep income if they set it previously
      }));
    }
  }, [isOpen, existingBudgets]);

  const handleSave = async () => {
    try {
      const promises = [];
      
      // Save Fixed Expenses
      for (const [catId, amount] of Object.entries(state.fixedExpenses)) {
        if (amount > 0) {
          promises.push(budgetService.createOrUpdateBudget({
            category_id: parseInt(catId),
            amount,
            month,
            year
          }));
        }
      }

      // Save Variable Allocations
      for (const [catId, amount] of Object.entries(state.variableAllocations)) {
        if (amount > 0) {
          promises.push(budgetService.createOrUpdateBudget({
            category_id: parseInt(catId),
            amount,
            month,
            year
          }));
        }
      }

      await Promise.all(promises);
      toast.success('✨ Budget plan applied successfully!');
      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to save budget plan:', error);
      toast.error('Failed to save budget plan. Please try again.');
    }
  };

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden bg-slate-50 border-slate-200 sm:rounded-2xl">
        <DialogTitle className="sr-only">Smart Budget Setup</DialogTitle>
        <DialogDescription className="sr-only">
          A wizard to help you set up your monthly budget based on income and strategies.
        </DialogDescription>
        <div className="h-full flex flex-col min-h-0">
            <AnimatePresence mode="wait">
                {state.step === 1 ? (
                    <Step1Strategy
                        key="step1"
                        income={state.income}
                        setIncome={(val) => updateState({ income: val })}
                        selectedStrategy={state.selectedStrategy}
                        setStrategy={(val) => updateState({ selectedStrategy: val })}
                        onNext={() => updateState({ step: 2 })}
                        onCancel={onClose}
                    />
                ) : (
                    <Step2Architect
                        key="step2"
                        state={state}
                        categories={categories}
                        updateFixed={(catId, val) => {
                            updateState({
                                fixedExpenses: { ...state.fixedExpenses, [catId]: val }
                            });
                        }}
                        updateVariable={(catId, val) => {
                             updateState({
                                variableAllocations: { ...state.variableAllocations, [catId]: val }
                            });
                        }}
                        onBack={() => updateState({ step: 1 })}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Category, BudgetWithSpending, Budget, RecurringTemplate } from '../../types';
import { Step1Strategy } from './Step1Strategy';
import { Step2Architect } from './Step2Architect';
import { WizardState } from './types';
import { budgetService } from '../../api/services/budgetService';
import { recurringExpenseService } from '../../api/services/recurringExpenseService';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { useScope } from '../../context/ScopeContext';

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
  const { summary, refresh } = useScope();
  
  const [state, setState] = useState<WizardState>({
    step: 1,
    income: 45000, // Default start value (will be updated from couple data)
    userIncome: 0,
    partnerIncome: 0,
    selectedStrategy: 'balanced',
    fixedExpenses: {},
    variableAllocations: {}
  });

  const [recurringTemplates, setRecurringTemplates] = useState<RecurringTemplate[]>([]);

  // Initialize incomes from couple summary when available
  useEffect(() => {
    if (summary?.couple) {
      const userIncome = summary.couple.user?.monthly_net_income || 0;
      const partnerIncome = summary.couple.partner?.monthly_net_income || 0;
      const combined = userIncome + partnerIncome;
      
      setState(prev => ({
        ...prev,
        userIncome,
        partnerIncome,
        income: combined > 0 ? combined : prev.income
      }));
    }
  }, [summary]);

  // Refresh couple data when wizard opens to get latest income values
  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

  // Reset wizard step on open
  React.useEffect(() => {
    if (!isOpen) return;
    setState(prev => ({
      ...prev,
      step: 1
    }));
  }, [isOpen]);

  // Seed from previous month's budgets for "memory" behaviour
  React.useEffect(() => {
    if (!isOpen || !categories.length) return;

    const loadPreviousBudgets = async () => {
      try {
        // Compute previous month/year
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth <= 0) {
          prevMonth = 12;
          prevYear = year - 1;
        }

        const previousBudgets = (await budgetService.getBudgets(
          prevMonth,
          prevYear
        )) as unknown as Budget[];

        if (!previousBudgets || !previousBudgets.length) {
          // Nothing to seed from
          return;
        }

        const categoryMap = new Map<number, Category>();
        categories.forEach(c => categoryMap.set(c.id, c));

        const fixed: Record<number, number> = {};
        const variable: Record<number, number> = {};

        previousBudgets.forEach(b => {
          const cat = categoryMap.get(b.category_id);
          if (!cat) return;
          const amountNum = typeof b.amount === 'number' ? b.amount : Number(b.amount || 0);
          if (!amountNum || amountNum <= 0) return;

          if (cat.is_fixed) {
            fixed[b.category_id] = Math.round(amountNum);
          } else {
            variable[b.category_id] = Math.round(amountNum);
          }
        });

        // If everything was zero or unmapped, don't override
        if (
          Object.keys(fixed).length === 0 &&
          Object.keys(variable).length === 0
        ) {
          return;
        }

        // Seed wizard state; Step2 will treat non-empty variableAllocations
        // as "user edited" and won't auto-override them.
        //
        // IMPORTANT: For fixed expenses, put seeded values FIRST so that
        // bill-managed defaults (which come from recurring templates overlay)
        // take precedence. For variable, merge normally.
        setState(prev => ({
          ...prev,
          fixedExpenses: { ...fixed, ...prev.fixedExpenses },
          variableAllocations: { ...prev.variableAllocations, ...variable }
        }));
      } catch (error) {
        console.error('Failed to seed Smart Budget wizard from previous budgets:', error);
      }
    };

    void loadPreviousBudgets();
  }, [isOpen, month, year, categories]);

  // Load recurring templates when wizard opens (used to identify bill-managed categories)
  useEffect(() => {
    if (!isOpen) return;

    const loadTemplates = async () => {
      try {
        const templates = await recurringExpenseService.getTemplates();
        setRecurringTemplates(templates);
      } catch (error) {
        console.error('Failed to load recurring templates for Smart Budget wizard:', error);
      }
    };

    void loadTemplates();
  }, [isOpen]);

  // Overlay bill-managed template amounts into fixedExpenses so bills are always in sync
  useEffect(() => {
    if (!isOpen || recurringTemplates.length === 0) return;

    const billDefaults: Record<number, number> = {};
    recurringTemplates
      .filter((t) => t.bill_managed)
      .forEach((t) => {
        const amountNum =
          typeof t.default_amount === 'number'
            ? t.default_amount
            : Number(t.default_amount || 0);
        if (amountNum > 0) {
          billDefaults[t.category_id] = Math.round(amountNum);
        }
      });

    if (Object.keys(billDefaults).length === 0) return;

    setState((prev) => ({
      ...prev,
      fixedExpenses: {
        ...prev.fixedExpenses,
        ...billDefaults,
      },
    }));
  }, [isOpen, recurringTemplates]);

  const handleSave = async () => {
    try {
      const promises = [];

      const billCategoryIds = new Set(
        recurringTemplates
          .filter((t) => t.bill_managed)
          .map((t) => t.category_id)
      );
      
      // Save Fixed Expenses (skip bill-managed categories; those are handled as recurring bills)
      for (const [catIdStr, amount] of Object.entries(state.fixedExpenses)) {
        const catId = parseInt(catIdStr, 10);
        if (amount > 0 && !billCategoryIds.has(catId)) {
          promises.push(budgetService.createOrUpdateBudget({
            category_id: catId,
            amount,
            month,
            year
          }));
        }
      }

      // Save Variable Allocations (these are the true budgets for "what's left")
      for (const [catIdStr, amount] of Object.entries(state.variableAllocations)) {
        const catId = parseInt(catIdStr, 10);
        if (amount > 0) {
          promises.push(budgetService.createOrUpdateBudget({
            category_id: catId,
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
                        userIncome={state.userIncome}
                        partnerIncome={state.partnerIncome}
                        setUserIncome={(val) => updateState({ userIncome: val, income: val + state.partnerIncome })}
                        setPartnerIncome={(val) => updateState({ partnerIncome: val, income: state.userIncome + val })}
                        userName={summary?.couple?.user?.name || 'You'}
                        partnerName={summary?.couple?.partner?.name || 'Partner'}
                        hasPartner={summary?.couple?.connected || false}
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
                        billCategoryIds={recurringTemplates.filter(t => t.bill_managed).map(t => t.category_id)}
                        updateFixed={(catId, val) => {
                            setState(prev => ({
                                ...prev,
                                fixedExpenses: { ...prev.fixedExpenses, [catId]: val }
                            }));
                        }}
                        updateVariable={(catId, val) => {
                            setState(prev => ({
                                ...prev,
                                variableAllocations: { ...prev.variableAllocations, [catId]: val }
                            }));
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

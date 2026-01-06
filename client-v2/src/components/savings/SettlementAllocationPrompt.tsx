import { useState, useEffect } from 'react';
import { savingsService } from '@/api/services/savingsService';
import { SavingsGoal } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PiggyBank, Loader2, ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface SettlementAllocationPromptProps {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
  onAllocated: () => void;
}

export function SettlementAllocationPrompt({
  isOpen,
  amount,
  onClose,
  onAllocated,
}: SettlementAllocationPromptProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadGoals();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const fetchedGoals = await savingsService.getGoals();
      setGoals(fetchedGoals.filter(g => (g.target_amount || 0) > (g.current_amount || 0)));
    } catch (error) {
      console.error('Failed to load savings goals:', error);
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (goal: SavingsGoal) => {
    try {
      setSubmitting(true);
      await savingsService.addContribution(goal.id, {
        amount,
        date: new Date().toISOString().split('T')[0],
        note: 'Settlement allocation',
      });
      toast.success(`${formatCurrency(amount)} allocated to ${goal.name}`);
      onAllocated();
      onClose();
    } catch (error) {
      console.error('Failed to allocate to savings goal:', error);
      toast.error('Failed to allocate to savings goal');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settlement-dialog-title"
    >
      <Card className="w-full max-w-md mx-4 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="settlement-dialog-title" className="text-lg font-semibold">Allocate to Savings</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <CardContent className="p-4 space-y-4">
          <p className="text-muted-foreground">
            Settlement complete! Would you like to allocate the{' '}
            <span className="font-semibold text-foreground">
              {formatCurrency(amount)}
            </span>{' '}
            to one of your savings goals?
          </p>

          {loading ? (
            <div className="space-y-3" data-testid="loading-skeleton" role="status" aria-label="Loading savings goals">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-6 border rounded-lg bg-muted/30">
              <PiggyBank className="h-8 w-8 mx-auto text-muted-foreground mb-2" aria-hidden="true" />
              <p className="text-muted-foreground text-sm">
                No savings goals yet. Create one to start saving!
              </p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => {
                  onClose();
                }}
              >
                Go to Savings
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto" role="listbox" aria-label="Savings goals">
              {goals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => !submitting && handleAllocate(goal)}
                  disabled={submitting}
                  role="option"
                  aria-selected={submitting}
                  className="w-full p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {goal.name}
                    </span>
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(goal.current_amount || 0)} / {formatCurrency(goal.target_amount || 0)}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={submitting}
            >
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

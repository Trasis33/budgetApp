import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { savingsService, Contribution } from '@/api/services/savingsService';
import { SavingsGoal } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, PiggyBank, Trash2 } from 'lucide-react';
import { DualProgressRings } from './DualProgressRings';
import { AddContributionForm } from './AddContributionForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { differenceInDays, parseISO } from 'date-fns';

function calculatePaceIndicator(
  amountProgress: number,
  timeProgress: number
): { label: string; colorClass: string } {
  const tolerance = 5;

  if (timeProgress <= 0) {
    return { label: 'Not Started', colorClass: 'text-muted-foreground' };
  }

  if (isNaN(amountProgress) || isNaN(timeProgress)) {
    return { label: 'On Track', colorClass: 'text-muted-foreground' };
  }

  if (amountProgress >= timeProgress + tolerance) {
    return { label: 'Ahead', colorClass: 'text-emerald-500' };
  }

  if (amountProgress + tolerance <= timeProgress) {
    return { label: 'Behind', colorClass: 'text-amber-500' };
  }

  return { label: 'On Track', colorClass: 'text-primary' };
}

export function SavingsGoalDetailPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contributionToDelete, setContributionToDelete] = useState<Contribution | null>(null);

  const fetchData = useCallback(async () => {
    if (!goalId) return;
    
    setLoading(true);
    try {
      const goals = await savingsService.getGoals();
      const targetGoal = goals.find(g => g.id === parseInt(goalId));
      
      if (targetGoal) {
        setGoal(targetGoal);
        const contribs = await savingsService.getContributions(targetGoal.id);
        setContributions(contribs);
      } else {
        setGoal(null);
      }
    } catch (error) {
      console.error('Failed to fetch goal details:', error);
      toast.error('Failed to load goal details');
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddContribution = async (data: { amount: number; date: string; note: string }) => {
    if (!goal) return;

    try {
      await savingsService.addContribution(goal.id, data);
      toast.success('Contribution added successfully');
      setIsAddModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to add contribution:', error);
      toast.error('Failed to add contribution');
    }
  };

  const handleDeleteContribution = async () => {
    if (!contributionToDelete) return;

    setIsDeleting(true);
    try {
      await savingsService.deleteContribution(contributionToDelete.id);
      toast.success('Contribution deleted');
      setContributionToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete contribution:', error);
      toast.error('Failed to delete contribution');
    } finally {
      setIsDeleting(false);
    }
  };

  const goalCalculations = useMemo(() => {
    if (!goal) return null;

    const amountProgress = goal.target_amount > 0 
      ? (goal.current_amount / goal.target_amount) * 100 
      : 0;

    let daysRemaining = 0;
    let totalDays = 0;
    let timeProgress = 0;

    if (goal.created_at && goal.target_date) {
      const startDate = parseISO(goal.created_at);
      const endDate = parseISO(goal.target_date);
      const today = new Date();

      totalDays = differenceInDays(endDate, startDate);
      const daysElapsed = differenceInDays(today, startDate);
      daysRemaining = differenceInDays(endDate, today);

      if (totalDays > 0) {
        timeProgress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
      }
    }

    const pace = calculatePaceIndicator(amountProgress, timeProgress);

    return {
      amountProgress,
      timeProgress,
      daysRemaining,
      totalDays,
      pace,
      percentage: Math.round(amountProgress),
      remaining: goal.target_amount - goal.current_amount
    };
  }, [goal]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="rounded-xl border border-border p-8">
           <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!goal || !goalCalculations) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Goal not found</h2>
        <p className="text-muted-foreground mb-6">The savings goal you are looking for does not exist.</p>
        <Button onClick={() => navigate('/savings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Savings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/savings')} className="rounded-full" aria-label="Back to Savings">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{goal.name}</h1>
          <p className="text-muted-foreground">{goal.category_name || 'General Savings'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <DualProgressRings 
                amountProgress={goalCalculations.amountProgress}
                timeProgress={goalCalculations.timeProgress}
                size={180}
                strokeWidth={12}
              />
              
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Current</p>
                    <p className="text-2xl font-bold">{formatCurrency(goal.current_amount)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Target</p>
                    <p className="text-2xl font-bold">{formatCurrency(goal.target_amount)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Days Left</p>
                    <p className="text-lg font-medium">{goalCalculations.daysRemaining} days remaining</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Progress</p>
                    <p className="text-lg font-medium">{goalCalculations.percentage}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Contribution History</h2>
              <Button size="sm" className="gap-2" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Contribution
              </Button>
            </div>
            
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {contributions.length === 0 ? (
                <div className="p-12 text-center">
                  <PiggyBank className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No contributions yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {contributions.map((c) => (
                    <div key={c.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{formatCurrency(c.amount)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(c.date)}</p>
                        {c.note && <p className="text-xs text-muted-foreground mt-1 italic">"{c.note}"</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setContributionToDelete(c)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-4">
            <h3 className="font-semibold">Goal Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${goalCalculations.pace.colorClass}`}>
                  {goalCalculations.pace.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">{formatCurrency(goalCalculations.remaining)}</span>
              </div>
              {goalCalculations.totalDays > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Progress</span>
                  <span className="font-medium">{Math.round(goalCalculations.timeProgress)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddContributionForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddContribution}
        goalName={goal.name}
      />

      <AlertDialog open={!!contributionToDelete} onOpenChange={() => setContributionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contribution</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contribution of {contributionToDelete && formatCurrency(contributionToDelete.amount)}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContributionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContribution} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

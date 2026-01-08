import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { savingsService, Contribution } from '@/api/services/savingsService';
import { SavingsGoal } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, PiggyBank, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
import { cn } from '@/lib/utils';

function calculatePaceIndicator(
  amountProgress: number,
  timeProgress: number
): { label: string; colorClass: string; icon: typeof TrendingUp } {
  const tolerance = 5;

  if (timeProgress <= 0) {
    return { label: 'Not Started', colorClass: 'text-muted-foreground', icon: Minus };
  }

  if (isNaN(amountProgress) || isNaN(timeProgress)) {
    return { label: 'On Track', colorClass: 'text-muted-foreground', icon: Minus };
  }

  if (amountProgress >= timeProgress + tolerance) {
    return { label: 'Ahead', colorClass: 'text-[oklch(var(--theme-teal))]', icon: TrendingUp };
  }

  if (amountProgress + tolerance <= timeProgress) {
    return { label: 'Behind', colorClass: 'text-[oklch(var(--theme-amber))]', icon: TrendingDown };
  }

  return { label: 'On Track', colorClass: 'text-foreground', icon: Minus };
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
      <div className="space-y-8 animate-in fade-in duration-300">
        <Skeleton className="h-8 w-32" />
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
           <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!goal || !goalCalculations) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-300">
        <h2 className="font-display text-3xl font-semibold text-foreground mb-3">
          Goal not found
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The savings goal you are looking for does not exist or may have been deleted.
        </p>
        <Button
          onClick={() => navigate('/savings')}
          className="gap-2"
          style={{
            background: 'oklch(var(--theme-teal))',
            color: 'white',
          }}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          <span className="font-medium">Back to Savings</span>
        </Button>
      </div>
    );
  }

  const PaceIcon = goalCalculations.pace.icon;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/savings')}
          className="rounded-xl hover:bg-muted/80 transition-colors"
          aria-label="Back to Savings"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {goal.name}
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            {goal.category_name || 'General Savings'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Main content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Hero: Progress visualization */}
          <div className="rounded-2xl border border-border/60 bg-card p-10 shadow-sm">
            <div className="flex flex-col items-center gap-8">
              {/* Large dual progress rings */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[oklch(var(--theme-teal)/0.1)] to-[oklch(var(--theme-amber)/0.05)] rounded-full blur-3xl" />
                <DualProgressRings
                  amountProgress={goalCalculations.amountProgress}
                  timeProgress={goalCalculations.timeProgress}
                  size={220}
                  strokeWidth={14}
                  className="relative"
                />
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                {/* Current amount */}
                <div className="text-center space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Saved
                  </p>
                  <p className="font-display text-3xl font-semibold tabular-nums text-foreground">
                    {formatCurrency(goal.current_amount)}
                  </p>
                </div>

                {/* Target amount */}
                <div className="text-center space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Target
                  </p>
                  <p className="font-display text-3xl font-semibold tabular-nums text-foreground">
                    {formatCurrency(goal.target_amount)}
                  </p>
                </div>

                {/* Percentage */}
                <div className="text-center space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Progress
                  </p>
                  <p className="font-display text-3xl font-semibold tabular-nums text-foreground">
                    {goalCalculations.percentage}%
                  </p>
                </div>

                {/* Days remaining */}
                <div className="text-center space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Days Left
                  </p>
                  <p className="font-display text-3xl font-semibold tabular-nums text-foreground">
                    {goalCalculations.daysRemaining}
                  </p>
                </div>
              </div>

              {/* Pace indicator badge */}
              <div
                className={cn(
                  "inline-flex items-center gap-2.5 px-5 py-3 rounded-full border shadow-sm",
                  goalCalculations.pace.label === 'Ahead' && "bg-[oklch(var(--theme-teal)/0.08)] border-[oklch(var(--theme-teal)/0.2)]",
                  goalCalculations.pace.label === 'Behind' && "bg-[oklch(var(--theme-amber)/0.08)] border-[oklch(var(--theme-amber)/0.2)]",
                  goalCalculations.pace.label === 'On Track' && "bg-muted/50 border-border/60",
                  goalCalculations.pace.label === 'Not Started' && "bg-muted/50 border-border/60"
                )}
              >
                <PaceIcon className={cn("h-5 w-5", goalCalculations.pace.colorClass)} strokeWidth={2} />
                <span className={cn("font-display text-lg font-semibold", goalCalculations.pace.colorClass)}>
                  {goalCalculations.pace.label}
                </span>
              </div>
            </div>
          </div>

          {/* Contribution history */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Contribution History
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Track your savings journey over time
                </p>
              </div>
              <Button
                size="default"
                className="gap-2 shadow-sm hover:shadow transition-shadow"
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  background: 'oklch(var(--theme-teal))',
                  color: 'white',
                }}
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                <span className="font-medium">Add Contribution</span>
              </Button>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
              {contributions.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-5">
                    <PiggyBank className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    No contributions yet
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                    Start saving toward your goal by adding your first contribution.
                  </p>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Add First Contribution
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {contributions.map((c, index) => (
                    <div
                      key={c.id}
                      className="group p-5 flex items-center justify-between hover:bg-muted/30 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-[oklch(var(--theme-teal)/0.1)] flex items-center justify-center">
                          <Plus className="h-5 w-5 text-[oklch(var(--theme-teal))]" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="font-display text-lg font-semibold tabular-nums text-foreground">
                            {formatCurrency(c.amount)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-sm text-muted-foreground tabular-nums">
                              {formatDate(c.date)}
                            </p>
                            {c.note && (
                              <>
                                <span className="text-muted-foreground/40">•</span>
                                <p className="text-sm text-muted-foreground italic line-clamp-1 max-w-xs">
                                  "{c.note}"
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setContributionToDelete(c)}
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                        aria-label="Delete contribution"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Goal summary card */}
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-card p-6 shadow-sm sticky top-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-5">
              Goal Summary
            </h3>

            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={cn("font-display font-semibold text-base flex items-center gap-2", goalCalculations.pace.colorClass)}>
                  <PaceIcon className="h-4 w-4" strokeWidth={2} />
                  {goalCalculations.pace.label}
                </span>
              </div>

              {/* Remaining */}
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <span className="font-display font-semibold text-base tabular-nums text-foreground">
                  {formatCurrency(goalCalculations.remaining)}
                </span>
              </div>

              {/* Time progress */}
              {goalCalculations.totalDays > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Time Progress</span>
                  <span className="font-display font-semibold text-base tabular-nums text-foreground">
                    {Math.round(goalCalculations.timeProgress)}%
                  </span>
                </div>
              )}

              {/* Total days */}
              {goalCalculations.totalDays > 0 && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-display font-semibold text-base tabular-nums text-foreground">
                    {goalCalculations.totalDays} days
                  </span>
                </div>
              )}
            </div>

            {/* Action button */}
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full mt-6 gap-2 shadow-sm hover:shadow transition-shadow"
              style={{
                background: 'oklch(var(--theme-teal))',
                color: 'white',
              }}
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              <span className="font-medium">Add Funds</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Add contribution modal */}
      <AddContributionForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddContribution}
        goalName={goal.name}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!contributionToDelete} onOpenChange={() => setContributionToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl font-semibold">
              Delete Contribution
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete this contribution of{' '}
              <span className="font-semibold text-foreground">
                {contributionToDelete && formatCurrency(contributionToDelete.amount)}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              onClick={() => setContributionToDelete(null)}
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContribution}
              disabled={isDeleting}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

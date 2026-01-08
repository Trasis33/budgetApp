import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScope } from '../context/ScopeContext';
import { savingsService } from '../api/services/savingsService';
import { Button } from './ui/button';
import { Plus, PiggyBank } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';
import { GoalCard } from './savings/GoalCard';
import { GoalFormModal } from './savings/GoalFormModal';
import { toast } from 'sonner';
import type { SavingsGoal } from '../types';
import { cn } from '@/lib/utils';

export function SavingsGoalsPage() {
  const navigate = useNavigate();
  const { currentScope, setScope, isPartnerConnected } = useScope();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | undefined>(undefined);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await savingsService.getGoals(currentScope);
      setGoals(data);
    } catch (error) {
      console.error('Failed to fetch savings goals:', error);
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  }, [currentScope]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleOpenCreateModal = () => {
    setSelectedGoal(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedGoal(undefined);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedGoal) {
        await savingsService.updateGoal(selectedGoal.id, data);
        toast.success('Goal updated successfully');
      } else {
        await savingsService.createGoal({
          ...data,
          current_amount: 0,
        });
        toast.success('Goal created successfully');
      }
      handleModalClose();
      fetchGoals();
    } catch (error) {
      console.error('Failed to save goal:', error);
      toast.error('Failed to save goal');
    }
  };

  const handleDeleteGoal = async (goal: SavingsGoal) => {
    if (!window.confirm(`Are you sure you want to delete "${goal.name}"?`)) return;

    try {
      await savingsService.deleteGoal(goal.id);
      toast.success('Goal deleted');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handlePinGoal = async (goal: SavingsGoal) => {
    try {
      await savingsService.updateGoal(goal.id, { is_pinned: !goal.is_pinned });
      fetchGoals();
    } catch (error) {
      toast.error('Failed to pin goal');
    }
  };

  const handleQuickAddContribution = async (goalId: number, amount: number) => {
    try {
      await savingsService.addContribution(goalId, {
        amount,
        date: new Date().toISOString().split('T')[0],
      });
      toast.success('Contribution added');
      fetchGoals();
    } catch (error) {
      console.error('Failed to add contribution:', error);
      toast.error('Failed to add contribution');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(var(--theme-teal)/0.12)] to-[oklch(var(--theme-teal)/0.04)] shadow-sm">
            <PiggyBank className="h-7 w-7 text-[oklch(var(--theme-teal))]" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Savings Goals
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Track progress toward your financial dreams together
            </p>
          </div>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="gap-2 shadow-sm hover:shadow transition-shadow"
          style={{
            background: 'oklch(var(--theme-teal))',
            color: 'white',
          }}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          <span className="font-medium">Add Goal</span>
        </Button>
      </div>

      {/* Scope Tabs */}
      <div className="flex items-center justify-between">
        <Tabs
          value={currentScope}
          onValueChange={(value) => setScope(value as any)}
          className="w-auto"
        >
          <TabsList className="bg-muted/50 p-1.5 gap-1.5 rounded-xl border border-border/40">
            <TabsTrigger
              value="mine"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium px-5"
            >
              Mine
            </TabsTrigger>
            <TabsTrigger
              value="partner"
              disabled={!isPartnerConnected}
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium px-5"
            >
              Partner's
            </TabsTrigger>
            <TabsTrigger
              value="ours"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium px-5"
            >
              Ours
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex justify-center py-4">
                <Skeleton className="h-32 w-32 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(var(--theme-teal)/0.2)] to-[oklch(var(--theme-teal)/0.05)] rounded-full blur-3xl" />
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-[oklch(var(--theme-teal)/0.15)] to-[oklch(var(--theme-teal)/0.05)] border border-[oklch(var(--theme-teal)/0.2)] flex items-center justify-center">
              <PiggyBank className="h-10 w-10 text-[oklch(var(--theme-teal))]" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
            No savings goals yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
            Create your first savings goal and start tracking progress toward what matters most to you both.
          </p>
          <Button
            onClick={handleOpenCreateModal}
            className="gap-2 shadow-lg hover:shadow-xl transition-all shadow-[oklch(var(--theme-teal)/0.2)] hover:shadow-[oklch(var(--theme-teal)/0.3)]"
            style={{
              background: 'oklch(var(--theme-teal))',
              color: 'white',
            }}
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span className="font-medium">Create Your First Goal</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => (
            <div
              key={goal.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <GoalCard
                goal={goal}
                onClick={() => navigate(`/savings/${goal.id}`)}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteGoal}
                onPin={handlePinGoal}
                onQuickAddContribution={handleQuickAddContribution}
              />
            </div>
          ))}
        </div>
      )}

      <GoalFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
        goal={selectedGoal}
      />
    </div>
  );
}

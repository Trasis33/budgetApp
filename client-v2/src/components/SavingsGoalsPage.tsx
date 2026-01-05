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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground">
            Track and manage your savings goals.
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenCreateModal}>
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Tabs 
          value={currentScope} 
          onValueChange={(value) => setScope(value as any)}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="mine">Mine</TabsTrigger>
            <TabsTrigger value="partner" disabled={!isPartnerConnected}>Partner's</TabsTrigger>
            <TabsTrigger value="ours">Ours</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-6 space-y-4">
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
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/50">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <PiggyBank className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No savings goals yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            Create your first savings goal to start tracking your progress.
          </p>
          <Button variant="outline" className="gap-2" onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4" />
            Create First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard 
              key={goal.id} 
              goal={goal}
              onClick={() => navigate(`/savings/${goal.id}`)}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteGoal}
              onPin={handlePinGoal}
              onQuickAddContribution={handleQuickAddContribution}
            />
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

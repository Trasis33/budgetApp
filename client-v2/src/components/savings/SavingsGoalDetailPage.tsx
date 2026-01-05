import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { savingsService, Contribution } from '@/api/services/savingsService';
import { SavingsGoal } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, PiggyBank } from 'lucide-react';
import { DualProgressRings } from './DualProgressRings';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function SavingsGoalDetailPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!goalId) return;
    
    setLoading(true);
    try {
      // For now, since we don't have getGoalById, we fetch all and filter
      // In a real app, adding getGoalById(id) to the service would be better
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

  if (!goal) {
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/savings')} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{goal.name}</h1>
          <p className="text-muted-foreground">{goal.category_name || 'General Savings'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <DualProgressRings 
                amountProgress={(goal.current_amount / goal.target_amount) * 100}
                timeProgress={0} // To be implemented with date logic
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

                {goal.target_date && (
                  <div className="space-y-1 pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Target Date</p>
                    <p className="text-lg font-medium">{formatDate(goal.target_date)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contribution History placeholder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Contribution History</h2>
              <Button size="sm" className="gap-2">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar info placeholder */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-4">
            <h3 className="font-semibold">Goal Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">On Track</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">{formatCurrency(goal.target_amount - goal.current_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

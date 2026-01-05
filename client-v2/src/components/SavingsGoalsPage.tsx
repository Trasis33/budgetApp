import { useState, useEffect } from 'react';
import { useScope } from '../context/ScopeContext';
import { savingsService } from '../api/services/savingsService';
import { Button } from './ui/button';
import { Plus, PiggyBank, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import type { SavingsGoal } from '../types';

export function SavingsGoalsPage() {
  const { currentScope, setScope, isPartnerConnected } = useScope();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      try {
        const data = await savingsService.getGoals(currentScope);
        setGoals(data);
      } catch (error) {
        console.error('Failed to fetch savings goals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [currentScope]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground">
            Track and manage your savings goals.
          </p>
        </div>
        <Button className="gap-2">
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
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading goals...</p>
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
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Goal cards will go here */}
          <p>Goal cards coming soon...</p>
        </div>
      )}
    </div>
  );
}

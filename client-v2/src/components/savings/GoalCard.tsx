import React from 'react';
import { SavingsGoal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { DualProgressRings } from './DualProgressRings';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Pin } from 'lucide-react';

interface GoalCardProps {
  goal: SavingsGoal;
  className?: string;
  onClick?: () => void;
}

export function GoalCard({ goal, className, onClick }: GoalCardProps) {
  // Calculate Amount Progress
  const amountProgress = goal.target_amount > 0 
    ? (goal.current_amount / goal.target_amount) * 100 
    : 0;

  // Calculate Time Progress
  let timeProgress = 0;
  if (goal.target_date && goal.created_at) {
    const start = new Date(goal.created_at).getTime();
    const end = new Date(goal.target_date).getTime();
    const now = new Date().getTime();
    
    if (end > start) {
      const totalDuration = end - start;
      const elapsed = now - start;
      timeProgress = (elapsed / totalDuration) * 100;
    }
  }

  // Fallback for time progress if created_at is missing but target_date exists
  // If we don't know start, maybe we assume 0%? Or maybe we can't show it.
  // For now, if created_at is missing, timeProgress stays 0.

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-md cursor-pointer group", 
        className
      )}
      onClick={onClick}
    >
      {/* Pin Indicator */}
      {goal.is_pinned && (
        <div className="absolute top-3 right-3 text-muted-foreground transform rotate-45">
          <Pin className="h-4 w-4 fill-current" />
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Main Info */}
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold leading-none tracking-tight truncate pr-6">
              {goal.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {goal.category_name || 'General Savings'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          {/* Progress Rings */}
          <div className="flex-shrink-0">
            <DualProgressRings 
              amountProgress={amountProgress} 
              timeProgress={timeProgress}
              size={100}
              strokeWidth={8}
            />
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-4 text-right">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Saved</p>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-xl font-bold tabular-nums text-foreground">
                  {formatCurrency(goal.current_amount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                of {formatCurrency(goal.target_amount)}
              </p>
            </div>

            {goal.target_date && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Goal Date</p>
                <p className="text-sm font-medium">
                  {formatDate(goal.target_date)}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useMemo } from 'react';
import { SavingsGoal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DualProgressRings } from './DualProgressRings';
import { QuickAddContribution } from './QuickAddContribution';
import { PaceBadge } from './PaceBadge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { calculateTimeProgress } from '@/lib/savingsCalculations';
import { Pin, MoreVertical, Pencil, Trash2, PinOff } from 'lucide-react';

interface GoalCardProps {
  goal: SavingsGoal;
  className?: string;
  onClick?: () => void;
  onEdit?: (goal: SavingsGoal) => void;
  onDelete?: (goal: SavingsGoal) => void;
  onPin?: (goal: SavingsGoal) => void;
  onQuickAddContribution?: (goalId: number, amount: number) => void;
}

export const GoalCard = React.memo(function GoalCard({
  goal,
  className,
  onClick,
  onEdit,
  onDelete,
  onPin,
  onQuickAddContribution
}: GoalCardProps) {
  const amountProgress = goal.target_amount > 0
    ? (goal.current_amount / goal.target_amount) * 100
    : 0;

  const timeProgress = useMemo(() =>
    calculateTimeProgress(goal.created_at, goal.target_date),
    [goal.created_at, goal.target_date]
  );

  const handleAction = (callback?: (goal: SavingsGoal) => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    callback?.(goal);
  };

  const handleQuickAdd = (amount: number) => {
    if (onQuickAddContribution) {
      onQuickAddContribution(goal.id, amount);
    }
  };

  const cardStyle = goal.is_pinned
    ? {
        background: 'linear-gradient(180deg, oklch(var(--theme-gold) / 0.18) 0%, oklch(var(--theme-gold) / 0.08) 40%, transparent 75%)',
        boxShadow: '0 0 0 1px oklch(var(--theme-gold) / 0.2), 0 4px 12px oklch(var(--theme-gold) / 0.1)',
        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    : {
        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
      };

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-[28px] transition-all duration-300 hover:shadow-lg cursor-pointer group border",
        goal.is_pinned && "border-[oklch(var(--theme-gold))]",
        "animate-in fade-in slide-in-from-bottom-4 duration-500",
        className
      )}
      onClick={onClick}
      style={cardStyle}
    >
      <CardContent className="p-6">
        {/* Pin Badge */}
        {/* Action Buttons (Top Right) */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {goal.is_pinned && (
            <div className="w-7 h-7 rounded-full bg-[oklch(var(--theme-gold))] flex items-center justify-center text-white shadow-lg">
              <Pin className="h-3.5 w-3.5 fill-current" />
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-black/5 data-[state=open]:bg-black/5"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={handleAction(onEdit)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAction(onPin)}>
                {goal.is_pinned ? (
                  <>
                    <PinOff className="mr-2 h-4 w-4" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 h-4 w-4" />
                    Pin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleAction(onDelete)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header with Rings and Info */}
        <div className="flex items-start gap-5 mb-4">
          {/* Progress Rings */}
          <div className="flex-shrink-0">
            <DualProgressRings
              amountProgress={amountProgress}
              timeProgress={timeProgress}
              size={100}
              strokeWidth={8}
              showLegend={false}
            />
          </div>

          {/* Goal Info */}
          <div className="flex-1 min-w-0">
            {/* Category Badge */}
            {goal.category_name && (
              <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[oklch(var(--theme-teal))] bg-[oklch(var(--theme-teal)/0.12)] px-2 py-1 rounded-md mb-2">
                <span className="h-3 w-3" />
                {goal.category_name}
              </div>
            )}

            {/* Goal Name */}
            <h3 className="text-xl font-semibold leading-tight mb-2">
              {goal.name}
            </h3>

            {/* Amounts */}
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-foreground">
                {formatCurrency(goal.current_amount)}
              </span>
              <span className="text-sm text-muted-foreground">
                of {formatCurrency(goal.target_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Ring Legend */}
        <div className="flex items-center justify-center gap-5 py-3 border-y border-[var(--border)] mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full bg-theme-teal" />
            <span className="font-medium">Amount: {Math.round(amountProgress)}%</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full bg-theme-coral" />
            <span className="font-medium">Time: {Math.round(timeProgress)}%</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Target Date */}
          {goal.target_date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-4 w-4 opacity-60" />
              <span>Target: {formatDate(goal.target_date)}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <PaceBadge
              amountProgress={amountProgress}
              timeProgress={timeProgress}
            />
            <QuickAddContribution
              onSubmit={handleQuickAdd}
            />

          </div>
        </div>
      </CardContent>
    </Card>
  );
});

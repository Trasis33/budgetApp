import React from 'react';
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
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Pin, MoreVertical, Pencil, Trash2, PinOff } from 'lucide-react';
import { getIconByName } from '@/lib/categoryIcons';
import { CATEGORY_COLORS } from '@/lib/categoryColors';

// Helper to get color from SavingsGoal color_index
function getSavingsGoalColor(goal: SavingsGoal): string {
  if (goal.color_index !== undefined && goal.color_index >= 0 && goal.color_index < CATEGORY_COLORS.length) {
    return CATEGORY_COLORS[goal.color_index].value;
  }
  return CATEGORY_COLORS[0].value; // Default to first color
}

interface GoalCardProps {
  goal: SavingsGoal;
  className?: string;
  onClick?: () => void;
  onEdit?: (goal: SavingsGoal) => void;
  onDelete?: (goal: SavingsGoal) => void;
  onPin?: (goal: SavingsGoal) => void;
  onQuickAddContribution?: (goalId: number, amount: number) => void;
}

export function GoalCard({
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

  const handleAction = (callback?: (goal: SavingsGoal) => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    callback?.(goal);
  };

  const handleQuickAdd = (amount: number) => {
    if (onQuickAddContribution) {
      onQuickAddContribution(goal.id, amount);
    }
  };

  // Get category icon and color
  const categoryColor = getSavingsGoalColor(goal);
  const IconComponent = goal.category_name ? getIconByName(goal.category_name) : null;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 cursor-pointer group border-border/60",
        "hover:border-[oklch(var(--theme-teal)/0.3)] hover:shadow-md",
        !!goal.is_pinned && "border-[oklch(var(--theme-gold)/0.4)] bg-gradient-to-br from-[oklch(var(--theme-gold)/0.08)] via-card to-card",
        className
      )}
      onClick={onClick}
    >
      {/* Pinned badge */}
      {!!goal.is_pinned && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[oklch(var(--theme-gold)/0.6)] via-[oklch(var(--theme-gold)/0.8)] to-[oklch(var(--theme-gold)/0.6)]" />
      )}

      <CardContent className="p-6">
        {/* Header with category and actions */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {IconComponent && (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors"
                style={{
                  backgroundColor: `oklch(from ${categoryColor} l c h / 0.12)`,
                  borderColor: `oklch(from ${categoryColor} l c h / 0.2)`,
                }}
              >
                <IconComponent
                  className="h-5 w-5"
                  style={{ color: categoryColor }}
                  strokeWidth={1.5}
                />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-0.5">
              <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground truncate">
                {goal.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {goal.category_name || 'General Savings'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <QuickAddContribution onSubmit={handleQuickAdd} />

            {!!goal.is_pinned && (
              <Pin
                className="h-4 w-4 text-[oklch(var(--theme-gold))] rotate-45"
                strokeWidth={2}
                aria-label="Pinned goal"
              />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-muted/80 transition-colors"
                  aria-label="Goal actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" strokeWidth={2} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={handleAction(onEdit)} className="gap-2">
                  <Pencil className="h-4 w-4" strokeWidth={2} />
                  <span>Edit Goal</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAction(onPin)} className="gap-2">
                  {!!goal.is_pinned ? (
                    <>
                      <PinOff className="h-4 w-4" strokeWidth={2} />
                      <span>Unpin</span>
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4" strokeWidth={2} />
                      <span>Pin Goal</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleAction(onDelete)}
                  className="text-destructive focus:text-destructive gap-2"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress visualization */}
        <div className="flex items-center justify-between gap-5">
          <div className="flex-shrink-0">
            <DualProgressRings
              amountProgress={amountProgress}
              timeProgress={timeProgress}
              size={96}
              strokeWidth={7}
            />
          </div>

          <div className="flex-1 space-y-4 text-right">
            {/* Amount */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Saved
              </p>
              <div className="flex items-baseline justify-end gap-1">
                <span className="font-display text-2xl font-semibold tabular-nums text-foreground">
                  {formatCurrency(goal.current_amount)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                of {formatCurrency(goal.target_amount)}
              </p>
            </div>

            {/* Target date */}
            {goal.target_date && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Target Date
                </p>
                <p className="text-sm font-medium text-foreground tabular-nums">
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

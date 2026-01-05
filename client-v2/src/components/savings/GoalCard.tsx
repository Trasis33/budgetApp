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

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-md cursor-pointer group", 
        className
      )}
      onClick={onClick}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
         {goal.is_pinned && (
           <Pin className="h-4 w-4 fill-current text-primary mr-2 rotate-45" />
         )}

         <QuickAddContribution
           onSubmit={handleQuickAdd}
         />

         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button 
               variant="ghost" 
               size="icon" 
               className="h-8 w-8 rounded-full hover:bg-muted"
               aria-label="Goal actions"
               onClick={(e) => e.stopPropagation()}
             >
               <MoreVertical className="h-4 w-4" />
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

      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold leading-none tracking-tight truncate pr-24">
              {goal.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate pr-16">
              {goal.category_name || 'General Savings'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <DualProgressRings 
              amountProgress={amountProgress} 
              timeProgress={timeProgress}
              size={100}
              strokeWidth={8}
            />
          </div>

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

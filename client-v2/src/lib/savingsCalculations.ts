import { SavingsGoal } from '../types';

export interface PaceIndicator {
  label: string;
  colorClass: string;
  variant: 'success' | 'warning' | 'default';
}

const PACE_TOLERANCE_PERCENT = 5;

/**
 * Calculate pace indicator based on amount progress vs time progress
 * Uses 5% tolerance as defined in SavingsGoalDetailPage
 */
export function calculatePaceIndicator(
  amountProgress: number,
  timeProgress: number,
  tolerance: number = PACE_TOLERANCE_PERCENT
): PaceIndicator {
  // Check for invalid or negligible time progress
  if (timeProgress <= 0.1) {
    return {
      label: 'Not Started',
      colorClass: 'text-muted-foreground',
      variant: 'default'
    };
  }

  if (isNaN(amountProgress) || isNaN(timeProgress)) {
    return {
      label: 'Not Started',
      colorClass: 'text-muted-foreground',
      variant: 'default'
    };
  }

  if (amountProgress >= timeProgress + tolerance) {
    return {
      label: 'Ahead',
      colorClass: 'text-theme-teal',
      variant: 'success'
    };
  }

  if (amountProgress + tolerance <= timeProgress) {
    return {
      label: 'Behind',
      colorClass: 'text-theme-coral',
      variant: 'warning'
    };
  }

  return {
    label: 'On Track',
    colorClass: 'text-foreground',
    variant: 'default'
  };
}

/**
 * Calculate time progress percentage from creation date to target date
 */
export function calculateTimeProgress(
  createdAt: string | undefined,
  targetDate: string | undefined
): number {
  if (!createdAt || !targetDate) return 0;

  const start = new Date(createdAt).getTime();
  const end = new Date(targetDate).getTime();
  const now = new Date().getTime();

  if (end <= start) return 0;

  const totalDuration = end - start;
  const elapsed = now - start;
  const progress = (elapsed / totalDuration) * 100;

  return Math.min(100, Math.max(0, progress));
}

/**
 * Calculate aggregate statistics for savings goals
 */
export function calculateSavingsStats(
  goals: SavingsGoal[]
): {
  activeGoals: number;
  totalSaved: number;
  avgProgress: number;
} {
  if (goals.length === 0) {
    return {
      activeGoals: 0,
      totalSaved: 0,
      avgProgress: 0
    };
  }

  const activeGoals = goals.length;
  const totalSaved = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);

  // Only include goals with valid targets in average calculation
  const validGoals = goals.filter(g => g.target_amount && g.target_amount > 0);

  if (validGoals.length === 0) {
    return {
      activeGoals,
      totalSaved,
      avgProgress: 0
    };
  }

  const totalProgress = validGoals.reduce((sum, goal) => {
    const progress = (goal.current_amount / goal.target_amount) * 100;
    return sum + progress;
  }, 0);

  const avgProgress = totalProgress / validGoals.length;

  return {
    activeGoals,
    totalSaved,
    avgProgress
  };
}

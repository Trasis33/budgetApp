import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/constants';

interface DualProgressRingsProps {
  amountProgress: number; // 0-100
  timeProgress: number;   // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabels?: boolean;
  showLegend?: boolean; // Show legend below rings
}

export function DualProgressRings({
  amountProgress,
  timeProgress,
  size = 120,
  strokeWidth = 8,
  className,
  showLabels = true,
  showLegend = false,
}: DualProgressRingsProps) {
  // Ensure progress is between 0 and 100
  const safeAmountProgress = Math.min(100, Math.max(0, amountProgress));
  const safeTimeProgress = Math.min(100, Math.max(0, timeProgress));

  // Center point
  const center = size / 2;

  // Outer ring (Amount) calculations
  const outerRadius = (size - strokeWidth) / 2;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const outerOffset = outerCircumference - (safeAmountProgress / 100) * outerCircumference;

  // Inner ring (Time) calculations
  // Gap between rings equal to stroke width for visual separation
  const gap = 4;
  const innerRadius = outerRadius - strokeWidth - gap;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerOffset = innerCircumference - (safeTimeProgress / 100) * innerCircumference;

  // Generate unique gradient IDs for this instance
  const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Savings progress: ${Math.round(safeAmountProgress)}% saved, ${Math.round(safeTimeProgress)}% time elapsed`}
    >
      <span className="sr-only">
        Amount progress: {Math.round(safeAmountProgress)}%, Time progress: {Math.round(safeTimeProgress)}%
      </span>

      {/* SVG Gradients Definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id={`${gradientId}-amount`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(var(--theme-teal))" stopOpacity={1} />
            <stop offset="100%" stopColor="oklch(from oklch(var(--theme-teal)) calc(l + 0.05) c h)" stopOpacity={1} />
          </linearGradient>
          <linearGradient id={`${gradientId}-time`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(var(--theme-coral))" stopOpacity={1} />
            <stop offset="100%" stopColor="oklch(from oklch(var(--theme-coral)) calc(l + 0.05) c h)" stopOpacity={1} />
          </linearGradient>
        </defs>
      </svg>

      {/* SVG Container */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(42, 157, 143, 0.15))' }}
      >
        {/* Outer Ring Background (Amount) */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />

        {/* Outer Ring Progress (Amount) */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={outerCircumference}
          strokeDashoffset={outerOffset}
          strokeLinecap="round"
          className="transition-all duration-1200 ease-out"
          style={{ stroke: `url(#${gradientId}-amount)` }}
        />

        {/* Inner Ring Background (Time) */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />

        {/* Inner Ring Progress (Time) */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={innerCircumference}
          strokeDashoffset={innerOffset}
          strokeLinecap="round"
          className="transition-all duration-1200 ease-out delay-200"
          style={{ stroke: `url(#${gradientId}-time)` }}
        />
      </svg>

      {/* Central Labels */}
      {showLabels && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold tabular-nums" style={{ color: 'oklch(var(--primary))' }}>
              {Math.round(safeAmountProgress)}%
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Saved</span>
          </div>
          {/* <div className="h-px w-8 bg-border my-1" />
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold tabular-nums" style={{ color: 'oklch(var(--theme-coral))' }}>
              {Math.round(safeTimeProgress)}%
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Time</span>
          </div> */}
        </div>
      )}

      {/* Ring Legend */}
      {showLegend && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[10px] w-full justify-center">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: `linear-gradient(135deg, oklch(var(--primary)), oklch(from oklch(var(--primary)) calc(l + 0.05) c h))` }}
            />
            <span className="text-muted-foreground font-medium">
              Amount: {Math.round(safeAmountProgress)}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: `linear-gradient(135deg, oklch(var(--primary)), oklch(from oklch(var(--primary)) calc(l + 0.05) c h))` }}
            />
            <span className="text-muted-foreground font-medium">
              Time: {Math.round(safeTimeProgress)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

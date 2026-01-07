import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/constants';

interface DualProgressRingsProps {
  amountProgress: number; // 0-100
  timeProgress: number;   // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabels?: boolean;
}

export function DualProgressRings({
  amountProgress,
  timeProgress,
  size = 120,
  strokeWidth = 8,
  className,
  showLabels = true,
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
      {/* SVG Container */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Outer Ring Background (Amount) */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        
        {/* Outer Ring Progress (Amount) */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke={CHART_COLORS.mint} // Using theme variable directly might require CSS var support in SVGs or specific Tailwind class
          // If CHART_COLORS.mint is 'var(--theme-mint)', using it in style or stroke attribute works if vars are defined in scope
          strokeWidth={strokeWidth}
          strokeDasharray={outerCircumference}
          strokeDashoffset={outerOffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out text-theme-mint" // Fallback class if needed
          style={{ stroke: 'oklch(var(--theme-mint))' }}
        />

        {/* Inner Ring Background (Time) */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />

        {/* Inner Ring Progress (Time) */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke={CHART_COLORS.amber}
          strokeWidth={strokeWidth}
          strokeDasharray={innerCircumference}
          strokeDashoffset={innerOffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out text-theme-amber"
          style={{ stroke: 'oklch(var(--theme-amber))' }}
        />
      </svg>

      {/* Central Labels */}
      {showLabels && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold tabular-nums" style={{ color: 'oklch(var(--theme-mint))' }}>
              {Math.round(safeAmountProgress)}%
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Saved</span>
          </div>
          <div className="h-px w-8 bg-border my-1" />
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold tabular-nums" style={{ color: 'oklch(var(--theme-amber))' }}>
              {Math.round(safeTimeProgress)}%
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Time</span>
          </div>
        </div>
      )}
    </div>
  );
}

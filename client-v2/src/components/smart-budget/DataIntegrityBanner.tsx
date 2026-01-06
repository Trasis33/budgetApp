import { Info } from 'lucide-react';

export function DataIntegrityBanner() {
  return (
    <div className="mb-6 rounded-xl border border-[oklch(var(--theme-indigo)/0.3)] bg-[oklch(var(--theme-indigo)/0.1)] p-4 flex gap-3">
      <Info className="h-5 w-5 text-[oklch(var(--theme-indigo))] flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-foreground mb-1">About these recommendations</h4>
        <p className="text-sm text-muted-foreground">
          These suggestions help you set realistic budget targets based on your spending patterns. 
          Your expense history and transaction records are never modified. Only your budget allocations can be adjusted here.
        </p>
      </div>
    </div>
  );
}

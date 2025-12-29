import { Info } from 'lucide-react';

export function DataIntegrityBanner() {
  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-blue-900 mb-1">About these recommendations</h4>
        <p className="text-sm text-blue-800">
          These suggestions help you set realistic budget targets based on your spending patterns. 
          Your expense history and transaction records are never modified. Only your budget allocations can be adjusted here.
        </p>
      </div>
    </div>
  );
}

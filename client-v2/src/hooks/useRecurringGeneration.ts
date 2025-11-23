import { useState, useCallback } from 'react';
import { recurringExpenseService } from '../api/services/recurringExpenseService';
import { toast } from 'sonner';

/**
 * Hook to generate recurring expenses for a specific month.
 * Manages loading state and error handling for the generation process.
 */
export function useRecurringGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(
    async (year: number, month: number, onSuccess?: () => void) => {
      try {
        setIsGenerating(true);
        const result = await recurringExpenseService.generate({ year, month });
        
        if (result.generatedCount > 0) {
          toast.success(
            `Generated ${result.generatedCount} bill${result.generatedCount === 1 ? '' : 's'} for ${result.generatedAmount.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}`
          );
        } else {
          toast.info('No new bills to generate for this month');
        }

        onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate recurring expenses';
        toast.error(message);
        console.error('useRecurringGeneration error:', err);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return { generate, isGenerating };
}

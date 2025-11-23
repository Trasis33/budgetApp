import { useState, useEffect } from 'react';
import { recurringExpenseService } from '../api/services/recurringExpenseService';
import { RecurringTemplate } from '../types';
import { toast } from 'sonner';

/**
 * Hook to fetch and manage recurring expense templates.
 * Automatically refreshes on mount or when dependencies change.
 */
export function useRecurringTemplates() {
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recurringExpenseService.getTemplates();
      setTemplates(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load recurring templates';
      setError(message);
      console.error('useRecurringTemplates error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { templates, loading, error, refresh };
}

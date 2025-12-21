import { useState, useEffect, useCallback } from 'react';
import { summaryService, SettlementData } from '../api/services/summaryService';

export function useSettlement(month?: number, year?: number) {
  const [data, setData] = useState<SettlementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettlement = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date();
      const targetMonth = month ?? now.getMonth() + 1;
      const targetYear = year ?? now.getFullYear();
      
      const result = await summaryService.getSettlement(targetMonth, targetYear);
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load settlement');
      setError(error);
      console.error('Error loading settlement:', error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadSettlement();
  }, [loadSettlement]);

  const refetch = useCallback(() => {
    loadSettlement();
  }, [loadSettlement]);

  return {
    data,
    loading,
    error,
    refetch
  };
}

import { useState, useEffect, useCallback } from 'react';

interface ExpensePreferences {
  recurringExpanded: boolean;
  rememberRecurringChoice: boolean;
}

const STORAGE_KEY = 'expenseList_preferences';

const defaultPreferences: ExpensePreferences = {
  recurringExpanded: false, // Collapsed by default per PRD
  rememberRecurringChoice: false, // Don't remember by default
};

export function useExpensePreferences() {
  const [preferences, setPreferences] = useState<ExpensePreferences>(() => {
    // Initialize from localStorage if available
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = { ...defaultPreferences, ...JSON.parse(stored) };
        // If not remembering, reset to default collapsed state
        if (!parsed.rememberRecurringChoice) {
          parsed.recurringExpanded = false;
        }
        return parsed;
      }
    } catch {
      // Fallback to defaults if localStorage fails
    }
    return defaultPreferences;
  });

  // Persist to localStorage when preferences change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, [preferences]);

  const setRecurringExpanded = useCallback((expanded: boolean) => {
    setPreferences(prev => ({ ...prev, recurringExpanded: expanded }));
  }, []);

  const toggleRecurringExpanded = useCallback(() => {
    setPreferences(prev => ({ ...prev, recurringExpanded: !prev.recurringExpanded }));
  }, []);

  const setRememberRecurringChoice = useCallback((remember: boolean) => {
    setPreferences(prev => ({ ...prev, rememberRecurringChoice: remember }));
  }, []);

  return {
    recurringExpanded: preferences.recurringExpanded,
    rememberRecurringChoice: preferences.rememberRecurringChoice,
    setRecurringExpanded,
    toggleRecurringExpanded,
    setRememberRecurringChoice,
  };
}

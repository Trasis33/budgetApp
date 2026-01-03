import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import type {
  DateContextValue,
  DateStorageState,
  DateProviderProps
} from '@/types/date';

const DateContext = createContext<DateContextValue | undefined>(undefined);
DateContext.displayName = 'DateContext';

// Storage constants
const STORAGE_VERSION = 1;
const DEFAULT_STORAGE_KEY = 'budget-app-date';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Utility functions
const getCurrentDate = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // 1-indexed
    year: now.getFullYear()
  };
};

const createStorageState = (month: number, year: number): DateStorageState => ({
  version: STORAGE_VERSION,
  month,
  year,
  lastUpdated: new Date().toISOString()
});

const loadDateFromStorage = (storageKey: string): { month: number; year: number } | null => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed: DateStorageState = JSON.parse(stored);
      
      // Validate the stored values
      if (
        parsed.version === STORAGE_VERSION &&
        parsed.month >= 1 && parsed.month <= 12 &&
        parsed.year >= 2000 && parsed.year <= 2100
      ) {
        return { month: parsed.month, year: parsed.year };
      }
    }
  } catch (error) {
    console.warn('Failed to load date from storage:', error);
  }
  return null;
};

const saveDateToStorage = (storageKey: string, month: number, year: number): void => {
  try {
    const state = createStorageState(month, year);
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save date to storage:', error);
  }
};

export const DateProvider: React.FC<DateProviderProps> = ({
  children,
  defaultToCurrentMonth = true,
  storageKey = DEFAULT_STORAGE_KEY,
  persistSelection = true
}) => {
  const [selectedMonth, setSelectedMonthState] = useState<number>(() => {
    if (typeof window === 'undefined') {
      return getCurrentDate().month;
    }
    
    if (persistSelection) {
      const stored = loadDateFromStorage(storageKey);
      if (stored) {
        return stored.month;
      }
    }
    
    return defaultToCurrentMonth ? getCurrentDate().month : 1;
  });

  const [selectedYear, setSelectedYearState] = useState<number>(() => {
    if (typeof window === 'undefined') {
      return getCurrentDate().year;
    }
    
    if (persistSelection) {
      const stored = loadDateFromStorage(storageKey);
      if (stored) {
        return stored.year;
      }
    }
    
    return getCurrentDate().year;
  });

  const setMonth = useCallback((month: number) => {
    const validMonth = Math.max(1, Math.min(12, month));
    setSelectedMonthState(validMonth);
    if (persistSelection && typeof window !== 'undefined') {
      saveDateToStorage(storageKey, validMonth, selectedYear);
    }
  }, [storageKey, persistSelection, selectedYear]);

  const setYear = useCallback((year: number) => {
    const validYear = Math.max(2000, Math.min(2100, year));
    setSelectedYearState(validYear);
    if (persistSelection && typeof window !== 'undefined') {
      saveDateToStorage(storageKey, selectedMonth, validYear);
    }
  }, [storageKey, persistSelection, selectedMonth]);

  const setDate = useCallback((month: number, year: number) => {
    const validMonth = Math.max(1, Math.min(12, month));
    const validYear = Math.max(2000, Math.min(2100, year));
    setSelectedMonthState(validMonth);
    setSelectedYearState(validYear);
    if (persistSelection && typeof window !== 'undefined') {
      saveDateToStorage(storageKey, validMonth, validYear);
    }
  }, [storageKey, persistSelection]);

  const goToPreviousMonth = useCallback(() => {
    setSelectedMonthState(prevMonth => {
      let newMonth = prevMonth - 1;
      let newYear = selectedYear;
      
      if (newMonth < 1) {
        newMonth = 12;
        newYear = selectedYear - 1;
        setSelectedYearState(newYear);
      }
      
      if (persistSelection && typeof window !== 'undefined') {
        saveDateToStorage(storageKey, newMonth, newYear);
      }
      
      return newMonth;
    });
  }, [selectedYear, storageKey, persistSelection]);

  const goToNextMonth = useCallback(() => {
    setSelectedMonthState(prevMonth => {
      let newMonth = prevMonth + 1;
      let newYear = selectedYear;
      
      if (newMonth > 12) {
        newMonth = 1;
        newYear = selectedYear + 1;
        setSelectedYearState(newYear);
      }
      
      if (persistSelection && typeof window !== 'undefined') {
        saveDateToStorage(storageKey, newMonth, newYear);
      }
      
      return newMonth;
    });
  }, [selectedYear, storageKey, persistSelection]);

  const goToCurrentMonth = useCallback(() => {
    const current = getCurrentDate();
    setSelectedMonthState(current.month);
    setSelectedYearState(current.year);
    if (persistSelection && typeof window !== 'undefined') {
      saveDateToStorage(storageKey, current.month, current.year);
    }
  }, [storageKey, persistSelection]);

  const isCurrentMonth = useMemo(() => {
    const current = getCurrentDate();
    return selectedMonth === current.month && selectedYear === current.year;
  }, [selectedMonth, selectedYear]);

  const formattedDate = useMemo(() => {
    return `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;
  }, [selectedMonth, selectedYear]);

  const dateKey = useMemo(() => {
    return `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  }, [selectedMonth, selectedYear]);

  // Filter helpers for components that use 0-indexed months
  const filterMonth = useMemo(() => {
    return (selectedMonth - 1).toString();
  }, [selectedMonth]);

  const filterYear = useMemo(() => {
    return selectedYear.toString();
  }, [selectedYear]);

  const setFilterMonth = useCallback((value: string) => {
    if (value !== 'all') {
      setMonth(parseInt(value) + 1); // Convert 0-indexed to 1-indexed
    }
  }, [setMonth]);

  const setFilterYear = useCallback((value: string) => {
    if (value !== 'all') {
      setYear(parseInt(value));
    }
  }, [setYear]);

  const contextValue = useMemo<DateContextValue>(() => ({
    selectedMonth,
    selectedYear,
    setMonth,
    setYear,
    setDate,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isCurrentMonth,
    formattedDate,
    dateKey,
    filterMonth,
    filterYear,
    setFilterMonth,
    setFilterYear
  }), [
    selectedMonth,
    selectedYear,
    setMonth,
    setYear,
    setDate,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    isCurrentMonth,
    formattedDate,
    dateKey,
    filterMonth,
    filterYear,
    setFilterMonth,
    setFilterYear
  ]);

  return (
    <DateContext.Provider value={contextValue}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = (): DateContextValue => {
  const context = useContext(DateContext);
  
  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }
  
  return context;
};

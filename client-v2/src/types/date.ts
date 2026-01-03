export interface DateSelection {
  month: number; // 1-12 (1-indexed)
  year: number;
}

export interface DateContextValue {
  selectedMonth: number;
  selectedYear: number;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setDate: (month: number, year: number) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  isCurrentMonth: boolean;
  formattedDate: string; // e.g., "January 2024"
  dateKey: string; // e.g., "2024-01" for API calls
  // Filter helpers for components that use 0-indexed months or "all" values
  filterMonth: string; // 0-indexed month as string (for legacy filters)
  filterYear: string; // year as string
  setFilterMonth: (value: string) => void; // accepts "all" or 0-indexed month string
  setFilterYear: (value: string) => void; // accepts "all" or year string
}

export interface DateStorageState {
  version: number;
  month: number;
  year: number;
  lastUpdated: string;
}

export interface DateProviderProps {
  children: React.ReactNode;
  defaultToCurrentMonth?: boolean;
  storageKey?: string;
  persistSelection?: boolean;
}

export interface DateSelectorProps {
  className?: string;
  disabled?: boolean;
  showNavigationArrows?: boolean;
  showCurrentMonthButton?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

export type ScopeType = 'ours' | 'mine' | 'partner';

export interface Scope {
  id: ScopeType;
  label: string;
  description: string;
  icon?: string;
  disabled?: boolean;
  requiresPartner?: boolean;
}

export interface ScopeMetadata {
  currency: string;
  lastUpdated: string | null;
}

export interface ScopeTotals {
  ours: number;
  mine: number;
  partner: number;
}

export interface CoupleInfo {
  connected: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  partner: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface ScopeSummary {
  totals: ScopeTotals;
  couple: CoupleInfo;
  metadata: ScopeMetadata;
}

export interface ScopeContextValue {
  currentScope: ScopeType;
  scopes: Scope[];
  setScope: (scope: ScopeType) => void;
  isLoading: boolean;
  error: string | null;
  summary: ScopeSummary | null;
  refresh: () => Promise<void>;
  isPartnerConnected: boolean;
  canAccessScope: (scope: ScopeType) => boolean;
}

export interface ScopeStorageState {
  version: number;
  currentScope: ScopeType;
  lastUpdated: string;
}

export interface ScopeSelectorProps {
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  showLabels?: boolean;
  showDescriptions?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills' | 'dropdown';
  onScopeChange?: (scope: ScopeType) => void;
  filter?: (scope: Scope) => boolean;
}

export interface ScopeProviderProps {
  children: React.ReactNode;
  defaultScope?: ScopeType;
  autoRefresh?: boolean;
  refreshInterval?: number;
  storageKey?: string;
}

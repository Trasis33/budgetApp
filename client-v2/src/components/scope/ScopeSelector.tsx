import { useScope } from '@/context/ScopeContext';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface ScopeSelectorProps {
  className?: string;
}

const SCOPE_OPTIONS = [
  { value: 'ours', label: 'Ours' },
  { value: 'mine', label: 'Mine' },
  { value: 'partner', label: "Partner's" }
] as const;

export function ScopeSelector({ className = '' }: ScopeSelectorProps) {
  const { currentScope, setScope, isPartnerConnected } = useScope();

  const scopes = useMemo(() =>
    SCOPE_OPTIONS.map(scope => ({
      ...scope,
      disabled: scope.value === 'partner' && !isPartnerConnected
    })),
    [isPartnerConnected]
  );

  return (
    <div className={cn(
      "inline-flex bg-surface border border-border rounded-[20px] p-1 gap-1 shadow-sm",
      className
    )}>
      {scopes.map((scope) => (
        <button
          key={scope.value}
          onClick={() => setScope(scope.value)}
          disabled={scope.disabled || false}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-medium transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            currentScope === scope.value
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-black/3",
            scope.disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          aria-label={`Switch to ${scope.label} scope`}
          aria-pressed={currentScope === scope.value}
        >
          {scope.label}
        </button>
      ))}
    </div>
  );
}

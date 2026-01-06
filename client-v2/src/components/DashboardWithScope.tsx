import React from 'react';
import { useScope } from '@/context/ScopeContext';
import DashboardHeader from './DashboardHeader';
import { Dashboard } from './Dashboard';
import type { DashboardPropsExport } from './Dashboard';

interface DashboardWithScopeProps extends DashboardPropsExport {
  // Props that will be passed to the underlying Dashboard component
}

export const DashboardWithScope: React.FC<DashboardWithScopeProps> = (props) => {
  const { currentScope, isLoading, error, isPartnerConnected } = useScope();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[oklch(var(--theme-teal))] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your budget...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-[oklch(var(--theme-coral)/0.1)] border border-[oklch(var(--theme-coral)/0.3)] rounded-lg p-6">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Unable to load budget data
            </h3>
            <p className="text-[oklch(var(--theme-coral))] mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[oklch(var(--theme-coral))] text-white px-4 py-2 rounded-lg hover:bg-[oklch(var(--theme-coral)/0.9)] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        title={`${currentScope === 'ours' ? 'Our' : currentScope === 'mine' ? 'My' : "Partner's"} Budget`}
        subtitle={
          isPartnerConnected 
            ? `Managing finances together • Current scope: ${currentScope}`
            : `Personal budget mode • Current scope: ${currentScope}`
        }
      />
      
      <main className="mx-auto max-w-7xl p-6">
        <Dashboard {...props} />
      </main>
    </div>
  );
};

export default DashboardWithScope;

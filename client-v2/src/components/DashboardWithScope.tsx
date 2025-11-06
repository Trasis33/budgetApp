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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your budget...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Unable to load budget data
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

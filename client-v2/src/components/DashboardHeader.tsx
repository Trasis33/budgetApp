import React from 'react';
import { Settings, Bell, User } from 'lucide-react';
import ScopeSelector from './ScopeSelector';
import { useScope } from '@/context/ScopeContext';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showScopeSelector?: boolean;
  showUserMenu?: boolean;
  showNotifications?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = 'Dashboard',
  subtitle,
  showScopeSelector = true,
  showUserMenu = true,
  showNotifications = true
}) => {
  const { isPartnerConnected, currentScope } = useScope();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          
          {showScopeSelector && (
            <div className="ml-8">
              <ScopeSelector 
                variant="pills"
                size="sm"
                className="shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showNotifications && (
            <button 
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
          )}
          
          {showUserMenu && (
            <button 
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="User menu"
            >
              <User className="w-5 h-5" />
            </button>
          )}
          
          <button 
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Scope status indicator */}
      {showScopeSelector && (
        <div className="mt-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isPartnerConnected ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <span className="text-xs text-gray-500">
            {isPartnerConnected 
              ? `Partner connected • Viewing ${currentScope} budget` 
              : `Partner not connected • Viewing ${currentScope} budget`
            }
          </span>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;

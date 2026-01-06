import React from 'react';
import { Settings, Bell, User } from 'lucide-react';
import ScopeSelector from './ScopeSelector';
import { useScope } from '@/context/ScopeContext';
import { Button } from './ui/button';

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
    <header className="bg-background border-b border-border/60 px-6 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tight text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          
          {showScopeSelector && (
            <div className="ml-4">
              <ScopeSelector />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
          )}
          
          {showUserMenu && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="User menu"
            >
              <User className="h-5 w-5" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Scope status indicator */}
      {showScopeSelector && (
        <div className="mt-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isPartnerConnected ? 'bg-[oklch(var(--theme-teal))]' : 'bg-muted-foreground/30'
          }`} />
          <span className="text-xs text-muted-foreground">
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
